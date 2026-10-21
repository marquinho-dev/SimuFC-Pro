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
          voltage === 'N' ? '#06b6d4' :
            voltage === 'PE' ? '#10b981' : '#38bdf8';

  return (
    <g
      className={`motor-svg-terminal-group ${isPE ? 'terminal-pe' : ''} ${isSelected ? 'selected' : ''
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
  onUpdateComponentState,
  wires = [],
}) {
  const isRunning = Boolean(component.state?.running);
  const direction = component.state?.direction || 'CW';
  const phaseError = component.state?.phaseError;
  const rotorState = component.state?.rotorState || 'STOPPED';
  const isStalled = rotorState === 'STALLED_HUM';
  const isBiphasic = rotorState === 'BIPHASIC_RUN';

  // Configurações e Controles demonstrados no motor_ac_painel_v2_demo.html
  const [targetRotorSetting, setTargetRotorSetting] = useState(
    component.state?.targetRotorSetting ?? 1672
  );
  const [lentoSetting, setLentoSetting] = useState(
    component.state?.lentoSetting ?? 60
  );
  const [currentRpm, setCurrentRpm] = useState(0);

  const targetRotorSettingRef = useRef(targetRotorSetting);
  const lentoSettingRef = useRef(lentoSetting);
  const rotorDomRef = useRef(null);

  const rotorAngleRef = useRef(0);
  const rpmRef = useRef(0);
  const lastActiveDirectionRef = useRef(direction);

  if (isRunning && direction) {
    lastActiveDirectionRef.current = direction;
  }

  const effectiveDirection = isRunning ? direction : (lastActiveDirectionRef.current || 'CW');

  const handleRotorChange = (val) => {
    setTargetRotorSetting(val);
    targetRotorSettingRef.current = val;
    onUpdateComponentState?.(component.id, { targetRotorSetting: val });
  };

  const handleLentoChange = (val) => {
    setLentoSetting(val);
    lentoSettingRef.current = val;
    onUpdateComponentState?.(component.id, { lentoSetting: val });
  };

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

  const directionLabel =
    !isRunning
      ? 'PARADO'
      : effectiveDirection === 'CW'
        ? 'HORÁRIO (CW ↻)'
        : 'ANTI-HOR. (CCW ↺)';

  const calculatedSlip = (((1800 - targetRotorSetting) / 1800) * 100).toFixed(1);
  const rotorPct = Math.max(0, Math.min(100, (targetRotorSetting / 1800) * 100));
  const lentoPct = Math.max(0, Math.min(100, ((lentoSetting - 1) / (200 - 1)) * 100));

  // Rotational physics animation loop (conforme motor_ac_painel_v2_demo.html com inércia e câmera lenta)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    let lastUiUpdate = performance.now();
    const nSinc = 1800; // 4 polos, 60 Hz

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const targetRpm = isRunning ? targetRotorSettingRef.current : 0;
      const rate = isRunning ? 1600 : 800; // Aceleração / desaceleração suave realista

      if (rpmRef.current < targetRpm) {
        rpmRef.current = Math.min(targetRpm, rpmRef.current + rate * dt);
      } else if (rpmRef.current > targetRpm) {
        rpmRef.current = Math.max(0, rpmRef.current - rate * dt);
      }

      const activeDir = isRunning ? direction : lastActiveDirectionRef.current;
      const speedMult = activeDir === 'CW' ? 1 : -1;
      const lento = Math.max(1, lentoSettingRef.current);

      // Rotação mecânica do eixo único do rotor (graus por segundo = rpm * 6 / lento)
      const degPerSecRotor = (rpmRef.current * 6) / lento;
      const newRotorAngle = (rotorAngleRef.current + speedMult * degPerSecRotor * dt) % 360;
      rotorAngleRef.current = newRotorAngle < 0 ? newRotorAngle + 360 : newRotorAngle;

      // Atualização direta do DOM via ref do rotor (único eixo girante)
      if (rotorDomRef.current) {
        rotorDomRef.current.setAttribute('transform', `rotate(${rotorAngleRef.current} 200 200)`);
      }

      // Atualiza o display numérico de RPM a cada 100ms
      if (now - lastUiUpdate > 100) {
        lastUiUpdate = now;
        setCurrentRpm(Math.round(rpmRef.current));
      }

      try {
        sounds.updateMotorHum(rpmRef.current, isRunning, isStalled);
      } catch { }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, direction, isStalled]);

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
      className={`motor-frontal-device ${isRunning ? 'running' : ''
        } ${isStalled || isBiphasic ? 'vibrating-fault' : phaseError ? 'fault-warn' : ''}`}
    >
      {/* Main Motor Viewport: Caixa de Ligação superior + Motor Painel v2 inferior */}
      <div className="motor-chassis-stage">
        <svg
          className="motor-svg-casing"
          viewBox="0 0 500 1060"
          width="500"
          height="1060"
        >
          <defs>
            {/* ========================================================
                GRADIENTES E RECURSOS DO MOTOR VERSÃO 2 (motor_ac_painel_v2.svg)
                ======================================================== */}
            {/* Azul profundo e vibrante do painel e da caixa */}
            <linearGradient id="azul" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a8cf2" />
              <stop offset="35%" stopColor="#2a63cf" />
              <stop offset="70%" stopColor="#1b48ac" />
              <stop offset="100%" stopColor="#0f2c78" />
            </linearGradient>

            <radialGradient id="vinheta" cx="0.5" cy="0.45" r="0.75">
              <stop offset="55%" stopColor="#04112e" stopOpacity="0" />
              <stop offset="100%" stopColor="#04112e" stopOpacity="0.55" />
            </radialGradient>

            <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.14" />
            </linearGradient>

            <linearGradient id="borda" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d6e6ff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#d6e6ff" stopOpacity="0" />
              <stop offset="100%" stopColor="#05102b" stopOpacity="0.6" />
            </linearGradient>

            {/* Aro cromado e mostrador */}
            <linearGradient id="cromo" x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor="#f2f7ff" />
              <stop offset="30%" stopColor="#8fa6d0" />
              <stop offset="55%" stopColor="#243865" />
              <stop offset="80%" stopColor="#7e96c6" />
              <stop offset="100%" stopColor="#dfeaff" />
            </linearGradient>

            <linearGradient id="bisel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#081646" />
              <stop offset="100%" stopColor="#3d62b8" />
            </linearGradient>

            <radialGradient id="anel" cx="0.5" cy="0.5" r="0.5">
              <stop offset="60%" stopColor="#2d60c8" />
              <stop offset="100%" stopColor="#1a4096" />
            </radialGradient>

            <linearGradient id="recesso" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#020a1f" />
              <stop offset="100%" stopColor="#6089dc" />
            </linearGradient>

            <radialGradient id="prata" cx="0.38" cy="0.32" r="0.7">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#b8c2d3" />
              <stop offset="100%" stopColor="#6b788f" />
            </radialGradient>

            <linearGradient id="vidroGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Estator e bobinas */}
            <linearGradient id="aco" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6a7fa8" />
              <stop offset="100%" stopColor="#34466b" />
            </linearGradient>

            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8f8a" />
              <stop offset="100%" stopColor="#c93a36" />
            </linearGradient>

            <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93ccff" />
              <stop offset="100%" stopColor="#2f7fe0" />
            </linearGradient>

            <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffdb63" />
              <stop offset="100%" stopColor="#d19a00" />
            </linearGradient>

            {/* Pés da carcaça */}
            <linearGradient id="azulPe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f66d4" />
              <stop offset="100%" stopColor="#10307f" />
            </linearGradient>

            <path id="pePath" d="M44 318 V364 Q44 376 56 376 H128 Q140 376 140 364 V318 Z" />

            <g id="pe">
              <use href="#pePath" fill="url(#azulPe)" stroke="#06112e" strokeWidth="2" />
              <path d="M47 334 V364" fill="none" stroke="#8fb8ff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
              <rect x="64" y="352" width="56" height="8" rx="4" fill="#04102c" />
              <rect x="66" y="361.5" width="52" height="1.5" rx="0.75" fill="#7fb2ff" fillOpacity="0.35" />
            </g>

            <rect id="bobina" x="178" y="42" width="44" height="34" rx="6" />
            <rect id="barra" x="196" y="90" width="8" height="18" rx="2" />
            <circle id="mais" cx="200" cy="59" r="4.5" fill="#ffffff" />
            <path id="menos" d="M196 55 L204 63 M204 55 L196 63" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
            <line id="tl" x1="200" y1="55" x2="200" y2="71" stroke="#0b1c42" strokeWidth="3" strokeLinecap="round" />
            <line id="tk" x1="200" y1="55" x2="200" y2="64" stroke="#0b1c42" strokeWidth="2" strokeLinecap="round" />

            <g id="parafuso">
              <circle r="9" fill="url(#prata)" stroke="#06112e" strokeWidth="1.5" />
              <circle r="6.8" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.8" />
              <path d="M-5 1.2H5" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
              <path d="M-5 0H5" stroke="#3f4d69" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            <clipPath id="vidro">
              <circle cx="200" cy="180" r="100" />
            </clipPath>

            {/* ========================================================
                GRADIENTES DA CAIXA DE LIGAÇÃO (HARMONIZADOS COM O MOTOR)
                ======================================================== */}
            <linearGradient id="blueBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a8cf2" />
              <stop offset="35%" stopColor="#2a63cf" />
              <stop offset="70%" stopColor="#1b48ac" />
              <stop offset="100%" stopColor="#0f2c78" />
            </linearGradient>

            <linearGradient id="innerBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1b48ac" />
              <stop offset="50%" stopColor="#10307f" />
              <stop offset="100%" stopColor="#07122e" />
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

            {/* Outer Box Screw harmonizado */}
            <g id="gemini-box-screw">
              <circle r="12" fill="#1b48ac" stroke="#07122e" strokeWidth="1.5" />
              <circle r="6" fill="#07122e" />
            </g>

            <filter id="box-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>

            <filter id="sombra" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* ========================================================
              TOP SECTION: TERMINAL BOX (CAIXA DE LIGAÇÃO INDUSTRIAL)
              Fiel ao gemini-svg.svg com as cores exatas do novo motor
              ======================================================== */}
          <g className="motor-terminal-box-group" filter="url(#box-shadow)">
            {/* Outer Blue Enclosure na mesma cor azul rica do motor */}
            <rect x="10" y="30" width="480" height="560" rx="25" fill="url(#blueBoxGrad)" stroke="#07122e" strokeWidth="3" />
            <rect x="30" y="50" width="440" height="520" rx="20" fill="url(#blueBoxGrad)" />

            {/* Outer Box Corner Screws */}
            <use href="#gemini-box-screw" x="35" y="55" />
            <use href="#gemini-box-screw" x="465" y="55" />
            <use href="#gemini-box-screw" x="35" y="565" />
            <use href="#gemini-box-screw" x="465" y="565" />

            {/* Inner Blue Rim Cutout */}
            <rect x="45" y="65" width="410" height="490" rx="15" fill="url(#innerBlueGrad)" stroke="#05102b" strokeWidth="2" />

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
              BOTTOM SECTION: NOVO MOTOR PAINEL VERSÃO 2
              Fiel ao motor_ac_painel_v2.svg com animação de campo e rotor
              ======================================================== */}
          <g className="motor-v2-frontal-panel" transform="translate(20, 615) scale(1.15)">
            {/* Pés da carcaça (atrás do painel) */}
            <ellipse cx="200" cy="382" rx="170" ry="5" fill="#000000" opacity="0.28" />
            <use href="#pe" />
            <use href="#pe" transform="translate(216 0)" />

            {/* Painel azul brilhante */}
            <rect x="20" y="14" width="360" height="332" rx="40" fill="#07122e" filter="url(#sombra)" />
            <rect x="23" y="17" width="354" height="326" rx="37" fill="url(#azul)" />
            <rect x="23" y="17" width="354" height="326" rx="37" fill="url(#vinheta)" />
            <path d="M33 72 Q33 25 80 25 H320 Q367 25 367 72 Q367 120 200 120 Q33 120 33 72 Z" fill="url(#gloss)" />
            <path d="M50 337 Q200 347 350 337" fill="none" stroke="#7fb2ff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
            <rect x="23" y="17" width="354" height="326" rx="37" fill="none" stroke="url(#borda)" strokeWidth="2" />

            {/* Ranhuras laterais com realce */}
            <g>
              <g fill="#0b1b45" opacity="0.9">
                <rect x="38" y="57" width="20" height="6" rx="3" />
                <rect x="38" y="117" width="20" height="6" rx="3" />
                <rect x="38" y="177" width="20" height="6" rx="3" />
                <rect x="38" y="237" width="20" height="6" rx="3" />
                <rect x="38" y="297" width="20" height="6" rx="3" />
                <rect x="342" y="57" width="20" height="6" rx="3" />
                <rect x="342" y="117" width="20" height="6" rx="3" />
                <rect x="342" y="177" width="20" height="6" rx="3" />
                <rect x="342" y="237" width="20" height="6" rx="3" />
                <rect x="342" y="297" width="20" height="6" rx="3" />
              </g>
              <g fill="#7fb2ff" opacity="0.35">
                <rect x="40" y="63.5" width="16" height="1.4" rx="0.7" />
                <rect x="40" y="123.5" width="16" height="1.4" rx="0.7" />
                <rect x="40" y="183.5" width="16" height="1.4" rx="0.7" />
                <rect x="40" y="243.5" width="16" height="1.4" rx="0.7" />
                <rect x="40" y="303.5" width="16" height="1.4" rx="0.7" />
                <rect x="344" y="63.5" width="16" height="1.4" rx="0.7" />
                <rect x="344" y="123.5" width="16" height="1.4" rx="0.7" />
                <rect x="344" y="183.5" width="16" height="1.4" rx="0.7" />
                <rect x="344" y="243.5" width="16" height="1.4" rx="0.7" />
                <rect x="344" y="303.5" width="16" height="1.4" rx="0.7" />
              </g>
            </g>

            {/* Aro cromado, bisel e placa com marcas */}
            <circle cx="200" cy="180" r="138" fill="#06112e" />
            <circle cx="200" cy="180" r="136" fill="url(#cromo)" />
            <circle cx="200" cy="180" r="130" fill="url(#bisel)" />
            <circle cx="200" cy="180" r="127" fill="url(#anel)" />
            <g>
              <use href="#tl" transform="rotate(0 200 180)" />
              <use href="#tl" transform="rotate(90 200 180)" />
              <use href="#tl" transform="rotate(180 200 180)" />
              <use href="#tl" transform="rotate(270 200 180)" />
              <use href="#tk" transform="rotate(15 200 180)" />
              <use href="#tk" transform="rotate(30 200 180)" />
              <use href="#tk" transform="rotate(60 200 180)" />
              <use href="#tk" transform="rotate(75 200 180)" />
              <use href="#tk" transform="rotate(105 200 180)" />
              <use href="#tk" transform="rotate(120 200 180)" />
              <use href="#tk" transform="rotate(150 200 180)" />
              <use href="#tk" transform="rotate(165 200 180)" />
              <use href="#tk" transform="rotate(195 200 180)" />
              <use href="#tk" transform="rotate(210 200 180)" />
              <use href="#tk" transform="rotate(240 200 180)" />
              <use href="#tk" transform="rotate(255 200 180)" />
              <use href="#tk" transform="rotate(285 200 180)" />
              <use href="#tk" transform="rotate(300 200 180)" />
              <use href="#tk" transform="rotate(330 200 180)" />
              <use href="#tk" transform="rotate(345 200 180)" />
            </g>

            {/* Parafusos nas diagonais, cada um com a fenda num ângulo */}
            <use href="#parafuso" transform="translate(118 98) rotate(25)" />
            <use href="#parafuso" transform="translate(282 98) rotate(-15)" />
            <use href="#parafuso" transform="translate(118 262) rotate(70)" />
            <use href="#parafuso" transform="translate(282 262) rotate(-50)" />

            {/* Recesso do mostrador */}
            <circle cx="200" cy="180" r="104" fill="url(#recesso)" />
            <circle cx="200" cy="180" r="102" fill="#0b1c42" />

            {/* Núcleo do motor: Estator, Bobinas, Campo Girante e Rotor */}
            <g transform="translate(200 180) scale(0.59) translate(-200 -200)">
              {/* Estator laminado */}
              <circle id="estator" cx="200" cy="200" r="142" fill="none" stroke="url(#aco)" strokeWidth="46" />
              <circle cx="200" cy="200" r="164" fill="none" stroke="#9fb4dc" strokeOpacity="0.35" strokeWidth="2" />

              {/* 6 Bobinas das 3 Fases (Vermelho, Amarelo, Azul) */}
              <g id="bobinas" stroke="#101a33" strokeWidth="1.5">
                <use href="#bobina" fill="url(#gA)" transform="rotate(0 200 200)" />
                <use href="#bobina" fill="url(#gC)" transform="rotate(60 200 200)" />
                <use href="#bobina" fill="url(#gB)" transform="rotate(120 200 200)" />
                <use href="#bobina" fill="url(#gA)" transform="rotate(180 200 200)" />
                <use href="#bobina" fill="url(#gC)" transform="rotate(240 200 200)" />
                <use href="#bobina" fill="url(#gB)" transform="rotate(300 200 200)" />
              </g>

              {/* Polaridades (+ / -) nas bobinas */}
              <use href="#mais" transform="rotate(0 200 200)" />
              <use href="#menos" transform="rotate(60 200 200)" />
              <use href="#mais" transform="rotate(120 200 200)" />
              <use href="#menos" transform="rotate(180 200 200)" />
              <use href="#mais" transform="rotate(240 200 200)" />
              <use href="#menos" transform="rotate(300 200 200)" />

              {/* Cavidade do entreferro */}
              <circle cx="200" cy="200" r="119" fill="#0a1530" />

              {/* Rotor com gaiola de esquilo e barra amarela de referência (gira em torno de 200, 200) */}
              <g ref={rotorDomRef} id="motor-v2-rotor" transform={`rotate(${rotorAngleRef.current} 200 200)`}>
                <circle cx="200" cy="200" r="112" fill="#9aa3b0" />
                <circle cx="200" cy="200" r="60" fill="#7c8593" />
                <g fill="#c8824a" stroke="#6b3f1d" strokeWidth="1">
                  <use href="#barra" transform="rotate(22.5 200 200)" />
                  <use href="#barra" transform="rotate(45 200 200)" />
                  <use href="#barra" transform="rotate(67.5 200 200)" />
                  <use href="#barra" transform="rotate(90 200 200)" />
                  <use href="#barra" transform="rotate(112.5 200 200)" />
                  <use href="#barra" transform="rotate(135 200 200)" />
                  <use href="#barra" transform="rotate(157.5 200 200)" />
                  <use href="#barra" transform="rotate(180 200 200)" />
                  <use href="#barra" transform="rotate(202.5 200 200)" />
                  <use href="#barra" transform="rotate(225 200 200)" />
                  <use href="#barra" transform="rotate(247.5 200 200)" />
                  <use href="#barra" transform="rotate(270 200 200)" />
                  <use href="#barra" transform="rotate(292.5 200 200)" />
                  <use href="#barra" transform="rotate(315 200 200)" />
                  <use href="#barra" transform="rotate(337.5 200 200)" />
                </g>
                {/* Barra de referência amarela para enxergar com clareza a rotação */}
                <use href="#barra" fill="#ffd36b" stroke="#6b3f1d" strokeWidth="1" />
                <circle cx="200" cy="200" r="34" fill="#4a5260" />
                <circle cx="200" cy="200" r="16" fill="#cfd5de" />
                <rect x="197" y="178" width="6" height="10" fill="#2b303a" />
              </g>
            </g>

            {/* Vidro do mostrador: reflexo no topo e luz fraca embaixo */}
            <g clipPath="url(#vidro)">
              <path d="M121.4 124.9 A96 96 0 0 1 278.6 124.9 Q200 100 121.4 124.9 Z" fill="url(#vidroGrad)" />
              <path d="M146.1 257 A94 94 0 0 0 253.9 257" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="200" cy="180" r="102" fill="none" stroke="#06112e" strokeWidth="3" />

            {/* ========================================================
                INDICAÇÕES INTERATIVAS NO PAINEL DO MOTOR
                ======================================================== */}
            {/* 1. Ícone Estrela / Triângulo na parte inferior esquerda APENAS quando o motor ligar e estiver girando */}
            {isRunning && (detectedConnection === 'DELTA' || detectedConnection === 'Y') && (
              <g
                className="motor-overlay-badge-fechamento"
                transform="translate(68, 305)"
                filter="url(#box-shadow)"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                <title>{detectedConnection === 'DELTA' ? 'Operando em Δ Triângulo (220V)' : 'Operando em Y Estrela (380V)'}</title>
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill="#0b1329"
                  stroke={detectedConnection === 'DELTA' ? '#f59e0b' : '#38bdf8'}
                  strokeWidth="2.5"
                  style={{
                    filter:
                      detectedConnection === 'DELTA'
                        ? 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.75))'
                        : 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.75))',
                  }}
                />
                {detectedConnection === 'DELTA' ? (
                  <polygon
                    points="0,-11 12,9 -12,9"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    fill="rgba(245, 158, 11, 0.28)"
                  />
                ) : (
                  <path
                    d="M -8 -10 L 0 0 L 8 -10 M 0 0 L 0 11"
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </g>
            )}
          </g>

          {/* ========================================================
              INDICAÇÃO DE ROTAÇÃO NO CANTO SUPERIOR DIREITO FORA DA PEÇA
              ======================================================== */}
          {isRunning && (
            <g
              className="motor-badge-rotacao-topright"
              transform="translate(442, 638)"
              filter="url(#box-shadow)"
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            >
              <title>{directionLabel}</title>
              <circle
                cx="0"
                cy="0"
                r="22"
                fill="#0b1329"
                stroke="#22c55e"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.75))' }}
              />
              <circle cx="0" cy="0" r="17" fill="#15803d" />
              {effectiveDirection === 'CW' ? (
                <g
                  transform="translate(-13, -13) scale(1.08)"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </g>
              ) : (
                <g
                  transform="translate(-13, -13) scale(1.08)"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* ========================================================
          PAINEL DE CONTROLES ORGANIZADO CONFORME A IMAGEM / DEMO
          ======================================================== */}
      <div
        className="motor-controls-panel flex flex-col items-center select-none w-full"
        style={{
          marginTop: '14px',
          gap: '8px',
          pointerEvents: 'auto',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '8px 12px',
            alignItems: 'center',
            width: '100%',
            fontSize: '14px',
            color: '#e6e9ef',
          }}
        >
          <label htmlFor={`nRotor-${component.id}`} style={{ cursor: 'pointer', color: '#e6e9ef', fontWeight: 400 }}>
            Rotor
          </label>
          <input
            id={`nRotor-${component.id}`}
            type="range"
            min="0"
            max="1800"
            step="1"
            value={targetRotorSetting}
            onChange={(e) => handleRotorChange(Number(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#1d6ff2',
              background: `linear-gradient(to right, #1d6ff2 0%, #1d6ff2 ${rotorPct}%, #e2e8f0 ${rotorPct}%, #e2e8f0 100%)`,
            }}
          />
          <output
            style={{
              minWidth: '80px',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              color: '#e6e9ef',
              fontWeight: 400,
            }}
          >
            {targetRotorSetting} rpm
          </output>

          <label
            htmlFor={`lento-${component.id}`}
            style={{ cursor: 'pointer', color: '#e6e9ef', whiteSpace: 'nowrap', fontWeight: 400 }}
          >
            Câmera lenta
          </label>
          <input
            id={`lento-${component.id}`}
            type="range"
            min="1"
            max="200"
            step="1"
            value={lentoSetting}
            onChange={(e) => handleLentoChange(Number(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#1d6ff2',
              background: `linear-gradient(to right, #1d6ff2 0%, #1d6ff2 ${lentoPct}%, #e2e8f0 ${lentoPct}%, #e2e8f0 100%)`,
            }}
          />
          <output
            style={{
              minWidth: '80px',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              color: '#e6e9ef',
              fontWeight: 400,
            }}
          >
            1/{lentoSetting}
          </output>
        </div>

        <div style={{ fontSize: '14px', color: '#aab2c0', textAlign: 'center', marginTop: '4px' }}>
          Campo: 1800 rpm | escorregamento: {calculatedSlip} %
        </div>
      </div>
    </div>
  );
}
