import React from 'react';

export const BULB_COLORS = {
  purple: {
    id: 'purple',
    label: 'Roxo',
    glow: 'rgba(168, 85, 247, 0.95)',
    base: '#a855f7',
    filterLit: 'drop-shadow(0 0 16px rgba(168, 85, 247, 0.95)) drop-shadow(0 0 35px rgba(168, 85, 247, 0.85)) brightness(1.25) hue-rotate(260deg)',
  },
  white: {
    id: 'white',
    label: 'Branco',
    glow: 'rgba(255, 255, 255, 0.95)',
    base: '#ffffff',
    filterLit: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 40px rgba(224, 242, 254, 0.9)) brightness(1.35)',
  },
  red: {
    id: 'red',
    label: 'Vermelho',
    glow: 'rgba(239, 68, 68, 0.95)',
    base: '#ef4444',
    filterLit: 'drop-shadow(0 0 18px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 35px rgba(239, 68, 68, 0.85)) brightness(1.25) hue-rotate(345deg)',
  },
  blue: {
    id: 'blue',
    label: 'Azul',
    glow: 'rgba(37, 99, 235, 0.95)',
    base: '#2563eb',
    filterLit: 'drop-shadow(0 0 18px rgba(37, 99, 235, 0.95)) drop-shadow(0 0 35px rgba(37, 99, 235, 0.85)) brightness(1.25) hue-rotate(200deg)',
  },
  green: {
    id: 'green',
    label: 'Verde',
    glow: 'rgba(22, 163, 74, 0.95)',
    base: '#16a34a',
    filterLit: 'drop-shadow(0 0 18px rgba(22, 163, 74, 0.95)) drop-shadow(0 0 35px rgba(22, 163, 74, 0.85)) brightness(1.25) hue-rotate(95deg)',
  },
  black: {
    id: 'black',
    label: 'Preto (Fosco)',
    glow: 'rgba(212, 212, 216, 0.55)',
    base: '#18181b',
    filterLit: 'drop-shadow(0 0 10px rgba(212, 212, 216, 0.6)) brightness(0.85)',
  },
  yellow: {
    id: 'yellow',
    label: 'Amarelo (3000K)',
    glow: 'rgba(234, 179, 8, 0.95)',
    base: '#eab308',
    filterLit: 'drop-shadow(0 0 18px rgba(234, 179, 8, 0.95)) drop-shadow(0 0 35px rgba(234, 179, 8, 0.85)) brightness(1.25)',
  },
  // Aliases de compatibilidade
  warm_white: {
    id: 'yellow',
    label: 'Amarelo (Branco Quente)',
    glow: 'rgba(234, 179, 8, 0.95)',
    base: '#eab308',
    filterLit: 'drop-shadow(0 0 18px rgba(234, 179, 8, 0.95)) drop-shadow(0 0 35px rgba(234, 179, 8, 0.85)) brightness(1.25)',
  },
  cool_white: {
    id: 'white',
    label: 'Branco',
    glow: 'rgba(255, 255, 255, 0.95)',
    base: '#ffffff',
    filterLit: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 40px rgba(224, 242, 254, 0.9)) brightness(1.35)',
  },
};

function getVoltageColor(v) {
  switch (v) {
    case 'L1': return '#a855f7';
    case 'L2': return '#ffffff';
    case 'L3': return '#ef4444';
    case 'N':  return '#2563eb';
    case 'PE': return '#16a34a';
    case '12V': return '#f59e0b';
    case '24V': return '#10b981';
    default:   return '#38bdf8';
  }
}

/**
 * Lâmpada LED Bulbo E27 montada em Bocal Industrial Receptáculo E27
 * - Globo difusor fosco com brilho volumétrico ajustável pela paleta de cabos
 * - Bocal industrial E27 em termoplástico/baquelite com rosca e flange de fixação
 * - Bornes de parafuso industriais X1 (Rosca lateral) e X2 (Pé central)
 */
