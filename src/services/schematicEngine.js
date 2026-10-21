/**
 * SimuFC Pro - Industrial Electrical Schematic Synthesis Engine
 * 
 * Standard Compliant:
 * - IEC 60617: Graphical Symbols for Diagrams
 * - IEC 81346-2: Letter Codes for Component Designation
 * - DIN EN 61082-1: Preparation of Documents Used in Electrotechnology
 * 
 * Architecture:
 * 1. Tag Normalization (IEC 81346-2)
 * 2. Netlist & Equipotential Net Graph (Union-Find)
 * 3. Component Decomposition into Functional Electrical Primitives
 * 4. Domain Partitioning (Power Circuit vs Control Circuit)
 * 5. Deterministic Layout & Conductor Routing
 * 6. Cross-Reference Resolution (Coil <-> Contacts)
 * 7. CAD DXF Entity Generator (AutoCAD R12/2000 compatible)
 */

// ============================================================================
// 1. TAG NORMALIZATION (IEC 81346-2)
// ============================================================================
export function resolveComponentTags(components, powerSource) {
  const tagMap = new Map();

  const assignCategory = (items, prefix) => {
    items.forEach((comp, idx) => {
      const raw = (comp.tag || '').trim().replace(/^-/, '');
      if (raw.toUpperCase().startsWith(prefix.toUpperCase()) && /\d+$/.test(raw)) {
        tagMap.set(comp.id, `-${raw.toUpperCase()}`);
      } else {
        tagMap.set(comp.id, `-${prefix}${idx + 1}`);
      }
    });
  };

  const breakers = components.filter((c) => c.type === 'circuit_breaker');
  const contactors = components.filter((c) => c.type === 'contactor');
  const thermalRelays = components.filter((c) => c.type === 'thermal_relay');
  const timerRelays = components.filter((c) => c.type === 'timer_relay');
  const emergencyBtns = components.filter((c) => c.type === 'button_emergency');
  const stopBtns = components.filter((c) => c.type === 'button_stop');
  const startBtns = components.filter((c) => c.type === 'button_start');
  const motors = components.filter((c) => c.type === 'motor_6p');

  assignCategory(breakers, 'Q');
  assignCategory(contactors, 'K');
  assignCategory(thermalRelays, 'F');
  assignCategory(timerRelays, 'KT');

  if (emergencyBtns.length > 0) {
    emergencyBtns.forEach((b, idx) => {
      tagMap.set(b.id, idx === 0 ? '-S0' : `-S0${idx}`);
    });
  }

  if (stopBtns.length > 0) {
    stopBtns.forEach((b, idx) => {
      const tag = emergencyBtns.length === 0 && idx === 0 ? '-S0' : `-S1${idx > 0 ? idx : ''}`;
      tagMap.set(b.id, tag);
    });
  }

  if (startBtns.length > 0) {
    startBtns.forEach((b, idx) => {
      const offset = (emergencyBtns.length > 0 ? 1 : 0) + (stopBtns.length > 0 ? stopBtns.length : 0);
      tagMap.set(b.id, `-S${offset + 1 + idx}`);
    });
  }

  assignCategory(motors, 'M');
  if (powerSource) tagMap.set(powerSource.id, '-X1');

  return tagMap;
}

// ============================================================================
// 2. NETLIST & EQUIPOTENTIAL NET GRAPH (UNION-FIND)
// ============================================================================
export function buildElectricalNetGraph(components, wires, powerSource) {
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

  // Internal component shortings (e.g. top and bottom terminal screws on pushbuttons)
  components.forEach((c) => {
    if (c.type === 'button_stop' || c.type === 'button_emergency') {
      union(`${c.id}:11`, `${c.id}:11_bot`);
      union(`${c.id}:12`, `${c.id}:12_bot`);
    }
    if (c.type === 'button_start') {
      union(`${c.id}:13`, `${c.id}:13_bot`);
      union(`${c.id}:14`, `${c.id}:14_bot`);
    }
  });

  // External wires on workbench
  wires.forEach((w) => {
    union(`${w.fromComponent}:${w.fromTerminal}`, `${w.toComponent}:${w.toTerminal}`);
  });

  const areConnected = (c1Id, t1, c2Id, t2) => {
    if (!c1Id || !c2Id) return false;
    return find(`${c1Id}:${t1}`) === find(`${c2Id}:${t2}`);
  };

  const isTerminalOnNet = (cId, tId, sourceTermId) => {
    if (!powerSource || !cId) return false;
    return areConnected(cId, tId, powerSource.id, sourceTermId);
  };

  const hasWire = (cId, tId) => {
    if (!cId) return false;
    return wires.some(
      (w) =>
        (w.fromComponent === cId && w.fromTerminal === tId) ||
        (w.toComponent === cId && w.toTerminal === tId)
    );
  };

  return {
    find,
    areConnected,
    isTerminalOnNet,
    hasWire,
  };
}

