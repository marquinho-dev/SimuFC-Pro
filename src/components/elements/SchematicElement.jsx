import React, { useState } from 'react';
import {
  RotateCw,
  Settings,
  AlertTriangle,
  Zap,
  Power,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import {
  TIMER_RELAY_TERMINALS,
  getBreakerTerminals,
  SCHEMATIC_SOURCE_BUSES,
  SCHEMATIC_SOURCE_BUS_X_START,
  SCHEMATIC_SOURCE_BUS_X_END,
} from '../../types/components';
import TextNoteElement from './TextNoteElement';

export function getConnectedWireColor(
  componentId,
  terminalId,
  wires,
  fallbackColor = null,
  voltage = null,
  terminalVoltages = null
) {
  // If energized with a phase/neutral/PE potential, adopt the active phase color!
  const getPhaseColor = (v) => {
    if (!v) return null;
    const s = String(v).toUpperCase().trim();
    if (s === 'L1') return '#a855f7'; // Roxo
    if (s === 'L2') return '#ffffff'; // Branco
    if (s === 'L3') return '#ef4444'; // Vermelho
    if (s === 'N')  return '#06b6d4'; // Cyan
    if (s === 'PE') return '#16a34a'; // Verde
    return '#38bdf8';
  };

  const isPE = String(terminalId).toUpperCase() === 'PE';
  const w = wires?.find?.(
    (wire) =>
      (wire.fromComponent === componentId && String(wire.fromTerminal) === String(terminalId)) ||
      (wire.toComponent === componentId && String(wire.toTerminal) === String(terminalId))
  );

  let activeVolt = voltage;
  if (!activeVolt && terminalVoltages?.get) {
    activeVolt =
      terminalVoltages.get(`${componentId}:${terminalId}`) ||
      (w ? terminalVoltages.get(`wire:${w.id}`) : null);
  }

  if (activeVolt) {
    const pc = getPhaseColor(activeVolt);
    if (pc) return pc;
  }

  if (!wires || !wires.length) return isPE ? '#16a34a' : fallbackColor;
  if (!w) return isPE ? '#16a34a' : fallbackColor;
  if (isPE) return '#16a34a';
  return w.color || '#38bdf8';
}

/**
 * Technical IEC CAD Terminal Point (Borne de Conexão Esquemático)
 * Perfectly positioned at (terminal.x, terminal.y) matching physical terminal coordinates
 */
export function SchematicTerminalPoint({
  componentId,
  terminal,
  voltage,
  wireColor,
  isSelected,
  isConnecting,
  onTerminalClick,
  labelPosition = 'top', // 'top' | 'bottom' | 'left' | 'right'
  className = '',
}) {
  const isPowered = Boolean(voltage);

  const getVoltageColor = (v) => {
    switch (v) {
      case 'L1':
        return '#a855f7'; // Roxo (Purple)
      case 'L2':
        return '#ffffff'; // Branco (White)
      case 'L3':
        return '#ef4444'; // Vermelho (Red)
      case 'N':
        return '#06b6d4'; // Cyan
      case 'PE':
        return '#16a34a'; // Green
      default:
        return '#38bdf8';
    }
  };

  const voltColor = getVoltageColor(voltage);
  // When energized, always adopt the active phase color; when de-energized, adopt the wire color
  const activeColor = (isPowered && voltColor) ? voltColor : (wireColor || null);

  return (
    <div
      className={`schematic-terminal-point label-pos-${labelPosition} ${
        isSelected ? 'selected' : ''
      } ${isConnecting ? 'wire-target-ready' : ''} ${isPowered ? 'is-powered' : ''} ${className}`}
      style={{
        position: 'absolute',
        left: `${terminal.x}px`,
        top: `${terminal.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 25,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onTerminalClick(componentId, terminal.id);
      }}
      title={`${terminal.label || terminal.id}: ${voltage ? `Energizado (${voltage})` : 'Sem tensão'}`}
    >
      <div
        className={`schematic-terminal-node ${activeColor ? 'has-wire-color' : ''}`}
        data-terminal-target={`${componentId}:${terminal.id}`}
        style={{
          borderColor: isSelected
            ? '#00e676'
            : activeColor || 'rgba(148, 163, 184, 0.6)',
          backgroundColor: activeColor || 'rgba(30, 41, 59, 0.85)',
          boxShadow: activeColor
            ? `0 0 6px ${activeColor}`
            : isSelected
            ? '0 0 10px #00e676'
            : 'none',
        }}
      >
        {!activeColor && (
          <div
            className="schematic-terminal-dot"
            style={{
              backgroundColor: 'rgba(148, 163, 184, 0.5)',
            }}
          />
        )}
      </div>

      {!terminal.hideLabel && (
        <span
          className="schematic-terminal-label"
          style={{ color: activeColor || (isPowered ? voltColor : '#cbd5e1') }}
        >
          {terminal.label || terminal.id}
        </span>
      )}
    </div>
  );
}

/**
 * 1. Barramento de Alimentação Esquemático (Power Source)
 */
function SchematicPowerSource({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
  onOpenSettings,
}) {
  const mode = component.state?.mode || '3P_N_PE';
  const vStd = component.state?.voltageStandard === '220_127' ? '220V/127V' : '380V/220V';

  const terminals = component.terminals || [];

  // Determine active phases according to configured mode
  const isL1Active = true;
  const isL2Active = !mode.startsWith('1P');
  const isL3Active = mode.includes('3P');
  const isNActive = mode.includes('N');
  const isPEActive = mode.includes('PE');

  const activeBuses = [
    isL1Active && SCHEMATIC_SOURCE_BUSES.L1,
    isL2Active && SCHEMATIC_SOURCE_BUSES.L2,
    isL3Active && SCHEMATIC_SOURCE_BUSES.L3,
    isNActive && SCHEMATIC_SOURCE_BUSES.N,
    isPEActive && SCHEMATIC_SOURCE_BUSES.PE,
  ].filter(Boolean);

  return (
    <div
      className="schematic-device-card schematic-power-source"
      style={{
        width: '220px',
        height: '250px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div className="schematic-device-header">
        <span className="schematic-device-tag">{component.tag || '-X1'}</span>
        <span className="schematic-source-spec">REDE {vStd} 60Hz</span>
      </div>

      <svg
        className="schematic-svg-canvas"
        viewBox="0 0 220 250"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {activeBuses.map((bus) => (
          <g key={`bus-${bus.id}`}>
            {/* Legenda à esquerda, totalmente desimpedida e legível */}
            <text
              x="14"
              y={bus.y + 5}
              fill={bus.color}
              fontSize="14"
              fontWeight="800"
              fontFamily="var(--font-mono, monospace)"
              letterSpacing="0.5px"
            >
              {bus.label}
            </text>

            {/* Linha do barramento inicia DEPOIS da legenda (sem sobreposição) e vai até o borne na extremidade oposta */}
            <line
              x1={SCHEMATIC_SOURCE_BUS_X_START}
              y1={bus.y}
              x2={SCHEMATIC_SOURCE_BUS_X_END}
              y2={bus.y}
              stroke={bus.color}
              strokeWidth={bus.strokeWidth || 3}
              strokeDasharray={bus.dashed ? '7 4' : undefined}
              strokeLinecap="round"
            />

            {/* Ponto terminal visual na extremidade direita do barramento (cor do barramento/fio) */}
            <circle
              cx={SCHEMATIC_SOURCE_BUS_X_END}
              cy={bus.y}
              r="4.5"
              fill={bus.color}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
          </g>
        ))}
      </svg>

      {/* Pontos de conexão posicionados exatamente na extremidade oposta da legenda (lado direito) */}
      {terminals.map((t) => {
        const bus = SCHEMATIC_SOURCE_BUSES[t.id];
        const connectedColor = getConnectedWireColor(component.id, t.id, wires, bus?.color);
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={{
              ...t,
              x: SCHEMATIC_SOURCE_BUS_X_END,
              y: bus ? bus.y : t.y,
              hideLabel: true, // Sem duplicar texto flutuante, a legenda já está no barramento
            }}
            voltage={terminalVoltages.get(`${component.id}:${t.id}`)}
            wireColor={connectedColor}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition="right"
          />
        );
      })}
    </div>
  );
}

/**
 * 2. Disjuntor Esquemático (Circuit Breaker Q1)
 * Representação fiel ao padrão industrial IEC com contatos em 'X', manopla com pulso e acoplamento tracejado.
 */
function SchematicBreaker({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
  onUpdateComponentState,
  onOpenSettings,
  isSimulationMode = false,
}) {
  const poles = Math.max(1, Math.min(3, Number(component.state?.poles) || 3));
  // In initial state or de-energized normal state, breaker is OPEN (closed: false)
  const isClosed = Boolean(component.state?.closed);
  const terminals = getBreakerTerminals(poles);
  const cardWidth = 240;
  const displayTag = component.tag || 'Q1';

  const handleToggle = (e) => {
    e.stopPropagation();
    try {
      if (typeof sounds.playBreakerToggle === 'function') {
        sounds.playBreakerToggle(!isClosed);
      } else if (typeof sounds.playSwitch === 'function') {
        sounds.playSwitch();
      }
    } catch {}
    if (onUpdateComponentState) {
      onUpdateComponentState(component.id, { closed: !isClosed });
    }
  };

  const lastXc = Math.round(57.5 + (poles - 1) * 56);
  const dashEndX = Math.max(lastXc + 18, 176);
  const tagX = Math.min(225, Math.max(lastXc + 34, 200));

  return (
    <div
      className={`schematic-device-card schematic-breaker ${isClosed ? 'state-closed' : 'state-open'}`}
      style={{ width: `${cardWidth}px`, height: '200px', background: 'transparent', border: 'none', position: 'relative' }}
      title={`Disjuntor ${displayTag}: ${isClosed ? 'FECHADO (Conduzindo)' : 'ABERTO / DESARMADO'}. Clique para alternar.`}
    >
      <svg className="schematic-svg-canvas" viewBox="0 0 240 200" style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}>
        {/* Clickable Area Over Breaker Mechanism */}
        <rect
          x="0"
          y="80"
          width={cardWidth}
          height="65"
          fill="transparent"
          className="breaker-interactive-handle"
          onClick={handleToggle}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        />

        {Array.from({ length: poles }).map((_, i) => {
          const xc = Math.round(57.5 + i * 56);
          const topNum = 1 + i * 2;
          const botNum = 2 + i * 2;
          const poleVoltTop = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${topNum}`) : undefined;
          const poleVoltBot = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${botNum}`) : undefined;
          const topWireColor = getConnectedWireColor(component.id, String(topNum), wires, null, poleVoltTop, terminalVoltages);
          const botWireColor = getConnectedWireColor(component.id, String(botNum), wires, null, poleVoltBot, terminalVoltages);
          const wireColor = '#ffffff';

          return (
            <g key={`breaker-pole-${i}`}>
              {/* Borne Superior */}
              <circle
                cx={xc}
                cy="60"
                r="4.5"
                fill={topWireColor || 'rgba(30, 41, 59, 0.85)'}
                stroke={topWireColor || wireColor}
                strokeWidth="2"
              />
              <text x={xc + 9} y="72" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
                {topNum}
              </text>

              {/* Condutor vertical superior */}
              <line x1={xc} y1="64.5" x2={xc} y2="92" stroke={wireColor} strokeWidth="2" />

              {/* Elemento de Disparo com 'X' */}
              <line x1={xc - 4.5} y1="92" x2={xc + 4.5} y2="100" stroke={wireColor} strokeWidth="2.2" />
              <line x1={xc - 4.5} y1="100" x2={xc + 4.5} y2="92" stroke={wireColor} strokeWidth="2.2" />

              {/* Borne Inferior */}
              <circle
                cx={xc}
                cy="170.5"
                r="4.5"
                fill={botWireColor || 'rgba(30, 41, 59, 0.85)'}
                stroke={botWireColor || wireColor}
                strokeWidth="2"
              />
              <text x={xc + 9} y="163" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
                {botNum}
              </text>

              {/* Condutor vertical inferior */}
              <line x1={xc} y1="166" x2={xc} y2="126" stroke={wireColor} strokeWidth="2" />

              {/* Palheta Móvel Articulada (Aberta por padrão, fechada quando acionado) */}
              <line
                x1={xc}
                y1="126"
                x2={isClosed ? xc : xc - 16.5}
                y2={isClosed ? 92 : 91}
                stroke={isClosed && poleVolt ? '#00e676' : wireColor}
                strokeWidth="2.4"
                strokeLinecap="round"
                style={{ transition: 'all 0.18s ease' }}
              />
            </g>
          );
        })}

        {/* Manopla com Ícone de Pulso à esquerda e Linha Tracejada de Acoplamento */}
        <g>
          {/* Ícone de degrau / pulso da manopla no lado esquerdo */}
          <path
            d="M 4 112 L 10 112 L 10 104 L 16 104 L 16 112 L 22 112"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
          />
          {/* Linha tracejada através das palhetas */}
          <line
            x1="22"
            y1="112"
            x2={dashEndX}
            y2="112"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeDasharray="5 4"
          />
          {/* Tag Q1 à direita */}
          <text
            x={tagX}
            y="116"
            fill="#ffffff"
            fontSize="15"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {displayTag}
          </text>
        </g>
      </svg>

      {terminals.map((t) => {
        const poleIndex = Math.floor((parseInt(t.id, 10) - 1) / 2);
        const xc = Math.round(57.5 + poleIndex * 56);
        const volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
        const poleWireColor = getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages);
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={{ ...t, x: xc, y: isTop ? 60 : 170.5, hideLabel: true }}
            voltage={volt}
            wireColor={poleWireColor}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition={isTop ? 'top' : 'bottom'}
            className="schematic-breaker-power-terminal"
          />
        );
      })}
    </div>
  );
}

/**
 * 2B. Seccionadora Porta-Fusível Esquemática (-F1)
 * IEC 60617 Standard: Seccionador com fusível cartucho 10x38mm
 */
function SchematicFuseHolder({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
}) {
  const isClosed = component.state?.closed !== false;
  const isBlown = Boolean(component.state?.fuseBlown);
  const displayTag = component.tag || 'F1';
  const rating = component.state?.currentRating || 30;

  const topVolt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:1`) : undefined;
  const botVolt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:2`) : undefined;
  const topWireColor = getConnectedWireColor(component.id, '1', wires, null, topVolt, terminalVoltages);
  const botWireColor = getConnectedWireColor(component.id, '2', wires, null, botVolt, terminalVoltages);
  const wireColor = topWireColor || '#38bdf8';

  const handleToggle = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    try {
      sounds.playButtonClick();
    } catch {}
    if (onUpdateComponentState) {
      onUpdateComponentState(component.id, { closed: !isClosed });
    }
  };

  const xc = 26;

  return (
    <div
      className={`schematic-device-card schematic-fuse ${isClosed ? 'state-closed' : 'state-open'} ${isBlown ? 'state-blown' : ''}`}
      style={{ width: '52px', height: '218px', background: 'transparent', border: 'none', position: 'relative', userSelect: 'none' }}
      title={isSimulationMode ? `Porta-Fusível ${displayTag}: ${isBlown ? 'QUEIMADO' : isClosed ? 'FECHADO (Conectado)' : 'ABERTO (Seccionado)'}. Clique para alternar.` : undefined}
    >
      <svg
        className="schematic-svg-canvas"
        viewBox="0 0 52 218"
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      >
        {/* Terminal 1 Superior */}
        <circle
          cx={xc}
          cy="21"
          r="4.5"
          fill={topWireColor || 'rgba(30, 41, 59, 0.85)'}
          stroke={topWireColor || '#38bdf8'}
          strokeWidth="2"
        />
        <text x={xc + 9} y="25" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
          1
        </text>
        <line x1={xc} y1="25.5" x2={xc} y2="52" stroke={topWireColor || '#38bdf8'} strokeWidth="2" />

        {/* Palheta Móvel do Seccionador */}
        <line
          x1={xc}
          y1="52"
          x2={isClosed ? xc : xc - 14}
          y2={isClosed ? "86" : "78"}
          stroke={wireColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          style={{ transition: 'all 0.16s ease' }}
        />
        {/* Arco de contato fixo */}
        <path d={`M ${xc} 52 A 5 5 0 0 0 ${xc} 62`} fill="none" stroke={wireColor} strokeWidth="2" />

        {/* Símbolo do Elo Fusível IEC 60617 (Retângulo com elo condutor) */}
        <g transform={`translate(${xc - 9}, 90)`}>
          <rect
            x="0"
            y="0"
            width="18"
            height="38"
            fill={isBlown ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.65)'}
            stroke={isBlown ? '#ef4444' : wireColor}
            strokeWidth="2"
            rx="1.5"
          />
          {/* Fio interno do elo fusível */}
          {!isBlown ? (
            <line x1="9" y1="-6" x2="9" y2="44" stroke={wireColor} strokeWidth="2" />
          ) : (
            <>
              <line x1="9" y1="-6" x2="9" y2="12" stroke="#ef4444" strokeWidth="2" />
              <line x1="9" y1="26" x2="9" y2="44" stroke="#ef4444" strokeWidth="2" />
              <path d="M 4 14 L 14 24 M 14 14 L 4 24" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* Condutor vertical inferior até terminal 2 */}
        <line x1={xc} y1="134" x2={xc} y2="192.5" stroke={botWireColor || '#38bdf8'} strokeWidth="2" />

        {/* Terminal 2 Inferior */}
        <circle
          cx={xc}
          cy="197"
          r="4.5"
          fill={botWireColor || 'rgba(30, 41, 59, 0.85)'}
          stroke={botWireColor || '#38bdf8'}
          strokeWidth="2"
        />
        <text x={xc + 9} y="201" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
          2
        </text>

        {/* Tag e Corrente Nominal */}
        <text x={xc - 14} y="76" fill="#f8fafc" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="end">
          {displayTag}
        </text>
        <text x={xc + 14} y="114" fill="#94a3b8" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
          {rating}A
        </text>
      </svg>

      {/* Alça interativa de clique para abrir/fechar */}
      <div
        className="schematic-breaker-toggle-btn"
        onClick={handleToggle}
        style={{
          position: 'absolute',
          left: '4px',
          top: '48px',
          width: '44px',
          height: '100px',
          cursor: isSimulationMode ? 'pointer' : 'grab',
          pointerEvents: isSimulationMode ? 'auto' : 'none',
          zIndex: 15,
        }}
        title={isSimulationMode ? `Porta-Fusível ${displayTag} (${isClosed ? 'Fechado' : 'Aberto'}). Clique para alternar.` : undefined}
      />

      {/* Pontos de Conexão Interativos */}
      <SchematicTerminalPoint
        componentId={component.id}
        terminal={{ id: '1', label: '1', x: xc, y: 21, hideLabel: true }}
        voltage={topVolt}
        wireColor={topWireColor}
        isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === '1'}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        labelPosition="top"
      />
      <SchematicTerminalPoint
        componentId={component.id}
        terminal={{ id: '2', label: '2', x: xc, y: 197, hideLabel: true }}
        voltage={botVolt}
        wireColor={botWireColor}
        isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === '2'}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        labelPosition="bottom"
      />
    </div>
  );
}

/**
 * 3. Contator Esquemático (Contactor K1/KM1 - Contatos de Força)
 * Representação fiel ao padrão de desenho esquemático industrial:
 * - Fundo 100% transparente (sem moldura ou caixa de card)
 * - 3 Polos de potência (1-2, 3-4, 5-6) com contatos fixos em semicírculo
 * - Palhetas móveis articuladas interligadas por traço mecânico tracejado (Abertas por padrão)
 * - Tag do contator (ex: KM1) à direita do 3º polo
 * - Separação total de Força e Comando (a bobina é representada separadamente no circuito de comando)
 */
function SchematicContactor({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
}) {
  const isEnergized = Boolean(component.state?.energized);
  const terminals = component.terminals || [];

  // Exibição da Tag: KM1, KM2 ou a tag definida pelo usuário
  const displayTag = component.tag
    ? (component.tag.startsWith('KM') ? component.tag : component.tag.replace(/^K/, 'KM'))
    : 'KM1';

  // 3 Polos de Potência: 1-2, 3-4, 5-6 com geometria idêntica à imagem enviada
  const poles = [
    { xc: 49.5, topId: '1', botId: '2' },
    { xc: 105.5, topId: '3', botId: '4' },
    { xc: 161.5, topId: '5', botId: '6' },
  ];

  return (
    <div
      className={`schematic-device-card schematic-contactor ${
        isEnergized ? 'state-energized' : ''
      }`}
      style={{ width: '240px', height: '200px', background: 'transparent', border: 'none' }}
    >
      <svg className="schematic-svg-canvas" viewBox="0 0 240 200" style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}>
        {/* 3 Polos de Potência */}
        {poles.map((p, idx) => {
          const wireColor = '#ffffff';
          const xc = Math.round(p.xc);
          const topVolt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${p.topId}`) : undefined;
          const botVolt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${p.botId}`) : undefined;
          const topWireColor = getConnectedWireColor(component.id, String(p.topId), wires, null, topVolt, terminalVoltages);
          const botWireColor = getConnectedWireColor(component.id, String(p.botId), wires, null, botVolt, terminalVoltages);

          return (
            <g key={`main-pole-${idx}`}>
              {/* Borne Superior (1, 3, 5) */}
              <circle
                cx={xc}
                cy="60"
                r="4.5"
                fill={topWireColor || 'rgba(30, 41, 59, 0.85)'}
                stroke={topWireColor || wireColor}
                strokeWidth="2"
              />
              <text
                x={xc + 9}
                y="72"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {p.topId}
              </text>

              {/* Condutor vertical superior */}
              <line
                x1={xc}
                y1="64.5"
                x2={xc}
                y2="75"
                stroke={wireColor}
                strokeWidth="2"
              />

              {/* Contato Fixo Superior (Semicírculo curvado para a esquerda) */}
              <path
                d={`M ${xc} 75 A 8 8 0 0 0 ${xc} 91`}
                fill="none"
                stroke={wireColor}
                strokeWidth="2.2"
              />

              {/* Borne Inferior (2, 4, 6) */}
              <circle
                cx={xc}
                cy="170.5"
                r="4.5"
                fill={botWireColor || 'rgba(30, 41, 59, 0.85)'}
                stroke={botWireColor || wireColor}
                strokeWidth="2"
              />
              <text
                x={xc + 9}
                y="163"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {p.botId}
              </text>

              {/* Condutor vertical inferior */}
              <line
                x1={xc}
                y1="166"
                x2={xc}
                y2="126"
                stroke={wireColor}
                strokeWidth="2"
              />

              {/* Palheta Móvel Articulada (Aberta por padrão, fecha ao energizar) */}
              <line
                x1={xc}
                y1="126"
                x2={isEnergized ? xc : xc - 16.5}
                y2={isEnergized ? 91 : 91}
                stroke={isEnergized ? '#00e676' : wireColor}
                strokeWidth={isEnergized ? '2.6' : '2.2'}
                strokeLinecap="round"
                style={{ transition: 'all 0.18s ease' }}
              />
            </g>
          );
        })}

        {/* Linha Tracejada de Acoplamento Mecânico entre os 3 polos */}
        <line
          x1="36"
          y1="112"
          x2="168"
          y2="112"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeDasharray="5 4"
        />

        {/* Identificação do Contator (ex: KM1) à direita do 3º polo */}
        <text
          x="196"
          y="116"
          fill="#ffffff"
          fontSize="15"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {displayTag}
        </text>
      </svg>

      {/* Bornes de Conexão Interativos (Apenas contatos de força 1 a 6) */}
      {terminals
        .filter((t) => ['1', '2', '3', '4', '5', '6'].includes(t.id))
        .map((t) => {
          const poleIdx = Math.floor((parseInt(t.id, 10) - 1) / 2);
          const isTop = (parseInt(t.id, 10) % 2) === 1;
          const xc = Math.round(49.5 + poleIdx * 56);
          const yc = isTop ? 60 : 170.5;
          const volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
          const poleWireColor = getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages);
          return (
            <SchematicTerminalPoint
              key={t.id}
              componentId={component.id}
              terminal={{ ...t, x: xc, y: yc, hideLabel: true }}
              voltage={volt}
              wireColor={poleWireColor}
              isSelected={
                activeTerminal?.componentId === component.id &&
                activeTerminal?.terminalId === t.id
              }
              isConnecting={Boolean(activeTerminal)}
              onTerminalClick={onTerminalClick}
              labelPosition={isTop ? 'top' : 'bottom'}
              className="schematic-contactor-power-terminal"
            />
          );
        })}
    </div>
  );
}

/**
 * 3.1 Bobina do Contator Esquemática (Coil A1-A2)
 * Representação IEC de comando para a bobina do contator (ex: KM1).
 */
function SchematicContactorCoil({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
}) {
  const isEnergized = Boolean(component.state?.energized);
  const terminals = component.terminals || [
    { id: 'A1', label: 'A1', x: 40, y: 18, type: 'coil' },
    { id: 'A2', label: 'A2', x: 40, y: 132, type: 'coil' },
  ];

  const displayTag = component.tag
    ? (component.tag.startsWith('KM') ? component.tag : component.tag.replace(/^K/, 'KM'))
    : 'KM1';

  const a1Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:A1`) : undefined;
  const a2Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:A2`) : undefined;
  const a1WireColor = getConnectedWireColor(component.id, 'A1', wires, null, a1Volt, terminalVoltages);
  const a2WireColor = getConnectedWireColor(component.id, 'A2', wires, null, a2Volt, terminalVoltages);

  return (
    <div
      className={`schematic-device-card schematic-contactor-coil ${
        isEnergized ? 'state-energized' : ''
      }`}
      style={{ width: '80px', height: '150px' }}
      title={`Bobina ${displayTag}: ${isEnergized ? '⚡ ENERGIZADA' : 'DESENERGIZADA'}`}
    >
      <svg className="schematic-svg-canvas" viewBox="0 0 80 150">
        {/* Borne Superior A1 */}
        <circle
          cx="40"
          cy="18"
          r="4.5"
          fill={a1WireColor || 'rgba(30, 41, 59, 0.85)'}
          stroke={a1WireColor || wireColor}
          strokeWidth="2"
        />
        <text x="49" y="23" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
          A1
        </text>

        {/* Linha vertical até a bobina */}
        <line x1="40" y1="22.5" x2="40" y2="45" stroke={wireColor} strokeWidth="2" />

        {/* Caixa Retangular da Bobina IEC */}
        <rect
          x="20"
          y="45"
          width="40"
          height="60"
          rx="2"
          fill={isEnergized ? 'rgba(0, 230, 118, 0.25)' : 'none'}
          stroke={isEnergized ? '#00e676' : wireColor}
          strokeWidth="2.2"
        />

        {/* Linha diagonal interna IEC */}
        <line
          x1="20"
          y1="105"
          x2="60"
          y2="45"
          stroke={isEnergized ? '#00e676' : 'rgba(255, 255, 255, 0.4)'}
          strokeWidth="1.4"
        />

        {/* Identificação da Bobina (ex: KM1) */}
        <text
          x="40"
          y="77"
          fill={isEnergized ? '#00e676' : '#ffffff'}
          fontSize="13"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {displayTag}
        </text>

        {/* Linha vertical da bobina até A2 */}
        <line x1="40" y1="105" x2="40" y2="127.5" stroke={wireColor} strokeWidth="2" />

        {/* Borne Inferior A2 */}
        <circle
          cx="40"
          cy="132"
          r="4.5"
          fill={a2WireColor || 'rgba(30, 41, 59, 0.85)'}
          stroke={a2WireColor || wireColor}
          strokeWidth="2"
        />
        <text x="49" y="137" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
          A2
        </text>
      </svg>

      {terminals.map((t) => {
        const volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={{ ...t, hideLabel: true }}
            voltage={volt}
            wireColor={getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages)}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition="right"
            className="schematic-coil-terminal"
          />
        );
      })}
    </div>
  );
}

/**
 * 4. Relé Térmico de Sobrecarga Esquemático (Thermal Relay RT1)
 */
function SchematicThermalRelay({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
}) {
  const isTripped = Boolean(component.state?.tripped);
  const currentSet = component.state?.currentSetting || 3.5;
  const terminals = component.terminals || [];

  return (
    <div
      className={`schematic-device-card schematic-thermal-relay ${
        isTripped ? 'state-tripped' : ''
      }`}
      style={{ width: '210px', height: '350px' }}
    >
      <div className="schematic-device-header">
        <span className="schematic-device-tag">{component.tag || '-RT1'}</span>
        <span className="schematic-rating-badge">{currentSet}A</span>
        {isTripped && (
          <span className="schematic-trip-badge">
            <AlertTriangle size={12} /> TRIP
          </span>
        )}
      </div>

      <svg className="schematic-svg-canvas" viewBox="0 0 210 350">
        {/* 3 Power Conductors with Thermal Bimetal Sensor Elements */}
        {[
          { inX: 34, outX: 43, inY: 20, outY: 320 },
          { inX: 105, outX: 103, inY: 20, outY: 320 },
          { inX: 176, outX: 173, inY: 20, outY: 320 },
        ].map((p, idx) => (
          <g key={`th-pwr-${idx}`}>
            <line x1={p.inX} y1={p.inY} x2={p.inX} y2="120" stroke="#38bdf8" strokeWidth="2" />
            {/* IEC Thermal Bimetal Sensor Symbol */}
            <rect
              x={p.inX - 7}
              y="120"
              width="14"
              height="20"
              rx="2"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
            />
            <path
              d={`M ${p.inX - 7} 130 L ${p.inX} 130 L ${p.inX} 140`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.4"
            />
            <line x1={p.inX} y1="140" x2={p.outX} y2={p.outY} stroke="#38bdf8" strokeWidth="2" />
          </g>
        ))}

        {/* Dashed mechanical link to auxiliary tripping contacts */}
        <line
          x1="30"
          y1="130"
          x2="180"
          y2="130"
          stroke="#f59e0b"
          strokeWidth="1.2"
          strokeDasharray="3 2"
        />

        {/* Auxiliary 95-96 (Normally Closed NF) */}
        <g className="iec-aux-95-96">
          <line x1="173" y1="249" x2="173" y2="200" stroke="#f43f5e" strokeWidth="1.8" />
          <line
            x1="173"
            y1="200"
            x2={isTripped ? 164 : 173}
            y2={isTripped ? 180 : 175}
            stroke="#f43f5e"
            strokeWidth="2"
          />
          <circle cx="173" cy="200" r="2" fill="#f43f5e" />
          <circle cx="130" cy="175" r="2" fill="#f43f5e" />
          <line x1="130" y1="175" x2="130" y2="249" stroke="#f43f5e" strokeWidth="1.8" />
        </g>

        {/* Auxiliary 97-98 (Normally Open NA) */}
        <g className="iec-aux-97-98">
          <line x1="86" y1="249" x2="86" y2="200" stroke="#10b981" strokeWidth="1.8" />
          <line
            x1="86"
            y1="200"
            x2={isTripped ? 86 : 77}
            y2={isTripped ? 175 : 185}
            stroke="#10b981"
            strokeWidth="2"
          />
          <circle cx="86" cy="200" r="2" fill="#10b981" />
          <circle cx="43" cy="175" r="2" fill="#10b981" />
          <line x1="43" y1="175" x2="43" y2="249" stroke="#10b981" strokeWidth="1.8" />
        </g>
      </svg>

      <div className={`schematic-status-pill ${isTripped ? 'danger' : ''}`}>
        {isTripped ? 'DISPARADO (TRIP)' : 'NORMAL'}
      </div>

      {terminals.map((t) => {
        const volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={t}
            voltage={volt}
            wireColor={getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages)}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition={t.y < 100 ? 'top' : 'bottom'}
          />
        );
      })}
    </div>
  );
}

/**
 * 5. Relé Temporizador Esquemático (Timer Relay KT1)
 */
function SchematicTimerRelay({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
}) {
  const isCoilEnergized = Boolean(component.state?.energized);
  const isTimedOut = Boolean(component.state?.timedOut);
  const mode = component.state?.mode || 'ON_DELAY';
  const delaySec = Number(component.state?.delay) || 5;

  const terminals = Object.values(TIMER_RELAY_TERMINALS);

  return (
    <div
      className={`schematic-device-card schematic-timer-relay ${
        isCoilEnergized ? 'coil-active' : ''
      }`}
      style={{ width: '120px', height: '350px' }}
    >
      <div className="schematic-device-header">
        <span className="schematic-device-tag">{component.tag || '-KT1'}</span>
        <span className="schematic-timer-mode-badge">
          {mode === 'ON_DELAY' ? 'RE' : 'RD'}
        </span>
      </div>

      <div className="schematic-timer-display">
        <span className="timer-sec-val">{delaySec.toFixed(1)}s</span>
      </div>

      <svg className="schematic-svg-canvas" viewBox="0 0 120 350">
        {/* Timer Coil A1-A2 with delay symbol */}
        <g className="iec-timer-coil">
          <line x1="26" y1="30" x2="26" y2="120" stroke="#a855f7" strokeWidth="1.8" />
          <line x1="94" y1="318" x2="94" y2="180" stroke="#a855f7" strokeWidth="1.8" />

          {/* Rectangular Coil */}
          <rect
            x="16"
            y="120"
            width="88"
            height="60"
            rx="3"
            fill={isCoilEnergized ? 'rgba(168, 85, 247, 0.25)' : '#0f172a'}
            stroke={isCoilEnergized ? '#c084fc' : '#a855f7'}
            strokeWidth="2"
          />

          {/* IEC On-delay hatched corner or Off-delay solid corner */}
          <rect
            x="16"
            y="120"
            width="24"
            height="60"
            fill={mode === 'ON_DELAY' ? '#38bdf8' : '#e11d48'}
            opacity="0.3"
          />
          <line x1="16" y1="120" x2="40" y2="180" stroke="#38bdf8" strokeWidth="1.5" />

          <text
            x="64"
            y="155"
            fill="#f8fafc"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {component.tag || 'KT1'}
          </text>
        </g>

        {/* Timed Contacts (Common 15, 25 with parachute umbrella arc) */}
        <path
          d="M 50 220 A 10 10 0 0 1 70 220"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.6"
        />
      </svg>

      <div className={`schematic-status-pill ${isCoilEnergized ? 'active' : ''}`}>
        {isCoilEnergized ? (isTimedOut ? 'TEMPORIZADO' : 'CONTAGEM') : 'DESLIGADO'}
      </div>

      {terminals.map((t) => {
        const volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={t}
            voltage={volt}
            wireColor={getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages)}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition={t.y < 100 ? 'top' : 'bottom'}
          />
        );
      })}
    </div>
  );
}

/**
 * 6. Botoeiras Esquemáticas (Buttons S0, S1, S00)
 */
function SchematicButton({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode,
}) {
  const isStop = component.type === 'button_stop';
  const isEmergency = component.type === 'button_emergency';
  const isStart = component.type === 'button_start';

  const isPressed = Boolean(component.state?.pressed);
  const isLocked = Boolean(component.state?.locked);

  const terminals = component.terminals || [];

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (!isSimulationMode) return;

    if (isEmergency) {
      if (isLocked) {
        // Unlock emergency button
        sounds.playButtonClick();
        onUpdateComponentState(component.id, { pressed: false, locked: false });
      } else {
        // Lock emergency button
        sounds.playEmergencyHit();
        onUpdateComponentState(component.id, { pressed: true, locked: true });
      }
      return;
    }

    sounds.playButtonDown();
    onUpdateComponentState(component.id, { pressed: true });
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (!isSimulationMode || isEmergency) return;
    sounds.playButtonUp();
    onUpdateComponentState(component.id, { pressed: false });
  };

  return (
    <div
      className={`schematic-device-card schematic-button ${
        isStop ? 'btn-type-stop' : isStart ? 'btn-type-start' : 'btn-type-emergency'
      } ${isPressed ? 'is-pressed' : ''}`}
      style={{ width: '136px', height: '170px' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      title={
        isEmergency
          ? `Botoeira de Emergência NF ${isLocked ? '(TRAVADA - Clique para destravar)' : '(Clique para travar)'}`
          : isStop
          ? 'Botoeira Desliga (NF) - Clique e segure para abrir contato'
          : 'Botoeira Liga (NA) - Clique e segure para fechar contato'
      }
    >
      <div className="schematic-device-header">
        <span className="schematic-device-tag">{component.tag || (isStop ? '-S0' : isStart ? '-S1' : '-S00')}</span>
        <span className="schematic-btn-type-badge">
          {isEmergency ? 'EMERG' : isStop ? 'NF' : 'NA'}
        </span>
      </div>

      <svg className="schematic-svg-canvas" viewBox="0 0 136 170">
        {isStart ? (
          /* IEC 60617 Pushbutton NO (NA 13-14) */
          <g className="iec-pushbutton-no">
            <line x1="46" y1="27" x2="46" y2="75" stroke="#10b981" strokeWidth="2" />
            <circle cx="46" cy="75" r="2.5" fill="#10b981" />

            <line x1="90" y1="27" x2="90" y2="75" stroke="#10b981" strokeWidth="2" />
            <circle cx="90" cy="75" r="2.5" fill="#10b981" />

            {/* Movable contact bridge */}
            <line
              x1="38"
              y1={isPressed ? 75 : 62}
              x2="98"
              y2={isPressed ? 75 : 62}
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Actuation stem & return spring */}
            <line x1="68" y1={isPressed ? 75 : 62} x2="68" y2="105" stroke="#94a3b8" strokeWidth="1.6" />
            <rect x="58" y="105" width="20" height="4" rx="1" fill="#10b981" />

            {/* Bottom terminals link */}
            <line x1="46" y1="75" x2="46" y2="143" stroke="#10b981" strokeWidth="2" />
            <line x1="90" y1="75" x2="90" y2="143" stroke="#10b981" strokeWidth="2" />
          </g>
        ) : isStop ? (
          /* IEC 60617 Pushbutton NC (NF 11-12) */
          <g className="iec-pushbutton-nc">
            <line x1="46" y1="27" x2="46" y2="75" stroke="#ef4444" strokeWidth="2" />
            <circle cx="46" cy="75" r="2.5" fill="#ef4444" />

            <line x1="90" y1="27" x2="90" y2="75" stroke="#ef4444" strokeWidth="2" />
            <circle cx="90" cy="75" r="2.5" fill="#ef4444" />

            {/* Movable contact bridge resting ON terminals when not pressed */}
            <line
              x1="38"
              y1={isPressed ? 88 : 75}
              x2="98"
              y2={isPressed ? 88 : 75}
              stroke="#ef4444"
              strokeWidth="2.5"
            />

            {/* Actuation stem */}
            <line x1="68" y1={isPressed ? 88 : 75} x2="68" y2="105" stroke="#94a3b8" strokeWidth="1.6" />
            <rect x="58" y="105" width="20" height="4" rx="1" fill="#ef4444" />

            {/* Bottom terminals link */}
            <line x1="46" y1="75" x2="46" y2="143" stroke="#ef4444" strokeWidth="2" />
            <line x1="90" y1="75" x2="90" y2="143" stroke="#ef4444" strokeWidth="2" />
          </g>
        ) : (
          /* IEC 60617 Emergency Stop Pushbutton (Cogumelo NF 11-12) */
          <g className="iec-emergency-nc">
            <line x1="68" y1="18" x2="68" y2="65" stroke="#ef4444" strokeWidth="2" />
            <circle cx="68" cy="65" r="2.5" fill="#ef4444" />

            {/* Emergency mushroom head & latching detent symbol */}
            <path
              d="M 52 50 C 52 40 84 40 84 50 Z"
              fill={isLocked ? '#dc2626' : '#991b1b'}
              stroke="#f87171"
              strokeWidth="1.5"
            />
            {/* Latch turn-to-reset arrow */}
            <path
              d="M 60 52 L 76 52 M 72 49 L 76 52 L 72 55"
              fill="none"
              stroke="#fff"
              strokeWidth="1.2"
            />

            {/* Contact blade: connects 18 to 150 when closed, tilts open when locked */}
            <line
              x1="68"
              y1="65"
              x2={isLocked ? 82 : 68}
              y2={isLocked ? 100 : 110}
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            <circle cx="68" cy="110" r="2.5" fill="#ef4444" />
            <line x1="68" y1="110" x2="68" y2="150" stroke="#ef4444" strokeWidth="2" />
          </g>
        )}
      </svg>

      <div className={`schematic-status-pill ${isPressed || isLocked ? 'danger' : ''}`}>
        {isEmergency ? (isLocked ? 'TRAVADA' : 'PRONTA') : isPressed ? 'ACIONADO' : 'EM REPOUSO'}
      </div>

      {terminals.map((t) => {
        const volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={t}
            voltage={volt}
            wireColor={getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages)}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition={t.y < 85 ? 'top' : 'bottom'}
          />
        );
      })}
    </div>
  );
}

/**
 * 7. Motor Trifásico 6 Pontas Esquemático (Motor M1)
 * Representação técnica fiel ao padrão industrial IEC / CAD:
 * - Círculo central com "M" e subtítulo "3~ Y/Δ"
 * - Tag "M1" posicionada à esquerda do círculo
 * - Bornes superiores: U1, V1, W1 (com linhas anguladas nos extremos)
 * - Bornes inferiores: W2, U2, V2 (com linhas anguladas nos extremos)
 * - Linha pontilhada verde do terra (PE) com símbolo de aterramento no canto inferior esquerdo
 * - Ponto de aterramento lateral direito da carcaça com símbolo de terra
 */
function SchematicMotor({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
}) {
  const isRunning = Boolean(component.state?.running);
  const direction = component.state?.direction || 'CW';
  const displayTag = component.tag || 'M1';

  // Coordenadas dos bornes esquemáticos de potência (U1, V1, W1 no topo; W2, U2, V2 na base)
  const schematicTerminals = [
    { id: 'U1', label: 'U1', x: 80, y: 35 },
    { id: 'V1', label: 'V1', x: 140, y: 35 },
    { id: 'W1', label: 'W1', x: 200, y: 35 },
    { id: 'W2', label: 'W2', x: 80, y: 245 },
    { id: 'U2', label: 'U2', x: 140, y: 245 },
    { id: 'V2', label: 'V2', x: 200, y: 245 },
  ];

  const u1Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:U1`) : undefined;
  const v1Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:V1`) : undefined;
  const w1Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:W1`) : undefined;
  const w2Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:W2`) : undefined;
  const u2Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:U2`) : undefined;
  const v2Volt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:V2`) : undefined;
  const peVolt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:PE`) : undefined;

  const u1Color = getConnectedWireColor(component.id, 'U1', wires, null, u1Volt, terminalVoltages);
  const v1Color = getConnectedWireColor(component.id, 'V1', wires, null, v1Volt, terminalVoltages);
  const w1Color = getConnectedWireColor(component.id, 'W1', wires, null, w1Volt, terminalVoltages);
  const w2Color = getConnectedWireColor(component.id, 'W2', wires, null, w2Volt, terminalVoltages);
  const u2Color = getConnectedWireColor(component.id, 'U2', wires, null, u2Volt, terminalVoltages);
  const v2Color = getConnectedWireColor(component.id, 'V2', wires, null, v2Volt, terminalVoltages);
  const peColor = getConnectedWireColor(component.id, 'PE', wires, '#16a34a', peVolt, terminalVoltages);

  // Projeção do clique em qualquer parte da linha pontilhada de aterramento (M 99 155 L 36 155 L 36 230)
  const handleGroundLineClick = (e) => {
    e.stopPropagation();
    const svg = e.currentTarget.closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 280;
    const clickY = ((e.clientY - rect.top) / rect.height) * 280;

    const clampedX = Math.max(36, Math.min(99, clickX));
    const distHoriz = Math.hypot(clampedX - clickX, 155 - clickY);

    const clampedY = Math.max(155, Math.min(230, clickY));
    const distVert = Math.hypot(36 - clickX, clampedY - clickY);

    let tapX, tapY;
    if (distHoriz < distVert) {
      tapX = Math.round(clampedX);
      tapY = 155;
    } else {
      tapX = 36;
      tapY = Math.round(clampedY);
    }

    onTerminalClick(component.id, 'PE', { x: tapX, y: tapY });
  };

  return (
    <div
      className={`schematic-device-card schematic-motor ${isRunning ? 'motor-spinning' : ''}`}
      style={{
        width: '280px',
        height: '280px',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        position: 'relative',
      }}
      title={`Motor Trifásico ${displayTag} (3~ Y/Δ): ${isRunning ? `EM OPERAÇÃO (${direction === 'CW' ? '↻ Horário' : '↺ Anti-horário'})` : 'PARADO'}`}
    >
      <svg
        className="schematic-svg-canvas"
        viewBox="0 0 280 280"
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      >
        {/* --- Círculo Central do Motor (IEC 60617) --- */}
        <circle
          cx="140"
          cy="140"
          r="46"
          fill="rgba(15, 23, 42, 0.4)"
          stroke={isRunning ? '#00e676' : '#ffffff'}
          strokeWidth="2.5"
          filter={isRunning ? 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.5))' : 'none'}
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Textos dentro do círculo do motor */}
        <text
          x="140"
          y="132"
          fill="#ffffff"
          fontSize="30"
          fontWeight="bold"
          fontFamily="Arial, system-ui, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          M
        </text>
        <text
          x="140"
          y="158"
          fill="#ffffff"
          fontSize="13"
          fontWeight="bold"
          fontFamily="Arial, system-ui, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          3~ Y/Δ
        </text>

        {/* Tag M1 à esquerda do círculo */}
        <text
          x="84"
          y="140"
          fill="#ffffff"
          fontSize="18"
          fontWeight="bold"
          fontFamily="Arial, system-ui, sans-serif"
          textAnchor="end"
          dominantBaseline="middle"
        >
          {displayTag}
        </text>

        {/* --- Condutores Superiores: U1, V1, W1 --- */}
        {/* V1 (linha vertical central) */}
        <path d="M 140 35 L 140 94" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        {/* U1 (linha vertical depois inclinada a 45° descendo para a direita) */}
        <path d="M 80 35 L 80 68 L 107.5 107.5" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* W1 (linha vertical depois inclinada a 45° descendo para a esquerda) */}
        <path d="M 200 35 L 200 68 L 172.5 107.5" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Identificadores textuais U1, V1, W1 */}
        <text x="89" y="52" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          U1
        </text>
        <text x="149" y="52" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          V1
        </text>
        <text x="209" y="52" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          W1
        </text>

        {/* --- Bornes Superiores (Círculos vazados padrão CAD) --- */}
        <circle cx="80" cy="35" r="4.5" fill={u1Color || 'rgba(15, 23, 42, 0.85)'} stroke={u1Color || '#ffffff'} strokeWidth="2" />
        <circle cx="140" cy="35" r="4.5" fill={v1Color || 'rgba(15, 23, 42, 0.85)'} stroke={v1Color || '#ffffff'} strokeWidth="2" />
        <circle cx="200" cy="35" r="4.5" fill={w1Color || 'rgba(15, 23, 42, 0.85)'} stroke={w1Color || '#ffffff'} strokeWidth="2" />

        {/* --- Condutores Inferiores: W2, U2, V2 --- */}
        {/* U2 (linha vertical central) */}
        <path d="M 140 186 L 140 245" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        {/* W2 (linha inclinada a 45° depois vertical descendo) */}
        <path d="M 107.5 172.5 L 80 212 L 80 245" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* V2 (linha inclinada a 45° depois vertical descendo) */}
        <path d="M 172.5 172.5 L 200 212 L 200 245" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Identificadores textuais W2, U2, V2 */}
        <text x="89" y="230" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          W2
        </text>
        <text x="149" y="230" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          U2
        </text>
        <text x="209" y="230" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="monospace">
          V2
        </text>

        {/* --- Bornes Inferiores (Círculos vazados padrão CAD) --- */}
        <circle cx="80" cy="245" r="4.5" fill={w2Color || 'rgba(15, 23, 42, 0.85)'} stroke={w2Color || '#ffffff'} strokeWidth="2" />
        <circle cx="140" cy="245" r="4.5" fill={u2Color || 'rgba(15, 23, 42, 0.85)'} stroke={u2Color || '#ffffff'} strokeWidth="2" />
        <circle cx="200" cy="245" r="4.5" fill={v2Color || 'rgba(15, 23, 42, 0.85)'} stroke={v2Color || '#ffffff'} strokeWidth="2" />

        {/* --- Linha Pontilhada do Terra (PE) com Símbolo de Terra (conforme rascunho em verde do usuário) --- */}
        <path
          className="motor-pe-ground-path"
          d="M 99 155 L 36 155 L 36 230"
          fill="none"
          stroke="#00e676"
          strokeWidth="2.5"
          strokeDasharray="3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'none' }}
        />
        {/* Símbolo de Terra em verde */}
        <line x1="22" y1="230" x2="50" y2="230" stroke="#00e676" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="27" y1="236" x2="45" y2="236" stroke="#00e676" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="32" y1="242" x2="40" y2="242" stroke="#00e676" strokeWidth="1.8" strokeLinecap="round" />

        {/* Linha interativa clicável para conectar aterramento PE em qualquer ponto da linha tracejada */}
        <path
          className="motor-pe-interactive-line"
          d="M 99 155 L 36 155 L 36 230"
          fill="none"
          stroke="transparent"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleGroundLineClick}
          style={{ cursor: 'crosshair' }}
        >
          <title>Aterramento da carcaça do motor (PE): Clique em qualquer parte da linha pontilhada para conectar o fio de aterramento</title>
        </path>

        {/* Pontos de conexão para os fios conectados ao PE ao longo da linha pontilhada */}
        {wires
          ?.filter(
            (w) =>
              (w.fromComponent === component.id && String(w.fromTerminal).toUpperCase() === 'PE') ||
              (w.toComponent === component.id && String(w.toTerminal).toUpperCase() === 'PE')
          )
          .map((w) => {
            const isFrom = w.fromComponent === component.id;
            const px = isFrom ? (w.fromTerminalX ?? 36) : (w.toTerminalX ?? 36);
            const py = isFrom ? (w.fromTerminalY ?? 180) : (w.toTerminalY ?? 180);
            const dotColor = getConnectedWireColor(
              component.id,
              'PE',
              [w],
              '#16a34a',
              peVolt,
              terminalVoltages
            );
            return (
              <circle
                key={`pe-conn-dot-${w.id}`}
                cx={px}
                cy={py}
                r="4.5"
                fill={dotColor}
                stroke={dotColor}
                strokeWidth="1.5"
                pointerEvents="none"
              />
            );
          })}

        {/* --- Indicador de Rotação quando em Operação --- */}
        {isRunning && (
          <g transform="translate(242, 32)">
            <circle cx="0" cy="0" r="14" fill="rgba(0, 230, 118, 0.15)" stroke="#00e676" strokeWidth="1.5" />
            <text
              x="0"
              y="4"
              fill="#00e676"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {direction === 'CW' ? '↻' : '↺'}
            </text>
            <text
              x="0"
              y="22"
              fill="#00e676"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              1750 RPM
            </text>
          </g>
        )}
      </svg>

      {/* Pontos de Conexão Clicáveis para Fios (SchematicTerminalPoint) */}
      {schematicTerminals.map((t) => {
        const tVolt = terminalVoltages?.get ? terminalVoltages.get(`${component.id}:${t.id}`) : undefined;
        const tColor = getConnectedWireColor(component.id, String(t.id), wires, null, tVolt, terminalVoltages);
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={{ ...t, hideLabel: true }}
            voltage={tVolt}
            wireColor={tColor}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition={t.y < 50 ? 'top' : 'bottom'}
            className="schematic-motor-terminal"
          />
        );
      })}
    </div>
  );
}

