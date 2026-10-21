import React, { useState } from 'react';
import { X, Sliders, Shield, Zap, Check } from 'lucide-react';
import {
  BREAKER_POLES,
  BREAKER_CURVES,
  BREAKER_CURRENTS,
  getBreakerTerminals,
} from '../types/components';

export default function BreakerSettingsModal({
  isOpen,
  onClose,
  component,
  onSaveSettings,
}) {
  const currentPoles = component?.state?.poles || 3;
  const currentCurrent = component?.state?.current || 25;
  const currentCurve = component?.state?.curve || 'C';

  const [selectedPoles, setSelectedPoles] = useState(currentPoles);
  const [selectedCurrent, setSelectedCurrent] = useState(currentCurrent);
  const [selectedCurve, setSelectedCurve] = useState(currentCurve);

  if (!isOpen || !component) return null;

  const handleSave = () => {
    const newTerminals = getBreakerTerminals(selectedPoles);

    onSaveSettings(component.id, {
      state: {
        ...component.state,
        poles: selectedPoles,
        current: Number(selectedCurrent),
        curve: selectedCurve,
      },
      terminals: newTerminals,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog breaker-settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders className="header-icon" />
            <h2>AJUSTES DO DISJUNTOR TERMOMAGNÉTICO</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body breaker-settings-body">
          {/* Seletor de Número de Polos (1P, 2P, 3P) */}
          <div className="settings-section">
            <label className="section-heading">
              <Zap size={16} /> NÚMERO DE PÓLOS / MÓDULOS DIN:
            </label>
            <div className="breaker-poles-grid">
              {BREAKER_POLES.map((pole) => (
                <button
                  key={pole.id}
                  type="button"
                  className={`pole-card ${selectedPoles === pole.id ? 'active' : ''}`}
                  onClick={() => setSelectedPoles(pole.id)}
                >
                  <div className="pole-badge-preview">{pole.badge}</div>
                  <div className="pole-info">
                    <span className="pole-title">{pole.label}</span>
                    <span className="pole-desc">{pole.description}</span>
                  </div>
                  {selectedPoles === pole.id && (
                    <div className="pole-selected-icon">
                      <Check size={18} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Curva de Disparo Magnético (B, C, D) */}
          <div className="settings-section">
            <label className="section-heading">
              <Shield size={16} /> CURVA DE DISPARO MAGNÉTICO (NBR NM 60898):
            </label>
            <div className="breaker-curves-grid">
              {BREAKER_CURVES.map((curve) => (
                <button
                  key={curve.id}
                  type="button"
                  className={`curve-card ${selectedCurve === curve.id ? 'active' : ''}`}
                  onClick={() => setSelectedCurve(curve.id)}
                >
                  <div className="curve-header">
                    <span className="curve-letter">{curve.id}</span>
                    <span className="curve-title">{curve.label}</span>
                  </div>
                  <span className="curve-desc">{curve.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Corrente Nominal In (A) */}
          <div className="settings-section">
            <label className="section-heading">
              <Zap size={16} /> CORRENTE NOMINAL (In):
            </label>
            <div className="breaker-currents-chips">
              {BREAKER_CURRENTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`current-chip ${Number(selectedCurrent) === val ? 'active' : ''}`}
                  onClick={() => setSelectedCurrent(val)}
                >
                  {val}A
                </button>
              ))}
            </div>

            <div className="current-custom-input-wrapper">
              <span>Valor personalizado:</span>
              <input
                type="number"
                min="1"
                max="125"
                value={selectedCurrent}
                onChange={(e) => setSelectedCurrent(Number(e.target.value))}
                className="current-custom-field"
              />
              <span className="unit-label">Amperes (A)</span>
            </div>
          </div>

          {/* Resumo Técnico do Disjuntor Configurado */}
          <div className="breaker-preview-summary">
            <div className="preview-label">ESPECIFICAÇÃO DO DISPOSITIVO:</div>
            <div className="preview-specs-row">
              <div className="spec-badge">
                <span className="spec-key">Modelo:</span>
                <span className="spec-val highlight">
                  {selectedCurve}
                  {selectedCurrent}
                </span>
              </div>
              <div className="spec-badge">
                <span className="spec-key">Polos:</span>
                <span className="spec-val">{selectedPoles}P ({selectedPoles === 1 ? 'Mono' : selectedPoles === 2 ? 'Bi' : 'Tri'})</span>
              </div>
              <div className="spec-badge">
                <span className="spec-key">Tensão:</span>
                <span className="spec-val">{selectedPoles === 1 ? '230V~' : '400V~'}</span>
              </div>
              <div className="spec-badge">
                <span className="spec-key">Icn:</span>
                <span className="spec-val">4500A / 4.5kA</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação: Cancelar e Aplicar Configuração */}
          <div className="modal-actions-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-confirm-save" onClick={handleSave}>
              <Check size={16} />
              <span>Aplicar Configuração</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
