import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/soundEffects';

export const MOTOR_TERMINAL_POS = {
  PE: { x: 38, y: 36 },
  U1: { x: 99, y: 36 },
  V1: { x: 156, y: 36 },
  W1: { x: 213, y: 36 },
  W2: { x: 99, y: 86 },
  U2: { x: 156, y: 86 },
  V2: { x: 213, y: 86 },
};

function MotorBrassTerminal({
  componentId,
  terminal,
  voltage,
  isSelected,
  isConnecting,
  onTerminalClick,
  isPE = false,
}) {
  const isPowered = Boolean(voltage);
  const voltColor =
    voltage === 'L1' ? '#a855f7' :
    voltage === 'L2' ? '#ffffff' :
    voltage === 'L3' ? '#ef4444' :
    voltage === 'N'  ? '#06b6d4' :
    voltage === 'PE' ? '#10b981' : '#38bdf8';

  return (
    <div
      className={`motor-brass-terminal-container ${isPE ? 'terminal-pe' : ''} ${
        isSelected ? 'selected' : ''
      } ${isConnecting ? 'wire-target-ready' : ''} ${isPowered ? 'is-powered' : ''}`}
      style={{
        left: `${terminal.x}px`,
        top: `${terminal.y}px`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onTerminalClick(componentId, terminal.id);
      }}
      title={`${terminal.label || terminal.id}: ${voltage ? `Energizado (${voltage})` : 'Sem tensão'}`}
    >
      <div
        className="motor-brass-stud"
        data-terminal-target={`${componentId}:${terminal.id}`}
      >
        <div
          className="motor-stud-glow"
          style={{
            borderColor: isPowered ? voltColor : isSelected ? '#00e676' : 'transparent',
            boxShadow: isPowered
              ? `0 0 10px ${voltColor}`
              : isSelected
              ? '0 0 12px #00e676'
              : 'none',
          }}
        />
        <div className="motor-brass-washer" />
        <div className="motor-brass-hex-nut">
          <div className="motor-brass-center-pin">
            <div className="motor-brass-drill-point" />
          </div>
        </div>
        {isPowered && (
          <span
            className="motor-power-indicator"
            style={{ backgroundColor: voltColor }}
          />
        )}
      </div>
    </div>
  );
}

