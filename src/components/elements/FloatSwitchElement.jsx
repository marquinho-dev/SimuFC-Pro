import React, { useState, useEffect, useRef, useId } from 'react';
import { sounds } from '../../services/soundEffects';

/**
 * FloatSwitchElement - Boia de Nível de Reservatório Industrial
 *
 * Design limpo e fiel à imagem de referência:
 * - Corpo escuro com cantos arredondados, sem poluição visual.
 * - Barra indicadora vertical de nível à esquerda com rótulo "NÍVEL XX%".
 * - Bica metálica industrial no nicho superior direito com registro circular vermelho.
 * - Ao abrir o registro: a água cai em gotas alongadas/jato contínuo e o nível sobe suavemente.
 * - Ao fechar o registro: o fluxo cessa e o nível esvazia/desce suavemente.
 * - Boia com colar flutuador azul e corpo cilíndrico laranja com bota corrugada à esquerda,
 *   flutuando naturalmente sobre as ondas da água:
 *   - Nível Alto (>= 50%): A boia inclina para cima e fecha o contato NA (11-14).
 *   - Nível Baixo (< 50%): A boia inclina para baixo e fecha o contato NF (11-12).
 * - Três bornes industriais discretos no topo: 11 (COM), 14 (NA) e 12 (NF).
 * - Sem badges ou textos poluídos na base.
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
  const [level, setLevel] = useState(Number(state.level ?? 22));
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

  // Loop suave de física da água (enchimento, esvaziamento e ondas suaves)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const tick = (time) => {
      const dt = Math.min(50, time - lastTime);
      lastTime = time;

      // Ondulação suave da água (ritmo calmo e natural)
      setWavePhase((prev) => (prev + dt * 0.0025) % (Math.PI * 2));

      // Se torneira aberta -> enche até 90%; se fechada -> esvazia até 18%
      const target = isTapOpen ? 90 : 18;
      const speed = isTapOpen ? 0.32 : 0.24; // % por tick

      setLevel((prev) => {
        let next = prev;
        if (Math.abs(prev - target) > 0.15) {
          if (prev < target) {
            next = Math.min(target, prev + speed * (dt / 16.6));
          } else {
            next = Math.max(target, prev - speed * (dt / 16.6));
          }

          // Se cruzou o limite de comutação da boia (50%), comuta o contato na simulação
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

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isTapOpen, threshold, componentId, onUpdateComponentState]);

  // Atualiza periodicamente o nível persistido no estado global
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

  // Abrir ou fechar o registro da bica ao clicar nela
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

  // Ajuste manual ao clicar na barra de nível
  const handleGaugeClick = (e) => {
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

  // Altura da água dentro do tanque
  // Tanque útil: y de 95 (alto) a 200 (baixo)
  const minWaterY = 95;  // 100% cheio
  const maxWaterY = 200; // 0% vazio
  const waterY = maxWaterY - (level / 100) * (maxWaterY - minWaterY);

  // Posição vertical e inclinação suave da Boia
  // A boia repousa diretamente sobre a superfície da água
  const floatY = waterY;
  const floatAngle = isHigh ? -8 : 12; // inclinação suave e realista

  return (
    <div
      style={{
        position: 'relative',
        width: '260px',
        height: '240px',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 260 240"
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
          {/* Fundo do gabinete escuro */}
          <linearGradient id={`${uid}_cardGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#21262d" />
            <stop offset="60%" stopColor="#1a1e26" />
            <stop offset="100%" stopColor="#14181f" />
          </linearGradient>

          {/* Gradiente da água */}
          <linearGradient id={`${uid}_waterGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.75" />
            <stop offset="40%" stopColor="#1d4ed8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0f2b5c" stopOpacity="0.95" />
          </linearGradient>

          {/* Gradiente do corpo metálico cromado da bica */}
          <linearGradient id={`${uid}_chromeGrad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="75%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Gradiente da boia azul */}
          <linearGradient id={`${uid}_floatBlue`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="25%" stopColor="#2563eb" />
            <stop offset="85%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* Gradiente do corpo laranja da boia */}
          <linearGradient id={`${uid}_floatOrange`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Parafusos metálicos dos bornes */}
          <radialGradient id={`${uid}_screw`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="55%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>

          {/* Clip path para que a água fique dentro do reservatório */}
          <clipPath id={`${uid}_reservoirClip`}>
            <rect x="0" y="34" width="260" height="206" rx="20" />
          </clipPath>
        </defs>

        {/* -------------------------------------------------------------
            1. CORPO PRINCIPAL DO RESERVATÓRIO
            ------------------------------------------------------------- */}
        <rect
          x="1"
          y="1"
          width="258"
          height="238"
          rx="24"
          fill={`url(#${uid}_cardGrad)`}
          stroke="#334155"
          strokeWidth="1.2"
        />

        {/* -------------------------------------------------------------
            2. BORNEIRA SUPERIOR DISCRETA (11, 14, 12)
            ------------------------------------------------------------- */}
        {/* Identificação do componente à esquerda */}
        <text
          x="18"
          y="22"
          fill="#f8fafc"
          fontSize="11"
          fontWeight="800"
          letterSpacing="0.5"
        >
          {component.tag || 'B1'}
        </text>

        {/* Borne COM (11) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'COM');
          }}
          title="Terminal 11 (Comum)"
        >
          <circle
            cx="54"
            cy="18"
            r="10"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'COM' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vCOM ? getVoltageColor(vCOM) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="54" cy="18" r="6" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.8" />
          <line x1="51" y1="18" x2="57" y2="18" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="54" y1="15" x2="54" y2="21" stroke="#1e293b" strokeWidth="1.2" />
          {vCOM && <circle cx="54" cy="18" r="2.8" fill={getVoltageColor(vCOM)} />}
          <text x="54" y="32" fill="#94a3b8" fontSize="7.5" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            11
          </text>
        </g>

        {/* Borne NA (14 - Fecha em nível alto) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NA');
          }}
          title="Terminal 14 (Normalmente Aberto - Liga no Nível Alto)"
        >
          <circle
            cx="98"
            cy="18"
            r="10"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NA' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNA ? getVoltageColor(vNA) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="98" cy="18" r="6" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.8" />
          <line x1="95" y1="18" x2="101" y2="18" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="98" y1="15" x2="98" y2="21" stroke="#1e293b" strokeWidth="1.2" />
          {vNA && <circle cx="98" cy="18" r="2.8" fill={getVoltageColor(vNA)} />}
          <text x="98" y="32" fill={isHigh ? '#22c55e' : '#94a3b8'} fontSize="7.5" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            14
          </text>
        </g>

        {/* Borne NF (12 - Fecha em nível baixo) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onTerminalClick?.(componentId, 'NF');
          }}
          title="Terminal 12 (Normalmente Fechado - Liga no Nível Baixo)"
        >
          <circle
            cx="142"
            cy="18"
            r="10"
            fill={activeTerminal?.componentId === componentId && activeTerminal?.terminalId === 'NF' ? '#00e676' : 'rgba(255, 255, 255, 0.04)'}
            stroke={vNF ? getVoltageColor(vNF) : '#475569'}
            strokeWidth="1.2"
          />
          <circle cx="142" cy="18" r="6" fill={`url(#${uid}_screw)`} stroke="#334155" strokeWidth="0.8" />
          <line x1="139" y1="18" x2="145" y2="18" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="142" y1="15" x2="142" y2="21" stroke="#1e293b" strokeWidth="1.2" />
          {vNF && <circle cx="142" cy="18" r="2.8" fill={getVoltageColor(vNF)} />}
          <text x="142" y="32" fill={!isHigh ? '#38bdf8' : '#94a3b8'} fontSize="7.5" fontWeight="800" textAnchor="middle" fontFamily="monospace">
            12
          </text>
        </g>

        {/* -------------------------------------------------------------
            3. ÁGUA E ONDAS DENTRO DO RESERVATÓRIO
            ------------------------------------------------------------- */}
        <g clipPath={`url(#${uid}_reservoirClip)`}>
          {/* Onda do fundo (camada escura / profundidade) */}
          <path
            d={`
              M 0 ${waterY + 4}
              Q 70 ${waterY + 4 + Math.sin(wavePhase + 1.2) * 2.2}, 140 ${waterY + 4}
              T 260 ${waterY + 4}
              L 260 240
              L 0 240
              Z
            `}
            fill="#122538"
            opacity="0.85"
          />

          {/* Onda frontal (água principal azul) */}
          <path
            d={`
              M 0 ${waterY}
              Q 65 ${waterY + Math.sin(wavePhase) * 2}, 130 ${waterY}
              T 260 ${waterY}
              L 260 240
              L 0 240
              Z
            `}
            fill={`url(#${uid}_waterGrad)`}
          />

          {/* Linha brilhante translúcida na superfície da água */}
          <path
            d={`
              M 0 ${waterY}
              Q 65 ${waterY + Math.sin(wavePhase) * 2}, 130 ${waterY}
              T 260 ${waterY}
            `}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1.5"
            opacity="0.65"
          />

          {/* Jato d'água caindo da bica (em gotas verticais como na imagem) */}
          {isTapOpen && (
            <g>
              {/* Coluna de gotas d'água alongadas */}
              {Array.from({ length: 9 }).map((_, i) => {
                const dropY = 88 + i * 14;
                if (dropY >= waterY - 4) return null;
                return (
                  <rect
                    key={i}
                    x="184"
                    y={dropY}
                    width="4.5"
                    height="9"
                    rx="2.2"
                    fill="#38bdf8"
                    opacity="0.85"
                  />
                );
              })}

              {/* Ondinha sutil de impacto na superfície */}
              <ellipse
                cx="186"
                cy={waterY + 1}
                rx="8"
                ry="2"
                fill="none"
                stroke="#bae6fd"
                strokeWidth="1.2"
                opacity="0.8"
              />
            </g>
          )}

          {/* -------------------------------------------------------------
              4. A BOIA DE NÍVEL (FLUTUA CENTRALIZADA SOBRE A ÁGUA)
              ------------------------------------------------------------- */}
          <g transform={`translate(120, ${floatY}) rotate(${floatAngle}) translate(-50, -18)`}>
            {/* Bloco flutuador azul (colar de sustentação) */}
            <rect
              x="22"
              y="0"
              width="62"
              height="36"
              rx="8"
              fill={`url(#${uid}_floatBlue)`}
              stroke="#1e3a8a"
              strokeWidth="1.2"
            />
            {/* Rebaixo / entalhe central do bloco azul */}
            <rect
              x="32"
              y="4"
              width="42"
              height="6"
              rx="3"
              fill="#60a5fa"
              opacity="0.45"
            />

            {/* Corpo cilíndrico laranja que atravessa o flutuador */}
            <rect
              x="0"
              y="10"
              width="96"
              height="16"
              rx="8"
              fill={`url(#${uid}_floatOrange)`}
              stroke="#9a3412"
              strokeWidth="0.8"
            />
            {/* Linha de reflexo no corpo laranja */}
            <line
              x1="6"
              y1="14"
              x2="90"
              y2="14"
              stroke="#ffedd5"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Bota corrugada de borracha na extremidade esquerda */}
            <g>
              <line x1="5" y1="11" x2="5" y2="25" stroke="#7c2d12" strokeWidth="1.8" />
              <line x1="10" y1="11" x2="10" y2="25" stroke="#7c2d12" strokeWidth="1.8" />
              <line x1="15" y1="11" x2="15" y2="25" stroke="#7c2d12" strokeWidth="1.8" />
            </g>
          </g>
        </g>

        {/* -------------------------------------------------------------
            5. GAUGE VERTICAL DE NÍVEL À ESQUERDA (ESTILO TERMÔMETRO)
            ------------------------------------------------------------- */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={handleGaugeClick}
          title="Clique para ajustar o nível manualmente"
        >
          {/* Tubo de vidro fino */}
          <rect
            x="24"
            y="65"
            width="6"
            height="85"
            rx="3"
            fill="#121721"
            stroke="#475569"
            strokeWidth="0.8"
          />

          {/* Coluna de líquido vermelho subindo do fundo */}
          <rect
            x="24.5"
            y={65 + 85 - (level / 100) * 85}
            width="5"
            height={(level / 100) * 85}
            rx="2.5"
            fill="#ef4444"
          />

          {/* Bulbo inferior arredondado */}
          <circle
            cx="27"
            cy="153"
            r="5"
            fill="#ef4444"
            stroke="#475569"
            strokeWidth="0.8"
          />

          {/* Rótulo "NÍVEL XX%" perfeitamente limpo */}
          <text
            x="27"
            y="172"
            fill="#f8fafc"
            fontSize="9"
            fontWeight="700"
            fontFamily="monospace"
            textAnchor="middle"
            letterSpacing="0.2"
          >
            NÍVEL {Math.round(level)}%
          </text>
        </g>

        {/* -------------------------------------------------------------
            6. A BICA INDUSTRIAL COM REGISTRO (TOP-RIGHT COM NICHO)
            ------------------------------------------------------------- */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={handleToggleTap}
          title={isTapOpen ? 'Clique no registro para FECHAR a bica' : 'Clique no registro para ABRIR a bica'}
        >
          {/* Moldura do nicho da bica exatamente como na referência */}
          <rect
            x="166"
            y="38"
            width="66"
            height="50"
            rx="4"
            fill="rgba(15, 23, 42, 0.45)"
            stroke="#64748b"
            strokeWidth="1"
          />

          {/* Cano metálico saindo da parede direita */}
          <path
            d="M 224 54 L 194 54"
            stroke={`url(#${uid}_chromeGrad)`}
            strokeWidth="8"
            strokeLinecap="square"
          />

          {/* Curva da bica apontando verticalmente para baixo */}
          <path
            d="M 198 54 Q 186 54 186 64 L 186 82"
            fill="none"
            stroke={`url(#${uid}_chromeGrad)`}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Bico arejador na saída */}
          <rect
            x="182"
            y="81"
            width="8"
            height="4"
            rx="1.5"
            fill="#475569"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />

          {/* Registro metálico industrial no topo com volante circular */}
          <g
            transform={`translate(202, 46) rotate(${isTapOpen ? 90 : 0})`}
            style={{ transition: 'transform 0.25s ease-out' }}
          >
            <circle cx="0" cy="0" r="9" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
            <circle cx="0" cy="0" r="7.5" fill="#ef4444" />
            {/* Cruz do volante */}
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="0" cy="0" r="3.2" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
          </g>
        </g>
      </svg>
    </div>
  );
}
