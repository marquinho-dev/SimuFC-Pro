import React from 'react';
import { sounds } from '../../services/soundEffects';

const COLOR_PRESETS = {
  warm_white: {
    id: 'warm_white',
    label: 'Branco Quente (3000K)',
    glow: 'rgba(254, 240, 138, 0.95)',
    base: '#fef08a',
    badgeClass: 'lamp-warm-white',
  },
  cool_white: {
    id: 'cool_white',
    label: 'Branco Frio (6500K)',
    glow: 'rgba(224, 242, 254, 0.95)',
    base: '#e0f2fe',
    badgeClass: 'lamp-cool-white',
  },
  green: {
    id: 'green',
    label: 'Verde',
    glow: 'rgba(34, 197, 94, 0.9)',
    base: '#22c55e',
    badgeClass: 'lamp-green',
  },
  red: {
    id: 'red',
    label: 'Vermelho',
    glow: 'rgba(239, 68, 68, 0.9)',
    base: '#ef4444',
    badgeClass: 'lamp-red',
  },
  blue: {
    id: 'blue',
    label: 'Azul',
    glow: 'rgba(59, 130, 246, 0.9)',
    base: '#3b82f6',
    badgeClass: 'lamp-blue',
  },
  yellow: {
    id: 'yellow',
    label: 'Amarelo',
    glow: 'rgba(234, 179, 8, 0.9)',
    base: '#eab308',
    badgeClass: 'lamp-yellow',
  },
};

function getVoltageColor(v) {
  switch (v) {
    case 'L1': return '#a855f7';
    case 'L2': return '#ffffff';
    case 'L3': return '#ef4444';
    case 'N': return '#06b6d4';
    case 'PE': return '#10b981';
    default: return '#38bdf8';
  }
}

/**
 * Lâmpada LED Bulbo E27 (Photorealistic from PSD)
 * Globo difusor fosco, corpo dissipador branco com aletas, rosca metálica E27 e pé central de contato.
 * Terminais X1 (Rosca E27) e X2 (Pé Central).
 */
