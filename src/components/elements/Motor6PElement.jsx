import React, { useEffect, useRef, useState } from 'react';
import ContactorScrew from './ContactorScrew';
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

  const renderScrew = (t, isLarge = false) => {
    if (!t) return null;
    const vKey = `${component.id}:${t.id}`;
    const volt = terminalVoltages?.get(vKey);
    const isSelected =
      activeTerminal?.componentId === component.id &&
      activeTerminal?.terminalId === t.id;

    const fixedPos = MOTOR_TERMINAL_POS[t.id];
    const term = fixedPos ? { ...t, x: fixedPos.x, y: fixedPos.y } : t;

    return (
      <ContactorScrew
        key={t.id}
        componentId={component.id}
        terminal={term}
        voltage={volt}
        isSelected={isSelected}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        labelPosition="none"
        labelColor="default"
        isLarge={isLarge}
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
            {/* Terminal Box Housing Gray Gradient */}
            <linearGradient id="tbox-gray-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="15%" stopColor="#8393a4" />
              <stop offset="85%" stopColor="#6c7c8d" />
              <stop offset="100%" stopColor="#5a6878" />
            </linearGradient>

            {/* Orange Terracotta Bakelite Board Gradient */}
            <linearGradient id="plate-orange-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="10%" stopColor="#dc4a20" />
              <stop offset="85%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#9a3412" />
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
              TOP SECTION: TERMINAL BOX (CAIXA DE BORNES)
              ======================================================== */}
          <g className="motor-terminal-box-group" filter="url(#box-shadow)">
            {/* Gray Outer Enclosure Box */}
            <rect
              x="10"
              y="6"
              width="240"
              height="118"
              rx="14"
              fill="url(#tbox-gray-grad)"
              stroke="#475569"
              strokeWidth="2.5"
            />
            {/* Subtle Inner Bevel */}
            <rect
              x="12"
              y="8"
              width="236"
              height="114"
              rx="12"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.2"
            />

            {/* Grounding Socket PE (Upper Left) */}
            <circle
              cx="38"
              cy="36"
              r="14"
              fill="url(#pe-green-grad)"
              stroke="#15803d"
              strokeWidth="1.5"
            />
            <circle cx="38" cy="36" r="7" fill="#86efac" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="38" cy="36" r="3" fill="#ffffff" />

            {/* PE White Label Badge */}
            <rect
              x="27"
              y="52"
              width="22"
              height="15"
              rx="3"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <text
              x="38"
              y="63.5"
              fill="#0f172a"
              fontSize="9.5"
              fontWeight="900"
              textAnchor="middle"
            >
              PE
            </text>

            {/* Terracotta/Orange Bakelite Terminal Plate */}
            <rect
              x="70"
              y="14"
              width="172"
              height="106"
              rx="10"
              fill="url(#plate-orange-grad)"
              stroke="#9a3412"
              strokeWidth="2"
            />

            {/* Sockets and White Badges for all 6 Terminals */}
            {/* Row 1: U1, V1, W1 */}
            {[
              { id: 'U1', x: 99, y: 36, labelY: 52 },
              { id: 'V1', x: 156, y: 36, labelY: 52 },
              { id: 'W1', x: 213, y: 36, labelY: 52 },
            ].map((t) => (
              <g key={`t-top-${t.id}`}>
                {/* Socket recess shadow */}
                <circle cx={t.x} cy={t.y} r="13" fill="#7c2d12" />
                {/* Metallic bezel */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r="11"
                  fill="url(#socket-metal-grad)"
                  stroke="#475569"
                  strokeWidth="1"
                />
                {/* Center plug socket */}
                <circle cx={t.x} cy={t.y} r="5" fill="#1e293b" />

                {/* White Label Badge */}
                <rect
                  x={t.x - 12}
                  y={t.labelY}
                  width="24"
                  height="15"
                  rx="3.5"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={t.x}
                  y={t.labelY + 11.5}
                  fill="#0f172a"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {t.id}
                </text>
              </g>
            ))}

            {/* Row 2: W2, U2, V2 */}
            {[
              { id: 'W2', x: 99, y: 86, labelY: 102 },
              { id: 'U2', x: 156, y: 86, labelY: 102 },
              { id: 'V2', x: 213, y: 86, labelY: 102 },
            ].map((t) => (
              <g key={`t-bot-${t.id}`}>
                {/* Socket recess shadow */}
                <circle cx={t.x} cy={t.y} r="13" fill="#7c2d12" />
                {/* Metallic bezel */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r="11"
                  fill="url(#socket-metal-grad)"
                  stroke="#475569"
                  strokeWidth="1"
                />
                {/* Center plug socket */}
                <circle cx={t.x} cy={t.y} r="5" fill="#1e293b" />

                {/* White Label Badge */}
                <rect
                  x={t.x - 12}
                  y={t.labelY}
                  width="24"
                  height="15"
                  rx="3.5"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={t.x}
                  y={t.labelY + 11.5}
                  fill="#0f172a"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {t.id}
                </text>
              </g>
            ))}
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

        {/* Interactive Screws for all Terminals (overlaying the sockets) */}
        {renderScrew(tPE, false)}
        {renderScrew(tU1, false)}
        {renderScrew(tV1, false)}
        {renderScrew(tW1, false)}
        {renderScrew(tW2, false)}
        {renderScrew(tU2, false)}
        {renderScrew(tV2, false)}
      </div>
    </div>
  );
}