export default function Motor6PElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
}) {
  const isRunning = Boolean(component.state?.running);
  const direction = component.state?.direction || 'CW';
  const phaseError = component.state?.phaseError;
  const rotorState = component.state?.rotorState || 'STOPPED';
  const isStalled = rotorState === 'STALLED_HUM';
  const isBiphasic = rotorState === 'BIPHASIC_RUN';

  const [rotationAngle, setRotationAngle] = useState(0);

  const angleRef = useRef(0);
  const rpmRef = useRef(0);
  const lastActiveDirectionRef = useRef(direction);

  if (isRunning && direction) {
    lastActiveDirectionRef.current = direction;
  }

  const effectiveDirection = isRunning ? direction : (lastActiveDirectionRef.current || 'CW');

  // Detected connection topology from simulationEngine or wired bridges
  const detectedConnection =
    component.state?.detectedConnection ||
    (component.state?.isStarWired ? 'Y' : component.state?.isDeltaWired ? 'DELTA' : component.state?.connectionType || 'NONE');

  const connectionLabel =
    detectedConnection === 'Y'
      ? 'Y ESTRELA (380V)'
      : detectedConnection === 'DELTA'
      ? 'Δ TRIÂNGULO (220V)'
      : 'S/ FECHAMENTO';

  const connectionColor =
    detectedConnection === 'Y'
      ? '#34d399' // Emerald green
      : detectedConnection === 'DELTA'
      ? '#fbbf24' // Amber/orange
      : '#94a3b8'; // Muted gray

  const directionLabel =
    !isRunning
      ? 'PARADO'
      : effectiveDirection === 'CW'
      ? 'HORÁRIO (CW ↻)'
      : 'ANTI-HOR. (CCW ↺)';

  const directionColor =
    !isRunning
      ? '#64748b'
      : effectiveDirection === 'CW'
      ? '#38bdf8'
      : '#c084fc';

  // Rotational physics animation loop with mechanical inertia
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const targetRpm = component.state?.rpm ?? (isRunning ? 1750 : 0);
      const rate = isRunning ? 1300 : 700; // RPM per second

      if (rpmRef.current < targetRpm) {
        rpmRef.current = Math.min(targetRpm, rpmRef.current + rate * dt);
      } else if (rpmRef.current > targetRpm) {
        rpmRef.current = Math.max(0, rpmRef.current - rate * dt);
      }

      // Consistently preserve direction throughout angular momentum deceleration
      const activeDir = isRunning ? direction : lastActiveDirectionRef.current;
      const speedMult = activeDir === 'CW' ? 1 : -1;
      const degPerSec = (rpmRef.current / 60) * 360;
      const rawAngle = (angleRef.current + speedMult * degPerSec * dt) % 360;
      angleRef.current = rawAngle < 0 ? rawAngle + 360 : rawAngle;

      setRotationAngle(angleRef.current);

      try {
        sounds.updateMotorHum(rpmRef.current, isRunning, isStalled);
      } catch {}

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, direction, isStalled, component.state?.rpm]);

  const renderTerminal = (t, isPE = false) => {
    if (!t) return null;
    const vKey = `${component.id}:${t.id}`;
    const volt = terminalVoltages?.get(vKey);
    const isSelected =
      activeTerminal?.componentId === component.id &&
      activeTerminal?.terminalId === t.id;

    const fixedPos = MOTOR_TERMINAL_POS[t.id];
    const term = fixedPos ? { ...t, x: fixedPos.x, y: fixedPos.y } : t;

    return (
      <MotorBrassTerminal
        key={t.id}
        componentId={component.id}
        terminal={term}
        voltage={volt}
        isSelected={isSelected}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        isPE={isPE}
      />
    );
  };

  const findTerminal = (id) => component.terminals.find((t) => t.id === id);

  const tU1 = findTerminal('U1');
  const tV1 = findTerminal('V1');
  const tW1 = findTerminal('W1');
  const tW2 = findTerminal('W2');
  const tU2 = findTerminal('U2');
  const tV2 = findTerminal('V2');
  const tPE = findTerminal('PE');

  // Screws on the 45-degree angles of the front bearing flange
  const flangeScrews = [
    { x: 130 + 31, y: 231 + 31 },
    { x: 130 - 31, y: 231 + 31 },
    { x: 130 + 31, y: 231 - 31 },
    { x: 130 - 31, y: 231 - 31 },
  ];

  return (
    <div
      className={`motor-frontal-device ${
        isRunning ? 'running' : ''
      } ${isStalled || isBiphasic ? 'vibrating-fault' : phaseError ? 'fault-warn' : ''}`}
    >
      {/* Main Motor Viewport: Terminal box on top + Frontal Motor Body below (frameless) */}
      <div className="motor-chassis-stage">
        <svg
          className="motor-svg-casing"
          viewBox="0 0 260 340"
          width="260"
          height="340"
        >
          <defs>
            {/* Terminal Box Housing Industrial Blue Gradient */}
            <linearGradient id="tbox-blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="12%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="85%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* Terminal Box Cavity Shadow */}
            <radialGradient id="tbox-cavity-grad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#131b2e" />
              <stop offset="70%" stopColor="#0c1220" />
              <stop offset="100%" stopColor="#060911" />
            </radialGradient>

            {/* Industrial Bakelite Black Board Gradient */}
            <linearGradient id="plate-black-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c3038" />
              <stop offset="25%" stopColor="#20232a" />
              <stop offset="80%" stopColor="#16181d" />
              <stop offset="100%" stopColor="#0f1115" />
            </linearGradient>

            {/* PE Green Socket Gradient */}
            <radialGradient id="pe-green-grad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="35%" stopColor="#22c55e" />
              <stop offset="80%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#14532d" />
            </radialGradient>

            {/* Terminal Screw Socket Metallic Gradient */}
            <radialGradient id="socket-metal-grad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#e2e8f0" />
              <stop offset="75%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>

            {/* Front Motor Stator Blue Gradient */}
            <linearGradient id="motor-front-blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="15%" stopColor="#1d4ed8" />
              <stop offset="65%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* Outer Bearing Shield Blue Gradient */}
            <linearGradient id="flange-outer-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="40%" stopColor="#2563eb" />
              <stop offset="80%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* Inner Bearing Shield Blue Gradient */}
            <radialGradient id="flange-inner-blue" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#172554" />
            </radialGradient>

            {/* Turned Steel Rotor Shaft Gradient */}
            <radialGradient id="shaft-turn-grad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="30%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>

            <filter id="box-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* ========================================================
              TOP SECTION: TERMINAL BOX (CAIXA DE LIGAÇÃO INDUSTRIAL)
              ======================================================== */}
          <g className="motor-terminal-box-group" filter="url(#box-shadow)">
            {/* Cast Blue Enclosure Box */}
            <rect
              x="10"
              y="6"
              width="240"
              height="118"
              rx="14"
              fill="url(#tbox-blue-grad)"
              stroke="#1e3a8a"
              strokeWidth="2.5"
            />
            {/* Outer Bevel Highlight */}
            <rect
              x="11.5"
              y="7.5"
              width="237"
              height="115"
              rx="12.5"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.2"
            />

            {/* 4 Lid Mounting Screw Bosses (Cantos com rebaixo para parafusos da tampa) */}
            {[
              { cx: 22, cy: 18 },
              { cx: 238, cy: 18 },
              { cx: 22, cy: 112 },
              { cx: 238, cy: 112 },
            ].map((boss, idx) => (
              <g key={`lid-boss-${idx}`}>
                <circle cx={boss.cx} cy={boss.cy} r="6" fill="#172554" stroke="#0f172a" strokeWidth="1" />
                <circle cx={boss.cx} cy={boss.cy} r="4" fill="#0a0f1d" />
                <circle cx={boss.cx} cy={boss.cy} r="2.5" fill="#020617" />
                <circle cx={boss.cx - 1} cy={boss.cy - 1} r="0.8" fill="rgba(255,255,255,0.4)" />
              </g>
            ))}

            {/* Recessed Inner Cavity */}
            <rect
              x="17"
              y="13"
              width="226"
              height="104"
              rx="9"
              fill="url(#tbox-cavity-grad)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Cavity inner drop shadow */}
            <rect
              x="18"
              y="14"
              width="224"
              height="102"
              rx="8"
              fill="none"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="1.5"
            />

            {/* Grounding Boss / Pad (PE) in the chassis recess */}
            <g className="motor-pe-chassis-pad">
              <rect x="26" y="24" width="24" height="24" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Metallic Grounding Lug Washer */}
              <circle cx="38" cy="36" r="11" fill="url(#socket-metal-grad)" stroke="#475569" strokeWidth="1" />
              {/* Green grounding ring collar */}
              <circle cx="38" cy="36" r="8" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 2" />
              {/* Crisp PE Identification */}
              <text
                x="38"
                y="59"
                fill="#cbd5e1"
                fontSize="10"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.5"
              >
                PE
              </text>
            </g>

            {/* Black Industrial Bakelite Terminal Board (Placa de Bornes) */}
            <rect
              x="66"
              y="16"
              width="168"
              height="98"
              rx="7"
              fill="url(#plate-black-grad)"
              stroke="#090a0d"
              strokeWidth="1.8"
            />
            {/* Plate top bevel highlight */}
            <rect
              x="67"
              y="17"
              width="166"
              height="96"
              rx="6"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* 4 Allen/Hex Corner Screws Holding the Black Plate */}
            {[
              { cx: 73, cy: 23 },
              { cx: 227, cy: 23 },
              { cx: 73, cy: 107 },
              { cx: 227, cy: 107 },
            ].map((scr, idx) => (
              <g key={`plate-scr-${idx}`}>
                <circle cx={scr.cx} cy={scr.cy} r="3.2" fill="#1e232a" stroke="#0a0c0f" strokeWidth="0.8" />
                <polygon
                  points={`${scr.cx},${scr.cy - 1.4} ${scr.cx + 1.2},${scr.cy - 0.7} ${scr.cx + 1.2},${scr.cy + 0.7} ${scr.cx},${scr.cy + 1.4} ${scr.cx - 1.2},${scr.cy + 0.7} ${scr.cx - 1.2},${scr.cy - 0.7}`}
                  fill="#090a0d"
                />
              </g>
            ))}

            {/* Socket Recesses for 6 Studs on the Bakelite Board */}
            {[
              { id: 'U1', x: 99, y: 36 },
              { id: 'V1', x: 156, y: 36 },
              { id: 'W1', x: 213, y: 36 },
              { id: 'W2', x: 99, y: 86 },
              { id: 'U2', x: 156, y: 86 },
              { id: 'V2', x: 213, y: 86 },
            ].map((t) => (
              <g key={`t-socket-${t.id}`}>
                {/* Circular recess in bakelite plate */}
                <circle cx={t.x} cy={t.y} r="13" fill="#0b0d11" stroke="#1f232b" strokeWidth="1" />
                {/* Dark inner bevel */}
                <circle cx={t.x} cy={t.y} r="11" fill="#14171d" />
              </g>
            ))}

            {/* Crisp Silk-Screened Terminal Labels (U1, V1, W1, W2, U2, V2) directly on the black board */}
            {/* Top Row: U1, V1, W1 placed to the left of the studs as in the reference image */}
            <text
              x="78"
              y="39.5"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              U1
            </text>
            <text
              x="135"
              y="39.5"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              V1
            </text>
            <text
              x="192"
              y="39.5"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              W1
            </text>

            {/* Bottom Row: W2, U2, V2 placed directly below the studs as in the reference image */}
            <text
              x="99"
              y="107"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              W2
            </text>
            <text
              x="156"
              y="107"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              U2
            </text>
            <text
              x="213"
              y="107"
              fill="#f8fafc"
              fontSize="11"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              V2
            </text>
          </g>

          {/* ========================================================
              BOTTOM SECTION: MOTOR FRONTAL VIEW (CORPO DO MOTOR)
              ======================================================== */}
          <g className="motor-frontal-unit-group" filter="url(#box-shadow)">
            {/* Mounting Feet at bottom */}
            <rect x="26" y="322" width="46" height="14" rx="3" fill="#172554" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="36" cy="329" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

            <rect x="188" y="322" width="46" height="14" rx="3" fill="#172554" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="224" cy="329" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

            {/* Main Rounded Stator Body in Industrial Blue */}
            <rect
              x="26"
              y="136"
              width="208"
              height="190"
              rx="24"
              fill="url(#motor-front-blue-grad)"
              stroke="#1e3a8a"
              strokeWidth="2"
            />

            {/* Specular Diagonal Shine on Top-Left Corner */}
            <path
              d="M 38 138 Q 95 138 120 168 Q 80 185 36 172 Z"
              fill="rgba(255, 255, 255, 0.28)"
              pointerEvents="none"
            />

            {/* Lateral Cooling Ribs / Tabs on Left */}
            <rect x="21" y="174" width="7" height="6" rx="2" fill="#1e3a8a" />
            <rect x="21" y="214" width="7" height="6" rx="2" fill="#1e3a8a" />
            <rect x="21" y="254" width="7" height="6" rx="2" fill="#1e3a8a" />
            <rect x="21" y="294" width="7" height="6" rx="2" fill="#1e3a8a" />

            {/* Lateral Cooling Ribs / Tabs on Right */}
            <rect x="232" y="174" width="7" height="6" rx="2" fill="#1e3a8a" />
            <rect x="232" y="214" width="7" height="6" rx="2" fill="#1e3a8a" />
            <rect x="232" y="254" width="7" height="6" rx="2" fill="#1e3a8a" />
            <rect x="232" y="294" width="7" height="6" rx="2" fill="#1e3a8a" />

            {/* Large Circular Bearing Flange Shield */}
            <circle
              cx="130"
              cy="231"
              r="65"
              fill="url(#flange-outer-blue)"
              stroke="#172554"
              strokeWidth="2.5"
            />
            <circle
              cx="130"
              cy="231"
              r="54"
              fill="url(#flange-inner-blue)"
              stroke="#1e40af"
              strokeWidth="1.5"
            />

            {/* Radial Embossed Tick Marks around Flange */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const radVal = (deg * Math.PI) / 180;
              const x1 = 130 + 55 * Math.cos(radVal);
              const y1 = 231 + 55 * Math.sin(radVal);
              const x2 = 130 + 63 * Math.cos(radVal);
              const y2 = 231 + 63 * Math.sin(radVal);
              return (
                <line
                  key={`tick-${deg}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#172554"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Hex Assembly Screws on Bearing Flange (4x) */}
            {flangeScrews.map((pos, idx) => (
              <g key={`screw-flange-${idx}`}>
                <circle cx={pos.x} cy={pos.y} r="5" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />
                <circle cx={pos.x} cy={pos.y} r="3.2" fill="#94a3b8" />
                <line
                  x1={pos.x - 2}
                  y1={pos.y}
                  x2={pos.x + 2}
                  y2={pos.y}
                  stroke="#334155"
                  strokeWidth="0.8"
                />
              </g>
            ))}

            {/* Rotating Rotor / Turned Steel Shaft Assembly */}
            <circle
              cx="130"
              cy="231"
              r="30"
              fill="url(#shaft-turn-grad)"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Specular White Shine Highlight Dot on Rotor */}
            <circle cx="142" cy="226" r="2.8" fill="#ffffff" />

            {/* Central Dark Shaft Core */}
            <circle cx="130" cy="231" r="12" fill="#334155" />

            {/* Rotating Yellow Keyway Arrow / Indicator */}
            <g transform={`rotate(${rotationAngle}, 130, 231)`}>
              {/* Yellow Keyway Pointer Polygon */}
              <polygon
                points="126,231 127,211 130,203 133,211 134,231"
                fill="#f59e0b"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <line x1="130" y1="210" x2="130" y2="225" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Center Cap Nut */}
            <circle cx="130" cy="231" r="6" fill="#475569" stroke="#1e293b" strokeWidth="1" />

            {/* ========================================================
                OVERLAID BADGES (CONFORME SOLICITADO PELO USUÁRIO)
                ======================================================== */}
            {/* 1. Badge Fechamento Estrela (Y) / Triângulo (Δ) - Estilo Anterior no canto superior esquerdo */}
            <g
              className="motor-overlay-badge-fechamento"
              transform="translate(36, 146)"
              filter="url(#box-shadow)"
              style={{ cursor: 'pointer' }}
            >
              <title>{connectionLabel}</title>
              {/* Badge Circular Background */}
              <circle
                cx="16"
                cy="16"
                r="15"
                fill="#0b1329"
                stroke={detectedConnection === 'DELTA' ? '#f59e0b' : detectedConnection === 'Y' ? '#38bdf8' : '#475569'}
                strokeWidth="1.8"
                opacity={detectedConnection !== 'NONE' ? 0.95 : 0.4}
              />
              {detectedConnection === 'DELTA' ? (
                /* Símbolo Triângulo Δ */
                <polygon
                  points="16,9 23,23 9,23"
                  stroke="#f59e0b"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  fill="rgba(245, 158, 11, 0.2)"
                />
              ) : detectedConnection === 'Y' ? (
                /* Símbolo Estrela Y */
                <path
                  d="M 11 10 L 16 16 L 21 10 M 16 16 L 16 23"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : (
                /* Traço de sem fechamento */
                <line
                  x1="11"
                  y1="16"
                  x2="21"
                  y2="16"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* 2. Badge Estático de Sentido de Rotação no canto superior direito (no momento que liga) */}
            {isRunning && (
              <g
                className="motor-badge-rotacao-topright"
                transform="translate(225, 134)"
                filter="url(#box-shadow)"
                style={{ cursor: 'pointer' }}
              >
                <title>{directionLabel}</title>
                <circle cx="0" cy="0" r="16" fill="#15803d" stroke="#22c55e" strokeWidth="2.5" />
                {effectiveDirection === 'CW' ? (
                  /* Seta estática no sentido Horário (↻) - Aponta claramente no sentido horário */
                  <g
                    transform="translate(-12, -12)"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </g>
                ) : (
                  /* Seta estática no sentido Anti-Horário (↺) - Aponta claramente no sentido anti-horário */
                  <g
                    transform="translate(-12, -12)"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </g>
                )}
              </g>
            )}
          </g>
        </svg>

        {/* Interactive Brass Stud Terminals */}
        {renderTerminal(tPE, true)}
        {renderTerminal(tU1, false)}
        {renderTerminal(tV1, false)}
        {renderTerminal(tW1, false)}
        {renderTerminal(tW2, false)}
        {renderTerminal(tU2, false)}
        {renderTerminal(tV2, false)}
      </div>
    </div>
  );
}
