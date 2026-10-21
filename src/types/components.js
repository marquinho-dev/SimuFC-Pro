// Definition of electrical components, terminals, and wire color palettes

export const WIRE_COLORS = [
  { id: 'purple', label: 'L1 / Fase (Roxo)', color: '#a855f7', border: '#c084fc' },
  { id: 'white', label: 'L2 / Fase (Branco)', color: '#ffffff', border: '#cbd5e1' },
  { id: 'red', label: 'L3 / Fase (Vermelho)', color: '#ef4444', border: '#f87171' },
  { id: 'blue', label: 'Neutro N (Azul)', color: '#2563eb', border: '#60a5fa' },
  { id: 'green', label: 'Terra PE (Verde/Amarelo)', color: '#16a34a', border: '#4ade80', striped: true },
  { id: 'black', label: 'Fase Auxiliar (Preto)', color: '#18181b', border: '#71717a' },
  { id: 'yellow', label: 'Comando / Sinal (Amarelo)', color: '#eab308', border: '#facc15' },
];

export const COMPONENT_TYPES = {
  POWER_SOURCE: 'power_source',
  CIRCUIT_BREAKER: 'circuit_breaker',
  CONTACTOR: 'contactor',
  CONTACTOR_COIL: 'contactor_coil',
  THERMAL_RELAY: 'thermal_relay',
  TIMER_RELAY: 'timer_relay',
  MOTOR_6P: 'motor_6p',
  BUTTON_STOP: 'button_stop',
  BUTTON_START: 'button_start',
  BUTTON_EMERGENCY: 'button_emergency',
  PILOT_LIGHT: 'pilot_light',
  DIN_RAIL: 'din_rail',
};

// Range scale values matching the physical relay dial in the reference photo
export const TIMER_RANGES = [
  { id: '1s', label: '1s', seconds: 1, angle: 0 },
  { id: '10s', label: '10s', seconds: 10, angle: 45 },
  { id: '100s', label: '100s', seconds: 100, angle: 90 },
  { id: '10m', label: '10m', seconds: 600, angle: 135 },
  { id: '100m', label: '100m', seconds: 6000, angle: 180 },
  { id: '10h', label: '10h', seconds: 36000, angle: 225 },
  { id: '100h', label: '100h', seconds: 360000, angle: 270 },
];

// Multiplier values (0.05 to 1.0) matching the physical relay dial in the reference photo
export const TIMER_TIME_MULTIPLIERS = [
  { val: 0.05, label: '0.05', angle: 210 },
  { val: 0.1, label: '0.1', angle: 240 },
  { val: 0.2, label: '0.2', angle: 270 },
  { val: 0.3, label: '0.3', angle: 300 },
  { val: 0.4, label: '0.4', angle: 330 },
  { val: 0.5, label: '0.5', angle: 0 },
  { val: 0.6, label: '0.6', angle: 30 },
  { val: 0.7, label: '0.7', angle: 60 },
  { val: 0.8, label: '0.8', angle: 90 },
  { val: 0.9, label: '0.9', angle: 120 },
  { val: 1.0, label: '1', angle: 150 },
];

// Physical terminal pinout matching the reference photo (exact symmetric 34px pitch)
export const TIMER_RELAY_TERMINALS = {
  // Top row: A1 (coil), 15 (com 1), 25 (com 2)
  A1: { id: 'A1', label: 'A1', x: 26, y: 30, type: 'coil' },
  15: { id: '15', label: '15', x: 60, y: 30, type: 'timer_com' },
  25: { id: '25', label: '25', x: 94, y: 30, type: 'timer_com' },
  // Bottom upper row: 18 (NO 1), 16 (NC 1)
  18: { id: '18', label: '18', x: 26, y: 264, type: 'aux_no' },
  16: { id: '16', label: '16', x: 60, y: 264, type: 'aux_nc' },
  // Bottom lower row: 28 (NO 2), 26 (NC 2), A2 (coil return)
  28: { id: '28', label: '28', x: 26, y: 318, type: 'aux_no' },
  26: { id: '26', label: '26', x: 60, y: 318, type: 'aux_nc' },
  A2: { id: 'A2', label: 'A2', x: 94, y: 318, type: 'coil' },
};

