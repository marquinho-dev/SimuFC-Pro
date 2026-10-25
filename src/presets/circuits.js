// Pre-configured circuit presets for quick learning and demonstration
import {
  COMPONENT_TYPES,
  POWER_MODES,
  TIMER_RELAY_TERMINALS,
  getBreakerTerminals,
} from '../types/components';

// Helper to create contactor terminals
function createContactorTerminals() {
  return [
    { id: '1', label: '1/L1', x: 42, y: 34, type: 'power_main' },
    { id: '3', label: '3/L2', x: 105, y: 34, type: 'power_main' },
    { id: '5', label: '5/L3', x: 168, y: 34, type: 'power_main' },
    { id: '13', label: '13 NO', x: 42, y: 98, type: 'aux_no' },
    { id: '21', label: '21 NC', x: 105, y: 98, type: 'aux_nc' },
    { id: 'A1', label: 'A1', x: 168, y: 98, type: 'coil' },
    { id: '14', label: '14 NO', x: 42, y: 252, type: 'aux_no' },
    { id: '22', label: '22 NC', x: 105, y: 252, type: 'aux_nc' },
    { id: 'A2', label: 'A2', x: 168, y: 252, type: 'coil' },
    { id: '2', label: '2/T1', x: 42, y: 316, type: 'power_main' },
    { id: '4', label: '4/T2', x: 105, y: 316, type: 'power_main' },
    { id: '6', label: '6/T3', x: 168, y: 316, type: 'power_main' },
  ];
}

// Helper to create thermal relay terminals
function createThermalRelayTerminals() {
  return [
    { id: '1', label: '1/L1', x: 34, y: 20, type: 'relay_in' },
    { id: '3', label: '3/L2', x: 105, y: 20, type: 'relay_in' },
    { id: '5', label: '5/L3', x: 176, y: 20, type: 'relay_in' },
    { id: '98', label: '98 NA', x: 43, y: 249, type: 'aux_no' },
    { id: '97', label: '97 NA', x: 86, y: 249, type: 'aux_no' },
    { id: '96', label: '96 NF', x: 130, y: 249, type: 'aux_nc' },
    { id: '95', label: '95 NF', x: 173, y: 249, type: 'aux_nc' },
    { id: '2', label: '2/T1', x: 43, y: 320, type: 'relay_out' },
    { id: '4', label: '4/T2', x: 103, y: 320, type: 'relay_out' },
    { id: '6', label: '6/T3', x: 173, y: 320, type: 'relay_out' },
  ];
}

// Helper to create motor terminals
function createMotorTerminals() {
  return [
    { id: 'U1', label: 'U1', x: 99, y: 36, type: 'motor_coil' },
    { id: 'V1', label: 'V1', x: 156, y: 36, type: 'motor_coil' },
    { id: 'W1', label: 'W1', x: 213, y: 36, type: 'motor_coil' },
    { id: 'W2', label: 'W2', x: 99, y: 86, type: 'motor_coil' },
    { id: 'U2', label: 'U2', x: 156, y: 86, type: 'motor_coil' },
    { id: 'V2', label: 'V2', x: 213, y: 86, type: 'motor_coil' },
    { id: 'PE', label: 'PE', x: 38, y: 36, type: 'motor_ground' },
  ];
}

// Helper to create stop button terminals
function createStopButtonTerminals() {
  return [
    { id: '11', label: '11 (NF)', x: 45, y: 27, color: '#dc2626', type: 'btn_nc' },
    { id: '12', label: '12 (NF)', x: 99, y: 27, color: '#dc2626', type: 'btn_nc' },
    { id: '11_bot', label: '11 (NF)', x: 45, y: 130, color: '#dc2626', type: 'btn_nc' },
    { id: '12_bot', label: '12 (NF)', x: 99, y: 130, color: '#dc2626', type: 'btn_nc' },
  ];
}

// Helper to create start button terminals
function createStartButtonTerminals() {
  return [
    { id: '13', label: '13 (NA)', x: 45, y: 27, color: '#16a34a', type: 'btn_no' },
    { id: '14', label: '14 (NA)', x: 99, y: 27, color: '#16a34a', type: 'btn_no' },
    { id: '13_bot', label: '13 (NA)', x: 45, y: 130, color: '#16a34a', type: 'btn_no' },
    { id: '14_bot', label: '14 (NA)', x: 99, y: 130, color: '#16a34a', type: 'btn_no' },
  ];
}

