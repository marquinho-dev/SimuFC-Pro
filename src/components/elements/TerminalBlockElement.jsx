import React from 'react';

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
 * Borneira de Passagem Modular (Terminal Block / Régua de Bornes)
 * Modelado fielmente conforme a referência industrial:
 * - Módulos acopláveis lado a lado para montagem em trilho DIN
 * - Cada módulo possui:
 *   - Borne superior com parafuso de fenda cruzada e alvéolo protetor IP20
 *   - Área central com canaleta de identificação branca e janela de inspeção interna
 *   - Borne inferior com parafuso de fenda cruzada
 *   - Continuidade elétrica direta entre o borne superior e o borne inferior do mesmo módulo
 * - Quantidade de bornes configurável (1, 2, 3, 4, 6, 8, 10, 12, etc.)
 */
export default function TerminalBlockElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  onOpenSettings,
  isSimulationMode = false,
  isSelected = false,
}) {
  const poles = Math.max(1, Math.min(24, Number(component.state?.poles) || 4));
  const componentId = component.id;

  const MOD_W = 34;
  const TOTAL_W = poles * MOD_W;
  const TOTAL_H = 146;

  // Ids escopados para SVG
  const shadowId = `tbShadow-${componentId}`;
  const plasticGradId = `tbPlastic-${componentId}`;
  const screwGradId = `tbScrew-${componentId}`;
  const clipGradId = `tbClip-${componentId}`;

  return (
    <div
      className={`terminal-block-component ${isSelected ? 'selected' : ''}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isSimulationMode && onOpenSettings) {
          onOpenSettings(component);
        }
      }}
      style={{
        width: `${TOTAL_W}px`,
        height: `${TOTAL_H}px`,
        position: 'relative',
        userSelect: 'none',
        background: 'transparent',
        cursor: 'default',
      }}
      data-component-type="terminal_block"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
        width={TOTAL_W}
        height={TOTAL_H}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <filter id={shadowId} x="-15%" y="-10%" width="130%" height="125%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.55" />
          </filter>

          {/* Gradiente do plástico cinza-grafite industrial */}
          <linearGradient id={plasticGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#252a32" />
            <stop offset="35%" stopColor="#373e48" />
            <stop offset="70%" stopColor="#454c57" />
            <stop offset="100%" stopColor="#22262d" />
          </linearGradient>

          {/* Gradiente do clipe de acoplamento superior */}
          <linearGradient id={clipGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="50%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>

          {/* Gradiente do parafuso em aço temperado / oxidado */}
          <radialGradient id={screwGradId} cx="36%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="35%" stopColor="#64748b" />
            <stop offset="85%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        {/* -----------------------------------------------------------------
            CORPO DOS MÓDULOS DE BORNES ACOPLADOS LADO A LADO
            ----------------------------------------------------------------- */}
        <g filter={`url(#${shadowId})`}>
          {Array.from({ length: poles }).map((_, idx) => {
            const bx = idx * MOD_W;
            const termIdTop = `${idx + 1}`;
            const termIdBot = `${idx + 1}_bot`;

            const vTop = terminalVoltages?.get(`${componentId}:${termIdTop}`);
            const vBot = terminalVoltages?.get(`${componentId}:${termIdBot}`);

            const isTopActive =
              activeTerminal?.componentId === componentId &&
              activeTerminal?.terminalId === termIdTop;
            const isBotActive =
              activeTerminal?.componentId === componentId &&
              activeTerminal?.terminalId === termIdBot;

            return (
              <g key={`module-${idx}`}>
                {/* 1. Base principal do módulo individual */}
                <rect
                  x={bx + 1}
                  y="6"
                  width={MOD_W - 2}
                  height="134"
                  rx="4"
                  fill={`url(#${plasticGradId})`}
                  stroke="#16191f"
                  strokeWidth="1.2"
                />

                {/* Linha de separação mecânica entre módulos adjacentes */}
                {idx > 0 && (
                  <line
                    x1={bx}
                    y1="8"
                    x2={bx}
                    y2="138"
                    stroke="#111317"
                    strokeWidth="1.8"
                  />
                )}

                {/* 2. Grampo/Clipe superior mecânico (conforme foto) */}
                <rect
                  x={bx + 6}
                  y="3"
                  width={MOD_W - 12}
                  height="8"
                  rx="1.5"
                  fill={`url(#${clipGradId})`}
                  stroke="#111827"
                  strokeWidth="0.8"
                />
                <rect
                  x={bx + 9}
                  y="5"
                  width={MOD_W - 18}
                  height="4"
                  rx="1"
                  fill="#0f172a"
                />

                {/* 3. Rebaixo / Alvéolo Superior do Parafuso (Proteção contra choque IP20) */}
                <ellipse
                  cx={bx + 17}
                  cy="28"
                  rx="12.5"
                  ry="12.5"
                  fill="#15181e"
                  stroke="#2b313a"
                  strokeWidth="1"
                />
                <ellipse
                  cx={bx + 17}
                  cy="28"
                  rx="10.5"
                  ry="10.5"
                  fill="#0f1115"
                />

                {/* 4. Borne Superior Interativo (Terminal idx + 1) */}
                <g
                  className={`tb-screw-terminal ${isTopActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTerminalClick(componentId, termIdTop);
                  }}
                  style={{ cursor: 'crosshair' }}
                  title={`Borne ${termIdTop} (Superior): ${vTop ? `Energizado (${vTop})` : '0V'} • Clique para conectar`}
                  data-terminal-target={`${componentId}:${termIdTop}`}
                >
                  {/* Área invisível ampla de clique */}
                  <circle cx={bx + 17} cy="28" r="16" fill="transparent" />

                  {/* Anel indicador de conexão */}
                  <circle
                    cx={bx + 17}
                    cy="28"
                    r="9.5"
                    fill="none"
                    stroke={isTopActive ? '#00e676' : vTop ? getVoltageColor(vTop) : '#64748b'}
                    strokeWidth={isTopActive ? '2.8' : '1.4'}
                    style={{
                      filter: isTopActive ? 'drop-shadow(0 0 5px #00e676)' : 'none',
                    }}
                  />

                  {/* Cabeça do Parafuso de Fenda Cruzada */}
                  <circle
                    cx={bx + 17}
                    cy="28"
                    r="6.8"
                    fill={`url(#${screwGradId})`}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  {/* Fenda Phillips/Slotted */}
                  <line
                    x1={bx + 13}
                    y1="28"
                    x2={bx + 21}
                    y2="28"
                    stroke="#0b0f14"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <line
                    x1={bx + 17}
                    y1="24"
                    x2={bx + 17}
                    y2="32"
                    stroke="#0b0f14"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />

                  {/* Ponto indicador de fase/tensão */}
                  {vTop && (
                    <circle cx={bx + 17} cy="28" r="2.8" fill={getVoltageColor(vTop)} />
                  )}
                </g>

                {/* -----------------------------------------------------------------
                    5. ZONA CENTRAL DE IDENTIFICAÇÃO (Fiel à foto de referência)
                    Plaqueta cinza/branca com numeração e miolo vermelho de inspeção
                    ----------------------------------------------------------------- */}
                {/* Plaqueta Superior de Identificação (ex: "1" ou "NC 1") */}
                <rect
                  x={bx + 3.5}
                  y="46"
                  width={MOD_W - 7}
                  height="16"
                  rx="1.5"
                  fill="#333a44"
                  stroke="#1c2026"
                  strokeWidth="0.8"
                />
                <text
                  x={bx + 17}
                  y="58"
                  fill="#f1f5f9"
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="Helvetica, Arial, sans-serif"
                  textAnchor="middle"
                  letterSpacing="0.2"
                >
                  {poles === 1 ? '1' : `${idx + 1}`}
                </text>

                {/* Miolo / Câmara de Contato Interna Vermelha (exatamente como na foto) */}
                <rect
                  x={bx + 4.5}
                  y="64"
                  width={MOD_W - 9}
                  height="14"
                  rx="1"
                  fill="#8a1c1c"
                  stroke="#4c0d0d"
                  strokeWidth="0.6"
                />
                {/* Frisos internos da câmara */}
                <line x1={bx + 11} y1="65" x2={bx + 11} y2="77" stroke="#4c0d0d" strokeWidth="1" />
                <line x1={bx + 17} y1="65" x2={bx + 17} y2="77" stroke="#4c0d0d" strokeWidth="1" />
                <line x1={bx + 23} y1="65" x2={bx + 23} y2="77" stroke="#4c0d0d" strokeWidth="1" />

                {/* Plaqueta Inferior de Identificação (ex: "2" ou "1'") */}
                <rect
                  x={bx + 3.5}
                  y="80"
                  width={MOD_W - 7}
                  height="16"
                  rx="1.5"
                  fill="#333a44"
                  stroke="#1c2026"
                  strokeWidth="0.8"
                />
                <text
                  x={bx + 17}
                  y="92"
                  fill="#f1f5f9"
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="Helvetica, Arial, sans-serif"
                  textAnchor="middle"
                  letterSpacing="0.2"
                >
                  {poles === 1 ? '2' : `${idx + 1}'`}
                </text>

                {/* 6. Rebaixo / Alvéolo Inferior do Parafuso */}
                <ellipse
                  cx={bx + 17}
                  cy="118"
                  rx="12.5"
                  ry="12.5"
                  fill="#15181e"
                  stroke="#2b313a"
                  strokeWidth="1"
                />
                <ellipse
                  cx={bx + 17}
                  cy="118"
                  rx="10.5"
                  ry="10.5"
                  fill="#0f1115"
                />

                {/* 7. Borne Inferior Interativo (Terminal idx + 1_bot) */}
                <g
                  className={`tb-screw-terminal ${isBotActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTerminalClick(componentId, termIdBot);
                  }}
                  style={{ cursor: 'crosshair' }}
                  title={`Borne ${termIdBot} (Inferior): ${vBot ? `Energizado (${vBot})` : '0V'} • Clique para conectar`}
                  data-terminal-target={`${componentId}:${termIdBot}`}
                >
                  {/* Área invisível ampla de clique */}
                  <circle cx={bx + 17} cy="118" r="16" fill="transparent" />

                  {/* Anel indicador de conexão */}
                  <circle
                    cx={bx + 17}
                    cy="118"
                    r="9.5"
                    fill="none"
                    stroke={isBotActive ? '#00e676' : vBot ? getVoltageColor(vBot) : '#64748b'}
                    strokeWidth={isBotActive ? '2.8' : '1.4'}
                    style={{
                      filter: isBotActive ? 'drop-shadow(0 0 5px #00e676)' : 'none',
                    }}
                  />

                  {/* Cabeça do Parafuso de Fenda Cruzada */}
                  <circle
                    cx={bx + 17}
                    cy="118"
                    r="6.8"
                    fill={`url(#${screwGradId})`}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  {/* Fenda Phillips/Slotted */}
                  <line
                    x1={bx + 13}
                    y1="118"
                    x2={bx + 21}
                    y2="118"
                    stroke="#0b0f14"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <line
                    x1={bx + 17}
                    y1="114"
                    x2={bx + 17}
                    y2="122"
                    stroke="#0b0f14"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />

                  {/* Ponto indicador de fase/tensão */}
                  {vBot && (
                    <circle cx={bx + 17} cy="118" r="2.8" fill={getVoltageColor(vBot)} />
                  )}
                </g>

                {/* 8. Garras e pés de fixação para trilho DIN na base */}
                <path
                  d={`M ${bx + 4} 136 L ${bx + 8} 142 L ${bx + MOD_W - 8} 142 L ${bx + MOD_W - 4} 136`}
                  fill="#1b1e24"
                  stroke="#101317"
                  strokeWidth="0.8"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