export const TIMER_MODES = {
  ON_DELAY: {
    id: 'ON_DELAY',
    badge: 'RE',
    label: 'Retardo na Energização',
    description: 'Contatos comutam T segundos APÓS a bobina A1-A2 ser energizada',
  },
  OFF_DELAY: {
    id: 'OFF_DELAY',
    badge: 'RD',
    label: 'Retardo na Desenergização',
    description: 'Contatos comutam ao energizar e retornam T segundos APÓS desenergizar',
  },
};

export const BREAKER_POLES = [
  {
    id: 1,
    label: '1P (Monopolar)',
    badge: '1P',
    description: '1 Polo • Fase ou Neutro (Comando ou Cargas Monofásicas)',
    width: 52,
  },
  {
    id: 2,
    label: '2P (Bipolar)',
    badge: '2P',
    description: '2 Polos • Bifásico ou Fase + Neutro',
    width: 104,
  },
  {
    id: 3,
    label: '3P (Tripolar)',
    badge: '3P',
    description: '3 Polos • Trifásico (Alimentação Geral ou Força)',
    width: 156,
  },
];

export const BREAKER_CURVES = [
  {
    id: 'B',
    label: 'Curva B (3 a 5 × In)',
    description: 'Cargas puramente resistivas, aquecedores e circuitos longos',
  },
  {
    id: 'C',
    label: 'Curva C (5 a 10 × In)',
    description: 'Padrão industrial: motores com partida direta, bobinas e cargas indutivas moderadas',
  },
  {
    id: 'D',
    label: 'Curva D (10 a 20 × In)',
    description: 'Transformadores industriais e motores com corrente de partida elevada',
  },
];

export const BREAKER_CURRENTS = [6, 10, 16, 20, 25, 32, 40, 50, 63];

export function getBreakerTerminals(poles = 3) {
  const poleCount = Math.max(1, Math.min(3, Number(poles) || 3));
  const terminals = [];
  const scale = 52 / 94;

  for (let i = 0; i < poleCount; i++) {
    const xc = Math.round((i * 94 + 47) * scale); // 26, 78, 130
    const topId = String(1 + i * 2); // 1, 3, 5
    const botId = String(2 + i * 2); // 2, 4, 6

    terminals.push({
      id: topId,
      label: `${topId}/L${i + 1}`,
      x: xc,
      y: 21,
      type: 'breaker_in',
    });

    terminals.push({
      id: botId,
      label: `${botId}/T${i + 1}`,
      x: xc,
      y: 197,
      type: 'breaker_out',
    });
  }

  return terminals;
}


