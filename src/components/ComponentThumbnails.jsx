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
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '4px', background: 'transparent' }}>
      <svg viewBox="0 0 800 980" style={{ width: '92%', height: '92%', display: 'block' }}>
        {/* Corpo principal */}
        <rect x="40" y="30" width="720" height="440" rx="30" fill="#f3f5f8" stroke="#94a3b8" strokeWidth="12" />
        <rect x="60" y="440" width="680" height="250" rx="22" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="12" />
        <rect x="70" y="70" width="660" height="330" rx="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="6" />
        {/* Display LCD */}
        <rect x="245" y="135" width="310" height="100" rx="12" fill="#1e293b" />
        <rect x="255" y="145" width="290" height="80" rx="6" fill="#a9bf79" />
        <text x="520" y="198" fontFamily="monospace" fontSize="42" fontWeight="800" fill="#1d2a14" textAnchor="end">004827</text>
        {/* Marca */}
        <text x="400" y="112" fontSize="36" fontWeight="900" letterSpacing="4" fill="#0b4f8a" textAnchor="middle">VOLTEX</text>
        {/* LED Ligado */}
        <circle cx="120" cy="190" r="16" fill="#22c55e" />
        {/* Botão DISPLAY */}
        <circle cx="188" cy="185" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="3" />
        <text x="188" y="218" fontSize="16" fontWeight="bold" fill="#334155" textAnchor="middle">DISP</text>
        {/* 8 Bornes com parafuso */}
        {[131, 208, 285, 362, 439, 516, 593, 670].map((x, i) => (
          <circle key={i} cx={x} cy="535" r="22" fill="#d97706" stroke="#451a03" strokeWidth="6" />
        ))}
        {/* Arruela de conduíte inferior central */}
        <circle cx="400" cy="838" r="80" fill="#94a3b8" stroke="#475569" strokeWidth="6" />
        <circle cx="400" cy="838" r="50" fill="#0f172a" />

        {/* Cabos de entrada vindo do fundo do conduíte inferior até os bornes 1..4 */}
        <g strokeLinecap="butt" fill="none">
          <path d="M368 876 C358 790 131 690 131 608" stroke="#0b0c0e" strokeWidth="20" />
          <path d="M382 885 C376 790 208 690 208 608" stroke="#0b0c0e" strokeWidth="20" />
          <path d="M396 888 C394 790 285 690 285 608" stroke="#0b0c0e" strokeWidth="20" />
          <path d="M410 888 C410 790 362 690 362 608" stroke="#0b0c0e" strokeWidth="20" />

          <path d="M368 876 C358 790 131 690 131 608" stroke="#7a4a24" strokeWidth="15" />
          <path d="M382 885 C376 790 208 690 208 608" stroke="#26282c" strokeWidth="15" />
          <path d="M396 888 C394 790 285 690 285 608" stroke="#9aa0a8" strokeWidth="15" />
          <path d="M410 888 C410 790 362 690 362 608" stroke="#3fa5e3" strokeWidth="15" />
        </g>
      </svg>
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
        3Ø+N
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
      <rect x="15" y="4" width="11" height="3" rx="1.5" fill="#1e293b" />
      <rect x="36.5" y="4" width="11" height="3" rx="1.5" fill="#1e293b" />
      <rect x="58" y="4" width="11" height="3" rx="1.5" fill="#1e293b" />

      {/* Bottom terminal block notches */}
      <rect x="15" y="89" width="11" height="3" rx="1.5" fill="#1e293b" />
      <rect x="36.5" y="89" width="11" height="3" rx="1.5" fill="#1e293b" />
      <rect x="58" y="89" width="11" height="3" rx="1.5" fill="#1e293b" />

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
      <rect x="9" y="80" width="56" height="10" rx="2" fill="#0f172a" />
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
    <svg viewBox="0 0 640 700" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="thumbBaseGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#414653" />
          <stop offset="0.5" stopColor="#171a22" />
          <stop offset="1" stopColor="#303541" />
        </linearGradient>
        <linearGradient id="thumbGreenGrad" x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#19c7a2" />
          <stop offset="0.55" stopColor="#00a985" />
          <stop offset="1" stopColor="#00866d" />
        </linearGradient>
        <linearGradient id="thumbMetalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f7fa" />
          <stop offset="1" stopColor="#a2a8b3" />
        </linearGradient>
        <filter id="thumbShadow" x="-25%" y="-25%" width="150%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <ellipse cx="320" cy="640" rx="195" ry="16" fill="#000" opacity="0.2" filter="url(#thumbShadow)" />

      {/* Four integrated terminal blocks */}
      {/* Molded base chambers */}
      <g fill="url(#thumbBaseGrad)" stroke="#10131a" strokeWidth="6">
        <rect x="142" y="80" width="118" height="96" rx="14" />
        <rect x="380" y="80" width="118" height="96" rx="14" />
        <rect x="142" y="524" width="118" height="96" rx="14" />
        <rect x="380" y="524" width="118" height="96" rx="14" />
      </g>
      {/* Metallic conductor plates */}
      <g fill="url(#thumbMetalGrad)" stroke="#20242d" strokeWidth="3.5">
        <rect x="148" y="86" width="106" height="72" rx="8" />
        <rect x="386" y="86" width="106" height="72" rx="8" />
        <rect x="148" y="542" width="106" height="72" rx="8" />
        <rect x="386" y="542" width="106" height="72" rx="8" />
      </g>
      <g fill="#242936">
        <circle cx="201" cy="122" r="18" />
        <circle cx="439" cy="122" r="18" />
        <circle cx="201" cy="578" r="18" />
        <circle cx="439" cy="578" r="18" />
      </g>

      {/* Square housing */}
      <rect x="108" y="138" width="424" height="424" rx="34" fill="url(#thumbBaseGrad)" stroke="#10131a" strokeWidth="7" />
      <rect x="128" y="158" width="384" height="384" rx="24" fill="none" stroke="#555b68" strokeWidth="4" opacity="0.8" />

      {/* Mounting holes */}
      <g fill="#090b10" stroke="#555b68" strokeWidth="4">
        <circle cx="151" cy="181" r="13" />
        <circle cx="489" cy="181" r="13" />
        <circle cx="151" cy="519" r="13" />
        <circle cx="489" cy="519" r="13" />
      </g>

      {/* Button bezel and green actuator */}
      <circle cx="320" cy="350" r="177" fill="#080a0f" stroke="#565c68" strokeWidth="8" />
      <circle cx="320" cy="350" r="161" fill="#20242e" stroke="#0a0c12" strokeWidth="5" />
      <circle cx="320" cy="350" r="148" fill="url(#thumbGreenGrad)" stroke="#05080c" strokeWidth="5" />
      <path d="M220 245 A146 146 0 0 1 321 203" fill="none" stroke="#8bf0d8" strokeWidth="5" opacity="0.3" strokeLinecap="round" />

      <text
        x="320"
        y="328"
        fill="#ffffff"
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="900"
        fontSize="52"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))' }}
      >
        I
      </text>

      <text
        x="320"
        y="386"
        fill="#ffffff"
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="900"
        fontSize="48"
        letterSpacing="5"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))' }}
      >
        LIGA
      </text>

      {/* Terminal labels: 13/14 on top, 13/14 on bottom */}
      <g
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="32"
        fontWeight="800"
        textAnchor="middle"
        style={{ paintOrder: 'stroke fill', stroke: '#0f172a', strokeWidth: '6px', strokeLinejoin: 'round' }}
      >
        <text x="201" y="60">13</text>
        <text x="439" y="60">14</text>
        <text x="201" y="662">13</text>
        <text x="439" y="662">14</text>
      </g>
    </svg>
  );
}