/**
 * 8. Trilho DIN Esquemático (Din Rail)
 */
function SchematicDinRail({
  component,
  onAlignComponents,
  onStartResize,
  isSimulationMode,
}) {
  const length = Math.max(300, Number(component.state?.length) || 800);

  return (
    <div
      className="schematic-din-rail"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${length}px`,
        height: '50px',
        pointerEvents: isSimulationMode ? 'none' : 'auto',
      }}
    >
      <div className="schematic-rail-axis-line">
        <span className="schematic-rail-label">─ ─ ─ EIXO DE MONTAGEM DIN EN 50022 ─ ─ ─</span>
      </div>

      {!isSimulationMode && (
        <div className="schematic-rail-actions">
          {onAlignComponents && (
            <button
              type="button"
              className="schematic-rail-btn-align"
              onClick={(e) => {
                e.stopPropagation();
                onAlignComponents(component.id);
              }}
              title="Alinhar e organizar componentes no trilho"
            >
              <Sliders size={12} />
              <span>Alinhar</span>
            </button>
          )}

          {onStartResize && (
            <div
              className="schematic-rail-resize-grip"
              onPointerDown={(e) => {
                e.stopPropagation();
                onStartResize(e, component.id);
              }}
              title="Arrastar para redimensionar trilho"
            >
              <Maximize2 size={12} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 8. Boia de Nível Esquemática (IEC 60617)
 * Símbolo técnico de comutador acionado por nível de líquido:
 * - Contato reversor 11 (comum), 12 (NF), 14 (NA)
 * - Símbolo de boia retangular flutuando sobre ondas acoplada mecanicamente
 */
function SchematicFloatSwitch({
  component,
  terminalVoltages,
  activeTerminal,
  wires = [],
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode,
}) {
  const level = Number(component.state?.level ?? 22);
  const isHigh = level >= Number(component.state?.threshold ?? 50);
  const displayTag = component.tag || '-B1';

  const comVolt = terminalVoltages?.get ? (terminalVoltages.get(`${component.id}:COM`) || terminalVoltages.get(`${component.id}:11`)) : undefined;
  const naVolt = terminalVoltages?.get ? (terminalVoltages.get(`${component.id}:NA`) || terminalVoltages.get(`${component.id}:14`)) : undefined;
  const nfVolt = terminalVoltages?.get ? (terminalVoltages.get(`${component.id}:NF`) || terminalVoltages.get(`${component.id}:12`)) : undefined;

  const comColor = getConnectedWireColor(component.id, 'COM', wires, '#38bdf8', comVolt, terminalVoltages);
  const naColor = getConnectedWireColor(component.id, 'NA', wires, '#38bdf8', naVolt, terminalVoltages);
  const nfColor = getConnectedWireColor(component.id, 'NF', wires, '#38bdf8', nfVolt, terminalVoltages);

  const terminals = [
    { id: 'COM', label: '11', x: 44, y: 25 },
    { id: 'NF', label: '12', x: 44, y: 155 },
    { id: 'NA', label: '14', x: 104, y: 155 },
  ];

  return (
    <div
      className="schematic-device-card"
      style={{ width: '150px', height: '185px', position: 'relative' }}
      title={`Boia de Nível Esquemática ${displayTag} (Nível: ${Math.round(level)}%)`}
    >
      <div className="schematic-device-header">
        <span className="schematic-device-tag">{displayTag}</span>
        <span className="schematic-device-type" style={{ fontSize: '9px', color: isHigh ? '#4ade80' : '#38bdf8' }}>
          {isHigh ? 'ALTO (NA)' : 'BAIXO (NF)'}
        </span>
      </div>

      <svg viewBox="0 0 150 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Linha do terminal comum (11) descendo até o ponto de rotação da palheta */}
        <line x1="44" y1="25" x2="44" y2="70" stroke={comColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="70" r="3" fill="#090d16" stroke={comColor} strokeWidth="1.8" />

        {/* Linha do terminal 12 (NF) */}
        <line x1="44" y1="110" x2="44" y2="155" stroke={nfColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="110" r="3" fill="#090d16" stroke={nfColor} strokeWidth="1.8" />

        {/* Linha do terminal 14 (NA) */}
        <line x1="104" y1="110" x2="104" y2="155" stroke={naColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="104" cy="110" r="3" fill="#090d16" stroke={naColor} strokeWidth="1.8" />

        {/* Palheta de comutação móvel */}
        {isHigh ? (
          <line x1="44" y1="70" x2="104" y2="110" stroke={comColor} strokeWidth="2.4" strokeLinecap="round" />
        ) : (
          <line x1="44" y1="70" x2="44" y2="110" stroke={comColor} strokeWidth="2.4" strokeLinecap="round" />
        )}

        {/* Haste mecânica tracejada e símbolo IEC da Boia de Nível */}
        <line x1={isHigh ? 74 : 44} y1="90" x2="116" y2="90" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Boia IEC (retângulo flutuante sobre duas ondas) */}
        <rect x="112" y="82" width="16" height="16" rx="2" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
        <path d="M 110 102 Q 114 99 118 102 T 126 102" fill="none" stroke="#38bdf8" strokeWidth="1.4" />
        <path d="M 110 106 Q 114 103 118 106 T 126 106" fill="none" stroke="#38bdf8" strokeWidth="1.4" />
      </svg>

      {/* Pontos de conexão dos bornes */}
      {terminals.map((t) => {
        const volt = terminalVoltages?.get ? (terminalVoltages.get(`${component.id}:${t.id}`) || terminalVoltages.get(`${component.id}:${t.label}`)) : undefined;
        return (
          <SchematicTerminalPoint
            key={t.id}
            componentId={component.id}
            terminal={t}
            voltage={volt}
            wireColor={getConnectedWireColor(component.id, String(t.id), wires, null, volt, terminalVoltages)}
            isSelected={activeTerminal?.componentId === component.id && activeTerminal?.terminalId === t.id}
            isConnecting={Boolean(activeTerminal)}
            onTerminalClick={onTerminalClick}
            labelPosition={t.y < 90 ? 'top' : 'bottom'}
          />
        );
      })}
    </div>
  );
}

/**
 * Unified Component Router for Schematic View
 */
export default function SchematicElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  onOpenBreakerSettings,
  onOpenPowerSettings,
  onAlignDinRail,
  onStartResizeDinRail,
  isSimulationMode,
  isSelected = false,
  wires = [],
}) {
  switch (component.type) {
    case 'power_source':
      return (
        <SchematicPowerSource
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
          onOpenSettings={isSelected ? onOpenPowerSettings : undefined}
        />
      );

    case 'circuit_breaker':
      return (
        <SchematicBreaker
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
          onUpdateComponentState={onUpdateComponentState}
          onOpenSettings={isSelected ? onOpenBreakerSettings : undefined}
          isSimulationMode={isSimulationMode}
        />
      );

    case 'fuse_holder':
      return (
        <SchematicFuseHolder
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
          onUpdateComponentState={onUpdateComponentState}
          isSimulationMode={isSimulationMode}
        />
      );

    case 'contactor':
      return (
        <SchematicContactor
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
        />
      );

    case 'contactor_coil':
      return (
        <SchematicContactorCoil
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
        />
      );

    case 'thermal_relay':
      return (
        <SchematicThermalRelay
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
        />
      );

    case 'timer_relay':
      return (
        <SchematicTimerRelay
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
        />
      );

    case 'button_stop':
    case 'button_start':
    case 'button_emergency':
      return (
        <SchematicButton
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
          onUpdateComponentState={onUpdateComponentState}
          isSimulationMode={isSimulationMode}
        />
      );

    case 'motor_6p':
      return (
        <SchematicMotor
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
        />
      );

    case 'din_rail':
      return (
        <SchematicDinRail
          component={component}
          onAlignComponents={onAlignDinRail}
          onStartResize={onStartResizeDinRail}
          isSimulationMode={isSimulationMode}
        />
      );

    case 'text_note':
      return (
        <TextNoteElement
          component={component}
          isSelected={isSelected}
          onUpdateComponentState={onUpdateComponentState}
          isSimulationMode={isSimulationMode}
        />
      );

    case 'float_switch':
      return (
        <SchematicFloatSwitch
          component={component}
          terminalVoltages={terminalVoltages}
          activeTerminal={activeTerminal}
          wires={wires}
          onTerminalClick={onTerminalClick}
          onUpdateComponentState={onUpdateComponentState}
          isSimulationMode={isSimulationMode}
        />
      );

    default:
      return null;
  }
}
