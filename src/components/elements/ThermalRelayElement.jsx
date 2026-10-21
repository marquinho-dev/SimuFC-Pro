import React from 'react';
import overloadImg from '../../assets/overload.webp';
import { sounds } from '../../services/soundEffects';

export default function ThermalRelayElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
}) {
  const isTripped = Boolean(component.state?.tripped);

  const handleTrip = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    sounds.playTrip();
    if (onUpdateComponentState) {
      onUpdateComponentState(component.id, { tripped: true });
    }
  };

  const handleReset = (e) => {
    if (!isSimulationMode) return;
    e.stopPropagation();
    sounds.playButtonClick();
    if (onUpdateComponentState) {
      onUpdateComponentState(component.id, { tripped: false });
    }
  };

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

  const renderTerminal = (t) => {
    if (!t) return null;
    const vKey = `${component.id}:${t.id}`;
    const volt = terminalVoltages.get(vKey);
    const isSelected =
      activeTerminal?.componentId === component.id &&
      activeTerminal?.terminalId === t.id;
    const isPowered = Boolean(volt);

    return (
      <div
        key={t.id}
        className={`overload-terminal-socket ${isSelected ? 'selected' : ''} ${
          activeTerminal ? 'wire-target-ready' : ''
        }`}
        style={{ left: `${t.x}px`, top: `${t.y}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(component.id, t.id);
        }}
        title={`${t.label}: ${volt ? `Energizado (${volt})` : 'Sem tensão'}`}
      >
        <div className="overload-socket-ring">
          {isPowered && (
            <span
              className="overload-power-dot"
              style={{
                backgroundColor: getVoltageBadgeColor(volt),
                color: getVoltageBadgeColor(volt),
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const isLinked = Boolean(component.linkedContactorId);

  return (
    <div
      className={`industrial-device overload-relay-device ${
        isTripped ? 'tripped' : ''
      } ${isLinked ? 'coupled-to-contactor' : ''}`}
    >
      {/* Imagem hiper-realista do Relé Térmico de Sobrecarga */}
      <img
        src={overloadImg}
        alt="Relé Térmico de Sobrecarga"
        className="overload-image-chassis"
        draggable={false}
      />

      {/* Indicador visual de disparo no visor TEST */}
      <div
        className={`overload-trip-flag ${isTripped ? 'tripped' : ''}`}
        style={{ left: '58.5px', top: '213.5px' }}
        title={isTripped ? 'Status: SOBRECARGA DISPARADA (TRIP)' : 'Status: NORMAL'}
      />

      {/* Botão interativo STOP / TEST (Amarelo 'T') */}
      <div
        className="overload-interactive-btn overload-btn-stop"
        style={{
          left: '126px',
          top: '209px',
          width: '26px',
          height: '26px',
          cursor: isSimulationMode ? 'pointer' : 'grab',
          pointerEvents: isSimulationMode ? 'auto' : 'none',
        }}
        onClick={handleTrip}
        title={isSimulationMode ? "Clique para Simular Sobrecarga / Teste de Disparo (STOP - TRIP)" : undefined}
      />

      {/* Botão interativo RESET (Azul 'A/R') */}
      <div
        className={`overload-interactive-btn overload-btn-reset ${
          isTripped ? 'needs-reset' : ''
        }`}
        style={{
          left: '163px',
          top: '210px',
          width: '24px',
          height: '24px',
          cursor: isSimulationMode ? 'pointer' : 'grab',
          pointerEvents: isSimulationMode ? 'auto' : 'none',
        }}
        onClick={handleReset}
        title={isSimulationMode ? (isTripped ? 'Clique para Rearmar o Relé Térmico (RESET)' : 'Botão Reset (Rearme)') : undefined}
      />

      {/* Terminais e bornes para conexão de fiação (oculta 1, 3, 5 quando acoplado ao contator) */}
      {component.terminals
        .filter((t) => !(component.linkedContactorId && ['1', '3', '5'].includes(t.id)))
        .map((t) => renderTerminal(t))}
    </div>
  );
}