// ============================================================================
// 3. COMPONENT DECOMPOSITION INTO ELECTRICAL PRIMITIVES
// Deconstructs physical monolithic workbench components into atomic IEC symbols
// ============================================================================
export function decomposeComponent(comp, tagMap, netGraph) {
  const tag = tagMap.get(comp.id) || comp.tag || '';
  const primitives = [];

  switch (comp.type) {
    case 'contactor':
      // 1. Power main contacts (1-2, 3-4, 5-6)
      primitives.push({
        id: `${comp.id}_power`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'POWER_CONTACT_3P',
        domain: 'POWER',
        terminals: [
          { in: '1', out: '2' },
          { in: '3', out: '4' },
          { in: '5', out: '6' },
        ],
        isClosed: Boolean(comp.state?.energized),
        hasWires: ['1', '2', '3', '4', '5', '6'].some((t) => netGraph.hasWire(comp.id, t)),
      });

      // 2. Aux Contact NA (13-14)
      primitives.push({
        id: `${comp.id}_aux_no`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'AUX_CONTACT_NO',
        domain: 'CONTROL',
        terminals: { in: '13', out: '14' },
        isClosed: Boolean(comp.state?.energized),
        hasWires: netGraph.hasWire(comp.id, '13') || netGraph.hasWire(comp.id, '14'),
      });

      // 3. Aux Contact NF (21-22)
      primitives.push({
        id: `${comp.id}_aux_nc`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'AUX_CONTACT_NC',
        domain: 'CONTROL',
        terminals: { in: '21', out: '22' },
        isClosed: !comp.state?.energized,
        hasWires: netGraph.hasWire(comp.id, '21') || netGraph.hasWire(comp.id, '22'),
      });

      // 4. Electromagnetic Coil (A1-A2)
      primitives.push({
        id: `${comp.id}_coil`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'COIL_CONTACTOR',
        domain: 'CONTROL',
        terminals: { in: 'A1', out: 'A2' },
        isEnergized: Boolean(comp.state?.energized),
        hasWires: netGraph.hasWire(comp.id, 'A1') || netGraph.hasWire(comp.id, 'A2'),
      });
      break;

    case 'thermal_relay':
      // 1. Power bimetal heaters (1-2, 3-4, 5-6)
      primitives.push({
        id: `${comp.id}_power`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'OVERLOAD_TRIP_3P',
        domain: 'POWER',
        terminals: [
          { in: '1', out: '2' },
          { in: '3', out: '4' },
          { in: '5', out: '6' },
        ],
        hasWires: ['1', '2', '3', '4', '5', '6'].some((t) => netGraph.hasWire(comp.id, t)),
      });

      // 2. Auxiliary Trip Contact NF (95-96)
      primitives.push({
        id: `${comp.id}_aux_nc`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'AUX_CONTACT_NC_THERMAL',
        domain: 'CONTROL',
        terminals: { in: '95', out: '96' },
        isClosed: !comp.state?.tripped,
        hasWires: netGraph.hasWire(comp.id, '95') || netGraph.hasWire(comp.id, '96'),
      });
      break;

    case 'circuit_breaker':
      primitives.push({
        id: `${comp.id}_power`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'BREAKER_CONTACT_3P',
        domain: 'POWER',
        rating: `${comp.state?.curve || 'C'}${comp.state?.current || 25}A`,
        terminals: [
          { in: '1', out: '2' },
          { in: '3', out: '4' },
          { in: '5', out: '6' },
        ],
        isClosed: comp.state?.closed !== false,
        hasWires: ['1', '2', '3', '4', '5', '6'].some((t) => netGraph.hasWire(comp.id, t)),
      });
      break;

    case 'timer_relay':
      // 1. Timer coil (A1-A2)
      primitives.push({
        id: `${comp.id}_coil`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'COIL_TIMER',
        domain: 'CONTROL',
        terminals: { in: 'A1', out: 'A2' },
        isEnergized: Boolean(comp.state?.energized),
        hasWires: netGraph.hasWire(comp.id, 'A1') || netGraph.hasWire(comp.id, 'A2'),
      });

      // 2. Timed Contact NF (15-16)
      primitives.push({
        id: `${comp.id}_timed_nc`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'TIMED_CONTACT_NC',
        domain: 'CONTROL',
        terminals: { in: '15', out: '16' },
        hasWires: netGraph.hasWire(comp.id, '15') || netGraph.hasWire(comp.id, '16'),
      });

      // 3. Timed Contact NA (15-18)
      primitives.push({
        id: `${comp.id}_timed_no`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'TIMED_CONTACT_NO',
        domain: 'CONTROL',
        terminals: { in: '15', out: '18' },
        hasWires: netGraph.hasWire(comp.id, '15') || netGraph.hasWire(comp.id, '18'),
      });
      break;

    case 'button_emergency':
      primitives.push({
        id: `${comp.id}_contact`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'BUTTON_EMERGENCY_NC',
        domain: 'CONTROL',
        terminals: { in: '11', out: '12' },
        isClosed: !comp.state?.pressed,
        hasWires: netGraph.hasWire(comp.id, '11') || netGraph.hasWire(comp.id, '12'),
      });
      break;

    case 'button_stop':
      primitives.push({
        id: `${comp.id}_contact`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'BUTTON_STOP_NC',
        domain: 'CONTROL',
        terminals: { in: '11', out: '12' },
        isClosed: !comp.state?.pressed,
        hasWires: netGraph.hasWire(comp.id, '11') || netGraph.hasWire(comp.id, '12'),
      });
      break;

    case 'button_start':
      primitives.push({
        id: `${comp.id}_contact`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'BUTTON_START_NO',
        domain: 'CONTROL',
        terminals: { in: '13', out: '14' },
        isClosed: Boolean(comp.state?.pressed),
        hasWires: netGraph.hasWire(comp.id, '13') || netGraph.hasWire(comp.id, '14'),
      });
      break;

    case 'motor_6p':
      primitives.push({
        id: `${comp.id}_motor`,
        compId: comp.id,
        compType: comp.type,
        tag,
        primitiveType: 'MOTOR_3P',
        domain: 'POWER',
        isRunning: Boolean(comp.state?.running),
        terminals: ['U1', 'V1', 'W1', 'W2', 'U2', 'V2', 'PE'],
        hasWires: ['U1', 'V1', 'W1'].some((t) => netGraph.hasWire(comp.id, t)),
        hasStarJumper:
          netGraph.areConnected(comp.id, 'W2', comp.id, 'U2') &&
          netGraph.areConnected(comp.id, 'U2', comp.id, 'V2'),
        hasDeltaJumpers:
          netGraph.areConnected(comp.id, 'U1', comp.id, 'W2') &&
          netGraph.areConnected(comp.id, 'V1', comp.id, 'U2') &&
          netGraph.areConnected(comp.id, 'W1', comp.id, 'V2'),
      });
      break;

    default:
      break;
  }

  return primitives;
}

