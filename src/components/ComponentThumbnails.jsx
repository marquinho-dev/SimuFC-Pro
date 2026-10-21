import React from 'react';

/**
 * High-fidelity realistic SVG miniatures of each industrial electrical component,
 * matching 1:1 the exact visuals, colors, plates, screws, badges, and textures of the
 * real components on the board canvas.
 */

/* ==========================================================
   1. POWER SOURCE THUMBNAIL (BARRAMENTO DE ALIMENTAÇÃO)
   Matching PowerSourceElement: dark polycarbonate panel,
   header bar with green LED & pill, and 5 continuous busbars
   (L1 brown, L2 black, L3 red, N cyan, PE green/yellow stripe)
   with left identifying badges.
   ========================================================== */
export function PowerSourceThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '4px' }}>
      <img
        src="/assets/transformer.png"
        alt="Transformador de Tensão"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      <span style={{
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        fontSize: '7.5px',
        fontWeight: '800',
        color: '#22c55e',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        padding: '0 4px',
        borderRadius: '3px',
      }}>
        +PE
      </span>
    </div>
  );
}

/* ==========================================================
   2. CIRCUIT BREAKER THUMBNAIL (DISJUNTOR TERMOMAGNÉTICO DIN)
   Matching BreakersElement: Modular 3-pole DIN breaker,
   brass screw wells on top & bottom tiers, raised front plate,
   blue gang bar handle with "ON", status flag, and "C25A" spec.
   ========================================================== */
export function BreakerThumbnail() {
  return (
    <svg viewBox="0 0 92 84" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="brkThumbTier" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8ccd1" />
          <stop offset="100%" stopColor="#d7dbdf" />
        </linearGradient>
        <linearGradient id="brkThumbFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="5%" stopColor="#eceff1" />
          <stop offset="95%" stopColor="#e4e7ea" />
          <stop offset="100%" stopColor="#d8dcde" />
        </linearGradient>
        <linearGradient id="brkThumbBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8e2aa" />
          <stop offset="40%" stopColor="#cbc07b" />
          <stop offset="80%" stopColor="#9e9450" />
          <stop offset="100%" stopColor="#6e6631" />
        </linearGradient>
        <linearGradient id="brkThumbBlueToggle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d6efd" />
          <stop offset="40%" stopColor="#0a58ca" />
          <stop offset="100%" stopColor="#052c65" />
        </linearGradient>
        <linearGradient id="brkThumbBlueBar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0b5ed7" />
          <stop offset="25%" stopColor="#084fad" />
          <stop offset="100%" stopColor="#021b40" />
        </linearGradient>
      </defs>

      {/* Top Recessed Tier */}
      <rect x="12" y="4" width="68" height="15" rx="2" fill="url(#brkThumbTier)" stroke="#8a9097" strokeWidth="0.8" />
      {/* Bottom Recessed Tier */}
      <rect x="12" y="65" width="68" height="15" rx="2" fill="url(#brkThumbTier)" stroke="#8a9097" strokeWidth="0.8" />

      {/* Middle Raised Front Plate */}
      <rect x="12" y="17" width="68" height="50" fill="url(#brkThumbFront)" stroke="#a0a6ac" strokeWidth="0.8" />
      <line x1="12" y1="17.5" x2="80" y2="17.5" stroke="#ffffff" strokeWidth="1" />

      {/* Pole Dividers (3-Pole) */}
      <line x1="34.6" y1="4" x2="34.6" y2="80" stroke="#b5bac0" strokeWidth="0.8" />
      <line x1="57.3" y1="4" x2="57.3" y2="80" stroke="#b5bac0" strokeWidth="0.8" />

      {/* Top Terminal Screws (Brass with Cross Slot) */}
      {[23.3, 46, 68.6].map((cx) => (
        <g key={`top-screw-${cx}`}>
          <circle cx={cx} cy="11.5" r="4.2" fill="#9ea4aa" />
          <circle cx={cx} cy="11.5" r="3.2" fill="url(#brkThumbBrass)" stroke="#615a2b" strokeWidth="0.5" />
          <line x1={cx - 1.8} y1="11.5" x2={cx + 1.8} y2="11.5" stroke="#373117" strokeWidth="0.8" />
          <line x1={cx} y1="9.7" x2={cx} y2="13.3" stroke="#373117" strokeWidth="0.8" />
        </g>
      ))}

      {/* Bottom Terminal Screws */}
      {[23.3, 46, 68.6].map((cx) => (
        <g key={`bot-screw-${cx}`}>
          <circle cx={cx} cy="72.5" r="4.2" fill="#9ea4aa" />
          <circle cx={cx} cy="72.5" r="3.2" fill="url(#brkThumbBrass)" stroke="#615a2b" strokeWidth="0.5" />
          <line x1={cx - 1.8} y1="72.5" x2={cx + 1.8} y2="72.5" stroke="#373117" strokeWidth="0.8" />
          <line x1={cx} y1="70.7" x2={cx} y2="74.3" stroke="#373117" strokeWidth="0.8" />
        </g>
      ))}

      {/* Technical Labels & Ratings */}
      <text x="16" y="24" fill="#1e293b" fontSize="4.5" fontWeight="bold" fontFamily="sans-serif">Q1</text>
      <rect x="16" y="27" width="8" height="2.8" rx="1.4" fill="#c92a2a" stroke="#a61e1e" strokeWidth="0.5" />
      <text x="68.6" y="26" fill="#00478f" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">C25A</text>
      <text x="68.6" y="30" fill="#64748b" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">400V~ 4.5kA</text>

      {/* Switch Cavity Frames (3 poles) */}
      {[23.3, 46, 68.6].map((cx) => (
        <g key={`cavity-${cx}`}>
          <rect x={cx - 8} y="37" width="16" height="21" rx="2" fill="#d0d5d9" />
          <rect x={cx - 7} y="38" width="14" height="19" rx="1.5" fill="#e9ecef" />
          {/* Individual Blue Toggle Lever */}
          <rect x={cx - 5.5} y="39" width="11" height="15" rx="1.5" fill="url(#brkThumbBlueToggle)" />
        </g>
      ))}

      {/* Gang Connector Bar across all 3 poles */}
      <rect x="14" y="44" width="64" height="8.5" rx="2" fill="url(#brkThumbBlueBar)" stroke="#021b40" strokeWidth="0.6" />
      <line x1="15" y1="45" x2="77" y2="45" stroke="#4dabf7" strokeWidth="0.6" opacity="0.7" />
      <text x="46" y="50" fill="#ffffff" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        ON
      </text>
    </svg>
  );
}

