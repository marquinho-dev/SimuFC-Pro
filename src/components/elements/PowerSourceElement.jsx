import React, { useState, useEffect } from 'react';
import { sounds } from '../../services/soundEffects';

/**
 * Medidor Eletrônico de Energia Elétrica Trifásico (Padrão de Entrada / Fonte de Tensão)
 * VOLTEX VX-3300T - 3 Fases + Neutro (Sem terra)
 * - Entrada de energia pelo lado esquerdo (conduíte + cabos da rede nos bornes 1, 2, 3, 4)
 * - Saída de energia pelo lado direito (bornes 5, 6, 7, 8 para alimentar o circuito: N, L1 out, L2 out, L3 out)
 * - Botão físico DISPLAY no painel frontal (cx: 188, cy: 185) para alternar as grandezas elétricas
 * - Display LCD animado: Tensão (V), Corrente (A), Fator de Potência (FP), Potência Ativa (kW) e Consumo (kWh)
 */
export default function PowerSourceElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onOpenSettings,
  isSimulationMode = false,
}) {
  const isPowered = component.state?.powered !== false;
  const isMeterActive = Boolean(isSimulationMode && isPowered);
  const phasesEnabled = component.state?.phasesEnabled || { L1: true, L2: true, L3: true };
  const vStandard = component.state?.voltageStandard || '380_220';
  const baseVoltage = component.state?.vL1 || (vStandard.startsWith('220') ? 127 : 220);
  const cid = component.id;

  // Estado da grandeza ativa no Display LCD (0: V, 1: A, 2: FP, 3: kW, 4: kWh)
  const [displayMode, setDisplayMode] = useState(0);

  // Variação micro-animada realista para o display digital
  const [tick, setTick] = useState(0);
  const [accumulatedKwh, setAccumulatedKwh] = useState(4827.65);
  const [pulseActive, setPulseActive] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  // Detecta se há carga ativa ligada (ex: algum borne do medidor com corrente no circuito)
  const isCircuitEnergized = isMeterActive && terminalVoltages && terminalVoltages.size > 2;

  // Efeito de animação do medidor: micro-oscilações dos sensores e pulso de LED
  useEffect(() => {
    if (!isMeterActive) return;

    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % 100);

      if (isCircuitEnergized) {
        setAccumulatedKwh((prev) => prev + 0.0003);
        setPulseActive((prev) => !prev);
      } else {
        setPulseActive(false);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isMeterActive, isCircuitEnergized]);

  // Tensões individuais de cada fase (L1, L2, L3)
  const vL1Setting = component.state?.vL1 ?? (vStandard.startsWith('220') ? 127 : 220);
  const vL2Setting = component.state?.vL2 ?? (vStandard.startsWith('220') ? 127 : 220);
  const vL3Setting = component.state?.vL3 ?? (vStandard.startsWith('220') ? 127 : 220);

  // Micro-flutuações realistas individuais de cada fase (simulando medidor de precisão)
  const f1 = ((tick % 5) - 2) * 0.15;
  const f2 = (((tick + 2) % 5) - 2) * 0.14;
  const f3 = (((tick + 4) % 5) - 2) * 0.16;

  const displayVL1 = isMeterActive && phasesEnabled.L1 !== false ? (vL1Setting + f1).toFixed(1) : '00.0';
  const displayVL2 = isMeterActive && phasesEnabled.L2 !== false ? (vL2Setting + f2).toFixed(1) : '00.0';
  const displayVL3 = isMeterActive && phasesEnabled.L3 !== false ? (vL3Setting + f3).toFixed(1) : '00.0';

  // Frequência da Rede AC: 60.00 Hz nominal com sutil variação de rede
  const freqFlicker = isCircuitEnergized ? ((tick % 5) - 2) * 0.02 : 0;
  const displayFrequency = isMeterActive ? (60.0 + freqFlicker).toFixed(2) : '00.00';

  // Informações de cada modo de exibição: Tensões Individuais (L1, L2, L3) e Frequência (Hz)
  const displayModesData = [
    {
      id: 'V_L1',
      topLabel: 'TENSÃO FASE L1',
      subText: `▲ V1-N = ${displayVL1}V`,
      mainText: displayVL1,
      unit: 'V',
      phaseText: 'L1',
      activePhase: 'L1',
    },
    {
      id: 'V_L2',
      topLabel: 'TENSÃO FASE L2',
      subText: `▲ V2-N = ${displayVL2}V`,
      mainText: displayVL2,
      unit: 'V',
      phaseText: 'L2',
      activePhase: 'L2',
    },
    {
      id: 'V_L3',
      topLabel: 'TENSÃO FASE L3',
      subText: `▲ V3-N = ${displayVL3}V`,
      mainText: displayVL3,
      unit: 'V',
      phaseText: 'L3',
      activePhase: 'L3',
    },
    {
      id: 'HZ',
      topLabel: 'FREQUÊNCIA',
      subText: '▲ REDE AC 60Hz',
      mainText: displayFrequency,
      unit: 'Hz',
      phaseText: 'Hz',
      activePhase: 'Hz',
    },
  ];

  const currentDisplay = displayModesData[displayMode % displayModesData.length];

  // Alterna grandeza ao clicar no botão físico DISPLAY ou no LCD (somente na simulação)
  const handleNextMode = (e) => {
    e.stopPropagation();
    if (!isMeterActive) return;
    sounds.playButtonClick();
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 180);
    setDisplayMode((prev) => (prev + 1) % displayModesData.length);
  };

  // IDs únicos para gradientes e filtros SVG por componente
  const bodyId = `body-${cid}`;
  const panelId = `panel-${cid}`;
  const housingId = `housing-${cid}`;
  const lcdId = `lcd-${cid}`;
  const termBodyId = `termBody-${cid}`;
  const brassId = `brass-${cid}`;
  const ledGreenId = `ledGreen-${cid}`;
  const ledRedId = `ledRed-${cid}`;
  const ledAmberId = `ledAmber-${cid}`;
  const btnRingId = `btnRing-${cid}`;
  const btnCapId = `btnCap-${cid}`;
  const shadowId = `shadow-${cid}`;
  const glowId = `glow-${cid}`;
  const screwId = `screw-${cid}`;
  const terminalDefId = `terminal-${cid}`;
  const copperId = `copper-${cid}`;
  const washId = `wash-${cid}`;
  const washInId = `washIn-${cid}`;
  const holeGId = `holeG-${cid}`;
  const hL1Id = `hL1-${cid}`;
  const hL2Id = `hL2-${cid}`;
  const hL3Id = `hL3-${cid}`;
  const cNId = `cN-${cid}`;

  // Terminais interativos no medidor (Da esquerda para direita: 1..4 entrada da rede, 5..8 saída para o circuito)
  const interactiveTerminals = [
    // Saídas no lado direito (Alimentação do circuito: 5: N sai, 6: L1 sai, 7: L2 sai, 8: L3 sai)
    { id: 'N',  alias: '5', label: '5 (N sai)',  phase: 'N',  x: 439, y: 535, color: '#3fa5e3', isOutput: true },
    { id: 'L1', alias: '6', label: '6 (L1 sai)', phase: 'L1', x: 516, y: 535, color: '#7a4a24', isOutput: true },
    { id: 'L2', alias: '7', label: '7 (L2 sai)', phase: 'L2', x: 593, y: 535, color: '#26282c', isOutput: true },
    { id: 'L3', alias: '8', label: '8 (L3 sai)', phase: 'L3', x: 670, y: 535, color: '#9aa0a8', isOutput: true },
    // Bornes de entrada no lado esquerdo (1: L1 in, 2: L2 in, 3: L3 in, 4: N in)
    { id: '1', alias: 'L1_in', label: '1 (L1 in)', phase: 'L1', x: 131, y: 535, color: '#7a4a24', isOutput: false },
    { id: '2', alias: 'L2_in', label: '2 (L2 in)', phase: 'L2', x: 208, y: 535, color: '#26282c', isOutput: false },
    { id: '3', alias: 'L3_in', label: '3 (L3 in)', phase: 'L3', x: 285, y: 535, color: '#9aa0a8', isOutput: false },
    { id: '4', alias: 'N_in',  label: '4 (N in)',  phase: 'N',  x: 362, y: 535, color: '#3fa5e3', isOutput: false },
  ];

  return (
    <div
      className={`meter-power-source-plate ${isPowered ? 'is-powered' : 'is-unpowered'}`}
      style={{
        width: '400px',
        height: '480px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 960"
        width="400"
        height="480"
        fontFamily="Helvetica, Arial, sans-serif"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfcfd" />
            <stop offset="1" stopColor="#d6dbe1" />
          </linearGradient>
          <linearGradient id={panelId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f5f8" />
            <stop offset="1" stopColor="#e1e5ea" />
          </linearGradient>
          <linearGradient id={housingId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef1f4" />
            <stop offset="1" stopColor="#ccd2d9" />
          </linearGradient>
          <linearGradient id={lcdId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={isMeterActive ? '#d3e2a9' : '#889178'} />
            <stop offset="1" stopColor={isMeterActive ? '#a9bf79' : '#6b755c'} />
          </linearGradient>
          <linearGradient id={termBodyId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2b2f36" />
            <stop offset="0.5" stopColor="#4a505a" />
            <stop offset="1" stopColor="#2b2f36" />
          </linearGradient>
          <radialGradient id={brassId} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#f8e8ab" />
            <stop offset="0.5" stopColor="#cc9d3f" />
            <stop offset="1" stopColor="#7a5217" />
          </radialGradient>
          <radialGradient id={ledGreenId} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#b9ffcb" />
            <stop offset="1" stopColor="#1fb04f" />
          </radialGradient>
          <radialGradient id={ledRedId} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#ffc2b8" />
            <stop offset="1" stopColor="#d93a24" />
          </radialGradient>
          <radialGradient id={ledAmberId} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#ffe9a8" />
            <stop offset="1" stopColor="#e59a12" />
          </radialGradient>
          <radialGradient id={btnRingId} cx="0.4" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#f4f6f8" />
            <stop offset="1" stopColor="#aab2bb" />
          </radialGradient>
          <radialGradient id={btnCapId} cx="0.38" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#5b6673" />
            <stop offset="0.6" stopColor="#2f3741" />
            <stop offset="1" stopColor="#1b2027" />
          </radialGradient>
          <linearGradient id={copperId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8a4a1c" />
            <stop offset="0.45" stopColor="#e29a5a" />
            <stop offset="1" stopColor="#8a4a1c" />
          </linearGradient>

          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#1a2230" floodOpacity="0.28" />
          </filter>
          <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Parafuso de borne (fenda + Phillips) */}
          <g id={screwId}>
            <circle r="19" fill={`url(#${brassId})`} stroke="#5c3d10" strokeWidth="1.5" />
            <circle r="14" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
            <rect x="-15" y="-2.8" width="30" height="5.6" rx="2" fill="#4a3210" fillOpacity="0.85" />
            <rect x="-2.8" y="-15" width="5.6" height="30" rx="2" fill="#4a3210" fillOpacity="0.85" />
            <ellipse cx="-7" cy="-9" rx="5" ry="3" fill="#ffffff" fillOpacity="0.35" transform="rotate(-35 -7 -9)" />
          </g>

          {/* Borne completo com abertura inferior */}
          <g id={terminalDefId}>
            <rect x="-29" y="-45" width="58" height="140" rx="12" fill={`url(#${termBodyId})`} stroke="#16181c" strokeWidth="1.5" />
            <rect x="-24" y="-40" width="48" height="52" rx="9" fill="#14161a" fillOpacity="0.65" />
            <use href={`#${screwId}`} />
            <path d="M-17 95 V53 Q-17 42 -6 42 H6 Q17 42 17 53 V95 Z" fill="#0f1114" stroke="#000" strokeWidth="1" />
            <rect x="-11" y="50" width="22" height="26" rx="7" fill="#b8742e" fillOpacity="0.55" />
          </g>

          <radialGradient id={washId} cx="0.38" cy="0.32" r="0.9">
            <stop offset="0" stopColor="#f7f8fa" />
            <stop offset="0.55" stopColor="#b9c0c8" />
            <stop offset="1" stopColor="#7c858f" />
          </radialGradient>
          <radialGradient id={washInId} cx="0.4" cy="0.35" r="0.9">
            <stop offset="0" stopColor="#d5dae0" />
            <stop offset="0.5" stopColor="#8b949e" />
          </radialGradient>
          <radialGradient id={holeGId} cx="0.5" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#26292e" />
            <stop offset="1" stopColor="#050607" />
          </radialGradient>

          {/* Cabos que sobem do fundo do conduíte inferior até os bornes 1, 2, 3 e 4 */}
          <path id={hL1Id} fill="none" d="M368,876 C358,780 131,690 131,608" />
          <path id={hL2Id} fill="none" d="M382,885 C376,780 208,690 208,608" />
          <path id={hL3Id} fill="none" d="M396,888 C394,780 285,690 285,608" />
          <path id={cNId}  fill="none" d="M410,888 C410,780 362,690 362,608" />
        </defs>

        {/* Aba de fixação superior mecânica */}
        <rect x="370" y="8" width="60" height="36" rx="12" fill="#c9cfd6" stroke="#aab1ba" />
        <circle cx="400" cy="22" r="6" fill="#8e96a1" />

        <g filter={`url(#${shadowId})`}>
          {/* Corpo principal */}
          <rect x="40" y="30" width="720" height="440" rx="30" fill={`url(#${bodyId})`} stroke="#b4bbc4" strokeWidth="2" />
          {/* Carcaça inferior */}
          <rect x="60" y="440" width="680" height="250" rx="22" fill={`url(#${housingId})`} stroke="#aeb6bf" strokeWidth="2" />
        </g>

        {/* Parafusos da tampa */}
        <g transform="translate(58,52) scale(0.4)"><use href={`#${screwId}`} /></g>
        <g transform="translate(742,52) scale(0.4)"><use href={`#${screwId}`} /></g>

        {/* Painel frontal */}
        <rect x="70" y="70" width="660" height="330" rx="18" fill={`url(#${panelId})`} stroke="#c2c9d1" />

        {/* Cabeçalho */}
        <text x="100" y="110" fontSize="26" fontWeight="700" fill="#2b3440">VX-3300T</text>
        <polygon points="352,86 366,86 360,98 372,98 354,122 358,104 346,104" fill="#0b6fb8" transform="translate(-48,0)" />
        <text x="338" y="112" fontSize="26" fontWeight="800" letterSpacing="5" fill="#0b4f8a">VOLTEX</text>
        <text x="400" y="128" fontSize="9" fill="#6b7581" textAnchor="middle" letterSpacing="1">CNPJ 00.000.000/0001-00</text>
        <rect x="640" y="82" width="62" height="40" rx="8" fill="none" stroke="#2b3440" strokeWidth="1.5" />
        <text x="671" y="98" fontSize="9" fontWeight="700" fill="#2b3440" textAnchor="middle">CERT.</text>
        <text x="671" y="112" fontSize="9" fill="#2b3440" textAnchor="middle">0451/2026</text>

        {/* LED ligado */}
        {isMeterActive && (
          <circle cx="120" cy="190" r="14" fill="#23d160" opacity="0.55" filter={`url(#${glowId})`} />
        )}
        <circle cx="120" cy="190" r="8" fill={isMeterActive ? `url(#${ledGreenId})` : '#4b5563'} stroke={isMeterActive ? '#146b30' : '#1f2937'} />
        <text x="120" y="216" fontSize="13" fontWeight="700" fill="#2b3440" textAnchor="middle">Ligado</text>

        {/* =================================================================
            BOTÃO FÍSICO DE NAVEGAÇÃO DO DISPLAY (cx: 188, cy: 185)
            ================================================================= */}
        <g
          className="meter-display-button-interactive"
          onClick={handleNextMode}
          style={{ cursor: isMeterActive ? 'pointer' : 'not-allowed', transition: 'transform 0.1s ease', opacity: isMeterActive ? 1 : 0.7 }}
          transform={btnPressed && isMeterActive ? 'translate(0, 1.5)' : 'translate(0, 0)'}
          title={isMeterActive ? "Clique para alternar: Tensão L1 → Tensão L2 → Tensão L3 → Frequência (Hz)" : "Inicie a simulação para operar o medidor"}
        >
          <circle cx="188" cy="187" r="19" fill="#9aa2ac" fillOpacity="0.35" />
          <circle cx="188" cy="185" r="17" fill={`url(#${btnRingId})`} stroke="#8d96a1" strokeWidth="1.2" />
          <circle cx="188" cy="185" r="12" fill={`url(#${btnCapId})`} stroke="#12161b" strokeWidth="1" />
          <ellipse cx="184" cy="180" rx="6" ry="3.5" fill="#ffffff" fillOpacity="0.28" transform="rotate(-30 184 180)" />
          <text x="188" y="216" fontSize="9" fontWeight="700" fill="#2b3440" textAnchor="middle" letterSpacing="1">
            DISPLAY
          </text>
        </g>

        {/* =================================================================
            DISPLAY LCD ANIMADO (Interativo: clique no LCD ou no botão)
            ================================================================= */}
        <g
          onClick={handleNextMode}
          style={{ cursor: isMeterActive ? 'pointer' : 'default' }}
          title={isMeterActive ? "Clique para alternar grandezas: Tensão Individual (L1, L2, L3) e Frequência" : "Display inativo (inicie a simulação)"}
        >
          <rect x="245" y="135" width="310" height="100" rx="12" fill="#262b32" stroke="#12151a" strokeWidth="2" />
          <rect x="255" y="145" width="290" height="80" rx="6" fill={`url(#${lcdId})`} />
          <rect x="255" y="145" width="290" height="22" rx="6" fill="#ffffff" fillOpacity={isMeterActive ? "0.10" : "0.04"} />

          {/* Segmentos apagados de fundo (efeito LCD real 888888.88) */}
          <text x="520" y="196" fontFamily="Courier New, monospace" fontSize="38" fontWeight="700" fill="#1d2a14" fillOpacity={isMeterActive ? "0.08" : "0.03"} textAnchor="end">
            888888.88
          </text>

          {/* Leitura e informações no LCD - exibidas apenas durante a simulação ativa */}
          {isMeterActive && (
            <>
              {/* Leitura digital principal da grandeza selecionada */}
              <text x="520" y="196" fontFamily="Courier New, monospace" fontSize="38" fontWeight="700" fill="#1d2a14" fillOpacity="0.95" textAnchor="end">
                {currentDisplay.mainText}
              </text>

              {/* Indicadores de Fase individuais no topo esquerdo do LCD */}
              <text x="268" y="164" fontSize="11" fill="#1d2a14">
                <tspan
                  fontWeight={currentDisplay.activePhase === 'L1' ? '900' : '600'}
                  fillOpacity={currentDisplay.activePhase === 'L1' ? '1' : '0.28'}
                >
                  L1{currentDisplay.activePhase === 'L1' ? '▸ ' : '  '}
                </tspan>
                <tspan
                  fontWeight={currentDisplay.activePhase === 'L2' ? '900' : '600'}
                  fillOpacity={currentDisplay.activePhase === 'L2' ? '1' : '0.28'}
                >
                  L2{currentDisplay.activePhase === 'L2' ? '▸ ' : '  '}
                </tspan>
                <tspan
                  fontWeight={currentDisplay.activePhase === 'L3' ? '900' : '600'}
                  fillOpacity={currentDisplay.activePhase === 'L3' ? '1' : '0.28'}
                >
                  L3{currentDisplay.activePhase === 'L3' ? '▸ ' : '  '}
                </tspan>
                <tspan
                  fontWeight={currentDisplay.activePhase === 'Hz' ? '900' : '600'}
                  fillOpacity={currentDisplay.activePhase === 'Hz' ? '1' : '0.28'}
                >
                  Hz{currentDisplay.activePhase === 'Hz' ? '▸' : ''}
                </tspan>
              </text>

              {/* Rótulo superior da grandeza */}
              <text x="532" y="164" fontSize="10" fontWeight="700" fill="#1d2a14" fillOpacity="0.88" textAnchor="end">
                {currentDisplay.topLabel}
              </text>

              {/* Sub-rótulo com indicação individual de fase/frequência */}
              <text x="268" y="215" fontSize="10" fontWeight="700" fill="#1d2a14" fillOpacity="0.88">
                {currentDisplay.subText}
              </text>

              {/* Unidade (V ou Hz) */}
              <text x="532" y="217" fontSize="14" fontWeight="800" fill="#1d2a14" fillOpacity="0.92" textAnchor="end">
                {currentDisplay.unit}
              </text>
            </>
          )}
        </g>

        <text x="400" y="254" fontSize="10" fill="#5d6773" textAnchor="middle">Portaria Fictícia No. 000/2026</text>

        {/* LEDs de pulso */}
        {isMeterActive && (pulseActive || isCircuitEnergized) && (
          <circle cx="592" cy="164" r="12" fill="#e03a22" opacity="0.45" filter={`url(#${glowId})`} />
        )}
        <circle cx="592" cy="164" r="7" fill={isMeterActive ? `url(#${ledRedId})` : '#4b5563'} stroke={isMeterActive ? '#7e1b0f' : '#1f2937'} />
        <text x="608" y="162" fontSize="12" fontWeight="700" fill="#2b3440">1 Wh/pulso</text>
        <text x="608" y="177" fontSize="10" fill="#5d6773">Ke = Kh</text>

        {isMeterActive && (
          <circle cx="592" cy="218" r="12" fill="#f0a312" opacity="0.3" filter={`url(#${glowId})`} />
        )}
        <circle cx="592" cy="218" r="7" fill={isMeterActive ? `url(#${ledAmberId})` : '#4b5563'} stroke={isMeterActive ? '#8a5b07' : '#1f2937'} />
        <text x="608" y="216" fontSize="12" fontWeight="700" fill="#2b3440">1 varh/pulso</text>
        <text x="608" y="231" fontSize="10" fill="#5d6773">Ke = Kh</text>

        {/* Placa de características */}
        <g fontSize="12" fill="#2b3440">
          <text x="100" y="292" fontWeight="700">Medidor Eletrônico de Energia Elétrica</text>
          <text x="100" y="310">3 Fases - 4 Fios - 3 Elementos</text>
          <text x="100" y="328" fontWeight="700">Classe B   15(120)A   60Hz   127/220V</text>
          <text x="100" y="346">Tampa solidária</text>
          <text x="100" y="364">Ano de fabricação: 03/2026</text>
        </g>

        {/* Número de série e código de barras */}
        <text x="330" y="312" fontSize="38" fontWeight="700" letterSpacing="5" fill="#1e2630">7084213</text>
        <path
          d="M330 345 H540"
          stroke="#1e2630"
          strokeWidth="46"
          strokeDasharray="3 2 1 3 2 2 4 1 2 3 1 1 3 2 4 2 1 2 3 1 2 4 1 3 2 1 1 3 2 2 1 4 2 1 3 1"
        />

        {/* Esquema de ligação */}
        <text x="638" y="281" fontSize="9" fill="#5d6773" textAnchor="middle" letterSpacing="1">ESQUEMA DE LIGAÇÃO</text>
        <g fill="none" stroke="#2b3440" strokeWidth="1.3" strokeLinejoin="round">
          <path d="M575 318 V292 H665 V318" />
          <path d="M593 318 V299 H683 V318" />
          <path d="M611 318 V306 H701 V318" />
          <path d="M629 318 V312 H647 V318" />
        </g>
        <g fill="#f3f5f8" stroke="#2b3440" strokeWidth="1.3">
          <circle cx="620" cy="292" r="4.5" />
          <circle cx="638" cy="299" r="4.5" />
          <circle cx="656" cy="306" r="4.5" />
        </g>
        <g fill="none" stroke="#2b3440" strokeWidth="1.3" strokeLinejoin="round">
          <path d="M552 341 H575 V332" />
          <path d="M552 348 H593 V332" />
          <path d="M552 355 H611 V332" />
          <path d="M552 362 H629 V332" />
        </g>
        <g fill="#2b3440" fontSize="8" fontWeight="700" textAnchor="end">
          <text x="548" y="344">L1</text>
          <text x="548" y="351">L2</text>
          <text x="548" y="358">L3</text>
          <text x="548" y="365">N</text>
        </g>
        <g fill="#ffffff" stroke="#2b3440" strokeWidth="1.1">
          <rect x="568" y="318" width="14" height="14" rx="2" />
          <rect x="586" y="318" width="14" height="14" rx="2" />
          <rect x="604" y="318" width="14" height="14" rx="2" />
          <rect x="622" y="318" width="14" height="14" rx="2" />
          <rect x="640" y="318" width="14" height="14" rx="2" />
          <rect x="658" y="318" width="14" height="14" rx="2" />
          <rect x="676" y="318" width="14" height="14" rx="2" />
          <rect x="694" y="318" width="14" height="14" rx="2" />
        </g>
        <g fontSize="8" fontWeight="700" fill="#2b3440" textAnchor="middle">
          <text x="575" y="328">1</text>
          <text x="593" y="328">2</text>
          <text x="611" y="328">3</text>
          <text x="629" y="328">4</text>
          <text x="647" y="328">5</text>
          <text x="665" y="328">6</text>
          <text x="683" y="328">7</text>
          <text x="701" y="328">8</text>
        </g>

        {/* Faixa inferior do painel */}
        <text x="400" y="424" fontSize="10" fill="#7a848f" textAnchor="middle" letterSpacing="2">
          INDÚSTRIA BRASILEIRA • USO EXTERNO / INTERNO • IP54
        </text>

        {/* Base do bloco de terminais */}
        <rect x="90" y="470" width="620" height="190" rx="12" fill="#c3c9d1" stroke="#a5adb7" />

        {/* Numeração acima dos bornes */}
        <g fontSize="13" fontWeight="700" fill="#2b3440" textAnchor="middle">
          <text x="131" y="488">1</text><text x="208" y="488">2</text>
          <text x="285" y="488">3</text><text x="362" y="488">4</text>
          <text x="439" y="488">5</text><text x="516" y="488">6</text>
          <text x="593" y="488">7</text><text x="670" y="488">8</text>
        </g>

        {/* 8 Bornes com parafuso */}
        <use href={`#${terminalDefId}`} x="131" y="535" />
        <use href={`#${terminalDefId}`} x="208" y="535" />
        <use href={`#${terminalDefId}`} x="285" y="535" />
        <use href={`#${terminalDefId}`} x="362" y="535" />
        <use href={`#${terminalDefId}`} x="439" y="535" />
        <use href={`#${terminalDefId}`} x="516" y="535" />
        <use href={`#${terminalDefId}`} x="593" y="535" />
        <use href={`#${terminalDefId}`} x="670" y="535" />

        {/* =================================================================
            IDENTIFICAÇÃO DAS SAÍDAS NO LADO DIREITO (Alimentação do Circuito)
            Da esquerda para direita: 5: N, 6: L1 out, 7: L2 out, 8: L3 out
            ================================================================= */}
        <g fontSize="11" fontWeight="700" fill="#4a5360" textAnchor="middle">
          <text x="439" y="650">N sai</text>
          <text x="516" y="650">L1 sai</text>
          <text x="593" y="650">L2 sai</text>
          <text x="670" y="650">L3 sai</text>
        </g>

        {/* =================================================================
            CONDUTORES DE ENTRADA NO LADO INFERIOR (Ramal vindo do Eletroduto)
            ================================================================= */}
        {/* Pontas de cobre nos bornes 1, 2, 3 e 4 (fases e neutro conectados) */}
        <g fill={`url(#${copperId})`} stroke="#6b3a14" strokeWidth="1">
          <rect x="126" y="580" width="10" height="34" rx="2" />
          <rect x="203" y="580" width="10" height="34" rx="2" />
          <rect x="280" y="580" width="10" height="34" rx="2" />
          <rect x="357" y="580" width="10" height="34" rx="2" />
        </g>

        {/* Arruela de unidut (o eletroduto fica escondido atrás) */}
        <g filter={`url(#${shadowId})`}>
          <circle cx="400" cy="838" r="84" fill={`url(#${washId})`} stroke="#5f666f" strokeWidth="2" />
        </g>
        <circle cx="400" cy="838" r="78" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" />
        <circle cx="400" cy="838" r="68" fill={`url(#${washInId})`} stroke="#6b737d" strokeWidth="1.5" />
        <circle cx="400" cy="838" r="59" fill="#99a2ac" stroke="#4f565f" strokeWidth="1.5" />
        <circle cx="400" cy="838" r="55" fill="none" stroke="#4a5159" strokeWidth="3" strokeDasharray="3 3" strokeOpacity="0.7" />
        <ellipse cx="372" cy="792" rx="26" ry="9" fill="#ffffff" fillOpacity="0.45" transform="rotate(-30 372 792)" />
        <circle cx="400" cy="838" r="50" fill={`url(#${holeGId})`} stroke="#0a0b0d" strokeWidth="2.5" />

        {/* Cabos emergindo do interior do eletroduto */}
        <g fill="none" strokeLinecap="butt" strokeLinejoin="round">
          {/* Contorno */}
          <g stroke="#0b0c0e" strokeWidth="18">
            <use href={`#${hL1Id}`} />
            <use href={`#${hL2Id}`} />
            <use href={`#${hL3Id}`} />
            <use href={`#${cNId}`} />
          </g>
          {/* Cores */}
          <use href={`#${hL1Id}`} stroke="#7a4a24" strokeWidth="14" />
          <use href={`#${hL2Id}`} stroke="#26282c" strokeWidth="14" />
          <use href={`#${hL3Id}`} stroke="#9aa0a8" strokeWidth="14" />
          <use href={`#${cNId}`}  stroke="#3fa5e3" strokeWidth="14" />
          {/* Brilho */}
          <g stroke="#ffffff" strokeOpacity="0.28" strokeWidth="3" transform="translate(-3,-3)">
            <use href={`#${hL1Id}`} />
            <use href={`#${hL2Id}`} />
            <use href={`#${hL3Id}`} />
            <use href={`#${cNId}`} />
          </g>
        </g>

        {/* Legenda de condutores (sem terra) */}
        <rect x="20" y="770" width="210" height="122" rx="8" fill="#ffffff" fillOpacity="0.92" stroke="#8d96a1" />
        <text x="34" y="792" fontSize="11" fontWeight="700" fill="#2b3440" letterSpacing="1">CONDUTORES</text>
        <g stroke="#0b0c0e" strokeWidth="0.8">
          <rect x="34" y="802" width="26" height="8" rx="3" fill="#7a4a24" />
          <rect x="34" y="822" width="26" height="8" rx="3" fill="#26282c" />
          <rect x="34" y="842" width="26" height="8" rx="3" fill="#9aa0a8" />
          <rect x="34" y="862" width="26" height="8" rx="3" fill="#3fa5e3" />
        </g>
        <g fontSize="11" fill="#2b3440">
          <text x="70" y="810">L1 → borne 1</text>
          <text x="70" y="830">L2 → borne 2</text>
          <text x="70" y="850">L3 → borne 3</text>
          <text x="70" y="870">Neutro → borne 4</text>
        </g>

        {/* =================================================================
            TERMINAIS INTERATIVOS (Área de conexão para os cabos do usuário)
            ================================================================= */}
        {interactiveTerminals.map((mt) => {
          const isSelected =
            activeTerminal?.componentId === cid &&
            (activeTerminal?.terminalId === mt.id || activeTerminal?.terminalId === mt.alias);

          const vKey = `${cid}:${mt.id}`;
          const isEnergized = Boolean(terminalVoltages?.get(vKey));

          return (
            <g
              key={mt.id}
              className={`meter-terminal-socket ${isSelected ? 'selected' : ''}`}
              transform={`translate(${mt.x}, ${mt.y})`}
              onClick={(e) => {
                e.stopPropagation();
                onTerminalClick(cid, mt.id);
              }}
              style={{ cursor: 'crosshair' }}
              title={`Borne ${mt.label} (${mt.phase}): ${isEnergized ? 'Energizado' : '0V'} • Clique para ligar o cabo`}
              data-terminal-target={`${cid}:${mt.id}`}
            >
              {/* Área sensível invisível ao redor para clique fácil */}
              <circle cx="0" cy="0" r={22} fill="transparent" />

              {/* Anel indicador da cor da fase */}
              <circle
                cx="0"
                cy="0"
                r={19}
                fill="none"
                stroke={mt.color}
                strokeWidth={isSelected ? '3.5' : mt.isOutput ? '2.2' : '1.4'}
                opacity={isSelected ? '1' : mt.isOutput ? '0.9' : '0.4'}
              />

              {/* Halo pulsante de seleção */}
              {isSelected && (
                <circle
                  cx="0"
                  cy="0"
                  r={24}
                  fill="none"
                  stroke="#00e676"
                  strokeWidth="3.2"
                  filter={`url(#${glowId})`}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