// ============================================================================
// 4. POWER CIRCUIT TOPOLOGY SYNTHESIS (CIRCUITO DE FORÇA)
// ============================================================================
export function synthesizePowerCircuit(components, wires, powerSource, tagMap, netGraph) {
  if (!powerSource) return null;

  const breakerComp = components.find((c) => c.type === 'circuit_breaker');
  const contactors = components.filter((c) => c.type === 'contactor');
  const thermalComp = components.find((c) => c.type === 'thermal_relay');
  const motorComp = components.find((c) => c.type === 'motor_6p');

  // Check if breaker is in the power lines
  const isBreakerInPower =
    breakerComp &&
    (netGraph.hasWire(breakerComp.id, '1') ||
      netGraph.hasWire(breakerComp.id, '2') ||
      netGraph.isTerminalOnNet(breakerComp.id, '1', 'L1'));

  // Classify contactors in power path
  let mainK = null;
  let deltaK = null;
  let starK = null;

  contactors.forEach((k) => {
    // Star jumper on 1-3-5
    const isStarShorted =
      (netGraph.areConnected(k.id, '1', k.id, '3') && netGraph.areConnected(k.id, '3', k.id, '5')) ||
      (netGraph.hasWire(k.id, '1') && netGraph.hasWire(k.id, '3') && netGraph.areConnected(k.id, '1', k.id, '3'));

    if (isStarShorted) {
      starK = k;
      return;
    }

    // Output directed towards motor U1, V1, W1
    const outToU1V1W1 =
      motorComp &&
      (netGraph.areConnected(k.id, '2', motorComp.id, 'U1') ||
        (thermalComp &&
          netGraph.areConnected(k.id, '2', thermalComp.id, '1') &&
          netGraph.areConnected(thermalComp.id, '2', motorComp.id, 'U1')) ||
        netGraph.hasWire(k.id, '2'));

    // Output directed towards motor W2, U2, V2
    const outToW2U2V2 =
      motorComp &&
      (netGraph.areConnected(k.id, '2', motorComp.id, 'W2') ||
        netGraph.areConnected(k.id, '4', motorComp.id, 'U2') ||
        netGraph.areConnected(k.id, '6', motorComp.id, 'V2'));

    if (outToW2U2V2 && !outToU1V1W1) {
      deltaK = k;
    } else if (!mainK) {
      mainK = k;
    } else if (!deltaK && contactors.length > 1) {
      deltaK = k;
    }
  });

  const isThermalInPower =
    thermalComp &&
    (netGraph.hasWire(thermalComp.id, '1') ||
      netGraph.hasWire(thermalComp.id, '2') ||
      (motorComp && netGraph.areConnected(thermalComp.id, '2', motorComp.id, 'U1')));

  const isMotorInPower =
    motorComp &&
    (netGraph.hasWire(motorComp.id, 'U1') ||
      netGraph.hasWire(motorComp.id, 'V1') ||
      netGraph.hasWire(motorComp.id, 'W1'));

  const hasMotorStarJumper =
    motorComp &&
    netGraph.areConnected(motorComp.id, 'W2', motorComp.id, 'U2') &&
    netGraph.areConnected(motorComp.id, 'U2', motorComp.id, 'V2');

  const hasMotorDeltaJumpers =
    motorComp &&
    netGraph.areConnected(motorComp.id, 'U1', motorComp.id, 'W2') &&
    netGraph.areConnected(motorComp.id, 'V1', motorComp.id, 'U2') &&
    netGraph.areConnected(motorComp.id, 'W1', motorComp.id, 'V2');

  return {
    q1: isBreakerInPower ? breakerComp : null,
    mainK: mainK || contactors[0] || null,
    deltaK,
    starK,
    ft1: isThermalInPower ? thermalComp : null,
    m1: isMotorInPower ? motorComp : null,
    hasMotorStarJumper,
    hasMotorDeltaJumpers,
    isGroundConnected: motorComp ? netGraph.isTerminalOnNet(motorComp.id, 'PE', 'PE') : false,
  };
}

