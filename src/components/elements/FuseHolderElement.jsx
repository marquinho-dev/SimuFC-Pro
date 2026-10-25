import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/soundEffects';

/**
 * Realistic Industrial DIN-Rail Fuse Holder (Seccionadora Porta-Fusível 10x38 1P)
 * Comportamento de porta-fusível seccionável:
 * - A tampa (gaveta) é articulada na base e abre PARA A FRENTE (rotateX 3D), levando o fusível junto.
 * - Ao abrir, a cavidade com os clipes de latão fica exposta e o circuito da carga é seccionado.
 * - Clipe superior brilha quando há tensão na linha (terminal 1); o inferior só quando conduz (terminal 2).
 * - Fusível queimado: indicador vermelho na tampa metálica + marca de fuligem no corpo cerâmico.
 * - Troca do fusível e mudança de corrente nominal somente com o porta-fusível ABERTO.
 * - Queima automática por sobrecorrente se state.loadCurrent > corrente nominal por 1,3 s.
 * - Screw terminals (1 top / 2 bottom) with realistic voltage glowing / connection halos.
 */
const RATINGS = [2, 4, 6, 10, 16, 20, 25, 30, 32];
const OVERLOAD_DELAY_MS = 1300;
// Duração do fechamento (deve casar com a transição de fechamento em App.css)
const CLOSE_SEAT_MS = 420;

// ---- Modelo 3D Tubular de Alta Fidelidade (16 facetas perfeitamente cilíndricas) ----
const SIDES = 16;
const RADIUS = 14;
const FACET_WIDTH = +(2 * RADIUS * Math.tan(Math.PI / SIDES) + 0.6).toFixed(2);
const APOTHEM = +(RADIUS * Math.cos(Math.PI / SIDES)).toFixed(2);
const LIGHT_DIR = (-35 * Math.PI) / 180;

function computeFacetShade(k, baseColor, specPower, isBody) {
  const angle = (k * 2 * Math.PI) / SIDES;
  const cosLight = Math.max(0, Math.cos(angle - LIGHT_DIR));
  const diffuse = 0.32 + 0.68 * cosLight;
  const specular = Math.pow(cosLight, specPower) * (isBody ? 0.22 : 0.65);
  const rgb = baseColor.map((channel) => Math.min(255, Math.round(channel * diffuse + 255 * specular)));
  return `rgb(${rgb.join(',')})`;
}

// Pré-computa as facetas para alta performance
const CYL_SECTIONS = [
  // Cap metálica superior (0 a 25px)
  ...Array.from({ length: SIDES }, (_, k) => ({
    key: `cap-t-${k}`,
    section: 'cap-top',
    k,
    top: 0,
    height: 25,
    bg: computeFacetShade(k, [200, 206, 212], 6, false),
  })),
  // Corpo cerâmico (25 a 129px = 104px)
  ...Array.from({ length: SIDES }, (_, k) => ({
    key: `body-${k}`,
    section: 'body',
    k,
    top: 25,
    height: 104,
    bg: computeFacetShade(k, [240, 236, 224], 8, true),
  })),
  // Cap metálica inferior (129 a 154px = 25px)
  ...Array.from({ length: SIDES }, (_, k) => ({
    key: `cap-b-${k}`,
    section: 'cap-bot',
    k,
    top: 129,
    height: 25,
    bg: computeFacetShade(k, [200, 206, 212], 6, false),
  })),
];

