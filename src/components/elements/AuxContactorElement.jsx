import React, { useEffect, useRef } from 'react';
import ContactorScrew from './ContactorScrew';
import { sounds } from '../../services/soundEffects';

export default function AuxContactorElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
}) {
  const isEnergized = Boolean(component.state?.energized);
  const prevEnergizedRef = useRef(isEnergized);
  const model = component.state?.model || 'CJX2-K22';
  const coilVoltage = component.state?.coilVoltage || '220V AC';

  useEffect(() => {
    if (prevEnergizedRef.current !== isEnergized) {
      sounds.playContactorClick(isEnergized);
      prevEnergizedRef.current = isEnergized;
    }
  }, [isEnergized]);

  const findTerminal = (id) => component.terminals?.find((t) => t.id === id);

  const t13 = findTerminal('13');
  const t21 = findTerminal('21');
  const t31 = findTerminal('31');
  const t43 = findTerminal('43');
  const tA1 = findTerminal('A1');

  const t14 = findTerminal('14');
  const t22 = findTerminal('22');
  const t32 = findTerminal('32');
  const t44 = findTerminal('44');
  const tA2 = findTerminal('A2');

  const renderScrew = (t, labelPos = 'none', labelColor = 'default') => {
    if (!t) return null;
    const vKey = `${component.id}:${t.id}`;
    const volt = terminalVoltages?.get(vKey);
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
        isLarge={false}
      />
    );
  };

  const formattedVoltage = coilVoltage
    ? coilVoltage.replace(/V?\s*AC/, 'V~').replace(/V?\s*DC/, 'V DC')
    : '220V~';

  return (
    <div
      className={`industrial-device aux-contactor-realistic-plate ${
        isEnergized ? 'energized' : ''
      }`}
    >
      {/* Top barrier fins protruding between terminal chambers */}
      <div className="aux-contactor-top-fins">
        <div className="fin"></div>
        <div className="fin"></div>
        <div className="fin"></div>
        <div className="fin"></div>
      </div>

      {/* Top Row Terminal Labels (Printed directly on faceplate above screw holes) */}
      <div className="aux-contactor-labels-row top-labels">
        <div className="label-col">
          <span className="terminal-code">13NO</span>
        </div>
        <div className="label-col">
          <span className="terminal-code">21NC</span>
        </div>
        <div className="label-col">
          <span className="terminal-code">31NC</span>
        </div>
        <div className="label-col">
          <span className="terminal-code">43NO</span>
        </div>
        <div className="label-col coil-col">
          <span className="terminal-code">A1</span>
        </div>
      </div>

      {/* Top Terminal Screw Layer */}
      <div className="aux-contactor-screws-layer top-screws">
        {renderScrew(t13, 'none', 'default')}
        {renderScrew(t21, 'none', 'default')}
        {renderScrew(t31, 'none', 'default')}
        {renderScrew(t43, 'none', 'default')}
        {renderScrew(tA1, 'none', 'default')}
      </div>

      {/* Center Zone: Industrial markings, Tag card, and Plunger Armature */}
      <div className="aux-contactor-center-body">
        {/* Left Column: Brand Logo, Tag placard, and Engraved Model */}
        <div className="aux-contactor-left-column">
          <div className="aux-contactor-brand-mark">
            <svg className="gear-icon" viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="#475569"
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9-2.5v-1l-2.1-.5a7.9 7.9 0 0 0-.6-1.5l1.2-1.7-.7-.7-1.7 1.2a7.9 7.9 0 0 0-1.5-.6L15 5.5h-1l-.5 2.1a7.9 7.9 0 0 0-1.5.6l-1.7-1.2-.7.7 1.2 1.7a7.9 7.9 0 0 0-.6 1.5L8 11.5v1l2.1.5a7.9 7.9 0 0 0 .6 1.5l-1.2 1.7.7.7 1.7-1.2a7.9 7.9 0 0 0 1.5.6l.5 2.1h1l.5-2.1a7.9 7.9 0 0 0 1.5-.6l1.7 1.2.7-.7-1.2-1.7a7.9 7.9 0 0 0 .6-1.5l2.1-.5z"
              />
            </svg>
            <span className="brand-text">AUTOMAÇÃO INDUSTRIAL</span>
          </div>

          {/* White/Cream Identification Placard */}
          <div className="aux-contactor-tag-card">
            <span className="tag-card-text">{component.tag || 'KA1'}</span>
          </div>

          {/* Engraved Model Stamp */}
          <div className="aux-contactor-model-stamp">
            <span className="model-prefix">CJX2-</span>
            <span className="model-suffix">K22</span>
          </div>
        </div>

        {/* Center Mechanism: Plunger window with I / O indicators and moving slug */}
        <div className="aux-contactor-plunger-section">
          <div className="plunger-label-top">I</div>
          <div className="aux-contactor-plunger-window">
            <div
              className={`aux-plunger-slug ${
                isEnergized ? 'slug-pulled' : 'slug-released'
              }`}
            ></div>
          </div>
          <div className="plunger-label-bottom">O</div>
        </div>

        {/* Right Column: Accessory mounting slots & Coil Voltage Badge */}
        <div className="aux-contactor-right-column">
          <div className="aux-slot slot-top"></div>
          <div className="aux-slot slot-mid"></div>
          <div className="aux-slot slot-bot"></div>
          <div className="aux-coil-rating-badge">
            <span className="rating-text">{formattedVoltage}</span>
          </div>
        </div>
      </div>

      {/* Bottom Terminal Screw Layer */}
      <div className="aux-contactor-screws-layer bottom-screws">
        {renderScrew(t14, 'none', 'default')}
        {renderScrew(t22, 'none', 'default')}
        {renderScrew(t32, 'none', 'default')}
        {renderScrew(t44, 'none', 'default')}
        {renderScrew(tA2, 'none', 'default')}
      </div>

      {/* Bottom Row Terminal Labels (Printed directly on faceplate below screw holes) */}
      <div className="aux-contactor-labels-row bottom-labels">
        <div className="label-col">
          <span className="terminal-code">14NO</span>
        </div>
        <div className="label-col">
          <span className="terminal-code">22NC</span>
        </div>
        <div className="label-col">
          <span className="terminal-code">32NC</span>
        </div>
        <div className="label-col">
          <span className="terminal-code">44NO</span>
        </div>
        <div className="label-col coil-col">
          <span className="terminal-code">A2</span>
        </div>
      </div>

      {/* Bottom barrier fins protruding between terminal chambers */}
      <div className="aux-contactor-bottom-fins">
        <div className="fin"></div>
        <div className="fin"></div>
        <div className="fin"></div>
        <div className="fin"></div>
      </div>
    </div>
  );
}
