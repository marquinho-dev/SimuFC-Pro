import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import {
  CONTACTOR_POLES,
  CONTACTOR_COIL_VOLTAGES,
  CONTACTOR_AUX_OPTIONS,
  getContactorTerminals,
} from '../types/components';

export default function ContactorSettingsModal({
  isOpen,
  onClose,
  component,
  onSaveSettings,
}) {
  const currentPoles = component?.state?.poles || 3;
  const currentAuxType =
    component?.state?.auxBlockType ||
    (component?.state?.hasAuxBlock ? '1NO_1NC' : 'none');
  const currentCoilVoltage = component?.state?.coilVoltage || '220V AC';

  const [selectedPoles, setSelectedPoles] = useState(currentPoles);
  const [selectedAuxType, setSelectedAuxType] = useState(currentAuxType);
  const [selectedCoilVoltage, setSelectedCoilVoltage] = useState(currentCoilVoltage);

  if (!isOpen || !component) return null;

  const handleSave = () => {
    const newTerminals = getContactorTerminals({
      poles: selectedPoles,
      auxBlockType: selectedAuxType,
      hasAuxBlock: selectedAuxType !== 'none',
    });

    onSaveSettings(component.id, {
      state: {
        ...component.state,
        poles: selectedPoles,
        auxBlockType: selectedAuxType,
        hasAuxBlock: selectedAuxType !== 'none',
        coilVoltage: selectedCoilVoltage,
      },
      terminals: newTerminals,
    });

    onClose();
  };

  return (
    <div className="contactor-split-modal-backdrop" onClick={onClose}>
      <div
        className="contactor-split-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Configurações do Contator"
      >
        {/* Painel Lateral Esquerdo (Aside com Preview Gráfico do Contator) */}
        <aside className="contactor-split-aside">
          <div className="contactor-aside-header">
            <div className="contactor-aside-badge">Componente</div>
            <div className="contactor-aside-tag">{component.tag || 'KM1'}</div>
            <div className="contactor-aside-subtitle">Contator de potência</div>
          </div>

          {/* Esquema Gráfico SVG Dinâmico do Contator */}
          <div className="contactor-aside-svg-wrapper">
            <svg
              viewBox="0 0 252 190"
              width="100%"
              height="100%"
              role="img"
              aria-label="Esquema do contator com terminais"
            >
              {/* Corpo da carcaça */}
              <rect
                x="16"
                y="36"
                width="220"
                height="118"
                rx="10"
                fill="#172230"
                stroke="#2f4560"
                strokeWidth="1.5"
              />

              {/* Terminais de Força Principais (Superiores e Inferiores) */}
              <g
                fill="#5cc8ff"
                fontSize="11"
                fontFamily="'JetBrains Mono', monospace"
                textAnchor="middle"
                fontWeight="700"
              >
                {selectedPoles === 4 ? (
                  <>
                    {/* Topo 4P */}
                    <circle cx="48" cy="36" r="4.5" />
                    <circle cx="100" cy="36" r="4.5" />
                    <circle cx="152" cy="36" r="4.5" />
                    <circle cx="204" cy="36" r="4.5" />
                    <text x="48" y="22">1/L1</text>
                    <text x="100" y="22">3/L2</text>
                    <text x="152" y="22">5/L3</text>
                    <text x="204" y="22">7/L4</text>

                    {/* Base 4P */}
                    <circle cx="48" cy="154" r="4.5" />
                    <circle cx="100" cy="154" r="4.5" />
                    <circle cx="152" cy="154" r="4.5" />
                    <circle cx="204" cy="154" r="4.5" />
                    <text x="48" y="177">2/T1</text>
                    <text x="100" y="177">4/T2</text>
                    <text x="152" y="177">6/T3</text>
                    <text x="204" y="177">8/T4</text>
                  </>
                ) : (
                  <>
                    {/* Topo 3P */}
                    <circle cx="66" cy="36" r="5" />
                    <circle cx="126" cy="36" r="5" />
                    <circle cx="186" cy="36" r="5" />
                    <text x="66" y="22">1/L1</text>
                    <text x="126" y="22">3/L2</text>
                    <text x="186" y="22">5/L3</text>

                    {/* Base 3P */}
                    <circle cx="66" cy="154" r="5" />
                    <circle cx="126" cy="154" r="5" />
                    <circle cx="186" cy="154" r="5" />
                    <text x="66" y="177">2/T1</text>
                    <text x="126" y="177">4/T2</text>
                    <text x="186" y="177">6/T3</text>
                  </>
                )}
              </g>

              {/* Contatos Auxiliares Centrais */}
              {selectedAuxType === 'none' && (
                <g fontFamily="'JetBrains Mono', monospace">
                  <rect x="36" y="64" width="80" height="26" rx="6" fill="#0f2e22" stroke="#1f6b48" />
                  <text x="76" y="81" textAnchor="middle" fill="#5fe39a" fontSize="11" fontWeight="700">
                    13-14 NA
                  </text>
                  <rect x="136" y="64" width="80" height="26" rx="6" fill="#34171a" stroke="#7a2f35" />
                  <text x="176" y="81" textAnchor="middle" fill="#ff8a8a" fontSize="11" fontWeight="700">
                    21-22 NF
                  </text>
                </g>
              )}

              {selectedAuxType === '1NO_1NC' && (
                <g fontFamily="'JetBrains Mono', monospace">
                  <rect x="36" y="64" width="80" height="26" rx="6" fill="#0f2e22" stroke="#1f6b48" />
                  <text x="76" y="81" textAnchor="middle" fill="#5fe39a" fontSize="12" fontWeight="700">
                    53-54 NA
                  </text>
                  <rect x="136" y="64" width="80" height="26" rx="6" fill="#34171a" stroke="#7a2f35" />
                  <text x="176" y="81" textAnchor="middle" fill="#ff8a8a" fontSize="12" fontWeight="700">
                    61-62 NF
                  </text>
                </g>
              )}

              {selectedAuxType === '2NO' && (
                <g fontFamily="'JetBrains Mono', monospace">
                  <rect x="36" y="64" width="80" height="26" rx="6" fill="#0f2e22" stroke="#1f6b48" />
                  <text x="76" y="81" textAnchor="middle" fill="#5fe39a" fontSize="12" fontWeight="700">
                    53-54 NA
                  </text>
                  <rect x="136" y="64" width="80" height="26" rx="6" fill="#0f2e22" stroke="#1f6b48" />
                  <text x="176" y="81" textAnchor="middle" fill="#5fe39a" fontSize="12" fontWeight="700">
                    83-84 NA
                  </text>
                </g>
              )}

              {selectedAuxType === '2NC' && (
                <g fontFamily="'JetBrains Mono', monospace">
                  <rect x="36" y="64" width="80" height="26" rx="6" fill="#34171a" stroke="#7a2f35" />
                  <text x="76" y="81" textAnchor="middle" fill="#ff8a8a" fontSize="12" fontWeight="700">
                    61-62 NF
                  </text>
                  <rect x="136" y="64" width="80" height="26" rx="6" fill="#34171a" stroke="#7a2f35" />
                  <text x="176" y="81" textAnchor="middle" fill="#ff8a8a" fontSize="12" fontWeight="700">
                    71-72 NF
                  </text>
                </g>
              )}

              {selectedAuxType === '2NO_2NC' && (
                <g fontFamily="'JetBrains Mono', monospace">
                  <rect x="22" y="64" width="48" height="26" rx="5" fill="#0f2e22" stroke="#1f6b48" />
                  <text x="46" y="81" textAnchor="middle" fill="#5fe39a" fontSize="10" fontWeight="700">
                    53-54
                  </text>
                  <rect x="76" y="64" width="48" height="26" rx="5" fill="#34171a" stroke="#7a2f35" />
                  <text x="100" y="81" textAnchor="middle" fill="#ff8a8a" fontSize="10" fontWeight="700">
                    61-62
                  </text>
                  <rect x="130" y="64" width="48" height="26" rx="5" fill="#34171a" stroke="#7a2f35" />
                  <text x="154" y="81" textAnchor="middle" fill="#ff8a8a" fontSize="10" fontWeight="700">
                    71-72
                  </text>
                  <rect x="184" y="64" width="48" height="26" rx="5" fill="#0f2e22" stroke="#1f6b48" />
                  <text x="208" y="81" textAnchor="middle" fill="#5fe39a" fontSize="10" fontWeight="700">
                    83-84
                  </text>
                </g>
              )}

              {/* Tensão da Bobina Centralizada */}
              <text
                x="126"
                y="122"
                textAnchor="middle"
                fill="#f5b942"
                fontSize="12"
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                A1–A2 · {selectedCoilVoltage}
              </text>
            </svg>
          </div>

          {/* Resumo da Configuração Atual */}
          <div className="contactor-aside-summary-box">
            <div className="summary-item">
              <span className="summary-label">Polos:</span>
              <span className="summary-val">{selectedPoles} Polos ({selectedPoles}P)</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Bobina:</span>
              <span className="summary-val highlight-gold">{selectedCoilVoltage}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Auxiliar:</span>
              <span className="summary-val highlight-blue">
                {CONTACTOR_AUX_OPTIONS.find((o) => o.id === selectedAuxType)?.badge}
              </span>
            </div>
          </div>
        </aside>

        {/* Coluna Direita (Opções de Configuração) */}
        <div className="contactor-split-main">
          {/* Header */}
          <div className="contactor-split-header">
            <h2 className="contactor-split-title">Configurações</h2>
            <button
              type="button"
              className="contactor-split-close-btn"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Corpo do Formulário */}
          <div className="contactor-split-body">
            {/* Seção 1: Polos de Potência */}
            <section className="contactor-split-section">
              <label className="split-section-label">Polos de potência</label>
              <div className="split-segmented-control-poles">
                <button
                  type="button"
                  className={`split-segment-btn ${selectedPoles === 3 ? 'active' : ''}`}
                  onClick={() => setSelectedPoles(3)}
                  aria-pressed={selectedPoles === 3}
                >
                  <span className="segment-main-text">Tripolar · 3P</span>
                  <span className="segment-sub-text">L1 L2 L3</span>
                </button>
                <button
                  type="button"
                  className={`split-segment-btn ${selectedPoles === 4 ? 'active' : ''}`}
                  onClick={() => setSelectedPoles(4)}
                  aria-pressed={selectedPoles === 4}
                >
                  <span className="segment-main-text">Tetrapolar · 4P</span>
                  <span className="segment-sub-text">L1 L2 L3 L4</span>
                </button>
              </div>
            </section>

            {/* Seção 2: Tensão da Bobina A1-A2 */}
            <section className="contactor-split-section">
              <label className="split-section-label">
                Tensão da bobina <span className="label-mono-tag">A1–A2</span>
              </label>
              <div className="split-coil-chips-row">
                {CONTACTOR_COIL_VOLTAGES.map((v) => {
                  const isSelected = selectedCoilVoltage === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`split-coil-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedCoilVoltage(v)}
                      aria-pressed={isSelected}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Seção 3: Bloco de Contatos Auxiliares Frontais */}
            <section className="contactor-split-section">
              <label className="split-section-label">
                Bloco de contatos auxiliares frontais <span className="label-sub">(aditivo)</span>
              </label>
              <div className="split-segmented-control-aux">
                {CONTACTOR_AUX_OPTIONS.map((opt) => {
                  const isSelected = selectedAuxType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`split-aux-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedAuxType(opt.id)}
                      aria-pressed={isSelected}
                    >
                      {opt.badge}
                    </button>
                  );
                })}
              </div>

              {/* Tags Informativas de Terminais Abaixo do Seletor */}
              <div className="split-aux-description-row">
                {selectedAuxType === 'none' && (
                  <>
                    <span>Carcaça padrão:</span>
                    <span className="split-term-chip chip-no">13-14 (NA)</span>
                    <span className="split-term-chip chip-nc">21-22 (NF)</span>
                  </>
                )}
                {selectedAuxType === '1NO_1NC' && (
                  <>
                    <span>Bloco frontal de 2 polos:</span>
                    <span className="split-term-chip chip-no">53-54 (NA)</span>
                    <span className="split-term-chip chip-nc">61-62 (NF)</span>
                  </>
                )}
                {selectedAuxType === '2NO' && (
                  <>
                    <span>Bloco frontal de 2 polos:</span>
                    <span className="split-term-chip chip-no">53-54 (NA)</span>
                    <span className="split-term-chip chip-no">83-84 (NA)</span>
                  </>
                )}
                {selectedAuxType === '2NC' && (
                  <>
                    <span>Bloco frontal de 2 polos:</span>
                    <span className="split-term-chip chip-nc">61-62 (NF)</span>
                    <span className="split-term-chip chip-nc">71-72 (NF)</span>
                  </>
                )}
                {selectedAuxType === '2NO_2NC' && (
                  <>
                    <span>Bloco frontal quádruplo (4 polos):</span>
                    <span className="split-term-chip chip-no">53-54 (NA)</span>
                    <span className="split-term-chip chip-nc">61-62 (NF)</span>
                    <span className="split-term-chip chip-nc">71-72 (NF)</span>
                    <span className="split-term-chip chip-no">83-84 (NA)</span>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="contactor-split-footer">
            <button
              type="button"
              className="split-btn-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="split-btn-save"
              onClick={handleSave}
            >
              <Check size={18} /> Salvar configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