// Helper to create emergency button terminals
function createEmergencyButtonTerminals() {
  return [
    { id: '11', label: '11 (NF)', x: 68, y: 18, color: '#dc2626', type: 'btn_nc' },
    { id: '12', label: '12 (NF)', x: 68, y: 150, color: '#dc2626', type: 'btn_nc' },
    { id: '11_bot', label: '11 (NF)', x: 68, y: 18, color: '#dc2626', type: 'btn_nc' },
    { id: '12_bot', label: '12 (NF)', x: 68, y: 150, color: '#dc2626', type: 'btn_nc' },
  ];
}

// ============================================================================
// PRESET 1: PARTIDA ESTRELA-TRIÂNGULO (Y - Δ)
// ============================================================================
export const STAR_DELTA_COMPONENTS = [
  {
    id: 'source-1',
    type: COMPONENT_TYPES.POWER_SOURCE,
    name: 'Barramento de Alimentação (Rede)',
    tag: 'REDE',
    x: 40,
    y: 30,
    state: {
      powered: true,
      mode: '3P_N_PE',
      voltageStandard: '380_220',
      vL1: 220,
      vL2: 220,
      vL3: 220,
      frequency: 60,
      phasesEnabled: { L1: true, L2: true, L3: true },
    },
    terminals: POWER_MODES['3P_N_PE'].terminals,
  },
  {
    id: 'q1-1',
    type: COMPONENT_TYPES.CIRCUIT_BREAKER,
    name: 'Disjuntor Termomagnético (DIN)',
    tag: 'Q1',
    x: 40,
    y: 385,
    state: { closed: true, poles: 3, current: 25, curve: 'C', icn: 4500 },
    terminals: getBreakerTerminals(3),
  },
  {
    id: 'k1-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K1 (Principal)',
    tag: 'K1',
    x: 380,
    y: 40,
    linkedRelayId: 'rt-1',
    state: { energized: false },
    terminals: createContactorTerminals(),
  },
  {
    id: 'rt-1',
    type: COMPONENT_TYPES.THERMAL_RELAY,
    name: 'Relé Térmico de Sobrecarga',
    tag: 'RT1',
    x: 380,
    y: 395,
    linkedContactorId: 'k1-1',
    state: { tripped: false, currentSetting: 3.5 },
    terminals: createThermalRelayTerminals(),
  },
  {
    id: 'k2-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K2 (Triângulo Δ)',
    tag: 'K2',
    x: 670,
    y: 40,
    state: { energized: false },
    terminals: createContactorTerminals(),
  },
  {
    id: 'k3-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K3 (Estrela Y)',
    tag: 'K3',
    x: 960,
    y: 40,
    state: { energized: false },
    terminals: createContactorTerminals(),
  },
  {
    id: 'kt-1',
    type: COMPONENT_TYPES.TIMER_RELAY,
    name: 'Relé Temporizador Estrela-Triângulo',
    tag: 'KT1',
    x: 1250,
    y: 40,
    state: {
      energized: false,
      mode: 'ON_DELAY',
      rangeIndex: 1, // 10s
      timeVal: 0.5,  // 5s
      delay: 5,
      timedOut: false,
      holding: false,
      timerStartedAt: null,
    },
    terminals: Object.values(TIMER_RELAY_TERMINALS),
  },
  {
    id: 's00-1',
    type: COMPONENT_TYPES.BUTTON_EMERGENCY,
    name: 'Botoeira de Emergência (S00)',
    tag: 'S00',
    x: 1450,
    y: 40,
    state: { pressed: false, locked: false },
    terminals: createEmergencyButtonTerminals(),
  },
  {
    id: 's0-1',
    type: COMPONENT_TYPES.BUTTON_STOP,
    name: 'Botoeira Desliga S0 (NF)',
    tag: 'S0',
    x: 1600,
    y: 40,
    state: { pressed: false },
    terminals: createStopButtonTerminals(),
  },
  {
    id: 's1-1',
    type: COMPONENT_TYPES.BUTTON_START,
    name: 'Botoeira Liga S1 (NA)',
    tag: 'S1',
    x: 1750,
    y: 40,
    state: { pressed: false },
    terminals: createStartButtonTerminals(),
  },
  {
    id: 'motor-1',
    type: COMPONENT_TYPES.MOTOR_6P,
    name: 'Motor Trifásico 6 Pontas',
    tag: 'M1',
    x: 740,
    y: 440,
    state: { running: false, rpm: 0, direction: 'CW', phaseError: null, connectionType: 'NONE' },
    terminals: createMotorTerminals(),
  },
];

