import React, { useState, useEffect, useId } from 'react';

/**
 * FloatSwitchElement - Caixa D'Água com Boia de Nível e Contrapeso
 *
 * Baseado 100% no diagrama e na cinemática natural de flutuação:
 * - Caixa d'água trapezoidal azul com tampa e corte frontal translúcido.
 * - Bornes 1 (COM), 2 (NA) e 3 (NF) montados no topo esquerdo (circulado em vermelho na referência).
 * - Cabo saindo da borneira no topo esquerdo e entrando na caixa d'água.
 * - Contrapeso amarelo regulador suspenso no cabo.
 * - Cinemática contínua e natural da boia (sem saltos de ângulo artificiais):
 *   - Nível baixo: boia pende para baixo puxada pela gravidade.
 *   - Nível subindo: a água alcança a boia, que sobe flutuando suavemente em arco ao redor do contrapeso.
 *   - Nível alto: a boia tomba para cima na superfície pela força de empuxo.
 * - Tubulação de entrada marrom com joelho e registro clicável apenas em simulação.
 * - Saída inferior na direita.
 * - Totalmente silencioso e limpo.
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

  // Sincroniza estado externo
  useEffect(() => {
    if (state.level !== undefined && Math.abs(state.level - level) > 3) {
      setLevel(state.level);
    }
    if (state.isTapOpen !== undefined) {
      setIsTapOpen(Boolean(state.isTapOpen));
    }
  }, [state.level, state.isTapOpen]);

  // Desativa e fecha registro quando a simulação parar
  useEffect(() => {
    if (!isSimulationMode) {
      if (isTapOpen) {
        setIsTapOpen(false);
      }
    }
  }, [isSimulationMode]);

  // Loop contínuo de física de fluidos e cinemática (apenas durante simulação)
  useEffect(() => {
    if (!isSimulationMode) return;

    let animId;
    let lastTime = performance.now();

    const tick = (time) => {
      const dt = Math.min(50, time - lastTime);
      lastTime = time;

      // Ondulação calma e suave
      setWavePhase((prev) => (prev + dt * 0.0028) % (Math.PI * 2));

      // Enchimento e esvaziamento contínuo
      const target = isTapOpen ? 88 : 16;
      const speed = isTapOpen ? 0.32 : 0.22;

      setLevel((prev) => {
        let next = prev;
        if (Math.abs(prev - target) > 0.15) {
          if (prev < target) {
            next = Math.min(target, prev + speed * (dt / 16.6));
          } else {
            next = Math.max(target, prev - speed * (dt / 16.6));
          }

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
  }, [isSimulationMode, isTapOpen, threshold, componentId, onUpdateComponentState]);

  // Persistência periódica de estado
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

  // Alterna registro ao clicar na tubulação (apenas em simulação)
  const handleToggleTap = (e) => {
    e.stopPropagation();
    if (!isSimulationMode) return;
    const newTap = !isTapOpen;
    setIsTapOpen(newTap);
    onUpdateComponentState?.(componentId, {
      isTapOpen: newTap,
      level: Math.round(level),
    });
  };

  // Tensões nos bornes
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
  // Altura útil: de y=64 (quase cheia / 100%) a y=216 (quase vazia / 0%)
  const minWaterY = 64;
  const maxWaterY = 216;
  const waterY = maxWaterY - (level / 100) * (maxWaterY - minWaterY);

  // Geometria trapezoidal do interior da caixa para a largura da água
  // y=26: xL=78, xR=252 (largura 174)
  // y=228: xL=96, xR=234 (largura 138)
  const normY = Math.max(0, Math.min(1, (waterY - 26) / (228 - 26)));
  const waterLeftX = 78 + (96 - 78) * normY;
  const waterRightX = 252 - (252 - 234) * normY;
  const waterWidth = waterRightX - waterLeftX;

  // -----------------------------------------------------------------
  // CINEMÁTICA REALISTA E NATURAL DA BOIA E DO CONTRAPESO
  // - Caixa vazia/nível baixo: a boia pende verticalmente para baixo no ar (ângulo ~0°).
  // - Água subindo: a água toca a boia, que começa a flutuar na superfície e deitar suavemente (0° -> 80°).
  // - Nível alto (acima do contrapeso): a boia flutua empinada para cima na superfície d'água (80° -> 135°),
  //   com o cabo esticado para baixo em direção ao contrapeso.
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // CINEMÁTICA PURA, UNIFICADA E CONTÍNUA DA BOIA E DO CONTRAPESO
  // - Elimina qualquer descontinuidade ('salto da boia') através de uma
  //   formulação contínua única em todo o curso (0% a 100%).
  // - O contrapeso rotaciona suavemente acompanhando a linha de tração do cabo.
  // - O cabo sai da extremidade do contrapeso diretamente alinhado à boia,
  //   eliminando dobras ou 'anzóis' abruptos.
  // -----------------------------------------------------------------
  const anchorX = 82;
  const anchorY = 32;
  const weightX = 126;
  const weightY = 126;
  const tetherLen = 50; // Comprimento útil do cabo entre contrapeso e boia

  // Posição de repouso pendurada no ar (quando o nível d'água está baixo)
  const maxHangY = weightY + tetherLen; // ~176 (caixa vazia)
  const minFloatY = weightY - tetherLen * 0.82; // ~85 (caixa cheia)

  // Altura contínua da boia: flutua na água (waterY + 4) respeitando os limites do cabo
  const floatY = Math.max(minFloatY, Math.min(maxHangY, waterY + 4));

  // Deslocamento vertical relativo ao ponto de ancoragem do contrapeso
  const dy = floatY - weightY;

  // Deslocamento horizontal: arco circular puro contínuo ao redor do contrapeso
  const dxArc = Math.sqrt(Math.max(0, tetherLen * tetherLen - dy * dy));
  const floatX = weightX + 4 + dxArc * 0.94;

  // Vetor contínuo da linha de tração do contrapeso até a boia
  const vecX = floatX - weightX;
  const vecY = floatY - weightY;
  const tetherAngle = Math.atan2(vecY, vecX) * (180 / Math.PI);

  // Ângulo contínuo da boia: alinhada ao vetor de tração e empuxo (sem saltos)
  const floatAngle = tetherAngle - 90;

  // Rotação suave do contrapeso amarelo alinhado à tensão do cabo
  const weightRot = (tetherAngle - 90) * 0.82;
  const weightRotRad = (weightRot * Math.PI) / 180;

  // Furos de entrada (topo) e saída (base) do contrapeso acompanhando sua rotação
  const weightEnterX = weightX + 9 * Math.sin(weightRotRad);
  const weightEnterY = weightY - 9 * Math.cos(weightRotRad);
  const weightExitX = weightX - 9 * Math.sin(weightRotRad);
  const weightExitY = weightY + 9 * Math.cos(weightRotRad);

  // Posição exata do conector/colar amarelo no topo da boia (0, -12)
  const floatRad = (floatAngle * Math.PI) / 180;
  const collarX = floatX + 12 * Math.sin(floatRad);
  const collarY = floatY - 12 * Math.cos(floatRad);

  // Curvatura suave e natural para o cabo entre o contrapeso e o colar
  const segDx = collarX - weightExitX;
  const segDy = collarY - weightExitY;
  const ctrl1X = weightExitX + segDx * 0.35;
  const ctrl1Y = weightExitY + segDy * 0.35;
  const ctrl2X = weightExitX + segDx * 0.7;
  const ctrl2Y = weightExitY + segDy * 0.7;

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
          {/* Carcaça azul da caixa d'água */}
          <linearGradient id={`${uid}_tankBlue`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="25%" stopColor="#0369a1" />
            <stop offset="75%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          {/* Água interna */}
          <linearGradient id={`${uid}_water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.82" />
            <stop offset="20%" stopColor="#0284c7" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.92" />
          </linearGradient>

          {/* Tubulação PVC marrom */}
          <linearGradient id={`${uid}_pvc`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="35%" stopColor="#b45309" />
            <stop offset="70%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Parafusos metálicos dos bornes */}
          <radialGradient id={`${uid}_screw`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="55%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          {/* Recorte trapezoidal interno da caixa d'água */}
          <clipPath id={`${uid}_tankClip`}>
            <polygon points="78,28 252,28 234,228 96,228" />
          </clipPath>
        </defs>

        {/* -------------------------------------------------------------
            1. BORNEIRA NO TOPO ESQUERDO (CIRCULADO EM VERMELHO NA REFERÊNCIA)
            ------------------------------------------------------------- */}
        {/* Bloco de bornes montado diretamente na borda superior esquerda */}
        <rect
          x="22"
          y="24"
          width="34"
          height="62"
          rx="4"
          fill="#0f172a"
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Borne 1: COM (Comum) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'COM');
          }}
          title="Borne 1 (Comum)"
        >
          <circle
            cx="38"
            cy="36"
            r="8.5"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'COM' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vCOM ? getVoltageColor(vCOM) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="38" cy="36" r="5" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.7" />
          <line x1="35.5" y1="36" x2="40.5" y2="36" stroke="#1e293b" strokeWidth="1.2" />
          {vCOM && <circle cx="38" cy="36" r="2.4" fill={getVoltageColor(vCOM)} />}
          <text x="27" y="39" fill="#94a3b8" fontSize="7.5" fontWeight="800" textAnchor="end" fontFamily="monospace">
            1
          </text>
        </g>

        {/* Borne 2: NA (Normalmente Aberto - Nível Alto) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NA');
          }}
          title="Borne 2 (NA - Nível Alto)"
        >
          <circle
            cx="38"
            cy="56"
            r="8.5"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NA' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNA ? getVoltageColor(vNA) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="38" cy="56" r="5" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.7" />
          <line x1="35.5" y1="56" x2="40.5" y2="56" stroke="#1e293b" strokeWidth="1.2" />
          {vNA && <circle cx="38" cy="56" r="2.4" fill={getVoltageColor(vNA)} />}
          <text x="27" y="59" fill={isHigh ? '#22c55e' : '#94a3b8'} fontSize="7.5" fontWeight="800" textAnchor="end" fontFamily="monospace">
            2
          </text>
        </g>

        {/* Borne 3: NF (Normalmente Fechado - Nível Baixo) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NF');
          }}
          title="Borne 3 (NF - Nível Baixo)"
        >
          <circle
            cx="38"
            cy="76"
            r="8.5"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NF' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNF ? getVoltageColor(vNF) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="38" cy="76" r="5" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.7" />
          <line x1="35.5" y1="76" x2="40.5" y2="76" stroke="#1e293b" strokeWidth="1.2" />
          {vNF && <circle cx="38" cy="76" r="2.4" fill={getVoltageColor(vNF)} />}
          <text x="27" y="79" fill={!isHigh ? '#38bdf8' : '#94a3b8'} fontSize="7.5" fontWeight="800" textAnchor="end" fontFamily="monospace">
            3
          </text>
        </g>

        {/* -------------------------------------------------------------
            2. TUBULAÇÃO DE ENTRADA (A BICA) NA ESQUERDA ABAIXO DOS BORNES
            ------------------------------------------------------------- */}
        <g
          style={{ cursor: isSimulationMode ? 'pointer' : 'default', opacity: isSimulationMode ? 1 : 0.9 }}
          onClick={handleToggleTap}
          title={
            !isSimulationMode
              ? 'Inicie a simulação (▶) para operar o registro'
              : isTapOpen
              ? 'Clique para FECHAR a entrada de água'
              : 'Clique para ABRIR a entrada de água'
          }
        >
          {/* Tubo vertical vindo de baixo na esquerda */}
          <rect x="18" y="104" width="10" height="90" rx="1.5" fill={`url(#${uid}_pvc)`} />
          {/* Joelho 90° inferior esquerdo */}
          <rect x="18" y="184" width="22" height="12" rx="2" fill={`url(#${uid}_pvc)`} />

          {/* Joelho 90° superior esquerdo */}
          <rect x="18" y="96" width="18" height="18" rx="2" fill={`url(#${uid}_pvc)`} />

          {/* Tubo horizontal de entrada de água passando para a caixa */}
          <rect x="28" y="100" width="56" height="10" rx="1.5" fill={`url(#${uid}_pvc)`} />

          {/* Flange / adaptador na parede da caixa */}
          <rect x="76" y="96" width="6" height="18" rx="1.5" fill="#451a03" />

          {/* Joelho 90° apontando para baixo dentro da caixa (A BICA) */}
          <path
            d="M 82 100 L 98 100 Q 100 100 100 106 L 100 114"
            fill="none"
            stroke={`url(#${uid}_pvc)`}
            strokeWidth="9"
            strokeLinecap="square"
          />
          {/* Bico de saída */}
          <rect x="96" y="112" width="8" height="4" rx="1" fill="#451a03" />

          {/* Registro de esfera com alavanca (clicável em simulação) */}
          <g transform="translate(54, 105)">
            <circle cx="0" cy="0" r="7" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            <g transform={`rotate(${isTapOpen ? 0 : -90})`} style={{ transition: 'transform 0.25s ease-out' }}>
              <rect x="-2.5" y="-16" width="5" height="18" rx="2" fill={isTapOpen ? '#22c55e' : '#dc2626'} stroke="#0f172a" strokeWidth="0.7" />
              <circle cx="0" cy="0" r="2.5" fill="#f8fafc" />
            </g>
          </g>
        </g>

        {/* Tubulação de saída de consumo no canto inferior direito */}
        <g>
          <rect x="230" y="196" width="76" height="10" rx="1.5" fill={`url(#${uid}_pvc)`} />
          <rect x="228" y="192" width="6" height="18" rx="1.5" fill="#451a03" />
        </g>

        {/* -------------------------------------------------------------
            3. A CAIXA D'ÁGUA AZUL EM POLIETILENO COM CORTE TRANSLÚCIDO
            ------------------------------------------------------------- */}
        {/* Fundo escuro do interior */}
        <polygon
          points="78,28 252,28 234,228 96,228"
          fill="#081426"
          stroke="#0369a1"
          strokeWidth="1.5"
        />

        {/* Tampa da caixa d'água */}
        <path
          d="M 70 26 L 165 12 L 260 26 L 254 32 L 76 32 Z"
          fill={`url(#${uid}_tankBlue)`}
          stroke="#0284c7"
          strokeWidth="1.5"
        />
        <rect x="70" y="26" width="190" height="5" rx="1.5" fill="#075985" />

        {/* Grupo com a água e a boia dentro da caixa */}
        <g clipPath={`url(#${uid}_tankClip)`}>
          {/* Massa de água azul */}
          <polygon
            points={`
              ${waterLeftX},${waterY}
              ${waterRightX},${waterY}
              234,228
              96,228
            `}
            fill={`url(#${uid}_water)`}
          />

          {/* Linha da superfície com ondulação suave */}
          <path
            d={`
              M ${waterLeftX} ${waterY}
              Q ${waterLeftX + waterWidth * 0.5} ${waterY + Math.sin(wavePhase) * 2}, ${waterRightX} ${waterY}
            `}
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.6"
            opacity="0.85"
          />

          {/* Jato d'água da bica (apenas quando registro aberto em simulação) */}
          {isSimulationMode && isTapOpen && (
            <g>
              <line
                x1="100"
                y1="114"
                x2="100"
                y2={Math.max(116, waterY)}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeDashoffset={-wavePhase * 10}
                strokeLinecap="round"
                opacity="0.9"
              />
              <line
                x1="100"
                y1="114"
                x2="100"
                y2={Math.max(116, waterY)}
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <ellipse
                cx="100"
                cy={waterY + 1}
                rx="6"
                ry="2"
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="1"
              />
            </g>
          )}

          {/* -------------------------------------------------------------
              4. O CABO, CONTRAPESO AMARELO E A BOIA DE NÍVEL
              ------------------------------------------------------------- */}
          {/* Segmento 1 do cabo: da entrada no topo esquerdo (anchor) até o contrapeso */}
          <path
            d={`
              M 56 46
              C ${anchorX} 46, ${anchorX + 8} 60, ${anchorX + 16} 80
              C ${anchorX + 24} 95, ${weightEnterX - 6} ${weightEnterY - 14}, ${weightEnterX} ${weightEnterY}
            `}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Segmento 2 do cabo: do contrapeso até o colar conector da boia */}
          <path
            d={`
              M ${weightExitX} ${weightExitY}
              C ${ctrl1X} ${ctrl1Y},
                ${ctrl2X} ${ctrl2Y},
                ${collarX} ${collarY}
            `}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* O CONTRAPESO AMARELO REGULADOR NO CABO (ROTACIONA ALINHADO À LINHA DE TRAÇÃO) */}
          <g transform={`translate(${weightX}, ${weightY}) rotate(${weightRot})`}>
            <rect
              x="-6"
              y="-9"
              width="12"
              height="18"
              rx="3"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            <rect x="-4" y="-6" width="8" height="12" rx="1.5" fill="#facc15" />
            <line x1="0" y1="-9" x2="0" y2="9" stroke="#a16207" strokeWidth="1" />
          </g>

          {/* A BOIA DE NÍVEL COM CINEMÁTICA CONTÍNUA E NATURAL */}
          <g transform={`translate(${floatX}, ${floatY}) rotate(${floatAngle})`}>
            {/* Conector amarelo da ponta onde o cabo entra */}
            <path
              d="M -4 -12 L 4 -12 L 6 0 L -6 0 Z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="0.8"
            />

            {/* Corpo azul ovalado / gota da boia */}
            <rect
              x="-12"
              y="0"
              width="24"
              height="36"
              rx="10"
              fill="#1d4ed8"
              stroke="#1e3a8a"
              strokeWidth="1.2"
            />
            {/* Visor central azul marinho */}
            <rect
              x="-7"
              y="6"
              width="14"
              height="22"
              rx="5"
              fill="#172554"
              stroke="#2563eb"
              strokeWidth="0.8"
            />
            {/* Brilho de reflexo luminoso */}
            <path
              d="M -6 4 Q 0 2 6 4"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        </g>

        {/* Moldura externa azul da Caixa D'Água */}
        <polygon
          points="78,28 252,28 234,228 96,228"
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <polygon
          points="78,28 252,28 234,228 96,228"
          fill="none"
          stroke="#0369a1"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Leitura discreta de nível na base */}
        <text
          x="165"
          y="242"
          fill="#94a3b8"
          fontSize="9"
          fontWeight="800"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="0.3"
        >
          NÍVEL: {Math.round(level)}%
        </text>
      </svg>
    </div>
  );
}
