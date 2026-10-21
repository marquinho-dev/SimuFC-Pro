import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle,
  Zap,
  List,
  Layers,
  Printer,
  Search,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Eye,
  Filter,
  Download,
} from 'lucide-react';
import { generateSchematicDXF } from '../services/schematicEngine';

/**
 * High-fidelity Industrial Electrical Schematic & Wiring Diagram Modal
 * Fully compliant with technical standards:
 *  - IEC 60617 (Standardized Graphical Symbols for Diagrams)
 *  - IEC 81346-2 / NBR 5410 (Letter Codes and Identification for Electrical Equipment)
 *  - DIN / EN / ABNT Standards for Power and Control Circuits
 *
 * Dynamically synthesizes the exact circuit built by the user on the workbench
 * into an organized, standard-compliant technical schematic and wiring diagram.
 */
export default function SchematicModal({
  isOpen,
  onClose,
  components = [],
  wires = [],
  terminalVoltages = new Map(),
}) {
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'wiring' | 'netlist'
  const [diagramMode, setDiagramMode] = useState('BOTH'); // 'BOTH' | 'POWER' | 'CONTROL'
  const [selectedWireId, setSelectedWireId] = useState(null);
  const [hoveredTerminal, setHoveredTerminal] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Filter out mechanical mounting elements like DIN rails
  const electricalComponents = useMemo(() => {
    return components.filter((c) => c.type !== 'din_rail');
  }, [components]);

  // Retrieve components from the user workbench
  const powerSource = electricalComponents.find((c) => c.type === 'power_source');
  const breakers = electricalComponents.filter((c) => c.type === 'circuit_breaker');
  const contactors = electricalComponents.filter((c) => c.type === 'contactor');
  const thermalRelays = electricalComponents.filter((c) => c.type === 'thermal_relay');
  const timerRelays = electricalComponents.filter((c) => c.type === 'timer_relay');
  const motors = electricalComponents.filter((c) => c.type === 'motor_6p');
  const startButtons = electricalComponents.filter((c) => c.type === 'button_start');
  const stopButtons = electricalComponents.filter((c) => c.type === 'button_stop');
  const emergencyButtons = electricalComponents.filter((c) => c.type === 'button_emergency');

  // Standardized letter code tags according to IEC 81346-2
  // -Q: Switching devices for power circuits (Disjuntores)
  // -K: Relays and Contactors (Contatores)
  // -F: Protective devices (Relés Térmicos / Fusíveis)
  // -KT: Time relays (Temporizadores)
  // -S: Switches / Pushbuttons (Botoeiras)
  // -M: Motors (Motores)
  // -X: Terminals and Source Busbars (Régua de bornes / Alimentação)
  const standardTagMap = useMemo(() => {
    const map = new Map();
    const assignCategory = (list, prefix) => {
      list.forEach((comp, idx) => {
        const raw = (comp.tag || '').trim().replace(/^-/, '');
        if (raw.toUpperCase().startsWith(prefix.toUpperCase()) && /\d+$/.test(raw)) {
          map.set(comp.id, `-${raw.toUpperCase()}`);
        } else {
          map.set(comp.id, `-${prefix}${idx + 1}`);
        }
      });
    };

    assignCategory(breakers, 'Q');
    assignCategory(contactors, 'K');
    assignCategory(thermalRelays, 'F');
    assignCategory(timerRelays, 'KT');
    
    if (emergencyButtons.length > 0) {
      emergencyButtons.forEach((b, idx) => {
        map.set(b.id, idx === 0 ? '-S0' : `-S0${idx}`);
      });
    }

    if (stopButtons.length > 0) {
      stopButtons.forEach((b, idx) => {
        const tag = emergencyButtons.length === 0 && idx === 0 ? '-S0' : `-S1${idx > 0 ? idx : ''}`;
        map.set(b.id, tag);
      });
    }

    if (startButtons.length > 0) {
      startButtons.forEach((b, idx) => {
        const offset = (emergencyButtons.length > 0 ? 1 : 0) + (stopButtons.length > 0 ? stopButtons.length : 0);
        map.set(b.id, `-S${offset + 1 + idx}`);
      });
    }

    assignCategory(motors, 'M');
    if (powerSource) map.set(powerSource.id, '-X1');

    return map;
  }, [breakers, contactors, thermalRelays, timerRelays, emergencyButtons, stopButtons, startButtons, motors, powerSource]);

  const getStandardTag = (comp) => {
    if (!comp) return '';
    return standardTagMap.get(comp.id) || (comp.tag ? `-${comp.tag.replace(/^-/, '')}` : '');
  };

  // Primary devices with normalized tags
  const q1 = breakers[0];
  const k1 = contactors[0];
  const k2 = contactors[1];
  const k3 = contactors[2];
  const ft1 = thermalRelays[0];
  const kt1 = timerRelays[0];
  const m1 = motors[0];
  const s00 = emergencyButtons[0];
  const s0 = stopButtons[0];
  const s1 = startButtons[0];
  const s2 = startButtons[1];

  // Helper to trace equipotential networks (Union-Find)
  const netMap = useMemo(() => {
    const parent = new Map();
    const find = (i) => {
      if (!parent.has(i)) parent.set(i, i);
      if (parent.get(i) !== i) {
        parent.set(i, find(parent.get(i)));
      }
      return parent.get(i);
    };
    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) parent.set(rootI, rootJ);
    };

    // Internal terminal links (top and bottom terminal screws of physical pushbuttons)
    electricalComponents.forEach((c) => {
      if (c.type === 'button_stop' || c.type === 'button_emergency') {
        union(`${c.id}:11`, `${c.id}:11_bot`);
        union(`${c.id}:12`, `${c.id}:12_bot`);
      }
      if (c.type === 'button_start') {
        union(`${c.id}:13`, `${c.id}:13_bot`);
        union(`${c.id}:14`, `${c.id}:14_bot`);
      }
    });

    wires.forEach((w) => {
      union(`${w.fromComponent}:${w.fromTerminal}`, `${w.toComponent}:${w.toTerminal}`);
    });

    return { find };
  }, [wires, electricalComponents]);

  const areNetsEqual = (c1Id, t1, c2Id, t2) => {
    if (!c1Id || !c2Id) return false;
    return netMap.find(`${c1Id}:${t1}`) === netMap.find(`${c2Id}:${t2}`);
  };

  const isTerminalOnNet = (cId, tId, sourceTermId) => {
    if (!powerSource || !cId) return false;
    return areNetsEqual(cId, tId, powerSource.id, sourceTermId);
  };

  // Helper to test if two component terminals are wired directly
  const isWired = (c1Id, t1Id, c2Id, t2Id) => {
    if (!c1Id || !c2Id) return false;
    return wires.some(
      (w) =>
        (w.fromComponent === c1Id &&
          w.fromTerminal === t1Id &&
          w.toComponent === c2Id &&
          w.toTerminal === t2Id) ||
        (w.fromComponent === c2Id &&
          w.fromTerminal === t2Id &&
          w.toComponent === c1Id &&
          w.toTerminal === t1Id)
    );
  };

  // Helper to check if a terminal has any wire connected
  const hasWire = (compId, termId) => {
    if (!compId) return false;
    return wires.some(
      (w) =>
        (w.fromComponent === compId && w.fromTerminal === termId) ||
        (w.toComponent === compId && w.toTerminal === termId)
    );
  };

  // Helper to get voltage on a terminal
  const getVolt = (compId, termId) => {
    if (!compId) return 0;
    const key = `${compId}:${termId}`;
    return terminalVoltages?.get ? terminalVoltages.get(key) : 0;
  };

  // Helper to format friendly component names
  const getComponentName = (compId) => {
    const comp = electricalComponents.find((c) => c.id === compId);
    if (!comp) return compId;
    return `${getStandardTag(comp)}`;
  };

  const getComponentFullName = (compId) => {
    const comp = electricalComponents.find((c) => c.id === compId);
    if (!comp) return compId;
    return `${getStandardTag(comp)} • ${comp.name}`;
  };

  // Categorize wire function technically according to technical standards
  const getWireDetails = (wire) => {
    const { fromComponent, fromTerminal, toComponent, toTerminal } = wire;
    const cFrom = electricalComponents.find((c) => c.id === fromComponent);
    const cTo = electricalComponents.find((c) => c.id === toComponent);

    const cFromType = cFrom?.type;
    const cToType = cTo?.type;
    const terms = [fromTerminal, toTerminal];

    // Star / Delta jumper on motor
    if (fromComponent === toComponent && cFromType === 'motor_6p') {
      return {
        category: 'JUMPER',
        categoryLabel: 'Ponte de Fechamento',
        functionName: 'Ponte de Fechamento do Estator (Y / Δ)',
        badgeColor: '#f59e0b',
        standardCode: 'JMP',
      };
    }

    // Ground PE
    if (terms.includes('PE')) {
      return {
        category: 'PE',
        categoryLabel: 'Condutor PE',
        functionName: 'Condutor de Proteção e Aterramento (PE)',
        badgeColor: '#16a34a',
        standardCode: 'PE',
      };
    }

    // Neutral
    if (terms.includes('N') || (terms.includes('A2') && (terms.includes('N') || terms.includes('X0')))) {
      return {
        category: 'NEUTRAL',
        categoryLabel: 'Neutro (N)',
        functionName: `Retorno de Neutro (${getStandardTag(cTo || cFrom)}:A2 ➔ N)`,
        badgeColor: '#0ea5e9',
        standardCode: 'N',
      };
    }

    // Power main circuit (3-Phase)
    const powerTerms = ['L1', 'L2', 'L3', '1', '2', '3', '4', '5', '6', 'U1', 'V1', 'W1', 'W2', 'U2', 'V2'];
    const isPowerLine =
      (cFromType === 'power_source' ||
        cFromType === 'circuit_breaker' ||
        cFromType === 'contactor' ||
        cFromType === 'thermal_relay' ||
        cFromType === 'motor_6p') &&
      (cToType === 'circuit_breaker' ||
        cToType === 'contactor' ||
        cToType === 'thermal_relay' ||
        cToType === 'motor_6p') &&
      powerTerms.includes(fromTerminal) &&
      powerTerms.includes(toTerminal) &&
      !['13', '14', '21', '22', 'A1', 'A2', '95', '96', '97', '98'].includes(fromTerminal) &&
      !['13', '14', '21', '22', 'A1', 'A2', '95', '96', '97', '98'].includes(toTerminal);

    if (isPowerLine) {
      if (terms.includes('U1') || terms.includes('V1') || terms.includes('W1')) {
        return {
          category: 'POWER',
          categoryLabel: 'Força / Carga',
          functionName: `Condutor de Força: Estator (${fromTerminal} ➔ ${toTerminal})`,
          badgeColor: '#3b82f6',
          standardCode: 'PWR-M',
        };
      }
      return {
        category: 'POWER',
        categoryLabel: 'Força Trifásica',
        functionName: `Condutor Principal de Potência (${getStandardTag(cFrom)}:${fromTerminal} ➔ ${getStandardTag(cTo)}:${toTerminal})`,
        badgeColor: '#ef4444',
        standardCode: 'PWR',
      };
    }

    // Seal contact (13-14)
    if (terms.includes('13') || terms.includes('14')) {
      return {
        category: 'CONTROL',
        categoryLabel: 'Comando / Selo',
        functionName: `Contato Auxiliar NA de Auto-Retenção / Selo (${getStandardTag(cFrom || cTo)}:13-14)`,
        badgeColor: '#10b981',
        standardCode: 'SEAL',
      };
    }

    // Interlock (21-22)
    if (terms.includes('21') || terms.includes('22')) {
      return {
        category: 'CONTROL',
        categoryLabel: 'Intertravamento',
        functionName: `Contato Auxiliar NF de Intertravamento Elétrico (${getStandardTag(cFrom || cTo)}:21-22)`,
        badgeColor: '#f97316',
        standardCode: 'ILCK',
      };
    }

    // Coil activation A1
    if (terms.includes('A1')) {
      return {
        category: 'CONTROL',
        categoryLabel: 'Alimentação Bobina',
        functionName: `Circuito de Disparo da Bobina (${getStandardTag(cTo || cFrom)}:A1)`,
        badgeColor: '#8b5cf6',
        standardCode: 'COIL',
      };
    }

    // Overload relay auxiliary 95-96
    if (terms.includes('95') || terms.includes('96')) {
      return {
        category: 'CONTROL',
        categoryLabel: 'Proteção Térmica',
        functionName: `Contato Auxiliar NF de Desarme por Sobrecarga (${getStandardTag(cFrom || cTo)}:95-96)`,
        badgeColor: '#ef4444',
        standardCode: 'PROT',
      };
    }

    // Timer auxiliary 15, 18, 16, 25, 28, 26
    if (['15', '18', '16', '25', '28', '26'].some((t) => terms.includes(t))) {
      return {
        category: 'CONTROL',
        categoryLabel: 'Temporizador',
        functionName: `Contato Auxiliar Temporizado (${getStandardTag(cFrom || cTo)}:${fromTerminal}-${toTerminal})`,
        badgeColor: '#f59e0b',
        standardCode: 'TIMER',
      };
    }

    return {
      category: 'CONTROL',
      categoryLabel: 'Comando',
      functionName: `Condutor de Comando (${getStandardTag(cFrom)}:${fromTerminal} ➔ ${getStandardTag(cTo)}:${toTerminal})`,
      badgeColor: '#64748b',
      standardCode: 'CTRL',
    };
  };

  // Motor state
  const isMotorRunning = Boolean(m1?.state?.running);
  const motorRpm = m1?.state?.rpm || (isMotorRunning ? 1750 : 0);
  const motorFechamento = m1?.state?.connectionType || m1?.state?.detectedConnection || 'NONE';

  // Dynamic analysis of the Power Circuit (Força)
  const powerCircuitAnalysis = useMemo(() => {
    if (!powerSource) return null;

    // Check breaker
    const breakerPolesConnected = q1
      ? [
          isTerminalOnNet(q1.id, '1', 'L1'),
          isTerminalOnNet(q1.id, '3', 'L2'),
          isTerminalOnNet(q1.id, '5', 'L3'),
        ]
      : [false, false, false];
    const isBreakerInPower = breakerPolesConnected.some(Boolean) || (q1 && (hasWire(q1.id, '1') || hasWire(q1.id, '2')));

    // Classify contactors in power:
    let mainK = null;
    let deltaK = null;
    let starK = null;

    contactors.forEach((k) => {
      // Check if 1-3-5 are shorted together (Star point!)
      const isStarShorted =
        (areNetsEqual(k.id, '1', k.id, '3') && areNetsEqual(k.id, '3', k.id, '5')) ||
        (hasWire(k.id, '1') && hasWire(k.id, '3') && areNetsEqual(k.id, '1', k.id, '3'));

      if (isStarShorted) {
        starK = k;
        return;
      }

      // Check outputs towards motor
      const outToMotorU1V1W1 =
        m1 &&
        (areNetsEqual(k.id, '2', m1.id, 'U1') ||
          (ft1 && areNetsEqual(k.id, '2', ft1.id, '1') && areNetsEqual(ft1.id, '2', m1.id, 'U1')) ||
          hasWire(k.id, '2'));

      const outToMotorW2U2V2 =
        m1 &&
        (areNetsEqual(k.id, '2', m1.id, 'W2') ||
          areNetsEqual(k.id, '4', m1.id, 'U2') ||
          areNetsEqual(k.id, '6', m1.id, 'V2'));

      if (outToMotorW2U2V2 && !outToMotorU1V1W1) {
        deltaK = k;
      } else if (!mainK) {
        mainK = k;
      } else if (!deltaK && contactors.length > 1) {
        deltaK = k;
      }
    });

    // Check thermal relay in power
    const isThermalInPower =
      ft1 &&
      (hasWire(ft1.id, '1') ||
        hasWire(ft1.id, '2') ||
        (m1 && areNetsEqual(ft1.id, '2', m1.id, 'U1')));

    // Motor connection
    const isMotorConnected =
      m1 &&
      (hasWire(m1.id, 'U1') || hasWire(m1.id, 'V1') || hasWire(m1.id, 'W1'));

    // Check star / delta jumpers directly on motor:
    const hasMotorStarJumper =
      m1 && areNetsEqual(m1.id, 'W2', m1.id, 'U2') && areNetsEqual(m1.id, 'U2', m1.id, 'V2');
    const hasMotorDeltaJumpers =
      m1 &&
      areNetsEqual(m1.id, 'U1', m1.id, 'W2') &&
      areNetsEqual(m1.id, 'V1', m1.id, 'U2') &&
      areNetsEqual(m1.id, 'W1', m1.id, 'V2');

    return {
      q1: isBreakerInPower ? q1 : null,
      mainK: mainK || contactors[0] || null,
      deltaK,
      starK,
      ft1: isThermalInPower ? ft1 : null,
      m1: isMotorConnected ? m1 : null,
      hasMotorStarJumper,
      hasMotorDeltaJumpers,
      isGroundConnected: m1 ? isTerminalOnNet(m1.id, 'PE', 'PE') : false,
    };
  }, [powerSource, q1, contactors, ft1, m1, netMap]);

  // Dynamic analysis of the Control Circuit (Comando)
  const controlCircuitAnalysis = useMemo(() => {
    if (!powerSource) return null;

    const l1Net = netMap.find(`${powerSource.id}:L1`);
    const nNet = netMap.find(`${powerSource.id}:N`);

    // Series safety elements:
    const hasEmergency =
      s00 &&
      (netMap.find(`${s00.id}:11`) === l1Net ||
        netMap.find(`${s00.id}:12`) === l1Net ||
        hasWire(s00.id, '11') ||
        hasWire(s00.id, '12'));

    const hasThermalControl =
      ft1 &&
      ((hasWire(ft1.id, '95') && hasWire(ft1.id, '96')) ||
        netMap.find(`${ft1.id}:95`) === l1Net ||
        (s00 && areNetsEqual(s00.id, '12', ft1.id, '95')));

    const hasStop =
      s0 &&
      (hasWire(s0.id, '11') || hasWire(s0.id, '12'));

    const hasStart =
      s1 &&
      (hasWire(s1.id, '13') || hasWire(s1.id, '14'));

    const mainK = contactors[0];
    const hasSeal =
      mainK &&
      s1 &&
      ((areNetsEqual(mainK.id, '13', s1.id, '13') && areNetsEqual(mainK.id, '14', s1.id, '14')) ||
        (areNetsEqual(mainK.id, '13', s1.id, '14') && areNetsEqual(mainK.id, '14', s1.id, '13')) ||
        (hasWire(mainK.id, '13') && hasWire(mainK.id, '14')));

    // Build list of active rungs:
    const activeRungs = [];

    // Rung 1: Main Contactor K1
    if (mainK) {
      let interlockComp = null;
      contactors.forEach((otherK) => {
        if (otherK.id !== mainK.id) {
          if (
            areNetsEqual(otherK.id, '22', mainK.id, 'A1') ||
            areNetsEqual(otherK.id, '21', mainK.id, 'A1')
          ) {
            interlockComp = otherK;
          }
        }
      });

      activeRungs.push({
        id: `rung-${mainK.id}`,
        type: 'CONTACTOR_MAIN',
        title: 'Ramo de Retenção (Principal)',
        comp: mainK,
        tag: getStandardTag(mainK),
        hasSafetyTrunk: true,
        hasStartAndSeal: Boolean(hasStart),
        hasSeal: Boolean(hasSeal),
        startBtn: s1,
        interlock: interlockComp
          ? { comp: interlockComp, tag: getStandardTag(interlockComp), terms: '21-22' }
          : null,
        coilComp: mainK,
        coilTag: getStandardTag(mainK),
        isEnergized: Boolean(mainK.state?.energized),
      });
    }

    // Rung 2: Timer KT1 (if KT1 has wires on coil A1 or A2)
    if (kt1 && (hasWire(kt1.id, 'A1') || hasWire(kt1.id, 'A2') || isTerminalOnNet(kt1.id, 'A2', 'N'))) {
      activeRungs.push({
        id: `rung-${kt1.id}`,
        type: 'TIMER',
        title: 'Temporizador de Transição',
        comp: kt1,
        tag: getStandardTag(kt1),
        coilComp: kt1,
        coilTag: getStandardTag(kt1),
        isEnergized: Boolean(kt1.state?.energized),
      });
    }

    // Rungs for secondary contactors (e.g. K3 Star, K2 Delta)
    const otherContactors = contactors.filter((k) => k.id !== mainK?.id);
    otherContactors.forEach((secK, sIdx) => {
      // Check if secK is wired
      const isSecWired = hasWire(secK.id, 'A1') || hasWire(secK.id, 'A2') || isTerminalOnNet(secK.id, 'A2', 'N');
      if (isSecWired || otherContactors.length <= 2) {
        let timedContact = null;
        let interlockComp = null;

        if (kt1) {
          if (areNetsEqual(kt1.id, '16', secK.id, 'A1')) {
            timedContact = { comp: kt1, tag: getStandardTag(kt1), terms: '15-16', type: 'NC', label: 'NF' };
          } else if (areNetsEqual(kt1.id, '18', secK.id, 'A1')) {
            timedContact = { comp: kt1, tag: getStandardTag(kt1), terms: '15-18', type: 'NO', label: 'NA' };
          }
        }

        contactors.forEach((otherK) => {
          if (otherK.id !== secK.id) {
            if (areNetsEqual(otherK.id, '22', secK.id, 'A1') || areNetsEqual(otherK.id, '21', secK.id, 'A1')) {
              interlockComp = otherK;
              if (kt1) {
                if (areNetsEqual(kt1.id, '16', otherK.id, '21') || areNetsEqual(kt1.id, '16', otherK.id, '22')) {
                  timedContact = { comp: kt1, tag: getStandardTag(kt1), terms: '15-16', type: 'NC', label: 'NF' };
                } else if (areNetsEqual(kt1.id, '18', otherK.id, '21') || areNetsEqual(kt1.id, '18', otherK.id, '22')) {
                  timedContact = { comp: kt1, tag: getStandardTag(kt1), terms: '15-18', type: 'NO', label: 'NA' };
                }
              }
            }
          }
        });

        // If timed contact was not explicitly matched by net but timer exists in circuit
        if (!timedContact && kt1) {
          if (sIdx === 0 && otherContactors.length >= 2) {
            // First secondary contactor in Star-Delta is Delta or Star
            timedContact = { comp: kt1, tag: getStandardTag(kt1), terms: '15-18', type: 'NO', label: 'NA' };
          } else if (sIdx === 1) {
            timedContact = { comp: kt1, tag: getStandardTag(kt1), terms: '15-16', type: 'NC', label: 'NF' };
          }
        }

        const isStar = timedContact?.terms === '15-16' || secK.tag === 'K3' || sIdx === 1;
        const isDelta = timedContact?.terms === '15-18' || secK.tag === 'K2' || sIdx === 0;

        activeRungs.push({
          id: `rung-${secK.id}`,
          type: isStar ? 'STAR' : isDelta ? 'DELTA' : 'SECONDARY',
          title: isStar ? 'Comando Estrela (Y)' : isDelta ? 'Comando Triângulo (Δ)' : `Comando ${getStandardTag(secK)}`,
          comp: secK,
          tag: getStandardTag(secK),
          timedContact,
          interlock: interlockComp
            ? { comp: interlockComp, tag: getStandardTag(interlockComp), terms: '21-22' }
            : null,
          coilComp: secK,
          coilTag: getStandardTag(secK),
          isEnergized: Boolean(secK.state?.energized),
        });
      }
    });

    return {
      hasEmergency: Boolean(hasEmergency),
      hasThermalControl: Boolean(hasThermalControl),
      hasStop: Boolean(hasStop),
      hasStart: Boolean(hasStart),
      hasSeal: Boolean(hasSeal),
      rungs: activeRungs,
    };
  }, [powerSource, s00, s0, s1, ft1, kt1, contactors, netMap]);

  // Detected circuit topology name
  const detectedCircuitTopology = useMemo(() => {
    if (contactors.length >= 3 && timerRelays.length >= 1) {
      return 'Partida Estrela-Triângulo Automática (-K1, -K2, -K3, -KT1)';
    }
    if (contactors.length >= 2 && startButtons.length >= 2) {
      return 'Partida Direta com Reversão de Giro (-K1 Horário, -K2 Anti-Horário)';
    }
    if (contactors.length >= 1 && startButtons.length >= 1) {
      return 'Partida Direta de Motor com Auto-Retenção / Selo (-K1, -S1, -S2)';
    }
    if (contactors.length >= 1) {
      return 'Circuito de Manobra por Contator de Potência (-K1)';
    }
    if (breakers.length >= 1) {
      return 'Circuito de Proteção por Disjuntor Termomagnético (-Q1)';
    }
    return 'Circuito Elétrico Industrial';
  }, [contactors.length, timerRelays.length, startButtons.length, breakers.length]);

  // =========================================================================
  // VIEW 1: ORGANIZED WIRING DIAGRAM (MAPA DE LIGAÇÃO DA BANCADA)
  // Computes modular coordinates for each component placed on the board,
  // showing its real labeled terminals and routing every wire with its color!
  // =========================================================================
  const wiringLayout = useMemo(() => {
    const layout = {
      width: 1040,
      height: 740,
      nodes: {}, // compId -> { x, y, width, height, comp, terminals: { termId: { x, y, label, type } } }
    };

    let r1X = 40;
    if (powerSource) {
      layout.nodes[powerSource.id] = {
        x: r1X,
        y: 30,
        width: 220,
        height: 140,
        comp: powerSource,
        title: 'BARRAMENTO DE ALIMENTAÇÃO',
        tag: '-X1 (REDE)',
        badge: '3Ø+N+PE',
        terminals: {
          L1: { x: r1X + 40, y: 56, label: 'L1', color: '#8B5A2B' },
          L2: { x: r1X + 80, y: 56, label: 'L2', color: '#18181b' },
          L3: { x: r1X + 120, y: 56, label: 'L3', color: '#dc2626' },
          N:  { x: r1X + 160, y: 56, label: 'N',  color: '#0ea5e9' },
          PE: { x: r1X + 200, y: 56, label: 'PE', color: '#16a34a' },
        },
      };
      r1X += 250;
    }

    breakers.forEach((brk) => {
      const poles = brk.state?.poles || 3;
      const w = poles === 1 ? 90 : poles === 2 ? 140 : 180;
      const terms = {};
      for (let p = 0; p < poles; p++) {
        const topId = String(1 + p * 2);
        const botId = String(2 + p * 2);
        const pinX = r1X + 30 + p * 45;
        terms[topId] = { x: pinX, y: 38, label: `${topId}/L${p + 1}`, type: 'in' };
        terms[botId] = { x: pinX, y: 162, label: `${botId}/T${p + 1}`, type: 'out' };
      }

      layout.nodes[brk.id] = {
        x: r1X,
        y: 30,
        width: w,
        height: 140,
        comp: brk,
        title: 'DISJUNTOR TERMOMAGNÉTICO',
        tag: getStandardTag(brk),
        badge: `${brk.state?.curve || 'C'}${brk.state?.current || 25}A`,
        terminals: terms,
      };
      r1X += w + 30;
    });

    // Row 2: Contactors, Timer, Thermal
    let r2X = 40;
    contactors.forEach((k) => {
      const w = 210;
      layout.nodes[k.id] = {
        x: r2X,
        y: 200,
        width: w,
        height: 175,
        comp: k,
        title: 'CONTATOR DE POTÊNCIA',
        tag: getStandardTag(k),
        badge: 'Bobina 220V',
        terminals: {
          1:  { x: r2X + 25, y: 208, label: '1/L1' },
          3:  { x: r2X + 58, y: 208, label: '3/L2' },
          5:  { x: r2X + 91, y: 208, label: '5/L3' },
          13: { x: r2X + 124, y: 208, label: '13 NO', badge: 'NO' },
          21: { x: r2X + 157, y: 208, label: '21 NC', badge: 'NC' },
          A1: { x: r2X + 190, y: 208, label: 'A1', type: 'coil' },
          2:  { x: r2X + 25, y: 367, label: '2/T1' },
          4:  { x: r2X + 58, y: 367, label: '4/T2' },
          6:  { x: r2X + 91, y: 367, label: '6/T3' },
          14: { x: r2X + 124, y: 367, label: '14 NO', badge: 'NO' },
          22: { x: r2X + 157, y: 367, label: '22 NC', badge: 'NC' },
          A2: { x: r2X + 190, y: 367, label: 'A2', type: 'coil' },
        },
      };
      r2X += w + 25;
    });

    thermalRelays.forEach((rt) => {
      const w = 180;
      layout.nodes[rt.id] = {
        x: r2X,
        y: 200,
        width: w,
        height: 175,
        comp: rt,
        title: 'RELÉ TÉRMICO SOBRECARGA',
        tag: getStandardTag(rt),
        badge: '4-6.3A',
        terminals: {
          1: { x: r2X + 30, y: 208, label: '1/L1' },
          3: { x: r2X + 65, y: 208, label: '3/L2' },
          5: { x: r2X + 100, y: 208, label: '5/L3' },
          95: { x: r2X + 135, y: 208, label: '95 NC' },
          96: { x: r2X + 160, y: 208, label: '96 NC' },
          2: { x: r2X + 30, y: 367, label: '2/T1' },
          4: { x: r2X + 65, y: 367, label: '4/T2' },
          6: { x: r2X + 100, y: 367, label: '6/T3' },
          97: { x: r2X + 135, y: 367, label: '97 NO' },
          98: { x: r2X + 160, y: 367, label: '98 NO' },
        },
      };
      r2X += w + 25;
    });

    timerRelays.forEach((kt) => {
      const w = 150;
      layout.nodes[kt.id] = {
        x: r2X,
        y: 200,
        width: w,
        height: 175,
        comp: kt,
        title: 'RELÉ TEMPORIZADOR',
        tag: getStandardTag(kt),
        badge: 'Eletrônico',
        terminals: {
          A1: { x: r2X + 28, y: 208, label: 'A1' },
          15: { x: r2X + 75, y: 208, label: '15 COM' },
          25: { x: r2X + 122, y: 208, label: '25 COM' },
          18: { x: r2X + 28, y: 367, label: '18 NO' },
          16: { x: r2X + 60, y: 367, label: '16 NC' },
          28: { x: r2X + 90, y: 367, label: '28 NO' },
          26: { x: r2X + 122, y: 367, label: '26 NC' },
          A2: { x: r2X + 138, y: 367, label: 'A2' },
        },
      };
      r2X += w + 25;
    });

    // Row 3: Pushbuttons (Emergency, Stop, Start)
    let r3X = 40;
    emergencyButtons.forEach((btn) => {
      const w = 130;
      layout.nodes[btn.id] = {
        x: r3X,
        y: 410,
        width: w,
        height: 120,
        comp: btn,
        title: 'BOTOEIRA EMERGÊNCIA',
        tag: getStandardTag(btn),
        badge: 'Cogumelo NF',
        color: '#dc2626',
        terminals: {
          11: { x: r3X + 40, y: 418, label: '11 NF' },
          12: { x: r3X + 90, y: 522, label: '12 NF' },
        },
      };
      r3X += w + 25;
    });

    stopButtons.forEach((btn) => {
      const w = 130;
      layout.nodes[btn.id] = {
        x: r3X,
        y: 410,
        width: w,
        height: 120,
        comp: btn,
        title: 'BOTOEIRA DESLIGA',
        tag: getStandardTag(btn),
        badge: 'Contato NF',
        color: '#ef4444',
        terminals: {
          11: { x: r3X + 35, y: 418, label: '11 NF' },
          12: { x: r3X + 95, y: 418, label: '12 NF' },
          '11_bot': { x: r3X + 35, y: 522, label: '11 NF' },
          '12_bot': { x: r3X + 95, y: 522, label: '12 NF' },
        },
      };
      r3X += w + 25;
    });

    startButtons.forEach((btn) => {
      const w = 130;
      layout.nodes[btn.id] = {
        x: r3X,
        y: 410,
        width: w,
        height: 120,
        comp: btn,
        title: 'BOTOEIRA LIGA',
        tag: getStandardTag(btn),
        badge: 'Contato NA',
        color: '#22c55e',
        terminals: {
          13: { x: r3X + 35, y: 418, label: '13 NA' },
          14: { x: r3X + 95, y: 418, label: '14 NA' },
          '13_bot': { x: r3X + 35, y: 522, label: '13 NA' },
          '14_bot': { x: r3X + 95, y: 522, label: '14 NA' },
        },
      };
      r3X += w + 25;
    });

    // Row 4: Motors
    let r4X = 40;
    motors.forEach((m) => {
      const w = 240;
      layout.nodes[m.id] = {
        x: r4X,
        y: 565,
        width: w,
        height: 145,
        comp: m,
        title: 'MOTOR DE INDUÇÃO TRIFÁSICO',
        tag: getStandardTag(m),
        badge: motorFechamento === 'Y' ? 'Estrela (Y)' : motorFechamento === 'DELTA' ? 'Triângulo (Δ)' : '6 Pontas',
        terminals: {
          PE: { x: r4X + 25, y: 580, label: 'PE', color: '#16a34a' },
          U1: { x: r4X + 70, y: 580, label: 'U1' },
          V1: { x: r4X + 120, y: 580, label: 'V1' },
          W1: { x: r4X + 170, y: 580, label: 'W1' },
          W2: { x: r4X + 70, y: 695, label: 'W2' },
          U2: { x: r4X + 120, y: 695, label: 'U2' },
          V2: { x: r4X + 170, y: 695, label: 'V2' },
        },
      };
      r4X += w + 30;
    });

    layout.width = Math.max(980, Math.max(r1X, r2X, r3X, r4X) + 50);
    return layout;
  }, [electricalComponents, powerSource, breakers, contactors, thermalRelays, timerRelays, emergencyButtons, stopButtons, startButtons, motors, motorFechamento]);

  // Filtered netlist for Tab 3
  const filteredWires = useMemo(() => {
    return wires.filter((w) => {
      const details = getWireDetails(w);
      if (categoryFilter !== 'ALL' && details.category !== categoryFilter) {
        return false;
      }
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const fromTag = getComponentName(w.fromComponent).toLowerCase();
        const toTag = getComponentName(w.toComponent).toLowerCase();
        const fn = details.functionName.toLowerCase();
        const tFrom = w.fromTerminal.toLowerCase();
        const tTo = w.toTerminal.toLowerCase();
        return (
          fromTag.includes(query) ||
          toTag.includes(query) ||
          fn.includes(query) ||
          tFrom.includes(query) ||
          tTo.includes(query)
        );
      }
      return true;
    });
  }, [wires, categoryFilter, searchFilter, electricalComponents]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportDXF = () => {
    try {
      const dxfContent = generateSchematicDXF(
        powerCircuitAnalysis,
        controlCircuitAnalysis,
        standardTagMap
      );
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `esquema_eletrico_${new Date().toISOString().slice(0, 10)}.dxf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar arquivo DXF:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog schematic-modal dynamic-schematic-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '1160px', maxWidth: '98vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Top Header with Technical Standard Badges */}
        <div className="modal-header">
          <div className="modal-title-group">
            <FileText className="header-icon" />
            <div>
              <h2>DIAGRAMA ESQUEMÁTICO NORMALIZADO (IEC 60617 / NBR 5410)</h2>
              <span className="badge-standard">SÍMBOLOS DA NORMA TÉCNICA • NOMENCLATURAS IEC 81346</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-toolbar"
              onClick={handleExportDXF}
              title="Baixar Arquivo CAD (.DXF) para AutoCAD, LibreCAD ou SolidWorks Electrical"
              style={{ fontSize: '0.75rem', padding: '5px 12px', background: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', color: '#93c5fd' }}
            >
              <Download size={15} />
              <span>Baixar DXF (CAD)</span>
            </button>
            <button
              type="button"
              className="btn-toolbar"
              onClick={handlePrint}
              title="Imprimir ou Exportar Diagrama Técnico em PDF"
              style={{ fontSize: '0.75rem', padding: '5px 12px' }}
            >
              <Printer size={15} />
              <span>Imprimir / PDF</span>
            </button>
            <button type="button" className="btn-close-modal" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Diagnostic Bar: Real-time Analysis of the User's Connected Circuit */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#0d131f',
            borderBottom: '1px solid #1f293d',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {/* Navigation View Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`btn-toolbar ${activeTab === 'diagram' ? 'btn-primary-preset' : ''}`}
              onClick={() => setActiveTab('diagram')}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              title="Exibir Diagrama Esquemático com símbolos técnicos da norma IEC 60617"
            >
              <Layers size={15} />
              <span>Esquema Técnico IEC 60617 (Força & Comando)</span>
            </button>

            <button
              type="button"
              className={`btn-toolbar ${activeTab === 'wiring' ? 'btn-primary-preset' : ''}`}
              onClick={() => setActiveTab('wiring')}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              title="Exibir mapa de interligações físicas e bornes da bancada"
            >
              <Cpu size={15} />
              <span>Esquema de Ligação da Bancada ({electricalComponents.length} Peças)</span>
            </button>

            <button
              type="button"
              className={`btn-toolbar ${activeTab === 'netlist' ? 'btn-primary-preset' : ''}`}
              onClick={() => setActiveTab('netlist')}
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              title="Exibir tabela de ligações De-Para com identificação normatizada"
            >
              <List size={15} />
              <span>Tabela De-Para ({wires.length} Condutores)</span>
            </button>
          </div>

          {/* Sub-selector for Diagram View Mode */}
          {activeTab === 'diagram' && (
            <div style={{ display: 'flex', gap: '4px', background: '#070b13', padding: '3px', borderRadius: '5px', border: '1px solid #1f293d' }}>
              <button
                type="button"
                className={`btn-toolbar ${diagramMode === 'BOTH' ? 'btn-primary-preset' : ''}`}
                onClick={() => setDiagramMode('BOTH')}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                Força + Comando
              </button>
              <button
                type="button"
                className={`btn-toolbar ${diagramMode === 'POWER' ? 'btn-primary-preset' : ''}`}
                onClick={() => setDiagramMode('POWER')}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                Só Potência
              </button>
              <button
                type="button"
                className={`btn-toolbar ${diagramMode === 'CONTROL' ? 'btn-primary-preset' : ''}`}
                onClick={() => setDiagramMode('CONTROL')}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                Só Comando
              </button>
            </div>
          )}

          {/* Circuit Health Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '5px',
                background: wires.length > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: wires.length > 0 ? '#38bdf8' : '#f87171',
                fontWeight: 700,
              }}
            >
              <Zap size={13} />
              {detectedCircuitTopology}
            </span>

            {m1 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '5px',
                  background:
                    motorFechamento === 'Y' || motorFechamento === 'DELTA'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                  color:
                    motorFechamento === 'Y' || motorFechamento === 'DELTA' ? '#4ade80' : '#fbbf24',
                  fontWeight: 700,
                }}
              >
                -M1:{' '}
                {motorFechamento === 'Y'
                  ? 'Estrela (Y 380V)'
                  : motorFechamento === 'DELTA'
                  ? 'Triângulo (Δ 220V)'
                  : 'Aberto'}
              </span>
            )}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="modal-body schematic-body" style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {wires.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                background: '#090d16',
                borderRadius: '8px',
                border: '1px dashed #334155',
                margin: '20px 0',
              }}
            >
              <Zap size={42} color="#64748b" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '8px' }}>
                Bancada Limpa (Nenhum Fio Conectado)
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '520px', margin: '0 auto 16px' }}>
                Você ainda não realizou ligações elétricas entre os componentes da bancada. Conecte os cabos clicando nos bornes das peças ou carregue um exemplo pronto (como Partida Direta ou Estrela-Triângulo) pelo menu de exemplos.
              </p>
            </div>
          ) : activeTab === 'diagram' ? (
            /* =========================================================================
               TAB 1: DIAGRAMA ESQUEMÁTICO NORMALIZADO (IEC 60617 / ABNT NBR 5410)
               Authentic engineering symbols (Disjuntor com curva e disparo magnético,
               contator com semicírculo de força, relé bimetálico, motor M 3~ aterrado,
               botoeiras com mola, bobinas IEC com referências cruzadas e selo técnico).
               ========================================================================= */
            <div className="standard-schematic-view">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.88rem', color: '#38bdf8', margin: 0, fontWeight: 800 }}>
                    DIAGRAMA ESQUEMÁTICO MULTIFILAR NORMALIZADO (SÍMBOLOS IEC 60617 / IEC 81346)
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Símbolos elétricos universais, linhas de comando em escada e tabela de referências cruzadas
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.74rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Linhas Energizadas
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#475569' }} /> Linhas em Repouso
                  </span>
                </div>
              </div>

              {/* Dynamic Synchronization Notification Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontSize: '0.76rem',
                  color: '#93c5fd',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={14} color="#38bdf8" />
                  <span>
                    <strong>Esquema gerado dinamicamente:</strong> o diagrama reflete as interligações reais detectadas nos condutores da sua bancada ({wires.length} condutores, {electricalComponents.length} peças).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('wiring')}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ver Mapa de Bornes da Bancada ➔
                </button>
              </div>

              {/* Blueprint / Technical CAD Canvas Area */}
              <div
                style={{
                  background: '#070b13',
                  borderRadius: '8px',
                  border: '1px solid #1f293d',
                  padding: '16px',
                  overflowX: 'auto',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: diagramMode === 'BOTH' ? 'space-between' : 'center',
                  }}
                >
                  {/* ========================================================
                      SEÇÃO 1: CIRCUITO DE POTÊNCIA (FORÇA) IEC 60617
                      Renders only devices and connections wired on the bench
                      ======================================================== */}
                  {(diagramMode === 'BOTH' || diagramMode === 'POWER') && (
                    <div
                      style={{
                        flex: 1,
                        minWidth: '400px',
                        maxWidth: diagramMode === 'POWER' ? '750px' : powerCircuitAnalysis?.deltaK ? '540px' : '440px',
                      }}
                    >
                      <div
                        style={{
                          borderBottom: '2px solid #2b3952',
                          paddingBottom: '6px',
                          marginBottom: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.05em' }}>
                          CIRCUITO DE POTÊNCIA (FORÇA)
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          3~ 60Hz 380V / 220V
                        </span>
                      </div>

                      {(() => {
                        const hasDelta = Boolean(powerCircuitAnalysis?.deltaK);
                        const hasStar = Boolean(powerCircuitAnalysis?.starK);
                        const svgWidth = hasDelta || hasStar ? 480 : 360;
                        const mainX = [70, 110, 150];
                        const deltaX = [230, 260, 290];
                        const starX = [350, 380, 410];
                        const colors = ['#8B5A2B', '#475569', '#ef4444'];
                        const q1Dev = powerCircuitAnalysis?.q1;
                        const k1Dev = powerCircuitAnalysis?.mainK;
                        const ft1Dev = powerCircuitAnalysis?.ft1;
                        const m1Dev = powerCircuitAnalysis?.m1;

                        return (
                          <svg viewBox={`0 0 ${svgWidth} 680`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                            <defs>
                              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="20" y2="0" stroke="#131b2c" strokeWidth="0.5" />
                                <line x1="0" y1="0" x2="0" y2="20" stroke="#131b2c" strokeWidth="0.5" />
                              </pattern>
                            </defs>

                            {/* Background Technical Grid */}
                            <rect x="0" y="0" width={svgWidth} height="680" fill="url(#cadGrid)" />

                            {/* Column Coordinates */}
                            <text x="110" y="16" fill="#475569" fontSize="9" fontWeight="bold">/ 1.0 (Principal)</text>
                            {hasDelta && <text x="260" y="16" fill="#475569" fontSize="9" fontWeight="bold">/ 1.1 (Triângulo)</text>}
                            {hasStar && <text x="380" y="16" fill="#475569" fontSize="9" fontWeight="bold">/ 1.2 (Estrela)</text>}

                            {/* 1. Barramentos de Alimentação L1, L2, L3, PE */}
                            <g className="iec-source-rails">
                              <line x1="20" y1="36" x2={svgWidth - 20} y2="36" stroke="#8B5A2B" strokeWidth="2.5" />
                              <line x1="20" y1="52" x2={svgWidth - 20} y2="52" stroke="#475569" strokeWidth="2.5" />
                              <line x1="20" y1="68" x2={svgWidth - 20} y2="68" stroke="#ef4444" strokeWidth="2.5" />
                              <line x1="20" y1="84" x2={svgWidth - 20} y2="84" stroke="#16a34a" strokeWidth="2" strokeDasharray="6 3" />

                              <text x="14" y="39" fill="#8B5A2B" fontSize="10" fontWeight="bold" textAnchor="end">L1</text>
                              <text x="14" y="55" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">L2</text>
                              <text x="14" y="71" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="end">L3</text>
                              <text x="14" y="87" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="end">PE</text>

                              <text x={svgWidth - 24} y="42" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end">3~ 60Hz 380V</text>
                              <text x={svgWidth - 24} y="87" fill="#16a34a" fontSize="8" fontWeight="bold" textAnchor="end">PE (Terra)</text>
                            </g>

                            {/* Main Drop Lines from Busbars */}
                            {[
                              { ph: 'L1', x: mainX[0], y: 36, color: colors[0] },
                              { ph: 'L2', x: mainX[1], y: 52, color: colors[1] },
                              { ph: 'L3', x: mainX[2], y: 68, color: colors[2] },
                            ].map((d) => (
                              <g key={`der-pwr-${d.ph}`}>
                                <circle cx={d.x} cy={d.y} r="3" fill={d.color} />
                                <line x1={d.x} y1={d.y} x2={d.x} y2="120" stroke={d.color} strokeWidth="2" />
                              </g>
                            ))}

                            {/* 2. Disjuntor Q1 (se presente) */}
                            {q1Dev && (
                              <g className="iec-breaker-q1">
                                <text x="20" y="162" fill="#38bdf8" fontSize="11" fontWeight="900">
                                  {getStandardTag(q1Dev)}
                                </text>
                                <text x="20" y="174" fill="#64748b" fontSize="7.5">
                                  {q1Dev.state?.curve || 'C'}{q1Dev.state?.current || 25}A
                                </text>

                                {[
                                  { inPin: '1', outPin: '2', x: mainX[0], color: colors[0] },
                                  { inPin: '3', outPin: '4', x: mainX[1], color: colors[1] },
                                  { inPin: '5', outPin: '6', x: mainX[2], color: colors[2] },
                                ].map((p) => {
                                  const isClosed = q1Dev.state?.closed !== false;
                                  return (
                                    <g key={`q1-pole-${p.inPin}`}>
                                      <circle cx={p.x} cy="120" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x={p.x - 7} y="118" fill="#94a3b8" fontSize="8" fontWeight="bold">{p.inPin}</text>
                                      <line x1={p.x} y1="120" x2={p.x} y2="135" stroke={p.color} strokeWidth="2" />
                                      <line
                                        x1={p.x}
                                        y1="135"
                                        x2={isClosed ? p.x : p.x + 8}
                                        y2={isClosed ? 152 : 146}
                                        stroke={p.color}
                                        strokeWidth="2.2"
                                      />
                                      <circle cx={p.x} cy="152" r="2.2" fill={p.color} />
                                      {/* Thermal element */}
                                      <rect x={p.x - 5} y="156" width="10" height="12" rx="1" fill="none" stroke={p.color} strokeWidth="1.5" />
                                      <path d={`M ${p.x - 5} 162 L ${p.x} 162 L ${p.x} 168`} fill="none" stroke={p.color} strokeWidth="1.2" />
                                      {/* Magnetic trip */}
                                      <path d={`M ${p.x - 5} 176 A 5 5 0 0 1 ${p.x + 5} 176`} fill="none" stroke={p.color} strokeWidth="1.5" />
                                      <line x1={p.x} y1="181" x2={p.x} y2="195" stroke={p.color} strokeWidth="2" />
                                      <circle cx={p.x} cy="195" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x={p.x - 7} y="202" fill="#94a3b8" fontSize="8" fontWeight="bold">{p.outPin}</text>
                                    </g>
                                  );
                                })}
                                <line x1={mainX[0] - 10} y1="140" x2={mainX[2] + 10} y2="140" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
                              </g>
                            )}

                            {/* Lines between Q1 and K1 */}
                            {mainX.map((x, idx) => (
                              <line
                                key={`line-q1-k1-${idx}`}
                                x1={x}
                                y1={q1Dev ? 195 : 120}
                                x2={x}
                                y2="240"
                                stroke={colors[idx]}
                                strokeWidth="2"
                              />
                            ))}

                            {/* 3. Contator Principal K1 */}
                            {k1Dev && (
                              <g className="iec-contactor-k1">
                                <text x="20" y="270" fill="#38bdf8" fontSize="11" fontWeight="900">
                                  {getStandardTag(k1Dev)}
                                </text>
                                <text x="20" y="282" fill={k1Dev.state?.energized ? '#22c55e' : '#64748b'} fontSize="7.5" fontWeight="bold">
                                  {k1Dev.state?.energized ? 'ATIVO' : 'REPOUSO'}
                                </text>

                                {[
                                  { inPin: '1', outPin: '2', x: mainX[0], color: colors[0] },
                                  { inPin: '3', outPin: '4', x: mainX[1], color: colors[1] },
                                  { inPin: '5', outPin: '6', x: mainX[2], color: colors[2] },
                                ].map((p) => {
                                  const isClosed = Boolean(k1Dev.state?.energized);
                                  return (
                                    <g key={`k1-pole-${p.inPin}`}>
                                      <circle cx={p.x} cy="240" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x={p.x - 7} y="238" fill="#94a3b8" fontSize="8" fontWeight="bold">{p.inPin}</text>
                                      <line x1={p.x} y1="240" x2={p.x} y2="252" stroke={p.color} strokeWidth="2" />
                                      <line
                                        x1={p.x}
                                        y1="252"
                                        x2={isClosed ? p.x : p.x + 8}
                                        y2={isClosed ? 276 : 266}
                                        stroke={p.color}
                                        strokeWidth="2.2"
                                      />
                                      <path
                                        d={`M ${isClosed ? p.x - 3 : p.x + 5} ${isClosed ? 276 : 266} A 3.5 3.5 0 0 1 ${isClosed ? p.x + 3 : p.x + 11} ${isClosed ? 276 : 266}`}
                                        fill="none"
                                        stroke={p.color}
                                        strokeWidth="1.8"
                                      />
                                      <circle cx={p.x} cy="276" r="2.2" fill={p.color} />
                                      <line x1={p.x} y1="276" x2={p.x} y2="292" stroke={p.color} strokeWidth="2" />
                                      <circle cx={p.x} cy="292" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x={p.x - 7} y="299" fill="#94a3b8" fontSize="8" fontWeight="bold">{p.outPin}</text>
                                    </g>
                                  );
                                })}
                                <line x1={mainX[0] - 10} y1="262" x2={mainX[2] + 10} y2="262" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
                                <text x={mainX[2] + 14} y="265" fill="#38bdf8" fontSize="7" fontWeight="bold">MEC</text>
                              </g>
                            )}

                            {/* Lines between K1 and FT1 */}
                            {mainX.map((x, idx) => (
                              <line
                                key={`line-k1-ft1-${idx}`}
                                x1={x}
                                y1="292"
                                x2={x}
                                y2={ft1Dev ? 335 : 440}
                                stroke={colors[idx]}
                                strokeWidth="2"
                              />
                            ))}

                            {/* 4. Relé Térmico F1 (se conectado) */}
                            {ft1Dev && (
                              <g className="iec-thermal-ft1">
                                <text x="20" y="362" fill="#38bdf8" fontSize="11" fontWeight="900">
                                  {getStandardTag(ft1Dev)}
                                </text>
                                <text x="20" y="374" fill={ft1Dev.state?.tripped ? '#ef4444' : '#64748b'} fontSize="7.5" fontWeight="bold">
                                  {ft1Dev.state?.tripped ? 'TRIP' : '4-6.3A'}
                                </text>

                                {[
                                  { inPin: '1', outPin: '2', x: mainX[0], color: colors[0] },
                                  { inPin: '3', outPin: '4', x: mainX[1], color: colors[1] },
                                  { inPin: '5', outPin: '6', x: mainX[2], color: colors[2] },
                                ].map((p) => (
                                  <g key={`ft1-pole-${p.inPin}`}>
                                    <circle cx={p.x} cy="335" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x={p.x - 7} y="333" fill="#94a3b8" fontSize="8" fontWeight="bold">{p.inPin}</text>
                                    <line x1={p.x} y1="335" x2={p.x} y2="345" stroke={p.color} strokeWidth="2" />
                                    <rect x={p.x - 5} y="345" width="10" height="20" rx="1" fill="none" stroke={p.color} strokeWidth="1.8" />
                                    <path d={`M ${p.x - 5} 355 L ${p.x} 355 L ${p.x} 365`} fill="none" stroke={p.color} strokeWidth="1.4" />
                                    <line x1={p.x} y1="365" x2={p.x} y2="380" stroke={p.color} strokeWidth="2" />
                                    <circle cx={p.x} cy="380" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x={p.x - 7} y="388" fill="#94a3b8" fontSize="8" fontWeight="bold">{p.outPin}</text>
                                  </g>
                                ))}
                                <line x1={mainX[0] - 10} y1="355" x2={mainX[2] + 10} y2="355" stroke="#f97316" strokeWidth="1.2" strokeDasharray="3 2" />
                                <text x={mainX[2] + 14} y="358" fill="#f97316" fontSize="7" fontWeight="bold">95-96</text>
                              </g>
                            )}

                            {/* Lines from FT1/K1 down to Motor U1, V1, W1 */}
                            {[
                              { x1: mainX[0], x2: mainX[0] + 10, color: colors[0], label: 'U1' },
                              { x1: mainX[1], x2: mainX[1], color: colors[1], label: 'V1' },
                              { x1: mainX[2], x2: mainX[2] - 10, color: colors[2], label: 'W1' },
                            ].map((l, idx) => (
                              <g key={`line-to-motor-${idx}`}>
                                <line
                                  x1={l.x1}
                                  y1={ft1Dev ? 380 : 292}
                                  x2={l.x2}
                                  y2="465"
                                  stroke={l.color}
                                  strokeWidth="2"
                                />
                                <text x={l.x2} y="458" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">
                                  {l.label}
                                </text>
                              </g>
                            ))}

                            {/* 5. Contator Triângulo K2 (RENDERIZADO APENAS SE CONECTADO!) */}
                            {hasDelta && powerCircuitAnalysis.deltaK && (
                              <g className="iec-delta-branch">
                                <text x={deltaX[1]} y="222" fill="#38bdf8" fontSize="10.5" fontWeight="900" textAnchor="middle">
                                  {getStandardTag(powerCircuitAnalysis.deltaK)} (Δ)
                                </text>

                                {/* Derivation lines from top feeding K2 */}
                                {mainX.map((mx, idx) => (
                                  <g key={`delta-feed-${idx}`}>
                                    <circle cx={mx} cy="215" r="2.5" fill={colors[idx]} />
                                    <path
                                      d={`M ${mx} 215 L ${deltaX[idx]} 215 L ${deltaX[idx]} 240`}
                                      fill="none"
                                      stroke={colors[idx]}
                                      strokeWidth="1.8"
                                    />
                                  </g>
                                ))}

                                {/* K2 Poles 1-2, 3-4, 5-6 */}
                                {deltaX.map((dx, idx) => {
                                  const isClosed = Boolean(powerCircuitAnalysis.deltaK?.state?.energized);
                                  return (
                                    <g key={`k2-pole-${idx}`}>
                                      <circle cx={dx} cy="240" r="2" fill="#cbd5e1" />
                                      <line x1={dx} y1="240" x2={dx} y2="252" stroke={colors[idx]} strokeWidth="1.8" />
                                      <line
                                        x1={dx}
                                        y1="252"
                                        x2={isClosed ? dx : dx + 6}
                                        y2={isClosed ? 276 : 266}
                                        stroke={colors[idx]}
                                        strokeWidth="2"
                                      />
                                      <path
                                        d={`M ${isClosed ? dx - 3 : dx + 4} ${isClosed ? 276 : 266} A 3 3 0 0 1 ${isClosed ? dx + 3 : dx + 10} ${isClosed ? 276 : 266}`}
                                        fill="none"
                                        stroke={colors[idx]}
                                        strokeWidth="1.5"
                                      />
                                      <circle cx={dx} cy="276" r="2" fill={colors[idx]} />
                                      <line x1={dx} y1="276" x2={dx} y2="292" stroke={colors[idx]} strokeWidth="1.8" />
                                      <circle cx={dx} cy="292" r="2" fill="#cbd5e1" />
                                    </g>
                                  );
                                })}

                                {/* Lines from K2 outputs to Motor W2, U2, V2 */}
                                {[
                                  { x: deltaX[0], label: 'W2', color: colors[0] },
                                  { x: deltaX[1], label: 'U2', color: colors[1] },
                                  { x: deltaX[2], label: 'V2', color: colors[2] },
                                ].map((dl, idx) => (
                                  <g key={`delta-out-${idx}`}>
                                    <path
                                      d={`M ${dl.x} 292 L ${dl.x} 485 L ${mainX[1] + 35 + idx * 12} 485 L ${mainX[1] + 35 + idx * 12} 505`}
                                      fill="none"
                                      stroke={dl.color}
                                      strokeWidth="1.5"
                                    />
                                    <text x={dl.x} y="304" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
                                      {dl.label}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            )}

                            {/* 6. Contator Estrela K3 (RENDERIZADO APENAS SE CONECTADO!) */}
                            {hasStar && powerCircuitAnalysis.starK && (
                              <g className="iec-star-branch">
                                <text x={starX[1]} y="222" fill="#38bdf8" fontSize="10.5" fontWeight="900" textAnchor="middle">
                                  {getStandardTag(powerCircuitAnalysis.starK)} (Y)
                                </text>

                                {/* Star Shorting Bridge Bar (1-3-5) */}
                                <line x1={starX[0]} y1="235" x2={starX[2]} y2="235" stroke="#38bdf8" strokeWidth="2.5" />
                                {starX.map((sx, idx) => (
                                  <circle key={`star-dot-${idx}`} cx={sx} cy="235" r="2.5" fill="#38bdf8" />
                                ))}
                                <text x={starX[1]} y="230" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
                                  PONTO ESTRELA
                                </text>

                                {/* K3 Poles */}
                                {starX.map((sx, idx) => {
                                  const isClosed = Boolean(powerCircuitAnalysis.starK?.state?.energized);
                                  return (
                                    <g key={`k3-pole-${idx}`}>
                                      <line x1={sx} y1="235" x2={sx} y2="252" stroke="#38bdf8" strokeWidth="1.8" />
                                      <line
                                        x1={sx}
                                        y1="252"
                                        x2={isClosed ? sx : sx + 6}
                                        y2={isClosed ? 276 : 266}
                                        stroke="#38bdf8"
                                        strokeWidth="2"
                                      />
                                      <path
                                        d={`M ${isClosed ? sx - 3 : sx + 4} ${isClosed ? 276 : 266} A 3 3 0 0 1 ${isClosed ? sx + 3 : sx + 10} ${isClosed ? 276 : 266}`}
                                        fill="none"
                                        stroke="#38bdf8"
                                        strokeWidth="1.5"
                                      />
                                      <circle cx={sx} cy="276" r="2" fill="#38bdf8" />
                                      <line x1={sx} y1="276" x2={sx} y2="292" stroke="#38bdf8" strokeWidth="1.8" />
                                      <circle cx={sx} cy="292" r="2" fill="#cbd5e1" />
                                    </g>
                                  );
                                })}

                                {/* Cross-lines connecting K3 to K2 outputs */}
                                {hasDelta && (
                                  <g>
                                    {starX.map((sx, idx) => (
                                      <path
                                        key={`star-join-${idx}`}
                                        d={`M ${sx} 292 L ${sx} ${315 + idx * 8} L ${deltaX[idx]} ${315 + idx * 8}`}
                                        fill="none"
                                        stroke={colors[idx]}
                                        strokeWidth="1.5"
                                        strokeDasharray="4 2"
                                      />
                                    ))}
                                  </g>
                                )}
                              </g>
                            )}

                            {/* 7. Motor Trifásico M1 */}
                            {m1Dev && (
                              <g className="iec-motor-m1" transform={`translate(${mainX[1]}, 515)`}>
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="36"
                                  fill="#090f1d"
                                  stroke={isMotorRunning ? '#22c55e' : '#38bdf8'}
                                  strokeWidth="2.5"
                                />
                                <circle cx="0" cy="0" r="30" fill="none" stroke="#1f293d" strokeWidth="1" />
                                <text x="0" y="-3" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">
                                  M
                                </text>
                                <text x="0" y="14" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                                  3 ~
                                </text>

                                <text x="-48" y="5" fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="end">
                                  {getStandardTag(m1Dev)}
                                </text>

                                {/* PE Ground Terminal */}
                                <line x1="36" y1="0" x2="65" y2="0" stroke="#16a34a" strokeWidth="2" />
                                <text x="50" y="-5" fill="#22c55e" fontSize="7.5" fontWeight="bold">PE</text>
                                <line x1="65" y1="-8" x2="65" y2="8" stroke="#16a34a" strokeWidth="2.2" />
                                <line x1="70" y1="-5" x2="70" y2="5" stroke="#16a34a" strokeWidth="2" />
                                <line x1="75" y1="-2" x2="75" y2="2" stroke="#16a34a" strokeWidth="1.8" />

                                {/* Internal Winding Jumpers if wired on motor */}
                                {powerCircuitAnalysis.hasMotorStarJumper && (
                                  <g transform="translate(-30, 22)">
                                    <line x1="0" y1="0" x2="60" y2="0" stroke="#f59e0b" strokeWidth="3" />
                                    <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
                                    <circle cx="30" cy="0" r="2.5" fill="#f59e0b" />
                                    <circle cx="60" cy="0" r="2.5" fill="#f59e0b" />
                                    <text x="30" y="-4" fill="#f59e0b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                                      Ponte Estrela (W2-U2-V2)
                                    </text>
                                  </g>
                                )}

                                {powerCircuitAnalysis.hasMotorDeltaJumpers && (
                                  <g transform="translate(-25, 22)">
                                    <text x="25" y="-3" fill="#f59e0b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                                      Pontes Triângulo (Δ)
                                    </text>
                                  </g>
                                )}

                                {/* Motor Connection Topology Badge */}
                                <g transform="translate(-75, 48)">
                                  <rect x="0" y="0" width="150" height="22" rx="4" fill="#0d131f" stroke="#2b3952" strokeWidth="1" />
                                  <text
                                    x="75"
                                    y="14"
                                    fill={
                                      hasDelta || hasStar || powerCircuitAnalysis.hasMotorStarJumper || powerCircuitAnalysis.hasMotorDeltaJumpers
                                        ? '#38bdf8'
                                        : '#f87171'
                                    }
                                    fontSize="8"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                  >
                                    {hasDelta && hasStar
                                      ? 'PARTIDA ESTRELA-TRIÂNGULO'
                                      : powerCircuitAnalysis.hasMotorStarJumper
                                      ? 'FECHAMENTO ESTRELA (Y 380V)'
                                      : powerCircuitAnalysis.hasMotorDeltaJumpers
                                      ? 'FECHAMENTO TRIÂNGULO (Δ 220V)'
                                      : 'ENROLAMENTOS DIRETOS'}
                                  </text>
                                </g>
                              </g>
                            )}
                          </svg>
                        );
                      })()}
                    </div>
                  )}

                  {/* ========================================================
                      SEÇÃO 2: CIRCUITO DE COMANDO (IEC 60617 LADDER)
                      Dynamically traced from user connections Phase -> Neutral
                      ======================================================== */}
                  {(diagramMode === 'BOTH' || diagramMode === 'CONTROL') && (
                    <div
                      style={{
                        flex: 1,
                        minWidth: '420px',
                        maxWidth: diagramMode === 'CONTROL' ? '820px' : '620px',
                      }}
                    >
                      <div
                        style={{
                          borderBottom: '2px solid #2b3952',
                          paddingBottom: '6px',
                          marginBottom: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.05em' }}>
                          CIRCUITO DE COMANDO (CONTROLE)
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          1~ 60Hz 220V AC (Fase - Neutro)
                        </span>
                      </div>

                      {(() => {
                        const rungs = controlCircuitAnalysis?.rungs || [];
                        const rungCount = Math.max(1, rungs.length);
                        const spacing = rungCount <= 1 ? 160 : rungCount === 2 ? 150 : rungCount === 3 ? 125 : 105;
                        const startX = rungCount <= 1 ? 180 : 85;
                        const svgWidth = Math.max(460, startX + (rungCount - 1) * spacing + 90);

                        return (
                          <svg viewBox={`0 0 ${svgWidth} 680`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                            {/* Background Technical Grid */}
                            <rect x="0" y="0" width={svgWidth} height="680" fill="url(#cadGrid)" />

                            {/* Top Phase Rail (L1 / 220V) */}
                            <line x1="20" y1="36" x2={svgWidth - 20} y2="36" stroke="#ef4444" strokeWidth="2.5" />
                            <text x="14" y="40" fill="#ef4444" fontSize="10.5" fontWeight="bold" textAnchor="end">L1</text>
                            <text x={svgWidth - 20} y="40" fill="#ef4444" fontSize="8.5" fontWeight="bold" textAnchor="end">220V AC</text>

                            {/* Bottom Neutral Rail (N / 0V) */}
                            <line x1="20" y1="620" x2={svgWidth - 20} y2="620" stroke="#0ea5e9" strokeWidth="2.5" />
                            <text x="14" y="624" fill="#0ea5e9" fontSize="10.5" fontWeight="bold" textAnchor="end">N</text>
                            <text x={svgWidth - 20} y="624" fill="#0ea5e9" fontSize="8.5" fontWeight="bold" textAnchor="end">0V</text>

                            {/* Column Titles */}
                            {rungs.map((r, idx) => (
                              <text
                                key={`col-title-${r.id}`}
                                x={startX + idx * spacing}
                                y="24"
                                fill="#475569"
                                fontSize="8.5"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                Coluna {idx + 1}: {r.tag}
                              </text>
                            ))}

                            {/* Seal / Distribution Bus Bar (Horizontal bridge from after seal to columns 2, 3, etc.) */}
                            {rungCount > 1 && (
                              <g className="iec-seal-distribution">
                                <line
                                  x1={startX}
                                  y1="330"
                                  x2={startX + (rungCount - 1) * spacing}
                                  y2="330"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                />
                                {rungs.map((_, idx) => (
                                  <circle
                                    key={`dist-node-${idx}`}
                                    cx={startX + idx * spacing}
                                    cy="330"
                                    r="2.8"
                                    fill="#ef4444"
                                  />
                                ))}
                              </g>
                            )}

                            {/* Rung 1: Main Control Branch (Coluna 1) */}
                            {rungs.length > 0 && (() => {
                              const r1 = rungs[0];
                              const rx = startX;
                              let currY = 36;

                              return (
                                <g className="ladder-rung-main" key={r1.id}>
                                  {/* Drop from L1 */}
                                  <circle cx={rx} cy="36" r="3" fill="#ef4444" />
                                  <line x1={rx} y1="36" x2={rx} y2="65" stroke="#ef4444" strokeWidth="2" />

                                  {/* Emergency Button S00 (if wired) */}
                                  {controlCircuitAnalysis.hasEmergency && s00 && (
                                    <g className="iec-s00" transform={`translate(${rx}, 65)`}>
                                      <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">11</text>
                                      <line x1="0" y1="0" x2="0" y2="30" stroke="#ef4444" strokeWidth="2.2" />
                                      <line x1="0" y1="15" x2="-14" y2="15" stroke="#f87171" strokeWidth="1.5" />
                                      <path d="M -14 9 A 6 6 0 0 0 -14 21 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                                      <circle cx="0" cy="30" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="34" fill="#94a3b8" fontSize="8" fontWeight="bold">12</text>
                                      <text x="10" y="19" fill="#38bdf8" fontSize="9.5" fontWeight="900">{getStandardTag(s00)}</text>
                                      <line x1="0" y1="30" x2="0" y2="55" stroke="#ef4444" strokeWidth="2" />
                                    </g>
                                  )}

                                  {/* Thermal Relay 95-96 (if wired) */}
                                  {controlCircuitAnalysis.hasThermalControl && ft1 && (
                                    <g
                                      className="iec-ft1-nc"
                                      transform={`translate(${rx}, ${controlCircuitAnalysis.hasEmergency ? 120 : 65})`}
                                    >
                                      <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">95</text>
                                      <line x1="0" y1="0" x2="0" y2="30" stroke="#ef4444" strokeWidth="2.2" />
                                      <rect x="-4" y="9" width="8" height="12" fill="none" stroke="#f97316" strokeWidth="1.2" />
                                      <circle cx="0" cy="30" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="34" fill="#94a3b8" fontSize="8" fontWeight="bold">96</text>
                                      <text x="10" y="19" fill="#38bdf8" fontSize="9.5" fontWeight="900">{getStandardTag(ft1)}</text>
                                      <line x1="0" y1="30" x2="0" y2="55" stroke="#ef4444" strokeWidth="2" />
                                    </g>
                                  )}

                                  {/* Stop Button S0 (if wired) */}
                                  {controlCircuitAnalysis.hasStop && s0 && (
                                    <g
                                      className="iec-s0-nc"
                                      transform={`translate(${rx}, ${
                                        controlCircuitAnalysis.hasEmergency && controlCircuitAnalysis.hasThermalControl
                                          ? 175
                                          : controlCircuitAnalysis.hasEmergency || controlCircuitAnalysis.hasThermalControl
                                          ? 120
                                          : 65
                                      })`}
                                    >
                                      <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">11</text>
                                      <line x1="0" y1="0" x2="0" y2="30" stroke="#ef4444" strokeWidth="2.2" />
                                      <line x1="0" y1="15" x2="-14" y2="15" stroke="#94a3b8" strokeWidth="1.2" />
                                      <line x1="-14" y1="10" x2="-14" y2="20" stroke="#ef4444" strokeWidth="2" />
                                      <circle cx="0" cy="30" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="34" fill="#94a3b8" fontSize="8" fontWeight="bold">12</text>
                                      <text x="10" y="19" fill="#38bdf8" fontSize="9.5" fontWeight="900">{getStandardTag(s0)}</text>
                                      <line x1="0" y1="30" x2="0" y2="55" stroke="#ef4444" strokeWidth="2" />
                                    </g>
                                  )}

                                  {/* Parallel Block: Start Button S1 // Contactor Auxiliary 13-14 */}
                                  <g className="iec-parallel-seal" transform={`translate(${rx}, 235)`}>
                                    <circle cx="0" cy="0" r="3" fill="#ef4444" />
                                    <line x1="-35" y1="0" x2={r1.hasSeal ? 35 : 0} y2="0" stroke="#ef4444" strokeWidth="2" />

                                    {/* Left Branch: Start Button NA */}
                                    <line x1="-35" y1="0" x2="-35" y2="15" stroke="#ef4444" strokeWidth="2" />
                                    <circle cx="-35" cy="15" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x="-43" y="13" fill="#94a3b8" fontSize="8" fontWeight="bold">13</text>
                                    <line x1="-35" y1="15" x2="-26" y2="44" stroke="#ef4444" strokeWidth="2.2" />
                                    <circle cx="-35" cy="46" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x="-43" y="52" fill="#94a3b8" fontSize="8" fontWeight="bold">14</text>
                                    <line x1="-30" y1="29" x2="-45" y2="29" stroke="#94a3b8" strokeWidth="1.2" />
                                    <line x1="-45" y1="24" x2="-45" y2="34" stroke="#22c55e" strokeWidth="2" />
                                    <text x="-58" y="32" fill="#38bdf8" fontSize="9" fontWeight="900">
                                      {r1.startBtn ? getStandardTag(r1.startBtn) : '-S1'}
                                    </text>
                                    <line x1="-35" y1="46" x2="-35" y2="60" stroke="#ef4444" strokeWidth="2" />

                                    {/* Right Branch: Seal Contact NA (if present) */}
                                    {r1.hasSeal && (
                                      <g>
                                        <line x1="35" y1="0" x2="35" y2="15" stroke="#ef4444" strokeWidth="2" />
                                        <circle cx="35" cy="15" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                        <text x="27" y="13" fill="#94a3b8" fontSize="8" fontWeight="bold">13</text>
                                        <line
                                          x1="35"
                                          y1="15"
                                          x2={r1.isEnergized ? 35 : 44}
                                          y2={r1.isEnergized ? 46 : 42}
                                          stroke="#ef4444"
                                          strokeWidth="2.2"
                                        />
                                        <circle cx="35" cy="46" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                        <text x="27" y="52" fill="#94a3b8" fontSize="8" fontWeight="bold">14</text>
                                        <text x="48" y="32" fill="#38bdf8" fontSize="9" fontWeight="900">{r1.coilTag}</text>
                                        <line x1="35" y1="46" x2="35" y2="60" stroke="#ef4444" strokeWidth="2" />
                                      </g>
                                    )}

                                    {/* Branch Joining */}
                                    <line x1="-35" y1="60" x2={r1.hasSeal ? 35 : -35} y2="60" stroke="#ef4444" strokeWidth="2" />
                                    <circle cx="0" cy="60" r="3" fill="#ef4444" />
                                    <line x1="0" y1="60" x2="0" y2="95" stroke="#ef4444" strokeWidth="2" />
                                  </g>

                                  {/* Interlock Contact (NF) if present in this rung */}
                                  {r1.interlock && (
                                    <g className="iec-interlock-r1" transform={`translate(${rx}, 355)`}>
                                      <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">21</text>
                                      <circle cx="0" cy="30" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="34" fill="#94a3b8" fontSize="8" fontWeight="bold">22</text>
                                      <line x1="0" y1="0" x2="0" y2="30" stroke="#ef4444" strokeWidth="2.2" />
                                      <text x="10" y="18" fill="#f97316" fontSize="9" fontWeight="900">{r1.interlock.tag}</text>
                                      <line x1="0" y1="30" x2="0" y2="60" stroke="#ef4444" strokeWidth="2" />
                                    </g>
                                  )}

                                  {/* Coil K1 */}
                                  <g className="iec-coil-k1" transform={`translate(${rx}, ${r1.interlock ? 440 : 380})`}>
                                    <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">A1</text>
                                    <line x1="0" y1="0" x2="0" y2="15" stroke="#ef4444" strokeWidth="2" />
                                    <rect
                                      x="-18"
                                      y="15"
                                      width="36"
                                      height="26"
                                      rx="2"
                                      fill="#0d131f"
                                      stroke={r1.isEnergized ? '#22c55e' : '#38bdf8'}
                                      strokeWidth="2"
                                    />
                                    <text x="0" y="32" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                                      {r1.coilTag}
                                    </text>
                                    <line x1="0" y1="41" x2="0" y2="56" stroke="#0ea5e9" strokeWidth="2" />
                                    <circle cx="0" cy="56" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x="-8" y="60" fill="#94a3b8" fontSize="8" fontWeight="bold">A2</text>
                                    <line x1="0" y1="56" x2="0" y2={620 - (r1.interlock ? 440 : 380)} stroke="#0ea5e9" strokeWidth="2" />
                                    <circle cx="0" cy={620 - (r1.interlock ? 440 : 380)} r="3" fill="#0ea5e9" />

                                    {/* Cross reference table */}
                                    <g transform={`translate(-25, ${620 - (r1.interlock ? 440 : 380) + 12})`}>
                                      <rect x="0" y="0" width="50" height="22" rx="2" fill="#070b13" stroke="#2b3952" strokeWidth="0.8" />
                                      <text x="25" y="10" fill="#94a3b8" fontSize="6.5" textAnchor="middle">1-2 3-4 5-6 [PWR]</text>
                                      <text x="25" y="18" fill="#10b981" fontSize="6.5" textAnchor="middle">13-14 [Col 1]</text>
                                    </g>
                                  </g>
                                </g>
                              );
                            })()}

                            {/* Secondary Rungs (Coluna 2, 3, etc.) - Only rendered if present in user's circuit */}
                            {rungs.slice(1).map((rung, sIdx) => {
                              const colIdx = sIdx + 1;
                              const rx = startX + colIdx * spacing;

                              return (
                                <g className={`ladder-rung-${colIdx}`} key={rung.id}>
                                  {/* Drop from distribution bus */}
                                  <line x1={rx} y1="330" x2={rx} y2="355" stroke="#ef4444" strokeWidth="2" />

                                  {/* Timed contact if present */}
                                  {rung.timedContact && (
                                    <g className="iec-timed-contact" transform={`translate(${rx}, 355)`}>
                                      <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">
                                        {rung.timedContact.terms.split('-')[0]}
                                      </text>
                                      <line x1="0" y1="0" x2="0" y2="14" stroke="#ef4444" strokeWidth="2" />
                                      <line
                                        x1="0"
                                        y1="14"
                                        x2={rung.timedContact.type === 'NC' ? 0 : 8}
                                        y2="38"
                                        stroke="#ef4444"
                                        strokeWidth="2.2"
                                      />
                                      <path d="M 4 28 A 4 4 0 0 1 12 28" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                                      <circle cx="0" cy="40" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="44" fill="#94a3b8" fontSize="8" fontWeight="bold">
                                        {rung.timedContact.terms.split('-')[1]}
                                      </text>
                                      <text x="14" y="26" fill="#38bdf8" fontSize="9" fontWeight="900">
                                        {rung.timedContact.tag}
                                      </text>
                                      <line x1="0" y1="40" x2="0" y2="60" stroke="#ef4444" strokeWidth="2" />
                                    </g>
                                  )}

                                  {/* Interlock contact if present */}
                                  {rung.interlock && (
                                    <g
                                      className="iec-sec-interlock"
                                      transform={`translate(${rx}, ${rung.timedContact ? 420 : 355})`}
                                    >
                                      <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">21</text>
                                      <circle cx="0" cy="30" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                      <text x="-8" y="34" fill="#94a3b8" fontSize="8" fontWeight="bold">22</text>
                                      <line x1="0" y1="0" x2="0" y2="30" stroke="#ef4444" strokeWidth="2.2" />
                                      <text x="10" y="18" fill="#f97316" fontSize="9" fontWeight="900">{rung.interlock.tag}</text>
                                      <line x1="0" y1="30" x2="0" y2="55" stroke="#ef4444" strokeWidth="2" />
                                    </g>
                                  )}

                                  {/* Coil */}
                                  <g
                                    className="iec-sec-coil"
                                    transform={`translate(${rx}, ${
                                      rung.timedContact && rung.interlock ? 490 : rung.timedContact || rung.interlock ? 420 : 355
                                    })`}
                                  >
                                    <circle cx="0" cy="0" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x="-8" y="-2" fill="#94a3b8" fontSize="8" fontWeight="bold">A1</text>
                                    <line x1="0" y1="0" x2="0" y2="15" stroke="#ef4444" strokeWidth="2" />

                                    {/* Rectangular Coil */}
                                    <rect
                                      x="-18"
                                      y="15"
                                      width="36"
                                      height="26"
                                      rx="2"
                                      fill="#0d131f"
                                      stroke={rung.isEnergized ? '#22c55e' : rung.type === 'TIMER' ? '#f59e0b' : '#38bdf8'}
                                      strokeWidth="2"
                                    />

                                    {/* Timer symbol inside timer coil */}
                                    {rung.type === 'TIMER' && (
                                      <g>
                                        <line x1="-18" y1="15" x2="-8" y2="28" stroke="#f59e0b" strokeWidth="1.2" />
                                        <line x1="-8" y1="28" x2="2" y2="15" stroke="#f59e0b" strokeWidth="1.2" />
                                      </g>
                                    )}

                                    <text x={rung.type === 'TIMER' ? 2 : 0} y="32" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                                      {rung.coilTag}
                                    </text>

                                    {rung.type === 'TIMER' && (
                                      <text x="0" y="48" fill="#f59e0b" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                                        RE (0.5..60s)
                                      </text>
                                    )}

                                    <line x1="0" y1="41" x2="0" y2="56" stroke="#0ea5e9" strokeWidth="2" />
                                    <circle cx="0" cy="56" r="2.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
                                    <text x="-8" y="60" fill="#94a3b8" fontSize="8" fontWeight="bold">A2</text>

                                    {/* To Neutral */}
                                    {(() => {
                                      const coilY = rung.timedContact && rung.interlock ? 490 : rung.timedContact || rung.interlock ? 420 : 355;
                                      return (
                                        <g>
                                          <line x1="0" y1="56" x2="0" y2={620 - coilY} stroke="#0ea5e9" strokeWidth="2" />
                                          <circle cx="0" cy={620 - coilY} r="3" fill="#0ea5e9" />
                                          <g transform={`translate(-25, ${620 - coilY + 12})`}>
                                            <rect x="0" y="0" width="50" height="22" rx="2" fill="#070b13" stroke="#2b3952" strokeWidth="0.8" />
                                            <text x="25" y="10" fill="#94a3b8" fontSize="6.5" textAnchor="middle">
                                              {rung.type === 'TIMER' ? '15-16 [Col 3]' : '1-2 3-4 5-6 [PWR]'}
                                            </text>
                                            <text x="25" y="18" fill={rung.type === 'TIMER' ? '#f59e0b' : '#38bdf8'} fontSize="6.5" textAnchor="middle">
                                              {rung.type === 'TIMER' ? '15-18 [Col 4]' : `21-22 [Intertrav.]`}
                                            </text>
                                          </g>
                                        </g>
                                      );
                                    })()}
                                  </g>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SELO TÉCNICO / CARIMBO DE PROJETO (NORMA ABNT / IEC)
                    ========================================================== */}
                <div
                  style={{
                    marginTop: '20px',
                    border: '1.5px solid #2b3952',
                    borderRadius: '4px',
                    background: '#0a0f1d',
                    padding: '8px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.72rem',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.66rem', textTransform: 'uppercase' }}>INSTALAÇÃO / PROJETO:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 900 }}>SIMUFC PRO • SIMULADOR DE COMANDOS ELÉTRICOS</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.66rem', textTransform: 'uppercase' }}>NORMAS TÉCNICAS:</span>
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>IEC 60617 • IEC 81346-2 • ABNT NBR 5410</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.66rem', textTransform: 'uppercase' }}>TÍTULO DA PRANCHA:</span>
                    <span style={{ color: '#cbd5e1', fontWeight: 700 }}>DIAGRAMA UNIFILAR & MULTIFILAR DINÂMICO</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.66rem', textTransform: 'uppercase' }}>FOLHA / ESCALA:</span>
                    <span style={{ color: '#4ade80', fontWeight: 800 }}>FL. 01/01 • S/ ESCALA</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'wiring' ? (
            /* =========================================================================
               TAB 2: ESQUEMA DE LIGAÇÃO DA BANCADA (ORGANIZED WIRING DIAGRAM)
               Renders every component in a clean modular layout with its real terminals
               and routes all connected cables clearly with their respective wire colors.
               ========================================================================= */
            <div className="wiring-diagram-view">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '0.88rem', color: '#38bdf8', margin: 0, fontWeight: 800 }}>
                    MAPA DE INTERLIGAÇÕES DOS BORNES (LAYOUT MODULAR DA BANCADA)
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Disposição dos blocos de bornes e condutores conforme normas de montagem de painéis
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Potência
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} /> Comando
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0ea5e9' }} /> Neutro
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a' }} /> Aterramento (PE)
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#070b13',
                  borderRadius: '8px',
                  border: '1px solid #1f293d',
                  padding: '10px',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: '68vh',
                }}
              >
                <svg
                  viewBox={`0 0 ${wiringLayout.width} ${wiringLayout.height}`}
                  width={wiringLayout.width}
                  height={wiringLayout.height}
                  style={{ display: 'block', margin: '0 auto', userSelect: 'none' }}
                >
                  <defs>
                    <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Component Device Blocks & Terminals */}
                  {Object.entries(wiringLayout.nodes).map(([cId, node]) => {
                    const compState = node.comp?.state || {};
                    const isEnergized = Boolean(compState.energized || compState.running || compState.closed);

                    return (
                      <g key={`device-box-${cId}`}>
                        <rect
                          x={node.x + 2}
                          y={node.y + 4}
                          width={node.width}
                          height={node.height}
                          rx="8"
                          fill="rgba(0,0,0,0.4)"
                        />

                        <rect
                          x={node.x}
                          y={node.y}
                          width={node.width}
                          height={node.height}
                          rx="8"
                          fill="#131b2c"
                          stroke={isEnergized ? '#38bdf8' : '#2b3952'}
                          strokeWidth={isEnergized ? '1.8' : '1.2'}
                        />

                        {/* Device Header Bar */}
                        <rect
                          x={node.x}
                          y={node.y}
                          width={node.width}
                          height="26"
                          rx="8 8 0 0"
                          fill="#1c273c"
                        />
                        <text
                          x={node.x + 10}
                          y={node.y + 17}
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="900"
                          fontFamily="sans-serif"
                        >
                          {node.tag}
                        </text>
                        <text
                          x={node.x + 48}
                          y={node.y + 16.5}
                          fill="#94a3b8"
                          fontSize="8.5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {node.title}
                        </text>

                        {node.badge && (
                          <g>
                            <rect
                              x={node.x + node.width - 70}
                              y={node.y + 5}
                              width="62"
                              height="16"
                              rx="3"
                              fill="#0b1329"
                              stroke="#38bdf8"
                              strokeWidth="0.8"
                            />
                            <text
                              x={node.x + node.width - 39}
                              y={node.y + 16}
                              fill="#38bdf8"
                              fontSize="8"
                              fontWeight="bold"
                              textAnchor="middle"
                              fontFamily="sans-serif"
                            >
                              {node.badge}
                            </text>
                          </g>
                        )}

                        {/* Terminals */}
                        {Object.entries(node.terminals).map(([tId, term]) => {
                          const v = getVolt(cId, tId);
                          const isPowered = Boolean(v);
                          const isConnected = hasWire(cId, tId);
                          const isHovered =
                            hoveredTerminal &&
                            hoveredTerminal.cId === cId &&
                            hoveredTerminal.tId === tId;

                          return (
                            <g
                              key={`term-socket-${cId}-${tId}`}
                              onMouseEnter={() => setHoveredTerminal({ cId, tId, label: term.label })}
                              onMouseLeave={() => setHoveredTerminal(null)}
                              style={{ cursor: 'pointer' }}
                            >
                              <circle
                                cx={term.x}
                                cy={term.y}
                                r="10"
                                fill={isConnected ? '#090d16' : '#1e293b'}
                                stroke={isPowered ? '#22c55e' : isConnected ? '#38bdf8' : '#475569'}
                                strokeWidth={isHovered ? '2.5' : '1.2'}
                              />

                              <circle
                                cx={term.x}
                                cy={term.y}
                                r="6"
                                fill={term.color || (isPowered ? '#22c55e' : '#cbd5e1')}
                              />

                              <line
                                x1={term.x - 3}
                                y1={term.y}
                                x2={term.x + 3}
                                y2={term.y}
                                stroke="#1e293b"
                                strokeWidth="1.2"
                              />
                              <line
                                x1={term.x}
                                y1={term.y - 3}
                                x2={term.x}
                                y2={term.y + 3}
                                stroke="#1e293b"
                                strokeWidth="1.2"
                              />

                              <text
                                x={term.x}
                                y={term.y > node.y + node.height / 2 ? term.y - 13 : term.y + 19}
                                fill={isPowered ? '#4ade80' : isConnected ? '#f1f5f9' : '#94a3b8'}
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="sans-serif"
                              >
                                {term.label}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Connected Wires */}
                  {wires.map((wire, idx) => {
                    const fromNode = wiringLayout.nodes[wire.fromComponent];
                    const toNode = wiringLayout.nodes[wire.toComponent];

                    if (!fromNode || !toNode) return null;

                    const fromTerm = fromNode.terminals[wire.fromTerminal];
                    const toTerm = toNode.terminals[wire.toTerminal];

                    if (!fromTerm || !toTerm) return null;

                    const isSelected = selectedWireId === wire.id;
                    const details = getWireDetails(wire);

                    const dx = toTerm.x - fromTerm.x;
                    const dy = toTerm.y - fromTerm.y;
                    const dist = Math.hypot(dx, dy);

                    const midX = (fromTerm.x + toTerm.x) / 2;
                    const midY = (fromTerm.y + toTerm.y) / 2;
                    const curveOffset = Math.min(80, Math.max(30, dist * 0.25));

                    const pathD = `M ${fromTerm.x} ${fromTerm.y} Q ${midX} ${midY + (fromTerm.y > toTerm.y ? -curveOffset : curveOffset)} ${toTerm.x} ${toTerm.y}`;

                    return (
                      <g
                        key={`circuit-wire-${wire.id || idx}`}
                        onClick={() => setSelectedWireId(isSelected ? null : wire.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <path
                          d={pathD}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="14"
                        />

                        {isSelected && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="8"
                            opacity="0.8"
                            filter="url(#wireGlow)"
                          />
                        )}

                        <path
                          d={pathD}
                          fill="none"
                          stroke="rgba(0, 0, 0, 0.45)"
                          strokeWidth="4"
                          transform="translate(0, 2)"
                        />

                        <path
                          d={pathD}
                          fill="none"
                          stroke={wire.color || details.badgeColor}
                          strokeWidth={isSelected ? '3.5' : '2.5'}
                          strokeLinecap="round"
                        />

                        <circle cx={fromTerm.x} cy={fromTerm.y} r="3" fill="#ffffff" />
                        <circle cx={toTerm.x} cy={toTerm.y} r="3" fill="#ffffff" />

                        <g transform={`translate(${midX}, ${midY})`}>
                          <circle cx="0" cy="0" r="8" fill="#0f172a" stroke={wire.color || details.badgeColor} strokeWidth="1.5" />
                          <text x="0" y="3" fill="#f8fafc" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                            {idx + 1}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            /* =========================================================================
               TAB 3: TABELA DE LIGAÇÕES (DE-PARA / NETLIST NORMATIZADA)
               ========================================================================= */
            <div className="netlist-container">
              {/* Filter & Search Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: `Todos (${wires.length})` },
                    { id: 'POWER', label: 'Potência' },
                    { id: 'CONTROL', label: 'Comando & Selo' },
                    { id: 'NEUTRAL', label: 'Neutro' },
                    { id: 'PE', label: 'Aterramento (PE)' },
                    { id: 'JUMPER', label: 'Fechamento Motor' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`btn-toolbar ${categoryFilter === cat.id ? 'btn-primary-preset' : ''}`}
                      onClick={() => setCategoryFilter(cat.id)}
                      style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search
                    size={14}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}
                  />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por tag (-K1, -Q1), borne ou função..."
                    style={{
                      width: '100%',
                      background: '#0d131f',
                      border: '1px solid #1f293d',
                      borderRadius: '5px',
                      padding: '6px 10px 6px 30px',
                      color: '#f8fafc',
                      fontSize: '0.76rem',
                    }}
                  />
                </div>
              </div>

              {/* Netlist Table with IEC Identifiers */}
              <div
                style={{
                  overflowX: 'auto',
                  background: '#070b13',
                  borderRadius: '8px',
                  border: '1px solid #1f293d',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                  }}
                >
                  <thead>
                    <tr style={{ background: '#131b2c', color: '#cbd5e1', borderBottom: '2px solid #2b3952' }}>
                      <th style={{ padding: '9px 12px' }}>#</th>
                      <th style={{ padding: '9px 12px' }}>Origem (De) [IEC]</th>
                      <th style={{ padding: '9px 12px' }}>Borne Origem</th>
                      <th style={{ padding: '9px 12px' }}>Destino (Para) [IEC]</th>
                      <th style={{ padding: '9px 12px' }}>Borne Destino</th>
                      <th style={{ padding: '9px 12px' }}>Condutor</th>
                      <th style={{ padding: '9px 12px' }}>Tensão Real</th>
                      <th style={{ padding: '9px 12px' }}>Função Técnica Normatizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWires.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          Nenhum condutor encontrado com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      filteredWires.map((wire, idx) => {
                        const vFrom = getVolt(wire.fromComponent, wire.fromTerminal);
                        const vTo = getVolt(wire.toComponent, wire.toTerminal);
                        const voltDisplay = vFrom || vTo;
                        const details = getWireDetails(wire);

                        return (
                          <tr
                            key={wire.id || idx}
                            style={{
                              borderBottom: '1px solid #131b2c',
                              background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'rgba(11, 19, 35, 0.2)',
                            }}
                          >
                            <td style={{ padding: '8px 12px', color: '#64748b', fontWeight: 'bold' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#f8fafc', fontWeight: 700 }}>
                              {getComponentFullName(wire.fromComponent)}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  background: '#131b2c',
                                  color: '#38bdf8',
                                  padding: '2px 7px',
                                  borderRadius: '3px',
                                  fontWeight: 'bold',
                                  border: '1px solid #1f293d',
                                }}
                              >
                                {wire.fromTerminal}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', color: '#f8fafc', fontWeight: 700 }}>
                              {getComponentFullName(wire.toComponent)}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  background: '#131b2c',
                                  color: '#38bdf8',
                                  padding: '2px 7px',
                                  borderRadius: '3px',
                                  fontWeight: 'bold',
                                  border: '1px solid #1f293d',
                                }}
                              >
                                {wire.toTerminal}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: wire.color || details.badgeColor,
                                    border: '1px solid rgba(255,255,255,0.3)',
                                  }}
                                />
                                <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                                  {wire.color || details.badgeColor}
                                </span>
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  color: voltDisplay ? '#4ade80' : '#64748b',
                                  fontWeight: voltDisplay ? 700 : 500,
                                }}
                              >
                                {voltDisplay ? `${voltDisplay}` : 'Sem Tensão (0V)'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  color: '#e2e8f0',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  borderLeft: `3px solid ${details.badgeColor}`,
                                }}
                              >
                                {details.functionName}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