// ============================================================================
// 5. CONTROL LADDER CIRCUIT TOPOLOGY SYNTHESIS (CIRCUITO DE COMANDO)
// ============================================================================
export function synthesizeControlCircuit(components, wires, powerSource, tagMap, netGraph) {
  if (!powerSource) return null;

  const l1Net = netGraph.find(`${powerSource.id}:L1`);
  const emergencyBtn = components.find((c) => c.type === 'button_emergency');
  const stopBtn = components.find((c) => c.type === 'button_stop');
  const startBtn = components.find((c) => c.type === 'button_start');
  const thermalComp = components.find((c) => c.type === 'thermal_relay');
  const timerComp = components.find((c) => c.type === 'timer_relay');
  const contactors = components.filter((c) => c.type === 'contactor');

  // Series safety elements
  const hasEmergency =
    emergencyBtn &&
    (netGraph.find(`${emergencyBtn.id}:11`) === l1Net ||
      netGraph.find(`${emergencyBtn.id}:12`) === l1Net ||
      netGraph.hasWire(emergencyBtn.id, '11') ||
      netGraph.hasWire(emergencyBtn.id, '12'));

  const hasThermalControl =
    thermalComp &&
    ((netGraph.hasWire(thermalComp.id, '95') && netGraph.hasWire(thermalComp.id, '96')) ||
      netGraph.find(`${thermalComp.id}:95`) === l1Net ||
      (emergencyBtn && netGraph.areConnected(emergencyBtn.id, '12', thermalComp.id, '95')));

  const hasStop = stopBtn && (netGraph.hasWire(stopBtn.id, '11') || netGraph.hasWire(stopBtn.id, '12'));
  const hasStart = startBtn && (netGraph.hasWire(startBtn.id, '13') || netGraph.hasWire(startBtn.id, '14'));

  const mainK = contactors[0];
  const hasSeal =
    mainK &&
    startBtn &&
    ((netGraph.areConnected(mainK.id, '13', startBtn.id, '13') &&
      netGraph.areConnected(mainK.id, '14', startBtn.id, '14')) ||
      (netGraph.areConnected(mainK.id, '13', startBtn.id, '14') &&
        netGraph.areConnected(mainK.id, '14', startBtn.id, '13')) ||
      (netGraph.hasWire(mainK.id, '13') && netGraph.hasWire(mainK.id, '14')));

  // Active rungs
  const activeRungs = [];

  // Rung 1: Main Contactor K1
  if (mainK) {
    let interlockComp = null;
    contactors.forEach((otherK) => {
      if (otherK.id !== mainK.id) {
        if (
          netGraph.areConnected(otherK.id, '22', mainK.id, 'A1') ||
          netGraph.areConnected(otherK.id, '21', mainK.id, 'A1')
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
      tag: tagMap.get(mainK.id) || '-K1',
      hasSafetyTrunk: true,
      hasStartAndSeal: Boolean(hasStart),
      hasSeal: Boolean(hasSeal),
      startBtn,
      interlock: interlockComp
        ? { comp: interlockComp, tag: tagMap.get(interlockComp.id) || '-K2', terms: '21-22' }
        : null,
      coilComp: mainK,
      coilTag: tagMap.get(mainK.id) || '-K1',
      isEnergized: Boolean(mainK.state?.energized),
    });
  }

  // Rung 2: Timer KT1
  if (
    timerComp &&
    (netGraph.hasWire(timerComp.id, 'A1') ||
      netGraph.hasWire(timerComp.id, 'A2') ||
      netGraph.isTerminalOnNet(timerComp.id, 'A2', 'N'))
  ) {
    activeRungs.push({
      id: `rung-${timerComp.id}`,
      type: 'TIMER',
      title: 'Temporizador de Transição',
      comp: timerComp,
      tag: tagMap.get(timerComp.id) || '-KT1',
      coilComp: timerComp,
      coilTag: tagMap.get(timerComp.id) || '-KT1',
      isEnergized: Boolean(timerComp.state?.energized),
    });
  }

  // Secondary contactors (Star K3 / Delta K2 / Reversing K2)
  const otherContactors = contactors.filter((k) => k.id !== mainK?.id);
  otherContactors.forEach((secK, sIdx) => {
    const isSecWired =
      netGraph.hasWire(secK.id, 'A1') ||
      netGraph.hasWire(secK.id, 'A2') ||
      netGraph.isTerminalOnNet(secK.id, 'A2', 'N');

    if (isSecWired || otherContactors.length <= 2) {
      let timedContact = null;
      let interlockComp = null;

      if (timerComp) {
        if (netGraph.areConnected(timerComp.id, '16', secK.id, 'A1')) {
          timedContact = { comp: timerComp, tag: tagMap.get(timerComp.id) || '-KT1', terms: '15-16', type: 'NC', label: 'NF' };
        } else if (netGraph.areConnected(timerComp.id, '18', secK.id, 'A1')) {
          timedContact = { comp: timerComp, tag: tagMap.get(timerComp.id) || '-KT1', terms: '15-18', type: 'NO', label: 'NA' };
        }
      }

      contactors.forEach((otherK) => {
        if (otherK.id !== secK.id) {
          if (
            netGraph.areConnected(otherK.id, '22', secK.id, 'A1') ||
            netGraph.areConnected(otherK.id, '21', secK.id, 'A1')
          ) {
            interlockComp = otherK;
            if (timerComp) {
              if (netGraph.areConnected(timerComp.id, '16', otherK.id, '21') || netGraph.areConnected(timerComp.id, '16', otherK.id, '22')) {
                timedContact = { comp: timerComp, tag: tagMap.get(timerComp.id) || '-KT1', terms: '15-16', type: 'NC', label: 'NF' };
              } else if (netGraph.areConnected(timerComp.id, '18', otherK.id, '21') || netGraph.areConnected(timerComp.id, '18', otherK.id, '22')) {
                timedContact = { comp: timerComp, tag: tagMap.get(timerComp.id) || '-KT1', terms: '15-18', type: 'NO', label: 'NA' };
              }
            }
          }
        }
      });

      if (!timedContact && timerComp) {
        if (sIdx === 0 && otherContactors.length >= 2) {
          timedContact = { comp: timerComp, tag: tagMap.get(timerComp.id) || '-KT1', terms: '15-18', type: 'NO', label: 'NA' };
        } else if (sIdx === 1) {
          timedContact = { comp: timerComp, tag: tagMap.get(timerComp.id) || '-KT1', terms: '15-16', type: 'NC', label: 'NF' };
        }
      }

      const isStar = timedContact?.terms === '15-16' || secK.tag === 'K3' || sIdx === 1;
      const isDelta = timedContact?.terms === '15-18' || secK.tag === 'K2' || sIdx === 0;

      activeRungs.push({
        id: `rung-${secK.id}`,
        type: isStar ? 'STAR' : isDelta ? 'DELTA' : 'SECONDARY',
        title: isStar ? 'Comando Estrela (Y)' : isDelta ? 'Comando Triângulo (Δ)' : `Comando ${tagMap.get(secK.id)}`,
        comp: secK,
        tag: tagMap.get(secK.id) || `-K${sIdx + 2}`,
        timedContact,
        interlock: interlockComp
          ? { comp: interlockComp, tag: tagMap.get(interlockComp.id) || '-K1', terms: '21-22' }
          : null,
        coilComp: secK,
        coilTag: tagMap.get(secK.id) || `-K${sIdx + 2}`,
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
}

// ============================================================================
// 6. DXF (AUTOCAD DRAWING EXCHANGE FORMAT) EXPORT ENGINE
// Generates standard ASCII DXF compatible with AutoCAD, LibreCAD, QCad
// ============================================================================
export function generateSchematicDXF(powerAnalysis, controlAnalysis, tagMap) {
  const lines = [];

  // DXF Header
  lines.push('0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '0', 'ENDSEC');

  // DXF Tables (Layers)
  lines.push('0', 'SECTION', '2', 'TABLES', '0', 'TABLE', '2', 'LAYER', '70', '4');
  // Layer POTENCIA (Red)
  lines.push('0', 'LAYER', '2', 'POTENCIA', '70', '0', '62', '1', '6', 'CONTINUOUS');
  // Layer COMANDO (Yellow/Green)
  lines.push('0', 'LAYER', '2', 'COMANDO', '70', '0', '62', '2', '6', 'CONTINUOUS');
  // Layer NEUTRO (Cyan)
  lines.push('0', 'LAYER', '2', 'NEUTRO', '70', '0', '62', '4', '6', 'CONTINUOUS');
  // Layer TEXTOS (White)
  lines.push('0', 'LAYER', '2', 'TEXTOS', '70', '0', '62', '7', '6', 'CONTINUOUS');
  lines.push('0', 'ENDTAB', '0', 'ENDSEC');

  // DXF Entities
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  const addLine = (x1, y1, x2, y2, layer = 'POTENCIA') => {
    // In DXF Y axis is upwards, so invert Y
    lines.push('0', 'LINE', '8', layer);
    lines.push('10', x1.toFixed(2), '20', (-y1).toFixed(2), '30', '0.0');
    lines.push('11', x2.toFixed(2), '21', (-y2).toFixed(2), '31', '0.0');
  };

  const addCircle = (cx, cy, r, layer = 'POTENCIA') => {
    lines.push('0', 'CIRCLE', '8', layer);
    lines.push('10', cx.toFixed(2), '20', (-cy).toFixed(2), '30', '0.0');
    lines.push('40', r.toFixed(2));
  };

  const addText = (text, x, y, height = 8, layer = 'TEXTOS') => {
    lines.push('0', 'TEXT', '8', layer);
    lines.push('10', x.toFixed(2), '20', (-y).toFixed(2), '30', '0.0');
    lines.push('40', height.toFixed(2));
    lines.push('1', text);
  };

  // 1. Power Circuit in DXF (left area x: 20 to 300)
  if (powerAnalysis) {
    addText('CIRCUITO DE POTENCIA (FORCA) - IEC 60617', 20, 20, 10, 'TEXTOS');
    // Busbars
    addLine(20, 40, 280, 40, 'POTENCIA');
    addText('L1', 10, 43, 7, 'TEXTOS');
    addLine(20, 55, 280, 55, 'POTENCIA');
    addText('L2', 10, 58, 7, 'TEXTOS');
    addLine(20, 70, 280, 70, 'POTENCIA');
    addText('L3', 10, 73, 7, 'TEXTOS');
    addLine(20, 85, 280, 85, 'POTENCIA');
    addText('PE', 10, 88, 7, 'TEXTOS');

    // Drops to Q1 / K1
    const pX = [70, 110, 150];
    pX.forEach((x, idx) => {
      addLine(x, 40 + idx * 15, x, 120, 'POTENCIA');
      addCircle(x, 40 + idx * 15, 3, 'POTENCIA');
      addLine(x, 120, x, 220, 'POTENCIA');
      addLine(x, 220, x, 340, 'POTENCIA');
      addLine(x, 340, x, 460, 'POTENCIA');
    });

    if (powerAnalysis.q1) {
      addText('-Q1', 25, 140, 8, 'TEXTOS');
    }
    if (powerAnalysis.mainK) {
      addText(tagMap.get(powerAnalysis.mainK.id) || '-K1', 25, 240, 8, 'TEXTOS');
    }
    if (powerAnalysis.ft1) {
      addText(tagMap.get(powerAnalysis.ft1.id) || '-F1', 25, 360, 8, 'TEXTOS');
    }
    if (powerAnalysis.m1) {
      addCircle(110, 510, 35, 'POTENCIA');
      addText('M 3~', 100, 513, 10, 'TEXTOS');
      addText(tagMap.get(powerAnalysis.m1.id) || '-M1', 50, 510, 8, 'TEXTOS');
    }
  }

  // 2. Control Circuit in DXF (right area x: 340 to 750)
  if (controlAnalysis) {
    addText('CIRCUITO DE COMANDO (CONTROLE) - IEC 60617', 350, 20, 10, 'TEXTOS');
    // Top Phase rail
    addLine(340, 40, 750, 40, 'COMANDO');
    addText('L1 (220V)', 320, 43, 7, 'TEXTOS');

    // Bottom Neutral rail
    addLine(340, 600, 750, 600, 'NEUTRO');
    addText('N (0V)', 320, 603, 7, 'NEUTRO');

    const rungs = controlAnalysis.rungs || [];
    const rSpacing = 110;
    const rStartX = 390;

    // Horizontal distribution bar
    if (rungs.length > 1) {
      addLine(rStartX, 320, rStartX + (rungs.length - 1) * rSpacing, 320, 'COMANDO');
    }

    rungs.forEach((rung, idx) => {
      const rx = rStartX + idx * rSpacing;
      addText(`Col ${idx + 1}: ${rung.tag}`, rx - 20, 30, 6, 'TEXTOS');

      if (idx === 0) {
        // Main rung drop
        addLine(rx, 40, rx, 320, 'COMANDO');
      }

      addLine(rx, 320, rx, 400, 'COMANDO');

      // Coil Box
      addLine(rx - 15, 400, rx + 15, 400, 'COMANDO');
      addLine(rx + 15, 400, rx + 15, 430, 'COMANDO');
      addLine(rx + 15, 430, rx - 15, 430, 'COMANDO');
      addLine(rx - 15, 430, rx - 15, 400, 'COMANDO');
      addText(rung.coilTag, rx - 10, 420, 8, 'TEXTOS');

      // Coil to Neutral
      addLine(rx, 430, rx, 600, 'NEUTRO');
      addCircle(rx, 600, 2.5, 'NEUTRO');
    });
  }

  // DXF Footer
  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\n');
}