export const POWER_MODES = {
  '3P_N_PE': {
    id: '3P_N_PE',
    badge: '3Ø + N + PE',
    description: 'Transformador Trifásico com Neutro e Aterramento PE',
    terminals: [
      { id: 'N', label: 'N', x: 89, y: 104, color: '#2563eb', type: 'source_n' },
      { id: 'L1', label: 'L1', x: 123, y: 104, color: '#a855f7', type: 'source_l1' },
      { id: 'L2', label: 'L2', x: 156, y: 104, color: '#ffffff', type: 'source_l2' },
      { id: 'L3', label: 'L3', x: 190, y: 104, color: '#ef4444', type: 'source_l3' },
      { id: 'PE', label: 'PE', x: 48, y: 250, color: '#16a34a', type: 'source_pe' },
    ],
  },
  '3P': {
    id: '3P',
    badge: '3Ø',
    description: 'Trifásico sem Neutro (L1, L2, L3, PE)',
    terminals: [
      { id: 'L1', label: 'L1', x: 123, y: 104, color: '#a855f7', type: 'source_l1' },
      { id: 'L2', label: 'L2', x: 156, y: 104, color: '#ffffff', type: 'source_l2' },
      { id: 'L3', label: 'L3', x: 190, y: 104, color: '#ef4444', type: 'source_l3' },
      { id: 'PE', label: 'PE', x: 48, y: 250, color: '#16a34a', type: 'source_pe' },
    ],
  },
  '2P': {
    id: '2P',
    badge: '2Ø',
    description: 'Bifásico (L1, L2, PE)',
    terminals: [
      { id: 'L1', label: 'L1', x: 123, y: 104, color: '#a855f7', type: 'source_l1' },
      { id: 'L2', label: 'L2', x: 156, y: 104, color: '#ffffff', type: 'source_l2' },
      { id: 'PE', label: 'PE', x: 48, y: 250, color: '#16a34a', type: 'source_pe' },
    ],
  },
  '1P_N_PE': {
    id: '1P_N_PE',
    badge: '1Ø + N + PE',
    description: 'Monofásico com Neutro e Aterramento PE',
    terminals: [
      { id: 'N', label: 'N', x: 89, y: 104, color: '#2563eb', type: 'source_n' },
      { id: 'L1', label: 'L1', x: 123, y: 104, color: '#a855f7', type: 'source_l1' },
      { id: 'PE', label: 'PE', x: 48, y: 250, color: '#16a34a', type: 'source_pe' },
    ],
  },
};

export const SCHEMATIC_SOURCE_BUSES = {
  L1: { id: 'L1', label: 'L1', y: 52, color: '#a855f7', strokeWidth: 3 },
  L2: { id: 'L2', label: 'L2', y: 88, color: '#ffffff', strokeWidth: 3 },
  L3: { id: 'L3', label: 'L3', y: 124, color: '#ef4444', strokeWidth: 3 },
  N:  { id: 'N',  label: 'N',  y: 172, color: '#0ea5e9', strokeWidth: 3 },
  PE: { id: 'PE', label: 'PE', y: 220, color: '#16a34a', strokeWidth: 3, dashed: true },
};

export const SCHEMATIC_SOURCE_BUS_X_START = 48;
export const SCHEMATIC_SOURCE_BUS_X_END = 196;

export const BRAZIL_VOLTAGE_STANDARDS = [
  {
    id: '380_220',
    label: '380V / 220V (Padrão Nacional)',
    vLine: 380,
    vPhase: 220,
    vL1: 220,
    vL2: 220,
    vL3: 220,
    frequency: 60,
  },
  {
    id: '220_127',
    label: '220V / 127V (Padrão Nacional)',
    vLine: 220,
    vPhase: 127,
    vL1: 127,
    vL2: 127,
    vL3: 127,
    frequency: 60,
  },
  {
    id: '440_254',
    label: '440V / 254V (Industrial)',
    vLine: 440,
    vPhase: 254,
    vL1: 254,
    vL2: 254,
    vL3: 254,
    frequency: 60,
  },
  {
    id: 'custom',
    label: 'Personalizado (Individual por Fase)',
    vLine: 380,
    vPhase: 220,
    vL1: 220,
    vL2: 220,
    vL3: 220,
    frequency: 60,
  },
];