/* ==========================================================
   7. BUTTON STOP THUMBNAIL (BOTOEIRA DESLIGA S0 NF 11-12)
   Matching ButtonStopElement: identical dark square housing,
   terminals 11 and 12 top/bottom, and vibrant red actuator.
   ========================================================== */
export function ButtonStopThumbnail() {
  return (
    <svg viewBox="0 0 640 700" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="thumbStopBaseGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#414653" />
          <stop offset="0.5" stopColor="#171a22" />
          <stop offset="1" stopColor="#303541" />
        </linearGradient>
        <linearGradient id="thumbRedGrad" x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ff4b4b" />
          <stop offset="0.55" stopColor="#d61a1a" />
          <stop offset="1" stopColor="#8c0b0b" />
        </linearGradient>
        <linearGradient id="thumbStopMetalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f7fa" />
          <stop offset="1" stopColor="#a2a8b3" />
        </linearGradient>
        <filter id="thumbStopShadow" x="-25%" y="-25%" width="150%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <ellipse cx="320" cy="640" rx="195" ry="16" fill="#000" opacity="0.2" filter="url(#thumbStopShadow)" />

      {/* Four integrated terminal blocks */}
      {/* Molded base chambers */}
      <g fill="url(#thumbStopBaseGrad)" stroke="#10131a" strokeWidth="6">
        <rect x="142" y="80" width="118" height="96" rx="14" />
        <rect x="380" y="80" width="118" height="96" rx="14" />
        <rect x="142" y="524" width="118" height="96" rx="14" />
        <rect x="380" y="524" width="118" height="96" rx="14" />
      </g>
      {/* Metallic conductor plates */}
      <g fill="url(#thumbStopMetalGrad)" stroke="#20242d" strokeWidth="3.5">
        <rect x="148" y="86" width="106" height="72" rx="8" />
        <rect x="386" y="86" width="106" height="72" rx="8" />
        <rect x="148" y="542" width="106" height="72" rx="8" />
        <rect x="386" y="542" width="106" height="72" rx="8" />
      </g>
      <g fill="#242936">
        <circle cx="201" cy="122" r="18" />
        <circle cx="439" cy="122" r="18" />
        <circle cx="201" cy="578" r="18" />
        <circle cx="439" cy="578" r="18" />
      </g>

      {/* Square housing */}
      <rect x="108" y="138" width="424" height="424" rx="34" fill="url(#thumbStopBaseGrad)" stroke="#10131a" strokeWidth="7" />
      <rect x="128" y="158" width="384" height="384" rx="24" fill="none" stroke="#555b68" strokeWidth="4" opacity="0.8" />

      {/* Mounting holes */}
      <g fill="#090b10" stroke="#555b68" strokeWidth="4">
        <circle cx="151" cy="181" r="13" />
        <circle cx="489" cy="181" r="13" />
        <circle cx="151" cy="519" r="13" />
        <circle cx="489" cy="519" r="13" />
      </g>

      {/* Button bezel and red actuator */}
      <circle cx="320" cy="350" r="177" fill="#080a0f" stroke="#565c68" strokeWidth="8" />
      <circle cx="320" cy="350" r="161" fill="#20242e" stroke="#0a0c12" strokeWidth="5" />
      <circle cx="320" cy="350" r="148" fill="url(#thumbRedGrad)" stroke="#05080c" strokeWidth="5" />
      <path d="M220 245 A146 146 0 0 1 321 203" fill="none" stroke="#ffa8a8" strokeWidth="5" opacity="0.3" strokeLinecap="round" />

      <text
        x="320"
        y="328"
        fill="#ffffff"
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="900"
        fontSize="50"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))' }}
      >
        O
      </text>

      <text
        x="320"
        y="386"
        fill="#ffffff"
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="900"
        fontSize="40"
        letterSpacing="3"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))' }}
      >
        DESLIGA
      </text>

      {/* Terminal labels: 11/12 on top, 11/12 on bottom */}
      <g
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="32"
        fontWeight="800"
        textAnchor="middle"
        style={{ paintOrder: 'stroke fill', stroke: '#0f172a', strokeWidth: '6px', strokeLinejoin: 'round' }}
      >
        <text x="201" y="60">11</text>
        <text x="439" y="60">12</text>
        <text x="201" y="662">11</text>
        <text x="439" y="662">12</text>
      </g>
    </svg>
  );
}

