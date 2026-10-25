import React, { useState, useEffect } from 'react';
import { X, Sliders, Layers, Check } from 'lucide-react';
import { getTerminalBlockTerminals } from '../types/components';

const QUICK_PRESETS = [1, 2, 3, 4, 6, 8, 10, 12, 16];

export default function TerminalBlockSettingsModal({
  isOpen,
  onClose,
  component,
  onSaveSettings,
}) {
  const currentPoles = Math.max(1, Math.min(24, Number(component?.state?.poles) || 4));
  const [selectedPoles, setSelectedPoles] = useState(currentPoles);

  useEffect(() => {
    if (component?.state?.poles !== undefined) {
      setSelectedPoles(Math.max(1, Math.min(24, Number(component.state.poles) || 4)));
    }
  }, [component?.id, component?.state?.poles, isOpen]);

  if (!isOpen || !component) return null;

  const handleSave = () => {
    const newTerminals = getTerminalBlockTerminals(selectedPoles);

    onSaveSettings(component.id, {
      state: {
        ...component.state,
        poles: selectedPoles,
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
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders className="header-icon" />
            <h2>CONFIGURAÇÃO DA BORNEIRA DE PASSAGEM</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body breaker-settings-body">
          {/* Seletor de Quantidade de Bornes */}
          <div className="settings-section">
            <label className="section-label">
              <Layers size={16} className="inline-icon" />
              NÚMERO DE BORNES NA RÉGUA
            </label>
            <p className="section-desc">
              Cada borne é um módulo de passagem com dois parafusos (superior e inferior) eletricamente conectados entre si.
            </p>

            {/* Stepper + Slider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '16px',
              }}
            >
              <button
                type="button"
                disabled={selectedPoles <= 1}
                onClick={() => setSelectedPoles((p) => Math.max(1, p - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: selectedPoles <= 1 ? '#334155' : '#ef4444',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: selectedPoles <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                -
              </button>

              <input
                type="range"
                min="1"
                max="24"
                value={selectedPoles}
                onChange={(e) => setSelectedPoles(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer' }}
              />

              <button
                type="button"
                disabled={selectedPoles >= 24}
                onClick={() => setSelectedPoles((p) => Math.min(24, p + 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: selectedPoles >= 24 ? '#334155' : '#22c55e',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: selectedPoles >= 24 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>

              <div
                style={{
                  minWidth: '70px',
                  textAlign: 'center',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: '800',
                }}
              >
                {selectedPoles} {selectedPoles === 1 ? 'borne' : 'bornes'}
              </div>
            </div>

            {/* Botões Rápidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {QUICK_PRESETS.map((count) => {
                const isSelected = selectedPoles === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedPoles(count)}
                    style={{
                      padding: '8px 4px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                      border: `1.5px solid ${isSelected ? '#38bdf8' : 'rgba(148, 163, 184, 0.2)'}`,
                      borderRadius: '8px',
                      color: isSelected ? '#ffffff' : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{count} {count === 1 ? 'polo' : 'polos'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumo da Conexão */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
              ℹ️ Especificações da Régua:
            </div>
            <div>• Terminais Superiores: 1 a {selectedPoles}</div>
            <div>• Terminais Inferiores: 1' a {selectedPoles}' (condução contínua direta)</div>
            <div>• Montagem: Encaixe padrão para Trilho DIN TS-35</div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-save" onClick={handleSave}>
            <Check size={16} /> Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
