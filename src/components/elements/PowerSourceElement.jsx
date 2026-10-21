import React from 'react';

/**
 * Nova Fonte de Tensão: Transformador Industrial Trifásico com Neutro e Aterramento (PE)
 * Imagem com fundo transparente, bornes ajustados aos originais (sem duplicar texto ou bezels).
 */
export default function PowerSourceElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onOpenSettings,
}) {
  const isPowered = component.state?.powered !== false;

  // Exact coordinates matching the transformer vector artwork
  // N, L1, L2, L3 are centered directly on the drawn sockets
  // PE location: placed safely on the tank face, completely clear of radiator fins
  const terminals = component.terminals || [
    { id: 'N', label: 'N', x: 134, y: 156, color: '#2563eb', type: 'source_n' },
    { id: 'L1', label: 'L1', x: 185, y: 156, color: '#a855f7', type: 'source_l1' },
    { id: 'L2', label: 'L2', x: 234, y: 156, color: '#ffffff', type: 'source_l2' },
    { id: 'L3', label: 'L3', x: 285, y: 156, color: '#ef4444', type: 'source_l3' },
    { id: 'PE', label: 'PE', x: 72, y: 375, color: '#16a34a', type: 'source_pe' },
  ];

  const peTerminal = terminals.find((t) => t.id === 'PE');
  const phaseTerminals = terminals.filter((t) => t.id !== 'PE');

  return (
    <div
      className={`transformer-power-source-plate ${isPowered ? 'is-powered' : 'is-unpowered'}`}
      style={{
        width: '420px',
        height: '414px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Background Transformer Graphic with 100% transparent background */}
      <img
        src="/assets/transformer.png"
        alt="Transformador de Alimentação"
        className="transformer-bg-img"
        draggable={false}
      />

      {/* Grounding (PE) Hexagonal Bolt Terminal on the transformer chassis base foot */}
      {peTerminal && (
        <div
          className="transformer-pe-foot-socket"
          style={{
            position: 'absolute',
            left: `${peTerminal.x}px`,
            top: `${peTerminal.y}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
            cursor: 'crosshair',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick(component.id, 'PE');
          }}
          title="Aterramento da Carcaça do Transformador (PE): 0V (Sapata da Base - Parafuso Sextavado)"
          data-terminal-target={`${component.id}:PE`}
        >
          <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id={`hexGradPE-${component.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="30%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            {/* Arruela dentada de aterramento verde */}
            <circle cx="15" cy="15" r="13" fill="#090d16" stroke="#16a34a" strokeWidth="2.5" />
            <circle cx="15" cy="15" r="11" fill="none" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="3 1.5" />
            {/* Cabeça do Parafuso Sextavado M8 */}
            <polygon
              points="15,6 22.8,10.5 22.8,19.5 15,24 7.2,19.5 7.2,10.5"
              fill={`url(#hexGradPE-${component.id})`}
              stroke="#1e293b"
              strokeWidth="1"
            />
            {/* Rebaixo central do parafuso */}
            <circle cx="15" cy="15" r="2.8" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            {/* Indicador de seleção / conexão ativa */}
            {activeTerminal?.componentId === component.id && activeTerminal?.terminalId === 'PE' && (
              <circle cx="15" cy="15" r="14" fill="none" stroke="#00e676" strokeWidth="2" filter="drop-shadow(0 0 6px #00e676)" />
            )}
          </svg>
        </div>
      )}

      {/* Hexagonal Bolts (Parafusos Sextavados) for N, L1, L2, L3 with correct colors:
          L1 = Roxo (#a855f7), L2 = Branco (#ffffff), L3 = Vermelho (#ef4444), N = Azul (#2563eb) */}
      {phaseTerminals.map((term) => {
        const vKey = `${component.id}:${term.id}`;
        const volt = terminalVoltages.get(vKey);
        const isSelected =
          activeTerminal?.componentId === component.id &&
          activeTerminal?.terminalId === term.id;

        // Visual phase color mapping strictly aligned with user specification:
        // L1: Roxo (#a855f7)
        // L2: Branco (#ffffff)
        // L3: Vermelho (#ef4444)
        // N:  Azul (#2563eb)
        const phaseColor =
          term.id === 'L1' ? '#a855f7' :
          term.id === 'L2' ? '#ffffff' :
          term.id === 'L3' ? '#ef4444' :
          '#2563eb';

        const phaseName =
          term.id === 'L1' ? 'L1 (Fase Roxo)' :
          term.id === 'L2' ? 'L2 (Fase Branco)' :
          term.id === 'L3' ? 'L3 (Fase Vermelho)' :
          'N (Neutro Azul)';

        const hexGradId = `hexGrad-${term.id}-${component.id}`;

        return (
          <div
            key={term.id}
            className={`transformer-hex-bolt-socket ${isSelected ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: `${term.x}px`,
              top: `${term.y}px`,
              width: '32px',
              height: '32px',
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              cursor: 'crosshair',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onTerminalClick(component.id, term.id);
            }}
            title={`${phaseName}: ${volt ? `Energizado (${volt})` : 'Sem tensão'} • Parafuso Sextavado`}
            data-terminal-target={`${component.id}:${term.id}`}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id={hexGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#cbd5e1" />
                  <stop offset="70%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Arruela de encosto lisa em aço zincado com borda da cor de fase */}
              <circle
                cx="16"
                cy="16"
                r="14.5"
                fill="#0f172a"
                stroke={phaseColor}
                strokeWidth="2.8"
                style={{
                  filter: isSelected
                    ? 'drop-shadow(0 0 6px #00e676)'
                    : volt
                    ? `drop-shadow(0 0 5px ${phaseColor})`
                    : `drop-shadow(0 1px 3px rgba(0,0,0,0.6))`,
                }}
              />
              <circle cx="16" cy="16" r="12.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              {/* Cabeça do Parafuso Sextavado (Hexagon Bolt Head) */}
              <polygon
                points="16,6.5 24.2,11.2 24.2,20.8 16,25.5 7.8,20.8 7.8,11.2"
                fill={`url(#${hexGradId})`}
                stroke="#1e293b"
                strokeWidth="1.2"
              />

              {/* Rebaixo usinado central do parafuso com ponto de medição de tensão */}
              <circle cx="16" cy="16" r="3.2" fill={volt ? phaseColor : '#1e293b'} stroke="#334155" strokeWidth="0.8" />

              {/* Destaque de seleção de borne ativo */}
              {isSelected && (
                <circle cx="16" cy="16" r="15" fill="none" stroke="#00e676" strokeWidth="2.2" />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
