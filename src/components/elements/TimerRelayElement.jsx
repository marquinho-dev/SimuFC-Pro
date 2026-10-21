import React, { useEffect, useRef, useState } from 'react';
import ContactorScrew from './ContactorScrew';
import { sounds } from '../../services/soundEffects';
import { TIMER_RANGES, TIMER_TIME_MULTIPLIERS, TIMER_MODES, TIMER_RELAY_TERMINALS } from '../../types/components';

/**
 * Realistic Industrial DIN-Rail Electronic Timer Relay
 * Exactly matching the physical reference device:
 *  - Top screws: A1, 15, 25
 *  - Red header stripe with emblem
 *  - White printed schematic: [coil] --- 15(18/16) + 25(28/26)
 *  - Rotary "Range" potentiometer (1s .. 100h) with crosshead trimmer knob
 *  - Rotary "Time" potentiometer (0.05 .. 1.0) with crosshead trimmer knob
 *  - Right-column status LEDs: U (power / timing) and R (relay output)
 *  - Bottom tiered screws: 18, 16 on upper tier; 28, 26, A2 on lower tier
 */
export default function TimerRelayElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
}) {
  const state = component.state || {};
  const mode = TIMER_MODES[state.mode] ? state.mode : 'ON_DELAY';

  // Range and Time trimmer positions
  const rangeIdx = typeof state.rangeIndex === 'number' ? Math.max(0, Math.min(TIMER_RANGES.length - 1, state.rangeIndex)) : 1;
  const activeRange = TIMER_RANGES[rangeIdx];

  const timeVal = typeof state.timeVal === 'number' ? state.timeVal : 0.5;
  const timeIdx = Math.max(0, TIMER_TIME_MULTIPLIERS.findIndex((m) => Math.abs(m.val - timeVal) < 0.01));
  const activeTimeMult = TIMER_TIME_MULTIPLIERS[timeIdx !== -1 ? timeIdx : 5];

  // Calculated delay: Range seconds * multiplier (capped sensibly for high ranges in simulator)
  const baseDelay = activeRange.seconds * activeTimeMult.val;
  // If user sets 10h/100h in simulator, allow max 120s for practical testing unless fast-forwarded
  const effectiveDelay = baseDelay > 120 ? Math.min(baseDelay, 60) : baseDelay;

  const coilPowered = Boolean(state.energized);
  const outputActive = Boolean(state.outputActive);
  const startedAt = state.timerStartedAt || null;
  const isTiming = Boolean(startedAt);

  // Sound effect when relay output trips / clicks
  const prevOutputRef = useRef(outputActive);
  useEffect(() => {
    if (prevOutputRef.current !== outputActive) {
      sounds.playContactorClick(outputActive);
      prevOutputRef.current = outputActive;
    }
  }, [outputActive]);

  // Real-time countdown tick while timing
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTiming) return undefined;
    let raf;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isTiming]);

  const elapsed = isTiming ? Math.min(effectiveDelay, Math.max(0, (now - startedAt) / 1000)) : 0;
  const remaining = Math.max(0, effectiveDelay - elapsed);

  // Cycle range dial
  const handleRangeClick = (e) => {
    e.stopPropagation();
    sounds.playSwitch();
    const nextIdx = (rangeIdx + 1) % TIMER_RANGES.length;
    const nextRange = TIMER_RANGES[nextIdx];
    const newDelay = Math.max(0.1, Math.round(nextRange.seconds * activeTimeMult.val * 10) / 10);
    onUpdateComponentState?.(component.id, {
      rangeIndex: nextIdx,
      delay: newDelay,
    });
  };

  // Cycle time multiplier dial
  const handleTimeClick = (e) => {
    e.stopPropagation();
    sounds.playSwitch();
    const nextIdx = (timeIdx + 1) % TIMER_TIME_MULTIPLIERS.length;
    const nextMult = TIMER_TIME_MULTIPLIERS[nextIdx];
    const newDelay = Math.max(0.1, Math.round(activeRange.seconds * nextMult.val * 10) / 10);
    onUpdateComponentState?.(component.id, {
      timeVal: nextMult.val,
      delay: newDelay,
    });
  };

  const renderScrew = (id, labelPos) => {
    const config = TIMER_RELAY_TERMINALS[id];
    if (!config) return null;
    const t = component.terminals?.find((term) => term.id === id) || config;
    // Always enforce the exact coordinates on the screw head
    const terminalWithCoords = { ...t, x: config.x, y: config.y };
    const volt = terminalVoltages.get(`${component.id}:${id}`);
    const isSelected =
      activeTerminal?.componentId === component.id && activeTerminal?.terminalId === id;

    return (
      <ContactorScrew
        key={id}
        componentId={component.id}
        terminal={terminalWithCoords}
        voltage={volt}
        isSelected={isSelected}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        labelPosition={labelPos || 'none'}
        labelColor="default"
        isLarge={false}
      />
    );
  };

  const displayTime = isTiming
    ? `${remaining.toFixed(1)}s`
    : `${activeRange.label} × ${activeTimeMult.label} = ${effectiveDelay}s`;

  return (
    <div
      className={`industrial-device timer-relay-device-realistic ${coilPowered ? 'coil-on' : ''} ${
        outputActive ? 'output-on' : ''
      }`}
      title={`Relé Temporizador KT1 • T = ${displayTime}`}
    >
      {/* ==========================================================
          TOP SECTION: 3 TERMINALS (A1, 15, 25)
          ========================================================== */}
      <div className="timer-top-tier">
        <span className="timer-tier-label" style={{ left: '26px' }}>A1</span>
        <span className="timer-tier-label" style={{ left: '60px' }}>15</span>
        <span className="timer-tier-label" style={{ left: '94px' }}>25</span>
      </div>

      <div className="timer-casing-seam" />

      {/* ==========================================================
          CENTRAL HOUSING & FACEPLATE
          ========================================================== */}
      <div className="timer-main-chassis">
        {/* Red Brand Banner with emblem */}
        <div className="timer-red-banner">
          <div className="timer-emblem-badge" title="Relé Eletrônico Industrial">
            <svg viewBox="0 0 16 16" width="12" height="12">
              <rect x="2" y="2" width="12" height="12" rx="1.5" fill="#ffffff" />
              <path d="M 8 3 L 5 9 L 8 9 L 7 13 L 11 7 L 8 7 Z" fill="#059669" />
            </svg>
          </div>
          <div className="timer-banner-stripe" />
        </div>
        <div className="timer-banner-rule" />

        {/* Printed Circuit Diagram */}
        <div className="timer-schematic-box">
          {/* Left: Timing Relay Coil Symbol IEC [ ⧄ ] */}
          <div className="timer-sym-coil" title="Símbolo IEC de Relé Temporizado (Retardo na Energização)">
            <svg viewBox="0 0 32 18" width="28" height="16">
              <rect x="1" y="1" width="30" height="16" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
              <line x1="1" y1="1" x2="31" y2="17" stroke="#e2e8f0" strokeWidth="1.2" />
              <line x1="1" y1="17" x2="31" y2="1" stroke="#e2e8f0" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Right: Dual Contact Diagram (A1/A2, 15-18/16, 25-28/26) */}
          <div className="timer-sym-contacts">
            <svg viewBox="0 0 68 36" width="62" height="32">
              {/* Coil terminals A1/A2 */}
              <text x="6" y="7" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">A1</text>
              <line x1="6" y1="8" x2="6" y2="11" stroke="#cbd5e1" strokeWidth="0.8" />
              <rect x="3" y="11" width="6" height="14" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
              <line x1="6" y1="25" x2="6" y2="28" stroke="#cbd5e1" strokeWidth="0.8" />
              <text x="6" y="34" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">A2</text>

              {/* Dashed mechanical link line */}
              <line x1="9" y1="18" x2="60" y2="18" stroke="#94a3b8" strokeWidth="0.7" strokeDasharray="1.5 1.5" />

              {/* Contact 1: 15 (top) -> 18 (NO) / 16 (NC) */}
              <text x="27" y="7" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">15</text>
              <circle cx="27" cy="9" r="1" fill="#cbd5e1" />
              {/* Switch arm resting at 16 (NC) */}
              <line x1="27" y1="9" x2={outputActive ? 21 : 33} y2="25" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="21" cy="26" r="1" fill="#cbd5e1" />
              <circle cx="33" cy="26" r="1" fill="#cbd5e1" />
              <text x="21" y="34" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">18</text>
              <text x="33" y="34" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">16</text>

              {/* Contact 2: 25 (top) -> 28 (NO) / 26 (NC) */}
              <text x="51" y="7" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">25</text>
              <circle cx="51" cy="9" r="1" fill="#cbd5e1" />
              {/* Switch arm resting at 26 (NC) */}
              <line x1="51" y1="9" x2={outputActive ? 45 : 57} y2="25" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="45" cy="26" r="1" fill="#cbd5e1" />
              <circle cx="57" cy="26" r="1" fill="#cbd5e1" />
              <text x="45" y="34" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">28</text>
              <text x="57" y="34" fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" textAnchor="middle">26</text>
            </svg>
          </div>
        </div>

        {/* Middle Area: Trimmers & Status LEDs */}
        <div className="timer-controls-area">
          {/* Left Column: Two rotary trimmer potentiometers */}
          <div className="timer-trimmers-column">
            {/* Trimmer 1: Range */}
            <div className="timer-pot-block" onClick={handleRangeClick} title="Clique para alterar a escala de tempo (Range)">
              <div className="timer-pot-header">
                <span className="timer-pot-title">Range</span>
              </div>
              <div className="timer-pot-dial-wrap">
                {/* Scale labels around dial */}
                <span className="dial-val dial-range-1s">1s</span>
                <span className="dial-val dial-range-10s">10s</span>
                <span className="dial-val dial-range-100s">100s</span>
                <span className="dial-val dial-range-10m">10m</span>
                <span className="dial-val dial-range-100m">100m</span>
                <span className="dial-val dial-range-10h">10h</span>
                <span className="dial-val dial-range-100h">100h</span>

                {/* Rotary Trimmer Knob */}
                <div
                  className="timer-trimmer-knob"
                  style={{ transform: `rotate(${activeRange.angle}deg)` }}
                >
                  <div className="trimmer-cross-slot-h" />
                  <div className="trimmer-cross-slot-v" />
                  <div className="trimmer-notch-pointer" />
                </div>
              </div>
            </div>

            {/* Trimmer 2: Time multiplier (0.05 .. 1.0) */}
            <div className="timer-pot-block" onClick={handleTimeClick} title="Clique para ajustar o multiplicador fino de tempo (Time)">
              <div className="timer-pot-header">
                <span className="timer-pot-title">Time</span>
              </div>
              <div className="timer-pot-dial-wrap">
                {/* Scale values */}
                <span className="dial-val dial-time-005">0.05</span>
                <span className="dial-val dial-time-01">0.1</span>
                <span className="dial-val dial-time-02">0.2</span>
                <span className="dial-val dial-time-03">0.3</span>
                <span className="dial-val dial-time-04">0.4</span>
                <span className="dial-val dial-time-05">0.5</span>
                <span className="dial-val dial-time-06">0.6</span>
                <span className="dial-val dial-time-07">0.7</span>
                <span className="dial-val dial-time-08">0.8</span>
                <span className="dial-val dial-time-09">0.9</span>
                <span className="dial-val dial-time-1">1</span>

                {/* Rotary Trimmer Knob */}
                <div
                  className="timer-trimmer-knob"
                  style={{ transform: `rotate(${activeTimeMult.angle}deg)` }}
                >
                  <div className="trimmer-cross-slot-h" />
                  <div className="trimmer-cross-slot-v" />
                  <div className="trimmer-notch-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status LEDs (U and R) */}
          <div className="timer-leds-column">
            {/* Top decorative bezel */}
            <div className="timer-led-slot top-slot" />

            {/* Label U */}
            <span className="timer-indicator-text">U</span>

            {/* Middle LED slot: U (Green power/timing LED) */}
            <div className="timer-led-slot mid-slot" title={coilPowered ? (isTiming ? 'Temporizando...' : 'Bobina Energizada') : 'Desenergizado'}>
              <div className={`timer-real-led green-led ${coilPowered ? 'active' : ''} ${isTiming ? 'flashing' : ''}`} />
            </div>

            {/* Label R */}
            <span className="timer-indicator-text">R</span>

            {/* Bottom LED slot: R (Yellow/Amber contact output LED) */}
            <div className="timer-led-slot bot-slot" title={outputActive ? 'Contatos Comutados (15-18 / 25-28 fechados)' : 'Contatos em Repouso'}>
              <div className={`timer-real-led yellow-led ${outputActive ? 'active' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="timer-casing-seam" />

      {/* ==========================================================
          BOTTOM SECTION: 2 TIERS (Upper: 18, 16; Lower: 28, 26, A2)
          ========================================================== */}
      <div className="timer-bottom-tiers-container">
        {/* Upper Tier (y = 264): Screws 18 (NO), 16 (NC), and blank cover */}
        <div className="timer-bottom-tier upper">
          <span className="timer-tier-label bot-label" style={{ left: '26px' }}>18</span>
          <span className="timer-tier-label bot-label" style={{ left: '60px' }}>16</span>
          <div className="timer-blank-cap" style={{ left: '94px' }} title="Posição sem borne (tampa cega moldada)" />
        </div>

        {/* Lower Tier (y = 318): Screws 28 (NO), 26 (NC), A2 (Coil return) */}
        <div className="timer-bottom-tier lower">
          <span className="timer-tier-label bot-label" style={{ left: '26px' }}>28</span>
          <span className="timer-tier-label bot-label" style={{ left: '60px' }}>26</span>
          <span className="timer-tier-label bot-label" style={{ left: '94px' }}>A2</span>
        </div>
      </div>

      {/* ==========================================================
          FLOATING ACCURATE SCREWS LAYER
          All 8 screws placed at exact absolute pixel coordinates:
          (terminal.x, terminal.y) relative to the component body.
          ========================================================== */}
      <div className="timer-screws-layer">
        {renderScrew('A1', 'none')}
        {renderScrew('15', 'none')}
        {renderScrew('25', 'none')}
        {renderScrew('18', 'none')}
        {renderScrew('16', 'none')}
        {renderScrew('28', 'none')}
        {renderScrew('26', 'none')}
        {renderScrew('A2', 'none')}
      </div>
    </div>
  );
}