/* ==========================================================
   8. BUTTON EMERGENCY THUMBNAIL (BOTOEIRA DE EMERGÊNCIA S00)
   Matching RealisticEmergencyButtonSvg: Square yellow safety plate,
   top red circular socket (11 NF), bottom socket (12 NF),
   yellow circular disc, curved arched text "EMERGENCY",
   and realistic industrial red mushroom actuator with serrated grip
   and 3 clockwise debossed arrows (twist-to-release).
   ========================================================== */
const THUMB_DEBOSSED_ARROW_PATH =
  'M 43.67 -27.29 L 51.31 -32.06 A 60.5 60.5 0 0 1 58.16 16.68 L 63.75 17.08 L 45.87 32.12 L 44.43 11.91 L 49.5 14.2 A 51.5 51.5 0 0 0 43.67 -27.29 Z';

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
        <radialGradient id="emBevelGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#bf2222" />
          <stop offset="50%" stopColor="#991515" />
          <stop offset="85%" stopColor="#6e0b0b" />
          <stop offset="100%" stopColor="#450606" />
        </radialGradient>
        <radialGradient id="emTopFaceGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#c72828" />
          <stop offset="45%" stopColor="#a81a1a" />
          <stop offset="85%" stopColor="#821010" />
          <stop offset="100%" stopColor="#5c0808" />
        </radialGradient>
        <radialGradient id="emCenterDomeGrad" cx="42%" cy="36%" r="60%">
          <stop offset="0%" stopColor="#c02424" />
          <stop offset="60%" stopColor="#9c1616" />
          <stop offset="100%" stopColor="#7a0e0e" />
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

      {/* Red Mushroom Actuator Head (Serrated border, debossed arrows, central dome) */}
      <g transform="translate(44, 46) scale(0.2)">
        {/* Base escura do perímetro serrilhado */}
        <circle cx="0" cy="0" r="88" fill="#3c0606" />

        {/* Estrias serrilhadas antiderrapantes ao redor do bordo */}
        <circle cx="0" cy="0" r="86" fill="none" stroke="#6e0c0c" strokeWidth="4.5" strokeDasharray="3.4 2.4" />
        <circle cx="0" cy="0" r="85" fill="none" stroke="#941414" strokeWidth="2.5" strokeDasharray="3.4 2.4" />

        {/* Corpo do cogumelo: bisel de transição chanfrado */}
        <circle cx="0" cy="0" r="83" fill="url(#emBevelGrad)" stroke="#450707" strokeWidth="2" />

        {/* Superfície do platô do botão */}
        <circle cx="0" cy="0" r="76" fill="url(#emTopFaceGrad)" />

        {/* 3 Setas entalhadas em baixo-relevo no próprio plástico vermelho */}
        {[-75, 45, 165].map((angle) => (
          <g key={`arr-${angle}`} transform={`rotate(${angle})`}>
            {/* Filete de luz */}
            <path d={THUMB_DEBOSSED_ARROW_PATH} fill="none" stroke="rgba(255, 140, 140, 0.45)" strokeWidth="2.2" transform="translate(1, 1)" />
            {/* Vala escura do entalhe */}
            <path d={THUMB_DEBOSSED_ARROW_PATH} fill="#3b0505" stroke="#250303" strokeWidth="1" />
          </g>
        ))}

        {/* Domo circular central */}
        <circle cx="0" cy="0" r="42" fill="url(#emCenterDomeGrad)" stroke="#5c0a0a" strokeWidth="1.5" />
      </g>

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
        <linearGradient id="m6pTBoxBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a8cf2" />
          <stop offset="35%" stopColor="#2a63cf" />
          <stop offset="70%" stopColor="#1b48ac" />
          <stop offset="100%" stopColor="#0f2c78" />
        </linearGradient>
        <linearGradient id="m6pPlateBlack" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e2328" />
          <stop offset="100%" stopColor="#080a0c" />
        </linearGradient>
        <linearGradient id="m6pSilverNut" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="m6pStatorBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a8cf2" />
          <stop offset="35%" stopColor="#2a63cf" />
          <stop offset="70%" stopColor="#1b48ac" />
          <stop offset="100%" stopColor="#0f2c78" />
        </linearGradient>
        <linearGradient id="m6pChrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eaf0f8" />
          <stop offset="25%" stopColor="#7a8c9e" />
          <stop offset="50%" stopColor="#f0f5fa" />
          <stop offset="75%" stopColor="#506070" />
          <stop offset="100%" stopColor="#d5e0ea" />
        </linearGradient>
        <radialGradient id="m6pShaftSteel" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </radialGradient>
      </defs>

      {/* ======================================================
          TOP: TERMINAL BOX (CAIXA DE BORNES INDUSTRIAL GEMINI-SVG)
          ====================================================== */}
      {/* 3 Top Conduit Hubs */}
      {[25, 44, 63].map((hx, i) => (
        <rect key={`hub-${i}`} x={hx - 4.5} y="1" width="9" height="4" rx="1" fill="#1b48ac" stroke="#081018" strokeWidth="0.6" />
      ))}

      {/* Outer Blue Cast Enclosure Box */}
      <rect x="7" y="3.5" width="74" height="35" rx="4" fill="url(#m6pTBoxBlue)" stroke="#09131d" strokeWidth="1" />
      <rect x="9" y="5" width="70" height="32" rx="3" fill="none" stroke="#60a5fa" strokeWidth="0.6" opacity="0.4" />

      {/* 4 Corner Lid Bolts */}
      {[
        { cx: 10.5, cy: 7 },
        { cx: 77.5, cy: 7 },
        { cx: 10.5, cy: 35 },
        { cx: 77.5, cy: 35 },
      ].map((b, idx) => (
        <circle key={`t-bolt-${idx}`} cx={b.cx} cy={b.cy} r="1.5" fill="#cbd5e1" stroke="#0f172a" strokeWidth="0.4" />
      ))}

      {/* Black Bakelite Terminal Plate */}
      <rect x="14" y="6.5" width="60" height="29" rx="3" fill="url(#m6pPlateBlack)" stroke="#050708" strokeWidth="0.8" />

      {/* Row 1: W2, U2, V2 */}
      {[25, 42, 59].map((cx, idx) => {
        const names = ['W2', 'U2', 'V2'];
        return (
          <g key={`m6p-top-${names[idx]}`}>
            <text x={cx} y="11" fill="#cbd5e1" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {names[idx]}
            </text>
            <circle cx={cx} cy="15.5" r="3.2" fill="url(#m6pSilverNut)" stroke="#334155" strokeWidth="0.5" />
            <circle cx={cx} cy="15.5" r="2.2" fill="#e2e8f0" stroke="#475569" strokeWidth="0.4" />
            <circle cx={cx} cy="15.5" r="1.1" fill="#0f172a" />
          </g>
        );
      })}

      {/* Row 2: U1, V1, W1 */}
      {[25, 42, 59].map((cx, idx) => {
        const names = ['U1', 'V1', 'W1'];
        return (
          <g key={`m6p-bot-${names[idx]}`}>
            <circle cx={cx} cy="24.5" r="3.2" fill="url(#m6pSilverNut)" stroke="#334155" strokeWidth="0.5" />
            <circle cx={cx} cy="24.5" r="2.2" fill="#e2e8f0" stroke="#475569" strokeWidth="0.4" />
            <circle cx={cx} cy="24.5" r="1.1" fill="#0f172a" />
            <text x={cx} y="32" fill="#cbd5e1" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {names[idx]}
            </text>
          </g>
        );
      })}

      {/* Ground PE on Right */}
      <g>
        <circle cx="69.5" cy="20" r="3.2" fill="url(#m6pSilverNut)" stroke="#334155" strokeWidth="0.5" />
        <circle cx="69.5" cy="20" r="2.2" fill="#22c55e" stroke="#15803d" strokeWidth="0.4" />
        <line x1="69.5" y1="18.5" x2="69.5" y2="20" stroke="#ffffff" strokeWidth="0.5" />
        <line x1="68" y1="20" x2="71" y2="20" stroke="#ffffff" strokeWidth="0.5" />
        <line x1="68.6" y1="20.8" x2="70.4" y2="20.8" stroke="#ffffff" strokeWidth="0.5" />
      </g>

      {/* ======================================================
          BOTTOM: MOTOR FRONTAL VIEW (CORPO DO MOTOR V2)
          ====================================================== */}
      {/* Mounting Feet */}
      <rect x="11" y="93" width="16" height="4.5" rx="1" fill="#1b48ac" stroke="#0b1e4a" strokeWidth="0.8" />
      <circle cx="15" cy="95" r="1.2" fill="#cbd5e1" />
      <rect x="61" y="93" width="16" height="4.5" rx="1" fill="#1b48ac" stroke="#0b1e4a" strokeWidth="0.8" />
      <circle cx="73" cy="95" r="1.2" fill="#cbd5e1" />

      {/* Main Square/Rounded Panel in Gradient Blue V2 */}
      <rect x="12" y="41" width="64" height="54" rx="8" fill="url(#m6pStatorBlue)" stroke="#0b1e4a" strokeWidth="1" />
      {/* Inner subtle glow */}
      <rect x="13.5" y="42.5" width="61" height="51" rx="6.5" fill="none" stroke="#60a5fa" strokeWidth="0.6" opacity="0.5" />

      {/* Chrome Bezel Ring */}
      <circle cx="44" cy="68" r="21" fill="url(#m6pChrome)" stroke="#1a2530" strokeWidth="0.8" />
      {/* Dark Dial Chamber */}
      <circle cx="44" cy="68" r="17.5" fill="#09101d" stroke="#1e293b" strokeWidth="0.8" />

      {/* Stator Coils Hints (A, B, C) */}
      <circle cx="44" cy="54" r="2.2" fill="#e03030" opacity="0.85" />
      <circle cx="44" cy="82" r="2.2" fill="#e03030" opacity="0.85" />
      <circle cx="32" cy="61" r="2.2" fill="#2070e0" opacity="0.85" />
      <circle cx="56" cy="75" r="2.2" fill="#2070e0" opacity="0.85" />
      <circle cx="32" cy="75" r="2.2" fill="#d49010" opacity="0.85" />
      <circle cx="56" cy="61" r="2.2" fill="#d49010" opacity="0.85" />

      {/* Squirrel-cage Rotor Core */}
      <circle cx="44" cy="68" r="9.5" fill="#64748b" stroke="#334155" strokeWidth="0.6" />
      {/* Copper bars around rotor */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={`bar-${deg}`}
            x1={44 + 5.5 * Math.cos(rad)}
            y1={68 + 5.5 * Math.sin(rad)}
            x2={44 + 8.5 * Math.cos(rad)}
            y2={68 + 8.5 * Math.sin(rad)}
            stroke={deg === 0 ? '#fbbf24' : '#f97316'}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}

      {/* Mechanical Shaft Center */}
      <circle cx="44" cy="68" r="4.2" fill="url(#m6pShaftSteel)" stroke="#1e293b" strokeWidth="0.6" />
      <circle cx="44" cy="68" r="1.8" fill="#1e293b" />

      {/* Bottom-Left Star/Delta Badge Indicator */}
      <circle cx="19" cy="87.5" r="4.5" fill="#081020" stroke="#f59e0b" strokeWidth="0.8" />
      <polygon points="19,85 21.5,89.2 16.5,89.2" stroke="#f59e0b" strokeWidth="0.8" fill="rgba(245, 158, 11, 0.35)" />
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
        <radialGradient id="thumbPilotLensGrad" cx="44%" cy="40%" r="58%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="75%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
        <linearGradient id="thumbPilotBarrel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e2229" />
          <stop offset="40%" stopColor="#3d4450" />
          <stop offset="100%" stopColor="#15181d" />
        </linearGradient>
      </defs>

      {/* Corpo cilíndrico traseiro com aletas */}
      <path d="M 22 24 Q 20 40 22 56 L 46 60 Q 44 40 46 20 Z" fill="url(#thumbPilotBarrel)" stroke="#121518" strokeWidth="0.8" />
      <line x1="26" y1="30" x2="40" y2="33" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="25" y1="40" x2="40" y2="43" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="26" y1="50" x2="40" y2="53" stroke="#4a5568" strokeWidth="1.6" strokeLinecap="round" />

      {/* Aro preto frontal e chanfro */}
      <ellipse cx="58" cy="40" rx="26" ry="26" fill="#14171c" stroke="#2d333d" strokeWidth="1.2" />
      <ellipse cx="58" cy="40" rx="24" ry="24" fill="#b91c1c" stroke="#450a0a" strokeWidth="1" />

      {/* Lente circular frontal translúcida */}
      <circle cx="58" cy="40" r="22" fill="url(#thumbPilotLensGrad)" stroke="#ef4444" strokeWidth="0.8" />
      {/* Anel concêntrico difusor */}
      <circle cx="58" cy="40" r="16" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      {/* Brilho especular */}
      <path d="M 42 35 C 45 25 66 22 74 30 C 69 26 50 28 42 35 Z" fill="#ffffff" opacity="0.55" />

      {/* Mini base de bornes traseira */}
      <rect x="22" y="66" width="56" height="11" rx="2.5" fill="#181c22" stroke="#2d333e" strokeWidth="0.7" />
      <circle cx="36" cy="71.5" r="3.2" fill="#334155" stroke="#94a3b8" strokeWidth="0.6" />
      <circle cx="64" cy="71.5" r="3.2" fill="#334155" stroke="#94a3b8" strokeWidth="0.6" />

      {/* Identificação */}
      <text x="50" y="82" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle">SINALEIRA 22mm</text>
    </svg>
  );
}

