import React from 'react';

export const PILOT_COLORS = {
  purple: {
    id: 'purple',
    label: 'Roxo',
    base: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.95)',
    unlitCenter: '#7e22ce',
    unlitEdge: '#3b0764',
    unlitRim: '#6b21a8',
    unlitBorder: '#2e1065',
    litCore: '#ffffff',
    litMid: '#f3e8ff',
    litMain: '#a855f7',
    litEdge: '#7e22ce',
    litHalo: '#c084fc',
  },
  white: {
    id: 'white',
    label: 'Branco',
    base: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.95)',
    unlitCenter: '#cbd5e1',
    unlitEdge: '#475569',
    unlitRim: '#94a3b8',
    unlitBorder: '#334155',
    litCore: '#ffffff',
    litMid: '#ffffff',
    litMain: '#f1f5f9',
    litEdge: '#cbd5e1',
    litHalo: '#e2e8f0',
  },
  red: {
    id: 'red',
    label: 'Vermelho',
    base: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.95)',
    unlitCenter: '#b91c1c',
    unlitEdge: '#450a0a',
    unlitRim: '#991b1b',
    unlitBorder: '#3b0707',
    litCore: '#ffffff',
    litMid: '#fecdd3',
    litMain: '#ef4444',
    litEdge: '#b91c1c',
    litHalo: '#f87171',
  },
  blue: {
    id: 'blue',
    label: 'Azul',
    base: '#2563eb',
    glow: 'rgba(37, 99, 235, 0.95)',
    unlitCenter: '#1d4ed8',
    unlitEdge: '#0f172a',
    unlitRim: '#1e40af',
    unlitBorder: '#0b132b',
    litCore: '#ffffff',
    litMid: '#bfdbfe',
    litMain: '#2563eb',
    litEdge: '#1d4ed8',
    litHalo: '#60a5fa',
  },
  green: {
    id: 'green',
    label: 'Verde',
    base: '#16a34a',
    glow: 'rgba(22, 163, 74, 0.95)',
    unlitCenter: '#15803d',
    unlitEdge: '#052e16',
    unlitRim: '#166534',
    unlitBorder: '#022c22',
    litCore: '#ffffff',
    litMid: '#bbf7d0',
    litMain: '#16a34a',
    litEdge: '#15803d',
    litHalo: '#4ade80',
  },
  black: {
    id: 'black',
    label: 'Preto',
    base: '#18181b',
    glow: 'rgba(212, 212, 216, 0.65)',
    unlitCenter: '#27272a',
    unlitEdge: '#09090b',
    unlitRim: '#18181b',
    unlitBorder: '#09090b',
    litCore: '#ffffff',
    litMid: '#e4e4e7',
    litMain: '#71717a',
    litEdge: '#27272a',
    litHalo: '#a1a1aa',
  },
  yellow: {
    id: 'yellow',
    label: 'Amarelo',
    base: '#eab308',
    glow: 'rgba(234, 179, 8, 0.95)',
    unlitCenter: '#b45309',
    unlitEdge: '#78350f',
    unlitRim: '#92400e',
    unlitBorder: '#451a03',
    litCore: '#ffffff',
    litMid: '#fef08a',
    litMain: '#eab308',
    litEdge: '#ca8a04',
    litHalo: '#f59e0b',
  },
};

export const COLOR_PALETTE_KEYS = ['purple', 'white', 'red', 'blue', 'green', 'black', 'yellow'];

function getVoltageColor(v) {
  switch (v) {
    case 'L1': return '#a855f7';
    case 'L2': return '#ffffff';
    case 'L3': return '#ef4444';
    case 'N': return '#06b6d4';
    case 'PE': return '#10b981';
    default: return '#38bdf8';
  }
}

/**
 * Sinaleira LED Industrial 22mm (Monobloco)
 * Fiel à referência industrial:
 * - Corpo traseiro cilíndrico com aletas de ventilação/aperto em plástico de engenharia
 * - Aro de fixação e acabamento frontal preto
 * - Lente frontal circular translúcida com textura difusora interna e difusão volumétrica
 * - 5 Cores industriais: Amarelo, Verde, Vermelho, Azul e Branco
 * - Bornes de parafuso industriais X1 e X2 com indicação de tensão e clique para conexão
 */
