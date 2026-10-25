import React, { useState, useEffect, useId } from 'react';

/**
 * FloatSwitchElement - Caixa D'Água Industrial com Boia de Nível Elétrica e Contrapeso.
 *
 * Fiel ao diagrama técnico de instalação predial/industrial:
 * - Caixa D'água azul em polietileno com formato trapezoidal, tampa e corte transparente.
 * - Tubulação de entrada marrom (padrão predial PVC soldável) com flange, joelho 90° e registro de esfera clicável.
 * - Tubulação do ladrão no canto superior esquerdo com flange de overflow.
 * - Borneira lateral com bornes 1 (COM), 2 (NA) e 3 (NF) para ligação elétrica.
 * - Cabo elétrico preto entrando na caixa com o CONTRAPESO AMARELO regulador de nível.
 * - Boia de nível (corpo azul com conector amarelo) que flutua e tomba conforme a água sobe:
 *   - Nível Baixo (< 50%): Boia pendurada para baixo, contato NF (1-3 / COM-NF) fechado.
 *   - Nível Alto (>= 50%): Boia sobe e tomba para cima na água, contato NA (1-2 / COM-NA) fechado.
 * - Totalmente silencioso (sem sons de disjuntor indesejados).
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
  const [level, setLevel] = useState(Number(state.level ?? 20));
  const [isTapOpen, setIsTapOpen] = useState(Boolean(state.isTapOpen));
  const [wavePhase, setWavePhase] = useState(0);

  const uid = useId().replace(/:/g, '_');
  const threshold = Number(state.threshold ?? 50);
  const isHigh = level >= threshold;

  // Sincroniza se o estado do componente mudar externamente
  useEffect(() => {
    if (state.level !== undefined && Math.abs(state.level - level) > 3) {
      setLevel(state.level);
    }
    if (state.isTapOpen !== undefined) {
      setIsTapOpen(Boolean(state.isTapOpen));
    }
  }, [state.level, state.isTapOpen]);

  // Loop suave de enchimento e esvaziamento da caixa d'água
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const tick = (time) => {
      const dt = Math.min(50, time - lastTime);
      lastTime = time;

      // Ondulação suave da água
      setWavePhase((prev) => (prev + dt * 0.003) % (Math.PI * 2));

      // Se registro aberto -> enche até 88%; se fechado -> esvazia até 15%
      const target = isTapOpen ? 88 : 15;
      const speed = isTapOpen ? 0.35 : 0.25; // % por tick

      setLevel((prev) => {
        let next = prev;
        if (Math.abs(prev - target) > 0.15) {
          if (prev < target) {
            next = Math.min(target, prev + speed * (dt / 16.6));
          } else {
            next = Math.max(target, prev - speed * (dt / 16.6));
          }

          // Se cruzou o ponto de acionamento da boia (50%), notifica a simulação
          const prevHigh = prev >= threshold;
          const nextHigh = next >= threshold;
          if (prevHigh !== nextHigh) {
            onUpdateComponentState?.(componentId, {
              level: Math.round(next),
              isTapOpen,
            });
          }
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isTapOpen, threshold, componentId, onUpdateComponentState]);

  // Atualização periódica de persistência
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.abs(level - (state.level ?? 20)) > 1) {
        onUpdateComponentState?.(componentId, {
          level: Math.round(level),
          isTapOpen,
        });
      }
    }, 400);
    return () => clearInterval(timer);
  }, [level, isTapOpen, componentId, state.level, onUpdateComponentState]);

  // Alterna o registro de entrada ao clicar na tubulação / registro
  const handleToggleTap = (e) => {
    e.stopPropagation();
    const newTap = !isTapOpen;
    setIsTapOpen(newTap);
    onUpdateComponentState?.(componentId, {
      isTapOpen: newTap,
      level: Math.round(level),
    });
  };

  // Cores de tensão nos bornes
  const getVolt = (termId) => terminalVoltages?.get?.(`${componentId}:${termId}`);
  const vCOM = getVolt('COM') || getVolt('1') || getVolt('11');
  const vNA = getVolt('NA') || getVolt('2') || getVolt('14');
  const vNF = getVolt('NF') || getVolt('3') || getVolt('12');

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

  // Altura da água na caixa
  // Altura útil interna da caixa: y de 60 (quase cheia) a 220 (quase vazia)
  const tankTopY = 60;
  const tankBottomY = 220;
  const waterY = tankBottomY - (level / 100) * (tankBottomY - tankTopY);

  // Posição e cinemática da boia com contrapeso
  // O contrapeso fica fixado no cabo em (152, 138)
  const weightX = 152;
  const weightY = 138;

  // Quando o nível sobe acima do contrapeso, a boia sobe e vira para cima
  let floatX = 158;
  let floatY = 192;
  let floatAngle = 20; // pendurada para baixo

  if (level < 35) {
    // Pendurada livre para baixo
    floatX = 158;
    floatY = Math.min(200, waterY + 6);
    floatAngle = 22;
  } else if (level < 50) {
    // Começando a tocar na água
    floatX = 162;
    floatY = waterY;
    floatAngle = 10;
  } else if (level < 70) {
    // Flutuando na água e comutando
    floatX = 166;
    floatY = waterY - 8;
    floatAngle = -28;
  } else {
    // Nível alto: completamente tombada para cima flutuando
    floatX = 168;
    floatY = waterY - 10;
    floatAngle = -52;
  }

  // Interpolação suave das laterais trapezoidais para a largura da água
  // y=28: xLeft=88, xRight=242 (largura 154)
  // y=230: xLeft=104, xRight=226 (largura 122)
  const t = (waterY - 28) / (230 - 28);
  const waterLeftX = 88 + (104 - 88) * t;
  const waterRightX = 242 - (242 - 226) * t;
  const waterWidth = waterRightX - waterLeftX;

  return (
    <div
      style={{
        position: 'relative',
        width: '320px',
        height: '250px',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 320 250"
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
          {/* Gradiente da carcaça azul da caixa d'água */}
          <linearGradient id={`${uid}_tankBlue`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="30%" stopColor="#0369a1" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          {/* Gradiente de água */}
          <linearGradient id={`${uid}_water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#0284c7" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.9" />
          </linearGradient>

          {/* Gradiente dos tubos de PVC marrom padrão brasileiro */}
          <linearGradient id={`${uid}_pvcBrown`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="35%" stopColor="#b45309" />
            <stop offset="70%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Gradiente dos parafusos */}
          <radialGradient id={`${uid}_screw`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="55%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          {/* Clip path com formato trapezoidal interno da caixa d'água */}
          <clipPath id={`${uid}_tankInteriorClip`}>
            <polygon points="90,32 240,32 225,228 105,228" />
          </clipPath>
        </defs>

        {/* -------------------------------------------------------------
            1. TUBO LADRÃO (SAÍDA DE SEGURANÇA NO TOPO ESQUERDO)
            ------------------------------------------------------------- */}
        <text
          x="10"
          y="32"
          fill="#94a3b8"
          fontSize="8"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          Ladrão (saída de água)
        </text>

        {/* Tubo horizontal de PVC marrom */}
        <rect x="12" y="38" width="76" height="10" rx="1.5" fill={`url(#${uid}_pvcBrown)`} />
        {/* Joelho 90° para baixo na ponta esquerda do ladrão */}
        <rect x="6" y="38" width="10" height="18" rx="2" fill={`url(#${uid}_pvcBrown)`} />
        {/* Flange / adaptador de caixa d'água com arruela na parede */}
        <rect x="80" y="34" width="8" height="18" rx="2" fill="#451a03" />
        <rect x="82" y="36" width="4" height="14" fill="#a16207" />

        {/* -------------------------------------------------------------
            2. BORNEIRA LATERAL DE CONEXÃO ELÉTRICA (BORNES 1, 2, 3)
            ------------------------------------------------------------- */}
        {/* Corpo isolante da borneira com rebaixos */}
        <rect
          x="28"
          y="68"
          width="36"
          height="74"
          rx="5"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* Borne 1: COM (Comum) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'COM');
          }}
          title="Borne 1 (Comum / 11)"
        >
          <circle
            cx="46"
            cy="80"
            r="9"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'COM' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vCOM ? getVoltageColor(vCOM) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="46" cy="80" r="5.5" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.7" />
          <line x1="43.5" y1="80" x2="48.5" y2="80" stroke="#1e293b" strokeWidth="1.2" />
          {vCOM && <circle cx="46" cy="80" r="2.5" fill={getVoltageColor(vCOM)} />}
          <text x="33" y="83" fill="#94a3b8" fontSize="7.5" fontWeight="800" textAnchor="end" fontFamily="monospace">
            1
          </text>
        </g>

        {/* Borne 2: NA (Normalmente Aberto - Liga no Nível Alto) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NA');
          }}
          title="Borne 2 (NA / 14 - Liga quando a caixa enche)"
        >
          <circle
            cx="46"
            cy="104"
            r="9"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NA' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNA ? getVoltageColor(vNA) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="46" cy="104" r="5.5" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.7" />
          <line x1="43.5" y1="104" x2="48.5" y2="104" stroke="#1e293b" strokeWidth="1.2" />
          {vNA && <circle cx="46" cy="104" r="2.5" fill={getVoltageColor(vNA)} />}
          <text x="33" y="107" fill={isHigh ? '#22c55e' : '#94a3b8'} fontSize="7.5" fontWeight="800" textAnchor="end" fontFamily="monospace">
            2
          </text>
        </g>

        {/* Borne 3: NF (Normalmente Fechado - Liga no Nível Baixo) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NF');
          }}
          title="Borne 3 (NF / 12 - Liga quando a caixa esvazia)"
        >
          <circle
            cx="46"
            cy="128"
            r="9"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NF' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNF ? getVoltageColor(vNF) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="46" cy="128" r="5.5" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.7" />
          <line x1="43.5" y1="128" x2="48.5" y2="128" stroke="#1e293b" strokeWidth="1.2" />
          {vNF && <circle cx="46" cy="128" r="2.5" fill={getVoltageColor(vNF)} />}
          <text x="33" y="131" fill={!isHigh ? '#38bdf8' : '#94a3b8'} fontSize="7.5" fontWeight="800" textAnchor="end" fontFamily="monospace">
            3
          </text>
        </g>

        {/* Rótulo de status da boia ao lado da borneira */}
        <text x="46" y="152" fill={isHigh ? '#4ade80' : '#7dd3fc'} fontSize="7.5" fontWeight="800" textAnchor="middle" fontFamily="monospace">
          {isHigh ? 'NA ON' : 'NF ON'}
        </text>

        {/* -------------------------------------------------------------
            3. A CAIXA D'ÁGUA AZUL (CORPO EM POLIETILENO COM CORTE)
            ------------------------------------------------------------- */}
        {/* Parede de fundo do tanque (interior escuro translúcido) */}
        <polygon
          points="88,28 242,28 226,230 104,230"
          fill="#081426"
          stroke="#0369a1"
          strokeWidth="1.5"
        />

        {/* Tampa da caixa d'água no topo */}
        <path
          d="M 80 26 L 165 14 L 250 26 L 246 32 L 84 32 Z"
          fill={`url(#${uid}_tankBlue)`}
          stroke="#0284c7"
          strokeWidth="1.5"
        />
        {/* Borda / aba saliente da tampa */}
        <rect x="80" y="26" width="170" height="5" rx="1.5" fill="#075985" />

        {/* Volume de água dentro do tanque com recorte trapezoidal */}
        <g clipPath={`url(#${uid}_tankInteriorClip)`}>
          {/* Massa de água azul */}
          <polygon
            points={`
              ${waterLeftX},${waterY}
              ${waterRightX},${waterY}
              226,230
              104,230
            `}
            fill={`url(#${uid}_water)`}
          />

          {/* Superfície da água com ondulação suave */}
          <path
            d={`
              M ${waterLeftX} ${waterY}
              Q ${waterLeftX + waterWidth * 0.5} ${waterY + Math.sin(wavePhase) * 2}, ${waterRightX} ${waterY}
            `}
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Jato d'água caindo da bica (quando registro aberto) */}
          {isTapOpen && (
            <g>
              <line
                x1="226"
                y1="88"
                x2="226"
                y2={Math.max(90, waterY)}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeDashoffset={-wavePhase * 10}
                strokeLinecap="round"
                opacity="0.9"
              />
              <line
                x1="226"
                y1="88"
                x2="226"
                y2={Math.max(90, waterY)}
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.75"
              />
              {/* Espirro / splash suave no ponto de impacto */}
              <ellipse
                cx="226"
                cy={waterY + 1}
                rx="7"
                ry="2"
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="1"
              />
            </g>
          )}

          {/* -------------------------------------------------------------
              4. A BOIA ELÉTRICA COM CABO E CONTRAPESO
              ------------------------------------------------------------- */}
          {/* Cabo elétrico preto da boia saindo da borneira e passando pelo contrapeso */}
          <path
            d={`
              M 64 104
              C 80 104, 110 65, 125 75
              C 140 85, ${weightX} ${weightY - 15}, ${weightX} ${weightY}
              C ${weightX} ${weightY + 15}, ${floatX} ${floatY - 15}, ${floatX} ${floatY}
            `}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* O CONTRAPESO AMARELO (REGULADOR DE NÍVEL NO CABO) */}
          <g transform={`translate(${weightX - 6}, ${weightY - 9})`}>
            <rect
              x="0"
              y="0"
              width="12"
              height="18"
              rx="3"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            <rect x="2" y="3" width="8" height="12" rx="1.5" fill="#facc15" />
            <line x1="6" y1="0" x2="6" y2="18" stroke="#a16207" strokeWidth="1" />
          </g>

          {/* A BOIA DE NÍVEL (CORPO AZUL COM COLAR AMARELO) */}
          <g transform={`translate(${floatX}, ${floatY}) rotate(${floatAngle})`}>
            {/* Colar / conector amarelo onde o cabo entra na boia */}
            <path
              d="M -4 0 L 4 0 L 6 10 L -6 10 Z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="0.8"
            />

            {/* Corpo principal da boia em gota / cápsula azul */}
            <rect
              x="-12"
              y="10"
              width="24"
              height="34"
              rx="10"
              fill="#1d4ed8"
              stroke="#1e3a8a"
              strokeWidth="1.2"
            />
            {/* Rebaixo / visor central azul escuro */}
            <rect
              x="-7"
              y="16"
              width="14"
              height="20"
              rx="5"
              fill="#172554"
              stroke="#2563eb"
              strokeWidth="0.8"
            />
            {/* Brilho de luz na superfície da boia */}
            <path
              d="M -7 14 Q 0 12 7 14"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        </g>

        {/* Moldura frontal chanfrada em azul da Caixa D'Água */}
        <polygon
          points="88,28 242,28 226,230 104,230"
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <polygon
          points="88,28 242,28 226,230 104,230"
          fill="none"
          stroke="#0369a1"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* -------------------------------------------------------------
            5. TUBULAÇÃO DE ENTRADA (A BICA) NA DIREITA COM REGISTRO
            ------------------------------------------------------------- */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={handleToggleTap}
          title={isTapOpen ? 'Clique para FECHAR a entrada de água' : 'Clique para ABRIR a entrada de água'}
        >
          {/* Tubo vertical vindo da alimentação */}
          <rect x="302" y="70" width="12" height="150" rx="1.5" fill={`url(#${uid}_pvcBrown)`} />
          {/* Joelho 90° superior direito */}
          <rect x="292" y="66" width="22" height="18" rx="3" fill={`url(#${uid}_pvcBrown)`} />

          {/* Tubo horizontal de entrada de água entrando na caixa */}
          <rect x="238" y="70" width="56" height="10" rx="1" fill={`url(#${uid}_pvcBrown)`} />

          {/* Flange com adaptador na parede da caixa */}
          <rect x="236" y="66" width="8" height="18" rx="2" fill="#451a03" />
          <rect x="238" y="68" width="4" height="14" fill="#a16207" />

          {/* Joelho 90° voltado para baixo dentro da caixa d'água (A BICA) */}
          <path
            d="M 234 70 L 222 70 Q 220 70 220 76 L 220 88"
            fill="none"
            stroke={`url(#${uid}_pvcBrown)`}
            strokeWidth="10"
            strokeLinecap="square"
          />
          {/* Bico na ponta do joelho */}
          <rect x="216" y="86" width="8" height="4" rx="1" fill="#451a03" />

          {/* Registro de esfera (Torneira / Válvula) na tubulação */}
          <g transform="translate(274, 75)">
            {/* Corpo do registro */}
            <circle cx="0" cy="0" r="8" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Alavanca do registro (rotaciona 90° ao abrir/fechar) */}
            <g transform={`rotate(${isTapOpen ? 0 : -90})`} style={{ transition: 'transform 0.25s ease-out' }}>
              <rect x="-3" y="-18" width="6" height="20" rx="2" fill={isTapOpen ? '#22c55e' : '#dc2626'} stroke="#1e293b" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="3" fill="#f8fafc" />
            </g>
          </g>
        </g>

        {/* -------------------------------------------------------------
            6. LEITURA DE NÍVEL DISCRETA NA BASE
            ------------------------------------------------------------- */}
        <g transform="translate(165, 242)">
          <text
            x="0"
            y="0"
            fill="#94a3b8"
            fontSize="9.5"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            letterSpacing="0.3"
          >
            NÍVEL: {Math.round(level)}%
          </text>
        </g>
      </svg>
    </div>
  );
}
