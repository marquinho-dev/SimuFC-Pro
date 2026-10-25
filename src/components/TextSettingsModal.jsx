import React, { useState, useEffect } from 'react';
import {
  X,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Palette,
  Check,
} from 'lucide-react';

const FONT_FAMILIES = [
  { id: 'sans', label: 'Padrão (Inter)', value: 'sans-serif' },
  { id: 'monospace', label: 'Técnica (Mono)', value: 'monospace' },
  { id: 'display', label: 'Destaque (Painel)', value: 'display' },
  { id: 'serif', label: 'Clássica (Serif)', value: 'serif' },
];

const PRESET_COLORS = [
  { label: 'Branco', color: '#ffffff' },
  { label: 'Amarelo', color: '#eab308' },
  { label: 'Verde', color: '#22c55e' },
  { label: 'Vermelho', color: '#ef4444' },
  { label: 'Ciano / Azul', color: '#38bdf8' },
  { label: 'Roxo', color: '#a855f7' },
  { label: 'Laranja', color: '#f97316' },
  { label: 'Cinza Claro', color: '#cbd5e1' },
  { label: 'Preto', color: '#0f172a' },
];

const BG_STYLE_OPTIONS = [
  { id: 'badge', label: 'Plaqueta Escura (Glass)', desc: 'Fundo escuro translúcido com borda suave' },
  { id: 'transparent', label: 'Transparente', desc: 'Apenas texto flutuante sem caixa' },
  { id: 'warning', label: 'Aviso de Segurança ⚠️', desc: 'Fundo amarelo industrial de segurança' },
  { id: 'tag', label: 'Plaqueta Branca', desc: 'Etiqueta plástica branca de borneira/painel' },
  { id: 'blueprint', label: 'Blueprint Técnico', desc: 'Fundo azul-marinho com contorno ciano CAD' },
];

const PRESET_SIZES = [12, 14, 16, 20, 24, 30, 36];

