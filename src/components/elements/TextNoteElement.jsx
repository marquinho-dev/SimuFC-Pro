import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

const BG_STYLES = {
  badge: {
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
    padding: '8px 16px',
  },
  transparent: {
    background: 'transparent',
    border: '1px dashed rgba(148, 163, 184, 0.3)',
    borderRadius: '4px',
    textShadow: '0 2px 6px rgba(0, 0, 0, 0.95)',
    padding: '4px 8px',
  },
  warning: {
    background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
    border: '2px solid #ca8a04',
    borderRadius: '6px',
    color: '#0f172a',
    boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
    textShadow: 'none',
    padding: '8px 16px',
  },
  tag: {
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '4px',
    color: '#0f172a',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
    textShadow: 'none',
    padding: '6px 14px',
  },
  blueprint: {
    background: 'rgba(8, 47, 73, 0.88)',
    border: '1.5px solid #0284c7',
    borderRadius: '6px',
    color: '#38bdf8',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
    padding: '8px 16px',
  },
};

export default function TextNoteElement({
  component,
  isSelected,
  onUpdateComponentState,
  isSimulationMode,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const state = component.state || {};
  const currentText = state.text || 'Texto de Identificação';

  let resolvedFontSize = 16;
  if (typeof state.fontSize === 'number') {
    resolvedFontSize = state.fontSize;
  } else if (state.fontSize === 'small') {
    resolvedFontSize = 13;
  } else if (state.fontSize === 'large') {
    resolvedFontSize = 22;
  } else if (state.fontSize === 'xlarge') {
    resolvedFontSize = 30;
  }

  const bgStyleKey = state.bgStyle || 'badge';
  const customColor = state.textColor || '#f8fafc';
  const isBold = state.bold !== false;
  const isItalic = Boolean(state.italic);
  const isUnderline = Boolean(state.underline);
  const isStrike = Boolean(state.strike);
  const align = state.align || 'left';
  const fontFamilyKey = state.fontFamily || 'sans';

  const [editText, setEditText] = useState(currentText);
  const textareaRef = useRef(null);

  useEffect(() => {
    setEditText(currentText);
  }, [currentText]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleCommit = () => {
    setIsEditing(false);
    const trimmed = editText.trim();
    if (onUpdateComponentState && trimmed !== currentText) {
      onUpdateComponentState(component.id, { text: trimmed || 'Texto' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditText(currentText);
      setIsEditing(false);
    }
  };

  const currentBgStyle = BG_STYLES[bgStyleKey] || BG_STYLES.badge;
  const textColor = bgStyleKey === 'warning' || bgStyleKey === 'tag' ? '#0f172a' : customColor;

  const computedFontFamily =
    fontFamilyKey === 'monospace'
      ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      : fontFamilyKey === 'serif'
      ? 'Georgia, Cambria, "Times New Roman", Times, serif'
      : fontFamilyKey === 'display'
      ? '"Arial Black", Impact, sans-serif'
      : 'inherit';

  const textDecorations = [
    isUnderline ? 'underline' : '',
    isStrike ? 'line-through' : '',
  ].filter(Boolean).join(' ') || 'none';

  return (
    <div
      className={`text-note-element ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isSimulationMode) setIsEditing(true);
      }}
      style={{
        position: 'relative',
        cursor: isEditing ? 'text' : 'move',
        userSelect: isEditing ? 'text' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${resolvedFontSize}px`,
        fontWeight: isBold ? 700 : 400,
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: textDecorations,
        fontFamily: computedFontFamily,
        textAlign: align,
        color: textColor,
        lineHeight: 1.35,
        whiteSpace: 'pre-wrap',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...currentBgStyle,
        ...(isSelected && {
          outline: '2px solid #38bdf8',
          outlineOffset: '2px',
        }),
      }}
    >
      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '6px' }}>
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            rows={Math.max(1, editText.split('\n').length)}
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              color: textColor,
              fontSize: `${resolvedFontSize}px`,
              fontWeight: isBold ? 700 : 400,
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: textDecorations,
              fontFamily: computedFontFamily,
              textAlign: align,
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              padding: '4px 8px',
              outline: 'none',
              resize: 'none',
              width: '100%',
              minWidth: '120px',
              lineHeight: 1.35,
            }}
          />
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleCommit();
            }}
            style={{
              background: '#0284c7',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Salvar Texto (Enter)"
          >
            <Check size={14} />
          </button>
        </div>
      ) : (
        <span style={{ width: '100%', wordBreak: 'break-word', display: 'block' }}>
          {currentText || 'Clique duas vezes para editar'}
        </span>
      )}
    </div>
  );
}