export function FuseHolderThumbnail() {
  return (
    <svg viewBox="0 0 46 92" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      {/* Corpo principal */}
      <rect x="5" y="2" width="36" height="88" rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      {/* Degraus DIN superior e inferior */}
      <rect x="5" y="2" width="36" height="18" fill="#e2e8f0" />
      <rect x="5" y="72" width="36" height="18" fill="#e2e8f0" />
      {/* Borne Parafuso Top */}
      <circle cx="23" cy="11" r="5" fill="#0f172a" />
      <circle cx="23" cy="11" r="3.2" fill="#cbd5e1" />
      <line x1="21" y1="11" x2="25" y2="11" stroke="#334155" strokeWidth="1" />
      {/* Borne Parafuso Bot */}
      <circle cx="23" cy="81" r="5" fill="#0f172a" />
      <circle cx="23" cy="81" r="3.2" fill="#cbd5e1" />
      <line x1="21" y1="81" x2="25" y2="81" stroke="#334155" strokeWidth="1" />
      {/* Gaveta frontal */}
      <rect x="7" y="22" width="32" height="48" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      {/* Logo ZBENY */}
      <text x="23" y="30" fontSize="4.5" fontWeight="900" fill="#0f172a" textAnchor="middle" letterSpacing="0.4">ZBENY</text>
      <text x="23" y="36" fontSize="4" fontWeight="bold" fill="#334155" textAnchor="middle">BR-30</text>
      <text x="23" y="41" fontSize="3" fontWeight="bold" fill="#64748b" textAnchor="middle">10x38 30A</text>
      {/* Lente Vermelha Indicadora */}
      <rect x="15" y="45" width="16" height="5" rx="2.5" fill="#dc2626" stroke="#991b1b" strokeWidth="0.6" />
      <ellipse cx="21" cy="46.5" rx="3" ry="1" fill="#ffffff" opacity="0.6" />
      {/* Cavidade puxador de dedo */}
      <rect x="11" y="55" width="24" height="11" rx="1.5" fill="#0f172a" />
      <rect x="12" y="61" width="22" height="4" rx="1" fill="#334155" />
    </svg>
  );
}