export default function TextSettingsModal({
  isOpen,
  onClose,
  component,
  onSaveSettings,
}) {
  const state = component?.state || {};

  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('sans');
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgStyle, setBgStyle] = useState('badge');
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [align, setAlign] = useState('left');

  useEffect(() => {
    if (component && isOpen) {
      const s = component.state || {};
      setText(s.text || 'Texto de Identificação');
      let size = 16;
      if (typeof s.fontSize === 'number') size = s.fontSize;
      else if (s.fontSize === 'small') size = 13;
      else if (s.fontSize === 'medium') size = 16;
      else if (s.fontSize === 'large') size = 22;
      else if (s.fontSize === 'xlarge') size = 30;
      setFontSize(size);
      setFontFamily(s.fontFamily || 'sans');
      setTextColor(s.textColor || '#f8fafc');
      setBgStyle(s.bgStyle || 'badge');
      setIsBold(s.bold !== false);
      setIsItalic(Boolean(s.italic));
      setIsUnderline(Boolean(s.underline));
      setIsStrike(Boolean(s.strike));
      setAlign(s.align || 'left');
    }
  }, [component?.id, isOpen]);

  if (!isOpen || !component) return null;

  const handleSave = () => {
    onSaveSettings(component.id, {
      text: text.trim() || 'Texto',
      fontSize,
      fontFamily,
      textColor,
      bgStyle,
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      strike: isStrike,
      align,
    });
    onClose();
  };

  const computedFontFamily =
    fontFamily === 'monospace'
      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      : fontFamily === 'serif'
      ? 'Georgia, Cambria, "Times New Roman", Times, serif'
      : fontFamily === 'display'
      ? '"Arial Black", Impact, sans-serif'
      : 'inherit';

  const previewColor = bgStyle === 'warning' || bgStyle === 'tag' ? '#0f172a' : textColor;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog breaker-settings-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Type className="header-icon" />
            <h2>CONFIGURAÇÕES DE TEXTO & ETIQUETA</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body breaker-settings-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Preview da Etiqueta */}
          <div
            style={{
              background: '#090d16',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '90px',
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: computedFontFamily,
                fontWeight: isBold ? 700 : 400,
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: [
                  isUnderline ? 'underline' : '',
                  isStrike ? 'line-through' : '',
                ].filter(Boolean).join(' ') || 'none',
                textAlign: align,
                color: previewColor,
                lineHeight: 1.35,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxWidth: '100%',
                ...(bgStyle === 'badge' && {
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                  padding: '8px 16px',
                }),
                ...(bgStyle === 'transparent' && {
                  background: 'transparent',
                  border: '1px dashed rgba(148, 163, 184, 0.3)',
                  borderRadius: '4px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
                  padding: '4px 8px',
                }),
                ...(bgStyle === 'warning' && {
                  background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
                  border: '2px solid #ca8a04',
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
                  padding: '8px 16px',
                }),
                ...(bgStyle === 'tag' && {
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '4px',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
                  padding: '6px 14px',
                }),
                ...(bgStyle === 'blueprint' && {
                  background: 'rgba(8, 47, 73, 0.88)',
                  border: '1.5px solid #0284c7',
                  borderRadius: '6px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                  padding: '8px 16px',
                }),
              }}
            >
              {text || 'Digite seu texto abaixo...'}
            </div>
          </div>

          {/* 2. Campo de Texto */}
          <div className="settings-section">
            <label className="section-label">CONTEÚDO DO TEXTO</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o texto da etiqueta ou anotação..."
              rows={2}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* 3. Formatação & Alinhamento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Formatação (Bold, Italic, Underline, Strike) */}
            <div className="settings-section">
              <label className="section-label">ESTILO DO TEXTO</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`btn-toolbar ${isBold ? 'active' : ''}`}
                  onClick={() => setIsBold((prev) => !prev)}
                  title="Negrito (Bold)"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: isBold ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: isBold ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: isBold ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  className={`btn-toolbar ${isItalic ? 'active' : ''}`}
                  onClick={() => setIsItalic((prev) => !prev)}
                  title="Itálico (Italic)"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: isItalic ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: isItalic ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: isItalic ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  className={`btn-toolbar ${isUnderline ? 'active' : ''}`}
                  onClick={() => setIsUnderline((prev) => !prev)}
                  title="Sublinhado (Underline)"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: isUnderline ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: isUnderline ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: isUnderline ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <Underline size={15} />
                </button>
                <button
                  type="button"
                  className={`btn-toolbar ${isStrike ? 'active' : ''}`}
                  onClick={() => setIsStrike((prev) => !prev)}
                  title="Tachado (Strikethrough)"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: isStrike ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: isStrike ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: isStrike ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <Strikethrough size={15} />
                </button>
              </div>
            </div>

            {/* Alinhamento */}
            <div className="settings-section">
              <label className="section-label">ALINHAMENTO</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`btn-toolbar ${align === 'left' ? 'active' : ''}`}
                  onClick={() => setAlign('left')}
                  title="Alinhar à Esquerda"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: align === 'left' ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: align === 'left' ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: align === 'left' ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <AlignLeft size={15} />
                </button>
                <button
                  type="button"
                  className={`btn-toolbar ${align === 'center' ? 'active' : ''}`}
                  onClick={() => setAlign('center')}
                  title="Centralizar"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: align === 'center' ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: align === 'center' ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: align === 'center' ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <AlignCenter size={15} />
                </button>
                <button
                  type="button"
                  className={`btn-toolbar ${align === 'right' ? 'active' : ''}`}
                  onClick={() => setAlign('right')}
                  title="Alinhar à Direita"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: align === 'right' ? '#0284c7' : 'rgba(15, 23, 42, 0.8)',
                    borderColor: align === 'right' ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)',
                    color: align === 'right' ? '#ffffff' : '#94a3b8',
                  }}
                >
                  <AlignRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Família da Fonte & Tamanho */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="settings-section">
              <label className="section-label">FONTE TIPOGRÁFICA</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.id} value={f.id} style={{ background: '#0f172a', color: '#fff' }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="section-label" style={{ margin: 0 }}>TAMANHO</label>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{fontSize}px</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="11"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#38bdf8' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {PRESET_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFontSize(s)}
                    style={{
                      flex: 1,
                      padding: '2px 0',
                      fontSize: '10px',
                      borderRadius: '3px',
                      border: '1px solid',
                      borderColor: fontSize === s ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                      background: fontSize === s ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      color: fontSize === s ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Cores do Texto */}
          <div className="settings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="section-label" style={{ margin: 0 }}>
                <Palette size={14} className="inline-icon" /> COR DO TEXTO
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: textColor, display: 'inline-block', border: '1px solid #fff' }} />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{textColor}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => setTextColor(p.color)}
                  title={p.label}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: p.color,
                    border: textColor.toLowerCase() === p.color.toLowerCase() ? '2.5px solid #38bdf8' : '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transform: textColor.toLowerCase() === p.color.toLowerCase() ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                />
              ))}
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                title="Escolher cor personalizada"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            </div>
          </div>

          {/* 6. Estilo Visual de Fundo (Placa / Caixa) */}
          <div className="settings-section">
            <label className="section-label">
              <Layers size={14} className="inline-icon" /> ESTILO VISUAL DE FUNDO
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {BG_STYLE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setBgStyle(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: bgStyle === opt.id ? 'rgba(2, 132, 199, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${bgStyle === opt.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="bgStyle"
                    checked={bgStyle === opt.id}
                    onChange={() => setBgStyle(opt.id)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: bgStyle === opt.id ? '#ffffff' : '#cbd5e1' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {opt.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-modal-save" onClick={handleSave}>
            <Check size={16} />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
}
