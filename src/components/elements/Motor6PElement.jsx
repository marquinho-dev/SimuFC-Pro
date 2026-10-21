import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/soundEffects';

export const MOTOR_TERMINAL_POS = {
  PE: { x: 38, y: 36 },
  W2: { x: 99, y: 36 },
  U2: { x: 156, y: 36 },
  V2: { x: 213, y: 36 },
  U1: { x: 99, y: 86 },
  V1: { x: 156, y: 86 },
  W1: { x: 213, y: 86 },
};

function VectorBrassTerminal({
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
    <g
      className={`motor-svg-terminal-group ${isPE ? 'terminal-pe' : ''} ${
        isSelected ? 'selected' : ''
      } ${isConnecting ? 'wire-target-ready' : ''} ${isPowered ? 'is-powered' : ''}`}
      transform={`translate(${terminal.x}, ${terminal.y})`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onTerminalClick(componentId, terminal.id);
      }}
      style={{ cursor: 'crosshair' }}
    >
      <title>{`${terminal.label || terminal.id}: ${voltage ? `Energizado (${voltage})` : 'Sem tensão'}`}</title>

      {/* Halo Glow for Energized or Selected state */}
      {(isPowered || isSelected || isConnecting) && (
        <circle
          cx="0"
          cy="0"
          r="16.5"
          fill="none"
          stroke={isPowered ? voltColor : isSelected ? '#00e676' : 'rgba(0, 230, 118, 0.4)'}
          strokeWidth={isSelected || isPowered ? '2.8' : '1.8'}
          style={{
            filter: isPowered
              ? `drop-shadow(0 0 6px ${voltColor})`
              : isSelected
              ? 'drop-shadow(0 0 8px #00e676)'
              : 'none',
          }}
        />
      )}

      {isPE ? (
        /* Grounding Terminal PE (Zinc-plated steel screw on green grounding pad) */
        <g className="motor-vector-pe-terminal">
          <circle cx="0" cy="0" r="14" fill="url(#pe-green-grad)" stroke="#000000" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="12" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.6" />
          {/* Zinc hex bolt with thick black border */}
          <polygon
            points="5.25,-9.09 -5.25,-9.09 -10.5,0 -5.25,9.09 5.25,9.09 10.5,0"
            fill="url(#zinc-hex-grad)"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Steel center */}
          <circle cx="0" cy="0" r="5" fill="#e2e8f0" stroke="#000000" strokeWidth="1.5" />
          <ellipse cx="1" cy="-1.2" rx="2" ry="1.2" fill="#ffffff" opacity="0.9" />
        </g>
      ) : (
        /* Pure Vector Brass Terminal Stud exactly as in Six-Terminal Motor Block Diagram.png */
        <g className="motor-vector-brass-stud">
          {/* 1. Golden Brass Washer with Crisp Black Border */}
          <circle cx="0" cy="0" r="14" fill="url(#brass-washer-grad)" stroke="#000000" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="12.2" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6" />

          {/* 2. Six Facets of the Hexagonal Nut with Individual 3D Shading */}
          {/* Top Facet (lightest reflection) */}
          <polygon
            points="-5.25,-9.09 5.25,-9.09 2.75,-4.76 -2.75,-4.76"
            fill="#fff59d"
            stroke="#000000"
            strokeWidth="1.2"
          />
          {/* Top-Right Facet */}
          <polygon
            points="5.25,-9.09 10.5,0 5.5,0 2.75,-4.76"
            fill="#fdd835"
            stroke="#000000"
            strokeWidth="1.2"
          />
          {/* Bottom-Right Facet */}
          <polygon
            points="10.5,0 5.25,9.09 2.75,4.76 5.5,0"
            fill="#f57f17"
            stroke="#000000"
            strokeWidth="1.2"
          />
          {/* Bottom Facet */}
          <polygon
            points="5.25,9.09 -5.25,9.09 -2.75,4.76 2.75,4.76"
            fill="#d97706"
            stroke="#000000"
            strokeWidth="1.2"
          />
          {/* Bottom-Left Facet */}
          <polygon
            points="-5.25,9.09 -10.5,0 -5.5,0 -2.75,4.76"
            fill="#f59e0b"
            stroke="#000000"
            strokeWidth="1.2"
          />
          {/* Top-Left Facet */}
          <polygon
            points="-10.5,0 -5.25,-9.09 -2.75,-4.76 -5.5,0"
            fill="#ffee58"
            stroke="#000000"
            strokeWidth="1.2"
          />

          {/* Outer Black Perimeter of the Hexagon */}
          <polygon
            points="5.25,-9.09 -5.25,-9.09 -10.5,0 -5.25,9.09 5.25,9.09 10.5,0"
            fill="none"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* 3. Inner Circular Bevel of the Nut */}
          <circle cx="0" cy="0" r="5.6" fill="#facc15" stroke="#000000" strokeWidth="1.5" />

          {/* 4. Silver Steel Threaded Pin Center */}
          <circle cx="0" cy="0" r="4.6" fill="url(#steel-stud-pin)" stroke="#000000" strokeWidth="1.2" />
          {/* Specular White Highlight Crescent */}
          <ellipse cx="1" cy="-1.2" rx="2" ry="1.2" fill="#ffffff" opacity="0.9" />
          <path d="M -3.2 -3.2 A 4.6 4.6 0 0 0 -3.2 3.2" fill="none" stroke="#64748b" strokeWidth="1" opacity="0.7" />
        </g>
      )}

      {/* Powered Dot Indicator */}
      {isPowered && (
        <circle
          cx="8"
          cy="-8"
          r="3"
          fill={voltColor}
          stroke="#000000"
          strokeWidth="1"
          style={{ filter: `drop-shadow(0 0 4px ${voltColor})` }}
        />
      )}

      {/* Invisible Large Hit Area for effortless click targeting */}
      <circle cx="0" cy="0" r="16" fill="transparent" />
    </g>
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
      <VectorBrassTerminal
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

  const tW2 = findTerminal('W2');
  const tU2 = findTerminal('U2');
  const tV2 = findTerminal('V2');
  const tU1 = findTerminal('U1');
  const tV1 = findTerminal('V1');
  const tW1 = findTerminal('W1');
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

            {/* Molded Bakelite Block Charcoal-Black Gradient (Six-Terminal Motor Block Diagram) */}
            <linearGradient id="bakelite-block-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#252830" />
              <stop offset="8%" stopColor="#1b1d22" />
              <stop offset="40%" stopColor="#131418" />
              <stop offset="80%" stopColor="#101114" />
              <stop offset="100%" stopColor="#0b0c0e" />
            </linearGradient>

            {/* Subtle highlight gradient along top edges */}
            <linearGradient id="bakelite-rim-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
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

            {/* Golden Brass Washer Gradient */}
            <radialGradient id="brass-washer-grad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="25%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>

            {/* Silver Steel Threaded Stud Center */}
            <radialGradient id="steel-stud-pin" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#f1f5f9" />
              <stop offset="65%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>

            {/* Zinc Hex Nut Gradient (for PE) */}
            <linearGradient id="zinc-hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

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
              Featuring the 6-Terminal Bakelite Block from Six-Terminal Motor Block Diagram
              ======================================================== */}
          <g className="motor-terminal-box-group" filter="url(#box-shadow)">
            {/* Cast Blue Outer Enclosure */}
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

            {/* 4 Lid Mounting Screw Bosses */}
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
              <rect x="25" y="24" width="26" height="25" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              {/* Metallic Grounding Lug Washer */}
              <circle cx="38" cy="36" r="11" fill="url(#socket-metal-grad)" stroke="#475569" strokeWidth="1" />
              {/* Green grounding collar */}
              <circle cx="38" cy="36" r="8" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 2" />
              {/* Crisp PE Identification */}
              <text
                x="38"
                y="59"
                fill="#cbd5e1"
                fontSize="10"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                letterSpacing="0.5"
              >
                PE
              </text>
            </g>

            {/* ========================================================
                AUTHENTIC SIX-TERMINAL MOTOR BAKELITE BLOCK (PLACA DE BORNES 6P)
                Exactly matching Six-Terminal Motor Block Diagram.png
                ======================================================== */}
            {/* Outer molded silhouette with top/bottom stepped crenellations, chamfered corners & 2 mounting ears */}
            <path
              d="
                M 76 10
                L 122 10
                Q 123 10 123 12
                L 123 16
                Q 123 18 125 18
                L 131 18
                Q 133 18 133 16
                L 133 12
                Q 133 10 134 10
                L 178 10
                Q 179 10 179 12
                L 179 16
                Q 179 18 181 18
                L 188 18
                Q 190 18 190 16
                L 190 12
                Q 190 10 191 10
                L 236 10
                Q 240 10 243 13
                L 247 17
                Q 249 20 249 25
                L 249 47
                Q 249 50 252 52
                A 10 10 0 0 1 252 70
                Q 249 72 249 75
                L 249 97
                Q 249 101 247 104
                L 243 108
                Q 240 111 236 111
                L 191 111
                Q 190 111 190 109
                L 190 105
                Q 190 103 188 103
                L 181 103
                Q 179 103 179 105
                L 179 109
                Q 179 111 178 111
                L 134 111
                Q 133 111 133 109
                L 133 105
                Q 133 103 131 103
                L 125 103
                Q 123 103 123 105
                L 123 109
                Q 123 111 122 111
                L 76 111
                Q 72 111 69 108
                L 65 104
                Q 63 101 63 97
                L 63 75
                Q 63 72 60 70
                A 10 10 0 0 1 60 52
                Q 63 50 63 47
                L 63 25
                Q 63 20 65 17
                L 69 13
                Q 72 10 76 10
                Z
              "
              fill="url(#bakelite-block-grad)"
              stroke="#07080a"
              strokeWidth="2"
            />

            {/* Inner rim highlight on the molded perimeter */}
            <path
              d="
                M 77 11.5
                L 121 11.5
                L 121 17.5
                L 134 17.5
                L 134 11.5
                L 177 11.5
                L 177 17.5
                L 191 17.5
                L 191 11.5
                L 235 11.5
                L 247.5 24
                L 247.5 97
                L 235 109.5
                L 191 109.5
                L 191 103.5
                L 177 103.5
                L 177 109.5
                L 134 109.5
                L 134 103.5
                L 121 103.5
                L 121 109.5
                L 77 109.5
                L 64.5 97
                L 64.5 24
                Z
              "
              fill="none"
              stroke="url(#bakelite-rim-grad)"
              strokeWidth="1"
            />

            {/* Molded Partition Dividers between Columns (conforme Six-Terminal Motor Block Diagram) */}
            <path
              d="
                M 127 18 L 127 48
                M 184.5 18 L 184.5 48
                M 127 74 L 127 104
                M 184.5 74 L 184.5 104
              "
              fill="none"
              stroke="#0a0b0e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="
                M 127 18 L 127 48
                M 184.5 18 L 184.5 48
                M 127 74 L 127 104
                M 184.5 74 L 184.5 104
              "
              fill="none"
              stroke="#242732"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Two Sunken Square Compartments in Central Bakelite area */}
            <g className="motor-block-center-cavities">
              {/* Left Cavity */}
              <rect x="116" y="50" width="22" height="22" rx="4.5" fill="#090a0d" stroke="#252934" strokeWidth="1.3" />
              <rect x="117.5" y="51.5" width="19" height="19" rx="3.5" fill="#0f1116" />
              {/* Right Cavity */}
              <rect x="173.5" y="50" width="22" height="22" rx="4.5" fill="#090a0d" stroke="#252934" strokeWidth="1.3" />
              <rect x="175" y="51.5" width="19" height="19" rx="3.5" fill="#0f1116" />
            </g>

            {/* Left and Right Mounting Ear Holes with Metallic Bushings */}
            {/* Left Ear Mounting Hole */}
            <circle cx="62" cy="61" r="7.5" fill="#12141a" stroke="#262934" strokeWidth="1" />
            <circle cx="62" cy="61" r="5" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="62" cy="61" r="4" fill="#0f172a" />
            {/* Right Ear Mounting Hole */}
            <circle cx="250" cy="61" r="7.5" fill="#12141a" stroke="#262934" strokeWidth="1" />
            <circle cx="250" cy="61" r="5" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="250" cy="61" r="4" fill="#0f172a" />

            {/* 6 Circular Recesses / Sockets in Bakelite for the Stud Terminals */}
            {[
              { id: 'W2', x: 99, y: 36 },
              { id: 'U2', x: 156, y: 36 },
              { id: 'V2', x: 213, y: 36 },
              { id: 'U1', x: 99, y: 86 },
              { id: 'V1', x: 156, y: 86 },
              { id: 'W1', x: 213, y: 86 },
            ].map((t) => (
              <g key={`t-socket-${t.id}`}>
                {/* Outer socket recess rim */}
                <circle cx={t.x} cy={t.y} r="18" fill="#0c0d11" stroke="#262a34" strokeWidth="1.2" />
                {/* Inner stepped shadow */}
                <circle cx={t.x} cy={t.y} r="15.5" fill="#121419" stroke="#08090b" strokeWidth="0.8" />
              </g>
            ))}

            {/* ========================================================
                CRISP WHITE TECHNICAL MARKINGS (EXACT LAYOUT FROM DIAGRAM):
                Top Row: W2, U2, V2
                Bottom Row: U1, V1, W1
                ======================================================== */}
            {/* Top Row Labels on Upper Stepped Tabs */}
            <text
              x="99"
              y="23"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              W2
            </text>
            <text
              x="156"
              y="23"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              U2
            </text>
            <text
              x="213"
              y="23"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              V2
            </text>

            {/* Bottom Row Labels on Lower Stepped Tabs */}
            <text
              x="99"
              y="105"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              U1
            </text>
            <text
              x="156"
              y="105"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              V1
            </text>
            <text
              x="213"
              y="105"
              fill="#ffffff"
              fontSize="14.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              W1
            </text>

            {/* Interactive Vector Brass Stud Terminals inside SVG for 100% razor-sharp vector rendering */}
            {renderTerminal(tPE, true)}
            {renderTerminal(tW2, false)}
            {renderTerminal(tU2, false)}
            {renderTerminal(tV2, false)}
            {renderTerminal(tU1, false)}
            {renderTerminal(tV1, false)}
            {renderTerminal(tW1, false)}
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
      </div>
    </div>
  );
}