export function TerminalBlockThumbnail() {
  return (
    <svg viewBox="0 0 100 84" className="comp-thumb-svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="tbThumbPlast" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22262d" />
          <stop offset="50%" stopColor="#373e48" />
          <stop offset="100%" stopColor="#22262d" />
        </linearGradient>
      </defs>
      {/* 3 Bornes acoplados lado a lado */}
      {[0, 1, 2].map((idx) => {
        const bx = 23 + idx * 18;
        return (
          <g key={idx}>
            <rect x={bx} y="8" width="18" height="66" rx="2" fill="url(#tbThumbPlast)" stroke="#111317" strokeWidth="0.8" />
            {/* Grampo superior */}
            <rect x={bx + 3} y="6" width="12" height="4" rx="1" fill="#4b5563" />
            {/* Parafuso superior */}
            <circle cx={bx + 9} cy="18" r="4.5" fill="#0f1115" />
            <circle cx={bx + 9} cy="18" r="3.2" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
            <line x1={bx + 7} y1="18" x2={bx + 11} y2="18" stroke="#0f172a" strokeWidth="0.8" />
            {/* Plaqueta superior */}
            <rect x={bx + 2} y="26" width="14" height="8" rx="1" fill="#333a44" stroke="#1c2026" strokeWidth="0.5" />
            <text x={bx + 9} y="32" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">{idx + 1}</text>
            {/* Câmara vermelha */}
            <rect x={bx + 3} y="36" width="12" height="7" rx="0.5" fill="#8a1c1c" />
            {/* Plaqueta inferior */}
            <rect x={bx + 2} y="45" width="14" height="8" rx="1" fill="#333a44" stroke="#1c2026" strokeWidth="0.5" />
            <text x={bx + 9} y="51" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">{idx + 1}'</text>
            {/* Parafuso inferior */}
            <circle cx={bx + 9} cy="60" r="4.5" fill="#0f1115" />
            <circle cx={bx + 9} cy="60" r="3.2" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
            <line x1={bx + 7} y1="60" x2={bx + 11} y2="60" stroke="#0f172a" strokeWidth="0.8" />
          </g>
        );
      })}
      <text x="50" y="81" fill="#38bdf8" fontSize="6.5" fontWeight="bold" textAnchor="middle">BORNEIRA</text>
    </svg>
  );
}

