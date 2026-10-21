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
   Corpo escuro 3D, bornes parafusados 13/14 (ou 11/12),
   aro metálico usinado e atuador côncavo/convexo com relevo
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

  // Ids escopados para gradientes e filtros
  const bodyGradId = `bodyGrad-${componentId}`;
  const terminalGradId = `terminalGrad-${componentId}`;
  const bezelGradId = `bezelGrad-${componentId}`;
  const bezelInnerId = `bezelInner-${componentId}`;
  const btnGradId = `btnGrad-${componentId}`;
  const screwGradId = `screwGrad-${componentId}`;
  const screwDefId = `screw-${componentId}`;
  const glowFilterId = `glow-${componentId}`;

  // Terminais: para start (13, 14, 13_bot, 14_bot), para stop/emerg (11, 12, 11_bot, 12_bot)
  const isStart = !isStop && !isEmergency;

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

  const renderScrewTerminal = (x, y, rectX, rectY, termId, label, labelY, state) => {
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
        {/* Bloco metálico condutor do borne */}
        <rect
          x={rectX}
          y={rectY}
          width="50"
          height="60"
          rx="5"
          fill={`url(#${terminalGradId})`}
          stroke={state.isSelected ? '#38bdf8' : state.isConnecting ? '#4ade80' : '#1F2937'}
          strokeWidth={state.isSelected || state.isConnecting ? '2.5' : '2'}
        />

        {/* Halo de indicação interativa quando selecionado ou arrastando fio */}
        {state.isSelected && (
          <circle
            cx={x}
            cy={y}
            r="20"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="4 2"
            className="screw-selected-ring"
          />
        )}
        {state.isConnecting && !state.isSelected && (
          <circle
            cx={x}
            cy={y}
            r="19"
            fill="rgba(74, 222, 128, 0.15)"
            stroke="#4ade80"
            strokeWidth="2"
          />
        )}

        {/* Parafuso Phillips */}
        <use href={`#${screwDefId}`} x={x} y={y} />

        {/* Ponto indicador de tensão elétrica energizada */}
        {state.isPowered && (
          <circle
            cx={x}
            cy={y}
            r="5"
            fill={getVoltageBadgeColor(state.voltage)}
            filter={`url(#${glowFilterId})`}
          />
        )}

        {/* Hotspot transparente para clique preciso */}
        <circle
          cx={x}
          cy={y}
          r="18"
          fill="transparent"
          data-terminal-target={`${componentId}:${termId}`}
        />

        {/* Rótulo de identificação do borne */}
        <text
          x={x}
          y={labelY}
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="22"
          fill="#374151"
          textAnchor="middle"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 500"
      width="100%"
      height="100%"
      className="industrial-pushbutton-svg"
      style={{ display: 'block', overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        {/* Efeito 3D para o Corpo Principal */}
        <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="50%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>

        {/* Efeito 3D para os Terminais/Bornes */}
        <linearGradient id={terminalGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="50%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>

        {/* Efeito 3D para o Anel Metálico (Bezel) */}
        <radialGradient id={bezelGradId} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#F3F4F6" />
          <stop offset="90%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#4B5563" />
        </radialGradient>

        {/* Sombra interna do Bezel */}
        <radialGradient id={bezelInnerId} cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>

        {/* Gradiente 3D para o Botão (Verde para liga, Vermelho para desliga/emergência) */}
        {isStart ? (
          <radialGradient id={btnGradId} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="85%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </radialGradient>
        ) : (
          <radialGradient id={btnGradId} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="85%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>
        )}

        {/* Gradiente para o Parafuso */}
        <linearGradient id={screwGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5E7EB" />
          <stop offset="50%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>

        {/* Modelo do Parafuso Reutilizável */}
        <g id={screwDefId}>
          <circle
            cx="0"
            cy="0"
            r="14"
            fill={`url(#${screwGradId})`}
            stroke="#374151"
            strokeWidth="1.5"
          />
          {/* Fenda Phillips */}
          <path
            d="M -8 -8 L 8 8 M -8 8 L 8 -8"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="4" fill="#374151" opacity="0.5" />
        </g>

        {/* Filtro de brilho para terminais energizados */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sombra projetada do bloco inteiro */}
      <rect x="70" y="80" width="270" height="350" rx="15" fill="rgba(0,0,0,0.3)" />

      {/* BORNES SUPERIORES */}
      {/* Borne Esquerdo Topo (13 ou 11) */}
      {renderScrewTerminal(
        135,
        80,
        110,
        50,
        termTopLeftId,
        labelLeft,
        35,
        topLeftState
      )}

      {/* Borne Direito Topo (14 ou 12) */}
      {renderScrewTerminal(
        265,
        80,
        240,
        50,
        termTopRightId,
        labelRight,
        35,
        topRightState
      )}

      {/* BORNES INFERIORES */}
      {/* Borne Esquerdo Base (13 ou 11) */}
      {renderScrewTerminal(
        135,
        420,
        110,
        390,
        termBotLeftId,
        labelLeft,
        480,
        botLeftState
      )}

      {/* Borne Direito Base (14 ou 12) */}
      {renderScrewTerminal(
        265,
        420,
        240,
        390,
        termBotRightId,
        labelRight,
        480,
        botRightState
      )}

      {/* CORPO PRINCIPAL (Base plástica retangular) */}
      <rect
        x="60"
        y="90"
        width="280"
        height="320"
        rx="15"
        fill={`url(#${bodyGradId})`}
        stroke="#111827"
        strokeWidth="3"
        style={{ pointerEvents: 'none' }}
      />
      {/* Detalhe de relevo no corpo plástico */}
      <rect
        x="75"
        y="105"
        width="250"
        height="290"
        rx="10"
        fill="transparent"
        stroke="#4B5563"
        strokeWidth="2"
        style={{ pointerEvents: 'none' }}
      />

      {/* ARO METÁLICO EXTERNO (Bezel) */}
      {/* Base Sombra */}
      <circle cx="200" cy="250" r="112" fill="#111827" style={{ pointerEvents: 'none' }} />
      {/* Superfície do Bezel */}
      <circle
        cx="200"
        cy="250"
        r="110"
        fill={`url(#${bezelGradId})`}
        style={{ pointerEvents: 'none' }}
      />
      {/* Borda Interna do Bezel (Profundidade) */}
      <circle
        cx="200"
        cy="250"
        r="90"
        fill={`url(#${bezelInnerId})`}
        style={{ pointerEvents: 'none' }}
      />

      {/* BOTÃO ATUADOR CENTRAL INTERATIVO */}
      <g
        className={`pushbutton-actuator-center ${!isSimulationMode ? 'actuator-locked' : ''}`}
        onPointerDown={isSimulationMode ? onPointerDown : undefined}
        style={{
          cursor: isSimulationMode ? 'pointer' : 'grab',
          transformOrigin: '200px 250px',
          transform: isPressed && isSimulationMode ? 'scale(0.96) translate(0px, 3px)' : 'none',
          transition: 'transform 0.08s ease',
        }}
      >
        {/* Sombra de borda do botão */}
        <circle
          cx="200"
          cy="250"
          r="86"
          fill={isStart ? '#064E3B' : '#450A0A'}
        />

        {/* Superfície curva do botão (Efeito 3D) */}
        <circle
          cx="200"
          cy="250"
          r="84"
          fill={`url(#${btnGradId})`}
        />

        {/* Reflexo superior esquerdo vítreo 3D */}
        <ellipse
          cx="175"
          cy="215"
          rx="32"
          ry="18"
          fill="#FFFFFF"
          opacity={isPressed ? '0.2' : '0.4'}
          transform="rotate(-25 175 215)"
          style={{ pointerEvents: 'none' }}
        />

        {/* TEXTO DO ATUADOR ("ON", "OFF" ou "EMERG") */}
        <text
          x="200"
          y="265"
          fontFamily="'Segoe UI', Arial, sans-serif"
          fontWeight="900"
          fontSize={isEmergency ? '34' : '45'}
          fill="#FFFFFF"
          textAnchor="middle"
          letterSpacing="2"
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
          }}
        >
          {isStart ? 'ON' : isEmergency ? 'EMERG' : 'OFF'}
        </text>
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
  const redBtnGradId = `emergRedBtnGrad-${componentId}`;
  const socketGradId = `emergSocketGrad-${componentId}`;
  const textArcId = `emergTextArc-${componentId}`;
  const glowFilterId = `emergGlow-${componentId}`;

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

        {/* Borda / carcaça externa vermelha do borne (conforme imagem do usuário) */}
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

        {/* Receptáculo interno (branco/prata com ponto de encaixe) */}
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

        {/* Gradiente 3D para o cogumelo vermelho */}
        <radialGradient id={redBtnGradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="92%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
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

        {/* Caminho em arco superior para curvar o texto "EMERGENCY" */}
        <path
          id={textArcId}
          d="M 94 246 A 108 108 0 0 1 306 246"
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
        cy="246"
        r="124"
        fill="#b45309"
        style={{ pointerEvents: 'none' }}
      />
      <circle
        cx="200"
        cy="246"
        r="121"
        fill={`url(#${yellowDiscGradId})`}
        stroke="#ca8a04"
        strokeWidth="3"
        style={{ pointerEvents: 'none' }}
      />
      {/* Linha de profundidade circular */}
      <circle
        cx="200"
        cy="246"
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

      {/* ATUADOR COGUMELO VERMELHO CENTRAL INTERATIVO */}
      <g
        className={`pushbutton-actuator-center emergency-actuator ${!isSimulationMode ? 'actuator-locked' : ''}`}
        onPointerDown={isSimulationMode ? onPointerDown : undefined}
        style={{
          cursor: isSimulationMode ? 'pointer' : 'grab',
          transformOrigin: '200px 254px',
          transform: isPressed && isSimulationMode ? 'scale(0.94) rotate(15deg)' : 'none',
          transition: 'transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Base de sombra profunda do cogumelo */}
        <circle cx="200" cy="254" r="82" fill="#450a0a" />

        {/* Superfície do botão vermelho esférico */}
        <circle
          cx="200"
          cy="254"
          r="80"
          fill={`url(#${redBtnGradId})`}
          stroke="#7f1d1d"
          strokeWidth="2.5"
        />

        {/* Reflexo vítreo superior esquerdo */}
        <ellipse
          cx="172"
          cy="216"
          rx="34"
          ry="18"
          fill="#FFFFFF"
          opacity={isPressed ? '0.2' : '0.45'}
          transform="rotate(-22 172 216)"
          style={{ pointerEvents: 'none' }}
        />

        {/* 3 SETAS BRANCAS CURVADAS DE DESTRAVAMENTO (TWIST TO RESET) */}
        {/* Distribuídas simetricamente a cada 120° em sentido horário */}
        {[0, 120, 240].map((angle) => (
          <g
            key={`arrow-${angle}`}
            transform={`rotate(${angle} 200 254)`}
            style={{ pointerEvents: 'none' }}
          >
            {/* Arco da seta */}
            <path
              d="M 160 220 A 48 48 0 0 1 206 206"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
            />
            {/* Ponta da seta apontando em sentido horário */}
            <polygon
              points="206,196 222,210 203,218"
              fill="#FFFFFF"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
            />
          </g>
        ))}
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