export default function PilotLampElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
  isSelected = false,
}) {
  const isLit = Boolean(component.state?.lit);
  const colorKey = component.state?.color || 'warm_white';
  const colorCfg = COLOR_PRESETS[colorKey] || COLOR_PRESETS.warm_white;

  const componentId = component.id;

  const handleSelectColor = (cKey, e) => {
    e.stopPropagation();
    try {
      sounds.playButtonClick();
    } catch {}
    if (onUpdateComponentState) {
      onUpdateComponentState(component.id, { color: cKey });
    }
  };

  const vX1 = terminalVoltages?.get(`${componentId}:X1`);
  const vX2 = terminalVoltages?.get(`${componentId}:X2`);

  const isX1Active = activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'X1';
  const isX2Active = activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'X2';

  return (
    <div
      className={`led-bulb-container ${isLit ? 'is-lit' : 'is-unlit'} ${isSelected ? 'selected' : ''}`}
      style={{
        width: '90px',
        height: '180px',
        position: 'relative',
        userSelect: 'none',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
      data-component-type="pilot_light"
    >
      {/* Halo Volumétrico Difuso quando Acesa */}
      {isLit && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '5px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `radial-gradient(circle, #ffffff 20%, ${colorCfg.glow} 65%, transparent 100%)`,
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}

      {/* Imagem Fotorealista da Lâmpada LED E27 (Isolada do PSD com fundo 100% transparente) */}
      <img
        src="/led_bulb.png"
        alt="Lâmpada LED Bulbo E27"
        draggable={false}
        style={{
          width: '90px',
          height: '180px',
          objectFit: 'contain',
          display: 'block',
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 2,
          filter: isLit
            ? `drop-shadow(0 0 18px ${colorCfg.glow}) drop-shadow(0 0 35px ${colorCfg.glow}) brightness(1.22)`
            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45))',
          transition: 'filter 0.15s ease',
        }}
      />

      {/* Tag Identificadora Discreta (ex: H1) */}
      <div
        style={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#38bdf8',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {component.tag || 'H1'}
      </div>

      {/* Terminal X1: Rosca Metálica E27 (Lateral da rosca) */}
      <div
        className={`bulb-terminal-point ${isX1Active ? 'active' : ''}`}
        style={{
          position: 'absolute',
          left: '20px',
          top: '136px',
          width: '24px',
          height: '24px',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          cursor: 'crosshair',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, 'X1');
        }}
        title={`Terminal X1 (Rosca Metálica E27): ${vX1 ? `Energizado (${vX1})` : 'Sem tensão'}`}
        data-terminal-target={`${componentId}:X1`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" style={{ display: 'block', overflow: 'visible' }}>
          {/* Anel de conexão */}
          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="#0f172a"
            stroke={isX1Active ? '#00e676' : vX1 ? getVoltageColor(vX1) : '#94a3b8'}
            strokeWidth="2"
            style={{ filter: isX1Active ? 'drop-shadow(0 0 6px #00e676)' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
          />
          {/* Parafuso / Borne cromado */}
          <circle cx="12" cy="12" r="6" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" />
          <line x1="9" y1="12" x2="15" y2="12" stroke="#f8fafc" strokeWidth="1.2" />
          {/* Ponto indicador de tensão */}
          {vX1 && <circle cx="12" cy="12" r="2.8" fill={getVoltageColor(vX1)} />}
        </svg>
        <span
          style={{
            position: 'absolute',
            left: '-16px',
            top: '4px',
            fontSize: '9px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            pointerEvents: 'none',
          }}
        >
          X1
        </span>
      </div>

      {/* Terminal X2: Pé Central de Contato (Base inferior da lâmpada) */}
      <div
        className={`bulb-terminal-point ${isX2Active ? 'active' : ''}`}
        style={{
          position: 'absolute',
          left: '45px',
          top: '172px',
          width: '24px',
          height: '24px',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          cursor: 'crosshair',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, 'X2');
        }}
        title={`Terminal X2 (Pé Central de Contato): ${vX2 ? `Energizado (${vX2})` : 'Sem tensão'}`}
        data-terminal-target={`${componentId}:X2`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" style={{ display: 'block', overflow: 'visible' }}>
          {/* Anel de conexão */}
          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="#0f172a"
            stroke={isX2Active ? '#00e676' : vX2 ? getVoltageColor(vX2) : '#94a3b8'}
            strokeWidth="2"
            style={{ filter: isX2Active ? 'drop-shadow(0 0 6px #00e676)' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
          />
          {/* Parafuso / Borne cromado */}
          <circle cx="12" cy="12" r="6" fill="#475569" stroke="#cbd5e1" strokeWidth="0.8" />
          <line x1="12" y1="9" x2="12" y2="15" stroke="#f8fafc" strokeWidth="1.2" />
          {/* Ponto indicador de tensão */}
          {vX2 && <circle cx="12" cy="12" r="2.8" fill={getVoltageColor(vX2)} />}
        </svg>
        <span
          style={{
            position: 'absolute',
            left: '26px',
            top: '4px',
            fontSize: '9px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            pointerEvents: 'none',
          }}
        >
          X2
        </span>
      </div>

      {/* Seletor de Temperatura de Cor ao Selecionar o Componente */}
      {!isSimulationMode && isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '2px 5px',
            zIndex: 20,
          }}
          title="Escolha a cor da Lâmpada LED"
        >
          {Object.keys(COLOR_PRESETS).map((k) => (
            <button
              key={k}
              type="button"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: COLOR_PRESETS[k].base,
                border: k === colorKey ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                cursor: 'pointer',
                padding: 0,
              }}
              onClick={(e) => handleSelectColor(k, e)}
              title={COLOR_PRESETS[k].label}
            />
          ))}
        </div>
      )}
    </div>
  );
}