/* ==========================================================
   3. CONTACTOR THUMBNAIL (CONTATOR DE POTÊNCIA)
   Matching ContactorElement / .contactor-realistic-plate:
   Authentic light silver/gray body (#d1d9e2), top & bottom dark
   notches, top/bottom barrier ribs, 3 top & bottom large power
   screws, auxiliary screws (13/14 NO, 21/22 NC, A1/A2), center
   plunger bracket mechanism with chamber and "220V AC" coil spec.
   ========================================================== */
export function ContactorThumbnail() {
  return (
    <svg viewBox="0 0 84 96" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="contPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="3%" stopColor="#d1d9e2" />
          <stop offset="97%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#b9c4cf" />
        </linearGradient>
        <radialGradient id="contScrewMetal" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
      </defs>

      {/* Contactor Main Plate (#d1d9e2) */}
      <rect x="6" y="4" width="72" height="88" rx="4" fill="url(#contPlateGrad)" stroke="#85929e" strokeWidth="1.2" />

      {/* Top terminal block notches */}
      <rect x="15" y="4" width="11" height="3" rx="0 0 1.5 1.5" fill="#1e293b" />
      <rect x="36.5" y="4" width="11" height="3" rx="0 0 1.5 1.5" fill="#1e293b" />
      <rect x="58" y="4" width="11" height="3" rx="0 0 1.5 1.5" fill="#1e293b" />

      {/* Bottom terminal block notches */}
      <rect x="15" y="89" width="11" height="3" rx="1.5 1.5 0 0" fill="#1e293b" />
      <rect x="36.5" y="89" width="11" height="3" rx="1.5 1.5 0 0" fill="#1e293b" />
      <rect x="58" y="89" width="11" height="3" rx="1.5 1.5 0 0" fill="#1e293b" />

      {/* Top & Bottom Horizontal Divider Ribs */}
      <rect x="7" y="22" width="70" height="2" fill="#b5c2cf" stroke="#9aa8b7" strokeWidth="0.4" />
      <rect x="7" y="72" width="70" height="2" fill="#b5c2cf" stroke="#9aa8b7" strokeWidth="0.4" />

      {/* Row 1: Top Power Screws (1/L1, 3/L2, 5/L3) */}
      {[20.5, 42, 63.5].map((cx, idx) => {
        const labels = ['1/L1', '3/L2', '5/L3'];
        return (
          <g key={`pwr-top-${cx}`}>
            <circle cx={cx} cy="13" r="4.2" fill="#475569" />
            <circle cx={cx} cy="13" r="3.4" fill="url(#contScrewMetal)" stroke="#334155" strokeWidth="0.5" />
            <line x1={cx - 1.8} y1="13" x2={cx + 1.8} y2="13" stroke="#1e293b" strokeWidth="0.8" />
            <line x1={cx} y1="11.2" x2={cx} y2="14.8" stroke="#1e293b" strokeWidth="0.8" />
            <text x={cx} y="20" fill="#334155" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {labels[idx]}
            </text>
          </g>
        );
      })}

      {/* Row 2: Upper Auxiliary Screws (13 NO, 21 NC, A1) */}
      <circle cx="21" cy="30" r="2.8" fill="url(#contScrewMetal)" stroke="#475569" strokeWidth="0.5" />
      <text x="21" y="36" fill="#16a34a" fontSize="2.7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">13 NO</text>

      <circle cx="42" cy="30" r="2.8" fill="url(#contScrewMetal)" stroke="#475569" strokeWidth="0.5" />
      <text x="42" y="36" fill="#ea580c" fontSize="2.7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">21 NC</text>

      <circle cx="63" cy="30" r="2.8" fill="url(#contScrewMetal)" stroke="#475569" strokeWidth="0.5" />
      <text x="63" y="36" fill="#334155" fontSize="2.7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A1</text>

      {/* Center Zone: Tag, Coil Spec, & Realistic Plunger Mechanism */}
      <text x="12" y="47" fill="#1e293b" fontSize="4.8" fontWeight="900" fontFamily="sans-serif">K1</text>
      <text x="12" y="54" fill="#dc2626" fontSize="3" fontWeight="bold" fontFamily="sans-serif">220V AC</text>

      {/* Plunger Bracket & Window */}
      <g transform="translate(36, 42)">
        {/* Left & Right Bracket Guides */}
        <path d="M 4 2 L 1 2 L 1 18 L 4 18" fill="none" stroke="#64748b" strokeWidth="1" />
        <path d="M 34 2 L 37 2 L 37 18 L 34 18" fill="none" stroke="#64748b" strokeWidth="1" />
        {/* Core Chamber */}
        <rect x="5" y="4" width="28" height="12" rx="1.5" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
        <rect x="10" y="6" width="18" height="8" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />
        {/* Plunger Slug */}
        <rect x="13" y="7.5" width="12" height="5" rx="0.8" fill="#738496" stroke="#475569" strokeWidth="0.5" />
      </g>

      {/* Row 3: Lower Auxiliary Screws (14 NO, 22 NC, A2) */}
      <circle cx="21" cy="65" r="2.8" fill="url(#contScrewMetal)" stroke="#475569" strokeWidth="0.5" />
      <text x="21" y="62" fill="#16a34a" fontSize="2.7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">14 NO</text>

      <circle cx="42" cy="65" r="2.8" fill="url(#contScrewMetal)" stroke="#475569" strokeWidth="0.5" />
      <text x="42" y="62" fill="#ea580c" fontSize="2.7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">22 NC</text>

      <circle cx="63" cy="65" r="2.8" fill="url(#contScrewMetal)" stroke="#475569" strokeWidth="0.5" />
      <text x="63" y="62" fill="#334155" fontSize="2.7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A2</text>

      {/* Row 4: Bottom Power Screws (2/T1, 4/T2, 6/T3) */}
      {[20.5, 42, 63.5].map((cx, idx) => {
        const labels = ['2/T1', '4/T2', '6/T3'];
        return (
          <g key={`pwr-bot-${cx}`}>
            <circle cx={cx} cy="81" r="4.2" fill="#475569" />
            <circle cx={cx} cy="81" r="3.4" fill="url(#contScrewMetal)" stroke="#334155" strokeWidth="0.5" />
            <line x1={cx - 1.8} y1="81" x2={cx + 1.8} y2="81" stroke="#1e293b" strokeWidth="0.8" />
            <line x1={cx} y1="79.2" x2={cx} y2="82.8" stroke="#1e293b" strokeWidth="0.8" />
            <text x={cx} y="76" fill="#334155" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {labels[idx]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ==========================================================
   4. THERMAL RELAY THUMBNAIL (RELÉ TÉRMICO DE SOBRECARGA)
   Matching ThermalRelayElement: 3 upper copper prongs (1, 3, 5),
   industrial dark chassis, current dial, red STOP and blue RESET
   push pins, test flag, auxiliary block (95-98) & lower terminals.
   ========================================================== */
export function ThermalRelayThumbnail() {
  return (
    <svg viewBox="0 0 88 92" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="thmProngGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="thmBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="20%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* 3 Upper Copper Connecting Prongs (1, 3, 5) to plug into contactor */}
      {[22, 44, 66].map((cx) => (
        <g key={`prong-${cx}`}>
          <rect x={cx - 2.8} y="3" width="5.6" height="12" rx="1.2" fill="url(#thmProngGrad)" stroke="#78350f" strokeWidth="0.6" />
          <circle cx={cx} cy="10" r="1.3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.4" />
        </g>
      ))}

      {/* Main Relay Body */}
      <rect x="10" y="14" width="68" height="74" rx="4" fill="url(#thmBodyGrad)" stroke="#475569" strokeWidth="1" />

      {/* Current Setting Dial (Esfera de ajuste de corrente) */}
      <circle cx="28" cy="36" r="11" fill="#090d16" stroke="#475569" strokeWidth="0.8" />
      <circle cx="28" cy="36" r="8" fill="#1e293b" />
      {/* Dial graduation tick marks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={`tick-${deg}`}
            x1={28 + 6.5 * Math.cos(rad)}
            y1={36 + 6.5 * Math.sin(rad)}
            x2={28 + 9 * Math.cos(rad)}
            y2={36 + 9 * Math.sin(rad)}
            stroke="#94a3b8"
            strokeWidth="0.6"
          />
        );
      })}
      {/* Center Pointer Arrow */}
      <line x1="28" y1="36" x2="33" y2="31" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="36" r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />

      {/* Current Rating & Tag text */}
      <text x="28" y="52" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">4-6.3A</text>
      <text x="64" y="25" fill="#38bdf8" fontSize="4.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">RT1</text>

      {/* Action Buttons: Red STOP (T) & Blue RESET (A/R) */}
      {/* STOP Push Pin */}
      <circle cx="51" cy="35" r="4.5" fill="#dc2626" stroke="#991b1b" strokeWidth="0.8" />
      <text x="51" y="36.5" fill="#ffffff" fontSize="3.2" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">STOP</text>

      {/* RESET Push Pin */}
      <circle cx="67" cy="35" r="4.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
      <text x="67" y="36.5" fill="#ffffff" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">RST</text>

      {/* TEST Flag Slot */}
      <rect x="47" y="44" width="8" height="3" rx="0.5" fill="#22c55e" stroke="#15803d" strokeWidth="0.5" />

      {/* Auxiliary Screws Section (95-96 NC / 97-98 NO) */}
      <rect x="14" y="56" width="60" height="9" rx="1.5" fill="#090d16" />
      <text x="22" y="62" fill="#ea580c" fontSize="2.6" fontWeight="bold" fontFamily="sans-serif">95 96 NC</text>
      <text x="52" y="62" fill="#16a34a" fontSize="2.6" fontWeight="bold" fontFamily="sans-serif">97 98 NO</text>

      {/* Bottom Power Screws (2/T1, 4/T2, 6/T3) */}
      <rect x="14" y="68" width="60" height="16" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.6" />
      {[24, 44, 64].map((cx, idx) => {
        const labels = ['2/T1', '4/T2', '6/T3'];
        return (
          <g key={`thm-bot-${cx}`}>
            <circle cx={cx} cy="76" r="3.6" fill="#0f172a" />
            <circle cx={cx} cy="76" r="2.8" fill="#eab308" stroke="#713f12" strokeWidth="0.5" />
            <line x1={cx - 1.4} y1="76" x2={cx + 1.4} y2="76" stroke="#1e293b" strokeWidth="0.6" />
            <line x1={cx} y1="74.6" x2={cx} y2="77.4" stroke="#1e293b" strokeWidth="0.6" />
            <text x={cx} y="71" fill="#94a3b8" fontSize="2.6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {labels[idx]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ==========================================================
   5. TIMER RELAY THUMBNAIL (RELÉ TEMPORIZADOR ELETRÔNICO KT1)
   Matching TimerRelayElement: DIN rail electronic timer with
   top screws (A1, 15, 25), red banner with emblem, printed
   circuit diagram, two rotary trimmers (Range & Time), right-column
   LEDs (U & R), and tiered bottom screws (18, 16, 28, 26, A2).
   ========================================================== */
export function TimerRelayThumbnail() {
  return (
    <svg viewBox="0 0 74 96" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="tmrChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="10%" stopColor="#334155" />
          <stop offset="90%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Main Body */}
      <rect x="7" y="4" width="60" height="88" rx="3.5" fill="url(#tmrChassisGrad)" stroke="#64748b" strokeWidth="1" />

      {/* Top Tier with Terminals A1, 15, 25 */}
      <rect x="9" y="5" width="56" height="13" rx="1.5" fill="#1e293b" />
      {[19, 37, 55].map((cx, idx) => {
        const labels = ['A1', '15', '25'];
        return (
          <g key={`tmr-top-${cx}`}>
            <circle cx={cx} cy="11.5" r="3" fill="#0f172a" />
            <circle cx={cx} cy="11.5" r="2.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
            <line x1={cx - 1.1} y1="11.5" x2={cx + 1.1} y2="11.5" stroke="#1e293b" strokeWidth="0.5" />
            <line x1={cx} y1="10.4" x2={cx} y2="12.6" stroke="#1e293b" strokeWidth="0.5" />
            <text x={cx} y="8.5" fill="#94a3b8" fontSize="2.4" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {labels[idx]}
            </text>
          </g>
        );
      })}

      {/* Red Brand Header Banner with Emblem */}
      <rect x="9" y="19" width="56" height="5.5" fill="#dc2626" />
      <rect x="12" y="20" width="4" height="3.5" rx="0.5" fill="#ffffff" />
      <polygon points="14,20.5 13,22 14,22 13.5,23 15,21.5 14,21.5" fill="#059669" />
      <text x="20" y="23" fill="#ffffff" fontSize="2.8" fontWeight="bold" fontFamily="sans-serif">ELECTRONIC</text>

      {/* Printed Circuit Diagram Box */}
      <rect x="11" y="26" width="52" height="12" rx="1" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
      {/* Coil symbol [ ⧄ ] */}
      <rect x="14" y="28" width="8" height="5" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />
      <line x1="14" y1="28" x2="22" y2="33" stroke="#cbd5e1" strokeWidth="0.6" />
      <line x1="14" y1="33" x2="22" y2="28" stroke="#cbd5e1" strokeWidth="0.6" />
      {/* Contact diagram */}
      <line x1="26" y1="30.5" x2="58" y2="30.5" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1,1" />
      <circle cx="36" cy="28.5" r="0.8" fill="#cbd5e1" />
      <line x1="36" y1="28.5" x2="41" y2="33.5" stroke="#cbd5e1" strokeWidth="0.7" />
      <text x="36" y="28" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">15</text>
      <text x="42" y="36.5" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">18</text>

      {/* Controls Area: Trimmers & Status LEDs */}
      {/* Trimmer 1: Range */}
      <text x="14" y="44" fill="#94a3b8" fontSize="2.8" fontWeight="bold" fontFamily="sans-serif">Range</text>
      <circle cx="28" cy="48" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />
      <circle cx="28" cy="48" r="4.2" fill="#334155" />
      <line x1="26" y1="48" x2="30" y2="48" stroke="#f8fafc" strokeWidth="0.8" />
      <line x1="28" y1="46" x2="28" y2="50" stroke="#f8fafc" strokeWidth="0.8" />
      <circle cx="29.8" cy="46.2" r="0.7" fill="#f59e0b" />

      {/* Trimmer 2: Time */}
      <text x="14" y="58" fill="#94a3b8" fontSize="2.8" fontWeight="bold" fontFamily="sans-serif">Time</text>
      <circle cx="28" cy="62" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />
      <circle cx="28" cy="62" r="4.2" fill="#334155" />
      <line x1="26" y1="62" x2="30" y2="62" stroke="#f8fafc" strokeWidth="0.8" />
      <line x1="28" y1="60" x2="28" y2="64" stroke="#f8fafc" strokeWidth="0.8" />
      <circle cx="29.8" cy="60.2" r="0.7" fill="#f59e0b" />

      {/* Right Column: Status LEDs (U & R) */}
      <text x="54" y="44" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">U</text>
      <circle cx="54" cy="49" r="2.8" fill="#0f172a" stroke="#475569" strokeWidth="0.6" />
      <circle cx="54" cy="49" r="1.8" fill="#22c55e" />

      <text x="54" y="58" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">R</text>
      <circle cx="54" cy="63" r="2.8" fill="#0f172a" stroke="#475569" strokeWidth="0.6" />
      <circle cx="54" cy="63" r="1.8" fill="#eab308" />

      {/* Bottom Tier Upper: Screws 18, 16 */}
      <rect x="9" y="70" width="56" height="9" fill="#1e293b" />
      <circle cx="19" cy="74.5" r="2.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
      <text x="19" y="73" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">18</text>

      <circle cx="37" cy="74.5" r="2.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
      <text x="37" y="73" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">16</text>

      {/* Bottom Tier Lower: Screws 28, 26, A2 */}
      <rect x="9" y="80" width="56" height="10" rx="0 0 2 2" fill="#0f172a" />
      <circle cx="19" cy="85" r="2.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
      <text x="19" y="83.5" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">28</text>

      <circle cx="37" cy="85" r="2.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
      <text x="37" y="83.5" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">26</text>

      <circle cx="55" cy="85" r="2.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
      <text x="55" y="83.5" fill="#94a3b8" fontSize="2.2" textAnchor="middle" fontFamily="sans-serif">A2</text>
    </svg>
  );
}

/* ==========================================================
   6. BUTTON START THUMBNAIL (BOTOEIRA LIGA S1 NA 13-14)
   Matching ButtonStartElement: dark molded enclosure with
   recessed line, 4 screw terminal blocks (13 top/bottom,
   14 top/bottom), metallic chrome bezel, and vibrant green
   actuator with specular highlight and bold text "ON".
   ========================================================== */
export function ButtonStartThumbnail() {
  return (
    <svg viewBox="0 0 88 96" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="btnStartGreenGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="85%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
        <radialGradient id="btnBezelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="68%" stopColor="#f3f4f6" />
          <stop offset="88%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </radialGradient>
        <linearGradient id="btnTermGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
      </defs>

      {/* Screw Terminals (Top Left 13, Top Right 14) */}
      <rect x="20" y="5" width="12" height="14" rx="1.5" fill="url(#btnTermGrad)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="26" cy="12" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="24.2" y1="10.2" x2="27.8" y2="13.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="24.2" y1="13.8" x2="27.8" y2="10.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="26" y="4" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">13</text>

      <rect x="56" y="5" width="12" height="14" rx="1.5" fill="url(#btnTermGrad)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="62" cy="12" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="60.2" y1="10.2" x2="63.8" y2="13.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="60.2" y1="13.8" x2="63.8" y2="10.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="62" y="4" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">14</text>

      {/* Screw Terminals (Bottom Left 13, Bottom Right 14) */}
      <rect x="20" y="77" width="12" height="14" rx="1.5" fill="url(#btnTermGrad)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="26" cy="84" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="24.2" y1="82.2" x2="27.8" y2="85.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="24.2" y1="85.8" x2="27.8" y2="82.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="26" y="95" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">13</text>

      <rect x="56" y="77" width="12" height="14" rx="1.5" fill="url(#btnTermGrad)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="62" cy="84" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="60.2" y1="82.2" x2="63.8" y2="85.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="60.2" y1="85.8" x2="63.8" y2="82.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="62" y="95" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">14</text>

      {/* Main Dark Enclosure Plate */}
      <rect x="14" y="14" width="60" height="68" rx="4" fill="#374151" stroke="#111827" strokeWidth="1.2" />
      <rect x="17" y="17" width="54" height="62" rx="3" fill="none" stroke="#4b5563" strokeWidth="0.8" />

      {/* Chrome Metal Bezel Ring */}
      <circle cx="44" cy="48" r="23" fill="url(#btnBezelGrad)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="44" cy="48" r="19" fill="#111827" />

      {/* Green Actuator Surface */}
      <circle cx="44" cy="48" r="17.5" fill="url(#btnStartGreenGrad)" stroke="#14532d" strokeWidth="0.6" />

      {/* Glossy Specular Reflection Ellipse */}
      <ellipse cx="38" cy="41" rx="7" ry="4" fill="#ffffff" opacity="0.4" transform="rotate(-25 38 41)" />

      {/* Centered Actuator Text "ON" */}
      <text
        x="44"
        y="51.5"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="9.5"
        fill="#ffffff"
        textAnchor="middle"
        letterSpacing="0.5"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }}
      >
        ON
      </text>
    </svg>
  );
}

/* ==========================================================
   7. BUTTON STOP THUMBNAIL (BOTOEIRA DESLIGA S0 NF 11-12)
   Matching ButtonStopElement: identical dark enclosure,
   terminals 11 and 12, chrome bezel, and vibrant red actuator
   with specular highlight and bold text "OFF".
   ========================================================== */
export function ButtonStopThumbnail() {
  return (
    <svg viewBox="0 0 88 96" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="btnStopRedGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="45%" stopColor="#ef4444" />
          <stop offset="85%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id="btnBezelGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="68%" stopColor="#f3f4f6" />
          <stop offset="88%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </radialGradient>
        <linearGradient id="btnTermGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
      </defs>

      {/* Screw Terminals (Top Left 11, Top Right 12) */}
      <rect x="20" y="5" width="12" height="14" rx="1.5" fill="url(#btnTermGrad2)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="26" cy="12" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="24.2" y1="10.2" x2="27.8" y2="13.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="24.2" y1="13.8" x2="27.8" y2="10.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="26" y="4" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">11</text>

      <rect x="56" y="5" width="12" height="14" rx="1.5" fill="url(#btnTermGrad2)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="62" cy="12" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="60.2" y1="10.2" x2="63.8" y2="13.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="60.2" y1="13.8" x2="63.8" y2="10.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="62" y="4" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">12</text>

      {/* Screw Terminals (Bottom Left 11, Bottom Right 12) */}
      <rect x="20" y="77" width="12" height="14" rx="1.5" fill="url(#btnTermGrad2)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="26" cy="84" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="24.2" y1="82.2" x2="27.8" y2="85.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="24.2" y1="85.8" x2="27.8" y2="82.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="26" y="95" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">11</text>

      <rect x="56" y="77" width="12" height="14" rx="1.5" fill="url(#btnTermGrad2)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="62" cy="84" r="3.2" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <line x1="60.2" y1="82.2" x2="63.8" y2="85.8" stroke="#1f2937" strokeWidth="0.8" />
      <line x1="60.2" y1="85.8" x2="63.8" y2="82.2" stroke="#1f2937" strokeWidth="0.8" />
      <text x="62" y="95" fill="#374151" fontSize="3.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">12</text>

      {/* Main Dark Enclosure Plate */}
      <rect x="14" y="14" width="60" height="68" rx="4" fill="#374151" stroke="#111827" strokeWidth="1.2" />
      <rect x="17" y="17" width="54" height="62" rx="3" fill="none" stroke="#4b5563" strokeWidth="0.8" />

      {/* Chrome Metal Bezel Ring */}
      <circle cx="44" cy="48" r="23" fill="url(#btnBezelGrad2)" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="44" cy="48" r="19" fill="#111827" />

      {/* Red Actuator Surface */}
      <circle cx="44" cy="48" r="17.5" fill="url(#btnStopRedGrad)" stroke="#7f1d1d" strokeWidth="0.6" />

      {/* Glossy Specular Reflection Ellipse */}
      <ellipse cx="38" cy="41" rx="7" ry="4" fill="#ffffff" opacity="0.4" transform="rotate(-25 38 41)" />

      {/* Centered Actuator Text "OFF" */}
      <text
        x="44"
        y="51.5"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="9.5"
        fill="#ffffff"
        textAnchor="middle"
        letterSpacing="0.5"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }}
      >
        OFF
      </text>
    </svg>
  );
}

/* ==========================================================
   8. BUTTON EMERGENCY THUMBNAIL (BOTOEIRA DE EMERGÊNCIA S00)
   Matching RealisticEmergencyButtonSvg: Square yellow safety plate,
   top red circular socket (11 NF), bottom socket (12 NF),
   yellow circular disc, curved arched text "EMERGENCY",
   and red mushroom actuator head with 3 curved white arrows.
   ========================================================== */
export function ButtonEmergencyThumbnail() {
  return (
    <svg viewBox="0 0 88 94" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="emPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="15%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <radialGradient id="emMushroomGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="35%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="92%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
        <path id="emThumbArc" d="M 21 47 A 23 23 0 0 1 67 47" fill="none" />
      </defs>

      {/* Top Red Socket Terminal (11 NF) */}
      <circle cx="44" cy="7" r="5.5" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
      <circle cx="44" cy="7" r="2.8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.6" />
      <circle cx="44" cy="7" r="1.3" fill="#f8fafc" />
      <text x="53" y="9" fill="#94a3b8" fontSize="3.2" fontWeight="bold" fontFamily="sans-serif">11</text>

      {/* Yellow Safety Square Enclosure Plate */}
      <rect x="14" y="15" width="60" height="60" rx="7" fill="url(#emPlateGrad)" stroke="#ca8a04" strokeWidth="1.2" />
      <rect x="16" y="17" width="56" height="56" rx="5.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

      {/* Inner Yellow Circular Disc */}
      <circle cx="44" cy="45" r="24.5" fill="#ca8a04" />
      <circle cx="44" cy="45" r="24" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />

      {/* Arched Text "EMERGENCY" */}
      <text fill="#1c1917" fontSize="3.4" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.6">
        <textPath href="#emThumbArc" startOffset="50%" textAnchor="middle">
          EMERGENCY
        </textPath>
      </text>

      {/* Red Mushroom Actuator Head */}
      <circle cx="44" cy="46" r="16.5" fill="url(#emMushroomGrad)" stroke="#7f1d1d" strokeWidth="1" />
      <ellipse cx="39" cy="40" rx="6" ry="3" fill="#ffffff" opacity="0.45" transform="rotate(-20 39 40)" />

      {/* 3 White Curved Arrows (Twist to reset) */}
      {[0, 120, 240].map((angle) => (
        <g key={`arr-${angle}`} transform={`rotate(${angle} 44 46)`}>
          <path d="M 37 40 A 10 10 0 0 1 45 37" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <polygon points="45,35 48,38 44.5,39.5" fill="#ffffff" />
        </g>
      ))}

      {/* Bottom Red Socket Terminal (12 NF) */}
      <circle cx="44" cy="86" r="5.5" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
      <circle cx="44" cy="86" r="2.8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.6" />
      <circle cx="44" cy="86" r="1.3" fill="#f8fafc" />
      <text x="53" y="88" fill="#94a3b8" fontSize="3.2" fontWeight="bold" fontFamily="sans-serif">12</text>
    </svg>
  );
}

/* ==========================================================
   9. MOTOR 6P THUMBNAIL (MOTOR DE INDUÇÃO TRIFÁSICO)
   Matching Motor6PElement: Exact FRONTAL VIEW of the motor!
   - Top: Gray terminal box with PE green socket & terracotta
     bakelite plate with 6 terminals (U1, V1, W1 / W2, U2, V2).
   - Bottom: Blue industrial stator body with cooling tabs,
     mounting feet, circular bearing flange shield, and central
     turned steel rotor shaft with yellow pointer arrow.
   ========================================================== */
export function Motor6PThumbnail() {
  return (
    <svg viewBox="0 0 88 100" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="m6pTBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#6c7c8d" />
          <stop offset="100%" stopColor="#5a6878" />
        </linearGradient>
        <linearGradient id="m6pPlateOrange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <linearGradient id="m6pStatorBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="30%" stopColor="#1d4ed8" />
          <stop offset="80%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <radialGradient id="m6pShaftSteel" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
      </defs>

      {/* ======================================================
          TOP: TERMINAL BOX (CAIXA DE BORNES 6 PONTAS)
          ====================================================== */}
      {/* Outer Gray Enclosure Box */}
      <rect x="7" y="3" width="74" height="34" rx="4" fill="url(#m6pTBoxGrad)" stroke="#475569" strokeWidth="1" />

      {/* PE Ground Socket on Left */}
      <circle cx="15" cy="12" r="4.2" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
      <circle cx="15" cy="12" r="2.2" fill="#86efac" />
      <rect x="11.5" y="18" width="7" height="4.5" rx="1" fill="#ffffff" />
      <text x="15" y="21.5" fill="#0f172a" fontSize="2.8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">PE</text>

      {/* Terracotta Bakelite Terminal Plate */}
      <rect x="25" y="5.5" width="53" height="29" rx="3" fill="url(#m6pPlateOrange)" stroke="#9a3412" strokeWidth="0.8" />

      {/* Row 1: U1, V1, W1 */}
      {[34, 51.5, 69].map((cx, idx) => {
        const names = ['U1', 'V1', 'W1'];
        return (
          <g key={`m6p-top-${names[idx]}`}>
            <circle cx={cx} cy="11.5" r="3.2" fill="#7c2d12" />
            <circle cx={cx} cy="11.5" r="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
            <rect x={cx - 3.5} y="15.5" width="7" height="4" rx="1" fill="#ffffff" />
            <text x={cx} y="18.8" fill="#0f172a" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {names[idx]}
            </text>
          </g>
        );
      })}

      {/* Row 2: W2, U2, V2 */}
      {[34, 51.5, 69].map((cx, idx) => {
        const names = ['W2', 'U2', 'V2'];
        return (
          <g key={`m6p-bot-${names[idx]}`}>
            <circle cx={cx} cy="24.5" r="3.2" fill="#7c2d12" />
            <circle cx={cx} cy="24.5" r="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />
            <rect x={cx - 3.5} y="28.5" width="7" height="4" rx="1" fill="#ffffff" />
            <text x={cx} y="31.8" fill="#0f172a" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {names[idx]}
            </text>
          </g>
        );
      })}

      {/* ======================================================
          BOTTOM: MOTOR FRONTAL VIEW (CORPO DO MOTOR)
          ====================================================== */}
      {/* Mounting Feet */}
      <rect x="11" y="93" width="16" height="4.5" rx="1" fill="#172554" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="15" cy="95" r="1.2" fill="#94a3b8" />
      <rect x="61" y="93" width="16" height="4.5" rx="1" fill="#172554" stroke="#0f172a" strokeWidth="0.8" />
      <circle cx="73" cy="95" r="1.2" fill="#94a3b8" />

      {/* Main Rounded Stator Body in Industrial Blue */}
      <rect x="12" y="41" width="64" height="54" rx="8" fill="url(#m6pStatorBlue)" stroke="#1e3a8a" strokeWidth="1" />

      {/* Specular Diagonal Shine on Top-Left Corner */}
      <path d="M 16 42 Q 32 42 38 50 Q 26 55 15 51 Z" fill="rgba(255, 255, 255, 0.25)" />

      {/* Lateral Cooling Tabs (Left & Right) */}
      <rect x="10" y="52" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />
      <rect x="10" y="62" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />
      <rect x="10" y="72" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />
      <rect x="10" y="82" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />

      <rect x="75.5" y="52" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />
      <rect x="75.5" y="62" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />
      <rect x="75.5" y="72" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />
      <rect x="75.5" y="82" width="2.5" height="2" rx="0.5" fill="#1e3a8a" />

      {/* Bearing Shield Flange in Blue */}
      <circle cx="44" cy="68" r="20" fill="#2563eb" stroke="#172554" strokeWidth="1.2" />
      <circle cx="44" cy="68" r="16.5" fill="#1d4ed8" stroke="#1e40af" strokeWidth="0.8" />

      {/* Radial Ticks around Bearing Flange */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={`flange-tick-${deg}`}
            x1={44 + 17 * Math.cos(rad)}
            y1={68 + 17 * Math.sin(rad)}
            x2={44 + 19.5 * Math.cos(rad)}
            y2={68 + 19.5 * Math.sin(rad)}
            stroke="#172554"
            strokeWidth="0.8"
          />
        );
      })}

      {/* 4 Hex Screws on Flange */}
      {[
        { x: 44 + 9.5, y: 68 + 9.5 },
        { x: 44 - 9.5, y: 68 + 9.5 },
        { x: 44 + 9.5, y: 68 - 9.5 },
        { x: 44 - 9.5, y: 68 - 9.5 },
      ].map((pos, idx) => (
        <circle key={`flange-scr-${idx}`} cx={pos.x} cy={pos.y} r="1.3" fill="#94a3b8" stroke="#0f172a" strokeWidth="0.4" />
      ))}

      {/* Turned Steel Rotor Shaft with Yellow Pointer */}
      <circle cx="44" cy="68" r="9.5" fill="url(#m6pShaftSteel)" stroke="#334155" strokeWidth="0.8" />
      <circle cx="44" cy="68" r="4" fill="#334155" />

      {/* Rotating Keyway Yellow Pointer */}
      <polygon points="42.8,68 43.2,61 44,58 44.8,61 45.2,68" fill="#f59e0b" stroke="#1e293b" strokeWidth="0.6" />
      <circle cx="44" cy="68" r="2" fill="#475569" stroke="#1e293b" strokeWidth="0.4" />

      {/* Star / Delta Indicator Emblem at top left */}
      <circle cx="19" cy="46" r="4.5" fill="#0b1329" stroke="#f59e0b" strokeWidth="0.8" />
      <polygon points="19,43.5 21.5,47.8 16.5,47.8" stroke="#f59e0b" strokeWidth="0.8" fill="rgba(245, 158, 11, 0.3)" />
    </svg>
  );
}

/* ==========================================================
   10. DIN RAIL THUMBNAIL (TRILHO DIN TS-35)
   Matching DinRailElement: Standard 35mm galvanised steel
   profile TS-35, top & bottom metallic beveled flanges,
   center channel with oblong mounting slots and screws.
   ========================================================== */
export function DinRailThumbnail() {
  return (
    <svg viewBox="0 0 116 50" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="dinTopFlangeThumb" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="dinCenterChannelThumb" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="15%" stopColor="#475569" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="85%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="dinBotFlangeThumb" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Top Lip / Flange */}
      <rect x="2" y="8" width="112" height="7" rx="1" fill="url(#dinTopFlangeThumb)" />
      <line x1="2" y1="8.5" x2="114" y2="8.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
      <line x1="2" y1="14.5" x2="114" y2="14.5" stroke="#334155" strokeWidth="0.8" />

      {/* Recessed Center Channel */}
      <rect x="2" y="15" width="112" height="24" fill="url(#dinCenterChannelThumb)" />
      <line x1="2" y1="15.5" x2="114" y2="15.5" stroke="#0f172a" strokeWidth="1" opacity="0.8" />
      <line x1="2" y1="38.5" x2="114" y2="38.5" stroke="#0f172a" strokeWidth="1" opacity="0.8" />

      {/* Oblong Mounting Slots (Rasgos Oblongos) */}
      {[22, 50, 78, 102].map((cx, idx) => (
        <g key={`din-slot-${cx}`}>
          <rect x={cx - 8} y="21" width="16" height="12" rx="3.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
          <line x1={cx - 5} y1="32.5" x2={cx + 5} y2="32.5" stroke="#cbd5e1" strokeWidth="0.6" opacity="0.4" />

          {/* Bolt in 2nd slot */}
          {idx === 1 && (
            <g>
              <circle cx={cx} cy="27" r="5" fill="#64748b" stroke="#334155" strokeWidth="0.6" />
              <circle cx={cx} cy="27" r="3.6" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
              <line x1={cx - 2} y1="27" x2={cx + 2} y2="27" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
              <line x1={cx} y1="25" x2={cx} y2="29" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          )}
        </g>
      ))}

      {/* Laser Standard Marking */}
      <text x="35" y="19" fill="#94a3b8" fontSize="3.6" fontWeight="bold" fontFamily="sans-serif" opacity="0.85">
        DIN EN 60715 • TS-35
      </text>

      {/* Bottom Lip / Flange */}
      <rect x="2" y="39" width="112" height="7" rx="1" fill="url(#dinBotFlangeThumb)" />
      <line x1="2" y1="39.5" x2="114" y2="39.5" stroke="#cbd5e1" strokeWidth="0.6" opacity="0.7" />
      <line x1="2" y1="45.5" x2="114" y2="45.5" stroke="#1e293b" strokeWidth="0.8" />

      {/* Millimeter Scale Ticks along Bottom */}
      {[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 110].map((x, idx) => (
        <line
          key={`din-tick-${idx}`}
          x1={x}
          y1={idx % 4 === 0 ? "40" : "42"}
          x2={x}
          y2="45"
          stroke="#475569"
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}

export function PilotLightThumbnail() {
  return (
    <svg viewBox="0 0 100 84" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="thumbBulbGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        <linearGradient id="thumbThreadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="40%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Globo superior fosco */}
      <circle cx="50" cy="25" r="19" fill="url(#thumbBulbGrad)" stroke="#cbd5e1" strokeWidth="0.8" />
      {/* Brilho da cúpula */}
      <ellipse cx="44" cy="18" rx="6" ry="4" fill="rgba(255,255,255,0.6)" />

      {/* Dissipador branco cônico */}
      <path d="M 33 30 L 67 30 L 61 54 L 39 54 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* Rosca metálica E27 */}
      <rect x="41" y="55" width="18" height="15" rx="1" fill="url(#thumbThreadGrad)" stroke="#475569" strokeWidth="0.8" />
      <line x1="41" y1="58" x2="59" y2="58" stroke="#334155" strokeWidth="0.8" />
      <line x1="41" y1="62" x2="59" y2="62" stroke="#334155" strokeWidth="0.8" />
      <line x1="41" y1="66" x2="59" y2="66" stroke="#334155" strokeWidth="0.8" />

      {/* Pé de contato */}
      <polygon points="44,70 56,70 52,75 48,75" fill="#1e293b" />

      {/* Identificação */}
      <text x="50" y="82" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle">LED E27</text>
    </svg>
  );
}

export const COMPONENT_THUMBNAILS = {
  power_source: PowerSourceThumbnail,
  circuit_breaker: BreakerThumbnail,
  contactor: ContactorThumbnail,
  thermal_relay: ThermalRelayThumbnail,
  timer_relay: TimerRelayThumbnail,
  button_start: ButtonStartThumbnail,
  button_stop: ButtonStopThumbnail,
  button_emergency: ButtonEmergencyThumbnail,
  motor_6p: Motor6PThumbnail,
  pilot_light: PilotLightThumbnail,
  din_rail: DinRailThumbnail,
};

/* ==========================================================
   SCHEMATIC SYMBOL THUMBNAILS (IEC 60617)
   ========================================================== */
export function SchematicPowerSourceThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <line x1="20" y1="14" x2="85" y2="14" stroke="#ea580c" strokeWidth="2" />
      <line x1="20" y1="26" x2="85" y2="26" stroke="#16a34a" strokeWidth="2" />
      <line x1="20" y1="38" x2="85" y2="38" stroke="#9333ea" strokeWidth="2" />
      <line x1="20" y1="50" x2="85" y2="50" stroke="#2563eb" strokeWidth="2" />
      <line x1="20" y1="62" x2="85" y2="62" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" />
      <text x="10" y="17" fill="#ea580c" fontSize="8" fontWeight="bold">L1</text>
      <text x="10" y="29" fill="#16a34a" fontSize="8" fontWeight="bold">L2</text>
      <text x="10" y="41" fill="#9333ea" fontSize="8" fontWeight="bold">L3</text>
      <text x="10" y="53" fill="#2563eb" fontSize="8" fontWeight="bold">N</text>
      <text x="8" y="65" fill="#22c55e" fontSize="7" fontWeight="bold">PE</text>
    </svg>
  );
}

export function SchematicBreakerThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      {/* Polo 1 */}
      <circle cx="32" cy="14" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="32" y1="17" x2="32" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="29" y1="26" x2="35" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="29" y1="30" x2="35" y2="26" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="32" cy="56" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="32" y1="53" x2="32" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Palheta Aberta */}
      <line x1="32" y1="44" x2="22" y2="28" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

      {/* Polo 2 */}
      <circle cx="68" cy="14" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="68" y1="17" x2="68" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="65" y1="26" x2="71" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="65" y1="30" x2="71" y2="26" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="68" cy="56" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="68" y1="53" x2="68" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Palheta Aberta */}
      <line x1="68" y1="44" x2="58" y2="28" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

      {/* Manopla e linha tracejada */}
      <path d="M 12 36 L 15 36 L 15 32 L 18 32 L 18 36 L 21 36" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      <line x1="21" y1="36" x2="72" y2="36" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 2" />
      <text x="86" y="39" fill="#ffffff" fontSize="9" fontWeight="bold">Q1</text>
    </svg>
  );
}

export function SchematicContactorThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      {/* Polo 1 */}
      <circle cx="32" cy="14" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="32" y1="17" x2="32" y2="24" stroke="#38bdf8" strokeWidth="1.5" />
      <path d="M 32 24 A 4 4 0 0 0 32 32" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
      <circle cx="32" cy="56" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="32" y1="53" x2="32" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Palheta Aberta */}
      <line x1="32" y1="44" x2="22" y2="32" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

      {/* Polo 2 */}
      <circle cx="68" cy="14" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="68" y1="17" x2="68" y2="24" stroke="#38bdf8" strokeWidth="1.5" />
      <path d="M 68 24 A 4 4 0 0 0 68 32" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
      <circle cx="68" cy="56" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="68" y1="53" x2="68" y2="44" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Palheta Aberta */}
      <line x1="68" y1="44" x2="58" y2="32" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />

      {/* Linha tracejada */}
      <line x1="21" y1="38" x2="72" y2="38" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 2" />
      <text x="86" y="41" fill="#ffffff" fontSize="8" fontWeight="bold">KM1</text>
    </svg>
  );
}