export const STAR_DELTA_WIRES = [
  // --- POTÊNCIA: REDE -> DISJUNTOR Q1 ---
  { id: 'sd-p1', fromComponent: 'source-1', fromTerminal: 'L1', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'sd-p2', fromComponent: 'source-1', fromTerminal: 'L2', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'sd-p3', fromComponent: 'source-1', fromTerminal: 'L3', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '5', color: '#5c677d' },

  // --- POTÊNCIA: DISJUNTOR Q1 -> CONTATOR K1 ---
  { id: 'sd-p4', fromComponent: 'q1-1', fromTerminal: '2', toComponent: 'k1-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'sd-p5', fromComponent: 'q1-1', fromTerminal: '4', toComponent: 'k1-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'sd-p6', fromComponent: 'q1-1', fromTerminal: '6', toComponent: 'k1-1', toTerminal: '5', color: '#5c677d' },

  // --- POTÊNCIA: RELÉ TÉRMICO RT1 (SAÍDA DE K1) -> MOTOR U1, V1, W1 ---
  { id: 'sd-p7', fromComponent: 'rt-1', fromTerminal: '2', toComponent: 'motor-1', toTerminal: 'U1', color: '#2b2d42' },
  { id: 'sd-p8', fromComponent: 'rt-1', fromTerminal: '4', toComponent: 'motor-1', toTerminal: 'V1', color: '#7f4f24' },
  { id: 'sd-p9', fromComponent: 'rt-1', fromTerminal: '6', toComponent: 'motor-1', toTerminal: 'W1', color: '#5c677d' },

  // --- POTÊNCIA: DERIVAÇÃO DA ENTRADA DE K1 PARA ENTRADA DE K2 (TRIÂNGULO) ---
  { id: 'sd-p10', fromComponent: 'k1-1', fromTerminal: '1', toComponent: 'k2-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'sd-p11', fromComponent: 'k1-1', fromTerminal: '3', toComponent: 'k2-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'sd-p12', fromComponent: 'k1-1', fromTerminal: '5', toComponent: 'k2-1', toTerminal: '5', color: '#5c677d' },

  // --- POTÊNCIA: SAÍDA DE K2 -> FINAIS DO MOTOR W2, U2, V2 (FECHAMENTO TRIÂNGULO) ---
  // U1-W2, V1-U2, W1-V2
  { id: 'sd-p13', fromComponent: 'k2-1', fromTerminal: '2', toComponent: 'motor-1', toTerminal: 'W2', color: '#2b2d42' },
  { id: 'sd-p14', fromComponent: 'k2-1', fromTerminal: '4', toComponent: 'motor-1', toTerminal: 'U2', color: '#7f4f24' },
  { id: 'sd-p15', fromComponent: 'k2-1', fromTerminal: '6', toComponent: 'motor-1', toTerminal: 'V2', color: '#5c677d' },

  // --- POTÊNCIA: PONTO ESTRELA EM K3 (JUMPERS SUPERIORES 1-3-5) ---
  { id: 'sd-p16', fromComponent: 'k3-1', fromTerminal: '1', toComponent: 'k3-1', toTerminal: '3', color: '#5c677d' },
  { id: 'sd-p17', fromComponent: 'k3-1', fromTerminal: '3', toComponent: 'k3-1', toTerminal: '5', color: '#5c677d' },

  // --- POTÊNCIA: SAÍDA DE K3 CONECTADA AOS FINAIS DO MOTOR W2, U2, V2 (VIA K2) ---
  { id: 'sd-p18', fromComponent: 'k3-1', fromTerminal: '2', toComponent: 'k2-1', toTerminal: '2', color: '#2b2d42' },
  { id: 'sd-p19', fromComponent: 'k3-1', fromTerminal: '4', toComponent: 'k2-1', toTerminal: '4', color: '#7f4f24' },
  { id: 'sd-p20', fromComponent: 'k3-1', fromTerminal: '6', toComponent: 'k2-1', toTerminal: '6', color: '#5c677d' },


  // --- CIRCUITO DE COMANDO: FASE L1 -> SEGURANÇA -> S0 -> S1 / SELO ---
  { id: 'sd-c1', fromComponent: 'source-1', fromTerminal: 'L1', fromTerminalX: 230, toComponent: 's00-1', toTerminal: '11', color: '#c1121f' },
  { id: 'sd-c2', fromComponent: 's00-1', fromTerminal: '12', toComponent: 'rt-1', toTerminal: '95', color: '#c1121f' },
  { id: 'sd-c3', fromComponent: 'rt-1', fromTerminal: '96', toComponent: 's0-1', toTerminal: '11', color: '#c1121f' },
  { id: 'sd-c4', fromComponent: 's0-1', fromTerminal: '12', toComponent: 's1-1', toTerminal: '13', color: '#c1121f' },
  { id: 'sd-c5', fromComponent: 's0-1', fromTerminal: '12', toComponent: 'k1-1', toTerminal: '13', color: '#c1121f' },

  // --- COMANDO: RETENÇÃO SELO K1 E ALIMENTAÇÃO DA BOBINA K1 + TEMPORIZADOR KT1 ---
  { id: 'sd-c6', fromComponent: 's1-1', fromTerminal: '14', toComponent: 'k1-1', toTerminal: '14', color: '#c1121f' },
  { id: 'sd-c7', fromComponent: 'k1-1', fromTerminal: '14', toComponent: 'k1-1', toTerminal: 'A1', color: '#c1121f' },
  { id: 'sd-c8', fromComponent: 'k1-1', fromTerminal: '14', toComponent: 'kt-1', toTerminal: 'A1', color: '#c1121f' },
  { id: 'sd-c9', fromComponent: 'k1-1', fromTerminal: '14', toComponent: 'kt-1', toTerminal: '15', color: '#c1121f' },

  // --- COMANDO ESTRELA: KT1 16 (NF) -> INTERTRAVAMENTO K2 (21-22 NF) -> K3 BOBINA A1 ---
  { id: 'sd-c10', fromComponent: 'kt-1', fromTerminal: '16', toComponent: 'k2-1', toTerminal: '21', color: '#c1121f' },
  { id: 'sd-c11', fromComponent: 'k2-1', fromTerminal: '22', toComponent: 'k3-1', toTerminal: 'A1', color: '#c1121f' },

  // --- COMANDO TRIÂNGULO: KT1 18 (NA) -> INTERTRAVAMENTO K3 (21-22 NF) -> K2 BOBINA A1 ---
  { id: 'sd-c12', fromComponent: 'kt-1', fromTerminal: '18', toComponent: 'k3-1', toTerminal: '21', color: '#c1121f' },
  { id: 'sd-c13', fromComponent: 'k3-1', fromTerminal: '22', toComponent: 'k2-1', toTerminal: 'A1', color: '#c1121f' },

  // --- RETORNO NEUTRO N PARA AS BOBINAS DE K1, K2, K3 E KT1 ---
  { id: 'sd-c14', fromComponent: 'source-1', fromTerminal: 'N', fromTerminalX: 110, toComponent: 'k1-1', toTerminal: 'A2', color: '#0077b6' },
  { id: 'sd-c15', fromComponent: 'k1-1', fromTerminal: 'A2', toComponent: 'k2-1', toTerminal: 'A2', color: '#0077b6' },
  { id: 'sd-c16', fromComponent: 'k2-1', fromTerminal: 'A2', toComponent: 'k3-1', toTerminal: 'A2', color: '#0077b6' },
  { id: 'sd-c17', fromComponent: 'k3-1', fromTerminal: 'A2', toComponent: 'kt-1', toTerminal: 'A2', color: '#0077b6' },
];