export default function FuseHolderElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
  isSelected = false,
}) {
  const isClosed = component.state?.closed !== false; // Default closed
  const isBlown = Boolean(component.state?.fuseBlown);
  const rating = component.state?.currentRating || 30;
  const loadCurrent = Number(component.state?.loadCurrent) || 0;
  const tag = component.tag || 'F1';
  const conducts = isClosed && !isBlown;

  // Standard 1P DIN rail dimensions (proportional 52px width, 218px height)
  const scale = 52 / 94;
  const width = 52;
  const height = 218;

  const origWidth = 94;
  const origHeight = 395;
  const id = component.id;

  // Terminal voltages (1 top = linha, 2 bottom = carga)
  const term1Volt = terminalVoltages?.get ? terminalVoltages.get(`${id}:1`) : undefined;
  const term2Volt = terminalVoltages?.get ? terminalVoltages.get(`${id}:2`) : undefined;
  const topLive = Boolean(term1Volt);
  const botLive = Boolean(term2Volt) && conducts;

  // Has voltage differential across terminals when blown (indicator glows)
  const hasVoltageAcross = Boolean((term1Volt && !term2Volt) || (!term1Volt && term2Volt) || (term1Volt && term2Volt && term1Volt !== term2Volt));
  const showIndicatorGlow = isBlown && (hasVoltageAcross || isSimulationMode);

  const update = (partial) => {
    if (onUpdateComponentState) onUpdateComponentState(id, partial);
  };
  const click = () => {
    try {
      sounds.playButtonClick();
    } catch {}
  };

  // Posição visual da tampa (pode estar em movimento enquanto o estado elétrico ainda não mudou)
  const [visualOpen, setVisualOpen] = useState(!isClosed);
  const seatTimerRef = useRef(null);
  useEffect(() => {
    // Sincroniza com mudanças externas (ex.: reset ao parar a simulação)
    if (!seatTimerRef.current) setVisualOpen(!isClosed);
  }, [isClosed]);
  useEffect(() => () => clearTimeout(seatTimerRef.current), []);

  // Abrir / fechar a tampa (somente em simulação).
  // Realismo: ao ABRIR o contato se desfaz imediatamente (as pontas saem dos clipes);
  // ao FECHAR só reconecta quando a tampa termina de assentar, com o "clique" de travamento.
  const toggle = () => {
    if (!isSimulationMode) return;
    clearTimeout(seatTimerRef.current);
    seatTimerRef.current = null;
    if (!visualOpen) {
      setVisualOpen(true);
      click();
      update({ closed: false });
    } else {
      setVisualOpen(false);
      seatTimerRef.current = setTimeout(() => {
        seatTimerRef.current = null;
        click();
        update({ closed: true });
      }, CLOSE_SEAT_MS);
    }
  };
  const handleLeverClick = (e) => {
    e.stopPropagation();
    toggle();
  };
  const handleLeverKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    }
  };

  // Queimar manualmente (botão direito na tampa)
  const handleManualBlow = (e) => {
    if (!isSimulationMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (isBlown) return;
    try {
      sounds.playTrip();
    } catch {}
    update({ fuseBlown: true });
  };

  // Trocar fusível: só com o porta-fusível aberto e fusível queimado
  const handleReplaceFuse = (e) => {
    e.stopPropagation();
    if (!isSimulationMode || isClosed || !isBlown) return;
    click();
    update({ fuseBlown: false });
  };

  // Mudar corrente nominal: só com o porta-fusível aberto
  const handleCycleRating = (e) => {
    e.stopPropagation();
    if (!isSimulationMode || isClosed) return;
    const idx = RATINGS.indexOf(rating);
    const next = RATINGS[(idx + 1) % RATINGS.length] ?? RATINGS[0];
    click();
    update({ currentRating: next });
  };

  // Vigia de sobrecorrente: se conduzir com carga acima da nominal, queima após 1,3 s
  const timerRef = useRef(null);
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (isSimulationMode && conducts && loadCurrent > rating) {
      timerRef.current = setTimeout(() => {
        try {
          sounds.playTrip();
        } catch {}
        update({ fuseBlown: true });
      }, OVERLOAD_DELAY_MS);
    }
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulationMode, conducts, loadCurrent, rating]);

  const leverTitle = isSimulationMode
    ? isClosed
      ? 'Porta-fusível fechado • Clique para abrir a tampa e seccionar o circuito • Botão direito: queimar fusível'
      : isBlown
      ? 'Porta-fusível aberto • Fusível QUEIMADO — troque o fusível antes de fechar'
      : 'Porta-fusível aberto • Clique para fechar a tampa e reconectar a carga'
    : undefined;

  return (
    <div
      className={`fuse-holder-din-device ${isClosed ? 'fuse-closed' : 'fuse-open'} ${isBlown ? 'fuse-blown' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        userSelect: 'none',
        background: 'transparent',
      }}
      data-component-type="fuse_holder"
      data-component-id={id}
    >
      {/* Cena em coordenadas originais (94x395), escalada para o tamanho DIN */}
      <div
        className="fh-scene"
        style={{
          width: `${origWidth}px`,
          height: `${origHeight}px`,
          transform: `scale(${scale})`,
        }}
      >
        {/* Corpo fixo: carcaça, degraus e bornes */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${origWidth} ${origHeight}`}
          width={origWidth}
          height={origHeight}
          style={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id={`fhBodyGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e5e9f0" />
              <stop offset="12%" stopColor="#f8fafc" />
              <stop offset="85%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#d8dee9" />
            </linearGradient>
            <linearGradient id={`fhTierGrad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <radialGradient id={`fhScrewWell-${id}`} cx="45%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="75%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id={`fhScrewMetal-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="45%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Base Housing Outline */}
          <rect x="2" y="2" width="90" height="391" rx="6" fill={`url(#fhBodyGrad-${id})`} stroke="#94a3b8" strokeWidth="1.6" />

          {/* DIN Modular Side Latch Indentations */}
          <rect x="4" y="85" width="5" height="8" rx="1.5" fill="#cbd5e1" />
          <rect x="85" y="85" width="5" height="8" rx="1.5" fill="#cbd5e1" />
          <rect x="4" y="275" width="5" height="8" rx="1.5" fill="#cbd5e1" />
          <rect x="85" y="275" width="5" height="8" rx="1.5" fill="#cbd5e1" />

          {/* Top / Bottom Tiers */}
          <path d="M 2 2 L 92 2 L 92 72 L 84 82 L 10 82 L 2 72 Z" fill={`url(#fhTierGrad-${id})`} stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 10 314 L 84 314 L 92 324 L 92 393 L 2 393 L 2 324 Z" fill={`url(#fhTierGrad-${id})`} stroke="#cbd5e1" strokeWidth="1" />

          {/* Top Terminal Screw */}
          <circle cx="47" cy="38" r="23" fill="#94a3b8" opacity="0.4" />
          <circle cx="47" cy="38" r="21" fill={`url(#fhTierGrad-${id})`} stroke="#64748b" strokeWidth="1" />
          <circle cx="47" cy="38" r="16.5" fill={`url(#fhScrewWell-${id})`} />
          <circle cx="47" cy="38" r="11" fill={`url(#fhScrewMetal-${id})`} stroke="#475569" strokeWidth="0.8" />
          <g transform="rotate(25 47 38)">
            <line x1="39" y1="38" x2="55" y2="38" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <line x1="47" y1="30" x2="47" y2="46" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          </g>
          <text x="9" y="14" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="#475569">1</text>

          {/* Bottom Terminal Screw */}
          <circle cx="47" cy="357" r="23" fill="#94a3b8" opacity="0.4" />
          <circle cx="47" cy="357" r="21" fill={`url(#fhTierGrad-${id})`} stroke="#64748b" strokeWidth="1" />
          <circle cx="47" cy="357" r="16.5" fill={`url(#fhScrewWell-${id})`} />
          <circle cx="47" cy="357" r="11" fill={`url(#fhScrewMetal-${id})`} stroke="#475569" strokeWidth="0.8" />
          <g transform="rotate(25 47 357)">
            <line x1="39" y1="357" x2="55" y2="357" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <line x1="47" y1="349" x2="47" y2="365" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          </g>
          <text x="9" y="388" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700" fill="#475569">2</text>
        </svg>

        {/* Cavidade interna com clipes de latão (exposta quando a tampa abre) */}
        <div className="fh-cavity">
          <div className={`fh-clip fh-clip-top ${topLive && isSimulationMode ? 'live' : ''}`} />
          <div className={`fh-clip fh-clip-bot ${botLive && isSimulationMode ? 'live' : ''}`} />
        </div>
        <div className="fh-hinge" />

        {/* Tampa articulada (caixa 3D com profundidade) que carrega o fusível */}
        <div
          className={`fh-lever fuse-drawer-handle-interactive ${visualOpen ? 'open' : ''}`}
          onClick={handleLeverClick}
          onKeyDown={handleLeverKey}
          onContextMenu={handleManualBlow}
          tabIndex={isSimulationMode ? 0 : -1}
          role="button"
          aria-pressed={visualOpen}
          aria-label={`Tampa do porta-fusível ${tag} (${visualOpen ? 'aberta' : 'fechada'})`}
          title={leverTitle}
          style={{
            cursor: isSimulationMode ? 'pointer' : 'grab',
            pointerEvents: isSimulationMode ? 'auto' : 'none',
          }}
        >
          {/* Paredes internas da gaveta */}
          <div className="fh-back" />
          <div className="fh-wall fh-wl" />
          <div className="fh-wall fh-wr" />
          <div className="fh-wall fh-wt" />
          <div className="fh-wall fh-wb" />
          {/* Copos de latão que seguram as pontas do fusível */}
          <div className="fh-cup" style={{ top: '36px' }} />
          <div className="fh-cup" style={{ top: '184px' }} />

          {/* Fusível Cilíndrico Tubular 3D Real (16 facetas + disco superior com pino + disco inferior) */}
          <div className={`fh-tube-3d ${isBlown ? 'blown' : ''}`}>
            {/* Disco metálico circular do topo (plano XZ que inclina em perspectiva ao abrir a gaveta) */}
            <div className="fh-disc fh-disc-top">
              <div className="fh-disc-pin" />
            </div>

            {/* Facetas do tubo cilíndrico com sombreamento suave */}
            {CYL_SECTIONS.map((sec) => (
              <div
                key={sec.key}
                className={`fh-facet ${sec.section}`}
                style={{
                  top: `${sec.top}px`,
                  height: `${sec.height}px`,
                  backgroundColor: sec.bg,
                  transform: `rotateY(${(sec.k * 360) / SIDES}deg) translateZ(${APOTHEM}px)`,
                }}
              />
            ))}

            {/* Inscrição técnica na cerâmica frontal */}
            <div className="fh-tube-label">
              <span>{`gG ${rating} A · 500 V · 10×38`}</span>
            </div>

            {/* Mancha de fuligem de queima */}
            <div className="fh-tube-soot" />

            {/* Disco metálico da base inferior */}
            <div className="fh-disc fh-disc-bot" />
          </div>

          {/* Face frontal com janela vazada */}
          <div className="fh-front" />
          <div className="fh-pane" />
          <div className="fh-grip">
            <span>{rating} A</span>
          </div>
          <div className="fh-tag">{tag}</div>
          {/* Lente neon (acende com fusível queimado e tensão presente) */}
          <div className={`fh-lens ${showIndicatorGlow ? 'on' : ''}`} />
        </div>
      </div>

      {/* Ações disponíveis somente com o porta-fusível ABERTO */}
      {isSimulationMode && !isClosed && visualOpen && (
        <div className="fh-actions">
          {isBlown ? (
            <button
              type="button"
              className="fuse-drawer-handle-interactive fh-action-btn fh-action-replace"
              onClick={handleReplaceFuse}
              title="Instalar um fusível novo"
            >
              Trocar ⚡
            </button>
          ) : (
            <button
              type="button"
              className="fuse-drawer-handle-interactive fh-action-btn"
              onClick={handleCycleRating}
              title="Trocar a corrente nominal do fusível instalado"
            >
              {rating} A ▸
            </button>
          )}
        </div>
      )}

      {/* Terminal 1 Socket Target (Top screw) */}
      <div
        className={`breaker-terminal-socket fuse-term-top ${
          activeTerminal?.componentId === id && activeTerminal?.terminalId === '1' ? 'selected' : ''
        } ${activeTerminal ? 'wire-target-ready' : ''}`}
        style={{
          position: 'absolute',
          left: '12px',
          top: '7px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          cursor: 'crosshair',
          zIndex: 20,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(id, '1');
        }}
        data-terminal-target={`${id}:1`}
        title={`Terminal 1 (Entrada Superior) • ${term1Volt ? `Fase ${term1Volt}` : 'Sem Tensão'}`}
      />

      {/* Terminal 2 Socket Target (Bottom screw) */}
      <div
        className={`breaker-terminal-socket fuse-term-bot ${
          activeTerminal?.componentId === id && activeTerminal?.terminalId === '2' ? 'selected' : ''
        } ${activeTerminal ? 'wire-target-ready' : ''}`}
        style={{
          position: 'absolute',
          left: '12px',
          top: '183px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          cursor: 'crosshair',
          zIndex: 20,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(id, '2');
        }}
        data-terminal-target={`${id}:2`}
        title={`Terminal 2 (Saída Inferior) • ${term2Volt ? `Fase ${term2Volt}` : 'Sem Tensão'}`}
      />
    </div>
  );
}