export function TextThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', background: 'transparent' }}>
      <svg viewBox="0 0 100 70" className="comp-thumb-svg">
        <rect x="14" y="14" width="72" height="42" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
        <text x="50" y="42" fill="#38bdf8" fontSize="26" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">T</text>
      </svg>
      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>TEXTO</span>
    </div>
  );
}

export function FloatSwitchThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '4px', background: 'transparent' }}>
      <svg viewBox="0 0 100 85" style={{ width: '92%', height: '92%', display: 'block' }}>
        {/* Caixa d'água trapezoidal azul */}
        <polygon points="26,16 80,16 74,76 32,76" fill="#081426" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Tampa azul */}
        <polygon points="24,16 53,10 82,16 80,19 26,19" fill="#0284c7" />
        {/* Água interna */}
        <polygon points="30,48 76,48 74,76 32,76" fill="#0284c7" opacity="0.8" />
        <line x1="30" y1="48" x2="76" y2="48" stroke="#38bdf8" strokeWidth="1" />
        {/* Borneira no topo esquerdo */}
        <rect x="6" y="14" width="12" height="26" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
        <circle cx="12" cy="18" r="1.5" fill="#f8fafc" />
        <circle cx="12" cy="26" r="1.5" fill="#f8fafc" />
        <circle cx="12" cy="34" r="1.5" fill="#f8fafc" />
        {/* Fios saindo da borneira */}
        <path d="M 16 18 Q 22 18 26 22" fill="none" stroke="#0f172a" strokeWidth="0.8" />
        <path d="M 16 26 Q 22 24 26 23" fill="none" stroke="#78350f" strokeWidth="0.8" />
        <path d="M 16 34 Q 22 30 26 24" fill="none" stroke="#1d4ed8" strokeWidth="0.8" />
        {/* Tubulação horizontal de entrada com registro na esquerda */}
        <rect x="6" y="44" width="22" height="3" fill="#78350f" />
        <circle cx="17" cy="45.5" r="2.2" fill="#ea580c" />
        {/* Tubulação de saída no canto inferior direito */}
        <rect x="74" y="66" width="20" height="3" fill="#78350f" />
        {/* Cabo e contrapeso amarelo */}
        <path d="M 26 23 Q 36 30 42 42 T 54 50" fill="none" stroke="#0f172a" strokeWidth="1.2" />
        <rect x="40" y="40" width="4" height="6" rx="1" fill="#eab308" />
        {/* Boia horizontal EngeHall */}
        <rect x="52" y="47" width="14" height="6" rx="1.5" fill="#0284c7" />
        <rect x="50" y="49" width="16" height="1.5" rx="0.5" fill="#ea580c" />
        <rect x="48" y="48.5" width="3" height="2.5" rx="0.5" fill="#ea580c" />
      </svg>
      <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '7px', fontWeight: 800, color: '#38bdf8' }}>
        CAIXA D'ÁGUA
      </span>
    </div>
  );
}

