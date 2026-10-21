import React from 'react';

export default function ContactorScrew({
  componentId,
  terminal,
  voltage,
  isSelected,
  isConnecting,
  onTerminalClick,
  labelPosition = 'bottom', // 'bottom', 'top', 'left'
  labelColor = 'default', // 'default', 'no', 'nc'
  isLarge = false,
}) {
  const isPowered = Boolean(voltage);

  const getVoltageBadgeColor = (v) => {
    switch (v) {
      case 'L1':
        return '#a855f7';
      case 'L2':
        return '#ffffff';
      case 'L3':
        return '#ef4444';
      case 'N':
        return '#2563eb';
      case 'PE':
        return '#16a34a';
      default:
        return '#64748b';
    }
  };

  const renderLabel = () => {
    if (labelColor === 'no') {
      const parts = terminal.label.split(' ');
      return (
        <div className="contactor-screw-label label-no">
          <span className="num">{parts[0]}</span>
          <span className="type">NO</span>
        </div>
      );
    }
    if (labelColor === 'nc') {
      const parts = terminal.label.split(' ');
      return (
        <div className="contactor-screw-label label-nc">
          <span className="num">{parts[0]}</span>
          <span className="type">NC</span>
        </div>
      );
    }
    return <div className="contactor-screw-label">{terminal.label}</div>;
  };

  return (
    <div
      className={`contactor-screw-container ${isLarge ? 'screw-large' : 'screw-small'} ${
        isSelected ? 'selected' : ''
      } ${isConnecting ? 'wire-target-ready' : ''} label-pos-${labelPosition}`}
      style={{
        left: `${terminal.x}px`,
        top: `${terminal.y}px`,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onTerminalClick(componentId, terminal.id);
      }}
      title={`${terminal.label}: ${voltage ? `Energizado (${voltage})` : 'Sem tensão'}`}
    >
      {labelPosition === 'top' && renderLabel()}
      {labelPosition === 'left' && renderLabel()}

      {/* Screw Bezel & Metal Head */}
      <div className="contactor-screw-recess">
        <div
          className="contactor-screw-head"
          data-terminal-target={`${componentId}:${terminal.id}`}
        >
          <div className="cross-slot horizontal"></div>
          <div className="cross-slot vertical"></div>
          {isPowered && (
            <span
              className="terminal-power-dot"
              style={{ backgroundColor: getVoltageBadgeColor(voltage) }}
            />
          )}
        </div>
      </div>

      {labelPosition === 'bottom' && renderLabel()}
    </div>
  );
}
