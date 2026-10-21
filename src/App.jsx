import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Canvas from './components/Canvas';
import SchematicModal from './components/SchematicModal';
import TheoryGuideModal from './components/TheoryGuideModal';
import MultimeterModal from './components/MultimeterModal';
import PowerSourceSettingsModal from './components/PowerSourceSettingsModal';
import BreakerSettingsModal from './components/BreakerSettingsModal';
import { INITIAL_COMPONENTS, WIRE_COLORS, TIMER_RELAY_TERMINALS, POWER_MODES } from './types/components';
import { PRESETS } from './presets/circuits';
import { evaluateCircuit } from './services/simulationEngine';
import { sounds } from './services/soundEffects';
import './App.css';

// Error Boundary around Workbench Canvas to guarantee resilience and display diagnostic if any render error occurs
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Canvas Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          color: '#f87171',
          textAlign: 'center',
          background: '#0d121c',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <h2>Ocorreu um erro ao renderizar a bancada</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            {this.state.error?.message || 'Erro inesperado'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              padding: '10px 20px',
              background: '#0284c7',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reiniciar Bancada
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const WORKBENCH_STORAGE_KEY = 'simulador_workbench_state_v1';

function getInitialWorkbenchState() {
  try {
    const raw = localStorage.getItem(WORKBENCH_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.components)) {
        const normalizedComponents = data.components.map((c) => {
          let updated = c;
          if (c.type === 'timer_relay') {
            updated = {
              ...updated,
              terminals: Object.values(TIMER_RELAY_TERMINALS),
            };
          }
          if (c.type === 'power_source') {
            const mode = c.state?.mode || '3P_N_PE';
            updated = {
              ...updated,
              terminals: POWER_MODES[mode]?.terminals || POWER_MODES['3P_N_PE'].terminals,
            };
          }
          if (!updated.displayMode) {
            updated = {
              ...updated,
              displayMode: updated.state?.displayMode || 'real',
            };
          }
          return updated;
        });
        return {
          components: normalizedComponents,
          wires: Array.isArray(data.wires) ? data.wires : [],
          activeWireColor: data.activeWireColor || WIRE_COLORS[0].color,
        };
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar bancada do localStorage:', err);
  }
  return {
    components: [],
    wires: [],
    activeWireColor: WIRE_COLORS[0].color,
  };
}

export default function App() {
  const initialData = useMemo(() => getInitialWorkbenchState(), []);
  const [components, setComponents] = useState(initialData.components);
  const [wires, setWires] = useState(initialData.wires);
  const [activeWireColor, setActiveWireColor] = useState(initialData.activeWireColor);
  const [showWireVoltageGlow, setShowWireVoltageGlow] = useState(true);
  const [showElectronFlow, setShowElectronFlow] = useState(() => {
    try {
      const saved = localStorage.getItem('simulador_electron_flow_v1');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [selectedWireId, setSelectedWireId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('simulador_view_mode_v1');
      return saved === 'schematic' ? 'schematic' : 'real';
    } catch {
      return 'real';
    }
  });

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('simulador_view_mode_v1', mode);
    } catch {
      // ignore
    }
    setToastMessage(
      mode === 'schematic'
        ? '📐 Modo Símbolos de Esquema Elétrico ativado'
        : '🔌 Modo Peças Reais da Bancada ativado'
    );
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  const handleToggleElectronFlow = useCallback(() => {
    setShowElectronFlow((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('simulador_electron_flow_v1', String(next));
      } catch {
        // ignore
      }
      setToastMessage(
        next
          ? '⚡ Fluxo de elétrons ativado (Estilo Falstad)'
          : 'Fluxo de elétrons desativado'
      );
      setTimeout(() => setToastMessage(null), 2200);
      return next;
    });
  }, []);

  // Auto-save workbench state to localStorage so work is never lost on refresh / close
  useEffect(() => {
    try {
      const payload = {
        components: components.map((c) => ({
          ...c,
          state: {
            ...c.state,
            energized: false,
            running: false,
            lit: false,
            pressed: false,
            ...(c.type === 'timer_relay'
              ? { timedOut: false, holding: false, timerStartedAt: null, outputActive: false }
              : {}),
          },
        })),
        wires,
        activeWireColor,
        updatedAt: Date.now(),
      };
      localStorage.setItem(WORKBENCH_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Falha ao salvar bancada no localStorage:', err);
    }
  }, [components, wires, activeWireColor]);

  // Modals state
  const [isSchematicOpen, setIsSchematicOpen] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isMultimeterOpen, setIsMultimeterOpen] = useState(false);
  const [isPowerSettingsOpen, setIsPowerSettingsOpen] = useState(false);
  const [isBreakerSettingsOpen, setIsBreakerSettingsOpen] = useState(false);
  const [selectedBreaker, setSelectedBreaker] = useState(null);

  // Sound mute sync
  useEffect(() => {
    sounds.setMuted(isMuted);
  }, [isMuted]);

  // Hysteresis memory ref for contactor latching (selo 13-14)
  const prevEnergizedRef = useRef(new Map());
  // Active viewport center to ensure newly added components spawn in visible view
  const viewportCenterRef = useRef({ x: 350, y: 220 });

  // Electrical topology key (ignores layout x,y coordinates so drags don't trigger simulation)
  const electricalKey = useMemo(() => {
    return JSON.stringify(
      components.map((c) => ({ id: c.id, type: c.type, state: c.state }))
    );
  }, [components]);

  // Mode: false = Modo Edição (montagem livre), true = Modo Simulação (Play ativo, edição bloqueada)
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  // Electrical evaluation engine run on state/wires change
  const simulationResult = useMemo(() => {
    if (!isSimulationMode) {
      // In Modo Edição, circuit is de-energized / idle (safe to edit)
      return {
        components: components.map((c) => ({
          ...c,
          state: {
            ...c.state,
            energized: false,
            running: false,
            lit: false,
            pressed: false,
          },
        })),
        terminalVoltages: new Map(),
        shortCircuit: false,
        shortCircuitDetails: null,
        shortedWireIds: [],
        trippedBreakerIds: [],
      };
    }

    const res = evaluateCircuit(components, wires, prevEnergizedRef.current);
    const nextMap = new Map();
    for (const c of res.components) {
      if (c.type === 'contactor' || c.type === 'timer_relay') {
        nextMap.set(c.id, Boolean(c.state.energized));
      }
    }
    prevEnergizedRef.current = nextMap;
    return res;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulationMode, electricalKey, wires]);

  // When stopping the simulation, restore all components to their normal/idle resting state
  const prevIsSimModeRef = useRef(isSimulationMode);
  useEffect(() => {
    if (prevIsSimModeRef.current && !isSimulationMode) {
      setComponents((prev) =>
        prev.map((c) => {
          const resetState = { ...c.state };
          if (c.type === 'circuit_breaker' || c.type === 'breaker_3p' || c.type === 'breaker_1p') {
            resetState.closed = false;
          }
          if (c.type === 'contactor' || c.type === 'contactor_coil') {
            resetState.energized = false;
          }
          if (c.type === 'motor_6p') {
            resetState.running = false;
            resetState.rpm = 0;
            resetState.current = 0;
          }
          if (c.type === 'pilot_light' || c.type === 'pilot_lamp') {
            resetState.lit = false;
          }
          if (c.type === 'button_start' || c.type === 'button_stop' || c.type === 'button_emergency') {
            resetState.pressed = false;
          }
          if (c.type === 'thermal_relay') {
            resetState.tripped = false;
          }
          if (c.type === 'timer_relay') {
            resetState.energized = false;
            resetState.timedOut = false;
            resetState.elapsed = 0;
          }
          return { ...c, state: resetState };
        })
      );
      prevEnergizedRef.current = new Map();
    }
    prevIsSimModeRef.current = isSimulationMode;
  }, [isSimulationMode]);

  // Keep live component state synchronized with electrical solver
  const activeComponents = useMemo(() => {
    const stateMap = new Map(simulationResult.components.map((c) => [c.id, c.state]));
    return components.map((c) => ({
      ...c,
      state: stateMap.get(c.id) || c.state,
    }));
  }, [components, simulationResult]);
  const terminalVoltages = simulationResult.terminalVoltages;
  const shortCircuit = simulationResult.shortCircuit;
  const shortCircuitDetails = simulationResult.shortCircuitDetails;
  const shortedWireIds = simulationResult.shortedWireIds || [];
  const trippedBreakerIds = simulationResult.trippedBreakerIds || [];

  // Handler to update an individual component state (e.g. breaker toggled, button pressed, contactor manual toggle)
  const handleUpdateComponentState = useCallback((compId, partialState) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === compId) {
          return {
            ...c,
            state: { ...c.state, ...partialState },
          };
        }
        return c;
      })
    );
  }, []);

  // Short-circuit audio feedback & automatic circuit breaker tripping
  const prevShortCircuitRef = useRef(false);
  useEffect(() => {
    if (shortCircuit && !prevShortCircuitRef.current) {
      sounds.playShortCircuit();
    }
    prevShortCircuitRef.current = shortCircuit;
  }, [shortCircuit]);

  useEffect(() => {
    if (shortCircuit && trippedBreakerIds.length > 0) {
      sounds.playTrip();
      trippedBreakerIds.forEach((bId) => {
        handleUpdateComponentState(bId, { closed: false });
      });
      setToastMessage('⚡ Disjuntor desarmou por curto-circuito!');
    }
  }, [shortCircuit, trippedBreakerIds, handleUpdateComponentState]);

  // ⏱ Real-time loop for Relés Temporizadores (KT): watches coil edges reported by the solver
  // and schedules the delayed contact changeover (RE = on-delay, RD = off-delay).
  const timerRuntimeRef = useRef(new Map()); // id -> { coil, timeoutId }

  useEffect(() => {
    const runtime = timerRuntimeRef.current;

    if (!isSimulationMode) {
      runtime.forEach((r) => clearTimeout(r.timeoutId));
      runtime.clear();
      // Reset any leftover timing flags so the next simulation starts clean
      setComponents((prev) => {
        const needsReset = (c) =>
          c.type === 'timer_relay' &&
          (c.state?.timedOut || c.state?.holding || c.state?.timerStartedAt);
        if (!prev.some(needsReset)) return prev;
        return prev.map((c) =>
          needsReset(c)
            ? { ...c, state: { ...c.state, timedOut: false, holding: false, timerStartedAt: null } }
            : c
        );
      });
      return;
    }

    const seen = new Set();
    for (const c of activeComponents) {
      if (c.type !== 'timer_relay') continue;
      seen.add(c.id);

      const coil = Boolean(c.state?.energized);
      const prev = runtime.get(c.id) || { coil: false, timeoutId: null };
      if (coil === prev.coil) continue;

      clearTimeout(prev.timeoutId);
      const delayMs = Math.max(0.1, Number(c.state?.delay) || 5) * 1000;
      const mode = c.state?.mode || 'ON_DELAY';
      let timeoutId = null;

      if (mode === 'OFF_DELAY') {
        if (coil) {
          // Contacts switch instantly and stay latched while powered
          handleUpdateComponentState(c.id, { holding: true, timerStartedAt: null });
        } else {
          // Coil dropped: hold contacts for T seconds, then release
          handleUpdateComponentState(c.id, { holding: true, timerStartedAt: Date.now() });
          timeoutId = setTimeout(() => {
            handleUpdateComponentState(c.id, { holding: false, timerStartedAt: null });
          }, delayMs);
        }
      } else {
        if (coil) {
          // Coil energized: start counting, contacts switch after T seconds
          handleUpdateComponentState(c.id, { timedOut: false, timerStartedAt: Date.now() });
          timeoutId = setTimeout(() => {
            handleUpdateComponentState(c.id, { timedOut: true, timerStartedAt: null });
          }, delayMs);
        } else {
          // Coil dropped before/after timing: instant reset
          handleUpdateComponentState(c.id, { timedOut: false, timerStartedAt: null });
        }
      }

      runtime.set(c.id, { coil, timeoutId });
    }

    // Forget removed timers
    for (const [id, r] of runtime) {
      if (!seen.has(id)) {
        clearTimeout(r.timeoutId);
        runtime.delete(id);
      }
    }
  }, [activeComponents, isSimulationMode, handleUpdateComponentState]);

  // Clear pending timer timeouts on unmount
  useEffect(() => {
    const runtime = timerRuntimeRef.current;
    return () => runtime.forEach((r) => clearTimeout(r.timeoutId));
  }, []);

  // Handler to quickly disconnect offending short-circuit wires
  const handleClearShortWires = useCallback(() => {
    if (shortedWireIds.length > 0) {
      const shortSet = new Set(shortedWireIds);
      setWires((prev) => prev.filter((w) => !shortSet.has(w.id)));
      setToastMessage('✅ Fios em curto-circuito foram desconectados.');
    }
  }, [shortedWireIds]);

  // Handler to move a component (drag) - moves linked Contactor and Relay, and DIN Rail mounted components in lockstep (blocked in simulation)
  const handleMoveComponent = useCallback((compId, newX, newY) => {
    if (isSimulationMode) return;
    setComponents((prev) => {
      const movingComp = prev.find((c) => c.id === compId);
      if (!movingComp) return prev;

      // 1. Moving a DIN Rail: Move all mounted components (and their linked thermal relays) by (dx, dy)
      if (movingComp.type === 'din_rail') {
        const dx = newX - movingComp.x;
        const dy = newY - movingComp.y;
        if (dx === 0 && dy === 0) return prev;

        const mountedIds = new Set();
        prev.forEach((c) => {
          if (c.dinRailId === compId) {
            mountedIds.add(c.id);
            if (c.type === 'contactor' && c.linkedRelayId) {
              mountedIds.add(c.linkedRelayId);
            }
          }
        });

        return prev.map((c) => {
          if (c.id === compId) return { ...c, x: newX, y: newY };
          if (mountedIds.has(c.id)) {
            return { ...c, x: c.x + dx, y: c.y + dy };
          }
          return c;
        });
      }

      // 2. Moving a Contactor with docked Thermal Relay
      if (movingComp.type === 'contactor' && movingComp.linkedRelayId) {
        const relayId = movingComp.linkedRelayId;
        return prev.map((c) => {
          if (c.id === compId) return { ...c, x: newX, y: newY };
          if (c.id === relayId) return { ...c, x: newX, y: newY + 238 };
          return c;
        });
      }

      // 3. Moving a Thermal Relay with linked Contactor
      if (movingComp.type === 'thermal_relay' && movingComp.linkedContactorId) {
        const contactorId = movingComp.linkedContactorId;
        return prev.map((c) => {
          if (c.id === compId) return { ...c, x: newX, y: newY };
          if (c.id === contactorId) return { ...c, x: newX, y: newY - 238 };
          return c;
        });
      }

      return prev.map((c) => {
        if (c.id === compId) {
          return { ...c, x: newX, y: newY };
        }
        return c;
      });
    });
  }, [isSimulationMode]);

  // Handler to move all components and wires in block (dx, dy from drag start)
  const handleMoveAllComponents = useCallback((dx, dy, initialComponents, initialWires) => {
    if (isSimulationMode) return;
    setComponents((prev) => {
      const initMap = new Map(initialComponents.map((c) => [c.id, c]));
      return prev.map((c) => {
        const init = initMap.get(c.id);
        if (!init) return c;
        return { ...c, x: init.x + dx, y: init.y + dy };
      });
    });
    setWires((prev) => {
      const initWireMap = new Map(initialWires.map((w) => [w.id, w]));
      return prev.map((w) => {
        const init = initWireMap.get(w.id);
        if (!init) return w;
        return {
          ...w,
          fromPoint: init.fromPoint ? { x: init.fromPoint.x + dx, y: init.fromPoint.y + dy } : null,
          toPoint: init.toPoint ? { x: init.toPoint.x + dx, y: init.toPoint.y + dy } : null,
          waypoints: init.waypoints ? init.waypoints.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })) : [],
        };
      });
    });
  }, [isSimulationMode]);

  // Handler to align and distribute all contactors, breakers, and timer relays on or near a DIN Rail
  const handleAlignDinRail = useCallback((railId) => {
    if (isSimulationMode) return;
    setComponents((prev) => {
      const rail = prev.find((c) => c.id === railId);
      if (!rail) return prev;

      const railLength = Math.max(300, Number(rail.state?.length) || 800);
      const railMinX = rail.x;
      const railMaxX = rail.x + railLength;
      const railCenterY = rail.y + 25;

      // Find all mountable components near or assigned to this rail
      const mountableTypes = new Set(['circuit_breaker', 'contactor', 'timer_relay']);
      const candidates = prev.filter((c) => {
        if (!mountableTypes.has(c.type)) return false;
        if (c.dinRailId === railId) return true;

        // Check proximity to rail:
        const compCenterY = c.type === 'circuit_breaker' ? c.y + 109 : c.y + 175;
        const compWidth = c.type === 'circuit_breaker' ? (c.state?.poles || 3) * 52 : c.type === 'timer_relay' ? 120 : 210;
        const isNearY = Math.abs(compCenterY - railCenterY) < 180;
        const isNearX = (c.x + compWidth > railMinX - 80) && (c.x < railMaxX + 80);
        return isNearY && isNearX;
      });

      if (candidates.length === 0) {
        setToastMessage('ℹ️ Nenhum contator ou disjuntor próximo ao trilho para alinhar.');
        setTimeout(() => setToastMessage(null), 2500);
        return prev;
      }

      // Sort candidate components from left to right by their current X position
      const sorted = [...candidates].sort((a, b) => a.x - b.x);

      // Arrange them side-by-side along the rail starting from rail.x + 24
      let currX = rail.x + 24;
      const gap = 16;
      const updatedPositions = new Map();

      sorted.forEach((comp) => {
        const compWidth = comp.type === 'circuit_breaker'
          ? (comp.state?.poles || 3) * 52
          : comp.type === 'timer_relay'
          ? 120
          : 210;

        const targetY = comp.type === 'circuit_breaker'
          ? Math.round(railCenterY - 109)
          : Math.round(railCenterY - 175);

        updatedPositions.set(comp.id, {
          x: currX,
          y: targetY,
          dinRailId: railId,
        });

        // If this is a contactor with a docked thermal relay, update the relay position as well
        if (comp.type === 'contactor' && comp.linkedRelayId) {
          updatedPositions.set(comp.linkedRelayId, {
            x: currX,
            y: targetY + 238,
          });
        }

        currX += compWidth + gap;
      });

      setToastMessage(`⚡ ${sorted.length} componente(s) fixado(s) e alinhado(s) perfeitamente no Trilho DIN!`);
      setTimeout(() => setToastMessage(null), 3000);

      return prev.map((c) => {
        if (updatedPositions.has(c.id)) {
          const pos = updatedPositions.get(c.id);
          return {
            ...c,
            ...pos,
          };
        }
        return c;
      });
    });
  }, [isSimulationMode]);

  // Handler to physically and electrically link Contactor and Thermal Relay together
  const handleLinkComponents = useCallback((contactorId, relayId) => {
    if (isSimulationMode) return;
    try {
      sounds.playButtonClick();
    } catch {}
    setComponents((prev) => {
      const contactor = prev.find((c) => c.id === contactorId);
      const relay = prev.find((c) => c.id === relayId);
      if (!contactor || !relay) return prev;
      if (contactor.linkedRelayId === relayId && relay.linkedContactorId === contactorId) {
        return prev;
      }

      return prev.map((c) => {
        if (c.id === contactorId) {
          return {
            ...c,
            linkedRelayId: relayId,
          };
        }
        if (c.id === relayId) {
          return {
            ...c,
            x: contactor.x,
            y: contactor.y + 238,
            linkedContactorId: contactorId,
          };
        }
        return c;
      });
    });

    // Remove any wires attached to relay top pins 1, 3, 5 since they are now bolted into contactor 2, 4, 6
    setWires((prevWires) =>
      prevWires.filter(
        (w) =>
          !(
            (w.fromComponent === relayId && ['1', '3', '5'].includes(w.fromTerminal)) ||
            (w.toComponent === relayId && ['1', '3', '5'].includes(w.toTerminal))
          )
      )
    );

    setToastMessage('🔗 Contator e Relé Térmico acoplados!');
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Handler to decouple Contactor and Thermal Relay
  const handleUnlinkComponents = useCallback((contactorId, relayId) => {
    if (isSimulationMode) return;
    try {
      sounds.playButtonClick();
    } catch {}
    setComponents((prev) => {
      const contactor = prev.find((c) => c.id === contactorId);
      return prev.map((c) => {
        if (c.id === contactorId) {
          return {
            ...c,
            linkedRelayId: undefined,
          };
        }
        if (c.id === relayId) {
          return {
            ...c,
            linkedContactorId: undefined,
            // Separate downwards by 130px so they are clearly detached with pins visible and don't immediately re-snap
            y: contactor ? contactor.y + 370 : c.y + 130,
          };
        }
        return c;
      });
    });
    setToastMessage('Componentes desvinculados.');
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);


  // Add wire handler (blocked in simulation)
  const handleAddWire = useCallback((newWire) => {
    if (isSimulationMode) return;
    setWires((prev) => [...prev, newWire]);
  }, [isSimulationMode]);

  // Remove wire handler (blocked in simulation)
  const handleRemoveWire = useCallback((wireId) => {
    if (isSimulationMode) return;
    setWires((prev) =>
      prev.filter((w) => w.id !== wireId && w.fromWireId !== wireId && w.toWireId !== wireId)
    );
    setSelectedWireId((cur) => (cur === wireId ? null : cur));
  }, [isSimulationMode]);

  // Update wire handler (blocked in simulation)
  const handleUpdateWire = useCallback((wireId, updates) => {
    if (isSimulationMode) return;
    setWires((prev) =>
      prev.map((w) => (w.id === wireId ? { ...w, ...updates } : w))
    );
  }, [isSimulationMode]);

  const selectedWire = useMemo(
    () => (selectedWireId ? wires.find((w) => w.id === selectedWireId) : null),
    [selectedWireId, wires]
  );

  const handleSelectWireColor = useCallback(
    (color) => {
      setActiveWireColor(color);
      if (selectedWireId && !isSimulationMode) {
        setWires((prev) =>
          prev.map((w) => (w.id === selectedWireId ? { ...w, color } : w))
        );
        sounds.playButtonClick();
      }
    },
    [selectedWireId, isSimulationMode]
  );

  // Handler to save power source configuration (terminals & voltages)
  const handleSavePowerSettings = useCallback((compId, { state, terminals }) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === compId) {
          return {
            ...c,
            state: { ...c.state, ...state },
            terminals,
          };
        }
        return c;
      })
    );

    // Clean any wires attached to terminals that no longer exist
    const newTermIds = new Set(terminals.map((t) => t.id));
    setWires((prev) =>
      prev.filter((w) => {
        if (w.fromComponent === compId && !newTermIds.has(w.fromTerminal)) return false;
        if (w.toComponent === compId && !newTermIds.has(w.toTerminal)) return false;
        return true;
      })
    );
  }, []);

  // Handler to open breaker settings
  const handleOpenBreakerSettings = useCallback((comp) => {
    if (isSimulationMode) return;
    setSelectedBreaker(comp);
    setIsBreakerSettingsOpen(true);
  }, [isSimulationMode]);

  // Handler to save breaker configuration (poles, current, curve)
  const handleSaveBreakerSettings = useCallback((compId, { state, terminals }) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === compId) {
          return {
            ...c,
            state: { ...c.state, ...state },
            terminals,
          };
        }
        return c;
      })
    );

    // Clean any wires attached to terminals that no longer exist
    const newTermIds = new Set(terminals.map((t) => t.id));
    setWires((prev) =>
      prev.filter((w) => {
        if (w.fromComponent === compId && !newTermIds.has(w.fromTerminal)) return false;
        if (w.toComponent === compId && !newTermIds.has(w.toTerminal)) return false;
        return true;
      })
    );

    setToastMessage('✅ Disjuntor reconfigurado com sucesso.');
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Handler to add a new component to canvas (blocked in simulation)
  const handleAddComponent = useCallback((type, posX, posY, displayMode = 'real') => {
    if (isSimulationMode) {
      setToastMessage('⚠️ Alterne para o Modo Edição para adicionar componentes.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    try {
      sounds.playButtonClick();
    } catch {}
    const template = INITIAL_COMPONENTS.find((c) => c.type === type);
    if (!template) return;

    const id = `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const center = viewportCenterRef.current || { x: 350, y: 220 };
    const staggerX = Math.round((Math.random() - 0.5) * 80);
    const staggerY = Math.round((Math.random() - 0.5) * 80);
    const x = posX !== undefined ? posX : Math.round(center.x - 70 + staggerX);
    const y = posY !== undefined ? posY : Math.round(center.y - 70 + staggerY);

    setComponents((prev) => {
      // Find the next available numeric index for this type
      let prefix = 'KM';
      if (type === 'contactor' || type === 'contactor_coil') prefix = 'KM';
      else if (type === 'circuit_breaker') prefix = 'Q';
      else if (type === 'thermal_relay') prefix = 'RT';
      else if (type === 'timer_relay') prefix = 'KT';
      else if (type === 'button_start') prefix = 'S';
      else if (type === 'button_stop') prefix = 'S0';
      else if (type === 'button_emergency') prefix = 'S00';
      else if (type === 'motor_6p') prefix = 'M';
      else if (type === 'pilot_light' || type === 'pilot_lamp') prefix = 'H';
      else if (type === 'power_source') prefix = 'REDE';
      else prefix = template.tag || 'C';

      // Collect existing numbers already in use by components of this type
      const usedNumbers = new Set();
      prev.forEach((c) => {
        if (c.type === type && c.tag) {
          const match = c.tag.match(/(\d+)$/);
          if (match) {
            usedNumbers.add(parseInt(match[1], 10));
          } else if (c.tag === prefix) {
            usedNumbers.add(1);
          }
        }
      });

      let newTag = '';
      if (type === 'button_emergency') {
        const hasS00 = prev.some((c) => c.type === 'button_emergency' && c.tag === 'S00');
        if (!hasS00) {
          newTag = 'S00';
        } else {
          let num = 2;
          while (usedNumbers.has(num)) num++;
          newTag = `S00_${num}`;
        }
      } else if (type === 'button_stop') {
        const hasS0 = prev.some((c) => c.type === 'button_stop' && c.tag === 'S0');
        if (!hasS0) {
          newTag = 'S0';
        } else {
          let num = 1;
          while (prev.some((c) => c.tag === `S0${num}`)) num++;
          newTag = `S0${num}`;
        }
      } else {
        let num = 1;
        while (usedNumbers.has(num)) {
          num++;
        }
        newTag = `${prefix}${num}`;
      }

      const newComp = {
        ...template,
        id,
        tag: newTag,
        name: template.name,
        displayMode: displayMode,
        x,
        y,
        state: { ...template.state, displayMode: displayMode },
        terminals: template.terminals.map((t) => ({ ...t })),
      };

      return [...prev, newComp];
    });

    setToastMessage(`✅ ${template.name || type} adicionado à bancada!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Handler to remove a component and all its attached wires (blocked in simulation)
  const handleRemoveComponent = useCallback((compId) => {
    if (isSimulationMode) return;
    sounds.playButtonClick();
    setComponents((prev) => {
      const target = prev.find((c) => c.id === compId);
      const linkedPartnerId = target?.linkedRelayId || target?.linkedContactorId;
      return prev
        .filter((c) => c.id !== compId)
        .map((c) => {
          let updated = c;
          if (c.id === linkedPartnerId) {
            updated = {
              ...updated,
              linkedRelayId: undefined,
              linkedContactorId: undefined,
            };
          }
          if (c.dinRailId === compId) {
            updated = {
              ...updated,
              dinRailId: undefined,
            };
          }
          return updated;
        });
    });
    setWires((prev) =>
      prev.filter((w) => w.fromComponent !== compId && w.toComponent !== compId)
    );
  }, []);

  // Clear all components (clean workspace)
  const handleClearAll = useCallback(() => {
    if (isSimulationMode) return;
    sounds.playButtonClick();
    setComponents([]);
    setWires([]);
  }, [isSimulationMode]);

  // Load preset handler
  const handleLoadPreset = (presetId) => {
    if (isSimulationMode) return;
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    sounds.playButtonClick();
    prevEnergizedRef.current = new Map();

    if (preset.components) {
      setComponents(
        preset.components.map((c) => ({
          ...c,
          state: {
            ...c.state,
            energized: false,
            tripped: false,
            pressed: false,
            running: false,
            lit: false,
            ...(c.type === 'timer_relay'
              ? { timedOut: false, holding: false, timerStartedAt: null, outputActive: false }
              : {}),
          },
          terminals: c.terminals ? c.terminals.map((t) => ({ ...t })) : [],
        }))
      );
    } else {
      setComponents(
        INITIAL_COMPONENTS.filter((c) => !c.templateOnly).map((c) => ({
          ...c,
          state: { ...c.state, energized: false, tripped: false, pressed: false, running: false },
          terminals: c.terminals.map((t) => ({ ...t })),
        }))
      );
    }

    setWires(preset.wires || []);
    setToastMessage(`⚡ ${preset.title} carregado com sucesso!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const motorComp = activeComponents.find((c) => c.type === 'motor_6p');
  const motorRpm = motorComp?.state?.running ? (motorComp.state.direction === 'CW' ? 1750 : -1750) : 0;
  const isK1Energized = activeComponents.some(
    (c) => c.type === 'contactor' && c.state.energized
  );
  const powerSource = activeComponents.find((c) => c.type === 'power_source');

  const handleUpdateViewportCenter = useCallback((center) => {
    viewportCenterRef.current = center;
  }, []);

  return (
    <div className="app-container eletro-sim-app">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="simulator-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Controls Toolbar */}
      <Header
        activeWireColor={activeWireColor}
        setActiveWireColor={setActiveWireColor}
        selectedWireId={selectedWireId}
        selectedWireColor={selectedWire?.color}
        onSelectWireColor={handleSelectWireColor}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isSimulationMode={isSimulationMode}
        setIsSimulationMode={setIsSimulationMode}
        showElectronFlow={showElectronFlow}
        onToggleElectronFlow={handleToggleElectronFlow}
        onLoadPreset={handleLoadPreset}
        onClearWires={() => !isSimulationMode && setWires([])}
        onClearAll={handleClearAll}
        viewMode={viewMode}
        onChangeViewMode={handleViewModeChange}
        onOpenTheory={() => setIsTheoryOpen(true)}
        onOpenMultimeter={() => setIsMultimeterOpen(true)}
        onAddComponent={handleAddComponent}
      />

      {/* Main Interactive Workbench Canvas */}
      <main className="workbench-main">
        <CanvasErrorBoundary onReset={handleClearAll}>
          <Canvas
            viewMode={viewMode}
            components={activeComponents}
            wires={wires}
            terminalVoltages={terminalVoltages}
            shortCircuit={shortCircuit}
            shortCircuitDetails={shortCircuitDetails}
            shortedWireIds={shortedWireIds}
            onClearShortWires={handleClearShortWires}
            activeWireColor={activeWireColor}
            selectedWireId={selectedWireId}
            onSelectWire={setSelectedWireId}
            showWireVoltageGlow={showWireVoltageGlow}
            showElectronFlow={showElectronFlow}
            onToggleElectronFlow={handleToggleElectronFlow}
            isSimulationMode={isSimulationMode}
            onAddWire={handleAddWire}
            onRemoveWire={handleRemoveWire}
            onUpdateWire={handleUpdateWire}
            onUpdateComponentState={handleUpdateComponentState}
            onMoveComponent={handleMoveComponent}
            onMoveAllComponents={handleMoveAllComponents}
            onLinkComponents={handleLinkComponents}
            onUnlinkComponents={handleUnlinkComponents}
            onOpenPowerSettings={() => !isSimulationMode && setIsPowerSettingsOpen(true)}
            onOpenBreakerSettings={handleOpenBreakerSettings}
            onRemoveComponent={handleRemoveComponent}
            onAddComponent={handleAddComponent}
            onLoadPreset={handleLoadPreset}
            onAlignDinRail={handleAlignDinRail}
            onUpdateViewportCenter={handleUpdateViewportCenter}
          />
        </CanvasErrorBoundary>
      </main>

      {/* Modals */}
      {isPowerSettingsOpen && powerSource && (
        <PowerSourceSettingsModal
          isOpen={isPowerSettingsOpen}
          onClose={() => setIsPowerSettingsOpen(false)}
          component={powerSource}
          onSaveSettings={handleSavePowerSettings}
        />
      )}

      {isBreakerSettingsOpen && selectedBreaker && (
        <BreakerSettingsModal
          isOpen={isBreakerSettingsOpen}
          onClose={() => {
            setIsBreakerSettingsOpen(false);
            setSelectedBreaker(null);
          }}
          component={selectedBreaker}
          onSaveSettings={handleSaveBreakerSettings}
        />
      )}

      {isSchematicOpen && (
        <SchematicModal
          isOpen={isSchematicOpen}
          onClose={() => setIsSchematicOpen(false)}
          components={activeComponents}
          wires={wires}
          terminalVoltages={terminalVoltages}
        />
      )}

      {isTheoryOpen && (
        <TheoryGuideModal
          isOpen={isTheoryOpen}
          onClose={() => setIsTheoryOpen(false)}
        />
      )}

      {isMultimeterOpen && (
        <MultimeterModal
          isOpen={isMultimeterOpen}
          onClose={() => setIsMultimeterOpen(false)}
          components={activeComponents}
          terminalVoltages={terminalVoltages}
        />
      )}
    </div>
  );
}
