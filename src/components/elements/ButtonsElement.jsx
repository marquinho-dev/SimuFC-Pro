import React, { useRef } from 'react';
import { sounds } from '../../services/soundEffects';

function getVoltageBadgeColor(v) {
  switch (v) {
    case 'L1':
      return '#a855f7';
    case 'L2':
      return '#ffffff';
    case 'L3':
      return '#ef4444';
    case 'N':
      return '#2563eb';
    case 'PE':
      return '#16a34a';
    default:
      return '#38bdf8';
  }
}

/* ==========================================================
   BOTOEIRA INDUSTRIAL REALISTA (CONFORME ESPECIFICAÇÃO SVG)
   Base quadrada escura, quatro bornes metálicos parafusados
   (13-14 NA para verde / 11-12 NF para vermelha), aro metálico
   e atuador côncavo com símbolo industrial IEC I / O.
   ========================================================== */
function RealisticPushbuttonSvg({
  component,
  type = 'start', // 'start' | 'stop' | 'emergency'
  isPressed,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onPointerDown,
  isSimulationMode = false,
}) {
  const componentId = component.id;
  const isStop = type === 'stop';
  const isEmergency = type === 'emergency';
  const isStart = !isStop && !isEmergency;

  // Ids escopados para gradientes e filtros SVG
  const baseGradId = `baseGrad-${componentId}`;
  const greenGradId = `greenGrad-${componentId}`;
  const redGradId = `redGrad-${componentId}`;
  const metalGradId = `metalGrad-${componentId}`;
  const screwGradId = `screwGrad-${componentId}`;
  const shadowFilterId = `shadow-${componentId}`;
  const glowFilterId = `glow-${componentId}`;

  // Terminais: para start (13, 14, 13_bot, 14_bot), para stop/emerg (11, 12, 11_bot, 12_bot)
  const termTopLeftId = isStart ? '13' : '11';
  const termTopRightId = isStart ? '14' : '12';
  const termBotLeftId = isStart ? '13_bot' : '11_bot';
  const termBotRightId = isStart ? '14_bot' : '12_bot';

  const labelLeft = isStart ? '13' : '11';
  const labelRight = isStart ? '14' : '12';

  // Helpers de estado para cada borne
  const getTermState = (termId, aliasId) => {
    const v =
      terminalVoltages.get(`${componentId}:${termId}`) ||
      (aliasId ? terminalVoltages.get(`${componentId}:${aliasId}`) : null);

    const isSelected =
      activeTerminal?.componentId === componentId &&
      (activeTerminal?.terminalId === termId || activeTerminal?.terminalId === aliasId);

    return {
      voltage: v,
      isPowered: Boolean(v),
      isSelected,
      isConnecting: Boolean(activeTerminal),
    };
  };

  const topLeftState = getTermState(termTopLeftId, isStart ? '3' : '1');
  const topRightState = getTermState(termTopRightId, isStart ? '4' : '2');
  const botLeftState = getTermState(termBotLeftId, null);
  const botRightState = getTermState(termBotRightId, null);

  const renderScrewTerminal = (cx, cy, bossX, bossY, plateX, plateY, termId, state) => {
    return (
      <g
        className={`pushbutton-screw-terminal-group ${state.isSelected ? 'selected' : ''} ${
          state.isConnecting ? 'wire-target-ready' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, termId);
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Bloco moldado de carcaça integrado ao corpo */}
        <rect
          x={bossX}
          y={bossY}
          width="118"
          height="96"
          rx="14"
          fill={`url(#${baseGradId})`}
          stroke="#10131a"
          strokeWidth="6"
        />

        {/* Placa metálica condutora alojada no rebaixo */}
        <rect
          x={plateX}
          y={plateY}
          width="106"
          height="72"
          rx="8"
          fill={`url(#${metalGradId})`}
          stroke={state.isSelected ? '#38bdf8' : state.isConnecting ? '#4ade80' : '#20242d'}
          strokeWidth={state.isSelected || state.isConnecting ? '5' : '3.5'}
        />

        {/* Halo de indicação interativa quando selecionado ou arrastando fio */}
        {state.isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="32"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeDasharray="8 4"
            className="screw-selected-ring"
          />
        )}
        {state.isConnecting && !state.isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="30"
            fill="rgba(74, 222, 128, 0.2)"
            stroke="#4ade80"
            strokeWidth="3.5"
          />
        )}

        {/* Cavidade escura do parafuso */}
        <circle cx={cx} cy={cy} r="22" fill="#242936" />

        {/* Cabeça metálica usinada do parafuso */}
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill={`url(#${screwGradId})`}
          stroke="#171a22"
          strokeWidth="1.5"
        />

        {/* Fenda em cruz Phillips */}
        <path
          d={`M ${cx - 8} ${cy} L ${cx + 8} ${cy} M ${cx} ${cy - 8} L ${cx} ${cy + 8}`}
          stroke="#1f2937"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill="#1f2937" opacity="0.6" />

        {/* Ponto indicador de tensão elétrica energizada */}
        {state.isPowered && (
          <circle
            cx={cx}
            cy={cy}
            r="7"
            fill={getVoltageBadgeColor(state.voltage)}
            filter={`url(#${glowFilterId})`}
          />
        )}

        {/* Hotspot de clique preciso para conexão */}
        <circle
          cx={cx}
          cy={cy}
          r="34"
          fill="transparent"
          data-terminal-target={`${componentId}:${termId}`}
        />
      </g>
    );
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 700"
      width="100%"
      height="100%"
      className="industrial-pushbutton-svg"
      style={{ display: 'block', overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        {/* Base industrial escura */}
        <linearGradient id={baseGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#414653" />
          <stop offset="50%" stopColor="#171a22" />
          <stop offset="100%" stopColor="#303541" />
        </linearGradient>

        {/* Atuador verde esmeralda industrial */}
        <linearGradient id={greenGradId} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#19c7a2" />
          <stop offset="55%" stopColor="#00a985" />
          <stop offset="100%" stopColor="#00866d" />
        </linearGradient>

        {/* Atuador vermelho rubi industrial */}
        <linearGradient id={redGradId} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ff4b4b" />
          <stop offset="55%" stopColor="#d61a1a" />
          <stop offset="100%" stopColor="#8c0b0b" />
        </linearGradient>

        {/* Metal escovado dos bornes */}
        <linearGradient id={metalGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f7fa" />
          <stop offset="100%" stopColor="#a2a8b3" />
        </linearGradient>

        {/* Gradiente para os parafusos */}
        <linearGradient id={screwGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Sombra de projeção suave */}
        <filter id={shadowFilterId} x="-25%" y="-25%" width="150%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>

        {/* Brilho neon de terminal energizado */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sombra de base */}
      <ellipse
        cx="320"
        cy="640"
        rx="195"
        ry="16"
        fill="#000000"
        opacity="0.22"
        filter={`url(#${shadowFilterId})`}
      />

      {/* 4 BORNES INTEGRADOS À CARCAÇA (SUPERIORES E INFERIORES SIMÉTRICOS) */}
      {/* Topo Esquerdo (13 ou 11) */}
      {renderScrewTerminal(201, 122, 142, 80, 148, 86, termTopLeftId, topLeftState)}
      {/* Topo Direito (14 ou 12) */}
      {renderScrewTerminal(439, 122, 380, 80, 386, 86, termTopRightId, topRightState)}
      {/* Base Esquerda (13 ou 11) */}
      {renderScrewTerminal(201, 578, 142, 524, 148, 542, termBotLeftId, botLeftState)}
      {/* Base Direita (14 ou 12) */}
      {renderScrewTerminal(439, 578, 380, 524, 386, 542, termBotRightId, botRightState)}

      {/* CORPO PRINCIPAL - CAIXA QUADRADA INDUSTRIAL CENTRALIZADA */}
      <rect
        x="108"
        y="138"
        width="424"
        height="424"
        rx="34"
        fill={`url(#${baseGradId})`}
        stroke="#10131a"
        strokeWidth="7"
        style={{ pointerEvents: 'none' }}
      />
      <rect
        x="128"
        y="158"
        width="384"
        height="384"
        rx="24"
        fill="none"
        stroke="#555b68"
        strokeWidth="4"
        opacity="0.8"
        style={{ pointerEvents: 'none' }}
      />

      {/* 4 ORIFÍCIOS DE FIXAÇÃO NOS CANTOS DA BASE */}
      <g fill="#090b10" stroke="#555b68" strokeWidth="4" style={{ pointerEvents: 'none' }}>
        <circle cx="151" cy="181" r="13" />
        <circle cx="489" cy="181" r="13" />
        <circle cx="151" cy="519" r="13" />
        <circle cx="489" cy="519" r="13" />
      </g>

      {/* ARO METÁLICO USINADO (BEZEL) */}
      <circle
        cx="320"
        cy="350"
        r="177"
        fill="#080a0f"
        stroke="#565c68"
        strokeWidth="8"
        style={{ pointerEvents: 'none' }}
      />
      <circle
        cx="320"
        cy="350"
        r="161"
        fill="#20242e"
        stroke="#0a0c12"
        strokeWidth="5"
        style={{ pointerEvents: 'none' }}
      />

      {/* BOTÃO ATUADOR CENTRAL INTERATIVO (VERDE OU VERMELHO) */}
      <g
        className={`pushbutton-actuator-center ${!isSimulationMode ? 'actuator-locked' : ''}`}
        onPointerDown={isSimulationMode ? onPointerDown : undefined}
        style={{
          cursor: isSimulationMode ? 'pointer' : 'grab',
          transformOrigin: '320px 350px',
          transform: isPressed && isSimulationMode ? 'scale(0.96) translate(0px, 4px)' : 'none',
          transition: 'transform 0.06s ease',
        }}
      >
        {/* Atuador colorido */}
        <circle
          cx="320"
          cy="350"
          r="148"
          fill={isStart ? `url(#${greenGradId})` : `url(#${redGradId})`}
          stroke="#05080c"
          strokeWidth="5"
        />

        {/* Arco de reflexo especular */}
        <path
          d="M220 245 A146 146 0 0 1 321 203"
          fill="none"
          stroke={isStart ? '#8bf0d8' : '#ffa8a8'}
          strokeWidth="5"
          opacity="0.32"
          strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />

        {/* Símbolo IEC I / O */}
        <text
          x="320"
          y="328"
          fill="#ffffff"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize={isStart ? '52' : '50'}
          textAnchor="middle"
          style={{
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {isStart ? 'I' : 'O'}
        </text>

        {/* Palavra LIGA / DESLIGA grande e destacada */}
        <text
          x="320"
          y="386"
          fill="#ffffff"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize={isStart ? '48' : '40'}
          letterSpacing={isStart ? '5' : '3'}
          textAnchor="middle"
          style={{
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {isStart ? 'LIGA' : 'DESLIGA'}
        </text>
      </g>

      {/* IDENTIFICAÇÃO DOS BORNES (13-14 OU 11-12) */}
      <g
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="32"
        fontWeight="800"
        textAnchor="middle"
        style={{
          paintOrder: 'stroke fill',
          stroke: '#0f172a',
          strokeWidth: '6px',
          strokeLinejoin: 'round',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <text x="201" y="60">{labelLeft}</text>
        <text x="439" y="60">{labelRight}</text>
        <text x="201" y="662">{labelLeft}</text>
        <text x="439" y="662">{labelRight}</text>
      </g>
    </svg>
  );
}

/* ==========================================================
   BUTTON START (S1 - LIGA NA 13-14 / 3-4)
   ========================================================== */
export function ButtonStartElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
}) {
  const isPressed = Boolean(component.state?.pressed);
  const pressStartTimeRef = useRef(0);
  const timeoutRef = useRef(null);

  const handlePointerDown = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    pressStartTimeRef.current = Date.now();
    sounds.playButtonClick();
    onUpdateComponentState(component.id, { pressed: true });

    const handleWindowPointerUp = () => {
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
      const pressDuration = Date.now() - pressStartTimeRef.current;
      if (pressDuration < 200) {
        timeoutRef.current = setTimeout(() => {
          sounds.playButtonRelease();
          onUpdateComponentState(component.id, { pressed: false });
        }, 220);
      } else {
        sounds.playButtonRelease();
        onUpdateComponentState(component.id, { pressed: false });
      }
    };
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
  };

  return (
    <div
      className={`industrial-device button-device industrial-pushbutton-device button-start-device ${
        isPressed && isSimulationMode ? 'device-actuator-active' : ''
      }`}
      title="Botoeira Liga S1 (Contato NA 13-14: fecha ao pressionar)"
    >
      <RealisticPushbuttonSvg
        component={component}
        type="start"
        isPressed={isPressed && isSimulationMode}
        terminalVoltages={terminalVoltages}
        activeTerminal={activeTerminal}
        onTerminalClick={onTerminalClick}
        onPointerDown={handlePointerDown}
        isSimulationMode={isSimulationMode}
      />
    </div>
  );
}

/* ==========================================================
   BUTTON STOP (S0 - DESLIGA NF 11-12 / 1-2)
   ========================================================== */
export function ButtonStopElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
}) {
  const isPressed = Boolean(component.state?.pressed);
  const pressStartTimeRef = useRef(0);
  const timeoutRef = useRef(null);

  const handlePointerDown = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    pressStartTimeRef.current = Date.now();
    sounds.playButtonClick();
    onUpdateComponentState(component.id, { pressed: true });

    const handleWindowPointerUp = () => {
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
      const pressDuration = Date.now() - pressStartTimeRef.current;
      if (pressDuration < 200) {
        timeoutRef.current = setTimeout(() => {
          sounds.playButtonRelease();
          onUpdateComponentState(component.id, { pressed: false });
        }, 220);
      } else {
        sounds.playButtonRelease();
        onUpdateComponentState(component.id, { pressed: false });
      }
    };
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
  };

  return (
    <div
      className={`industrial-device button-device industrial-pushbutton-device button-stop-device ${
        isPressed && isSimulationMode ? 'device-actuator-active' : ''
      }`}
      title="Botoeira Desliga S0 (Contato NF 11-12: abre ao pressionar)"
    >
      <RealisticPushbuttonSvg
        component={component}
        type="stop"
        isPressed={isPressed && isSimulationMode}
        terminalVoltages={terminalVoltages}
        activeTerminal={activeTerminal}
        onTerminalClick={onTerminalClick}
        onPointerDown={handlePointerDown}
        isSimulationMode={isSimulationMode}
      />
    </div>
  );
}

/* ==========================================================
   BUTTON EMERGENCY (S00 - PARADA DE EMERGÊNCIA NF 11-12)
   Conforme especificação visual: placa quadrada amarela de segurança,
   texto curvado "EMERGENCY", cogumelo vermelho com 3 setas brancas
   curvadas de destravamento giratório e bornes circulares vermelhos.
   ========================================================== */
function RealisticEmergencyButtonSvg({
  component,
  isPressed,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onPointerDown,
  isSimulationMode = false,
}) {
  const componentId = component.id;

  // Ids escopados para gradientes e filtros SVG
  const yellowPlateGradId = `emergPlateGrad-${componentId}`;
  const yellowDiscGradId = `emergDiscGrad-${componentId}`;
  const emergBevelGradId = `emergBevelGrad-${componentId}`;
  const emergTopFaceGradId = `emergTopFaceGrad-${componentId}`;
  const emergCenterDomeGradId = `emergCenterDomeGrad-${componentId}`;
  const socketGradId = `emergSocketGrad-${componentId}`;
  const textArcId = `emergTextArc-${componentId}`;
  const glowFilterId = `emergGlow-${componentId}`;
  const shadowFilterId = `emergMushroomShadow-${componentId}`;

  // Caminho da seta curva em baixo-relevo
  const DEBOSSED_ARROW_PATH =
    'M 43.67 -27.29 L 51.31 -32.06 A 60.5 60.5 0 0 1 58.16 16.68 L 63.75 17.08 L 45.87 32.12 L 44.43 11.91 L 49.5 14.2 A 51.5 51.5 0 0 0 43.67 -27.29 Z';

  // Helper de estado para bornes (11 topo, 12 base)
  const getTermState = (primaryId, fallbackIds = []) => {
    let v = terminalVoltages.get(`${componentId}:${primaryId}`);
    if (!v) {
      for (const fId of fallbackIds) {
        v = terminalVoltages.get(`${componentId}:${fId}`);
        if (v) break;
      }
    }

    const isSelected =
      activeTerminal?.componentId === componentId &&
      (activeTerminal?.terminalId === primaryId || fallbackIds.includes(activeTerminal?.terminalId));

    return {
      voltage: v,
      isPowered: Boolean(v),
      isSelected,
      isConnecting: Boolean(activeTerminal),
    };
  };

  const topTermState = getTermState('11', ['11_bot', '1']);
  const botTermState = getTermState('12', ['12_bot', '2']);

  const renderSocketTerminal = (cx, cy, termId, label, state) => {
    return (
      <g
        className={`pushbutton-screw-terminal-group emergency-socket-group ${
          state.isSelected ? 'selected' : ''
        } ${state.isConnecting ? 'wire-target-ready' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, termId);
        }}
        style={{ cursor: 'pointer' }}
        data-terminal-target={`${componentId}:${termId}`}
      >
        {/* Halo de conexão / seleção */}
        {state.isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="38"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeDasharray="5 3"
            className="screw-selected-ring"
          />
        )}
        {state.isConnecting && !state.isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="36"
            fill="rgba(74, 222, 128, 0.2)"
            stroke="#4ade80"
            strokeWidth="2.5"
          />
        )}

        {/* Borda / carcaça externa vermelha do borne */}
        <circle
          cx={cx}
          cy={cy}
          r="30"
          fill={`url(#${socketGradId})`}
          stroke="#991b1b"
          strokeWidth="3"
        />

        {/* Anel metálico do receptáculo banana */}
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="2"
        />

        {/* Receptáculo interno */}
        <circle
          cx={cx}
          cy={cy}
          r="10"
          fill="#f8fafc"
          stroke="#64748b"
          strokeWidth="1.5"
        />

        {/* Indicador de energização elétrica */}
        {state.isPowered && (
          <circle
            cx={cx}
            cy={cy}
            r="9"
            fill={getVoltageBadgeColor(state.voltage)}
            filter={`url(#${glowFilterId})`}
          />
        )}

        {/* Rótulo de identificação (11 NF / 12 NF) */}
        <text
          x={cx + 42}
          y={cy + 6}
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="20"
          fill="#94a3b8"
          textAnchor="start"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {label}
        </text>

        {/* Área de clique estendida */}
        <circle cx={cx} cy={cy} r="32" fill="transparent" />
      </g>
    );
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 500"
      width="100%"
      height="100%"
      className="industrial-pushbutton-svg emergency-button-svg"
      style={{ display: 'block', overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        {/* Gradiente da placa quadrada amarela */}
        <linearGradient id={yellowPlateGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="15%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Gradiente do disco circular rebaixado amarelo/ouro */}
        <radialGradient id={yellowDiscGradId} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#facc15" />
          <stop offset="90%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>

        {/* Gradiente do bisel externo chanfrado do cogumelo */}
        <radialGradient id={emergBevelGradId} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#bf2222" />
          <stop offset="50%" stopColor="#991515" />
          <stop offset="85%" stopColor="#6e0b0b" />
          <stop offset="100%" stopColor="#450606" />
        </radialGradient>

        {/* Gradiente da face superior do cogumelo */}
        <radialGradient id={emergTopFaceGradId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#c72828" />
          <stop offset="45%" stopColor="#a81a1a" />
          <stop offset="85%" stopColor="#821010" />
          <stop offset="100%" stopColor="#5c0808" />
        </radialGradient>

        {/* Gradiente do domo central do cogumelo */}
        <radialGradient id={emergCenterDomeGradId} cx="42%" cy="36%" r="60%">
          <stop offset="0%" stopColor="#c02424" />
          <stop offset="60%" stopColor="#9c1616" />
          <stop offset="100%" stopColor="#7a0e0e" />
        </radialGradient>

        {/* Gradiente para os bornes circulares vermelhos */}
        <radialGradient id={socketGradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="55%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>

        {/* Filtro de brilho para terminais energizados */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Sombra de projeção sob o cogumelo */}
        <filter id={shadowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        {/* Caminho em arco superior para curvar o texto "EMERGENCY" */}
        <path
          id={textArcId}
          d="M 94 250 A 108 108 0 0 1 306 250"
          fill="none"
        />
      </defs>

      {/* Sombra projetada sob o conjunto */}
      <rect x="52" y="98" width="296" height="296" rx="34" fill="rgba(0,0,0,0.35)" />

      {/* BORNE SUPERIOR (Borne 11 NF - Red circular socket) */}
      {renderSocketTerminal(200, 52, '11', '11 NF', topTermState)}

      {/* PLACA PRINCIPAL QUADRADA AMARELA DE SEGURANÇA */}
      <rect
        x="50"
        y="96"
        width="300"
        height="300"
        rx="36"
        fill={`url(#${yellowPlateGradId})`}
        stroke="#ca8a04"
        strokeWidth="4"
        style={{ pointerEvents: 'none' }}
      />
      {/* Filete chanfrado interno de relevo 3D da carcaça amarela */}
      <rect
        x="60"
        y="106"
        width="280"
        height="280"
        rx="28"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="2.5"
        style={{ pointerEvents: 'none' }}
      />

      {/* DISCO CIRCULAR REBAIXADO AMARELO (Bezel interno) */}
      <circle
        cx="200"
        cy="250"
        r="124"
        fill="#b45309"
        style={{ pointerEvents: 'none' }}
      />
      <circle
        cx="200"
        cy="250"
        r="121"
        fill={`url(#${yellowDiscGradId})`}
        stroke="#ca8a04"
        strokeWidth="3"
        style={{ pointerEvents: 'none' }}
      />
      {/* Linha de profundidade circular */}
      <circle
        cx="200"
        cy="250"
        r="108"
        fill="transparent"
        stroke="#d97706"
        strokeWidth="1.5"
        opacity="0.6"
        style={{ pointerEvents: 'none' }}
      />

      {/* TEXTO "EMERGENCY" CURVADO NO ARCO SUPERIOR */}
      <text
        fontFamily="'Arial Black', Arial, sans-serif"
        fontWeight="900"
        fontSize="25"
        letterSpacing="3"
        fill="#1c1917"
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.4))',
        }}
      >
        <textPath href={`#${textArcId}`} startOffset="50%" textAnchor="middle">
          EMERGENCY
        </textPath>
      </text>

      {/* ATUADOR COGUMELO VERMELHO CENTRAL INTERATIVO (CONFORME FOTO REAL) */}
      <g
        className={`pushbutton-actuator-center emergency-actuator ${!isSimulationMode ? 'actuator-locked' : ''}`}
        onPointerDown={isSimulationMode ? onPointerDown : undefined}
        style={{
          cursor: isSimulationMode ? 'pointer' : 'grab',
          transformOrigin: '200px 250px',
          transform: isPressed && isSimulationMode ? 'scale(0.93) rotate(16deg)' : 'none',
          transition: 'transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <g transform="translate(200, 250)">
          {/* Sombra de projeção sob o cogumelo */}
          <circle cx="0" cy="5" r="88" fill="rgba(0, 0, 0, 0.45)" filter={`url(#${shadowFilterId})`} />

          {/* Base escura do perímetro serrilhado */}
          <circle cx="0" cy="0" r="88" fill="#3c0606" />

          {/* Estrias serrilhadas antiderrapantes ao redor de todo o bordo (grip teeth) */}
          <circle
            cx="0"
            cy="0"
            r="86"
            fill="none"
            stroke="#6e0c0c"
            strokeWidth="4.5"
            strokeDasharray="3.4 2.4"
          />
          <circle
            cx="0"
            cy="0"
            r="85"
            fill="none"
            stroke="#941414"
            strokeWidth="2.5"
            strokeDasharray="3.4 2.4"
          />

          {/* Corpo do cogumelo: bisel de transição chanfrado */}
          <circle
            cx="0"
            cy="0"
            r="83"
            fill={`url(#${emergBevelGradId})`}
            stroke="#450707"
            strokeWidth="2"
          />

          {/* Superfície do platô do botão */}
          <circle
            cx="0"
            cy="0"
            r="76"
            fill={`url(#${emergTopFaceGradId})`}
          />

          {/* Anel de rebaixo da pista das setas */}
          <circle cx="0" cy="0" r="68" fill="none" stroke="#680b0b" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="0" r="44" fill="none" stroke="#680b0b" strokeWidth="1" opacity="0.4" />

          {/* 3 SETAS EM BAIXO-RELEVO (DEBOSSED NO PLÁSTICO VERMELHO) */}
          {[-75, 45, 165].map((angle) => (
            <g key={`arrow-${angle}`} transform={`rotate(${angle})`}>
              {/* Filete de luz na borda inferior do baixo-relevo */}
              <path
                d={DEBOSSED_ARROW_PATH}
                fill="none"
                stroke="rgba(255, 140, 140, 0.38)"
                strokeWidth="1.6"
                transform="translate(0.8, 0.8)"
                style={{ pointerEvents: 'none' }}
              />
              {/* Filete de sombra na borda superior do baixo-relevo */}
              <path
                d={DEBOSSED_ARROW_PATH}
                fill="none"
                stroke="#250303"
                strokeWidth="1.5"
                transform="translate(-0.5, -0.5)"
                style={{ pointerEvents: 'none' }}
              />
              {/* Vala escura do baixo-relevo (entalhado no próprio plástico vermelho) */}
              <path
                d={DEBOSSED_ARROW_PATH}
                fill="#4a0707"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          ))}

          {/* Domo circular central ligeiramente saliente */}
          <circle
            cx="0"
            cy="0"
            r="42"
            fill={`url(#${emergCenterDomeGradId})`}
            stroke="#630a0a"
            strokeWidth="1.5"
          />

          {/* Brilho suave acetinado no domo central */}
          <path
            d="M -26 -16 A 30 30 0 0 1 16 -26"
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ pointerEvents: 'none' }}
          />
        </g>
      </g>

      {/* BORNE INFERIOR (Borne 12 NF - Red circular socket) */}
      {renderSocketTerminal(200, 442, '12', '12 NF', botTermState)}
    </svg>
  );
}

export function ButtonEmergencyElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
}) {
  const isPressed = Boolean(component.state?.pressed);

  const handleMushroomInteract = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    if (isPressed) {
      sounds.playEmergencyRelease();
      onUpdateComponentState(component.id, { pressed: false, locked: false });
    } else {
      sounds.playEmergencyLock();
      onUpdateComponentState(component.id, { pressed: true, locked: true });
    }
  };

  return (
    <div
      className={`industrial-device button-device industrial-pushbutton-device button-emergency-device ${
        isPressed && isSimulationMode ? 'device-actuator-active emergency-tripped' : ''
      }`}
      title="Botoeira de Emergência S00 (NF - Clique no cogumelo para acionar/girar para destravar)"
    >
      <RealisticEmergencyButtonSvg
        component={component}
        isPressed={isPressed && isSimulationMode}
        terminalVoltages={terminalVoltages}
        activeTerminal={activeTerminal}
        onTerminalClick={onTerminalClick}
        onPointerDown={handleMushroomInteract}
        isSimulationMode={isSimulationMode}
      />
    </div>
  );
}

