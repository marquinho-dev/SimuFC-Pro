import React, { useEffect, useRef } from 'react';
import ContactorScrew from './ContactorScrew';
import { sounds } from '../../services/soundEffects';

export default function ContactorElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
}) {
  const isEnergized = Boolean(component.state.energized);
  const prevEnergizedRef = useRef(isEnergized);

  useEffect(() => {
    if (prevEnergizedRef.current !== isEnergized) {
      sounds.playContactorClick(isEnergized);
      prevEnergizedRef.current = isEnergized;
    }
  }, [isEnergized]);

  const findTerminal = (id) => component.terminals.find((t) => t.id === id);

  const t1 = findTerminal('1');
  const t3 = findTerminal('3');
  const t5 = findTerminal('5');

  const t13 = findTerminal('13');
  const t21 = findTerminal('21');
  const tA1 = findTerminal('A1');

  const t14 = findTerminal('14');
  const t22 = findTerminal('22');
  const tA2 = findTerminal('A2');

  const t2 = findTerminal('2');
  const t4 = findTerminal('4');
  const t6 = findTerminal('6');

  const renderScrew = (t, labelPos, labelColor, isLarge) => {
    if (!t) return null;
    const vKey = `${component.id}:${t.id}`;
    const volt = terminalVoltages.get(vKey);
    const isSelected =
      activeTerminal?.componentId === component.id &&
      activeTerminal?.terminalId === t.id;

    return (
      <ContactorScrew
        key={t.id}
        componentId={component.id}
        terminal={t}
        voltage={volt}
        isSelected={isSelected}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        labelPosition={labelPos}
        labelColor={labelColor}
        isLarge={isLarge}
      />
    );
  };

  return (
    <div
      className={`industrial-device contactor-realistic-plate ${
        isEnergized ? 'energized' : ''
      }`}
    >
      {/* Top terminal block notches */}
      <div className="contactor-top-notches">
        <div className="notch"></div>
        <div className="notch"></div>
        <div className="notch"></div>
      </div>

      {/* Row 1: Top Power Screws (1/L1, 3/L2, 5/L3) */}
      <div className="contactor-screws-layer">
        {renderScrew(t1, 'bottom', 'default', true)}
        {renderScrew(t3, 'bottom', 'default', true)}
        {renderScrew(t5, 'bottom', 'default', true)}
      </div>

      <div className="contactor-divider-bar top-divider"></div>


      {/* Row 2: Upper Auxiliary Screws (13 NO, 21 NC, A1) */}
      <div className="contactor-screws-layer">
        {renderScrew(t13, 'left', 'no', false)}
        {renderScrew(t21, 'left', 'nc', false)}
        {renderScrew(tA1, 'left', 'default', false)}
      </div>

      {/* Center Zone: Plunger Window & Coil Spec */}
      <div className="contactor-center-mechanism">
        <div className="coil-spec-badge">
          <span className="coil-voltage">220V AC</span>
        </div>

        {/* Center Plunger Mechanism matching reference industrial design */}
        <div className="plunger-bracket-container">
          <div className="plunger-bracket-left"></div>
          <div className="plunger-window-core">
            <div className="window-chamber">
              <div
                className={`plunger-indicator-slug ${
                  isEnergized ? 'slug-pulled' : 'slug-released'
                }`}
              ></div>
            </div>
          </div>
          <div className="plunger-bracket-right"></div>
        </div>
      </div>

      {/* Row 3: Lower Auxiliary Screws (14 NO, 22 NC, A2) */}
      <div className="contactor-screws-layer">
        {renderScrew(t14, 'left', 'no', false)}
        {renderScrew(t22, 'left', 'nc', false)}
        {renderScrew(tA2, 'left', 'default', false)}
      </div>

      <div className="contactor-divider-bar bottom-divider"></div>

      {/* Row 4: Bottom Power Screws (2/T1, 4/T2, 6/T3) */}
      <div className="contactor-screws-layer">
        {renderScrew(t2, 'top', 'default', true)}
        {renderScrew(t4, 'top', 'default', true)}
        {renderScrew(t6, 'top', 'default', true)}
      </div>

      {/* Bottom terminal block notches */}
      <div className="contactor-bottom-notches">
        <div className="notch"></div>
        <div className="notch"></div>
        <div className="notch"></div>
      </div>
    </div>
  );
}