// ============================================================================
// PRESET 2: PARTIDA DIRETA COM SELO E MOTOR TRIFÁSICO
// ============================================================================
export const DIRECT_STARTER_COMPONENTS = [
  {
    id: 'source-1',
    type: COMPONENT_TYPES.POWER_SOURCE,
    name: 'Barramento de Alimentação (Rede)',
    tag: 'REDE',
    x: 40,
    y: 30,
    state: {
      powered: true,
      mode: '3P_N_PE',
      voltageStandard: '380_220',
      vL1: 220,
      vL2: 220,
      vL3: 220,
      frequency: 60,
      phasesEnabled: { L1: true, L2: true, L3: true },
    },
    terminals: POWER_MODES['3P_N_PE'].terminals,
  },
  {
    id: 'q1-1',
    type: COMPONENT_TYPES.CIRCUIT_BREAKER,
    name: 'Disjuntor Termomagnético (DIN)',
    tag: 'Q1',
    x: 40,
    y: 385,
    state: { closed: true, poles: 3, current: 25, curve: 'C', icn: 4500 },
    terminals: getBreakerTerminals(3),
  },
  {
    id: 'k1-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K1',
    tag: 'K1',
    x: 360,
    y: 40,
    linkedRelayId: 'rt-1',
    state: { energized: false },
    terminals: createContactorTerminals(),
  },
  {
    id: 'rt-1',
    type: COMPONENT_TYPES.THERMAL_RELAY,
    name: 'Relé Térmico de Sobrecarga',
    tag: 'RT1',
    x: 360,
    y: 395,
    linkedContactorId: 'k1-1',
    state: { tripped: false, currentSetting: 3.5 },
    terminals: createThermalRelayTerminals(),
  },
  {
    id: 's00-1',
    type: COMPONENT_TYPES.BUTTON_EMERGENCY,
    name: 'Botoeira de Emergência (S00)',
    tag: 'S00',
    x: 620,
    y: 40,
    state: { pressed: false, locked: false },
    terminals: createEmergencyButtonTerminals(),
  },
  {
    id: 's0-1',
    type: COMPONENT_TYPES.BUTTON_STOP,
    name: 'Botoeira Desliga S0 (NF)',
    tag: 'S0',
    x: 770,
    y: 40,
    state: { pressed: false },
    terminals: createStopButtonTerminals(),
  },
  {
    id: 's1-1',
    type: COMPONENT_TYPES.BUTTON_START,
    name: 'Botoeira Liga S1 (NA)',
    tag: 'S1',
    x: 920,
    y: 40,
    state: { pressed: false },
    terminals: createStartButtonTerminals(),
  },
  {
    id: 'motor-1',
    type: COMPONENT_TYPES.MOTOR_6P,
    name: 'Motor Trifásico 6 Pontas',
    tag: 'M1',
    x: 620,
    y: 410,
    state: { running: false, rpm: 0, direction: 'CW', phaseError: null, connectionType: 'NONE' },
    terminals: createMotorTerminals(),
  },
];

