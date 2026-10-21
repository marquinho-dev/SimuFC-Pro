import React, { useState } from 'react';
import { X, Gauge } from 'lucide-react';

export default function MultimeterModal({ isOpen, onClose, components = [], terminalVoltages = new Map() }) {
  const [probeRed, setProbeRed] = useState('source-1:L1');
  const [probeBlack, setProbeBlack] = useState('source-1:N');

  if (!isOpen) return null;

  // Flatten all available terminals for user selection
  const allTerminals = [];
  components.forEach((c) => {
    c.terminals.forEach((t) => {
      allTerminals.push({
        compId: c.id,
        termId: t.id,
        key: `${c.id}:${t.id}`,
        label: `${c.tag} - Terminal ${t.label}`,
      });
    });
  });

  const vRed = terminalVoltages.get(probeRed) || null;
  const vBlack = terminalVoltages.get(probeBlack) || null;

  // Calculate measured AC voltage between probes
  let measuredVoltage = '000.0';
  let isMeasurementActive = false;

  if (vRed && vBlack) {
    if (vRed === vBlack) {
      measuredVoltage = '000.0';
    } else if (
      (vRed.startsWith('L') && vBlack === 'N') ||
      (vBlack.startsWith('L') && vRed === 'N')
    ) {
      measuredVoltage = '220.4';
      isMeasurementActive = true;
    } else if (vRed.startsWith('L') && vBlack.startsWith('L')) {
      measuredVoltage = '380.2';
      isMeasurementActive = true;
    } else if (vRed === 'PE' || vBlack === 'PE') {
      measuredVoltage = '000.0';
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog multimeter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Gauge className="header-icon" />
            <h2>MULTÍMETRO DIGITAL TRUE-RMS (CAT III 600V)</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body multimeter-body">
          {/* Multimeter Device Box */}
          <div className="dmm-chassis">
            <div className="dmm-brand">ELETRO-PRO 87V</div>

            {/* LCD Screen */}
            <div className="dmm-screen">
              <div className="screen-top-row">
                <span className="screen-mode">AUTO RANGE</span>
                <span className="screen-hold">TRUE RMS</span>
                <span className="screen-freq">{isMeasurementActive ? '60.0 Hz' : '--.- Hz'}</span>
              </div>
              <div className="screen-main-display">
                <span className="screen-digits">{measuredVoltage}</span>
                <span className="screen-units">V~</span>
              </div>
              <div className="screen-bargraph">
                <div
                  className="bar-fill"
                  style={{
                    width: isMeasurementActive
                      ? measuredVoltage === '380.2'
                        ? '75%'
                        : '45%'
                      : '0%',
                  }}
                ></div>
              </div>
            </div>

            {/* Probe Connectors selection */}
            <div className="dmm-probe-selectors">
              <div className="probe-input-group red-probe">
                <label>
                  <span className="probe-dot red"></span> Ponta de Prova Vermelha (+)
                </label>
                <select
                  value={probeRed}
                  onChange={(e) => setProbeRed(e.target.value)}
                  className="dmm-select"
                >
                  {allTerminals.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="probe-input-group black-probe">
                <label>
                  <span className="probe-dot black"></span> Ponta de Prova Preta (COM)
                </label>
                <select
                  value={probeBlack}
                  onChange={(e) => setProbeBlack(e.target.value)}
                  className="dmm-select"
                >
                  {allTerminals.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dmm-info-footer">
              <span>Selecione os dois terminais para inspecionar a diferença de potencial AC.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