export default function PilotLampElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
  isSelected = false,
}) {
  const isLit = Boolean(component.state?.lit);

  // Mapeia chaves legadas (warm_white -> white, cool_white -> white)
  let rawColor = component.state?.color || 'red';
  if (rawColor === 'warm_white' || rawColor === 'cool_white') rawColor = 'white';
  const colorKey = PILOT_COLORS[rawColor] ? rawColor : 'red';
  const cCfg = PILOT_COLORS[colorKey];

  const componentId = component.id;

  const vX1 = terminalVoltages?.get(`${componentId}:X1`);
  const vX2 = terminalVoltages?.get(`${componentId}:X2`);

  const isX1Active = activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'X1';
  const isX2Active = activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'X2';

  // Ids escopados para filtros e gradientes SVG
  const glowId = `lampGlow-${componentId}`;
  const lensGradId = `lensGrad-${componentId}`;
  const barrelGradId = `barrelGrad-${componentId}`;
  const finGradId = `finGrad-${componentId}`;
  const screwGradId = `screwGrad-${componentId}`;
  const shadowId = `shadow-${componentId}`;

  return (
    <div
      className={`pilot-lamp-container ${isLit ? 'is-lit' : 'is-unlit'} ${isSelected ? 'selected' : ''}`}
      style={{
        width: '104px',
        height: '148px',
        position: 'relative',
        userSelect: 'none',
        background: 'transparent',
        border: 'none',
      }}
      data-component-type="pilot_light"
    >
      {/* Tag Identificadora do Componente (ex: H1) */}
      <div
        style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: isLit ? cCfg.base : '#94a3b8',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.6px',
          background: 'rgba(15, 23, 42, 0.92)',
          padding: '1px 6px',
          borderRadius: '4px',
          border: `1px solid ${isLit ? cCfg.base : 'rgba(148, 163, 184, 0.3)'}`,
          boxShadow: isLit ? `0 0 8px ${cCfg.glow}` : 'none',
          pointerEvents: 'none',
          zIndex: 8,
          transition: 'all 0.2s ease',
        }}
      >
        {component.tag || 'H1'}
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 104 148"
        width="104"
        height="148"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Filtro de sombra e relevo mecânico */}
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
          </filter>

          {/* Filtro de radiação e brilho difuso do LED (quando acesa) */}
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradiente do corpo traseiro industrial (simétrico) */}
          <linearGradient id={barrelGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#181c22" />
            <stop offset="12%" stopColor="#2c323b" />
            <stop offset="28%" stopColor="#3d4450" />
            <stop offset="50%" stopColor="#20242d" />
            <stop offset="72%" stopColor="#3d4450" />
            <stop offset="88%" stopColor="#2c323b" />
            <stop offset="100%" stopColor="#181c22" />
          </linearGradient>

          {/* Gradiente das aletas de aperto */}
          <linearGradient id={finGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#121519" />
            <stop offset="50%" stopColor="#485160" />
            <stop offset="100%" stopColor="#1a1d23" />
          </linearGradient>

          {/* Gradiente do parafuso dos bornes */}
          <radialGradient id={screwGradId} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="90%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </radialGradient>

          {/* Gradiente da Lente LED: Dinâmico conforme estado (aceso vs apagado) */}
          {isLit ? (
            <radialGradient id={lensGradId} cx="46%" cy="44%" r="56%">
              <stop offset="0%" stopColor={cCfg.litCore} stopOpacity="1" />
              <stop offset="22%" stopColor={cCfg.litMid} stopOpacity="0.98" />
              <stop offset="55%" stopColor={cCfg.litMain} stopOpacity="0.95" />
              <stop offset="85%" stopColor={cCfg.litEdge} stopOpacity="0.98" />
              <stop offset="100%" stopColor={cCfg.unlitEdge} stopOpacity="1" />
            </radialGradient>
          ) : (
            <radialGradient id={lensGradId} cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor={cCfg.unlitRim} stopOpacity="0.9" />
              <stop offset="40%" stopColor={cCfg.unlitCenter} stopOpacity="0.85" />
              <stop offset="80%" stopColor={cCfg.unlitEdge} stopOpacity="0.95" />
              <stop offset="100%" stopColor={cCfg.unlitBorder} stopOpacity="1" />
            </radialGradient>
          )}
        </defs>

        {/* -----------------------------------------------------------------
            1. HALO LUMINOSO PROJETADO AO REDOR (somente quando acesa)
            ----------------------------------------------------------------- */}
        {isLit && (
          <g pointerEvents="none">
            <circle
              cx="52"
              cy="48"
              r="44"
              fill={cCfg.glow}
              filter={`url(#${glowId})`}
              opacity="0.8"
            />
            <circle
              cx="52"
              cy="48"
              r="34"
              fill={cCfg.litCore}
              filter={`url(#${glowId})`}
              opacity="0.5"
            />
          </g>
        )}

        {/* -----------------------------------------------------------------
            2. CORPO TRASEIRO CILÍNDRICO E BASE DE APOIO NOS BORNES (SIMÉTRICO)
            Mostra a carcaça industrial perfeitamente espelhada dos dois lados,
            com aletas e ranhuras idênticas à esquerda e à direita
            ----------------------------------------------------------------- */}
        <g filter={`url(#${shadowId})`}>
          {/* Corpo principal traseiro monolítico simétrico que apoia nos bornes */}
          <path
            d="M 14 30 
               Q 12 60 14 94 
               L 90 94 
               Q 92 60 90 30 
               Q 90 22 84 22 
               L 20 22 
               Q 14 22 14 30 
               Z"
            fill={`url(#${barrelGradId})`}
            stroke="#121518"
            strokeWidth="1.2"
          />

          {/* Frisos e rebaixos traseiros verticais externos (Esquerda e Direita) */}
          <line x1="14" y1="34" x2="14" y2="88" stroke="#3a414c" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="38" x2="12" y2="84" stroke="#1e2329" strokeWidth="2.4" strokeLinecap="round" />

          <line x1="90" y1="34" x2="90" y2="88" stroke="#3a414c" strokeWidth="3" strokeLinecap="round" />
          <line x1="92" y1="38" x2="92" y2="84" stroke="#1e2329" strokeWidth="2.4" strokeLinecap="round" />

          {/* Aletas / Ranhuras de aperto e ventilação perfeitamente simétricas */}
          <g fill="none" strokeWidth="2.4" strokeLinecap="round">
            {/* --- Aletas da Esquerda --- */}
            <path d="M 17 36 L 24 38" stroke={`url(#${finGradId})`} />
            <path d="M 17 38 L 24 40" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 16 47 L 23 49" stroke={`url(#${finGradId})`} />
            <path d="M 16 49 L 23 51" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 16 58 L 23 60" stroke={`url(#${finGradId})`} />
            <path d="M 16 60 L 23 62" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 16 69 L 23 71" stroke={`url(#${finGradId})`} />
            <path d="M 16 71 L 23 73" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 17 80 L 24 82" stroke={`url(#${finGradId})`} />
            <path d="M 17 82 L 24 84" stroke="#0e1115" strokeWidth="1.2" />

            {/* --- Aletas da Direita (Espelhamento exato) --- */}
            <path d="M 87 36 L 80 38" stroke={`url(#${finGradId})`} />
            <path d="M 87 38 L 80 40" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 88 47 L 81 49" stroke={`url(#${finGradId})`} />
            <path d="M 88 49 L 81 51" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 88 58 L 81 60" stroke={`url(#${finGradId})`} />
            <path d="M 88 60 L 81 62" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 88 69 L 81 71" stroke={`url(#${finGradId})`} />
            <path d="M 88 71 L 81 73" stroke="#0e1115" strokeWidth="1.2" />

            <path d="M 87 80 L 80 82" stroke={`url(#${finGradId})`} />
            <path d="M 87 82 L 80 84" stroke="#0e1115" strokeWidth="1.2" />
          </g>

          {/* Flange / Engate mecânico de travamento simétrico sobre o bloco de bornes */}
          <path
            d="M 12 90 L 92 90 L 94 94 L 10 94 Z"
            fill="#121519"
            stroke="#2b313a"
            strokeWidth="0.8"
          />
          <circle cx="16" cy="92" r="1.4" fill="#475569" />
          <circle cx="88" cy="92" r="1.4" fill="#475569" />

          {/* Colar / Anel de encosto e retenção preto do painel (centralizado) */}
          <circle
            cx="52"
            cy="48"
            r="32.5"
            fill="#121519"
            stroke="#2b313a"
            strokeWidth="1"
          />

          {/* Anel Chanfrado da Lente (Moldura no polímero escuro) */}
          <circle
            cx="52"
            cy="48"
            r="30"
            fill="#14171c"
            stroke="#2d333d"
            strokeWidth="1.8"
          />
          <circle
            cx="52"
            cy="48"
            r="28"
            fill={isLit ? cCfg.litMain : cCfg.unlitRim}
            stroke={isLit ? cCfg.litHalo : cCfg.unlitBorder}
            strokeWidth="1.4"
            opacity={isLit ? 0.95 : 0.85}
          />
        </g>

        {/* -----------------------------------------------------------------
            3. LENTE FRONTAL CIRCULAR TRANSLÚCIDA (Highlight central da sinaleira)
            ----------------------------------------------------------------- */}
        <g id="pilotLampLensGroup">
          {/* Lente principal convexa com textura interna */}
          <circle
            cx="52"
            cy="48"
            r="25.5"
            fill={`url(#${lensGradId})`}
            stroke={isLit ? '#ffffff' : cCfg.unlitBorder}
            strokeWidth={isLit ? '1.2' : '0.9'}
          />

          {/* Anel difusor concêntrico interno (padrão óptico Fresnel da lente LED) */}
          <circle
            cx="52"
            cy="48"
            r="19"
            fill="none"
            stroke={isLit ? cCfg.litCore : cCfg.unlitRim}
            strokeWidth="1.5"
            strokeDasharray="4 2.5"
            opacity={isLit ? 0.85 : 0.45}
          />
          <circle
            cx="52"
            cy="48"
            r="13"
            fill="none"
            stroke={isLit ? cCfg.litMid : cCfg.unlitCenter}
            strokeWidth="1.1"
            opacity={isLit ? 0.75 : 0.35}
          />

          {/* Núcleo LED central de alta intensidade quando acesa */}
          {isLit && (
            <circle
              cx="52"
              cy="48"
              r="8"
              fill={cCfg.litCore}
              opacity="0.95"
              filter={`url(#${glowId})`}
            />
          )}

          {/* Reflexo especular curvilíneo de estúdio (brilho acrílico superior) */}
          <path
            d="M 31 42 C 35 28 61 24 71 34 C 65 30 42 32 31 42 Z"
            fill="#ffffff"
            opacity={isLit ? 0.75 : 0.42}
          />
          {/* Ponto secundário de reflexo esférico */}
          <ellipse
            cx="66"
            cy="60"
            rx="3"
            ry="1.8"
            fill="#ffffff"
            opacity={isLit ? 0.4 : 0.22}
            transform="rotate(-30 66 60)"
          />
        </g>

        {/* -----------------------------------------------------------------
            4. BLOCO INFERIOR DE TERMINAIS E CONEXÕES INDUSTRIAIS (X1 e X2)
            ----------------------------------------------------------------- */}
        <g id="pilotLampTerminalBlock">
          {/* Base em termoplástico preto para fixação dos bornes */}
          <rect
            x="10"
            y="94"
            width="84"
            height="46"
            rx="8"
            fill="#181c22"
            stroke="#2d333e"
            strokeWidth="1.4"
            filter={`url(#${shadowId})`}
          />
          {/* Friso central separador de isolação entre X1 e X2 */}
          <line x1="52" y1="96" x2="52" y2="138" stroke="#0e1115" strokeWidth="2.4" />
          <line x1="53" y1="96" x2="53" y2="138" stroke="#2b313b" strokeWidth="0.8" />

          {/* ----------------- BORNE X1 (Esquerda) ----------------- */}
          <g
            className={`pilot-lamp-terminal ${isX1Active ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onTerminalClick(componentId, 'X1');
            }}
            style={{ cursor: 'crosshair' }}
            title={`Borne X1 (Alimentação da Sinaleira): ${vX1 ? `Energizado (${vX1})` : '0V'} • Clique para conectar`}
            data-terminal-target={`${componentId}:X1`}
          >
            {/* Área invisível ampla para clique confortável */}
            <circle cx="31" cy="117" r="18" fill="transparent" />

            {/* Rebaixo escuro usinado do borne */}
            <circle
              cx="31"
              cy="117"
              r="12"
              fill="#0d1014"
              stroke="#2d3440"
              strokeWidth="1.2"
            />

            {/* Anel indicador de conexão e status */}
            <circle
              cx="31"
              cy="117"
              r="10"
              fill="none"
              stroke={isX1Active ? '#00e676' : vX1 ? getVoltageColor(vX1) : '#64748b'}
              strokeWidth={isX1Active ? '2.8' : '1.8'}
              style={{
                filter: isX1Active ? 'drop-shadow(0 0 5px #00e676)' : 'none',
              }}
            />

            {/* Parafuso do borne */}
            <circle cx="31" cy="117" r="6.5" fill={`url(#${screwGradId})`} stroke="#334155" strokeWidth="0.8" />
            <line x1="28" y1="117" x2="34" y2="117" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="31" y1="114" x2="31" y2="120" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />

            {/* Ponto indicador de tensão se energizado */}
            {vX1 && <circle cx="31" cy="117" r="2.6" fill={getVoltageColor(vX1)} />}

            {/* Rótulo 'X1' em baixo-relevo / serigrafia técnica */}
            <text
              x="31"
              y="136"
              fill={isX1Active ? '#00e676' : '#94a3b8'}
              fontSize="8.5"
              fontWeight="800"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              X1
            </text>
          </g>

          {/* ----------------- BORNE X2 (Direita) ----------------- */}
          <g
            className={`pilot-lamp-terminal ${isX2Active ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onTerminalClick(componentId, 'X2');
            }}
            style={{ cursor: 'crosshair' }}
            title={`Borne X2 (Retorno da Sinaleira): ${vX2 ? `Energizado (${vX2})` : '0V'} • Clique para conectar`}
            data-terminal-target={`${componentId}:X2`}
          >
            {/* Área invisível ampla para clique confortável */}
            <circle cx="73" cy="117" r="18" fill="transparent" />

            {/* Rebaixo escuro usinado do borne */}
            <circle
              cx="73"
              cy="117"
              r="12"
              fill="#0d1014"
              stroke="#2d3440"
              strokeWidth="1.2"
            />

            {/* Anel indicador de conexão e status */}
            <circle
              cx="73"
              cy="117"
              r="10"
              fill="none"
              stroke={isX2Active ? '#00e676' : vX2 ? getVoltageColor(vX2) : '#64748b'}
              strokeWidth={isX2Active ? '2.8' : '1.8'}
              style={{
                filter: isX2Active ? 'drop-shadow(0 0 5px #00e676)' : 'none',
              }}
            />

            {/* Parafuso do borne */}
            <circle cx="73" cy="117" r="6.5" fill={`url(#${screwGradId})`} stroke="#334155" strokeWidth="0.8" />
            <line x1="70" y1="117" x2="76" y2="117" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="73" y1="114" x2="73" y2="120" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />

            {/* Ponto indicador de tensão se energizado */}
            {vX2 && <circle cx="73" cy="117" r="2.6" fill={getVoltageColor(vX2)} />}

            {/* Rótulo 'X2' em baixo-relevo / serigrafia técnica */}
            <text
              x="73"
              y="136"
              fill={isX2Active ? '#00e676' : '#94a3b8'}
              fontSize="8.5"
              fontWeight="800"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              X2
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