export const INITIAL_COMPONENTS = [
  {
    id: 'source-1',
    type: COMPONENT_TYPES.POWER_SOURCE,
    name: 'Transformador / Fonte de Tensão',
    tag: 'REDE',
    x: 40,
    y: 30,
    displayMode: 'real',
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
    state: {
      closed: false,
      poles: 3,
      current: 25,
      curve: 'C',
      icn: 4500,
    },
    terminals: getBreakerTerminals(3),
  },
  {
    id: 'k1-1',
    type: COMPONENT_TYPES.CONTACTOR,
    name: 'Contator K1',
    tag: 'K1',
    x: 360,
    y: 40,
    state: { energized: false },
    terminals: [
      // Top power terminals (large)
      { id: '1', label: '1/L1', x: 42, y: 34, type: 'power_main' },
      { id: '3', label: '3/L2', x: 105, y: 34, type: 'power_main' },
      { id: '5', label: '5/L3', x: 168, y: 34, type: 'power_main' },
      // Upper auxiliary and coil
      { id: '13', label: '13 NO', x: 42, y: 98, type: 'aux_no' },
      { id: '21', label: '21 NC', x: 105, y: 98, type: 'aux_nc' },
      { id: 'A1', label: 'A1', x: 168, y: 98, type: 'coil' },
      // Lower auxiliary and coil
      { id: '14', label: '14 NO', x: 42, y: 252, type: 'aux_no' },
      { id: '22', label: '22 NC', x: 105, y: 252, type: 'aux_nc' },
      { id: 'A2', label: 'A2', x: 168, y: 252, type: 'coil' },
      // Bottom power terminals (large)
      { id: '2', label: '2/T1', x: 42, y: 316, type: 'power_main' },
      { id: '4', label: '4/T2', x: 105, y: 316, type: 'power_main' },
      { id: '6', label: '6/T3', x: 168, y: 316, type: 'power_main' },
    ],
  },
  {
    id: 'km1-coil-1',
    type: COMPONENT_TYPES.CONTACTOR_COIL,
    name: 'Bobina Contator KM1',
    tag: 'KM1',
    x: 520,
    y: 120,
    state: { energized: false },
    terminals: [
      { id: 'A1', label: 'A1', x: 40, y: 18, type: 'coil' },
      { id: 'A2', label: 'A2', x: 40, y: 132, type: 'coil' },
    ],
  },
  {
    id: 's0-1',
    type: COMPONENT_TYPES.BUTTON_STOP,
    name: 'Botoeira Desliga S0 (NF)',
    tag: 'S0',
    x: 620,
    y: 40,
    state: { pressed: false },
    terminals: [
      { id: '11', label: '11 (NF)', x: 46, y: 27, color: '#dc2626', type: 'btn_nc' },
      { id: '12', label: '12 (NF)', x: 90, y: 27, color: '#dc2626', type: 'btn_nc' },
      { id: '11_bot', label: '11 (NF)', x: 46, y: 143, color: '#dc2626', type: 'btn_nc' },
      { id: '12_bot', label: '12 (NF)', x: 90, y: 143, color: '#dc2626', type: 'btn_nc' },
    ],
  },
  {
    id: 's1-1',
    type: COMPONENT_TYPES.BUTTON_START,
    name: 'Botoeira Liga S1 (NA)',
    tag: 'S1',
    x: 770,
    y: 40,
    state: { pressed: false },
    terminals: [
      { id: '13', label: '13 (NA)', x: 46, y: 27, color: '#16a34a', type: 'btn_no' },
      { id: '14', label: '14 (NA)', x: 90, y: 27, color: '#16a34a', type: 'btn_no' },
      { id: '13_bot', label: '13 (NA)', x: 46, y: 143, color: '#16a34a', type: 'btn_no' },
      { id: '14_bot', label: '14 (NA)', x: 90, y: 143, color: '#16a34a', type: 'btn_no' },
    ],
  },
  {
    id: 's00-1',
    type: COMPONENT_TYPES.BUTTON_EMERGENCY,
    name: 'Botoeira de Emergência (S00 - Cogumelo NF)',
    tag: 'S00',
    x: 920,
    y: 40,
    state: { pressed: false, locked: false },
    terminals: [
      { id: '11', label: '11 (NF)', x: 68, y: 18, color: '#dc2626', type: 'btn_nc' },
      { id: '12', label: '12 (NF)', x: 68, y: 150, color: '#dc2626', type: 'btn_nc' },
      { id: '11_bot', label: '11 (NF)', x: 68, y: 18, color: '#dc2626', type: 'btn_nc' },
      { id: '12_bot', label: '12 (NF)', x: 68, y: 150, color: '#dc2626', type: 'btn_nc' },
    ],
  },
  {
    id: 'rt-1',
    type: COMPONENT_TYPES.THERMAL_RELAY,
    name: 'Relé Térmico de Sobrecarga',
    tag: 'RT1',
    x: 360,
    y: 410,
    state: { tripped: false, currentSetting: 3.5 },
    terminals: [
      // Top copper pins (inputs from Contactor 2, 4, 6)
      { id: '1', label: '1/L1', x: 34, y: 20, type: 'relay_in' },
      { id: '3', label: '3/L2', x: 105, y: 20, type: 'relay_in' },
      { id: '5', label: '5/L3', x: 176, y: 20, type: 'relay_in' },
      // Auxiliary control contacts (98 NO, 97 NO, 96 NC, 95 NC)
      { id: '98', label: '98 NA', x: 43, y: 249, type: 'aux_no' },
      { id: '97', label: '97 NA', x: 86, y: 249, type: 'aux_no' },
      { id: '96', label: '96 NF', x: 130, y: 249, type: 'aux_nc' },
      { id: '95', label: '95 NF', x: 173, y: 249, type: 'aux_nc' },
      // Bottom power outputs (2/T1, 4/T2, 6/T3)
      { id: '2', label: '2/T1', x: 43, y: 320, type: 'relay_out' },
      { id: '4', label: '4/T2', x: 103, y: 320, type: 'relay_out' },
      { id: '6', label: '6/T3', x: 173, y: 320, type: 'relay_out' },
    ],
  },
  {
    id: 'kt-1',
    type: COMPONENT_TYPES.TIMER_RELAY,
    name: 'Relé Temporizador',
    tag: 'KT1',
    x: 920,
    y: 410,
    templateOnly: true, // Available in the catalog, not auto-loaded by presets
    state: {
      energized: false,
      mode: 'ON_DELAY',
      rangeIndex: 1, // 10s
      timeVal: 0.5,  // 0.5
      delay: 5,      // 10s * 0.5 = 5s
      timedOut: false,
      holding: false,
      timerStartedAt: null,
    },
    terminals: Object.values(TIMER_RELAY_TERMINALS),
  },
  {
    id: 'motor-1',
    type: COMPONENT_TYPES.MOTOR_6P,
    name: 'Motor Trifásico 6 Pontas',
    tag: 'M1',
    x: 620,
    y: 410,
    state: {
      running: false,
      rpm: 0,
      direction: 'CW',
      phaseError: null,
      connectionType: 'NONE', // Aberto (não vem pré-fechado em estrela)
    },
    terminals: [
      // Top row: W2, U2, V2
      { id: 'W2', label: 'W2', x: 76, y: 50, type: 'motor_coil' },
      { id: 'U2', label: 'U2', x: 130, y: 50, type: 'motor_coil' },
      { id: 'V2', label: 'V2', x: 184, y: 50, type: 'motor_coil' },
      // Bottom row: U1, V1, W1
      { id: 'U1', label: 'U1', x: 76, y: 96, type: 'motor_coil' },
      { id: 'V1', label: 'V1', x: 130, y: 96, type: 'motor_coil' },
      { id: 'W1', label: 'W1', x: 184, y: 96, type: 'motor_coil' },
      // Frame Ground PE
      { id: 'PE', label: 'PE', x: 208, y: 73, type: 'motor_ground' },
    ],
  },
  {
    id: 'h1-1',
    type: COMPONENT_TYPES.PILOT_LIGHT,
    name: 'Lâmpada LED Bulbo E27 (220V)',
    tag: 'H1',
    x: 820,
    y: 180,
    state: {
      lit: false,
      color: 'warm_white',
    },
    terminals: [
      { id: 'X1', label: 'Rosca (E27)', x: 20, y: 136, type: 'light_terminal' },
      { id: 'X2', label: 'Pé Central', x: 45, y: 172, type: 'light_terminal' },
    ],
  },
  {
    id: 'din-rail-1',
    type: COMPONENT_TYPES.DIN_RAIL,
    name: 'Trilho DIN TS-35 (35mm)',
    tag: 'TRILHO',
    x: 40,
    y: 200,
    templateOnly: true,
    state: {
      length: 800,
    },
    terminals: [],
  },
];
