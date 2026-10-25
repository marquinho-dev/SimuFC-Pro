import React from 'react';

export const BULB_COLORS = {
  purple: {
    id: 'purple',
    label: 'Roxo',
    glow: 'rgba(168, 85, 247, 0.95)',
    glowSoft: 'rgba(192, 132, 252, 0.45)',
    litMid: '#f3e8ff',
    base: '#a855f7',
  },
  white: {
    id: 'white',
    label: 'Branco',
    glow: 'rgba(255, 255, 255, 0.95)',
    glowSoft: 'rgba(224, 242, 254, 0.5)',
    litMid: '#ffffff',
    base: '#ffffff',
  },
  red: {
    id: 'red',
    label: 'Vermelho',
    glow: 'rgba(239, 68, 68, 0.95)',
    glowSoft: 'rgba(248, 113, 113, 0.45)',
    litMid: '#fecaca',
    base: '#ef4444',
  },
  blue: {
    id: 'blue',
    label: 'Azul',
    glow: 'rgba(37, 99, 235, 0.95)',
    glowSoft: 'rgba(96, 165, 250, 0.45)',
    litMid: '#bfdbfe',
    base: '#2563eb',
  },
  green: {
    id: 'green',
    label: 'Verde',
    glow: 'rgba(22, 163, 74, 0.95)',
    glowSoft: 'rgba(74, 222, 128, 0.45)',
    litMid: '#bbf7d0',
    base: '#16a34a',
  },
  black: {
    id: 'black',
    label: 'Preto (Fosco)',
    glow: 'rgba(212, 212, 216, 0.55)',
    glowSoft: 'rgba(161, 161, 170, 0.25)',
    litMid: '#e4e4e7',
    base: '#18181b',
  },
  yellow: {
    id: 'yellow',
    label: 'Amarelo (3000K)',
    glow: 'rgba(234, 179, 8, 0.95)',
    glowSoft: 'rgba(250, 204, 21, 0.45)',
    litMid: '#fef08a',
    base: '#eab308',
  },
  // Aliases de compatibilidade
  warm_white: {
    id: 'yellow',
    label: 'Amarelo (Branco Quente)',
    glow: 'rgba(234, 179, 8, 0.95)',
    glowSoft: 'rgba(250, 204, 21, 0.45)',
    litMid: '#fef08a',
    base: '#eab308',
  },
  cool_white: {
    id: 'white',
    label: 'Branco',
    glow: 'rgba(255, 255, 255, 0.95)',
    glowSoft: 'rgba(224, 242, 254, 0.5)',
    litMid: '#ffffff',
    base: '#ffffff',
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
 * - Iluminação emissiva realista de alta intensidade com halo circular livre de cortes
 * - Bocal industrial E27 que envolve e aloja a rosca da lâmpada de forma contínua
 * - Bornes de parafuso industriais X1 e X2 na base do bocal
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
        overflow: 'visible', // Permite que a luz circular irradie suavemente sem cortes retangulares
      }}
      data-component-type="led_bulb"
    >
      {/* -----------------------------------------------------------------
          1. HALOS LUMINOSOS CIRCULARES DE ALTA INTENSIDADE (quando acesa)
          Radiação de luz esférica realista e ampla sem cantos quadrados
          ----------------------------------------------------------------- */}
      {isLit && (
        <>
          {/* Halo Primário Brilhante envolvente */}
          <div
            style={{
              position: 'absolute',
              top: '-25px',
              left: '-25px',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 12%, ${colorCfg.glow} 48%, transparent 76%)`,
              filter: 'blur(12px)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.9,
            }}
          />
          {/* Halo Secundário Atmosférico Amplo (Ilumina a bancada ao redor) */}
          <div
            style={{
              position: 'absolute',
              top: '-45px',
              left: '-45px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, ${colorCfg.glowSoft} 0%, transparent 70%)`,
              filter: 'blur(22px)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.65,
            }}
          />
        </>
      )}

      {/* -----------------------------------------------------------------
          2. PARTE TRASEIRA DO BOCAL (Cavidade interna, fica ATRÁS da lâmpada)
          ----------------------------------------------------------------- */}
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
          d="M 21 112 C 21 105 69 105 69 112 L 69 122 C 69 115 21 115 21 122 Z"
          fill={`url(#bocalBackInterior-${componentId})`}
          stroke="#1c222c"
          strokeWidth="1"
        />

        {/* Fios de rosca de latão internos visíveis no fundo do bocal */}
        <path d="M 25 110 C 30 106 60 106 65 110" stroke={`url(#bocalThreadBrass-${componentId})`} strokeWidth="1.5" fill="none" opacity="0.85" />
        <path d="M 24 113 C 29 109 61 109 66 113" stroke={`url(#bocalThreadBrass-${componentId})`} strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>

      {/* -----------------------------------------------------------------
          3. IMAGEM DA LÂMPADA LED (Sem overflow:hidden, para não cortar o brilho)
          ----------------------------------------------------------------- */}
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
          position: 'absolute',
          top: '0px',
          left: '0px',
          zIndex: 2,
          filter: isLit
            ? `brightness(1.55) contrast(1.12) drop-shadow(0 0 14px ${colorCfg.glow})`
            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))',
          transition: 'filter 0.15s ease',
        }}
      />

      {/* -----------------------------------------------------------------
          GLOBO EMISSIVO INCANDESCENTE (Luz intensa sobre o bulbo quando acesa)
          ----------------------------------------------------------------- */}
      {isLit && (
        <>
          {/* Brilho volumétrico interno do globo de vidro/policarbonato */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '7px',
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 48% 44%, #ffffff 20%, ${colorCfg.litMid} 52%, ${colorCfg.base} 78%, transparent 100%)`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 3,
              filter: 'blur(3px)',
              opacity: 0.95,
            }}
          />
          {/* Núcleo central de brilho ofuscante */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '17px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 46% 42%, #ffffff 45%, rgba(255,255,255,0.85) 75%, transparent 100%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 4,
              filter: 'blur(1.5px)',
            }}
          />
        </>
      )}

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

      {/* -----------------------------------------------------------------
          4. PARTE FRONTAL DO BOCAL (Envolve a lâmpada e aloja bornes X1 e X2)
          ----------------------------------------------------------------- */}
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
          d="M 21 112 
             C 21 120 69 120 69 112 
             L 69 118 
             C 69 126 21 126 21 118 
             Z"
          fill="rgba(0, 0, 0, 0.75)"
        />

        <g filter={`url(#bocalShadowFront-${componentId})`}>
          {/* Base e flange inferior alargada com orelhas de fixação */}
          <path
            d="M 12 156 
               C 12 144 18 136 26 133 
               L 64 133 
               C 72 136 78 144 78 156 
               L 80 174 
               C 80 180 76 182 72 182 
               L 18 182 
               C 14 182 10 180 10 174 
               Z"
            fill={`url(#bocalBodyGrad-${componentId})`}
            stroke="#2d3442"
            strokeWidth="1.2"
          />

          {/* Corpo cilíndrico central do bocal que abraça a lâmpada */}
          <path
            d="M 21 114 
               C 21 121 69 121 69 114 
               L 70 142 
               L 20 142 
               Z"
            fill={`url(#bocalBodyGrad-${componentId})`}
            stroke="#1c222c"
            strokeWidth="1.2"
          />

          {/* Ranhuras verticais de aperto e ventilação na carcaça do bocal */}
          <line x1="28" y1="120" x2="28" y2="138" stroke="#12161f" strokeWidth="1.8" />
          <line x1="29" y1="120" x2="29" y2="138" stroke="#434d61" strokeWidth="0.8" />

          <line x1="45" y1="120" x2="45" y2="138" stroke="#12161f" strokeWidth="1.8" />
          <line x1="46" y1="120" x2="46" y2="138" stroke="#434d61" strokeWidth="0.8" />

          <line x1="61" y1="120" x2="61" y2="138" stroke="#12161f" strokeWidth="1.8" />
          <line x1="62" y1="120" x2="62" y2="138" stroke="#434d61" strokeWidth="0.8" />

          {/* Borda / Lábio frontal do bocal que contorna e sobrepõe a lâmpada (dando efeito de entrada real) */}
          <path
            d="M 21 112 
               C 21 120 69 120 69 112 
               C 69 115 67 118 65 118 
               C 55 123 35 123 25 118 
               C 23 118 21 115 21 112 
               Z"
            fill={`url(#bocalLipGrad-${componentId})`}
            stroke="#455167"
            strokeWidth="1"
          />

          {/* Friso horizontal da base inferior */}
          <line x1="14" y1="162" x2="76" y2="162" stroke="#0f131a" strokeWidth="1.6" />
          <line x1="14" y1="163" x2="76" y2="163" stroke="#434d61" strokeWidth="0.8" />

          {/* Parafusos de fixação mecânica da flange no painel */}
          <circle cx="15" cy="172" r="1.6" fill="#334155" />
          <circle cx="75" cy="172" r="1.6" fill="#334155" />
        </g>
      </svg>

      {/* -----------------------------------------------------------------
          5. TERMINAIS INDUSTRIAIS NO BOCAL (X1 e X2)
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
