import React from 'react';
import { sounds } from '../../services/soundEffects';

function getVoltageBadgeColor(v) {
  switch (v) {
    case 'L1':
      return '#a855f7';
    case 'L2':
      return '#ffffff';
    case 'L3':
      return '#ef4444';
    case 'N':
      return '#2563eb';
    case 'PE':
      return '#16a34a';
    default:
      return '#38bdf8';
  }
}

/**
 * SelectorSwitch3PElement
 * Chave Seletora Industrial de 3 Posições (1 - 0 - 2 / MAN - 0 - AUTO) com Atuador de Manopla Longa
 * Conforme o modelo e render fotorealista fornecido pelo usuário:
 * - Flange traseira de montagem em painel com nervuras de molde de 22mm
 * - Aro metálico chanfrado com reflexos cromados escovados de alto brilho
 * - Manopla longa preta com friso indicador branco
 * - 3 estágios detentados: 1 (-45°), 0 (0°), 2 (+45°)
 * - 4 Bornes parafusados industriais (13-14 Contato 1 NA, 23-24 Contato 2 NA)
 */
export default function SelectorSwitch3PElement({
  component,
  terminalVoltages = new Map(),
  activeTerminal,
  onTerminalClick,
  onUpdateComponentState,
  isSimulationMode = false,
}) {
  const componentId = component.id;
  const position = String(component.state?.position ?? '0'); // '1' | '0' | '2'

  // Mapeamento de ângulo da alavanca longa para cada posição
  const positionAngles = {
    '1': -45, // Esquerda (MAN / Posição 1)
    '0': 0,   // Centro (0 / Neutro / Desligado)
    '2': 45,  // Direita (AUTO / Posição 2)
  };

  const handleAngle = positionAngles[position] ?? 0;

  // Ciclo sequencial mecânico ao clicar no atuador:
  // Em uma chave industrial de 3 posições com batentes físicos, o ciclo correto é:
  // 1 -> 0 -> 2 -> 0 -> 1 (vai e volta passando sempre pelo neutro 0)
  const handleToggle = (e) => {
    e.stopPropagation();
    try {
      sounds.playRotarySwitchClick();
    } catch {}

    let nextPos = '0';
    let nextDir = component.state?.toggleDirection ?? 'to2';

    if (position === '1') {
      // De 1 só pode ir para 0 em direção ao 2
      nextPos = '0';
      nextDir = 'to2';
    } else if (position === '2') {
      // De 2 só pode ir para 0 em direção ao 1
      nextPos = '0';
      nextDir = 'to1';
    } else {
      // Posição '0' (centro): segue a direção atual
      if (nextDir === 'to1') {
        nextPos = '1';
        nextDir = 'to2'; // Chegou ao batente esquerdo, próximo movimento será de volta
      } else {
        nextPos = '2';
        nextDir = 'to1'; // Chegou ao batente direito, próximo movimento será de volta
      }
    }

    onUpdateComponentState(componentId, {
      position: nextPos,
      toggleDirection: nextDir,
    });
  };

  const handleSelectPosition = (e, pos) => {
    e.stopPropagation();
    if (position === pos) return;
    try {
      sounds.playRotarySwitchClick();
    } catch {}
    const nextDir = pos === '1' ? 'to2' : pos === '2' ? 'to1' : (position === '2' ? 'to1' : 'to2');
    onUpdateComponentState(componentId, {
      position: pos,
      toggleDirection: nextDir,
    });
  };

  // Ids escopados para gradientes e filtros SVG
  const flangeGradId = `ss-flangeGrad-${componentId}`;
  const ribGradId = `ss-ribGrad-${componentId}`;
  const metalRingGradId = `ss-metalRingGrad-${componentId}`;
  const metalInnerGradId = `ss-metalInnerGrad-${componentId}`;
  const dialGradId = `ss-dialGrad-${componentId}`;
  const leverGradId = `ss-leverGrad-${componentId}`;
  const leverHighlightGradId = `ss-leverHighlightGrad-${componentId}`;
  const screwGradId = `ss-screwGrad-${componentId}`;
  const metalTermGradId = `ss-metalTermGrad-${componentId}`;
  const glowFilterId = `ss-glow-${componentId}`;
  const dropShadowFilterId = `ss-dropShadow-${componentId}`;

  // Helper de estado dos bornes
  const getTermState = (termId) => {
    const v = terminalVoltages.get(`${componentId}:${termId}`);
    const isSelected =
      activeTerminal?.componentId === componentId &&
      activeTerminal?.terminalId === termId;

    return {
      voltage: v,
      isPowered: Boolean(v),
      isSelected,
      isConnecting: Boolean(activeTerminal),
    };
  };

  const term13State = getTermState('13');
  const term23State = getTermState('23');
  const term14State = getTermState('14');
  const term24State = getTermState('24');

  // Renderizador de borne parafusado industrial (idêntico ao padrão dos botões da bancada)
  const renderScrewTerminal = (cx, cy, bossX, bossY, plateX, plateY, termId, label, state) => {
    return (
      <g
        className={`pushbutton-screw-terminal-group ${state.isSelected ? 'selected' : ''} ${
          state.isConnecting ? 'wire-target-ready' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onTerminalClick(componentId, termId);
        }}
        style={{ cursor: 'pointer' }}
      >
        {/* Bloco de resina/carcaça isolante moldada */}
        <rect
          x={bossX}
          y={bossY}
          width="118"
          height="96"
          rx="12"
          fill="#14171f"
          stroke="#0b0d12"
          strokeWidth="4"
        />

        {/* Placa metálica condutora alojada no rebaixo */}
        <rect
          x={plateX}
          y={plateY}
          width="106"
          height="72"
          rx="8"
          fill={`url(#${metalTermGradId})`}
          stroke={state.isSelected ? '#38bdf8' : state.isConnecting ? '#4ade80' : '#20242d'}
          strokeWidth={state.isSelected || state.isConnecting ? '5' : '3.5'}
        />

        {/* Halo de indicação interativa */}
        {state.isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="32"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="5"
            strokeDasharray="8 4"
            className="screw-selected-ring"
          />
        )}
        {state.isConnecting && !state.isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r="30"
            fill="rgba(74, 222, 128, 0.2)"
            stroke="#4ade80"
            strokeWidth="3.5"
          />
        )}

        {/* Cavidade cilíndrica escura do parafuso */}
        <circle cx={cx} cy={cy} r="22" fill="#1c202a" />

        {/* Cabeça do parafuso metálico usinado */}
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill={`url(#${screwGradId})`}
          stroke="#12151b"
          strokeWidth="1.5"
        />

        {/* Fenda Phillips em cruz usinada */}
        <path
          d={`M ${cx - 8} ${cy} L ${cx + 8} ${cy} M ${cx} ${cy - 8} L ${cx} ${cy + 8}`}
          stroke="#1a1e28"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill="#1a1e28" opacity="0.6" />

        {/* Ponto indicador de condutor energizado com potencial elétrico */}
        {state.isPowered && (
          <circle
            cx={cx}
            cy={cy}
            r="7"
            fill={getVoltageBadgeColor(state.voltage)}
            filter={`url(#${glowFilterId})`}
          />
        )}

        {/* Texto do borne */}
        <text
          x={cx}
          y={cy > 350 ? cy + 42 : cy - 28}
          fill="#94a3b8"
          fontSize="20"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {label}
        </text>

        {/* Hotspot de clique preciso para conectar cabos */}
        <circle
          cx={cx}
          cy={cy}
          r="34"
          fill="transparent"
          data-terminal-target={`${componentId}:${termId}`}
        />
      </g>
    );
  };

  return (
    <div
      className="industrial-device button-device industrial-pushbutton-device selector-switch-3p-device"
      title={`Chave Seletora 3 Posições (1 - 0 - 2)\nPosição Atual: ${
        position === '1' ? '1 (MAN - Contato 13-14 fechado)' : position === '2' ? '2 (AUTO - Contato 23-24 fechado)' : '0 (Desligado / Neutro)'
      }\nClique na manopla para alternar ou clique direto nos marcadores 1, 0 ou 2`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 700"
        width="100%"
        height="100%"
        className="industrial-pushbutton-svg"
        style={{ display: 'block', overflow: 'visible', userSelect: 'none' }}
      >
        <defs>
          {/* Base / Flange escura de fixação */}
          <linearGradient id={flangeGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c303c" />
            <stop offset="35%" stopColor="#181a20" />
            <stop offset="100%" stopColor="#0f1115" />
          </linearGradient>

          {/* Nervuras de reforço estrutural */}
          <linearGradient id={ribGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#20242e" />
            <stop offset="50%" stopColor="#13151b" />
            <stop offset="100%" stopColor="#0c0e12" />
          </linearGradient>

          {/* Aro frontal metálico cromado escovado (Bezel 22mm) */}
          <linearGradient id={metalRingGradId} x1="0.1" y1="0.1" x2="0.9" y2="0.9">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#cbd5e1" />
            <stop offset="40%" stopColor="#64748b" />
            <stop offset="65%" stopColor="#1e293b" />
            <stop offset="85%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          {/* Bisel interno chanfrado espelhado */}
          <radialGradient id={metalInnerGradId} cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Disco giratório preto acetinado */}
          <radialGradient id={dialGradId} cx="46%" cy="42%" r="56%">
            <stop offset="0%" stopColor="#2b2f3a" />
            <stop offset="70%" stopColor="#14161c" />
            <stop offset="100%" stopColor="#090a0d" />
          </radialGradient>

          {/* Manopla longa preta sólida com iluminação angular */}
          <linearGradient id={leverGradId} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#383d49" />
            <stop offset="25%" stopColor="#22252e" />
            <stop offset="75%" stopColor="#16181e" />
            <stop offset="100%" stopColor="#0c0e12" />
          </linearGradient>

          {/* Borda chanfrada de destaque na alavanca */}
          <linearGradient id={leverHighlightGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4e5668" />
            <stop offset="100%" stopColor="#181a20" />
          </linearGradient>

          {/* Gradiente das placas condutoras de borne */}
          <linearGradient id={metalTermGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5f7fa" />
            <stop offset="100%" stopColor="#a2a8b3" />
          </linearGradient>

          {/* Gradiente dos parafusos de borne */}
          <linearGradient id={screwGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Filtro de brilho para terminais energizados */}
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sombra de projeção suave da manopla e corpo */}
          <filter id={dropShadowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="6" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Sombra de base projetada no fundo */}
        <ellipse cx="320" cy="652" rx="275" ry="34" fill="#06080b" opacity="0.45" />

        {/* -----------------------------------------------------------------
            1. FLANGE TRASEIRA DE FIXAÇÃO INDUSTRIAL (ESTILO 22MM REALISTA)
            ----------------------------------------------------------------- */}
        <g>
          {/* Bloco base da flange */}
          <rect
            x="84"
            y="54"
            width="472"
            height="592"
            rx="24"
            fill={`url(#${flangeGradId})`}
            stroke="#3a4150"
            strokeWidth="3.5"
          />

          {/* Friso rebaixado na moldura perimétrica */}
          <rect
            x="96"
            y="66"
            width="448"
            height="568"
            rx="18"
            fill="none"
            stroke="#0a0c10"
            strokeWidth="4"
          />

          {/* Nervuras estruturais do topo conforme foto do usuário */}
          <path
            d="M 120 74 L 520 74 L 520 220 L 485 220 L 485 106 L 370 106 L 370 220 L 270 220 L 270 106 L 155 106 L 155 220 L 120 220 Z"
            fill={`url(#${ribGradId})`}
            stroke="#0b0d12"
            strokeWidth="2.5"
          />

          {/* Recortes de alívio e pino guia no bloco superior */}
          <rect x="170" y="120" width="80" height="85" rx="8" fill="#0c0e12" stroke="#252b37" strokeWidth="2" />
          <rect x="390" y="120" width="80" height="85" rx="8" fill="#0c0e12" stroke="#252b37" strokeWidth="2" />

          {/* Furo guia de indexação e trava anti-giro na carcaça */}
          <circle cx="210" cy="155" r="16" fill="#08090d" stroke="#2c3240" strokeWidth="2" />

          {/* Orelha superior de aperto e guia mecânica */}
          <path
            d="M 285 74 C 285 58 355 58 355 74 Z"
            fill="#232732"
            stroke="#3a4150"
            strokeWidth="2.5"
          />
          <circle cx="320" cy="72" r="7" fill="#090a0e" />

          {/* Travessa inferior de encosto dos blocos de contato */}
          <rect x="110" y="475" width="420" height="15" rx="4" fill="#0d0f14" stroke="#252a36" strokeWidth="1.5" />
        </g>

        {/* -----------------------------------------------------------------
            2. BORNES INDUSTRIAIS PARAFUSADOS (13-23 Topo, 14-24 Base)
            ----------------------------------------------------------------- */}
        {/* Borne 13: Topo Esquerdo (Contato 1 NA) */}
        {renderScrewTerminal(200, 122, 141, 74, 147, 86, '13', '13', term13State)}

        {/* Borne 23: Topo Direito (Contato 2 NA) */}
        {renderScrewTerminal(440, 122, 381, 74, 387, 86, '23', '23', term23State)}

        {/* Borne 14: Base Esquerda (Contato 1 NA) */}
        {renderScrewTerminal(200, 578, 141, 530, 147, 542, '14', '14', term14State)}

        {/* Borne 24: Base Direita (Contato 2 NA) */}
        {renderScrewTerminal(440, 578, 381, 530, 387, 542, '24', '24', term24State)}

        {/* -----------------------------------------------------------------
            3. ARO METÁLICO CROMADO CHANFRADO (BEZEL 22MM DE ALTO BRILHO)
            ----------------------------------------------------------------- */}
        <g id="bezel-assembly">
          {/* Sombra de profundidade do bezel sobre a carcaça */}
          <circle cx="320" cy="354" r="172" fill="#07080b" opacity="0.85" />

          {/* Anel metálico externo chanfrado */}
          <circle
            cx="320"
            cy="350"
            r="168"
            fill={`url(#${metalRingGradId})`}
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Chanfro cônico interno refletivo */}
          <circle
            cx="320"
            cy="350"
            r="150"
            fill={`url(#${metalInnerGradId})`}
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Aro de filete cromado espelhado brilhante na borda de transição */}
          <circle
            cx="320"
            cy="350"
            r="142"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.82"
          />

          {/* Anel de encaixe da mesa giratória */}
          <circle cx="320" cy="350" r="134" fill="#090b0e" stroke="#2b313d" strokeWidth="2.5" />
        </g>

        {/* -----------------------------------------------------------------
            4. DISCO GIRATÓRIO CENTRAL E ESCALA DE POSIÇÃO (1 - 0 - 2)
            ----------------------------------------------------------------- */}
        <g id="dial-and-scale">
          {/* Superfície do disco preto fosco */}
          <circle
            cx="320"
            cy="350"
            r="131"
            fill={`url(#${dialGradId})`}
            style={{ cursor: 'pointer' }}
            onClick={handleToggle}
          />

          {/* Anel sutil gravado no plástico */}
          <circle cx="320" cy="350" r="118" fill="none" stroke="#252a36" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />

          {/* Marcadores de posição interativos (clicáveis diretamente) */}

          {/* Posição 1: Esquerda (-45°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={(e) => handleSelectPosition(e, '1')}
            title="Posição 1 (MAN): Fecha contato 13-14"
          >
            {/* Traço indexador radial */}
            <line
              x1="244"
              y1="274"
              x2="256"
              y2="286"
              stroke={position === '1' ? '#38bdf8' : '#64748b'}
              strokeWidth={position === '1' ? '4' : '2.5'}
              strokeLinecap="round"
            />
            {/* Círculo indicador / badge quando ativa */}
            {position === '1' && (
              <circle cx="230" cy="260" r="15" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" />
            )}
            <text
              x="230"
              y="266"
              fill={position === '1' ? '#38bdf8' : '#cbd5e1'}
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              1
            </text>
          </g>

          {/* Posição 0: Centro (0° / Topo) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={(e) => handleSelectPosition(e, '0')}
            title="Posição 0 (DESLIGADO): Contatos abertos"
          >
            {/* Traço indexador radial */}
            <line
              x1="320"
              y1="240"
              x2="320"
              y2="256"
              stroke={position === '0' ? '#f8fafc' : '#64748b'}
              strokeWidth={position === '0' ? '4' : '2.5'}
              strokeLinecap="round"
            />
            {position === '0' && (
              <circle cx="320" cy="226" r="15" fill="rgba(255, 255, 255, 0.15)" stroke="#f8fafc" strokeWidth="1.5" />
            )}
            <text
              x="320"
              y="232"
              fill={position === '0' ? '#ffffff' : '#cbd5e1'}
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              0
            </text>
          </g>

          {/* Posição 2: Direita (+45°) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={(e) => handleSelectPosition(e, '2')}
            title="Posição 2 (AUTO): Fecha contato 23-24"
          >
            {/* Traço indexador radial */}
            <line
              x1="396"
              y1="274"
              x2="384"
              y2="286"
              stroke={position === '2' ? '#38bdf8' : '#64748b'}
              strokeWidth={position === '2' ? '4' : '2.5'}
              strokeLinecap="round"
            />
            {position === '2' && (
              <circle cx="410" cy="260" r="15" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" />
            )}
            <text
              x="410"
              y="266"
              fill={position === '2' ? '#38bdf8' : '#cbd5e1'}
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
            >
              2
            </text>
          </g>
        </g>

        {/* -----------------------------------------------------------------
            5. ALAVANCA / MANOPLA LONGA INDUSTRIAL COM FRISO BRANCO
            Gira em torno do centro (320, 350) com rotação suave e snap sonoro
            ----------------------------------------------------------------- */}
        <g
          id="lever-handle-group"
          transform={`rotate(${handleAngle}, 320, 350)`}
          onClick={handleToggle}
          style={{
            cursor: 'pointer',
            transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Sombra realista projetada da manopla sobre o disco e anel */}
          <g transform="translate(10, 14)" opacity="0.65" filter={`url(#${dropShadowFilterId})`}>
            {/* Base cilíndrica central da sombra */}
            <circle cx="320" cy="350" r="64" fill="#000000" />
            {/* Braço projetado da alavanca */}
            <path
              d="M 288 230 L 352 230 L 372 350 L 370 486 C 370 514 340 528 320 528 C 300 528 270 514 270 486 L 268 350 Z"
              fill="#000000"
            />
          </g>

          {/* Bojo central da manopla (disco espesso integrado) */}
          <circle
            cx="320"
            cy="350"
            r="66"
            fill={`url(#${leverGradId})`}
            stroke="#111317"
            strokeWidth="3.5"
          />

          {/* Chanfro de borda superior do bojo */}
          <circle
            cx="320"
            cy="350"
            r="59"
            fill="none"
            stroke={`url(#${leverHighlightGradId})`}
            strokeWidth="2.5"
            opacity="0.8"
          />

          {/* Corpo principal da alavanca longa (conforme renderização 3D fornecida) */}
          <path
            d="M 288 226
               L 352 226
               C 358 226 364 232 364 240
               L 368 350
               L 366 492
               C 366 518 344 532 320 532
               C 296 532 274 518 274 492
               L 272 350
               L 276 240
               C 276 232 282 226 288 226 Z"
            fill={`url(#${leverGradId})`}
            stroke="#0b0d11"
            strokeWidth="3.5"
          />

          {/* Chanfro da faceta superior iluminada da alavanca */}
          <path
            d="M 293 234
               L 347 234
               C 351 234 355 238 355 244
               L 358 350
               L 356 488
               C 356 508 338 522 320 522
               C 302 522 284 508 284 488
               L 282 350
               L 285 244
               C 285 238 289 234 293 234 Z"
            fill="none"
            stroke={`url(#${leverHighlightGradId})`}
            strokeWidth="2"
            opacity="0.9"
          />

          {/* Friso lateral escuro de profundidade na alavanca */}
          <line x1="284" y1="240" x2="280" y2="488" stroke="#090b0e" strokeWidth="2.5" />
          <line x1="356" y1="240" x2="360" y2="488" stroke="#4a5568" strokeWidth="1.5" opacity="0.6" />

          {/* FRISO INDICADOR BRANCO ALONGADO (PILL / CAPSULE CENTRAL) */}
          {/* Como visto na foto de referência do usuário: pílula branca nítida na metade superior */}
          <g>
            {/* Chanfro de encaixe do friso no plástico preto */}
            <rect
              x="312"
              y="252"
              width="16"
              height="80"
              rx="8"
              fill="#0a0c10"
              stroke="#1b1f28"
              strokeWidth="2"
            />
            {/* Faixa branca leitosa pura de indicação */}
            <rect
              x="313.5"
              y="254"
              width="13"
              height="76"
              rx="6.5"
              fill="#ffffff"
            />
            {/* Brilho especular sutil na ponta do friso branco */}
            <line
              x1="320"
              y1="258"
              x2="320"
              y2="284"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Friso rebaixado na ponta inferior da manopla (área de pega/grip) */}
          <line x1="298" y1="486" x2="342" y2="486" stroke="#12151c" strokeWidth="3" strokeLinecap="round" />
          <line x1="302" y1="494" x2="338" y2="494" stroke="#12151c" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="308" y1="502" x2="332" y2="502" stroke="#12151c" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* -----------------------------------------------------------------
            6. TAG IDENTIFICADORA DISCRETA NO TOPO (EX: SS1)
            ----------------------------------------------------------------- */}
        <g>
          <rect
            x="272"
            y="24"
            width="96"
            height="26"
            rx="6"
            fill="rgba(15, 23, 42, 0.92)"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />
          <text
            x="320"
            y="42"
            fill="#38bdf8"
            fontSize="14"
            fontWeight="900"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {component.tag || 'SS1'}
          </text>
        </g>
      </svg>
    </div>
  );
}
