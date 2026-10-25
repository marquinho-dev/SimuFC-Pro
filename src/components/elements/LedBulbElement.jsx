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
 * Estrutura 3D realista em camadas:
 * 1. Cavidade interna traseira do bocal (fica atrás da lâmpada)
 * 2. Lâmpada LED penetrando fisicamente dentro da boca do bocal
 * 3. Borda frontal envolvente do bocal com sombra de oclusão sobreposta (lâmpada entra DENTRO)
 * 4. Bornes industriais X1 e X2 montados na carcaça do bocal
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
      {/* 1. Halo Volumétrico Difuso quando Acesa */}
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

      {/* 2. PARTE TRASEIRA DO BOCAL (Interior da cavidade rosqueada, fica ATRÁS da lâmpada) */}
      <svg
        width="90"
        height="184"
        viewBox="0 0 90 184"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id={`bocalBackInterior-${componentId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#05070a" />
            <stop offset="100%" stopColor="#181e28" />
          </linearGradient>
          <linearGradient id={`bocalThreadBrass-${componentId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
        </defs>

        {/* Borda traseira do anel do bocal */}
        <path
          d="M 21 125 C 21 118 69 118 69 125 L 69 135 C 69 128 21 128 21 135 Z"
          fill={`url(#bocalBackInterior-${componentId})`}
          stroke="#1c222c"
          strokeWidth="1"
        />

        {/* Fios de rosca de latão internos visíveis no fundo do bocal */}
        <path d="M 25 123 C 30 119 60 119 65 123" stroke={`url(#bocalThreadBrass-${componentId})`} strokeWidth="1.5" fill="none" opacity="0.85" />
        <path d="M 24 126 C 29 122 61 122 66 126" stroke={`url(#bocalThreadBrass-${componentId})`} strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>

      {/* 3. LÂMPADA LED PENETRANDO FISICAMENTE DENTRO DO BOCAL (Camada intermediária zIndex: 2) */}
      <div
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '90px',
          height: '148px', // A lâmpada entra até y=148 dentro do bocal e fica alojada no interior
          overflow: 'hidden',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <img
          src="/led_bulb.png"
          alt="Lâmpada LED Bulbo E27"
          draggable={false}
          style={{
            width: '90px',
            height: '175px',
            objectFit: 'contain',
            display: 'block',
            filter: isLit
              ? colorCfg.filterLit
              : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))',
            transition: 'filter 0.15s ease',
          }}
        />
      </div>

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
          zIndex: 6,
        }}
      >
        {component.tag || 'L1'}
      </div>

      {/* 4. PARTE FRONTAL DO BOCAL (Borda frontal envolvente, corpo e bornes, fica NA FRENTE da lâmpada zIndex: 5) */}
      <svg
        width="90"
        height="184"
        viewBox="0 0 90 184"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 5,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <filter id={`bocalShadowFront-${componentId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.7" />
          </filter>

          <linearGradient id={`bocalBodyGrad-${componentId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#12151b" />
            <stop offset="15%" stopColor="#222834" />
            <stop offset="35%" stopColor="#353e50" />
            <stop offset="65%" stopColor="#28303e" />
            <stop offset="85%" stopColor="#1c212a" />
            <stop offset="100%" stopColor="#0e1116" />
          </linearGradient>

          <linearGradient id={`bocalLipGrad-${componentId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a202c" />
            <stop offset="30%" stopColor="#3d475a" />
            <stop offset="70%" stopColor="#3d475a" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>

          <radialGradient id={`bocalScrewGrad-${componentId}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="90%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>
        </defs>

        {/* Sombra de oclusão do bocal projetada DIRETAMENTE SOBRE a lâmpada inserida */}
        <path
          d="M 21 125 
             C 21 133 69 133 69 125 
             L 69 131 
             C 69 139 21 139 21 131 
             Z"
          fill="rgba(0, 0, 0, 0.75)"
        />

        <g filter={`url(#bocalShadowFront-${componentId})`}>
          {/* Base e flange inferior alargada com orelhas de fixação */}
          <path
            d="M 12 164 
               C 12 154 18 146 26 144 
               L 64 144 
               C 72 146 78 154 78 164 
               L 80 176 
               C 80 180 76 182 72 182 
               L 18 182 
               C 14 182 10 180 10 176 
               Z"
            fill={`url(#bocalBodyGrad-${componentId})`}
            stroke="#2d3442"
            strokeWidth="1.2"
          />

          {/* Corpo cilíndrico central do bocal que abraça a lâmpada */}
          <path
            d="M 21 127 
               C 21 134 69 134 69 127 
               L 70 148 
               L 20 148 
               Z"
            fill={`url(#bocalBodyGrad-${componentId})`}
            stroke="#1c222c"
            strokeWidth="1.2"
          />

          {/* Ranhuras verticais de aperto e ventilação na carcaça do bocal */}
          <line x1="28" y1="133" x2="28" y2="147" stroke="#12161f" strokeWidth="1.8" />
          <line x1="29" y1="133" x2="29" y2="147" stroke="#434d61" strokeWidth="0.8" />

          <line x1="45" y1="133" x2="45" y2="147" stroke="#12161f" strokeWidth="1.8" />
          <line x1="46" y1="133" x2="46" y2="147" stroke="#434d61" strokeWidth="0.8" />

          <line x1="61" y1="133" x2="61" y2="147" stroke="#12161f" strokeWidth="1.8" />
          <line x1="62" y1="133" x2="62" y2="147" stroke="#434d61" strokeWidth="0.8" />

          {/* Borda / Lábio frontal do bocal que contorna e sobrepõe a lâmpada (dando efeito de entrada real) */}
          <path
            d="M 21 125 
               C 21 133 69 133 69 125 
               C 69 128 67 131 65 131 
               C 55 136 35 136 25 131 
               C 23 131 21 128 21 125 
               Z"
            fill={`url(#bocalLipGrad-${componentId})`}
            stroke="#455167"
            strokeWidth="1"
          />

          {/* Friso horizontal da base inferior */}
          <line x1="14" y1="168" x2="76" y2="168" stroke="#0f131a" strokeWidth="1.6" />
          <line x1="14" y1="169" x2="76" y2="169" stroke="#434d61" strokeWidth="0.8" />

          {/* Parafusos de fixação mecânica da flange no painel */}
          <circle cx="15" cy="175" r="1.6" fill="#334155" />
          <circle cx="75" cy="175" r="1.6" fill="#334155" />
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
