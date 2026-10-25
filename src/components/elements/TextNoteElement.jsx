import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check } from 'lucide-react';

const FONT_SIZES = {
  small: { fontSize: 13, minWidth: 100, minHeight: 32, padding: '4px 10px' },
  medium: { fontSize: 16, minWidth: 140, minHeight: 40, padding: '6px 14px' },
  large: { fontSize: 22, minWidth: 180, minHeight: 48, padding: '8px 18px' },
  xlarge: { fontSize: 30, minWidth: 220, minHeight: 58, padding: '10px 24px' },
};

const BG_STYLES = {
  badge: {
    background: 'rgba(15, 23, 42, 0.82)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
  },
  transparent: {
    background: 'transparent',
    border: '1px dashed rgba(148, 163, 184, 0.3)',
    borderRadius: '6px',
    textShadow: '0 2px 6px rgba(0, 0, 0, 0.95)',
  },
  warning: {
    background: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)',
    border: '2px solid #ca8a04',
    borderRadius: '6px',
    color: '#0f172a',
    boxShadow: '0 4px 16px rgba(234, 179, 8, 0.3)',
    textShadow: 'none',
  },
  tag: {
    background: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '4px',
    color: '#0f172a',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
    textShadow: 'none',
  },
  blueprint: {
    background: 'rgba(8, 47, 73, 0.88)',
    border: '1.5px solid #0284c7',
    borderRadius: '6px',
    color: '#38bdf8',
    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
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
  const fontSizeKey = state.fontSize || 'medium';
  const sizeConfig = FONT_SIZES[fontSizeKey] || FONT_SIZES.medium;
  const bgStyleKey = state.bgStyle || 'badge';
  const customColor = state.textColor || '#f8fafc';
  const isBold = state.bold !== false;

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
        minWidth: `${sizeConfig.minWidth}px`,
        minHeight: `${sizeConfig.minHeight}px`,
        padding: sizeConfig.padding,
        fontSize: `${sizeConfig.fontSize}px`,
        fontWeight: isBold ? 700 : 500,
        color: textColor,
        fontFamily: bgStyleKey === 'tag' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'inherit',
        lineHeight: 1.35,
        whiteSpace: 'pre-wrap',
        textAlign: 'left',
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
              background: 'rgba(0, 0, 0, 0.4)',
              color: textColor,
              fontSize: `${sizeConfig.fontSize}px`,
              fontWeight: isBold ? 700 : 500,
              fontFamily: 'inherit',
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              padding: '4px 6px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
          <span style={{ flex: 1, wordBreak: 'break-word' }}>
            {currentText || 'Clique duas vezes para editar'}
          </span>
          {isSelected && !isSimulationMode && (
            <button
              type="button"
              className="text-note-quick-edit"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Editar Texto (ou clique duas vezes)"
              style={{
                background: 'rgba(2, 132, 199, 0.25)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: '#38bdf8',
                borderRadius: '4px',
                padding: '3px 5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8,
              }}
            >
              <Edit3 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
