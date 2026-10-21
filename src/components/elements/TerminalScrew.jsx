import React from 'react';

export default function TerminalScrew({
  componentId,
  terminal,
  voltage,
  isConnecting,
  isSelected,
  onTerminalClick,
  labelPosition = 'top',
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

  return (
    <div
      className={`terminal-screw-container label-pos-${labelPosition} ${isSelected ? 'selected' : ''} ${
        isConnecting ? 'wire-target-ready' : ''
      }`}
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
      {labelPosition !== 'none' && !terminal.hideLabel && (
        <div className="terminal-label">{terminal.label}</div>
      )}
      <div
        className="terminal-screw-head"
        data-terminal-target={`${componentId}:${terminal.id}`}
      >
        <div className="terminal-screw-slot"></div>
        {isPowered && (
          <span
            className="terminal-power-dot"
            style={{ backgroundColor: getVoltageBadgeColor(voltage) }}
            title={`Tensão: ${voltage}`}
          />
        )}
      </div>
    </div>
  );
}
