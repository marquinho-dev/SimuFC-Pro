import React, { useState } from 'react';

/**
 * Realistic Industrial DIN Rail TS-35 (Standard 35mm Mounting Rail)
 * EN 60715 / IEC 60715 compliant visual profile with oblong mounting slots,
 * galvanized steel finish, length adjuster, and auto-alignment action.
 */
export default function DinRailElement({
  component,
  isSelected = false,
  onStartResize,
  isSimulationMode = false,
}) {
  const length = Math.max(300, Math.min(2200, Number(component.state?.length) || 800));
  const height = 50; // Standard 35mm rail proportional height
  const [isHovered, setIsHovered] = useState(false);

  // Slot calculations: 1 slot every 36px
  const slotPitch = 36;
  const slotCount = Math.floor((length - 40) / slotPitch);
  const startX = Math.round((length - (slotCount - 1) * slotPitch) / 2);

  return (
    <div
      className={`din-rail-device ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
      style={{ width: `${length}px`, height: `${height}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Realistic Metallic Rail Surface (SVG) */}
      <svg
        className="din-rail-svg"
        width={length}
        height={height}
        viewBox={`0 0 ${length} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top flange metallic bevel */}
          <linearGradient id="dinTopFlange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Recessed center channel */}
          <linearGradient id="dinCenterChannel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="12%" stopColor="#475569" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="88%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Bottom flange metallic bevel */}
          <linearGradient id="dinBotFlange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Oblong slot inner shadow */}
          <linearGradient id="dinSlotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Screw head gradient */}
          <radialGradient id="dinScrewHead" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
        </defs>

        {/* Drop shadow underneath the rail */}
        <rect
          x="1"
          y="2"
          width={length - 2}
          height={height}
          rx="3"
          fill="rgba(0, 0, 0, 0.45)"
          filter="blur(2px)"
        />

        {/* Top Lip (Flange Superior 7.5mm) */}
        <rect
          x="0"
          y="0"
          width={length}
          height="8"
          rx="1"
          fill="url(#dinTopFlange)"
        />
        {/* Top highlight highlight line */}
        <line x1="0" y1="0.5" x2={length} y2="0.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
        <line x1="0" y1="7.5" x2={length} y2="7.5" stroke="#334155" strokeWidth="1" opacity="0.9" />

        {/* Recessed Center Channel (Canal Central 34mm) */}
        <rect
          x="0"
          y="8"
          width={length}
          height="34"
          fill="url(#dinCenterChannel)"
        />
        {/* Inner shadow at channel edges */}
        <line x1="0" y1="8.5" x2={length} y2="8.5" stroke="#0f172a" strokeWidth="1.2" opacity="0.8" />
        <line x1="0" y1="41.5" x2={length} y2="41.5" stroke="#0f172a" strokeWidth="1.2" opacity="0.8" />

        {/* Oblong Mounting Slots (Rasgos Oblongos 6.2 x 18 mm) */}
        {Array.from({ length: slotCount }).map((_, i) => {
          const cx = startX + i * slotPitch;
          // Every 4th slot has a panel mounting screw
          const hasScrew = i % 4 === 1 && cx > 40 && cx < length - 40;

          return (
            <g key={i}>
              {/* Slot cutout shadow */}
              <rect
                x={cx - 10}
                y="17"
                width="20"
                height="16"
                rx="5"
                fill="url(#dinSlotGrad)"
                stroke="#0f172a"
                strokeWidth="1"
              />
              {/* Highlight bevel on bottom edge of slot */}
              <path
                d={`M ${cx - 7} 33 L ${cx + 7} 33`}
                stroke="#cbd5e1"
                strokeWidth="0.8"
                opacity="0.4"
              />

              {/* Panel fastening screw with washer */}
              {hasScrew && (
                <g>
                  {/* Washer */}
                  <circle cx={cx} cy="25" r="7.5" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
                  {/* Bolt head */}
                  <circle cx={cx} cy="25" r="5.5" fill="url(#dinScrewHead)" stroke="#475569" strokeWidth="0.6" />
                  {/* Phillips cross drive */}
                  <line x1={cx - 3.5} y1="25" x2={cx + 3.5} y2="25" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={cx} y1="21.5" x2={cx} y2="28.5" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}

        {/* Bottom Lip (Flange Inferior 7.5mm) */}
        <rect
          x="0"
          y="42"
          width={length}
          height="8"
          rx="1"
          fill="url(#dinBotFlange)"
        />
        {/* Bottom highlights & shadows */}
        <line x1="0" y1="42.5" x2={length} y2="42.5" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.6" />
        <line x1="0" y1="49.5" x2={length} y2="49.5" stroke="#1e293b" strokeWidth="1" opacity="0.8" />

        {/* Laser Engraved Standard Markings */}
        {length >= 500 && (
          <text
            x={length / 2}
            y="14"
            fill="#94a3b8"
            fontSize="7.5"
            fontWeight="700"
            letterSpacing="0.08em"
            textAnchor="middle"
            opacity="0.65"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            DIN EN 60715 • TH 35-7.5 • AÇO ZINCADO PASSIVADO
          </text>
        )}

        {/* Millimeter Scale Ticks along the bottom edge */}
        {Array.from({ length: Math.floor(length / 20) }).map((_, idx) => {
          const x = idx * 20;
          const isMajor = idx % 5 === 0;
          return (
            <line
              key={idx}
              x1={x}
              y1={isMajor ? 44 : 46}
              x2={x}
              y2="49"
              stroke="#64748b"
              strokeWidth={isMajor ? 1 : 0.6}
              opacity={isMajor ? 0.8 : 0.5}
            />
          );
        })}
      </svg>

      {/* Resize Handle on Right Edge */}
      {!isSimulationMode && (
        <div
          className="din-rail-resize-handle"
          onMouseDown={(e) => {
            e.stopPropagation();
            if (onStartResize) {
              onStartResize(e, component.id, length);
            }
          }}
          title="Arraste para redimensionar o comprimento do trilho"
        >
          <div className="resize-handle-bar"></div>
        </div>
      )}
    </div>
  );
}
