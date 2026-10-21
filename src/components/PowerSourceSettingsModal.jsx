import React, { useState } from 'react';
import { X, Sliders, Zap } from 'lucide-react';
import { POWER_MODES, BRAZIL_VOLTAGE_STANDARDS } from '../types/components';

export default function PowerSourceSettingsModal({
  isOpen,
  onClose,
  component,
  onSaveSettings,
}) {
  const currentMode = component?.state?.mode || '3P_N_PE';
  const currentStd = component?.state?.voltageStandard || '380_220';

  const [selectedMode, setSelectedMode] = useState(currentMode);
  const [selectedStandard, setSelectedStandard] = useState(currentStd);
  const [vL1, setVL1] = useState(component?.state?.vL1 || 220);
  const [vL2, setVL2] = useState(component?.state?.vL2 || 220);
  const [vL3, setVL3] = useState(component?.state?.vL3 || 220);

  if (!isOpen || !component) return null;

  const handleStandardChange = (stdId) => {
    setSelectedStandard(stdId);
    const found = BRAZIL_VOLTAGE_STANDARDS.find((s) => s.id === stdId);
    if (found && stdId !== 'custom') {
      setVL1(found.vL1);
      setVL2(found.vL2);
      setVL3(found.vL3);
    }
  };

  const handleSave = () => {
    const modeConfig = POWER_MODES[selectedMode];
    const newTerminals = modeConfig.terminals;

    onSaveSettings(component.id, {
      state: {
        ...component.state,
        mode: selectedMode,
        voltageStandard: selectedStandard,
        vL1: Number(vL1),
        vL2: Number(vL2),
        vL3: Number(vL3),
      },
      terminals: newTerminals,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog power-settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders className="header-icon" />
            <h2>AJUSTES DA FONTE DE TENSÃO</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body power-settings-body">
          {/* Seletor de Configuração de Terminais */}
          <div className="settings-section">
            <label className="section-heading">
              <Zap size={16} /> CONFIGURAÇÃO DE TERMINAIS DA REDE:
            </label>
            <div className="power-modes-grid">
              {Object.values(POWER_MODES).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`mode-card ${selectedMode === mode.id ? 'active' : ''}`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <div className="mode-badge-preview">{mode.badge}</div>
                  <span className="mode-desc">{mode.description}</span>
                  <div className="mode-terminals-preview">
                    {mode.terminals.map((t) => (
                      <span
                        key={t.id}
                        className="preview-socket-dot"
                        style={{ backgroundColor: t.color }}
                        title={t.label}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Níveis de Tensão - Padrões Brasileiros */}
          <div className="settings-section">
            <label className="section-heading">
              <Zap size={16} /> NÍVEIS DE TENSÃO (PADRÕES BRASILEIROS - 60 Hz):
            </label>
            <div className="standards-selector-list">
              {BRAZIL_VOLTAGE_STANDARDS.map((std) => (
                <label
                  key={std.id}
                  className={`standard-radio-option ${
                    selectedStandard === std.id ? 'active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="voltage_standard"
                    value={std.id}
                    checked={selectedStandard === std.id}
                    onChange={() => handleStandardChange(std.id)}
                  />
                  <div className="std-info">
                    <strong>{std.label}</strong>
                    {std.id !== 'custom' && (
                      <span className="std-detail">
                        Linha: {std.vLine}V AC | Fase-Neutro: {std.vPhase}V AC
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Ajuste Individual por Fase (se customizado ou para visualização) */}
            <div className="custom-voltages-bay">
              <span className="custom-bay-title">
                {selectedStandard === 'custom'
                  ? 'Ajuste Individual por Fase (Personalizado):'
                  : 'Valores Nominais Aplicados:'}
              </span>
              <div className="voltages-inputs-row">
                <div className="volt-input-group">
                  <label>
                    <span className="dot red"></span> Fase L1:
                  </label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      value={vL1}
                      disabled={selectedStandard !== 'custom'}
                      onChange={(e) => setVL1(e.target.value)}
                    />
                    <span>V</span>
                  </div>
                </div>

                {(selectedMode === '3P_N_PE' ||
                  selectedMode === '3P' ||
                  selectedMode === '2P') && (
                  <div className="volt-input-group">
                    <label>
                      <span className="dot yellow"></span> Fase L2:
                    </label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        value={vL2}
                        disabled={selectedStandard !== 'custom'}
                        onChange={(e) => setVL2(e.target.value)}
                      />
                      <span>V</span>
                    </div>
                  </div>
                )}

                {(selectedMode === '3P_N_PE' || selectedMode === '3P') && (
                  <div className="volt-input-group">
                    <label>
                      <span className="dot blue"></span> Fase L3:
                    </label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        value={vL3}
                        disabled={selectedStandard !== 'custom'}
                        onChange={(e) => setVL3(e.target.value)}
                      />
                      <span>V</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-confirm-save" onClick={handleSave}>
              Salvar Ajustes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
