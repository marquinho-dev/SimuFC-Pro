import React from 'react';

export default function BananaSocket({
  componentId,
  terminal,
  voltage,
  isSelected,
  isConnecting,
  onTerminalClick,
}) {
  const isPowered = Boolean(voltage);

  const handleInteract = (e) => {
    e.stopPropagation();
    onTerminalClick(componentId, terminal.id);
  };

  return (
    <div
      className={`banana-socket-container ${isSelected ? 'selected' : ''} ${
        isConnecting ? 'wire-target-ready' : ''
      }`}
      style={{
        left: `${terminal.x}px`,
        top: `${terminal.y}px`,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={handleInteract}
      title={`${terminal.label}: ${voltage ? `Energizado (${voltage})` : 'Sem tensão'}`}
    >
      {!terminal.hideLabel && terminal.label && (
        <div className="socket-label-text">{terminal.label}</div>
      )}
      <div
        className="banana-socket-outer-ring"
        style={{
          borderColor: terminal.color || '#3b82f6',
          boxShadow: isPowered ? `0 0 10px ${terminal.color || '#3b82f6'}` : 'none',
        }}
      >
        <div
          className="banana-socket-color-body"
          style={{ backgroundColor: terminal.color || '#3b82f6' }}
        >
          <div className="banana-socket-metal-bezel">
            <div
              className="banana-socket-receptacle"
              data-terminal-target={`${componentId}:${terminal.id}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