export const DIRECT_STARTER_WIRES = [
  // Potência: Rede -> Disjuntor Q1
  { id: 'ds-p1', fromComponent: 'source-1', fromTerminal: 'L1', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'ds-p2', fromComponent: 'source-1', fromTerminal: 'L2', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'ds-p3', fromComponent: 'source-1', fromTerminal: 'L3', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '5', color: '#5c677d' },

  // Potência: Q1 -> K1
  { id: 'ds-p4', fromComponent: 'q1-1', fromTerminal: '2', toComponent: 'k1-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'ds-p5', fromComponent: 'q1-1', fromTerminal: '4', toComponent: 'k1-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'ds-p6', fromComponent: 'q1-1', fromTerminal: '6', toComponent: 'k1-1', toTerminal: '5', color: '#5c677d' },

  // Potência: RT1 -> Motor U1, V1, W1
  { id: 'ds-p7', fromComponent: 'rt-1', fromTerminal: '2', toComponent: 'motor-1', toTerminal: 'U1', color: '#2b2d42' },
  { id: 'ds-p8', fromComponent: 'rt-1', fromTerminal: '4', toComponent: 'motor-1', toTerminal: 'V1', color: '#7f4f24' },
  { id: 'ds-p9', fromComponent: 'rt-1', fromTerminal: '6', toComponent: 'motor-1', toTerminal: 'W1', color: '#5c677d' },

  // Fechamento em Estrela no Motor (W2 - U2 - V2)
  { id: 'ds-star1', fromComponent: 'motor-1', fromTerminal: 'W2', toComponent: 'motor-1', toTerminal: 'U2', color: '#5c677d' },
  { id: 'ds-star2', fromComponent: 'motor-1', fromTerminal: 'U2', toComponent: 'motor-1', toTerminal: 'V2', color: '#5c677d' },

  // Comando: L1 -> S00 -> RT1(95-96) -> S0 -> S1 / Selo
  { id: 'ds-c1', fromComponent: 'source-1', fromTerminal: 'L1', fromTerminalX: 230, toComponent: 's00-1', toTerminal: '11', color: '#c1121f' },
  { id: 'ds-c2', fromComponent: 's00-1', fromTerminal: '12', toComponent: 'rt-1', toTerminal: '95', color: '#c1121f' },
  { id: 'ds-c3', fromComponent: 'rt-1', fromTerminal: '96', toComponent: 's0-1', toTerminal: '11', color: '#c1121f' },
  { id: 'ds-c4', fromComponent: 's0-1', fromTerminal: '12', toComponent: 's1-1', toTerminal: '13', color: '#c1121f' },
  { id: 'ds-c5', fromComponent: 's0-1', fromTerminal: '12', toComponent: 'k1-1', toTerminal: '13', color: '#c1121f' },

  // Saída S1 + Selo 14 -> Bobina A1
  { id: 'ds-c6', fromComponent: 's1-1', fromTerminal: '14', toComponent: 'k1-1', toTerminal: '14', color: '#c1121f' },
  { id: 'ds-c7', fromComponent: 'k1-1', fromTerminal: '14', toComponent: 'k1-1', toTerminal: 'A1', color: '#c1121f' },

  // Neutro N -> Bobina A2
  { id: 'ds-c8', fromComponent: 'source-1', fromTerminal: 'N', fromTerminalX: 110, toComponent: 'k1-1', toTerminal: 'A2', color: '#0077b6' },
];