export const COMPONENT_THUMBNAILS = {
  power_source: PowerSourceThumbnail,
  circuit_breaker: BreakerThumbnail,
  fuse_holder: FuseHolderThumbnail,
  contactor: ContactorThumbnail,
  thermal_relay: ThermalRelayThumbnail,
  timer_relay: TimerRelayThumbnail,
  button_start: ButtonStartThumbnail,
  button_stop: ButtonStopThumbnail,
  button_emergency: ButtonEmergencyThumbnail,
  motor_6p: Motor6PThumbnail,
  pilot_light: PilotLightThumbnail,
  led_bulb: LedBulbThumbnail,
  din_rail: DinRailThumbnail,
  terminal_block: TerminalBlockThumbnail,
  text_note: TextThumbnail,
  float_switch: FloatSwitchThumbnail,
};

/* ==========================================================
   SCHEMATIC SYMBOL THUMBNAILS (IEC 60617)
   ========================================================== */
export function SchematicPowerSourceThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <line x1="26" y1="14" x2="88" y2="14" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="26" x2="88" y2="26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="38" x2="88" y2="38" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="50" x2="88" y2="50" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="62" x2="88" y2="62" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />
      <circle cx="88" cy="14" r="2" fill="#a855f7" />
      <circle cx="88" cy="26" r="2" fill="#ffffff" />
      <circle cx="88" cy="38" r="2" fill="#ef4444" />
      <circle cx="88" cy="50" r="2" fill="#0ea5e9" />
      <circle cx="88" cy="62" r="2" fill="#16a34a" />
      <text x="8" y="17" fill="#a855f7" fontSize="8" fontWeight="bold">L1</text>
      <text x="8" y="29" fill="#ffffff" fontSize="8" fontWeight="bold">L2</text>
      <text x="8" y="41" fill="#ef4444" fontSize="8" fontWeight="bold">L3</text>
      <text x="8" y="53" fill="#0ea5e9" fontSize="8" fontWeight="bold">N</text>
      <text x="7" y="65" fill="#16a34a" fontSize="7" fontWeight="bold">PE</text>
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