export default function LedBulbElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
  isSelected = false,
}) {
  const isLit = Boolean(component.state?.lit);
  const rawColor = component.state?.color || 'yellow';
  const colorCfg = BULB_COLORS[rawColor] || BULB_COLORS.yellow;

  const componentId = component.id;

  const vX1 = terminalVoltages?.get(`${componentId}:X1`);
  const vX2 = terminalVoltages?.get(`${componentId}:X2`);

  const isX1Active = activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'X1';
  const isX2Active = activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'X2';

  return (
    <div
      className={`led-bulb-container ${isLit ? 'is-lit' : 'is-unlit'} ${isSelected ? 'selected' : ''}`}
      style={{
        width: '90px',
        height: '184px',
        position: 'relative',
        userSelect: 'none',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
      data-component-type="led_bulb"
    >
      {/* Halo Volumétrico Difuso quando Acesa */}
      {isLit && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '5px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `radial-gradient(circle, #ffffff 20%, ${colorCfg.glow} 65%, transparent 100%)`,
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}

      {/* Imagem Fotorealista da Lâmpada LED E27 */}
      <img
        src="/led_bulb.png"
        alt="Lâmpada LED Bulbo E27"
        draggable={false}
        style={{
          width: '90px',
          height: '175px',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 2,
          filter: isLit
            ? colorCfg.filterLit
            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))',
          transition: 'filter 0.15s ease',
        }}
      />

      {/* Tag Identificadora Discreta (ex: L1) */}
      <div
        style={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#38bdf8',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {component.tag || 'L1'}
      </div>

      {/* -----------------------------------------------------------------
          BOCAL / RECEPTÁCULO INDUSTRIAL E27
          Base mecânica em baquelite/termoplástico que envolve a rosca da lâmpada
          e aloja os bornes X1 e X2
          ----------------------------------------------------------------- */}
      <svg
        width="90"
        height="64"
        viewBox="0 0 90 64"
        style={{
          position: 'absolute',
          bottom: '0px',
          left: '0px',
          zIndex: 6,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Sombra de projeção do bocal */}
          <filter id={`bocalShadow-${componentId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
          </filter>

          {/* Gradiente da baquelite do bocal */}
          <linearGradient id={`bocalBodyGrad-${componentId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#12151b" />
            <stop offset="15%" stopColor="#222834" />
            <stop offset="35%" stopColor="#353e50" />
            <stop offset="65%" stopColor="#28303e" />
            <stop offset="85%" stopColor="#1c212a" />
            <stop offset="100%" stopColor="#0e1116" />
          </linearGradient>

          {/* Gradiente da rosca de latão interna visível */}
          <linearGradient id={`bocalThreadGrad-${componentId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Gradiente do parafuso dos bornes */}
          <radialGradient id={`bocalScrewGrad-${componentId}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="90%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
        </defs>

        {/* Corpo estrutural do Bocal */}
        <g filter={`url(#bocalShadow-${componentId})`}>
          {/* Flange / Base inferior alargada de montagem */}
          <path
            d="M 12 44 
               C 12 38 18 32 26 30 
               L 64 30 
               C 72 32 78 38 78 44 
               L 80 56 
               C 80 60 76 62 72 62 
               L 18 62 
               C 14 62 10 60 10 56 
               Z"
            fill={`url(#bocalBodyGrad-${componentId})`}
            stroke="#2d3442"
            strokeWidth="1.2"
          />

          {/* Corpo cilíndrico central que envolve a rosca E27 */}
          <path
            d="M 22 10 
               Q 20 20 20 36 
               L 70 36 
               Q 70 20 68 10 
               Z"
            fill={`url(#bocalBodyGrad-${componentId})`}
            stroke="#1c222c"
            strokeWidth="1.2"
          />

          {/* Ranhuras verticais de aperto e aderência na carcaça */}
          <line x1="28" y1="12" x2="28" y2="34" stroke="#12161f" strokeWidth="1.8" />
          <line x1="29" y1="12" x2="29" y2="34" stroke="#434d61" strokeWidth="0.8" />

          <line x1="45" y1="12" x2="45" y2="34" stroke="#12161f" strokeWidth="1.8" />
          <line x1="46" y1="12" x2="46" y2="34" stroke="#434d61" strokeWidth="0.8" />

          <line x1="61" y1="12" x2="61" y2="34" stroke="#12161f" strokeWidth="1.8" />
          <line x1="62" y1="12" x2="62" y2="34" stroke="#434d61" strokeWidth="0.8" />

          {/* Colar / Borda superior reforçada de entrada da lâmpada */}
          <ellipse
            cx="45"
            cy="10"
            rx="23"
            ry="5.5"
            fill="#12151b"
            stroke="#3a4354"
            strokeWidth="1.4"
          />
          {/* Fio de latão / bronze da rosca interna E27 */}
          <ellipse
            cx="45"
            cy="9.5"
            rx="20"
            ry="4"
            fill="none"
            stroke={`url(#bocalThreadGrad-${componentId})`}
            strokeWidth="1.6"
          />

          {/* Friso horizontal da base */}
          <line x1="14" y1="48" x2="76" y2="48" stroke="#0f131a" strokeWidth="1.6" />
          <line x1="14" y1="49" x2="76" y2="49" stroke="#434d61" strokeWidth="0.8" />

          {/* Parafusos de fixação mecânica da flange */}
          <circle cx="15" cy="55" r="1.6" fill="#334155" />
          <circle cx="75" cy="55" r="1.6" fill="#334155" />
        </g>
      </svg>

      {/* -----------------------------------------------------------------
          TERMINAIS INDUSTRIAIS NO BOCAL (X1 e X2)
          ----------------------------------------------------------------- */}

      {/* Terminal X1: Rosca Lateral do Bocal E27 (Esquerda) */}
      <div
        className={`bulb-terminal-point ${isX1Active ? 'active' : ''}`}
        style={{
          position: 'absolute',
          left: '20px',
          top: '158px',
          width: '26px',
          height: '26px',
          transform: 'translate(-50%, -50%)',
          zIndex: 12,
          cursor: 'crosshair',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, 'X1');
        }}
        title={`Borne X1 do Bocal E27 (Rosca / Neutro): ${vX1 ? `Energizado (${vX1})` : 'Sem tensão'} • Clique para conectar`}
        data-terminal-target={`${componentId}:X1`}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" style={{ display: 'block', overflow: 'visible' }}>
          {/* Área de clique ampla */}
          <circle cx="13" cy="13" r="13" fill="transparent" />

          {/* Rebaixo escuro do borne no bocal */}
          <circle
            cx="13"
            cy="13"
            r="10"
            fill="#0f172a"
            stroke={isX1Active ? '#00e676' : vX1 ? getVoltageColor(vX1) : '#94a3b8'}
            strokeWidth={isX1Active ? '2.6' : '1.8'}
            style={{ filter: isX1Active ? 'drop-shadow(0 0 6px #00e676)' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
          />

          {/* Parafuso metálico do borne */}
          <circle cx="13" cy="13" r="6.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" />
          <line x1="9.5" y1="13" x2="16.5" y2="13" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="13" y1="9.5" x2="13" y2="16.5" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />

          {/* Ponto indicador de tensão se energizado */}
          {vX1 && <circle cx="13" cy="13" r="2.8" fill={getVoltageColor(vX1)} />}
        </svg>
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-12px',
            transform: 'translateX(-50%)',
            fontSize: '8.5px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: isX1Active ? '#00e676' : '#cbd5e1',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
          }}
        >
          X1
        </span>
      </div>

      {/* Terminal X2: Pé Central de Contato do Bocal E27 (Direita) */}
      <div
        className={`bulb-terminal-point ${isX2Active ? 'active' : ''}`}
        style={{
          position: 'absolute',
          left: '70px',
          top: '158px',
          width: '26px',
          height: '26px',
          transform: 'translate(-50%, -50%)',
          zIndex: 12,
          cursor: 'crosshair',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, 'X2');
        }}
        title={`Borne X2 do Bocal E27 (Pé Central / Fase): ${vX2 ? `Energizado (${vX2})` : 'Sem tensão'} • Clique para conectar`}
        data-terminal-target={`${componentId}:X2`}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" style={{ display: 'block', overflow: 'visible' }}>
          {/* Área de clique ampla */}
          <circle cx="13" cy="13" r="13" fill="transparent" />

          {/* Rebaixo escuro do borne no bocal */}
          <circle
            cx="13"
            cy="13"
            r="10"
            fill="#0f172a"
            stroke={isX2Active ? '#00e676' : vX2 ? getVoltageColor(vX2) : '#94a3b8'}
            strokeWidth={isX2Active ? '2.6' : '1.8'}
            style={{ filter: isX2Active ? 'drop-shadow(0 0 6px #00e676)' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
          />

          {/* Parafuso metálico do borne */}
          <circle cx="13" cy="13" r="6.5" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" />
          <line x1="9.5" y1="13" x2="16.5" y2="13" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="13" y1="9.5" x2="13" y2="16.5" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />

          {/* Ponto indicador de tensão se energizado */}
          {vX2 && <circle cx="13" cy="13" r="2.8" fill={getVoltageColor(vX2)} />}
        </svg>
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-12px',
            transform: 'translateX(-50%)',
            fontSize: '8.5px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: isX2Active ? '#00e676' : '#cbd5e1',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
          }}
        >
          X2
        </span>
      </div>
    </div>
  );
}