export function SchematicThermalRelayThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <line x1="32" y1="8" x2="32" y2="24" stroke="#38bdf8" strokeWidth="2" />
      <rect x="26" y="24" width="12" height="16" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
      <line x1="32" y1="40" x2="32" y2="62" stroke="#38bdf8" strokeWidth="2" />
      <line x1="68" y1="8" x2="68" y2="24" stroke="#38bdf8" strokeWidth="2" />
      <rect x="62" y="24" width="12" height="16" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
      <line x1="68" y1="40" x2="68" y2="62" stroke="#38bdf8" strokeWidth="2" />
    </svg>
  );
}

export function SchematicTimerRelayThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <rect x="30" y="14" width="40" height="42" rx="2" fill="none" stroke="#a855f7" strokeWidth="2" />
      <rect x="30" y="14" width="12" height="42" fill="#38bdf8" opacity="0.35" />
      <text x="56" y="38" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">KT</text>
    </svg>
  );
}

export function SchematicButtonStartThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <line x1="32" y1="12" x2="32" y2="34" stroke="#10b981" strokeWidth="2" />
      <circle cx="32" cy="34" r="2.5" fill="#10b981" />
      <line x1="68" y1="12" x2="68" y2="34" stroke="#10b981" strokeWidth="2" />
      <circle cx="68" cy="34" r="2.5" fill="#10b981" />
      <line x1="26" y1="26" x2="74" y2="26" stroke="#10b981" strokeWidth="2.5" />
      <line x1="50" y1="26" x2="50" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="42" y="50" width="16" height="4" fill="#10b981" rx="1" />
      <line x1="32" y1="34" x2="32" y2="58" stroke="#10b981" strokeWidth="2" />
      <line x1="68" y1="34" x2="68" y2="58" stroke="#10b981" strokeWidth="2" />
    </svg>
  );
}