export function SchematicFuseHolderThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <circle cx="30" cy="35" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="33" y1="35" x2="45" y2="35" stroke="#38bdf8" strokeWidth="1.8" />
      {/* Símbolo do Elo Fusível */}
      <rect x="45" y="27" width="24" height="16" fill="rgba(15, 23, 42, 0.6)" stroke="#38bdf8" strokeWidth="1.8" rx="1" />
      <line x1="41" y1="35" x2="73" y2="35" stroke="#38bdf8" strokeWidth="1.8" />
      <line x1="69" y1="35" x2="81" y2="35" stroke="#38bdf8" strokeWidth="1.8" />
      <circle cx="84" cy="35" r="3" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="57" y="22" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">F1</text>
    </svg>
  );
}

export function SchematicFloatSwitchThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <circle cx="32" cy="16" r="2.5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="32" y1="18.5" x2="32" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="2.5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Contato NF */}
      <circle cx="32" cy="54" r="2.5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="32" y1="30" x2="32" y2="52" stroke="#38bdf8" strokeWidth="1.8" />
      {/* Contato NA */}
      <circle cx="68" cy="54" r="2.5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Haste mecânica e boia */}
      <line x1="32" y1="41" x2="56" y2="41" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="2 2" />
      <rect x="56" y="36" width="12" height="10" rx="1.5" fill="none" stroke="#38bdf8" strokeWidth="1.4" />
      <path d="M 54 50 Q 58 48 62 50 T 70 50" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
      <text x="82" y="44" fill="#ffffff" fontSize="8" fontWeight="bold">B1</text>
    </svg>
  );
}

export function LedBulbThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderRadius: '4px', background: 'transparent' }}>
      <div style={{ position: 'relative', width: '42px', height: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src="/led_bulb.png"
          alt="Lâmpada LED"
          style={{ width: '38px', height: '54px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
        />
        {/* Mini Bocal E27 */}
        <div style={{ width: '28px', height: '12px', background: 'linear-gradient(180deg, #2a3342 0%, #12161f 100%)', borderRadius: '2px 2px 4px 4px', border: '1px solid #3b4556', marginTop: '-6px', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 3px' }}>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#94a3b8' }} />
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#94a3b8' }} />
        </div>
      </div>
      <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '7px', fontWeight: 800, color: '#facc15' }}>
        LÂMPADA LED
      </span>
    </div>
  );
}

export function SchematicPilotLightThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <circle cx="50" cy="35" r="18" fill="#090d16" stroke="#38bdf8" strokeWidth="2" />
      <line x1="37" y1="22" x2="63" y2="48" stroke="#38bdf8" strokeWidth="2" />
      <line x1="63" y1="22" x2="37" y2="48" stroke="#38bdf8" strokeWidth="2" />
      <text x="75" y="38" fill="#ffffff" fontSize="8" fontWeight="bold">H1</text>
    </svg>
  );
}

export function SchematicLedBulbThumbnail() {
  return (
    <svg viewBox="0 0 100 70" className="comp-thumb-svg">
      <circle cx="50" cy="35" r="18" fill="#090d16" stroke="#facc15" strokeWidth="2" />
      <line x1="37" y1="22" x2="63" y2="48" stroke="#facc15" strokeWidth="2" />
      <line x1="63" y1="22" x2="37" y2="48" stroke="#facc15" strokeWidth="2" />
      <text x="75" y="38" fill="#ffffff" fontSize="8" fontWeight="bold">L1</text>
    </svg>
  );
}

export const SCHEMATIC_THUMBNAILS = {
  power_source: SchematicPowerSourceThumbnail,
  circuit_breaker: SchematicBreakerThumbnail,
  fuse_holder: SchematicFuseHolderThumbnail,
  contactor: SchematicContactorThumbnail,
  thermal_relay: SchematicThermalRelayThumbnail,
  timer_relay: SchematicTimerRelayThumbnail,
  button_start: SchematicButtonStartThumbnail,
  button_stop: SchematicButtonStopThumbnail,
  button_emergency: SchematicButtonEmergencyThumbnail,
  motor_6p: SchematicMotorThumbnail,
  pilot_light: SchematicPilotLightThumbnail,
  led_bulb: SchematicLedBulbThumbnail,
  text_note: TextThumbnail,
  float_switch: SchematicFloatSwitchThumbnail,
};
