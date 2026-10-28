import React, { useEffect, useRef } from 'react';
import ContactorScrew from './ContactorScrew';
import { sounds } from '../../services/soundEffects';

export default function ContactorElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
}) {
  const isEnergized = Boolean(component.state.energized);
  const prevEnergizedRef = useRef(isEnergized);

  const auxType =
    component.state?.auxBlockType ||
    (component.state?.hasAuxBlock ? '1NO_1NC' : 'none');
  const hasAuxBlock = auxType !== 'none';
  const poles = component.state?.poles === 4 ? 4 : 3;
  const coilVoltage = component.state?.coilVoltage || '220V AC';

  useEffect(() => {
    if (prevEnergizedRef.current !== isEnergized) {
      sounds.playContactorClick(isEnergized);
      prevEnergizedRef.current = isEnergized;
    }
  }, [isEnergized]);

  const findTerminal = (id) => component.terminals.find((t) => t.id === id);

  const t1 = findTerminal('1');
  const t3 = findTerminal('3');
  const t5 = findTerminal('5');
  const t7 = findTerminal('7');

  const t13 = findTerminal('13');
  const t21 = findTerminal('21');
  const tA1 = findTerminal('A1');

  // Terminais dos blocos de contatos auxiliares
  const t53 = findTerminal('53');
  const t54 = findTerminal('54');
  const t61 = findTerminal('61');
  const t62 = findTerminal('62');
  const t71 = findTerminal('71');
  const t72 = findTerminal('72');
  const t83 = findTerminal('83');
  const t84 = findTerminal('84');

  const t14 = findTerminal('14');
  const t22 = findTerminal('22');
  const tA2 = findTerminal('A2');

  const t2 = findTerminal('2');
  const t4 = findTerminal('4');
  const t6 = findTerminal('6');
  const t8 = findTerminal('8');

  const renderScrew = (t, labelPos, labelColor, isLarge) => {
    if (!t) return null;
    const vKey = `${component.id}:${t.id}`;
    const volt = terminalVoltages?.get(vKey);
    const isSelected =
      activeTerminal?.componentId === component.id &&
      activeTerminal?.terminalId === t.id;

    return (
      <ContactorScrew
        key={t.id}
        componentId={component.id}
        terminal={t}
        voltage={volt}
        isSelected={isSelected}
        isConnecting={Boolean(activeTerminal)}
        onTerminalClick={onTerminalClick}
        labelPosition={labelPos}
        labelColor={labelColor}
        isLarge={isLarge}
      />
    );
  };

  return (
    <div
      className={`industrial-device contactor-realistic-plate ${
        isEnergized ? 'energized' : ''
      } ${hasAuxBlock ? 'has-aux-block' : 'no-aux-block'} ${
        poles === 4 ? 'poles-4' : 'poles-3'
      }`}
    >
      {/* Top terminal block notches */}
      <div className="contactor-top-notches">
        <div className="notch"></div>
        <div className="notch"></div>
        <div className="notch"></div>
        {poles === 4 && <div className="notch"></div>}
      </div>

      {/* Row 1: Top Power Screws (1/L1, 3/L2, 5/L3, optional 7/L4) */}
      <div className="contactor-screws-layer contactor-power-screws-top">
        {renderScrew(t1, 'bottom', 'default', true)}
        {renderScrew(t3, 'bottom', 'default', true)}
        {renderScrew(t5, 'bottom', 'default', true)}
        {poles === 4 && renderScrew(t7, 'bottom', 'default', true)}
      </div>

      <div className="contactor-divider-bar top-divider"></div>

      {/* Row 2: Upper Auxiliary Screws (13 NO, 21 NC, A1) */}
      <div className="contactor-screws-layer contactor-aux-screws-upper">
        {renderScrew(t13, 'left', 'no', false)}
        {renderScrew(t21, 'left', 'nc', false)}
        {renderScrew(tA1, 'left', 'default', false)}
      </div>

      {/* Center Zone: Either Frontal Auxiliary Block (Photos 2 & 3) OR Native Plunger (Photo 1) */}
      {hasAuxBlock ? (
        <div className={`contactor-front-aux-zone aux-type-${auxType}`}>
          {/* Caixa do Bloco Frontal de Contatos Auxiliares */}
          <div className={`contactor-aux-block-box ${auxType === '2NO_2NC' ? 'box-quad' : 'box-dual'}`}>
            <div className="contactor-aux-dashed-line"></div>

            {/* Metade Superior */}
            <div className="contactor-aux-half top-half">
              {/* Opção 1: 1 NA + 1 NF (Foto 2) */}
              {auxType === '1NO_1NC' && (
                <>
                  <div className="contactor-aux-cell cell-left">
                    <span className="aux-indicator-text text-no">NO</span>
                    <span className="aux-num-text text-53">53</span>
                  </div>
                  <div className="contactor-aux-cell cell-right">
                    <span className="aux-indicator-text text-nc">NC</span>
                    <span className="aux-num-text text-61">61</span>
                  </div>
                </>
              )}

              {/* Opção 2: 2 NA (Foto 3) */}
              {auxType === '2NO' && (
                <>
                  <div className="contactor-aux-cell cell-left">
                    <span className="aux-indicator-text text-no">NO</span>
                    <span className="aux-num-text text-53">53</span>
                  </div>
                  <div className="contactor-aux-cell cell-right">
                    <span className="aux-indicator-text text-no">NO</span>
                    <span className="aux-num-text text-83">83</span>
                  </div>
                </>
              )}

              {/* Opção 3: 2 NF */}
              {auxType === '2NC' && (
                <>
                  <div className="contactor-aux-cell cell-left">
                    <span className="aux-indicator-text text-nc">NC</span>
                    <span className="aux-num-text text-61">61</span>
                  </div>
                  <div className="contactor-aux-cell cell-right">
                    <span className="aux-indicator-text text-nc">NC</span>
                    <span className="aux-num-text text-71">71</span>
                  </div>
                </>
              )}

              {/* Opção 4: 2 NA + 2 NF (Quádruplo) */}
              {auxType === '2NO_2NC' && (
                <>
                  <div className="contactor-aux-cell">
                    <span className="aux-indicator-text text-no">NO</span>
                    <span className="aux-num-text">53</span>
                  </div>
                  <div className="contactor-aux-cell">
                    <span className="aux-indicator-text text-nc">NC</span>
                    <span className="aux-num-text">61</span>
                  </div>
                  <div className="contactor-aux-cell">
                    <span className="aux-indicator-text text-nc">NC</span>
                    <span className="aux-num-text">71</span>
                  </div>
                  <div className="contactor-aux-cell">
                    <span className="aux-indicator-text text-no">NO</span>
                    <span className="aux-num-text">83</span>
                  </div>
                </>
              )}
            </div>

            {/* Metade Inferior */}
            <div className="contactor-aux-half bottom-half">
              {auxType === '1NO_1NC' && (
                <>
                  <div className="contactor-aux-cell cell-left">
                    <span className="aux-num-text text-54">54</span>
                  </div>
                  <div className="contactor-aux-cell cell-right">
                    <span className="aux-num-text text-62">62</span>
                  </div>
                </>
              )}

              {auxType === '2NO' && (
                <>
                  <div className="contactor-aux-cell cell-left">
                    <span className="aux-num-text text-54">54</span>
                  </div>
                  <div className="contactor-aux-cell cell-right">
                    <span className="aux-num-text text-84">84</span>
                  </div>
                </>
              )}

              {auxType === '2NC' && (
                <>
                  <div className="contactor-aux-cell cell-left">
                    <span className="aux-num-text text-62">62</span>
                  </div>
                  <div className="contactor-aux-cell cell-right">
                    <span className="aux-num-text text-72">72</span>
                  </div>
                </>
              )}

              {auxType === '2NO_2NC' && (
                <>
                  <div className="contactor-aux-cell">
                    <span className="aux-num-text">54</span>
                  </div>
                  <div className="contactor-aux-cell">
                    <span className="aux-num-text">62</span>
                  </div>
                  <div className="contactor-aux-cell">
                    <span className="aux-num-text">72</span>
                  </div>
                  <div className="contactor-aux-cell">
                    <span className="aux-num-text">84</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Parafusos interativos dos contatos auxiliares instalados */}
          <div className="contactor-aux-screws-layer">
            {renderScrew(t53, 'none', 'no', false)}
            {renderScrew(t54, 'none', 'no', false)}
            {renderScrew(t61, 'none', 'nc', false)}
            {renderScrew(t62, 'none', 'nc', false)}
            {renderScrew(t71, 'none', 'nc', false)}
            {renderScrew(t72, 'none', 'nc', false)}
            {renderScrew(t83, 'none', 'no', false)}
            {renderScrew(t84, 'none', 'no', false)}
          </div>
        </div>
      ) : (
        /* SEM CONTATO AUXILIAR: REPRODUÇÃO EXATA DA FOTO 1 (CIRCULADA EM VERMELHO) */
        <div className="contactor-no-aux-center-zone">
          {/* Mecanismo mecânico central idêntico à Foto 1 */}
          <div className="contactor-armature-mechanism-photo1">
            {/* Suporte cinza (duas pernas verticais e barra horizontal) */}
            <div className="armature-bracket-frame">
              <div className="armature-post left-post"></div>
              <div className="armature-post right-post"></div>
              <div className="armature-bottom-rail"></div>
            </div>

            {/* Barra retangular branca horizontal com 3 compartimentos e slug central */}
            <div className="armature-window-plate">
              <div className="plate-segment left-segment"></div>
              <div className="plate-segment center-segment">
                <div
                  className={`armature-slug ${
                    isEnergized ? 'slug-pulled' : 'slug-released'
                  }`}
                ></div>
              </div>
              <div className="plate-segment right-segment"></div>
            </div>
          </div>
        </div>
      )}

      {/* Identificação da tensão da bobina na lateral esquerda (ex: 220V~) */}
      <div className="contactor-coil-left-spec">
        <span className="coil-voltage-text">
          {coilVoltage ? coilVoltage.replace(/V?\s*AC/, 'V~').replace(/V?\s*DC/, 'V DC') : '220V~'}
        </span>
      </div>

      {/* Row 3: Lower Auxiliary Screws (14 NO, 22 NC, A2) */}
      <div className="contactor-screws-layer contactor-aux-screws-lower">
        {renderScrew(t14, 'left', 'no', false)}
        {renderScrew(t22, 'left', 'nc', false)}
        {renderScrew(tA2, 'left', 'default', false)}
      </div>

      <div className="contactor-divider-bar bottom-divider"></div>

      {/* Row 4: Bottom Power Screws (2/T1, 4/T2, 6/T3, optional 8/T4) */}
      <div className="contactor-screws-layer contactor-power-screws-bottom">
        {renderScrew(t2, 'top', 'default', true)}
        {renderScrew(t4, 'top', 'default', true)}
        {renderScrew(t6, 'top', 'default', true)}
        {poles === 4 && renderScrew(t8, 'top', 'default', true)}
      </div>

      {/* Bottom terminal block notches */}
      <div className="contactor-bottom-notches">
        <div className="notch"></div>
        <div className="notch"></div>
        <div className="notch"></div>
        {poles === 4 && <div className="notch"></div>}
      </div>
    </div>
  );
}
