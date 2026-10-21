import React from 'react';
import { Settings } from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { getBreakerTerminals } from '../../types/components';

export default function BreakerElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  onOpenSettings,
  onRemoveComponent,
  isSimulationMode = false,
  isSelected = false,
}) {
  const isClosed = Boolean(component.state?.closed);
  const poles = Math.max(1, Math.min(3, Number(component.state?.poles) || 3));
  const current = component.state?.current || 25;
  const curve = component.state?.curve || 'C';
  const tag = component.tag || 'Q1';

  const scale = 52 / 94; // Proportional DIN scale factor
  const wPole = 52;
  const width = poles * wPole;
  const height = 218;

  const origWPole = 94;
  const origWidth = poles * origWPole;
  const origHeight = 395;

  const tierTopH = 75;
  const tierMidH = 245;
  const tierBotH = 75;

  const yTopScrews = 38;
  const yBotScrews = 357;

  // Cavity & Switch geometry (SVG native coordinate space)
  const yCavity = 205;
  const hCavity = 78;
  const cavW = 64;

  // Toggle positions
  // OFF: bar at bottom (y = 250), toggles show ○ OFF
  // ON:  bar at top (y = 184), toggles show | ON
  const barY = isClosed ? 184 : 250;
  const toggleY = isClosed ? 206 : 202;
  const toggleH = 56;
  const barX = 2;
  const barW = origWidth - 4;

  const indColor = isClosed ? '#c92a2a' : '#2b8a3e';
  const indStroke = isClosed ? '#a61e1e' : '#237032';

  // Toggle breaker handle
  const toggleBreaker = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    sounds.playSwitch();
    if (onUpdateComponentState) {
      onUpdateComponentState(component.id, { closed: !isClosed });
    }
  };

  const getVoltageBadgeColor = (v) => {
    switch (v) {
      case 'L1':
        return '#a855f7'; // Roxo
      case 'L2':
        return '#ffffff'; // Branco
      case 'L3':
        return '#ef4444'; // Vermelho
      case 'N':
        return '#2563eb'; // Azul
      case 'PE':
        return '#16a34a'; // Verde
      default:
        return '#64748b';
    }
  };

  const origPoleCenters = [];
  for (let i = 0; i < poles; i++) {
    origPoleCenters.push(i * origWPole + origWPole / 2);
  }

  const lastOrigPoleCenter = origPoleCenters[origPoleCenters.length - 1];

  return (
    <div
      className={`breaker-din-device breaker-${poles}p ${
        isClosed ? 'breaker-on' : 'breaker-off'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        userSelect: 'none',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
    >


      {/* SVG Realistic Circuit Breaker Body (Vector scaled to DIN proportion) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${origWidth} ${origHeight}`}
        width={width}
        height={height}
        style={{ display: 'block', pointerEvents: 'none' }}
      >
        <defs>
          {/* Background Gradients */}
          <linearGradient id={`tierGrad-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c8ccd1" />
            <stop offset="100%" stopColor="#d7dbdf" />
          </linearGradient>

          <linearGradient id={`frontPlateGrad-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8f9fa" />
            <stop offset="3%" stopColor="#eceff1" />
            <stop offset="97%" stopColor="#e4e7ea" />
            <stop offset="100%" stopColor="#d8dcde" />
          </linearGradient>

          {/* Brass Screw Gradients */}
          <linearGradient id={`brassGrad-${component.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e2aa" />
            <stop offset="35%" stopColor="#cbc07b" />
            <stop offset="70%" stopColor="#9e9450" />
            <stop offset="100%" stopColor="#6e6631" />
          </linearGradient>

          <linearGradient id={`screwWellGrad-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ea4aa" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Blue Levers and Crossbar */}
          <linearGradient id={`blueToggleGrad-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d6efd" />
            <stop offset="25%" stopColor="#0a58ca" />
            <stop offset="80%" stopColor="#084298" />
            <stop offset="100%" stopColor="#052c65" />
          </linearGradient>

          <linearGradient id={`blueBarGrad-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b5ed7" />
            <stop offset="15%" stopColor="#084fad" />
            <stop offset="85%" stopColor="#05367a" />
            <stop offset="100%" stopColor="#021b40" />
          </linearGradient>

          {/* Screw Definition */}
          <g id={`screw-${component.id}`}>
            <circle cx="0" cy="0" r="24" fill={`url(#screwWellGrad-${component.id})`} />
            <circle cx="0" cy="0" r="22" fill="#e4e7ea" />
            <circle cx="0" cy="0" r="19.5" fill="#b4bac0" />
            <circle cx="0" cy="0" r="17.5" fill={`url(#brassGrad-${component.id})`} stroke="#615a2b" strokeWidth="0.8" />
            <path d="M -9.5 0 L 9.5 0 M 0 -9.5 L 0 9.5" stroke="#453f1c" strokeWidth="5" strokeLinecap="square" />
            <path d="M -9.5 0 L 9.5 0 M 0 -9.5 L 0 9.5" stroke="#24200c" strokeWidth="3" strokeLinecap="square" />
          </g>
        </defs>

        {/* Top Recessed Tier */}
        <rect x="0" y="0" width={origWidth} height={tierTopH} fill={`url(#tierGrad-${component.id})`} />
        <line x1="0" y1={tierTopH} x2={origWidth} y2={tierTopH} stroke="#8a9097" strokeWidth="1.5" />

        {/* Bottom Recessed Tier */}
        <rect x="0" y={tierTopH + tierMidH} width={origWidth} height={tierBotH} fill={`url(#tierGrad-${component.id})`} />
        <line x1="0" y1={tierTopH + tierMidH} x2={origWidth} y2={tierTopH + tierMidH} stroke="#ffffff" strokeWidth="1" />
        <line x1="0" y1={tierTopH + tierMidH - 1} x2={origWidth} y2={tierTopH + tierMidH - 1} stroke="#8a9097" strokeWidth="1.5" />

        {/* Middle Raised Front Panel */}
        <rect x="0" y={tierTopH} width={origWidth} height={tierMidH} fill={`url(#frontPlateGrad-${component.id})`} />
        <line x1="0" y1={tierTopH + 1} x2={origWidth} y2={tierTopH + 1} stroke="#ffffff" strokeWidth="2" />
        <line x1="0" y1={tierTopH + tierMidH - 1} x2={origWidth} y2={tierTopH + tierMidH - 1} stroke="#a0a6ac" strokeWidth="2" />

        {/* Module Dividing Seam Lines */}
        {origPoleCenters.slice(1).map((xc, idx) => (
          <line
            key={`seam-${idx}`}
            x1={(idx + 1) * origWPole}
            y1="0"
            x2={(idx + 1) * origWPole}
            y2={origHeight}
            stroke="#c5c9ce"
            strokeWidth="1.2"
          />
        ))}

        {/* Status Pill Indicator (Green for OFF / Red for ON) */}
        <rect
          x="14"
          y={poles === 1 ? 116 : 122}
          width={poles === 1 ? 28 : 32}
          height={poles === 1 ? 9 : 11}
          rx={poles === 1 ? 4.5 : 5.5}
          fill={indColor}
          stroke={indStroke}
          strokeWidth="1"
        />

        {/* Technical Text: Tag and Rating */}
        <text
          x="14"
          y={poles === 1 ? 100 : 106}
          fontFamily="Arial, sans-serif"
          fontSize={poles === 1 ? '12' : '14'}
          fontWeight="bold"
          fill="#1e293b"
        >
          {tag}
        </text>

        <text
          x={lastOrigPoleCenter}
          y={poles === 1 ? 152 : 132}
          fontFamily="Arial, sans-serif"
          fontSize={poles === 1 ? '19' : '20'}
          fontWeight="bold"
          fill="#00478f"
          textAnchor="middle"
        >
          {curve}{current}A
        </text>

        <text
          x={lastOrigPoleCenter}
          y={poles === 1 ? 172 : 148}
          fontFamily="Arial, sans-serif"
          fontSize={poles === 1 ? '9.5' : '10'}
          fontWeight="bold"
          fill="#64748b"
          textAnchor="middle"
        >
          {poles === 1 ? '230V~' : '400V~'} 4.5kA
        </text>

        {/* Screws Top & Bottom */}
        {origPoleCenters.map((xc, idx) => (
          <React.Fragment key={`screws-pole-${idx}`}>
            <use href={`#screw-${component.id}`} x={xc} y={yTopScrews} />
            <use href={`#screw-${component.id}`} x={xc} y={yBotScrews} />
          </React.Fragment>
        ))}

        {/* Switch Cavities & Levers */}
        {origPoleCenters.map((xc, idx) => {
          const cavX = xc - cavW / 2;
          return (
            <React.Fragment key={`switch-${idx}`}>
              {/* Cavity Frame */}
              <rect x={cavX - 3} y={yCavity - 3} width={cavW + 6} height={hCavity + 6} rx="4" fill="#d0d5d9" />
              <rect x={cavX - 2} y={yCavity - 2} width={cavW + 4} height={hCavity + 4} rx="3" fill="#ffffff" />
              <rect x={cavX} y={yCavity} width={cavW} height={hCavity} rx="2" fill="#e9ecef" />

              {/* Blue Toggle */}
              <rect
                x={cavX + 2}
                y={toggleY}
                width={cavW - 4}
                height={toggleH}
                rx="3"
                fill={`url(#blueToggleGrad-${component.id})`}
              />
              <path
                d={`M ${cavX + 3} ${toggleY} L ${cavX + cavW - 5} ${toggleY} L ${cavX + cavW - 5} ${toggleY + 4} L ${cavX + 3} ${toggleY + 4} Z`}
                fill="#4dabf7"
                opacity="0.6"
              />

              {/* Text & Symbol on Toggle */}
              {!isClosed ? (
                <>
                  <circle cx={xc - 14} cy={toggleY + 24} r="6" stroke="#ffffff" strokeWidth="2.2" fill="none" />
                  <text x={xc + 11} y={toggleY + 28} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                    OFF
                  </text>
                </>
              ) : (
                <>
                  <line x1={xc - 14} y1={toggleY + 17} x2={xc - 14} y2={toggleY + 31} stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
                  <text x={xc + 11} y={toggleY + 28} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                    ON
                  </text>
                </>
              )}
            </React.Fragment>
          );
        })}

        {/* Gang Connector Bar */}
        <rect
          x={barX}
          y={barY}
          width={barW}
          height="26"
          rx="3"
          fill={`url(#blueBarGrad-${component.id})`}
          stroke="#021b40"
          strokeWidth="1"
        />
        <line
          x1={barX + 2}
          y1={barY + 2}
          x2={barX + barW - 2}
          y2={barY + 2}
          stroke="#4dabf7"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>

      {/* Interactive Toggle Switch Click Area */}
      <div
        className="breaker-interactive-handle"
        onClick={toggleBreaker}
        style={{
          position: 'absolute',
          left: '0px',
          top: `${Math.round((yCavity - 24) * scale)}px`,
          width: `${width}px`,
          height: `${Math.round((hCavity + 48) * scale)}px`,
          cursor: isSimulationMode ? 'pointer' : 'grab',
          pointerEvents: isSimulationMode ? 'auto' : 'none',
          zIndex: 15,
        }}
        title={isSimulationMode ? `Clique para alternar o disjuntor (${isClosed ? 'LIGADO / ON' : 'DESLIGADO / OFF'})` : undefined}
      />

      {/* Interactive Terminal Screws (Wire Connection Targets) */}
      {(component.terminals || getBreakerTerminals(poles)).map((t) => {
        const vKey = `${component.id}:${t.id}`;
        const volt = terminalVoltages?.get ? terminalVoltages.get(vKey) : undefined;
        const isSelected =
          activeTerminal?.componentId === component.id &&
          activeTerminal?.terminalId === t.id;
        const isPowered = Boolean(volt);

        return (
          <div
            key={t.id}
            className={`breaker-terminal-socket ${isSelected ? 'selected' : ''} ${
              activeTerminal ? 'wire-target-ready' : ''
            }`}
            style={{
              position: 'absolute',
              left: `${t.x - 14}px`,
              top: `${t.y - 14}px`,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'crosshair',
              zIndex: 20,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onTerminalClick?.(component.id, t.id);
            }}
            data-terminal-target={`${component.id}:${t.id}`}
            title={`${t.label}: ${volt ? `Energizado (${volt})` : 'Sem tensão'}`}
          >
            {/* Terminal number identification label */}
            <span
              className={`breaker-terminal-label ${t.y < 100 ? 'label-top' : 'label-bottom'}`}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: t.y < 100 ? '-16px' : '28px',
                fontSize: '9.5px',
                fontWeight: 'bold',
                color: '#334155',
                background: 'rgba(255,255,255,0.92)',
                padding: '1px 4px',
                borderRadius: '3px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </span>

            {/* Glowing Power Dot when Energized */}
            {isPowered && (
              <span
                className="breaker-power-dot"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: getVoltageBadgeColor(volt),
                  boxShadow: `0 0 5px ${getVoltageBadgeColor(volt)}`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Backward compatibility exports
export function Breaker3PElement(props) {
  return <BreakerElement {...props} />;
}

export function Breaker1PElement(props) {
  return <BreakerElement {...props} />;
}
