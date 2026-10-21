import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/soundEffects';

export const MOTOR_TERMINAL_POS = {
  W2: { x: 140, y: 260 },
  U2: { x: 245, y: 260 },
  V2: { x: 350, y: 260 },
  U1: { x: 140, y: 430 },
  V1: { x: 245, y: 430 },
  W1: { x: 350, y: 430 },
  PE: { x: 405, y: 345 },
};

export function detectMotorClosure(compId, wires) {
  if (!wires || !compId) return 'NONE';
  const adj = new Map();
  const addEdge = (t1, t2) => {
    if (!t1 || !t2) return;
    if (!adj.has(t1)) adj.set(t1, new Set());
    if (!adj.has(t2)) adj.set(t2, new Set());
    adj.get(t1).add(t2);
    adj.get(t2).add(t1);
  };

  for (const w of wires) {
    if (w.fromComponent === compId && w.toComponent === compId) {
      addEdge(w.fromTerminal, w.toTerminal);
    }
  }

  const isConnected = (start, target) => {
    if (start === target) return true;
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur === target) return true;
      const neighbors = adj.get(cur) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return false;
  };

  const isStar =
    (isConnected('W2', 'U2') && isConnected('U2', 'V2')) ||
    (isConnected('W1', 'U1') && isConnected('U1', 'V1'));

  const isDelta =
    isConnected('U1', 'W2') &&
    isConnected('V1', 'U2') &&
    isConnected('W1', 'V2');

  if (isStar) return 'Y';
  if (isDelta) return 'DELTA';
  return 'NONE';
}

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
      data-terminal-target={`${componentId}:${terminal.id}`}
      style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onTerminalClick?.(componentId, terminal.id);
      }}
    >
      <title>{`${terminal.label || terminal.id}: ${voltage ? `Energizado (${voltage})` : 'Sem tensão'}`}</title>

      {/* Halo Glow for Energized or Selected state */}
      {(isPowered || isSelected || isConnecting) && (
        <circle
          cx="0"
          cy="0"
          r="30"
          fill="none"
          stroke={isPowered ? voltColor : isSelected ? '#00e676' : 'rgba(0, 230, 118, 0.4)'}
          strokeWidth={isSelected || isPowered ? '4.5' : '3'}
          style={{
            filter: isPowered
              ? `drop-shadow(0 0 10px ${voltColor})`
              : isSelected
              ? 'drop-shadow(0 0 12px #00e676)'
              : 'none',
          }}
        />
      )}

      {isPE ? (
        /* Earth / Ground Terminal PE - Alto contraste, fundo escuro e traço branco nítido */
        <g className="motor-gemini-pe-terminal">
          <circle cx="0" cy="0" r="17" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          <circle cx="0" cy="0" r="14.5" fill="none" stroke="#1e293b" strokeWidth="1" />
          <line x1="0" y1="-7" x2="0" y2="4" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="-9" y1="4" x2="9" y2="4" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="-6" y1="8" x2="6" y2="8" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="-2.5" y1="12" x2="2.5" y2="12" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      ) : (
        /* Reusable Hexagonal Terminal Nut Component exactly from gemini-svg.svg */
        <g className="motor-gemini-nut">
          {/* Hexagonal Nut with rounded corners (using strokeLinejoin="round") */}
          <polygon
            points="0,-24 20.78,-12 20.78,12 0,24 -20.78,12 -20.78,-12"
            fill="url(#silverNut)"
            stroke="#4a5259"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner circular beveling / indentation */}
          <circle r="19" fill="url(#nutBevel)" />
          <circle r="18" fill="none" stroke="#5a6570" strokeWidth="0.5" />
          {/* Inner threaded ring area */}
          <circle r="13" fill="url(#silverNut)" stroke="#3a4249" strokeWidth="1.5" />
          <circle r="10" fill="none" stroke="#9ba4ad" strokeWidth="1" />
          {/* Center Bolt */}
          <circle r="8" fill="#dadddf" stroke="#68737d" strokeWidth="1" />
        </g>
      )}

      {/* Powered Dot Indicator */}
      {isPowered && (
        <circle
          cx="16"
          cy="-16"
          r="6"
          fill={voltColor}
          stroke="#000000"
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 6px ${voltColor})` }}
        />
      )}

      {/* Invisible Large Hit Area for effortless click targeting */}
      <circle cx="0" cy="0" r="32" fill="transparent" style={{ pointerEvents: 'auto' }} />
    </g>
  );
}

export default function Motor6PElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  wires = [],
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
  const wiredClosure = React.useMemo(() => {
    return detectMotorClosure(component.id, wires);
  }, [component.id, wires]);

  const detectedConnection =
    component.state?.detectedConnection && component.state.detectedConnection !== 'NONE'
      ? component.state.detectedConnection
      : component.state?.isStarWired
      ? 'Y'
      : component.state?.isDeltaWired
      ? 'DELTA'
      : wiredClosure !== 'NONE'
      ? wiredClosure
      : component.state?.connectionType || 'NONE';

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

  const findTerminal = (id) => component?.terminals?.find((t) => t.id === id) || { id, label: id };

  const tW2 = findTerminal('W2');
  const tU2 = findTerminal('U2');
  const tV2 = findTerminal('V2');
  const tU1 = findTerminal('U1');
  const tV1 = findTerminal('V1');
  const tW1 = findTerminal('W1');
  const tPE = findTerminal('PE');

  return (
    <div
      className={`motor-frontal-device ${
        isRunning ? 'running' : ''
      } ${isStalled || isBiphasic ? 'vibrating-fault' : phaseError ? 'fault-warn' : ''}`}
    >
      {/* Main Motor Viewport: Terminal box on top + Frontal Motor Body below (afastados com folga estética) */}
      <div className="motor-chassis-stage">
        <svg
          className="motor-svg-casing"
          viewBox="0 0 500 1020"
          width="500"
          height="1020"
        >
          <defs>
            {/* Vibrant Glossy Royal Blue for Stator and Terminal Box (exact from user reference image) */}
            <linearGradient id="motor-front-blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a88e8" />
              <stop offset="25%" stopColor="#3572d4" />
              <stop offset="65%" stopColor="#225bb5" />
              <stop offset="100%" stopColor="#143c7e" />
            </linearGradient>

            {/* Specular curved reflection on enamel/glass body */}
            <linearGradient id="motorGlossShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Flange Outer Ring Vibrant Blue */}
            <linearGradient id="flange-outer-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a88e8" />
              <stop offset="40%" stopColor="#3572d4" />
              <stop offset="85%" stopColor="#225bb5" />
              <stop offset="100%" stopColor="#143c7e" />
            </linearGradient>

            {/* Flange Inner Ring Deeper Blue */}
            <radialGradient id="flange-inner-blue" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#2c67c7" />
              <stop offset="65%" stopColor="#1e4e9e" />
              <stop offset="100%" stopColor="#123570" />
            </radialGradient>

            {/* Terminal Box Gradients matching the same Vibrant Glossy Royal Blue */}
            <linearGradient id="blueBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a88e8" />
              <stop offset="30%" stopColor="#3572d4" />
              <stop offset="70%" stopColor="#225bb5" />
              <stop offset="100%" stopColor="#143c7e" />
            </linearGradient>
            
            <linearGradient id="innerBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#225bb5" />
              <stop offset="60%" stopColor="#1a4691" />
              <stop offset="100%" stopColor="#0f2652" />
            </linearGradient>

            <linearGradient id="blackPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#333333" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>

            {/* Base silver gradient for the nut */}
            <linearGradient id="silverNut" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6e9ec" />
              <stop offset="50%" stopColor="#b0b7bd" />
              <stop offset="100%" stopColor="#7a8289" />
            </linearGradient>

            {/* Inverted silver gradient for inner bevel depth */}
            <linearGradient id="nutBevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7a8289" />
              <stop offset="50%" stopColor="#b0b7bd" />
              <stop offset="100%" stopColor="#e6e9ec" />
            </linearGradient>

            {/* Reusable Screw Component from gemini-svg.svg */}
            <g id="gemini-screw">
              <circle r="10" fill="url(#silverNut)" stroke="#555" strokeWidth="1" />
              <path d="M -5,0 L 5,0 M 0,-5 L 0,5" stroke="#444" strokeWidth="2" />
            </g>
            
            {/* Outer Box Screw from gemini-svg.svg */}
            <g id="gemini-box-screw">
              <circle r="12" fill="#225bb5" stroke="#0f2652" strokeWidth="1.2" />
              <circle r="6" fill="#0f2652" />
            </g>

            {/* Turned Steel Rotor Shaft Gradient */}
            <radialGradient id="shaft-turn-grad" cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="65%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </radialGradient>

            <filter id="box-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* ========================================================
              TOP SECTION: TERMINAL BOX (CAIXA DE LIGAÇÃO INDUSTRIAL)
              Fiel ao gemini-svg.svg com paleta harmonizada
              ======================================================== */}
          <g className="motor-terminal-box-group" filter="url(#box-shadow)">
            {/* Outer Blue Enclosure */}
            <rect x="10" y="30" width="480" height="560" rx="25" fill="url(#blueBoxGrad)" stroke="#0f2652" strokeWidth="3" />
            <rect x="30" y="50" width="440" height="520" rx="20" fill="url(#blueBoxGrad)" />
            
            {/* Outer Box Corner Screws */}
            <use href="#gemini-box-screw" x="35" y="55" />
            <use href="#gemini-box-screw" x="465" y="55" />
            <use href="#gemini-box-screw" x="35" y="565" />
            <use href="#gemini-box-screw" x="465" y="565" />

            {/* Inner Blue Rim Cutout */}
            <rect x="45" y="65" width="410" height="490" rx="15" fill="url(#innerBlueGrad)" stroke="#0f2652" strokeWidth="2" />

            {/* Main Black Terminal Panel */}
            <rect x="60" y="120" width="380" height="410" rx="12" fill="url(#blackPanelGrad)" stroke="#111" strokeWidth="3" />
            
            {/* Central Blank Indentations */}
            <rect x="165" y="315" width="55" height="55" rx="10" fill="#222" stroke="#181818" strokeWidth="2" />
            <rect x="270" y="315" width="55" height="55" rx="10" fill="#222" stroke="#181818" strokeWidth="2" />

            {/* Inner Panel Screws */}
            <use href="#gemini-screw" x="85" y="145" />
            <use href="#gemini-screw" x="415" y="145" />
            <use href="#gemini-screw" x="85" y="505" />
            <use href="#gemini-screw" x="415" y="505" />

            {/* Terminal Markings (Top Row) */}
            <text x="140" y="210" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#e0e0e0" textAnchor="middle">W2</text>
            <text x="245" y="210" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#e0e0e0" textAnchor="middle">U2</text>
            <text x="350" y="210" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#e0e0e0" textAnchor="middle">V2</text>

            {/* Terminals (Top Row) */}
            {renderTerminal(tW2, false)}
            {renderTerminal(tU2, false)}
            {renderTerminal(tV2, false)}

            {/* Terminal Markings (Bottom Row) */}
            <text x="140" y="490" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#e0e0e0" textAnchor="middle">U1</text>
            <text x="245" y="490" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#e0e0e0" textAnchor="middle">V1</text>
            <text x="350" y="490" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill="#e0e0e0" textAnchor="middle">W1</text>

            {/* Terminals (Bottom Row) */}
            {renderTerminal(tU1, false)}
            {renderTerminal(tV1, false)}
            {renderTerminal(tW1, false)}

            {/* Earth / Ground Terminal (Right side) */}
            {renderTerminal(tPE, true)}
          </g>

          {/* ========================================================
              BOTTOM SECTION: MOTOR FRONTAL VIEW (CORPO DO MOTOR)
              Afastado sem pescoço intermediário, proporções refinadas
              ======================================================== */}
          <g className="motor-frontal-unit-group" filter="url(#box-shadow)">
            {/* Mounting Feet at bottom */}
            <rect x="45" y="1018" width="85" height="26" rx="6" fill="#143c7e" stroke="#0b1e42" strokeWidth="2.5" />
            <circle cx="65" cy="1031" r="6" fill="#0b1e42" stroke="#64748b" strokeWidth="1.5" />

            <rect x="370" y="1018" width="85" height="26" rx="6" fill="#143c7e" stroke="#0b1e42" strokeWidth="2.5" />
            <circle cx="435" cy="1031" r="6" fill="#0b1e42" stroke="#64748b" strokeWidth="1.5" />

            {/* Main Rounded Stator Body in Vibrant Glossy Royal Blue */}
            <rect
              x="20"
              y="620"
              width="460"
              height="400"
              rx="48"
              fill="url(#motor-front-blue-grad)"
              stroke="#0b1e42"
              strokeWidth="4"
            />

            {/* Glossy Top-Left Specular Curved Reflection (Glass/Enamel Shine from reference image) */}
            <path
              d="M 38 635 Q 220 625 440 645 Q 260 705 35 695 Z"
              fill="url(#motorGlossShine)"
              pointerEvents="none"
            />
            {/* Soft secondary rim reflection along top edge */}
            <rect
              x="45"
              y="626"
              width="410"
              height="6"
              rx="3"
              fill="rgba(255, 255, 255, 0.45)"
              pointerEvents="none"
            />

            {/* Embossed Horizontal Cooling Slots on Front Face (exact from reference image) */}
            {/* Left slots */}
            <rect x="42" y="700" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            <rect x="42" y="765" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            <rect x="42" y="830" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            <rect x="42" y="895" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            {/* Top-left corner slot */}
            <rect x="52" y="645" width="26" height="9" rx="4.5" fill="#0d244f" stroke="#487fda" strokeWidth="1" />

            {/* Right slots */}
            <rect x="426" y="700" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            <rect x="426" y="765" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            <rect x="426" y="830" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            <rect x="426" y="895" width="32" height="11" rx="5.5" fill="#0d244f" stroke="#487fda" strokeWidth="1.2" />
            {/* Top-right corner slot */}
            <rect x="422" y="645" width="26" height="9" rx="4.5" fill="#0d244f" stroke="#487fda" strokeWidth="1" />

            {/* Large Circular Bearing Flange Shield */}
            {/* Outer dark groove ring */}
            <circle cx="250" cy="820" r="150" fill="#0d244f" />
            {/* Main outer flange ring in vibrant bright royal blue */}
            <circle
              cx="250"
              cy="820"
              r="146"
              fill="url(#flange-outer-blue)"
              stroke="#0b1e42"
              strokeWidth="3.5"
            />
            {/* Inner beveled ring in deep blue */}
            <circle
              cx="250"
              cy="820"
              r="110"
              fill="url(#flange-inner-blue)"
              stroke="#163e80"
              strokeWidth="3"
            />
            {/* Inner highlight rim */}
            <circle
              cx="250"
              cy="820"
              r="107"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />

            {/* 8 Radial Embossed Tick Marks around Flange (0, 45, 90, 135, 180, 225, 270, 315 deg) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const radVal = (deg * Math.PI) / 180;
              const x1 = 250 + 116 * Math.cos(radVal);
              const y1 = 820 + 116 * Math.sin(radVal);
              const x2 = 250 + 142 * Math.cos(radVal);
              const y2 = 820 + 142 * Math.sin(radVal);
              return (
                <g key={`radial-slot-${deg}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#0d244f"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#4886e8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* 4 Round Slotted Screws with Horizontal Slot (-) */}
            {[
              { x: 250 - 62, y: 820 - 62 },
              { x: 250 + 62, y: 820 - 62 },
              { x: 250 - 62, y: 820 + 62 },
              { x: 250 + 62, y: 820 + 62 },
            ].map((pos, idx) => (
              <g key={`flange-screw-${idx}`}>
                <circle cx={pos.x} cy={pos.y} r="18" fill="#0d244f" />
                <circle cx={pos.x} cy={pos.y} r="16" fill="url(#silverNut)" stroke="#334155" strokeWidth="1.2" />
                <circle cx={pos.x} cy={pos.y} r="12" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
                {/* Horizontal screw slot */}
                <rect x={pos.x - 7.5} y={pos.y - 2} width="15" height="4" rx="1.5" fill="#1e293b" />
              </g>
            ))}

            {/* Inner Collar Ring */}
            <circle cx="250" cy="820" r="75" fill="#0d244f" />
            <circle cx="250" cy="820" r="71" fill="#163e80" stroke="#0b1e42" strokeWidth="2" />

            {/* Rotating Rotor / Turned Steel Shaft Assembly */}
            <circle
              cx="250"
              cy="820"
              r="60"
              fill="url(#shaft-turn-grad)"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Crisp white specular shine dot */}
            <circle cx="280" cy="808" r="6" fill="#ffffff" />

            {/* Central Dark Shaft Hub */}
            <circle cx="250" cy="820" r="22" fill="#475569" stroke="#1e293b" strokeWidth="2" />

            {/* Rotating Yellow Keyway Arrow / Indicator with Inner Dark Keyway Slot */}
            <g transform={`rotate(${rotationAngle}, 250, 820)`}>
              <polygon
                points="238,820 242,760 250,742 258,760 262,820"
                fill="#f59e0b"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect x="246" y="758" width="8" height="18" rx="3.5" fill="#374151" stroke="#1e293b" strokeWidth="1.2" />
            </g>

            {/* Center Cap Pin */}
            <circle cx="250" cy="820" r="9" fill="#374151" stroke="#1e293b" strokeWidth="1.5" />

            {/* OVERLAID BADGES */}
            {/* 1. Badge Fechamento Estrela / Triângulo no canto superior esquerdo da carcaça */}
            <g
              className="motor-overlay-badge-fechamento"
              transform="translate(95, 665)"
              filter="url(#box-shadow)"
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              <title>{connectionLabel}</title>
              <rect
                x="-36"
                y="-15"
                width={detectedConnection !== 'NONE' ? 144 : 72}
                height="30"
                rx="15"
                fill="#0b1329"
                stroke={
                  detectedConnection === 'DELTA'
                    ? '#f59e0b'
                    : detectedConnection === 'Y'
                    ? '#38bdf8'
                    : '#475569'
                }
                strokeWidth="2"
              />
              {detectedConnection === 'DELTA' ? (
                <>
                  <polygon
                    points="-22,-6 -14,7 -30,7"
                    stroke="#f59e0b"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    fill="rgba(245, 158, 11, 0.3)"
                  />
                  <text
                    x="38"
                    y="5"
                    fill="#f59e0b"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    textAnchor="middle"
                  >
                    Δ TRIÂNGULO
                  </text>
                </>
              ) : detectedConnection === 'Y' ? (
                <>
                  <path
                    d="M -26 -6 L -22 0 L -18 -6 M -22 0 L -22 7"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <text
                    x="38"
                    y="5"
                    fill="#38bdf8"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    textAnchor="middle"
                  >
                    Y ESTRELA
                  </text>
                </>
              ) : (
                <>
                  <line
                    x1="-20"
                    y1="0"
                    x2="-10"
                    y2="0"
                    stroke="#64748b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <text
                    x="8"
                    y="4.5"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    textAnchor="middle"
                  >
                    ABERTO
                  </text>
                </>
              )}
            </g>

            {/* 2. Badge Estático de Sentido de Rotação - No canto superior direito fora do mancal */}
            {isRunning && (
              <g
                className="motor-badge-rotacao-topright"
                transform="translate(438, 642)"
                filter="url(#box-shadow)"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                <title>{directionLabel}</title>
                <circle cx="0" cy="0" r="18" fill="#15803d" stroke="#22c55e" strokeWidth="2.5" />
                {effectiveDirection === 'CW' ? (
                  <g
                    transform="translate(-14, -14) scale(1.16)"
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
                  <g
                    transform="translate(-14, -14) scale(1.16)"
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