export function SchematicButtonStopThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <line x1="32" y1="12" x2="32" y2="34" stroke="#ef4444" strokeWidth="2" />
      <circle cx="32" cy="34" r="2.5" fill="#ef4444" />
      <line x1="68" y1="12" x2="68" y2="34" stroke="#ef4444" strokeWidth="2" />
      <circle cx="68" cy="34" r="2.5" fill="#ef4444" />
      <line x1="26" y1="34" x2="74" y2="34" stroke="#ef4444" strokeWidth="2.5" />
      <line x1="50" y1="34" x2="50" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="42" y="50" width="16" height="4" fill="#ef4444" rx="1" />
      <line x1="32" y1="34" x2="32" y2="58" stroke="#ef4444" strokeWidth="2" />
      <line x1="68" y1="34" x2="68" y2="58" stroke="#ef4444" strokeWidth="2" />
    </svg>
  );
}

export function SchematicButtonEmergencyThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <path d="M 35 20 C 35 10 65 10 65 20 Z" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
      <line x1="50" y1="20" x2="50" y2="54" stroke="#ef4444" strokeWidth="2" />
      <line x1="50" y1="25" x2="64" y2="44" stroke="#ef4444" strokeWidth="2.5" />
      <circle cx="50" cy="46" r="2.5" fill="#ef4444" />
    </svg>
  );
}

export function SchematicMotorThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <circle cx="50" cy="35" r="24" fill="#090d16" stroke="#38bdf8" strokeWidth="2" />
      <text x="50" y="34" fill="#f8fafc" fontSize="12" fontWeight="900" textAnchor="middle">M</text>
      <text x="50" y="46" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">3 ~</text>
    </svg>
  );
}

export const SCHEMATIC_THUMBNAILS = {
  power_source: SchematicPowerSourceThumbnail,
  circuit_breaker: SchematicBreakerThumbnail,
  contactor: SchematicContactorThumbnail,
  thermal_relay: SchematicThermalRelayThumbnail,
  timer_relay: SchematicTimerRelayThumbnail,
  button_start: SchematicButtonStartThumbnail,
  button_stop: SchematicButtonStopThumbnail,
  button_emergency: SchematicButtonEmergencyThumbnail,
  motor_6p: SchematicMotorThumbnail,
};
