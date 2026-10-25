import React, { useState, useEffect, useRef, useId } from 'react';
import { sounds } from '../../services/soundEffects';

/**
 * FloatSwitchElement - Boia Elétrica de Nível para Reservatório Industrial.
 *
 * Características:
 * - Reservatório com câmara de água translúcida e indicador vertical de nível ("NÍVEL XX%").
 * - Bica metálica cromada de alta qualidade com registro/válvula industrial interativa.
 * - Ao abrir a bica: jato d'água com ondulações e splash, a água sobe continuamente até o topo.
 * - Ao fechar a bica: o jato cessa, o nível esvazia/desce suavemente.
 * - Boia com corpo laranja e flutuador azul que acompanha a superfície da água e inclina:
 *   - Nível Alto (>= 50%): Boia sobe, inclina para cima e LIGA o contato NA (11-14).
 *   - Nível Baixo (< 50%): Boia desce, inclina para baixo e LIGA o contato NF (11-12).
 * - Terminais industriais de topo: 11/COM, 14/NA e 12/NF com bornes parafuso e indicadores de potencial.
 * - Totalmente livre do badge inferior riscado na imagem de referência.
 */

export default function FloatSwitchElement({
  component,
  terminalVoltages,
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode,
  isSelected,
}) {
  const componentId = component.id;
  const state = component.state || {};
  const targetLevelRef = useRef(Number(state.level ?? 22));
  const [level, setLevel] = useState(Number(state.level ?? 22));
  const [isTapOpen, setIsTapOpen] = useState(Boolean(state.isTapOpen));
  const [waveOffset, setWaveOffset] = useState(0);
  const [splashTick, setSplashTick] = useState(0);

  const uid = useId().replace(/:/g, '_');
  const threshold = Number(state.threshold ?? 50);
  const isHigh = level >= threshold;

  // Sincroniza estado externo quando o componente é carregado
  useEffect(() => {
    if (state.level !== undefined && Math.abs(state.level - targetLevelRef.current) > 2) {
      targetLevelRef.current = state.level;
      setLevel(state.level);
    }
    if (state.isTapOpen !== undefined) {
      setIsTapOpen(Boolean(state.isTapOpen));
    }
  }, [state.level, state.isTapOpen]);

  // Loop de animação de enchimento / esvaziamento e ondas da água
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = Math.min(50, time - lastTime);
      lastTime = time;

      // Ondulação suave da água
      setWaveOffset((prev) => (prev + dt * 0.003) % (Math.PI * 2));

      // Se a torneira estiver aberta, enche até 92%; se fechada, esvazia até 18%
      const target = isTapOpen ? 92 : 18;
      const speed = isTapOpen ? 0.35 : 0.28; // % por tick

      setLevel((prev) => {
        let next = prev;
        if (Math.abs(prev - target) > 0.2) {
          if (prev < target) {
            next = Math.min(target, prev + speed * (dt / 16.6));
          } else {
            next = Math.max(target, prev - speed * (dt / 16.6));
          }

          // Se cruzou o threshold (50%), notifica a simulação imediatamente
          const prevHigh = prev >= threshold;
          const nextHigh = next >= threshold;
          if (prevHigh !== nextHigh) {
            try {
              sounds.playSwitch(!nextHigh);
            } catch {}
            onUpdateComponentState?.(componentId, {
              level: Math.round(next),
              isTapOpen,
            });
          }
        }
        return next;
      });

      if (isTapOpen) {
        setSplashTick((prev) => (prev + 1) % 60);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isTapOpen, threshold, componentId, onUpdateComponentState]);

  // Atualiza periodicamente o nível no estado global para persistência
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.abs(level - (state.level ?? 22)) > 1) {
        onUpdateComponentState?.(componentId, {
          level: Math.round(level),
          isTapOpen,
        });
      }
    }, 400);
    return () => clearInterval(timer);
  }, [level, isTapOpen, componentId, state.level, onUpdateComponentState]);

  // Alterna abertura da bica ao clicar no registro
  const handleToggleTap = (e) => {
    e.stopPropagation();
    try {
      sounds.playSwitch(!isTapOpen);
    } catch {}
    const newTapState = !isTapOpen;
    setIsTapOpen(newTapState);
    onUpdateComponentState?.(componentId, {
      isTapOpen: newTapState,
      level: Math.round(level),
    });
  };

  // Ajuste manual pelo termômetro/barra de nível
  const handleBarClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, 1 - clickY / rect.height));
    const newLvl = Math.round(ratio * 100);
    setLevel(newLvl);
    try {
      sounds.playSwitch(newLvl < threshold);
    } catch {}
    onUpdateComponentState?.(componentId, {
      level: newLvl,
      isTapOpen,
    });
  };

  // Cores de tensão nos bornes
  const getVolt = (termId) => terminalVoltages?.get?.(`${componentId}:${termId}`);
  const vCOM = getVolt('COM') || getVolt('11');
  const vNA = getVolt('NA') || getVolt('14');
  const vNF = getVolt('NF') || getVolt('12');

  const getVoltageColor = (v) => {
    if (!v) return null;
    const s = String(v).toUpperCase().trim();
    if (s === 'L1') return '#a855f7';
    if (s === 'L2') return '#ffffff';
    if (s === 'L3') return '#ef4444';
    if (s === 'N') return '#06b6d4';
    if (s === 'PE') return '#16a34a';
    return '#38bdf8';
  };

  // Geometria da água no tanque
  // Tanque útil: x de 18 a 242 (largura 224), y de 68 a 248 (altura 180)
  const tankTopY = 68;
  const tankBottomY = 248;
  const tankHeight = tankBottomY - tankTopY; // 180
  const waterY = tankBottomY - (level / 100) * (tankHeight - 16);

  // Superfície ondulada da água
  const waveAmp = isTapOpen ? 2.8 : 1.4;
  const wavePath = `
    M 18 ${waterY}
    Q ${18 + 56} ${waterY + Math.sin(waveOffset) * waveAmp}, ${18 + 112} ${waterY}
    T ${242} ${waterY}
    L 242 248
    L 18 248
    Z
  `;

  // Posição e inclinação da Boia
  // A boia flutua centralizada em x=135, y=waterY
  // Quando Nível Alto (isHigh): inclina para cima (-14deg)
  // Quando Nível Baixo (!isHigh): inclina para baixo (+20deg)
  const floatAngle = isHigh ? -14 : 20;
  const floatPivotX = 72;
  const floatPivotY = waterY;

  return (
    <div
      style={{
        position: 'relative',
        width: '260px',
        height: '280px',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 260 280"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          filter: isSelected
            ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))'
            : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.55))',
        }}
      >
        <defs>
          {/* Gradiente da carcaça industrial externa */}
          <linearGradient id={`${uid}_casingGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#242c38" />
            <stop offset="60%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#121721" />
          </linearGradient>

          {/* Gradiente interno do reservatório */}
          <linearGradient id={`${uid}_tankInnerGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1019" />
            <stop offset="100%" stopColor="#080c13" />
          </linearGradient>

          {/* Gradiente da água */}
          <linearGradient id={`${uid}_waterGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="15%" stopColor="#0284c7" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#034b79" stopOpacity="0.9" />
          </linearGradient>

          {/* Gradiente do brilho cromado da bica */}
          <linearGradient id={`${uid}_chromeGrad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="35%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Gradiente do corpo laranja da boia */}
          <linearGradient id={`${uid}_floatBodyGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="45%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          {/* Gradiente do flutuador azul da boia */}
          <linearGradient id={`${uid}_floatBlockGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="30%" stopColor="#2563eb" />
            <stop offset="85%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* Gradiente dos parafusos dos bornes */}
          <radialGradient id={`${uid}_screwGrad`} cx="40%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          {/* Clip path para a água respeitar a borda interna do reservatório */}
          <clipPath id={`${uid}_tankClip`}>
            <rect x="18" y="52" width="224" height="198" rx="10" />
          </clipPath>
        </defs>

        {/* -------------------------------------------------------------
            1. CORPO / CARCAÇA DO RESERVATÓRIO
            ------------------------------------------------------------- */}
        <rect
          x="4"
          y="4"
          width="252"
          height="272"
          rx="18"
          fill={`url(#${uid}_casingGrad)`}
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* Friso chanfrado frontal */}
        <rect
          x="7"
          y="7"
          width="246"
          height="266"
          rx="15"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />

        {/* -------------------------------------------------------------
            2. BORNEIRA SUPERIOR (11/COM, 14/NA, 12/NF)
            ------------------------------------------------------------- */}
        {/* Painel do bloco de bornes */}
        <rect
          x="18"
          y="10"
          width="156"
          height="34"
          rx="6"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Borne 1: COM (11) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'COM');
          }}
        >
          <circle
            cx="44"
            cy="24"
            r="12"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'COM' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vCOM ? getVoltageColor(vCOM) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="44" cy="24" r="7" fill={`url(#${uid}_screwGrad)`} stroke="#334155" strokeWidth="0.8" />
          <line x1="41" y1="24" x2="47" y2="24" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="44" y1="21" x2="44" y2="27" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
          {vCOM && <circle cx="44" cy="24" r="3" fill={getVoltageColor(vCOM)} />}
          <text x="44" y="41" fill="#94a3b8" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            11/COM
          </text>
        </g>

        {/* Borne 2: NA (14) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NA');
          }}
        >
          <circle
            cx="94"
            cy="24"
            r="12"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NA' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNA ? getVoltageColor(vNA) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="94" cy="24" r="7" fill={`url(#${uid}_screwGrad)`} stroke="#334155" strokeWidth="0.8" />
          <line x1="91" y1="24" x2="97" y2="24" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="94" y1="21" x2="94" y2="27" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
          {vNA && <circle cx="94" cy="24" r="3" fill={getVoltageColor(vNA)} />}
          <text x="94" y="41" fill={isHigh ? '#22c55e' : '#94a3b8'} fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            14/NA
          </text>
        </g>

        {/* Borne 3: NF (12) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NF');
          }}
        >
          <circle
            cx="144"
            cy="24"
            r="12"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NF' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNF ? getVoltageColor(vNF) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="144" cy="24" r="7" fill={`url(#${uid}_screwGrad)`} stroke="#334155" strokeWidth="0.8" />
          <line x1="141" y1="24" x2="147" y2="24" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="144" y1="21" x2="144" y2="27" stroke="#1e293b" strokeWidth="1.4" strokeLinecap="round" />
          {vNF && <circle cx="144" cy="24" r="3" fill={getVoltageColor(vNF)} />}
          <text x="144" y="41" fill={!isHigh ? '#38bdf8' : '#94a3b8'} fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            12/NF
          </text>
        </g>

        {/* -------------------------------------------------------------
            3. INTERIOR DO TANQUE (ÁGUA E PAREDE DE FUNDO)
            ------------------------------------------------------------- */}
        <rect
          x="18"
          y="52"
          width="224"
          height="198"
          rx="10"
          fill={`url(#${uid}_tankInnerGrad)`}
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Grupo com corte dentro do tanque */}
        <g clipPath={`url(#${uid}_tankClip)`}>
          {/* Linhas de escala de volume sutis de fundo */}
          {[90, 130, 170, 210].map((ly) => (
            <line
              key={ly}
              x1="38"
              y1={ly}
              x2="236"
              y2={ly}
              stroke="rgba(255, 255, 255, 0.035)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Volume de água fluido */}
          <path d={wavePath} fill={`url(#${uid}_waterGrad)`} />

          {/* Linha brilhante da superfície de água */}
          <path
            d={`
              M 18 ${waterY}
              Q ${18 + 56} ${waterY + Math.sin(waveOffset) * waveAmp}, ${18 + 112} ${waterY}
              T ${242} ${waterY}
            `}
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.8"
            opacity="0.85"
          />

          {/* Jato d'água caindo da torneira (quando bica aberta) */}
          {isTapOpen && (
            <g>
              {/* Feixe d'água principal com transparência e brilho */}
              <rect
                x="203"
                y="66"
                width="8"
                height={Math.max(0, waterY - 66)}
                fill="rgba(56, 189, 248, 0.45)"
              />
              <line
                x1="207"
                y1="66"
                x2="207"
                y2={waterY}
                stroke="#38bdf8"
                strokeWidth="5"
                strokeDasharray="8 5"
                strokeDashoffset={-splashTick * 3}
                strokeLinecap="round"
                opacity="0.9"
              />
              <line
                x1="207"
                y1="66"
                x2="207"
                y2={waterY}
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6 8"
                strokeDashoffset={-splashTick * 4}
                opacity="0.95"
              />

              {/* Ondas concêntricas de splash na superfície de impacto */}
              <ellipse
                cx="207"
                cy={waterY + 1}
                rx={10 + (splashTick % 20) * 0.6}
                ry={2 + (splashTick % 20) * 0.15}
                fill="none"
                stroke="#bae6fd"
                strokeWidth="1.2"
                opacity={Math.max(0, 1 - (splashTick % 20) / 20)}
              />
              <ellipse
                cx="207"
                cy={waterY + 1}
                rx={4 + ((splashTick + 10) % 20) * 0.5}
                ry={1 + ((splashTick + 10) % 20) * 0.12}
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="1"
                opacity={Math.max(0, 1 - ((splashTick + 10) % 20) / 20)}
              />
            </g>
          )}

          {/* -------------------------------------------------------------
              4. A BOIA DE NÍVEL (FLUTUANDO NA ÁGUA)
              ------------------------------------------------------------- */}
          {/* Cabo elétrico flexível que conecta a boia à parede do reservatório */}
          <path
            d={`
              M 22 170
              C 40 170, 48 ${waterY + 8}, ${floatPivotX} ${floatPivotY}
            `}
            fill="none"
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d={`
              M 22 170
              C 40 170, 48 ${waterY + 8}, ${floatPivotX} ${floatPivotY}
            `}
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Conjunto da boia girando em torno do pivot */}
          <g transform={`rotate(${floatAngle} ${floatPivotX} ${floatPivotY})`}>
            {/* Manopla / prensa-cabo corrugado da boia */}
            <g transform={`translate(${floatPivotX - 6}, ${floatPivotY - 5})`}>
              <rect x="0" y="0" width="22" height="10" rx="3" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
              <line x1="5" y1="1" x2="5" y2="9" stroke="#7c2d12" strokeWidth="1.2" />
              <line x1="10" y1="1" x2="10" y2="9" stroke="#7c2d12" strokeWidth="1.2" />
              <line x1="15" y1="1" x2="15" y2="9" stroke="#7c2d12" strokeWidth="1.2" />
            </g>

            {/* Bloco flutuador azul (contra-peso/boia externa) */}
            <rect
              x={floatPivotX + 16}
              y={floatPivotY - 17}
              width="68"
              height="34"
              rx="9"
              fill={`url(#${uid}_floatBlockGrad)`}
              stroke="#1e3a8a"
              strokeWidth="1.5"
            />
            {/* Chanfro de reflexo de luz superior no flutuador */}
            <rect
              x={floatPivotX + 22}
              y={floatPivotY - 14}
              width="56"
              height="5"
              rx="2.5"
              fill="#93c5fd"
              opacity="0.45"
            />

            {/* Corpo cilíndrico laranja da ampola/sensor */}
            <rect
              x={floatPivotX + 10}
              y={floatPivotY - 6}
              width="88"
              height="12"
              rx="6"
              fill={`url(#${uid}_floatBodyGrad)`}
              stroke="#7c2d12"
              strokeWidth="1"
            />
            {/* Destaque de brilho longitudinal no corpo laranja */}
            <line
              x1={floatPivotX + 16}
              y1={floatPivotY - 3}
              x2={floatPivotX + 90}
              y2={floatPivotY - 3}
              stroke="#fed7aa"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* LED / Indicador óptico de status dentro da boia */}
            <circle
              cx={floatPivotX + 76}
              cy={floatPivotY}
              r="3.2"
              fill={isHigh ? '#22c55e' : '#38bdf8'}
              stroke="#ffffff"
              strokeWidth="0.8"
            />
          </g>
        </g>

        {/* -------------------------------------------------------------
            5. GAUGE / TERMÔMETRO VERTICAL DE NÍVEL (À ESQUERDA)
            ------------------------------------------------------------- */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={handleBarClick}
          title="Clique para ajustar o nível manualmente"
        >
          {/* Tubo de vidro do termômetro */}
          <rect
            x="24"
            y="70"
            width="8"
            height="120"
            rx="4"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Coluna de líquido preenchida (0% embaixo, 100% no topo) */}
          <rect
            x="25.5"
            y={70 + 120 - (level / 100) * 120}
            width="5"
            height={(level / 100) * 120}
            rx="2.5"
            fill={isHigh ? '#22c55e' : '#ef4444'}
          />

          {/* Bulbo inferior do termômetro */}
          <circle
            cx="28"
            cy="194"
            r="6.5"
            fill={isHigh ? '#22c55e' : '#ef4444'}
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Texto "NÍVEL XX%" */}
          <text
            x="28"
            y="214"
            fill="#f8fafc"
            fontSize="10"
            fontWeight="800"
            fontFamily="monospace"
            letterSpacing="0.3"
          >
            NÍVEL {Math.round(level)}%
          </text>
        </g>

        {/* -------------------------------------------------------------
            6. A BICA INDUSTRIAL CROMADA DE ALTA QUALIDADE (TOP-RIGHT)
            ------------------------------------------------------------- */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={handleToggleTap}
          title={isTapOpen ? 'Bica ABERTA (Clique no registro para FECHAR)' : 'Bica FECHADA (Clique no registro para ABRIR)'}
        >
          {/* Flange / suporte metálico na parede */}
          <rect
            x="230"
            y="24"
            width="12"
            height="26"
            rx="3"
            fill="#475569"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <circle cx="236" cy="28" r="1.5" fill="#94a3b8" />
          <circle cx="236" cy="46" r="1.5" fill="#94a3b8" />

          {/* Tubo horizontal de entrada */}
          <path
            d="M 230 37 L 207 37"
            stroke={`url(#${uid}_chromeGrad)`}
            strokeWidth="12"
            strokeLinecap="square"
          />

          {/* Cotovelo / curva elegante da bica voltada para baixo */}
          <path
            d="M 213 37 Q 207 37 207 43 L 207 64"
            fill="none"
            stroke={`url(#${uid}_chromeGrad)`}
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Bico arejador cromado na ponta */}
          <rect
            x="201"
            y="64"
            width="12"
            height="6"
            rx="2"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Volante industrial do registro (Vermelho com núcleo cromado) */}
          <g
            transform={`translate(222, 24) rotate(${isTapOpen ? 90 : 0})`}
            style={{ transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            {/* Volante de 4 pontas / cruz clássico industrial */}
            <circle cx="0" cy="0" r="11" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="9" fill="#ef4444" />
            <line x1="-9" y1="0" x2="9" y2="0" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="0" y1="-9" x2="0" y2="9" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4.5" fill={`url(#${uid}_screwGrad)`} stroke="#450a0a" strokeWidth="1" />
          </g>

          {/* Tag de identificação "BICA / REGISTRO" sutil */}
          <rect
            x="180"
            y="14"
            width="48"
            height="14"
            rx="3"
            fill="rgba(15, 23, 42, 0.85)"
            stroke={isTapOpen ? '#22c55e' : '#64748b'}
            strokeWidth="0.8"
          />
          <text
            x="204"
            y="24"
            fill={isTapOpen ? '#4ade80' : '#cbd5e1'}
            fontSize="7.5"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {isTapOpen ? '● ABERTA' : '○ FECHADA'}
          </text>
        </g>

        {/* -------------------------------------------------------------
            7. STATUS DA BOIA & IDENTIFICAÇÃO TÉCNICA
            ------------------------------------------------------------- */}
        <g transform="translate(18, 255)">
          <text
            x="0"
            y="12"
            fill="#f8fafc"
            fontSize="10"
            fontWeight="800"
            letterSpacing="0.5"
          >
            {component.tag || 'B1'}
          </text>
          <text
            x="28"
            y="12"
            fill="#94a3b8"
            fontSize="8.5"
            fontWeight="600"
          >
            Boia de Nível
          </text>

          {/* Pill de contato ativo */}
          <rect
            x="142"
            y="0"
            width="82"
            height="16"
            rx="4"
            fill={isHigh ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)'}
            stroke={isHigh ? '#22c55e' : '#38bdf8'}
            strokeWidth="1"
          />
          <circle
            cx="152"
            cy="8"
            r="3"
            fill={isHigh ? '#22c55e' : '#38bdf8'}
          />
          <text
            x="184"
            y="11"
            fill={isHigh ? '#4ade80' : '#7dd3fc'}
            fontSize="7.5"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {isHigh ? 'NA (11-14) ON' : 'NF (11-12) ON'}
          </text>
        </g>
      </svg>
    </div>
  );
}
