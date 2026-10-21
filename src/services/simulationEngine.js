// Electrical simulation engine for command and power circuits

export function evaluateCircuit(components, wires, previousEnergizedStates = new Map()) {
  // Deep clone components to mutate state cleanly with hysteresis memory
  const compMap = new Map();
  for (const c of components) {
    const wasEnergized =
      c.type === 'contactor' || c.type === 'timer_relay' || c.type === 'contactor_coil'
        ? (previousEnergizedStates.get(c.id) ?? Boolean(c.state?.energized))
        : Boolean(c.state?.energized);

    compMap.set(c.id, {
      ...c,
      state: {
        ...c.state,
        energized: wasEnergized,
      },
    });
  }

  // We run an iterative fixpoint loop because contactor state changes its contacts,
  // which might change coil energization (e.g. self-latching seal / selo 13-14).
  let coilChanged = true;
  let iterations = 0;
  const MAX_ITERATIONS = 12;

  let finalNetMap = new Map();
  let finalTerminalVoltages = new Map();
  let finalNets = [];
  let shortCircuit = false;
  let shortCircuitDetails = null;
  const shortedWireIds = new Set();
  const trippedBreakerIds = new Set();

  while (coilChanged && iterations < MAX_ITERATIONS) {
    iterations++;
    coilChanged = false;

    // 1. Build adjacency graph of connected terminals
    // Terminal key: `${compId}:${termId}`
    const adj = new Map();

    const addEdge = (t1, t2) => {
      if (!adj.has(t1)) adj.set(t1, new Set());
      if (!adj.has(t2)) adj.set(t2, new Set());
      adj.get(t1).add(t2);
      adj.get(t2).add(t1);
    };

    // Add external wires (supports terminal-to-terminal, wire-to-terminal, and wire-to-wire connections)
    for (const w of wires) {
      const wireKey = `wire:${w.id}`;
      const t1 = w.fromWireId
        ? `wire:${w.fromWireId}`
        : w.fromComponent && w.fromTerminal
        ? `${w.fromComponent}:${w.fromTerminal}`
        : null;
      const t2 = w.toWireId
        ? `wire:${w.toWireId}`
        : w.toComponent && w.toTerminal
        ? `${w.toComponent}:${w.toTerminal}`
        : null;

      if (t1) addEdge(wireKey, t1);
      if (t2) addEdge(wireKey, t2);
    }

    // Add internal component conductive paths based on their current state
    for (const comp of compMap.values()) {
      switch (comp.type) {
        case 'power_source': {
          // Terminais do mesmo barramento de alimentação são eletricamente conectados
          const barPrefixes = ['L1', 'L2', 'L3', 'N', 'PE'];
          for (const prefix of barPrefixes) {
            const barTerms = (comp.terminals || []).filter(
              (t) => t.id === prefix || t.id.startsWith(`${prefix}_`)
            );
            for (let i = 0; i < barTerms.length - 1; i++) {
              addEdge(`${comp.id}:${barTerms[i].id}`, `${comp.id}:${barTerms[i + 1].id}`);
            }
          }
          break;
        }

        case 'circuit_breaker': {
          const poles = Number(comp.state?.poles) || 3;
          if (comp.state?.closed) {
            addEdge(`${comp.id}:1`, `${comp.id}:2`);
            if (poles >= 2) addEdge(`${comp.id}:3`, `${comp.id}:4`);
            if (poles >= 3) addEdge(`${comp.id}:5`, `${comp.id}:6`);
          }
          break;
        }

        case 'breaker_3p':
          if (comp.state.closed) {
            addEdge(`${comp.id}:1`, `${comp.id}:2`);
            addEdge(`${comp.id}:3`, `${comp.id}:4`);
            addEdge(`${comp.id}:5`, `${comp.id}:6`);
          }
          break;

        case 'breaker_1p':
          if (comp.state.closed) {
            addEdge(`${comp.id}:1`, `${comp.id}:2`);
          }
          break;

        case 'contactor':
          if (comp.state.energized) {
            // Main power contacts close
            addEdge(`${comp.id}:1`, `${comp.id}:2`);
            addEdge(`${comp.id}:3`, `${comp.id}:4`);
            addEdge(`${comp.id}:5`, `${comp.id}:6`);
            // 13-14 (NO / NA) closes (SELO)
            addEdge(`${comp.id}:13`, `${comp.id}:14`);
          } else {
            // 21-22 (NC / NF) stays closed in resting state
            addEdge(`${comp.id}:21`, `${comp.id}:22`);
          }

          // Direct conductive coupling when docked/linked to Thermal Overload Relay
          if (comp.linkedRelayId) {
            addEdge(`${comp.id}:2`, `${comp.linkedRelayId}:1`);
            addEdge(`${comp.id}:4`, `${comp.linkedRelayId}:3`);
            addEdge(`${comp.id}:6`, `${comp.linkedRelayId}:5`);
          }
          break;

        case 'thermal_relay':
          // Power lines always conduct through bimetal strips
          addEdge(`${comp.id}:1`, `${comp.id}:2`);
          addEdge(`${comp.id}:3`, `${comp.id}:4`);
          addEdge(`${comp.id}:5`, `${comp.id}:6`);

          if (comp.state.tripped) {
            // 97-98 (NO / NA) closes on fault
            addEdge(`${comp.id}:97`, `${comp.id}:98`);
          } else {
            // 95-96 (NC / NF) conducts normally
            addEdge(`${comp.id}:95`, `${comp.id}:96`);
          }

          // Direct conductive coupling when docked/linked to Contactor
          if (comp.linkedContactorId) {
            addEdge(`${comp.linkedContactorId}:2`, `${comp.id}:1`);
            addEdge(`${comp.linkedContactorId}:4`, `${comp.id}:3`);
            addEdge(`${comp.linkedContactorId}:6`, `${comp.id}:5`);
          }
          break;

        case 'timer_relay': {
          // Relé Temporizador: the coil (A1-A2) is solved like a contactor coil, while the
          // changeover contacts depend on the elapsed-time flags managed by the App timer loop.
          //  - RE (ON_DELAY):  contacts switch only after the coil stays energized for T seconds
          //  - RD (OFF_DELAY): contacts switch instantly and return T seconds after de-energizing
          const mode = comp.state?.mode || 'ON_DELAY';
          const coil = Boolean(comp.state.energized);
          const outputActive =
            mode === 'OFF_DELAY'
              ? coil || Boolean(comp.state.holding)
              : coil && Boolean(comp.state.timedOut);
          comp.state.outputActive = outputActive;

          if (outputActive) {
            // 15-18 / 25-28 (NO / NA) close
            addEdge(`${comp.id}:15`, `${comp.id}:18`);
            addEdge(`${comp.id}:25`, `${comp.id}:28`);
          } else {
            // 15-16 / 25-26 (NC / NF) rest closed
            addEdge(`${comp.id}:15`, `${comp.id}:16`);
            addEdge(`${comp.id}:25`, `${comp.id}:26`);
          }
          break;
        }

        case 'button_stop':
        case 'button_emergency':
          // Top and bottom terminals are physically the same conductor in industrial contact blocks
          addEdge(`${comp.id}:11`, `${comp.id}:11_bot`);
          addEdge(`${comp.id}:11`, `${comp.id}:1`);
          addEdge(`${comp.id}:12`, `${comp.id}:12_bot`);
          addEdge(`${comp.id}:12`, `${comp.id}:2`);
          // Normally Closed (NC 11-12 / 1-2): conducts if NOT pressed
          if (!comp.state.pressed) {
            addEdge(`${comp.id}:11`, `${comp.id}:12`);
            addEdge(`${comp.id}:1`, `${comp.id}:2`);
          }
          break;

        case 'button_start':
          // Top and bottom terminals are physically the same conductor in industrial contact blocks
          addEdge(`${comp.id}:13`, `${comp.id}:13_bot`);
          addEdge(`${comp.id}:13`, `${comp.id}:3`);
          addEdge(`${comp.id}:14`, `${comp.id}:14_bot`);
          addEdge(`${comp.id}:14`, `${comp.id}:4`);
          // Normally Open (NO 13-14 / 3-4): conducts ONLY when pressed
          if (comp.state.pressed) {
            addEdge(`${comp.id}:13`, `${comp.id}:14`);
            addEdge(`${comp.id}:3`, `${comp.id}:4`);
          }
          break;

        case 'motor_6p':
          // Motor windings are inductive loads with impedance, not zero-ohm conductor shorts.
          // Inter-terminal connections (bridges / jumpers) are exclusively formed by user wiring.
          break;

        case 'led_green':
        case 'led_red':
        case 'led_yellow':
        case 'pilot_light':
        case 'pilot_lamp':
          // Loads do not short-circuit X1 to X2; they measure DDP across them
          break;

        default:
          break;
      }
    }

    // 2. Find connected components (equipotential networks)
    const visited = new Set();
    const nets = []; // array of sets of terminal keys

    for (const termKey of adj.keys()) {
      if (!visited.has(termKey)) {
        const net = new Set();
        const queue = [termKey];
        visited.add(termKey);

        while (queue.length > 0) {
          const curr = queue.shift();
          net.add(curr);
          const neighbors = adj.get(curr) || [];
          for (const nb of neighbors) {
            if (!visited.has(nb)) {
              visited.add(nb);
              queue.push(nb);
            }
          }
        }
        nets.push(net);
      }
    }

    // 3. Assign voltage potentials to each network from active power sources
    const terminalVoltages = new Map();
    const powerSources = Array.from(compMap.values()).filter(
      (c) => c.type === 'power_source' && c.state?.powered !== false
    );

    const sourceMap = {};
    for (const ps of powerSources) {
      const pEnabled = ps.state?.phasesEnabled || { L1: true, L2: true, L3: true };
      for (const t of ps.terminals || []) {
        if ((t.id === 'L1' || t.id.startsWith('L1_') || t.id === 'X1') && pEnabled.L1 !== false) {
          sourceMap[`${ps.id}:${t.id}`] = 'L1';
        } else if ((t.id === 'L2' || t.id.startsWith('L2_') || t.id === 'X2') && pEnabled.L2 !== false) {
          sourceMap[`${ps.id}:${t.id}`] = 'L2';
        } else if ((t.id === 'L3' || t.id.startsWith('L3_') || t.id === 'X3') && pEnabled.L3 !== false) {
          sourceMap[`${ps.id}:${t.id}`] = 'L3';
        } else if (t.id === 'N' || t.id.startsWith('N_') || t.id === 'X0') {
          sourceMap[`${ps.id}:${t.id}`] = 'N';
        } else if (t.id === 'PE' || t.id.startsWith('PE_')) {
          sourceMap[`${ps.id}:${t.id}`] = 'PE';
        }
      }
      // Garantir compatibilidade de fallback para identificadores padrão
      if (pEnabled.L1 !== false) {
        sourceMap[`${ps.id}:L1`] = 'L1';
        sourceMap[`${ps.id}:X1`] = 'L1';
      }
      if (pEnabled.L2 !== false) {
        sourceMap[`${ps.id}:L2`] = 'L2';
        sourceMap[`${ps.id}:X2`] = 'L2';
      }
      if (pEnabled.L3 !== false) {
        sourceMap[`${ps.id}:L3`] = 'L3';
        sourceMap[`${ps.id}:X3`] = 'L3';
      }
      sourceMap[`${ps.id}:N`] = 'N';
      sourceMap[`${ps.id}:X0`] = 'N';
      sourceMap[`${ps.id}:PE`] = 'PE';
    }

    if (powerSources.length > 0) {
      for (const net of nets) {
        const potentialsFound = new Set();
        for (const term of net) {
          if (sourceMap[term]) {
            potentialsFound.add(sourceMap[term]);
          }
        }

        // Check for direct short circuits:
        // - Phase to Neutral (L1/L2/L3 with N)
        // - Phase to Phase (two or more of L1, L2, L3)
        // - Phase to Ground (L1/L2/L3 with PE)
        const phases = ['L1', 'L2', 'L3'].filter((p) => potentialsFound.has(p));
        const hasNeutral = potentialsFound.has('N');
        const hasPE = potentialsFound.has('PE');

        const isPhasePhaseShort = phases.length > 1;
        const isPhaseNeutralShort = phases.length >= 1 && hasNeutral;
        const isPhaseGroundShort = phases.length >= 1 && hasPE;

        if (isPhasePhaseShort || isPhaseNeutralShort || isPhaseGroundShort) {
          shortCircuit = true;

          let description = '';
          let faultType = 'CURTO_CIRCUITO';

          if (isPhaseNeutralShort) {
            faultType = 'FASE_NEUTRO';
            description = `Curto-circuito direto entre Fase (${phases.join('/')}) e Neutro (N)! Sobrecarga instantânea.`;
          } else if (isPhasePhaseShort) {
            faultType = 'FASE_FASE';
            description = `Curto-circuito bifásico entre as fases (${phases.join(' e ')})! Corrente de curto extrema.`;
          } else if (isPhaseGroundShort) {
            faultType = 'FASE_TERRA';
            description = `Falta direta para a terra entre Fase (${phases.join('/')}) e Terra (PE)!`;
          }

          // Track which wires are in this shorted circuit
          for (const term of net) {
            if (term.startsWith('wire:')) {
              shortedWireIds.add(term.replace('wire:', ''));
            }
          }

          // Check if any closed circuit breakers are in the path of this short-circuit current.
          // If the fault is upstream/before the breaker (e.g. between power source terminals or on
          // breaker line terminals 1/3/5), current does not pass through the breaker poles, so the
          // breaker cannot trip (unprotected short circuit).
          for (const comp of compMap.values()) {
            if (
              (comp.type === 'breaker_3p' ||
                comp.type === 'breaker_1p' ||
                comp.type === 'circuit_breaker') &&
              comp.state?.closed
            ) {
              const hasBreakerTerminal = Array.from(net).some((t) => t.startsWith(`${comp.id}:`));
              if (hasBreakerTerminal) {
                // Determine internal pole edges of this breaker
                const poles = comp.type === 'breaker_1p' ? 1 : Number(comp.state?.poles) || 3;
                const internalEdges = new Set();
                const addPole = (t1, t2) => {
                  internalEdges.add(`${t1}---${t2}`);
                  internalEdges.add(`${t2}---${t1}`);
                };
                addPole(`${comp.id}:1`, `${comp.id}:2`);
                if (poles >= 2) addPole(`${comp.id}:3`, `${comp.id}:4`);
                if (poles >= 3) addPole(`${comp.id}:5`, `${comp.id}:6`);

                // Group source terminals in this net by their conflicting potentials
                const sourcesByPot = {};
                for (const t of net) {
                  const pot = sourceMap[t];
                  if (pot && potentialsFound.has(pot)) {
                    if (!sourcesByPot[pot]) sourcesByPot[pot] = [];
                    sourcesByPot[pot].push(t);
                  }
                }

                const potList = Object.keys(sourcesByPot);
                let shortExistsWithoutBreaker = false;

                // Check if any pair of conflicting potentials is connected WITHOUT using this breaker's poles
                if (potList.length >= 2) {
                  for (let i = 0; i < potList.length && !shortExistsWithoutBreaker; i++) {
                    for (let j = i + 1; j < potList.length && !shortExistsWithoutBreaker; j++) {
                      const startNodes = sourcesByPot[potList[i]];
                      const targetNodes = new Set(sourcesByPot[potList[j]]);
                      const q = [...startNodes];
                      const vis = new Set(startNodes);

                      while (q.length > 0) {
                        const curr = q.shift();
                        if (targetNodes.has(curr)) {
                          shortExistsWithoutBreaker = true;
                          break;
                        }
                        const neighbors = adj.get(curr) || [];
                        for (const nb of neighbors) {
                          if (internalEdges.has(`${curr}---${nb}`)) continue;
                          if (!vis.has(nb)) {
                            vis.add(nb);
                            q.push(nb);
                          }
                        }
                      }
                    }
                  }
                }

                // If the short requires traversing this breaker's closed contacts, then the breaker trips!
                // If the short exists WITHOUT the breaker (e.g. before the breaker), the breaker does NOT trip!
                if (!shortExistsWithoutBreaker) {
                  trippedBreakerIds.add(comp.id);
                }
              }
            }
          }

          if (trippedBreakerIds.size === 0) {
            description += ' ⚠️ Curto-circuito SEM PROTEÇÃO (a montante/antes do disjuntor)!';
          }

          shortCircuitDetails = {
            type: faultType,
            description,
            potentials: Array.from(potentialsFound),
            shortedWireIds: Array.from(shortedWireIds),
            trippedBreakerIds: Array.from(trippedBreakerIds),
          };
        }

        const primaryPotential = Array.from(potentialsFound)[0] || null;
        for (const term of net) {
          terminalVoltages.set(term, primaryPotential);
        }
      }
    }

    // 4. Evaluate Contactor K1 coil state and standalone coils
    for (const comp of compMap.values()) {
      if (comp.type === 'contactor' || comp.type === 'timer_relay' || comp.type === 'contactor_coil') {
        const vA1 = terminalVoltages.get(`${comp.id}:A1`);
        const vA2 = terminalVoltages.get(`${comp.id}:A2`);

        // Coil needs an AC difference of potential (e.g. L1 and N, or L1 and L2, etc.)
        const hasValidDDP =
          Boolean(vA1) &&
          Boolean(vA2) &&
          vA1 !== vA2 &&
          vA1 !== 'PE' &&
          vA2 !== 'PE';

        if (comp.state.energized !== hasValidDDP) {
          comp.state.energized = hasValidDDP;
          coilChanged = true;
        }
      }
    }

    // Synchronize state between standalone contactor_coil and contactor power contacts
    const allCoils = Array.from(compMap.values()).filter((c) => c.type === 'contactor_coil');
    for (const coil of allCoils) {
      const coilTagClean = (coil.tag || '').toUpperCase().replace(/^KM/, 'K');
      for (const comp of compMap.values()) {
        if (comp.type === 'contactor') {
          const compTagClean = (comp.tag || '').toUpperCase().replace(/^KM/, 'K');
          if (compTagClean === coilTagClean || comp.tag === coil.tag) {
            if (comp.state.energized !== coil.state.energized) {
              comp.state.energized = coil.state.energized;
              coilChanged = true;
            }
          }
        }
      }
    }

    finalNetMap = adj;
    finalTerminalVoltages = terminalVoltages;
    finalNets = nets;
  }

  // 5. Evaluate loads (LEDs and Motor)
  for (const comp of compMap.values()) {
    // LEDs / Pilot Lights
    if (
      comp.type === 'led_green' ||
      comp.type === 'led_red' ||
      comp.type === 'led_yellow' ||
      comp.type === 'pilot_light' ||
      comp.type === 'pilot_lamp'
    ) {
      const vX1 = finalTerminalVoltages.get(`${comp.id}:X1`);
      const vX2 = finalTerminalVoltages.get(`${comp.id}:X2`);

      const isLit =
        Boolean(vX1) &&
        Boolean(vX2) &&
        vX1 !== vX2 &&
        vX1 !== 'PE' &&
        vX2 !== 'PE';

      comp.state.lit = isLit;
    }

    // Three-phase 6-terminal Motor - Physical Electromechanical & Electromagnetic Model
    if (comp.type === 'motor_6p') {
      const wasRunning = Boolean(comp.state?.running && (comp.state?.rpm ?? 0) > 100);

      // 1. Identify active power source voltages
      const activeSource = Array.from(compMap.values()).find(
        (c) => c.type === 'power_source' && c.state?.powered !== false
      );
      const vPhaseSetting = activeSource?.state?.vPhase || 220;

      // Complex phasor helpers: { r, i }
      const cAdd = (a, b) => ({ r: a.r + b.r, i: a.i + b.i });
      const cSub = (a, b) => ({ r: a.r - b.r, i: a.i - b.i });
      const cScale = (a, s) => ({ r: a.r * s, i: a.i * s });
      const cMag = (a) => Math.hypot(a.r, a.i);

      const SQRT3_2 = Math.sqrt(3) / 2;
      const phasePhasors = {
        L1: { r: vPhaseSetting, i: 0 },
        L2: { r: -0.5 * vPhaseSetting, i: -SQRT3_2 * vPhaseSetting },
        L3: { r: -0.5 * vPhaseSetting, i: SQRT3_2 * vPhaseSetting },
        N: { r: 0, i: 0 },
        PE: { r: 0, i: 0 },
      };

      // 2. Identify the net containing each terminal
      const termKeys = ['U1', 'U2', 'V1', 'V2', 'W1', 'W2'];
      const getNetOf = (tId) => finalNets.find((net) => net.has(`${comp.id}:${tId}`));
      const inSameNet = (tA, tB) => {
        const nA = getNetOf(tA);
        const nB = getNetOf(tB);
        return Boolean(nA && nB && nA === nB);
      };

      // Find external source connected to each terminal's net (if any)
      const getSourcePotential = (tId) => {
        const net = getNetOf(tId);
        if (!net) return null;
        for (const node of net) {
          const v = finalTerminalVoltages.get(node);
          if (v && phasePhasors[v]) return v;
        }
        return null;
      };

      const srcU1 = getSourcePotential('U1');
      const srcU2 = getSourcePotential('U2');
      const srcV1 = getSourcePotential('V1');
      const srcV2 = getSourcePotential('V2');
      const srcW1 = getSourcePotential('W1');
      const srcW2 = getSourcePotential('W2');

      // Detect closing topologies (Pontes de Fechamento reais)
      // Estrela (Y): W2, U2, V2 interligados (ou U1, V1, W1 interligados)
      const isStarWired =
        (inSameNet('W2', 'U2') && inSameNet('U2', 'V2')) ||
        (inSameNet('W2', 'V2') && inSameNet('U2', 'V2')) ||
        (inSameNet('W2', 'U2') && inSameNet('W2', 'V2')) ||
        (inSameNet('W1', 'U1') && inSameNet('U1', 'V1'));

      // Triângulo (Δ): U1-W2, V1-U2, W1-V2 interligados
      const isDeltaWired =
        inSameNet('U1', 'W2') &&
        inSameNet('V1', 'U2') &&
        inSameNet('W1', 'V2');

      const detectedConnection = isStarWired
        ? 'Y'
        : isDeltaWired
        ? 'DELTA'
        : 'NONE';

      // 3. Solve Nodal Potentials for each of the 6 terminals:
      // The 3 windings are independent: U1-U2, V1-V2, W1-W2.
      const coilPairs = [
        { id: 'U', t1: 'U1', t2: 'U2' },
        { id: 'V', t1: 'V1', t2: 'V2' },
        { id: 'W', t1: 'W1', t2: 'W2' },
      ];

      const nodePhasor = {};

      // First pass: assign known source phasors where available
      for (const tId of termKeys) {
        const src = getSourcePotential(tId);
        if (src) {
          nodePhasor[tId] = phasePhasors[src];
        }
      }

      // Second pass: group terminals that are bridged together into external nets
      const motorNets = [];
      const visitedTerms = new Set();
      for (const tId of termKeys) {
        if (!visitedTerms.has(tId)) {
          const group = termKeys.filter((other) => inSameNet(tId, other));
          group.forEach((t) => visitedTerms.add(t));
          motorNets.push(group);
        }
      }

      for (const group of motorNets) {
        const knownSrcTerm = group.find((t) => nodePhasor[t]);
        if (knownSrcTerm) {
          const p = nodePhasor[knownSrcTerm];
          group.forEach((t) => { nodePhasor[t] = p; });
        } else {
          // Floating junction (e.g. star center U2-V2-W2 or unpowered delta corner).
          // Solve potential via KCL from connected coils whose other ends are energized:
          let sumPhasor = { r: 0, i: 0 };
          let energizedCoilsCount = 0;

          for (const tInGroup of group) {
            const coil = coilPairs.find((c) => c.t1 === tInGroup || c.t2 === tInGroup);
            if (coil) {
              const otherEnd = coil.t1 === tInGroup ? coil.t2 : coil.t1;
              const otherSrc = getSourcePotential(otherEnd);
              if (otherSrc) {
                sumPhasor = cAdd(sumPhasor, phasePhasors[otherSrc]);
                energizedCoilsCount++;
              }
            }
          }

          if (energizedCoilsCount > 1) {
            const vJunction = cScale(sumPhasor, 1 / energizedCoilsCount);
            group.forEach((t) => { nodePhasor[t] = vJunction; });
          }
        }
      }

      // 4. Calculate Coil Voltages and Currents
      const Z_COIL = 40; // Ohms (typical 2 CV / 1.5 kW motor)

      const getCoilPhasor = (t1, t2) => {
        const p1 = nodePhasor[t1];
        const p2 = nodePhasor[t2];
        if (p1 && p2) {
          return cSub(p1, p2);
        }
        return { r: 0, i: 0 };
      };

      const vCoilU = getCoilPhasor('U1', 'U2');
      const vCoilV = getCoilPhasor('V1', 'V2');
      const vCoilW = getCoilPhasor('W1', 'W2');

      const vU_rms = Math.round(cMag(vCoilU));
      const vV_rms = Math.round(cMag(vCoilV));
      const vW_rms = Math.round(cMag(vCoilW));

      const iU_rms = Math.round((vU_rms / Z_COIL) * 10) / 10;
      const iV_rms = Math.round((vV_rms / Z_COIL) * 10) / 10;
      const iW_rms = Math.round((vW_rms / Z_COIL) * 10) / 10;

      // Current phasors for symmetrical component analysis
      const iCoilU = cScale(vCoilU, 1 / Z_COIL);
      const iCoilV = cScale(vCoilV, 1 / Z_COIL);
      const iCoilW = cScale(vCoilW, 1 / Z_COIL);

      // 5. Symmetrical Components (Positive & Negative Sequence Rotating Fields)
      const cMulA = (c) => ({
        r: -0.5 * c.r - SQRT3_2 * c.i,
        i: -0.5 * c.i + SQRT3_2 * c.r,
      });
      const cMulA2 = (c) => ({
        r: -0.5 * c.r + SQRT3_2 * c.i,
        i: -0.5 * c.i - SQRT3_2 * c.r,
      });

      const iPos = cScale(
        cAdd(cAdd(iCoilU, cMulA(iCoilV)), cMulA2(iCoilW)),
        1 / 3
      );
      const iNeg = cScale(
        cAdd(cAdd(iCoilU, cMulA2(iCoilV)), cMulA(iCoilW)),
        1 / 3
      );

      const bPosMag = cMag(iPos);
      const bNegMag = cMag(iNeg);
      const I_BASE = 5.5; // Nominal base current
      const bPosNorm = Math.round((bPosMag / I_BASE) * 100) / 100;
      const bNegNorm = Math.round((bNegMag / I_BASE) * 100) / 100;

      // 6. Electromechanical Torque & Rotor Behavior
      const activeCoils = [vU_rms, vV_rms, vW_rms].filter((v) => v > 20);
      const activeCoilsCount = activeCoils.length;

      const connectedPhases = new Set(
        [srcU1, srcU2, srcV1, srcV2, srcW1, srcW2].filter(
          (s) => s === 'L1' || s === 'L2' || s === 'L3'
        )
      );

      let fieldType = 'ZERO';
      let fieldDesc = 'Nulo (Sem Corrente)';
      let netTorquePercent = 0;
      let startTorquePercent = 0;
      let torqueDesc = 'Torque Nulo';
      let rotorStatus = 'STOPPED';
      let isRunning = false;
      let targetRpm = 0;
      let direction = comp.state?.direction || 'CW';
      let phaseError = null;

      if (activeCoilsCount === 0) {
        fieldType = 'ZERO';
        fieldDesc = 'Nulo (Enrolamentos Desenergizados)';
        rotorStatus = 'STOPPED';
        isRunning = false;
        targetRpm = 0;
        if (!isStarWired && !isDeltaWired) {
          phaseError = 'BORNES ABERTOS (Feche os bornes em Estrela ou Triângulo)';
        } else {
          phaseError = null;
        }
      } else if (connectedPhases.size === 3 && activeCoilsCount === 3) {
        // Balanced Three-Phase Operation
        if (bPosNorm >= bNegNorm) {
          direction = 'CW';
          fieldType = 'ROTATING_BALANCED';
          fieldDesc = 'Campo Girante Equilibrado 120° (Horário)';
          netTorquePercent = 100;
          startTorquePercent = 200;
          torqueDesc = 'Torque Nominal Pleno (100%)';
          rotorStatus = 'RUNNING';
          isRunning = true;
          targetRpm = 1750;
          phaseError = null;
        } else {
          direction = 'CCW';
          fieldType = 'ROTATING_REVERSE';
          fieldDesc = 'Campo Girante Inverso 120° (Anti-Horário)';
          netTorquePercent = -100;
          startTorquePercent = -200;
          torqueDesc = 'Torque Invertido (-100%)';
          rotorStatus = 'RUNNING';
          isRunning = true;
          targetRpm = 1750;
          phaseError = null;
        }
      } else if (activeCoilsCount >= 1) {
        // Single Phase or Missing Phase (Bifásico / Monofásico)
        startTorquePercent = 0;

        if (activeCoilsCount === 1) {
          fieldType = 'PULSATING_SINGLE';
          fieldDesc = 'Campo Pulsativo Monofásico (1 Bobina Ativa)';
        } else {
          fieldType = 'PULSATING_ASYMMETRIC';
          fieldDesc = 'Campo Pulsativo Assimétrico (Falta de Fase)';
        }

        if (wasRunning) {
          // SITUATION A/B WHILE RUNNING:
          // Motor already has angular momentum, slip asymmetry produces reduced net torque (~35-40%)
          rotorStatus = 'BIPHASIC_RUN';
          isRunning = true;
          targetRpm = 1450;
          netTorquePercent = 35;
          torqueDesc = 'Torque Reduzido (~35% - Sobreaquecimento)';
          phaseError = 'FALTA DE FASE EM MOVIMENTO (Sobreaquecimento e Vibração)';
        } else {
          // SITUATION A/B AT STANDSTILL:
          // Net starting torque is ZERO! Motor CANNOT start!
          rotorStatus = 'STALLED_HUM';
          isRunning = false;
          targetRpm = 0;
          netTorquePercent = 0;
          torqueDesc = 'Torque de Partida NULO (Rotor Travado com Zumbido)';
          phaseError = 'ROTOR BLOQUEADO (Falta de Fase: Torque de Partida Nulo, Vibração 120Hz)';
        }
      }

      comp.state = {
        ...comp.state,
        running: isRunning,
        rpm: targetRpm,
        direction,
        phaseError,
        detectedConnection,
        isStarWired,
        isDeltaWired,
        currents: {
          u: iU_rms,
          v: iV_rms,
          w: iW_rms,
        },
        voltages: {
          u: vU_rms,
          v: vV_rms,
          w: vW_rms,
        },
        magneticField: {
          type: fieldType,
          bPositive: bPosNorm,
          bNegative: bNegNorm,
          label: fieldDesc,
        },
        torque: {
          netPercent: netTorquePercent,
          startPercent: startTorquePercent,
          label: torqueDesc,
        },
        rotorState: rotorStatus,
      };
    }
  }

  return {
    components: Array.from(compMap.values()),
    terminalVoltages: finalTerminalVoltages,
    shortCircuit,
    shortCircuitDetails,
    shortedWireIds: Array.from(shortedWireIds),
    trippedBreakerIds: Array.from(trippedBreakerIds),
  };
}