// ============================================================================
// PRESET 3: PARTIDA COM REVERSÃO DE SENTIDO DE GIRO (CW / CCW)
// ============================================================================
export const REVERSING_COMPONENTS = [
  {
    id: 'source-1',
    type: COMPONENT_TYPES.POWER_SOURCE,
    name: 'Barramento de Alimentação (Rede)',
    tag: 'REDE',
    x: 40,
    y: 30,
    state: {
      powered: true,
      mode: '3P_N_PE',
      voltageStandard: '380_220',
      vL1: 220,
      vL2: 220,
      vL3: 220,
      frequency: 60,
      phasesEnabled: { L1: true, L2: true, L3: true },
    },
    terminals: POWER_MODES['3P_N_PE'].terminals,
  },
  {
    id: 'q1-1',
    type: COMPONENT_TYPES.CIRCUIT_BREAKER,
    name: 'Disjuntor Termomagnético (DIN)',
    tag: 'Q1',
    x: 40,
    y: 385,
    state: { closed: true, poles: 3, current: 25, curve: 'C', icn: 4500 },
    terminals: getBreakerTerminals(3),
  },
  {
    id: 'k1-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K1 (Sentido Horário - CW)',
    tag: 'K1',
    x: 380,
    y: 40,
    linkedRelayId: 'rt-1',
    state: { energized: false },
    terminals: createContactorTerminals(),
  },
  {
    id: 'rt-1',
    type: COMPONENT_TYPES.THERMAL_RELAY,
    name: 'Relé Térmico de Sobrecarga',
    tag: 'RT1',
    x: 380,
    y: 395,
    linkedContactorId: 'k1-1',
    state: { tripped: false, currentSetting: 3.5 },
    terminals: createThermalRelayTerminals(),
  },
  {
    id: 'k2-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K2 (Sentido Anti-Horário - CCW)',
    tag: 'K2',
    x: 670,
    y: 40,
    state: { energized: false },
    terminals: createContactorTerminals(),
  },
  {
    id: 's0-1',
    type: COMPONENT_TYPES.BUTTON_STOP,
    name: 'Botoeira Desliga Geral (S0)',
    tag: 'S0',
    x: 960,
    y: 40,
    state: { pressed: false },
    terminals: createStopButtonTerminals(),
  },
  {
    id: 's1-1',
    type: COMPONENT_TYPES.BUTTON_START,
    name: 'Botoeira Liga Horário (S1)',
    tag: 'S1',
    x: 1110,
    y: 40,
    state: { pressed: false },
    terminals: createStartButtonTerminals(),
  },
  {
    id: 's2-1',
    type: COMPONENT_TYPES.BUTTON_START,
    name: 'Botoeira Liga Anti-Horário (S2)',
    tag: 'S2',
    x: 1260,
    y: 40,
    state: { pressed: false },
    terminals: createStartButtonTerminals(),
  },
  {
    id: 'motor-1',
    type: COMPONENT_TYPES.MOTOR_6P,
    name: 'Motor Trifásico 6 Pontas',
    tag: 'M1',
    x: 670,
    y: 430,
    state: { running: false, rpm: 0, direction: 'CW', phaseError: null, connectionType: 'NONE' },
    terminals: createMotorTerminals(),
  },
];

