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
  Trash2,
  Play,
  Pause,
  Layers,
  Bell,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { WIRE_COLORS } from '../types/components';
import { COMPONENT_THUMBNAILS, SCHEMATIC_THUMBNAILS } from './ComponentThumbnails';

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
  shortCircuit = false,
  shortCircuitDetails = null,
  onClearShortWires = null,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('real'); // 'real' | 'schematic'
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const displayWireColor =
    selectedWireId && selectedWireColor ? selectedWireColor : activeWireColor;

  // Close menus when simulation starts
  useEffect(() => {
    if (isSimulationMode) {
      setIsMenuOpen(false);
    }
  }, [isSimulationMode]);

  // Real industrial hardware components catalog (Nomes limpos e diretos)
  const COMPONENT_CATEGORIES_REAL = [
    {
      id: 'power_protection',
      title: 'Fontes & Proteção',
      icon: '⚡',
      items: [
        {
          type: 'power_source',
          name: 'Rede',
          tag: 'REDE',
        },
        {
          type: 'circuit_breaker',
          name: 'Disjuntor',
          tag: 'Q1',
        },
        {
          type: 'fuse_holder',
          name: 'Porta-Fusível',
          tag: 'F1',
        },
        {
          type: 'thermal_relay',
          name: 'Relé Térmico',
          tag: 'RT1',
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
          name: 'Contator',
          tag: 'K1',
        },
        {
          type: 'button_start',
          name: 'Botoeira Liga (NA)',
          tag: 'S1',
        },
        {
          type: 'button_stop',
          name: 'Botoeira Desliga (NF)',
          tag: 'S0',
        },
        {
          type: 'timer_relay',
          name: 'Relé Temporizador',
          tag: 'KT1',
        },
        {
          type: 'button_emergency',
          name: 'Botoeira Emergência',
          tag: 'S00',
        },
        {
          type: 'float_switch',
          name: "Caixa D'Água (Boia)",
          tag: 'B1',
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
          name: 'Sinaleira LED',
          tag: 'H1',
        },
        {
          type: 'motor_6p',
          name: 'Motor Trifásico',
          tag: 'M1',
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
          name: 'Trilho DIN',
          tag: 'TRILHO',
        },
        {
          type: 'terminal_block',
          name: 'Borneira',
          tag: 'XT1',
        },
      ],
    },
  ];

  // Technical IEC 60617 schematic symbols catalog (Nomes simplificados)
  const COMPONENT_CATEGORIES_SCHEMATIC = [
    {
      id: 'sources_schematic',
      title: 'Fontes & Alimentação',
      icon: '⚡',
      items: [
        {
          type: 'power_source',
          name: 'Rede',
          tag: '-X1',
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
          name: 'Disjuntor Q1',
          tag: '-Q1',
        },
        {
          type: 'fuse_holder',
          name: 'Porta-Fusível F1',
          tag: '-F1',
        },
        {
          type: 'thermal_relay',
          name: 'Relé Térmico RT1',
          tag: '-RT1',
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
          name: 'Contator KM1',
          tag: '-KM1',
        },
        {
          type: 'contactor_coil',
          name: 'Bobina KM1',
          tag: '-KM1',
        },
        {
          type: 'timer_relay',
          name: 'Temporizador KT1',
          tag: '-KT1',
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
          name: 'Botoeira Liga (NA)',
          tag: '-S1',
        },
        {
          type: 'button_stop',
          name: 'Botoeira Desliga (NF)',
          tag: '-S0',
        },
        {
          type: 'button_emergency',
          name: 'Botoeira Emergência',
          tag: '-S00',
        },
        {
          type: 'float_switch',
          name: 'Boia de Nível B1',
          tag: '-B1',
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
          name: 'Motor Trifásico',
          tag: '-M1',
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
              <img
                src="/assets/logo.png"
                alt="Simulador de Comandos Elétricos"
                className="app-logo-img"
              />
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

          {/* Sininho de Notificações / Avisos Discretos */}
          <div className="notification-bell-container">
            <button
              type="button"
              className={`btn-toolbar btn-icon-only btn-bell ${shortCircuit ? 'has-alert' : ''}`}
              onClick={() => setIsNotifOpen((prev) => !prev)}
              title={
                shortCircuit
                  ? 'Aviso crítico: Curto-circuito detectado! Clique para detalhes'
                  : 'Avisos e Notificações do Sistema'
              }
            >
              <Bell size={18} />
              {shortCircuit && <span className="bell-badge-pulse" />}
            </button>

            {/* Popover Discreto com os Avisos do Sistema */}
            {isNotifOpen && (
              <>
                <div
                  className="notif-popover-backdrop"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div
                  className="notification-popover"
                  role="dialog"
                  aria-label="Avisos do Sistema"
                >
                  <div className="notif-header">
                    <div className="notif-header-title">
                      <Bell size={15} />
                      <span>Avisos do Sistema</span>
                    </div>
                    <button
                      type="button"
                      className="btn-notif-close"
                      onClick={() => setIsNotifOpen(false)}
                      title="Fechar"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="notif-body">
                    {shortCircuit ? (
                      <div className="notif-card notif-card-danger">
                        <div className="notif-card-header">
                          <span className="notif-alert-badge">⚡ ALERTA</span>
                          <span className="notif-time">Agora</span>
                        </div>
                        <h4 className="notif-card-title">Curto-Circuito Detectado!</h4>
                        <p className="notif-card-text">
                          {shortCircuitDetails?.description ||
                            'Houve uma ligação direta entre Fase e Neutro (ou entre Fases) sem carga intermediária. Verifique a fiação.'}
                        </p>
                        {onClearShortWires && (
                          <div className="notif-card-actions">
                            <button
                              type="button"
                              className="btn-notif-clear-short"
                              onClick={() => {
                                onClearShortWires();
                                setIsNotifOpen(false);
                              }}
                              title="Desconectar imediatamente o fio em curto"
                            >
                              Desfazer Curto
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="notif-card notif-card-empty">
                        <CheckCircle2 size={22} className="notif-empty-icon" />
                        <div>
                          <div className="notif-empty-title">Nenhum aviso pendente</div>
                          <div className="notif-empty-text">A bancada está operando normalmente sem erros.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
