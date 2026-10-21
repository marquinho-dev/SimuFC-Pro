import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Zap,
  Volume2,
  VolumeX,
  BookOpen,
  FileText,
  Gauge,
  Sparkles,
  Trash2,
  Play,
  Pause,
  Layers,
  ChevronDown,
  RotateCw,
  ArrowRight,
} from 'lucide-react';
import { WIRE_COLORS } from '../types/components';
import { COMPONENT_THUMBNAILS, SCHEMATIC_THUMBNAILS } from './ComponentThumbnails';
import { sounds } from '../services/soundEffects';
import { PRESETS } from '../presets/circuits';

export default function Header({
  activeWireColor,
  setActiveWireColor,
  selectedWireId,
  selectedWireColor,
  onSelectWireColor,
  isMuted,
  setIsMuted,
  isSimulationMode,
  setIsSimulationMode,
  showElectronFlow,
  onToggleElectronFlow,
  onLoadPreset,
  onClearWires,
  onClearAll,
  onOpenTheory,
  onOpenMultimeter,
  onAddComponent,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('real'); // 'real' | 'schematic'

  const displayWireColor =
    selectedWireId && selectedWireColor ? selectedWireColor : activeWireColor;

  // Close menus when simulation starts
  useEffect(() => {
    if (isSimulationMode) {
      setIsPresetsOpen(false);
      setIsMenuOpen(false);
    }
  }, [isSimulationMode]);

  // Real industrial hardware components catalog
  const COMPONENT_CATEGORIES_REAL = [
    {
      id: 'power_protection',
      title: 'Fontes & Proteção',
      icon: '⚡',
      items: [
        {
          type: 'power_source',
          name: 'Transformador Trifásico',
          tag: 'REDE',
          subtitle: '3Ø + N + Terra (PE)',
        },
        {
          type: 'circuit_breaker',
          name: 'Disjuntor Termomagnético',
          tag: 'Q1',
          subtitle: 'Padrão DIN (Curva C)',
        },
        {
          type: 'thermal_relay',
          name: 'Relé Térmico Sobrecarga',
          tag: 'RT1',
          subtitle: 'Proteção Bimetálica',
        },
      ],
    },
    {
      id: 'control_switching',
      title: 'Comando & Acionamento',
      icon: '⚙️',
      items: [
        {
          type: 'contactor',
          name: 'Contator de Potência',
          tag: 'K1',
          subtitle: 'Bobina 220V + Auxiliares',
        },
        {
          type: 'button_start',
          name: 'Botoeira Liga (NA)',
          tag: 'S1',
          subtitle: 'Retorno por Mola (Verde)',
        },
        {
          type: 'button_stop',
          name: 'Botoeira Desliga (NF)',
          tag: 'S0',
          subtitle: 'Retorno por Mola (Vermelho)',
        },
        {
          type: 'timer_relay',
          name: 'Relé Temporizador',
          tag: 'KT1',
          subtitle: 'Retardo RE / RD (0.5 a 60s)',
        },
        {
          type: 'button_emergency',
          name: 'Botoeira de Emergência',
          tag: 'S00',
          subtitle: 'Cogumelo Trava Giratória',
        },
      ],
    },
    {
      id: 'loads_motors',
      title: 'Sinalização & Cargas',
      icon: '💡',
      items: [
        {
          type: 'pilot_light',
          name: 'Lâmpada LED Bulbo E27 (220V)',
          tag: 'H1',
          subtitle: 'Lâmpada LED 220V • Rosca E27 e Pé Central (X1-X2)',
        },
        {
          type: 'motor_6p',
          name: 'Motor de Indução Trifásico',
          tag: 'M1',
          subtitle: '6 Pontas (Partida Direta)',
        },
      ],
    },
    {
      id: 'panel_structure',
      title: 'Painel & Fixação',
      icon: '📐',
      items: [
        {
          type: 'din_rail',
          name: 'Trilho DIN TS-35',
          tag: 'TRILHO',
          subtitle: 'Fixação e alinhamento de componentes (35mm)',
        },
      ],
    },
  ];

  // Technical IEC 60617 schematic symbols catalog
  const COMPONENT_CATEGORIES_SCHEMATIC = [
    {
      id: 'sources_schematic',
      title: 'Fontes & Alimentação',
      icon: '⚡',
      items: [
        {
          type: 'power_source',
          name: 'Barramento Esquemático',
          tag: '-X1',
          subtitle: 'Rede L1, L2, L3, N, PE',
        },
      ],
    },
    {
      id: 'protection_schematic',
      title: 'Proteção & Seccionamento',
      icon: '🛡️',
      items: [
        {
          type: 'circuit_breaker',
          name: 'Símbolo Disjuntor Tripolar Q1',
          tag: '-Q1',
          subtitle: 'Força • Contatos 1-2, 3-4, 5-6 com Disparo',
        },
        {
          type: 'thermal_relay',
          name: 'Símbolo Relé Térmico',
          tag: '-RT1',
          subtitle: 'Bimetálicos + Contatos 95-96/97-98',
        },
      ],
    },
    {
      id: 'coils_contacts_schematic',
      title: 'Bobinas & Contatos',
      icon: '⚙️',
      items: [
        {
          type: 'contactor',
          name: 'Contator KM1 (Contatos de Força)',
          tag: '-KM1',
          subtitle: 'Circuito de Força • Polos 1-2, 3-4, 5-6',
        },
        {
          type: 'contactor_coil',
          name: 'Bobina de Contator KM1 (A1-A2)',
          tag: '-KM1',
          subtitle: 'Circuito de Comando • Terminais A1 e A2',
        },
        {
          type: 'timer_relay',
          name: 'Símbolo Relé Temporizador',
          tag: '-KT1',
          subtitle: 'Bobina Temporizada RE/RD e Contatos',
        },
      ],
    },
    {
      id: 'switches_schematic',
      title: 'Botoeiras & Acionadores',
      icon: '🔘',
      items: [
        {
          type: 'button_start',
          name: 'Símbolo Botoeira Liga (NA)',
          tag: '-S1',
          subtitle: 'Contato 13-14 Normalmente Aberto',
        },
        {
          type: 'button_stop',
          name: 'Símbolo Botoeira Desliga (NF)',
          tag: '-S0',
          subtitle: 'Contato 11-12 Normalmente Fechado',
        },
        {
          type: 'button_emergency',
          name: 'Símbolo Emergência (NF)',
          tag: '-S00',
          subtitle: 'Cogumelo com retenção mecânica',
        },
      ],
    },
    {
      id: 'loads_schematic',
      title: 'Cargas & Motores',
      icon: '🌀',
      items: [
        {
          type: 'motor_6p',
          name: 'Símbolo Motor Trifásico',
          tag: '-M1',
          subtitle: 'Símbolo IEC M 3~ (6 Pontas + PE)',
        },
      ],
    },
  ];

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Close menu if entering simulation mode
  useEffect(() => {
    if (isSimulationMode && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isSimulationMode, isMenuOpen]);

  const handleSelectAdd = (type) => {
    if (onAddComponent) {
      onAddComponent(type, undefined, undefined, drawerTab);
      try {
        sounds.playSwitch();
      } catch {
        // Ignore sound error
      }
    }
    // Note: Do NOT close menu here. The user requested:
    // "o menu de componentes não pode fechar quando eu clicar em uma peça ele so deve fechar se eu clicar em uma área fora dele"
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          {/* Hamburger Menu button placed at far left as requested */}
          <button
            type="button"
            disabled={isSimulationMode}
            className={`btn-hamburger-menu ${isMenuOpen ? 'active' : ''} ${isSimulationMode ? 'disabled' : ''}`}
            onClick={() => !isSimulationMode && setIsMenuOpen(!isMenuOpen)}
            title={
              isSimulationMode
                ? 'Pause a simulação para adicionar componentes'
                : 'Menu de Componentes (Adicionar à Bancada)'
            }
            aria-label="Menu de Componentes"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="app-branding">
            <div className="logo-badge">
              <Zap className="logo-zap" />
            </div>
            <div className="branding-text">
              <h1 className="app-title">SimuFC Pro</h1>
              <span className="app-subtitle">Simulador de Comandos Elétricos Industriais</span>
            </div>
          </div>

          {/* Mode Selector Toggle: Iniciar Simulação / Modo Edição (Apenas ícone Play / Pause) */}
          <button
            type="button"
            className={`btn-toolbar btn-sim-mode btn-sim-icon-only ${
              isSimulationMode ? 'active-simulating' : 'active-editing'
            }`}
            onClick={() => {
              setIsSimulationMode(!isSimulationMode);
            }}
            title={
              isSimulationMode
                ? 'Pausar Simulação (Voltar ao Modo Edição)'
                : 'Iniciar Simulação Elétrica (Play)'
            }
            aria-label={isSimulationMode ? 'Pausar Simulação' : 'Iniciar Simulação'}
          >
            {isSimulationMode ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Wire Color Selector Palette (ao lado do botão de iniciar simulação) */}
          <div
            className={`wire-color-palette ${isSimulationMode ? 'palette-disabled' : ''}`}
            title={
              isSimulationMode
                ? 'Modo Simulação: os cabos adotam as cores normatizadas das fases'
                : selectedWireId
                ? 'Clique para alterar a cor do fio selecionado'
                : 'Escolha a cor do fio'
            }
          >
            <span className="palette-label">
              {selectedWireId ? 'Fio Sel.:' : 'Fio:'}
            </span>
            {WIRE_COLORS.map((w) => (
              <button
                key={w.id}
                type="button"
                disabled={isSimulationMode}
                className={`color-swatch ${displayWireColor === w.color ? 'active' : ''}`}
                style={{ backgroundColor: w.color }}
                onClick={() =>
                  onSelectWireColor
                    ? onSelectWireColor(w.color)
                    : setActiveWireColor(w.color)
                }
                title={
                  selectedWireId
                    ? `Mudar fio selecionado para ${w.label}`
                    : w.label
                }
              />
            ))}
          </div>
        </div>

        <div className="header-right">
          {/* Quick Presets Dropdown */}
          <div className="presets-dropdown-wrapper">
            <button
              type="button"
              disabled={isSimulationMode}
              className={`btn-toolbar btn-presets-toggle ${isPresetsOpen ? 'active' : ''} ${
                isSimulationMode ? 'btn-disabled' : ''
              }`}
              onClick={() => !isSimulationMode && setIsPresetsOpen(!isPresetsOpen)}
              title={
                isSimulationMode
                  ? 'Pause a simulação para carregar exemplos'
                  : 'Ver lista de comandos de exemplo prontos para simular'
              }
            >
              <Sparkles size={16} className="text-amber" />
              <span>Exemplos de Comandos</span>
              <ChevronDown size={14} className={`dropdown-chevron ${isPresetsOpen ? 'rotated' : ''}`} />
            </button>

            {isPresetsOpen && !isSimulationMode && (
              <>
                <div
                  className="presets-dropdown-backdrop"
                  onClick={() => setIsPresetsOpen(false)}
                  aria-hidden="true"
                />
                <div className="presets-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="presets-menu-header">
                    <div className="presets-header-title">
                      <Sparkles size={16} className="text-amber" />
                      <span>Circuitos Industriais Prontos</span>
                    </div>
                    <span className="presets-header-subtitle">
                      Selecione um comando pronto com todos os componentes e fios conectados:
                    </span>
                  </div>

                  <div className="presets-list">
                    {PRESETS.map((preset) => {
                      const isStarDelta = preset.id === 'star_delta';
                      return (
                        <div
                          key={preset.id}
                          className={`preset-card ${isStarDelta ? 'preset-featured' : ''}`}
                          onClick={() => {
                            onLoadPreset(preset.id);
                            setIsPresetsOpen(false);
                          }}
                        >
                          <div className="preset-card-top">
                            <span className="preset-badge">{preset.badge}</span>
                            {preset.isFeatured && (
                              <span className="preset-star-badge">★ Recomendado</span>
                            )}
                          </div>

                          <div className="preset-card-body">
                            <div className="preset-title-row">
                              <span className="preset-icon-wrapper">
                                {preset.id === 'star_delta' && <Zap size={18} className="text-amber" />}
                                {preset.id === 'direct_starter_motor' && <Play size={18} className="text-success" />}
                                {preset.id === 'reversing_starter' && <RotateCw size={18} className="text-primary" />}
                                {preset.id === 'empty_circuit' && <Trash2 size={18} className="text-danger" />}
                              </span>
                              <h4 className="preset-title">{preset.title}</h4>
                            </div>
                            <p className="preset-desc">{preset.description}</p>
                          </div>

                          <div className="preset-card-footer">
                            <span className="btn-load-preset">
                              <span>Carregar Comando</span>
                              <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={isSimulationMode}
            className={`btn-toolbar ${isSimulationMode ? 'btn-disabled' : ''}`}
            onClick={onClearWires}
            title={
              isSimulationMode ? 'Pause a simulação para limpar fios' : 'Remover todos os fios da bancada'
            }
          >
            <Trash2 size={16} />
            <span>Limpar Fios</span>
          </button>

          <button
            type="button"
            disabled={isSimulationMode}
            className={`btn-toolbar ${isSimulationMode ? 'btn-disabled' : ''}`}
            onClick={onClearAll}
            title={
              isSimulationMode
                ? 'Pause a simulação para limpar a bancada'
                : 'Limpar bancada inteira (remover todos os componentes e fios)'
            }
          >
            <Trash2 size={16} className="text-danger" />
            <span>Limpar Bancada</span>
          </button>

          <div className="toolbar-divider"></div>

          {/* Multimeter */}
          <button
            type="button"
            className="btn-toolbar"
            onClick={onOpenMultimeter}
            title="Abrir Multímetro Digital para medir tensões"
          >
            <Gauge size={16} />
            <span>Multímetro</span>
          </button>



          {/* Tutor / Dicas Guide */}
          <button
            type="button"
            className="btn-toolbar btn-tutor"
            onClick={onOpenTheory}
            title="Abrir Tutor com Dicas de Operação e Teoria dos Comandos"
          >
            <BookOpen size={16} />
            <span>🎓 Tutor / Dicas</span>
          </button>

          {/* Audio Mute */}
          <button
            type="button"
            className={`btn-toolbar btn-icon-only ${isMuted ? 'muted' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Sons'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* COMPONENT DRAWER (MENU HAMBURGUER) */}
      {isMenuOpen && !isSimulationMode && (
        <>
          <div
            className="component-drawer-backdrop"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <aside className="component-drawer open" aria-label="Menu de Componentes">
            <div className="component-drawer-header">
              <div className="drawer-header-title-box">
                <div className="drawer-header-icon">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="drawer-header-title">Menu de Componentes</h2>
                  <span className="drawer-header-subtitle">Selecione peças reais ou símbolos</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-drawer-close"
                onClick={() => setIsMenuOpen(false)}
                title="Fechar Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Guide Tabs: Peças Reais vs Símbolos do Esquema (conforme fotos de referência) */}
            <div className="drawer-view-mode-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'real'}
                className={`drawer-tab-btn ${drawerTab === 'real' ? 'active' : ''}`}
                onClick={() => setDrawerTab('real')}
                title="Exibir catálogo com Peças Reais"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drawer-tab-icon"
                >
                  <rect x="5" y="2" width="14" height="20" rx="3" />
                  <rect x="8" y="7" width="8" height="10" rx="1.5" />
                  <line x1="12" y1="10" x2="12" y2="14" />
                </svg>
                <span>Peças reais</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'schematic'}
                className={`drawer-tab-btn ${drawerTab === 'schematic' ? 'active' : ''}`}
                onClick={() => setDrawerTab('schematic')}
                title="Exibir catálogo com Símbolos do Esquema Técnico (IEC)"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drawer-tab-icon"
                >
                  <line x1="12" y1="2" x2="12" y2="7" />
                  <line x1="12" y1="17" x2="7" y2="8" />
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <line x1="4" y1="12" x2="8" y2="12" strokeDasharray="1.5 1.5" />
                </svg>
                <span>Símbolos do esquema</span>
              </button>
            </div>

            <div className="component-drawer-body">
              {(drawerTab === 'real' ? COMPONENT_CATEGORIES_REAL : COMPONENT_CATEGORIES_SCHEMATIC).map((category) => (
                <section key={category.id} className="drawer-category-section">
                  <div className="drawer-category-header">
                    <span className="drawer-category-icon">{category.icon}</span>
                    <h3 className="drawer-category-title">{category.title}</h3>
                    <span className="drawer-category-count">{category.items.length}</span>
                  </div>

                  <div className="drawer-category-grid">
                    {category.items.map((item) => {
                      const ThumbComponent =
                        drawerTab === 'real'
                          ? COMPONENT_THUMBNAILS[item.type]
                          : (SCHEMATIC_THUMBNAILS[item.type] || COMPONENT_THUMBNAILS[item.type]);

                      return (
                        <button
                          key={`${drawerTab}-${item.type}`}
                          type="button"
                          className="component-thumb-card"
                          onClick={() => handleSelectAdd(item.type)}
                          title={`Adicionar ${item.name} (${item.tag})`}
                        >
                          <div className="thumb-preview-box">
                            {ThumbComponent ? (
                              <ThumbComponent />
                            ) : (
                              <div className="thumb-placeholder-icon">⚡</div>
                            )}
                          </div>

                          <div className="thumb-info-box">
                            <span className="thumb-name">{item.name}</span>
                            <div className="thumb-badge-row">
                              <span className="thumb-tag-badge">{item.tag}</span>
                              {item.subtitle && (
                                <span className="thumb-subtitle">{item.subtitle}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="component-drawer-footer">
              <span className="drawer-footer-hint">
                💡 Arraste os componentes na bancada e conecte os bornes clicando neles.
              </span>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