export const REVERSING_WIRES = [
  // Força: Rede -> Q1
  { id: 'rev-p1', fromComponent: 'source-1', fromTerminal: 'L1', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'rev-p2', fromComponent: 'source-1', fromTerminal: 'L2', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'rev-p3', fromComponent: 'source-1', fromTerminal: 'L3', fromTerminalX: 110, toComponent: 'q1-1', toTerminal: '5', color: '#5c677d' },

  // Força: Q1 -> K1 entrada
  { id: 'rev-p4', fromComponent: 'q1-1', fromTerminal: '2', toComponent: 'k1-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'rev-p5', fromComponent: 'q1-1', fromTerminal: '4', toComponent: 'k1-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'rev-p6', fromComponent: 'q1-1', fromTerminal: '6', toComponent: 'k1-1', toTerminal: '5', color: '#5c677d' },

  // Força: K1 entrada -> K2 entrada (mesma sequência)
  { id: 'rev-p7', fromComponent: 'k1-1', fromTerminal: '1', toComponent: 'k2-1', toTerminal: '1', color: '#2b2d42' },
  { id: 'rev-p8', fromComponent: 'k1-1', fromTerminal: '3', toComponent: 'k2-1', toTerminal: '3', color: '#7f4f24' },
  { id: 'rev-p9', fromComponent: 'k1-1', fromTerminal: '5', toComponent: 'k2-1', toTerminal: '5', color: '#5c677d' },

  // Força: RT1 saída -> Motor (U1, V1, W1)
  { id: 'rev-p10', fromComponent: 'rt-1', fromTerminal: '2', toComponent: 'motor-1', toTerminal: 'U1', color: '#2b2d42' },
  { id: 'rev-p11', fromComponent: 'rt-1', fromTerminal: '4', toComponent: 'motor-1', toTerminal: 'V1', color: '#7f4f24' },
  { id: 'rev-p12', fromComponent: 'rt-1', fromTerminal: '6', toComponent: 'motor-1', toTerminal: 'W1', color: '#5c677d' },

  // Força: K2 saída INVERTE fases L1 e L3 no motor para girar Anti-horário (CCW)
  // L1 (K2:2) vai para W1 | L2 (K2:4) vai para V1 | L3 (K2:6) vai para U1
  { id: 'rev-p13', fromComponent: 'k2-1', fromTerminal: '2', toComponent: 'motor-1', toTerminal: 'W1', color: '#2b2d42' },
  { id: 'rev-p14', fromComponent: 'k2-1', fromTerminal: '4', toComponent: 'motor-1', toTerminal: 'V1', color: '#7f4f24' },
  { id: 'rev-p15', fromComponent: 'k2-1', fromTerminal: '6', toComponent: 'motor-1', toTerminal: 'U1', color: '#5c677d' },

  // Fechamento em Estrela no Motor (W2-U2-V2)
  { id: 'rev-star1', fromComponent: 'motor-1', fromTerminal: 'W2', toComponent: 'motor-1', toTerminal: 'U2', color: '#5c677d' },
  { id: 'rev-star2', fromComponent: 'motor-1', fromTerminal: 'U2', toComponent: 'motor-1', toTerminal: 'V2', color: '#5c677d' },

  // Comando: L1 -> RT1 95-96 -> S0 (Desliga geral)
  { id: 'rev-c1', fromComponent: 'source-1', fromTerminal: 'L1', fromTerminalX: 230, toComponent: 'rt-1', toTerminal: '95', color: '#c1121f' },
  { id: 'rev-c2', fromComponent: 'rt-1', fromTerminal: '96', toComponent: 's0-1', toTerminal: '11', color: '#c1121f' },

  // Distribuição da saída de S0 para S1, S2 e selos
  { id: 'rev-c3', fromComponent: 's0-1', fromTerminal: '12', toComponent: 's1-1', toTerminal: '13', color: '#c1121f' },
  { id: 'rev-c4', fromComponent: 's0-1', fromTerminal: '12', toComponent: 'k1-1', toTerminal: '13', color: '#c1121f' },
  { id: 'rev-c5', fromComponent: 's0-1', fromTerminal: '12', toComponent: 's2-1', toTerminal: '13', color: '#c1121f' },
  { id: 'rev-c6', fromComponent: 's0-1', fromTerminal: '12', toComponent: 'k2-1', toTerminal: '13', color: '#c1121f' },

  // Linha K1 Horário (passa pelo intertravamento NF 21-22 de K2)
  { id: 'rev-c7', fromComponent: 's1-1', fromTerminal: '14', toComponent: 'k1-1', toTerminal: '14', color: '#c1121f' },
  { id: 'rev-c8', fromComponent: 'k1-1', fromTerminal: '14', toComponent: 'k2-1', toTerminal: '21', color: '#c1121f' },
  { id: 'rev-c9', fromComponent: 'k2-1', fromTerminal: '22', toComponent: 'k1-1', toTerminal: 'A1', color: '#c1121f' },

  // Linha K2 Anti-Horário (passa pelo intertravamento NF 21-22 de K1)
  { id: 'rev-c10', fromComponent: 's2-1', fromTerminal: '14', toComponent: 'k2-1', toTerminal: '14', color: '#c1121f' },
  { id: 'rev-c11', fromComponent: 'k2-1', fromTerminal: '14', toComponent: 'k1-1', toTerminal: '21', color: '#c1121f' },
  { id: 'rev-c12', fromComponent: 'k1-1', fromTerminal: '22', toComponent: 'k2-1', toTerminal: 'A1', color: '#c1121f' },

  // Neutro N para bobinas A2 de K1 e K2
  { id: 'rev-c13', fromComponent: 'source-1', fromTerminal: 'N', fromTerminalX: 110, toComponent: 'k1-1', toTerminal: 'A2', color: '#0077b6' },
  { id: 'rev-c14', fromComponent: 'k1-1', fromTerminal: 'A2', toComponent: 'k2-1', toTerminal: 'A2', color: '#0077b6' },
];

// ============================================================================
// EXPORT LIST OF PRESETS
// ============================================================================
export const PRESETS = [
  {
    id: 'star_delta',
    title: 'Partida Estrela-Triângulo (Y - Δ)',
    badge: 'Automática Y-Δ',
    tag: 'ESTRELA-TRIÂNGULO',
    icon: 'Zap',
    isFeatured: true,
    description:
      'Partida clássica de redução de corrente: arranca em Estrela (K1 + K3) e comuta após temporização de KT1 para Triângulo (K1 + K2) a pleno torque.',
    components: STAR_DELTA_COMPONENTS,
    wires: STAR_DELTA_WIRES,
  },
  {
    id: 'direct_starter_motor',
    title: 'Partida Direta com Selo e Relé Térmico',
    badge: 'Motor Trifásico',
    tag: 'DIRETA',
    icon: 'Play',
    description:
      'Comando industrial completo com proteção por disjuntor termomagnético, relé térmico bimetálico, contato de retenção (selo 13-14) e motor 6P.',
    components: DIRECT_STARTER_COMPONENTS,
    wires: DIRECT_STARTER_WIRES,
  },
  {
    id: 'reversing_starter',
    title: 'Partida com Reversão (Horário / Anti-Horário)',
    badge: 'Reversão CW/CCW',
    tag: 'REVERSÃO',
    icon: 'RotateCw',
    description:
      'Comando de dois sentidos com contatores K1 e K2, inversão de fases L1/L3, intertravamento elétrico cruzado 21-22 e botoeiras S1/S2.',
    components: REVERSING_COMPONENTS,
    wires: REVERSING_WIRES,
  },
  {
    id: 'empty_circuit',
    title: 'Bancada Limpa (Montagem Livre)',
    badge: 'Criar do Zero',
    tag: 'LIMPA',
    icon: 'Trash2',
    description: 'Bancada vazia para você posicionar os componentes e ligar qualquer esquema elétrico livremente.',
    components: [],
    wires: [],
  },
];
