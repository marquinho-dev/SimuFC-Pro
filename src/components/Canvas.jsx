import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Unlink, Sun, Moon, Zap, Settings, Trash2, AlignHorizontalJustifyStart, Plus, Minus, Boxes } from 'lucide-react';
import PowerSourceElement from './elements/PowerSourceElement';
import ContactorElement from './elements/ContactorElement';
import ThermalRelayElement from './elements/ThermalRelayElement';
import TimerRelayElement from './elements/TimerRelayElement';
import Motor6PElement from './elements/Motor6PElement';
import BreakerElement from './elements/BreakersElement';
import { ButtonStopElement, ButtonStartElement, ButtonEmergencyElement } from './elements/ButtonsElement';
import PilotLampElement from './elements/PilotLampsElement';
import DinRailElement from './elements/DinRailElement';
import SchematicElement from './elements/SchematicElement';
import { TIMER_RELAY_TERMINALS, getBreakerTerminals, SCHEMATIC_SOURCE_BUSES, SCHEMATIC_SOURCE_BUS_X_END } from '../types/components';
import { sounds } from '../services/soundEffects';
import {
  computeAutoRoute,
  buildWirePathWithJumps,
  simplifyOrthogonalPoints,
  ensureOrthogonalPath,
  splitSegmentForDrag,
  dragOrthogonalSegment,
  getClosestPointOnWire,
  getTerminalExitVector,
} from '../services/wireRouter';


function WireFerrulePlug({ pt, nextPt, wireColor }) {
  if (!pt || !nextPt) return null;
  const dx = nextPt.x - pt.x;
  const dy = nextPt.y - pt.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const ux = dx / len;
  const uy = dy / len;
  const angleDeg = Math.atan2(uy, ux) * (180 / Math.PI) - 90;

  return (
    <g
      className="wire-ferrule-terminal"
      transform={`translate(${pt.x}, ${pt.y}) rotate(${angleDeg})`}
      pointerEvents="none"
    >
      {/* Sombra realista sob o terminal tipo ilhós */}
      <rect
        x="-4"
        y="2"
        width="8"
        height="14"
        rx="2.5"
        fill="rgba(0,0,0,0.35)"
        transform="translate(1.2, 1.5)"
      />
      {/* Pino metálico condutor inserido no borne/socket */}
      <rect
        x="-1.6"
        y="-3.5"
        width="3.2"
        height="8"
        rx="1"
        fill="#cbd5e1"
        stroke="#475569"
        strokeWidth="0.6"
      />
      {/* Capa/Sleeve isolante crimpada (Ilhós tubular pré-isolado) */}
      <rect
        x="-4.2"
        y="2.5"
        width="8.4"
        height="14"
        rx="2.5"
        fill={wireColor || '#38bdf8'}
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="0.8"
      />
      {/* Frisos/ranhuras anatômicas para empunhadura manual */}
      <line x1="-3.2" y1="6" x2="3.2" y2="6" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" />
      <line x1="-3.2" y1="9.5" x2="3.2" y2="9.5" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" />
      <line x1="-3.2" y1="13" x2="3.2" y2="13" stroke="rgba(0,0,0,0.35)" strokeWidth="0.9" />
      {/* Brilho longitudinal cilíndrico */}
      <line
        x1="-2.2"
        y1="4.5"
        x2="-2.2"
        y2="14.5"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </g>
  );
}

function WireTerminalCageEntry({ pt, nextPt, wireColor }) {
  if (!pt || !nextPt) return null;
  const dx = nextPt.x - pt.x;
  const dy = nextPt.y - pt.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const ux = dx / len;
  const uy = dy / len;
  const angleDeg = Math.atan2(uy, ux) * (180 / Math.PI) - 90;

  return (
    <g
      className="wire-terminal-cage-entry"
      transform={`translate(${pt.x}, ${pt.y}) rotate(${angleDeg})`}
      pointerEvents="none"
    >
      {/* Sombra de profundidade do interior do borne */}
      <rect
        x="-7.5"
        y="-6.5"
        width="15"
        height="12"
        rx="2.5"
        fill="#050811"
        stroke="#1e293b"
        strokeWidth="0.8"
      />
      {/* Placa metálica interna do grampo / cage clamp do borne */}
      <rect
        x="-5.5"
        y="-5"
        width="11"
        height="3"
        rx="0.6"
        fill="#475569"
        stroke="#334155"
        strokeWidth="0.4"
      />
      {/* Ponteira metálica estanhada do condutor prensada na gaiola */}
      <rect
        x="-2"
        y="-4"
        width="4"
        height="4.5"
        rx="0.6"
        fill="#cbd5e1"
        stroke="#64748b"
        strokeWidth="0.4"
      />
      {/* Cabo isolado adentrando a abertura da cavidade do borne */}
      <rect
        x="-2.7"
        y="-1"
        width="5.4"
        height="8"
        rx="1"
        fill={wireColor || '#38bdf8'}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.6"
      />
      {/* Moldura plástica frontal da boca do borne que sobrepõe o cabo (dando o efeito realista de inserção DENTRO do orifício) */}
      <path
        d="M -7.5 -1.5 L -7.5 4 L -3.4 4 L -3.4 1.5 L 3.4 1.5 L 3.4 4 L 7.5 4 L 7.5 -1.5 Z"
        fill="#1e2638"
        stroke="#0b111e"
        strokeWidth="0.8"
      />
      {/* Sombra de oclusão projetada pelo teto da cavidade do borne diretamente sobre o cabo inserido */}
      <rect
        x="-2.7"
        y="-1"
        width="5.4"
        height="2.4"
        fill="rgba(0,0,0,0.7)"
      />
    </g>
  );
}

function WireMotorRingLug({ pt, nextPt, wireColor }) {
  if (!pt || !nextPt) return null;
  const dx = nextPt.x - pt.x;
  const dy = nextPt.y - pt.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const ux = dx / len;
  const uy = dy / len;
  const angleDeg = Math.atan2(uy, ux) * (180 / Math.PI) - 90;

  return (
    <g className="wire-motor-ring-lug-composite" pointerEvents="none">
      {/* 1. Terminal Olhal Crimpado (rotacionado na direção do condutor) */}
      <g transform={`translate(${pt.x}, ${pt.y}) rotate(${angleDeg})`}>
        {/* Sombra de projeção da luva e cabo */}
        <circle cx="0" cy="0" r="14" fill="rgba(0,0,0,0.35)" transform="translate(1, 1.5)" />
        <rect x="-4.5" y="4" width="9" height="15" rx="2" fill="rgba(0,0,0,0.3)" transform="translate(1, 1.5)" />

        {/* Disco metálico estanhado do olhal */}
        <circle cx="0" cy="0" r="13.5" fill="#cbd5e1" stroke="#000000" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="12" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

        {/* Haste estampada de transição para o cano de prensagem */}
        <polygon points="-4,4 4,4 5.2,11 -5.2,11" fill="#cbd5e1" stroke="#000000" strokeWidth="1.2" />

        {/* Luva metálica tubular de compressão (crimp barrel sleeve) */}
        <rect x="-4.5" y="9" width="9" height="10" rx="2" fill="#e2e8f0" stroke="#000000" strokeWidth="1.2" />
        <line x1="-3.5" y1="12" x2="3.5" y2="12" stroke="#475569" strokeWidth="1.2" />
        <line x1="-3.5" y1="15" x2="3.5" y2="15" stroke="#475569" strokeWidth="1.2" />
        <line x1="-2" y1="9.5" x2="-2" y2="18.5" stroke="#ffffff" strokeWidth="0.9" opacity="0.8" />

        {/* Cabo entrando na luva com isolamento visível */}
        <rect
          x="-3.6"
          y="17"
          width="7.2"
          height="6"
          rx="1.5"
          fill={wireColor || '#38bdf8'}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.8"
        />
      </g>

      {/* 2. Porca Sextavada de Aço Usinado prensando o olhal por cima (idêntica ao design do gemini-svg.svg) */}
      <g transform={`translate(${pt.x}, ${pt.y})`}>
        {/* Hexagonal Nut with rounded corners */}
        <polygon
          points="0,-12.5 10.82,-6.25 10.82,6.25 0,12.5 -10.82,6.25 -10.82,-6.25"
          fill="url(#silverNut)"
          stroke="#4a5259"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Inner circular beveling / indentation */}
        <circle r="9.8" fill="url(#nutBevel)" />
        <circle r="9.3" fill="none" stroke="#5a6570" strokeWidth="0.5" />
        {/* Inner threaded ring area */}
        <circle r="6.8" fill="url(#silverNut)" stroke="#3a4249" strokeWidth="1" />
        <circle r="5.2" fill="none" stroke="#9ba4ad" strokeWidth="0.6" />
        {/* Center Bolt */}
        <circle r="4.2" fill="#dadddf" stroke="#68737d" strokeWidth="0.8" />
      </g>
    </g>
  );
}

function findCompTerminal(comp, termId) {
  if (!comp) return null;
  let t = comp.terminals?.find((x) => x.id === termId);
  if (!t && (comp.type === 'circuit_breaker' || comp.type === 'breaker_3p' || comp.type === 'breaker_1p')) {
    const poles = Number(comp.state?.poles) || 3;
    t = getBreakerTerminals(poles).find((x) => x.id === termId);
  }
  if (!t && comp.type === 'timer_relay') {
    t = TIMER_RELAY_TERMINALS[termId];
  }
  return t || null;
}

export default function Canvas({
  viewMode = 'real',
  components,
  wires,
  terminalVoltages,
  shortCircuit,
  shortCircuitDetails,
  shortedWireIds = [],
  onClearShortWires,
  activeWireColor,
  showWireVoltageGlow,
  showElectronFlow = true,
  onToggleElectronFlow,
  isSimulationMode = false,
  selectedWireId: controlledSelectedWireId,
  onSelectWire,
  onAddWire,
  onRemoveWire,
  onUpdateWire,
  onUpdateComponentState,
  onMoveComponent,
  onMoveAllComponents,
  onLinkComponents,
  onUnlinkComponents,
  onOpenPowerSettings,
  onOpenBreakerSettings,
  onRemoveComponent,
  onAddComponent,
  onLoadPreset,
  onAlignDinRail,
  onUpdateViewportCenter,
}) {
  const containerRef = useRef(null);
  const boardRef = useRef(null);

  // Zoom and Pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Select All Components state
  const [isAllSelected, setIsAllSelected] = useState(false);
  const isAllSelectedRef = useRef(false);
  const multiDragStartRef = useRef(null);

  // Magnetic docking snap state & indicator
  const [snapTarget, setSnapTarget] = useState(null);
  const snapTargetRef = useRef(null);
  const resizingRailRef = useRef(null);

  // Persistent refs for zero-latency dragging without re-attaching event listeners
  const isPanningRef = useRef(false);
  const draggedCompIdRef = useRef(null);
  const dragMovedRef = useRef(false);
  const draggingSegmentRef = useRef(null);
  const draggingWaypointRef = useRef(null);
  const draggingSpliceRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const componentsRef = useRef(components);
  const wiresRef = useRef(wires);
  const wiresPointListsRef = useRef([]);
  const onMoveComponentRef = useRef(onMoveComponent);
  const onMoveAllComponentsRef = useRef(onMoveAllComponents);
  const onUpdateWireRef = useRef(onUpdateWire);
  const onUpdateComponentStateRef = useRef(onUpdateComponentState);
  const onLinkComponentsRef = useRef(onLinkComponents);
  const onUnlinkComponentsRef = useRef(onUnlinkComponents);

  // Keep refs synchronized after render
  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
    componentsRef.current = components;
    wiresRef.current = wires;
    onMoveComponentRef.current = onMoveComponent;
    onMoveAllComponentsRef.current = onMoveAllComponents;
    onUpdateWireRef.current = onUpdateWire;
    onUpdateComponentStateRef.current = onUpdateComponentState;
    onLinkComponentsRef.current = onLinkComponents;
    onUnlinkComponentsRef.current = onUnlinkComponents;
    isAllSelectedRef.current = isAllSelected;
  });

  // Wiring states
  // connectingTerminal can be { componentId, terminalId } OR { wireId, point: {x,y} }
  const [connectingTerminal, setConnectingTerminal] = useState(null);
  const [connectingWaypoints, setConnectingWaypoints] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Selected & Hovered states
  const [internalSelectedWireId, setInternalSelectedWireId] = useState(null);
  const selectedWireId =
    controlledSelectedWireId !== undefined
      ? controlledSelectedWireId
      : internalSelectedWireId;
  const setSelectedWireId = useCallback(
    (idOrFn) => {
      const nextId =
        typeof idOrFn === 'function' ? idOrFn(selectedWireId) : idOrFn;
      if (onSelectWire) onSelectWire(nextId);
      setInternalSelectedWireId(nextId);
    },
    [onSelectWire, selectedWireId]
  );
  const [hoveredWireId, setHoveredWireId] = useState(null);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  // Dragging state (for component active elevation / styling)
  const [draggedCompId, setDraggedCompId] = useState(null);

  // Convert screen mouse coordinates (clientX, clientY) into canvas board coordinates
  const screenToCanvas = useCallback(
    (clientX, clientY) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const curZoom = zoomRef.current || 1;
      const curPan = panRef.current || { x: 0, y: 0 };
      return {
        x: (screenX - curPan.x) / curZoom,
        y: (screenY - curPan.y) / curZoom,
      };
    },
    []
  );

  // Calculate the canvas board coordinate that sits at the center of the visible container
  const getViewportCenterCanvas = useCallback(() => {
    if (!containerRef.current) return { x: 450, y: 250 };
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : 1200;
    const h = rect.height > 0 ? rect.height : 800;
    return {
      x: Math.round((w / 2 - pan.x) / zoom),
      y: Math.round((h / 2 - pan.y) / zoom),
    };
  }, [pan, zoom]);

  // Smooth balanced zoom centered on container center (prevents drifting sideways)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const zoomFactor = e.deltaY < 0 ? 1.09 : 0.917;
      const curZoom = zoomRef.current || 1;
      const curPan = panRef.current || { x: 0, y: 0 };

      const newZoom = Math.min(2.5, Math.max(0.35, Number((curZoom * zoomFactor).toFixed(3))));
      if (newZoom === curZoom) return;

      const newPan = {
        x: Math.round(centerX - (centerX - curPan.x) * (newZoom / curZoom)),
        y: Math.round(centerY - (centerY - curPan.y) * (newZoom / curZoom)),
      };

      setZoom(newZoom);
      setPan(newPan);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Keep parent informed of the visible canvas center point so header actions add components directly into view
  useEffect(() => {
    if (onUpdateViewportCenter && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : 1200;
      const h = rect.height > 0 ? rect.height : 800;
      onUpdateViewportCenter({
        x: Math.round((w / 2 - pan.x) / zoom),
        y: Math.round((h / 2 - pan.y) / zoom),
      });
    }
  }, [pan.x, pan.y, zoom, onUpdateViewportCenter]);

  // Keyboard shortcuts: Escape to cancel, Ctrl+A to select all components, Delete/Backspace to delete selected wire
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when user is typing in form controls
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // Ctrl+A / Cmd+A: Select all components for block dragging
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAllSelected(true);
        setSelectedComponentId(null);
        setSelectedWireId(null);
        return;
      }

      if (e.key === 'Escape') {
        setIsAllSelected(false);
        setConnectingTerminal(null);
        setConnectingWaypoints([]);
        draggingWaypointRef.current = null;
        draggingSegmentRef.current = null;
        draggedCompIdRef.current = null;
        setDraggedCompId(null);
        snapTargetRef.current = null;
        setSnapTarget(null);
        setSelectedWireId(null);
        setSelectedComponentId(null);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isSimulationMode) return;
        if (selectedWireId) {
          sounds.playButtonClick();
          onRemoveWire(selectedWireId);
          setSelectedWireId(null);
          setHoveredWireId(null);
        } else if (selectedComponentId) {
          sounds.playButtonClick();
          onRemoveComponent(selectedComponentId);
          setSelectedComponentId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWireId, selectedComponentId, isSimulationMode, onRemoveWire, onRemoveComponent]);

  // Exact pixel center of any terminal borne directly from coordinates (pure and instant)
  const getTerminalAbsolutePos = useCallback(
    (compId, termId) => {
      const comp = components.find((c) => c.id === compId);
      if (!comp) return { x: 0, y: 0 };
      let term = comp.terminals?.find((t) => t.id === termId);
      if (!term && (comp.type === 'circuit_breaker' || comp.type === 'breaker_3p' || comp.type === 'breaker_1p')) {
        const poles = Number(comp.state?.poles) || 3;
        term = getBreakerTerminals(poles).find((t) => t.id === termId);
      }
      if (!term) return { x: Math.round(comp.x + 50), y: Math.round(comp.y + 50) };

      const isCompSchematic =
        comp.displayMode === 'schematic' || comp.state?.displayMode === 'schematic' || viewMode === 'schematic';
      if (isCompSchematic) {
        if (comp.type === 'power_source') {
          const bus = SCHEMATIC_SOURCE_BUSES[termId] ||
            (termId.startsWith('L1') ? SCHEMATIC_SOURCE_BUSES.L1 :
             termId.startsWith('L2') ? SCHEMATIC_SOURCE_BUSES.L2 :
             termId.startsWith('L3') ? SCHEMATIC_SOURCE_BUSES.L3 :
             termId.startsWith('N')  ? SCHEMATIC_SOURCE_BUSES.N  :
             termId.startsWith('PE') ? SCHEMATIC_SOURCE_BUSES.PE : null);
          if (bus) {
            return {
              x: Math.round(comp.x + SCHEMATIC_SOURCE_BUS_X_END),
              y: Math.round(comp.y + bus.y),
            };
          }
        } else if (comp.type === 'circuit_breaker' || comp.type === 'breaker_3p' || comp.type === 'breaker_1p') {
          const poleIdx = Math.floor((parseInt(termId, 10) - 1) / 2);
          const isTop = (parseInt(termId, 10) % 2) === 1;
          const xc = Math.round(57.5 + poleIdx * 56);
          const yc = isTop ? 60 : 170.5;
          return {
            x: Math.round(comp.x + xc),
            y: Math.round(comp.y + yc),
          };
        } else if (comp.type === 'contactor') {
          if (['1', '2', '3', '4', '5', '6'].includes(termId)) {
            const poleIdx = Math.floor((parseInt(termId, 10) - 1) / 2);
            const isTop = (parseInt(termId, 10) % 2) === 1;
            const xc = Math.round(49.5 + poleIdx * 56);
            const yc = isTop ? 60 : 170.5;
            return {
              x: Math.round(comp.x + xc),
              y: Math.round(comp.y + yc),
            };
          }
        }
      }

      let tx = term.x;
      let ty = term.y;
      if (comp.type === 'power_source') {
        if (term) {
          tx = term.x;
          ty = term.y;
        } else if (termId.startsWith('L1') || termId === 'X1') { tx = 185; ty = 156; }
        else if (termId.startsWith('L2') || termId === 'X2') { tx = 234; ty = 156; }
        else if (termId.startsWith('L3') || termId === 'X3') { tx = 285; ty = 156; }
        else if (termId.startsWith('N') || termId === 'X0') { tx = 134; ty = 156; }
        else if (termId.startsWith('PE')) { tx = 72; ty = 375; }
      } else if (comp.type === 'button_start') {
        if (termId === '3' || termId === '13') { tx = 46; ty = 27; }
        else if (termId === '4' || termId === '14') { tx = 90; ty = 27; }
        else if (termId === '13_bot') { tx = 46; ty = 143; }
        else if (termId === '14_bot') { tx = 90; ty = 143; }
      } else if (comp.type === 'button_stop') {
        if (termId === '1' || termId === '11') { tx = 46; ty = 27; }
        else if (termId === '2' || termId === '12') { tx = 90; ty = 27; }
        else if (termId === '11_bot' || termId === '1_bot') { tx = 46; ty = 143; }
        else if (termId === '12_bot' || termId === '2_bot') { tx = 90; ty = 143; }
      } else if (comp.type === 'button_emergency') {
        // Emergency stop has top center socket (11 NF) and bottom center socket (12 NF)
        if (termId === '1' || termId === '11' || termId === '11_bot') { tx = 68; ty = 18; }
        else if (termId === '2' || termId === '12' || termId === '12_bot') { tx = 68; ty = 150; }
        else { tx = term.x ?? 68; ty = term.y ?? 18; }
      } else if (comp.type === 'timer_relay') {
        const config = TIMER_RELAY_TERMINALS[termId];
        if (config) {
          tx = config.x;
          ty = config.y;
        } else {
          const t = comp.terminals?.find((x) => x.id === termId);
          if (t) { tx = t.x; ty = t.y; }
        }
      } else if (comp.type === 'motor_6p') {
        if (isCompSchematic) {
          if (termId === 'U1') { tx = 80; ty = 35; }
          else if (termId === 'V1') { tx = 140; ty = 35; }
          else if (termId === 'W1') { tx = 200; ty = 35; }
          else if (termId === 'W2') { tx = 80; ty = 245; }
          else if (termId === 'U2') { tx = 140; ty = 245; }
          else if (termId === 'V2') { tx = 200; ty = 245; }
          else if (termId === 'PE') { tx = 36; ty = 180; }
        } else {
          if (termId === 'W2') { tx = 73; ty = 135; }
          else if (termId === 'U2') { tx = 127; ty = 135; }
          else if (termId === 'V2') { tx = 182; ty = 135; }
          else if (termId === 'U1') { tx = 73; ty = 224; }
          else if (termId === 'V1') { tx = 127; ty = 224; }
          else if (termId === 'W1') { tx = 182; ty = 224; }
          else if (termId === 'PE') { tx = 211; ty = 179; }
        }
      }

      return {
        x: Math.round(comp.x + tx),
        y: Math.round(comp.y + ty),
      };
    },
    [components]
  );

  // Compute all polyline points for each wire (supports terminal-to-terminal, wire-to-terminal, wire-to-wire, and busbar taps)
  const wiresPointLists = useMemo(() => {
    return wires.map((wire, idx) => {
      const comp1 = wire.fromComponent ? components.find((c) => c.id === wire.fromComponent) : null;
      const comp2 = wire.toComponent ? components.find((c) => c.id === wire.toComponent) : null;

      const p1 =
        wire.fromWireId && wire.fromPoint
          ? wire.fromPoint
          : (wire.fromTerminalX != null && wire.fromTerminalY != null && comp1
              ? { x: Math.round(comp1.x + wire.fromTerminalX), y: Math.round(comp1.y + wire.fromTerminalY) }
              : (wire.fromTerminalX != null && comp1
                  ? { x: Math.round(comp1.x + wire.fromTerminalX), y: getTerminalAbsolutePos(wire.fromComponent, wire.fromTerminal).y }
                  : getTerminalAbsolutePos(wire.fromComponent, wire.fromTerminal)));

      const p2 =
        wire.toWireId && wire.toPoint
          ? wire.toPoint
          : (wire.toTerminalX != null && wire.toTerminalY != null && comp2
              ? { x: Math.round(comp2.x + wire.toTerminalX), y: Math.round(comp2.y + wire.toTerminalY) }
              : (wire.toTerminalX != null && comp2
                  ? { x: Math.round(comp2.x + wire.toTerminalX), y: getTerminalAbsolutePos(wire.toComponent, wire.toTerminal).y }
                  : getTerminalAbsolutePos(wire.toComponent, wire.toTerminal)));

      const term1 = findCompTerminal(comp1, wire.fromTerminal);
      const term2 = findCompTerminal(comp2, wire.toTerminal);
      const exit1 = getTerminalExitVector(term1, comp1);
      const exit2 = getTerminalExitVector(term2, comp2);

      let waypoints = wire.waypoints;
      
      // Auto-recalculate route ONLY if:
      // 1) Wire has no custom routing, AND
      // 2) Wire has no waypoints OR either connected component is currently being moved
      const isCustom = Boolean(wire.isCustomRouted && waypoints && waypoints.length > 0);
      const isConnectedToMovingComp = Boolean(
        draggedCompId &&
        (wire.fromComponent === draggedCompId || wire.toComponent === draggedCompId)
      );

      const shouldAutoRoute =
        !isCustom && (isConnectedToMovingComp || !waypoints || waypoints.length === 0);

      if (shouldAutoRoute && wire.fromComponent && wire.toComponent && comp1 && comp2) {
        waypoints = computeAutoRoute(p1, p2, comp1, comp2, term1, term2, idx, components);
      } else if (!waypoints || waypoints.length === 0) {
        // Fallback clean orthogonal step
        waypoints = [
          { x: p1.x, y: Math.round((p1.y + p2.y) / 2) },
          { x: p2.x, y: Math.round((p1.y + p2.y) / 2) },
        ];
      }

      // Ensure every wire is 100% strictly orthogonal (90-deg angles, never diagonal or slanted)
      return ensureOrthogonalPath([p1, ...waypoints, p2], exit1, exit2);
    });
  }, [wires, components, getTerminalAbsolutePos, draggedCompId]);

  // Extract all electrical splice/junction points between wires and busbars so we don't draw bridge jumps over them
  const allJunctionPoints = useMemo(() => {
    const list = [];
    for (const w of wires) {
      if (w.fromPoint) list.push(w.fromPoint);
      if (w.toPoint) list.push(w.toPoint);
      const comp1 = w.fromComponent ? components.find((c) => c.id === w.fromComponent) : null;
      if (comp1?.type === 'power_source') {
        list.push(
          w.fromTerminalX != null
            ? { x: Math.round(comp1.x + w.fromTerminalX), y: getTerminalAbsolutePos(w.fromComponent, w.fromTerminal).y }
            : getTerminalAbsolutePos(w.fromComponent, w.fromTerminal)
        );
      }
      const comp2 = w.toComponent ? components.find((c) => c.id === w.toComponent) : null;
      if (comp2?.type === 'power_source') {
        list.push(
          w.toTerminalX != null
            ? { x: Math.round(comp2.x + w.toTerminalX), y: getTerminalAbsolutePos(w.toComponent, w.toTerminal).y }
            : getTerminalAbsolutePos(w.toComponent, w.toTerminal)
        );
      }
    }
    return list;
  }, [wires, components, getTerminalAbsolutePos]);

  useEffect(() => {
    wiresPointListsRef.current = wiresPointLists;
  }, [wiresPointLists]);

  // Window-level unified pointer listeners registered ONCE on mount for indestructible smooth dragging & panning
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      // 1. Panning the entire canvas
      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPan({
          x: Math.round(panStartRef.current.panX + dx),
          y: Math.round(panStartRef.current.panY + dy),
        });
        return;
      }

      // Calculate canvas coordinates using up-to-date refs
      const curZoom = zoomRef.current || 1;
      const curPan = panRef.current || { x: 0, y: 0 };
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const canvasPos = {
        x: (e.clientX - rect.left - curPan.x) / curZoom,
        y: (e.clientY - rect.top - curPan.y) / curZoom,
      };

      // 1.5 Resizing a DIN Rail
      if (resizingRailRef.current) {
        const { railId, startClientX, initialLength } = resizingRailRef.current;
        const deltaClientX = (e.clientX - startClientX) / (zoomRef.current || 1);
        const newLen = Math.max(300, Math.min(2200, Math.round(initialLength + deltaClientX)));
        if (onUpdateComponentStateRef.current) {
          onUpdateComponentStateRef.current(railId, { length: newLen });
        }
        return;
      }

      setMousePos(canvasPos);

      // 2. Dragging a component (or all components if isAllSelected)
      if (draggedCompIdRef.current) {
        if (!dragMovedRef.current) {
          dragMovedRef.current = true;
          setDraggedCompId(draggedCompIdRef.current);
        }
        if (isAllSelectedRef.current && multiDragStartRef.current) {
          const { startCanvasPos, initialComponents, initialWires } = multiDragStartRef.current;
          const dx = Math.round(canvasPos.x - startCanvasPos.x);
          const dy = Math.round(canvasPos.y - startCanvasPos.y);
          if (onMoveAllComponentsRef.current) {
            onMoveAllComponentsRef.current(dx, dy, initialComponents, initialWires);
          }
          return;
        }

        let newX = Math.round(canvasPos.x - dragOffsetRef.current.x);
        let newY = Math.round(canvasPos.y - dragOffsetRef.current.y);

        const draggedComp = componentsRef.current.find((c) => c.id === draggedCompIdRef.current);
        if (draggedComp) {
          const isLinked = draggedComp.linkedRelayId || draggedComp.linkedContactorId;
          if (!isLinked) {
            // Magnetic snapping when Thermal Relay approaches Contactor
            if (draggedComp.type === 'thermal_relay') {
              const targetContactor = componentsRef.current.find(
                (c) => c.type === 'contactor' && !c.linkedRelayId
              );
              if (targetContactor) {
                const dockX = targetContactor.x;
                const dockY = targetContactor.y + 238;
                // Snapping occurs when user drags relay up and the copper pins are entering/hiding under the contactor
                const isHorizontallyAligned = Math.abs(newX - dockX) < 45;
                const isCoveringPins = newY >= targetContactor.y + 190 && newY <= targetContactor.y + 295;
                if (isHorizontallyAligned && isCoveringPins) {
                  newX = dockX;
                  newY = dockY;
                  snapTargetRef.current = { contactorId: targetContactor.id, relayId: draggedComp.id };
                  setSnapTarget({ x: dockX, y: dockY, width: 210, height: 355 });
                } else if (snapTargetRef.current) {
                  snapTargetRef.current = null;
                  setSnapTarget(null);
                }
              }
            } else if (draggedComp.type === 'contactor') {
              // Magnetic snapping when Contactor approaches Thermal Relay
              const targetRelay = componentsRef.current.find(
                (c) => c.type === 'thermal_relay' && !c.linkedContactorId
              );
              if (targetRelay) {
                const dockX = targetRelay.x;
                const dockY = targetRelay.y - 238;
                const isHorizontallyAligned = Math.abs(newX - dockX) < 45;
                const isCoveringPins = newY >= targetRelay.y - 295 && newY <= targetRelay.y - 190;
                if (isHorizontallyAligned && isCoveringPins) {
                  newX = dockX;
                  newY = dockY;
                  snapTargetRef.current = { contactorId: draggedComp.id, relayId: targetRelay.id };
                  setSnapTarget({ x: dockX, y: dockY, width: 210, height: 350 });
                } else if (snapTargetRef.current) {
                  snapTargetRef.current = null;
                  setSnapTarget(null);
                }
              }
            }
          }

          // DIN Rail Magnetic Snapping & Alignment
          if (
            draggedComp.type === 'contactor' ||
            draggedComp.type === 'circuit_breaker' ||
            draggedComp.type === 'timer_relay'
          ) {
            const compWidth =
              draggedComp.type === 'circuit_breaker'
                ? (draggedComp.state?.poles || 3) * 52
                : draggedComp.type === 'timer_relay'
                ? 120
                : 210;
            const compHeight = draggedComp.type === 'circuit_breaker' ? 218 : 350;

            const dinRails = componentsRef.current.filter((c) => c.type === 'din_rail');
            let snappedToRail = false;

            for (const rail of dinRails) {
              const railLength = Math.max(300, Number(rail.state?.length) || 800);
              const railCenterY = rail.y + 25;
              const targetY =
                draggedComp.type === 'circuit_breaker'
                  ? Math.round(railCenterY - 109)
                  : Math.round(railCenterY - 175);

              const isWithinY = Math.abs(newY - targetY) < 45;
              const isWithinX =
                newX + compWidth > rail.x - 20 && newX < rail.x + railLength + 20;

              if (isWithinY && isWithinX) {
                newY = targetY; // Snapped vertically to the rail centerline!

                // Check magnetic snap to rail left margin
                if (Math.abs(newX - (rail.x + 24)) < 24) {
                  newX = rail.x + 24;
                } else {
                  // Check magnetic snap side-by-side with other components on this rail
                  const otherComps = componentsRef.current.filter(
                    (c) =>
                      c.id !== draggedComp.id &&
                      (c.type === 'contactor' ||
                        c.type === 'circuit_breaker' ||
                        c.type === 'timer_relay') &&
                      Math.abs(
                        (c.type === 'circuit_breaker' ? c.y + 109 : c.y + 175) - railCenterY
                      ) < 20
                  );

                  for (const other of otherComps) {
                    const otherW =
                      other.type === 'circuit_breaker'
                        ? (other.state?.poles || 3) * 52
                        : other.type === 'timer_relay'
                        ? 120
                        : 210;
                    if (Math.abs(newX - (other.x + otherW + 16)) < 22) {
                      newX = other.x + otherW + 16;
                      break;
                    }
                    if (Math.abs(newX - (other.x - compWidth - 16)) < 22) {
                      newX = other.x - compWidth - 16;
                      break;
                    }
                  }
                }

                snapTargetRef.current = {
                  isDinRail: true,
                  compId: draggedComp.id,
                  railId: rail.id,
                  x: newX,
                  y: newY,
                  width: compWidth,
                  height: compHeight,
                };
                setSnapTarget({
                  isDinRail: true,
                  x: newX,
                  y: newY,
                  width: compWidth,
                  height: compHeight,
                });
                snappedToRail = true;
                break;
              }
            }

            if (!snappedToRail && snapTargetRef.current?.isDinRail) {
              snapTargetRef.current = null;
              setSnapTarget(null);
            }
          }
        }

        if (onMoveComponentRef.current) {
          onMoveComponentRef.current(draggedCompIdRef.current, newX, newY);
        }
        return;
      }

      // 3. Dragging an orthogonal wire segment
      if (draggingSegmentRef.current && onUpdateWireRef.current) {
        const { wireId, segIdx, initialPoints, startCanvasPos } = draggingSegmentRef.current;
        const dx = canvasPos.x - startCanvasPos.x;
        const dy = canvasPos.y - startCanvasPos.y;
        const updatedPts = dragOrthogonalSegment(initialPoints, segIdx, dx, dy);
        onUpdateWireRef.current(wireId, { waypoints: updatedPts.slice(1, -1), isCustomRouted: true });
        return;
      }

      // 4. Dragging a wire waypoint
      if (draggingWaypointRef.current && onUpdateWireRef.current) {
        const { wireId, index } = draggingWaypointRef.current;
        const targetWireIndex = wiresRef.current.findIndex((w) => w.id === wireId);
        if (targetWireIndex !== -1) {
          const pts = wiresPointListsRef.current[targetWireIndex];
          if (pts) {
            const currentWaypoints = pts.slice(1, -1).map((pt) => ({ ...pt }));
            currentWaypoints[index] = {
              x: Math.round(canvasPos.x),
              y: Math.round(canvasPos.y),
            };
            onUpdateWireRef.current(wireId, { waypoints: currentWaypoints, isCustomRouted: true });
          }
        }
      }

      // 5. Dragging a wire-to-wire junction splice along target wire
      if (draggingSpliceRef.current && onUpdateWireRef.current) {
        const { wireId, isFrom, targetWireId } = draggingSpliceRef.current;
        const targetWireIndex = wiresRef.current.findIndex((w) => w.id === targetWireId);
        if (targetWireIndex !== -1) {
          const targetPts = wiresPointListsRef.current[targetWireIndex];
          if (targetPts && targetPts.length >= 2) {
            const closest = getClosestPointOnWire(targetPts, canvasPos.x, canvasPos.y);
            if (closest && closest.point) {
              const childIdx = wiresRef.current.findIndex((w) => w.id === wireId);
              const childPts = wiresPointListsRef.current[childIdx];
              const childWire = wiresRef.current[childIdx];

              if (isFrom) {
                // Moving p1 (fromPoint)
                const otherEnd = childPts ? childPts[childPts.length - 1] : { x: 0, y: 0 };
                let newWaypoints;
                if (childWire?.waypoints && childWire.waypoints.length > 0) {
                  const updatedOrth = ensureOrthogonalPath([closest.point, ...childWire.waypoints, otherEnd]);
                  newWaypoints = updatedOrth.slice(1, -1);
                } else {
                  newWaypoints = [
                    { x: closest.point.x, y: Math.round((closest.point.y + otherEnd.y) / 2) },
                    { x: otherEnd.x, y: Math.round((closest.point.y + otherEnd.y) / 2) },
                  ];
                }
                onUpdateWireRef.current(wireId, {
                  fromPoint: closest.point,
                  waypoints: newWaypoints,
                  isCustomRouted: true,
                });
              } else {
                // Moving p2 (toPoint)
                const otherEnd = childPts ? childPts[0] : { x: 0, y: 0 };
                let newWaypoints;
                if (childWire?.waypoints && childWire.waypoints.length > 0) {
                  const updatedOrth = ensureOrthogonalPath([otherEnd, ...childWire.waypoints, closest.point]);
                  newWaypoints = updatedOrth.slice(1, -1);
                } else {
                  newWaypoints = [
                    { x: otherEnd.x, y: Math.round((otherEnd.y + closest.point.y) / 2) },
                    { x: closest.point.x, y: Math.round((otherEnd.y + closest.point.y) / 2) },
                  ];
                }
                onUpdateWireRef.current(wireId, {
                  toPoint: closest.point,
                  waypoints: newWaypoints,
                  isCustomRouted: true,
                });
              }
            }
          }
        }
        return;
      }
    };

    const handleWindowPointerUp = () => {
      if (multiDragStartRef.current) {
        multiDragStartRef.current = null;
      }
      if (resizingRailRef.current) {
        resizingRailRef.current = null;
      }
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanning(false);
      }
      if (draggedCompIdRef.current) {
        const movedCompId = draggedCompIdRef.current;
        const didMove = dragMovedRef.current;
        if (snapTargetRef.current) {
          if (snapTargetRef.current.isDinRail && onUpdateComponentStateRef.current) {
            onUpdateComponentStateRef.current(snapTargetRef.current.compId, {
              dinRailId: snapTargetRef.current.railId,
            });
            sounds.playContactorClick?.(true);
          } else if (onLinkComponentsRef.current && snapTargetRef.current.contactorId) {
            onLinkComponentsRef.current(snapTargetRef.current.contactorId, snapTargetRef.current.relayId);
          }
        }

        // Commit fresh waypoints for any wires attached to the moved component ONLY if the component was ACTUALLY moved!
        if (didMove && onUpdateWireRef.current && wiresPointListsRef.current) {
          wiresRef.current.forEach((w, wIdx) => {
            if (w.fromComponent === movedCompId || w.toComponent === movedCompId) {
              const pts = wiresPointListsRef.current[wIdx];
              if (pts && pts.length >= 2) {
                onUpdateWireRef.current(w.id, {
                  waypoints: pts.slice(1, -1),
                  isCustomRouted: Boolean(w.isCustomRouted),
                });
              }
            }
          });
        }

        snapTargetRef.current = null;
        setSnapTarget(null);
        draggedCompIdRef.current = null;
        dragMovedRef.current = false;
        setDraggedCompId(null);
      }
      if (draggingSegmentRef.current) {
        if (onUpdateWireRef.current) {
          const { wireId } = draggingSegmentRef.current;
          const targetWireIndex = wiresRef.current.findIndex((w) => w.id === wireId);
          if (targetWireIndex !== -1) {
            const currentPts = wiresPointListsRef.current[targetWireIndex];
            if (currentPts) {
              const simplified = simplifyOrthogonalPoints(currentPts);
              onUpdateWireRef.current(wireId, { waypoints: simplified.slice(1, -1), isCustomRouted: true });
            }
          }
        }
        draggingSegmentRef.current = null;
      }
      if (draggingWaypointRef.current) {
        draggingWaypointRef.current = null;
      }
      if (draggingSpliceRef.current) {
        if (onUpdateWireRef.current) {
          const { wireId } = draggingSpliceRef.current;
          const childIdx = wiresRef.current.findIndex((w) => w.id === wireId);
          if (childIdx !== -1) {
            const currentPts = wiresPointListsRef.current[childIdx];
            if (currentPts && currentPts.length >= 2) {
              const simplified = simplifyOrthogonalPoints(currentPts);
              onUpdateWireRef.current(wireId, { waypoints: simplified.slice(1, -1), isCustomRouted: true });
            }
          }
        }
        draggingSpliceRef.current = null;
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, []);

  // Canvas background pointer down (left click or middle click on empty canvas to pan)
  const handleContainerPointerDown = (e) => {
    // Only primary (left) or middle button
    if (e.button !== 0 && e.button !== 1) return;

    if (
      e.target.closest('.component-card-wrapper') ||
      e.target.closest('.wire-group') ||
      e.target.closest('.canvas-floating-toolbar') ||
      e.target.closest('button')
    ) {
      return;
    }

    // If currently routing a wire and user left-clicks empty space, that's for adding wire waypoints
    if (connectingTerminal && e.button === 0) {
      return;
    }

    e.preventDefault();
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
  };

  // Canvas Click: add waypoint if connecting, or clear selection
  const handleCanvasClick = (e) => {
    if (
      e.target.closest('.component-card-wrapper') ||
      e.target.closest('.wire-group') ||
      e.target.closest('.canvas-floating-toolbar') ||
      e.target.closest('button')
    ) {
      return;
    }

    // If currently routing a wire, clicking empty canvas adds an intermediate waypoint!
    if (connectingTerminal) {
      sounds.playButtonClick();
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setConnectingWaypoints((prev) => [
        ...prev,
        { x: Math.round(canvasPos.x), y: Math.round(canvasPos.y) },
      ]);
      return;
    }

    // Otherwise clear selected wire and component
    setSelectedWireId(null);
    setSelectedComponentId(null);
    setIsAllSelected(false);
  };

  // Component Dragging Start
  const handleCompPointerDown = (e, compId) => {
    // Modifications are blocked in simulation mode!
    if (isSimulationMode) return;

    // Only primary (left) button initiates dragging
    if (e.button !== 0) return;

    // Select this component and clear wire selection (preserve isAllSelected if active)
    if (!isAllSelectedRef.current) {
      setSelectedComponentId(compId);
    }
    setSelectedWireId(null);

    // Do NOT start dragging if clicking on interactive terminals, busbar lines, buttons, or controls
    if (
      e.target.closest('.busbar-interactive-hit') ||
      e.target.closest('.busbar-line-group') ||
      e.target.closest('.busbar-label-tag') ||
      e.target.closest('.btn-busbar-cut') ||
      e.target.closest('.btn-busbar-gear') ||
      e.target.closest('.breaker-terminal-socket') ||
      e.target.closest('.breaker-interactive-handle') ||
      e.target.closest('.schematic-breaker-handle') ||
      e.target.closest('.schematic-breaker-toggle-btn') ||
      e.target.closest('.schematic-terminal-point') ||
      e.target.closest('.schematic-terminal-node') ||
      e.target.closest('.motor-pe-interactive-line') ||
      e.target.closest('.btn-breaker-gear') ||
      e.target.closest('.breaker-external-controls') ||
      e.target.closest('.btn-breaker-remove') ||
      e.target.closest('.terminal-screw-container') ||
      e.target.closest('.banana-socket-container') ||
      e.target.closest('.contactor-screw-container') ||
      e.target.closest('.motor-svg-terminal-group') ||
      e.target.closest('.motor-brass-terminal-container') ||
      e.target.closest('.motor-overlay-badge-fechamento') ||
      e.target.closest('.motor-controls-panel') ||
      e.target.closest('input') ||
      e.target.closest('.btn-toggle-switch') ||
      e.target.closest('.btn-push-action') ||
      e.target.closest('.btn-remove-comp') ||
      e.target.closest('.btn-thermal-trip') ||
      e.target.closest('.btn-thermal-reset') ||
      e.target.closest('.btn-power-gear') ||
      e.target.closest('.btn-conn') ||
      e.target.closest('button')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const comp = componentsRef.current.find((c) => c.id === compId);
    if (!comp) return;

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    dragOffsetRef.current = {
      x: canvasPos.x - comp.x,
      y: canvasPos.y - comp.y,
    };

    if (isAllSelectedRef.current) {
      multiDragStartRef.current = {
        startCanvasPos: canvasPos,
        initialComponents: componentsRef.current.map((c) => ({ id: c.id, x: c.x, y: c.y })),
        initialWires: wiresRef.current.map((w) => ({
          id: w.id,
          fromPoint: w.fromPoint ? { ...w.fromPoint } : null,
          toPoint: w.toPoint ? { ...w.toPoint } : null,
          waypoints: w.waypoints ? w.waypoints.map((pt) => ({ ...pt })) : [],
        })),
      };
    }

    draggedCompIdRef.current = compId;
    dragMovedRef.current = false;
  };

  // Terminal Click handler (Supports multiple wires on same terminal, wire-to-terminal, and busbar continuous tapping)
  const handleTerminalClick = (compId, termId, customPoint = null) => {
    // Wires cannot be connected during simulation!
    if (isSimulationMode) return;

    const comp = components.find((c) => c.id === compId);

    if (!connectingTerminal) {
      // Start connection from this terminal
      sounds.playButtonClick();
      const p = customPoint && comp
        ? { x: Math.round(comp.x + customPoint.x), y: Math.round(comp.y + customPoint.y) }
        : getTerminalAbsolutePos(compId, termId);

      setConnectingTerminal({
        componentId: compId,
        terminalId: termId,
        point: p,
        terminalX: customPoint?.x,
        terminalY: customPoint?.y,
      });
      setConnectingWaypoints([]);
    } else {
      // If clicked the exact same terminal to cancel
      if (
        connectingTerminal.componentId === compId &&
        connectingTerminal.terminalId === termId &&
        !customPoint
      ) {
        setConnectingTerminal(null);
        setConnectingWaypoints([]);
        return;
      }

      sounds.playButtonClick();
      const p1 = connectingTerminal.point
        ? connectingTerminal.point
        : getTerminalAbsolutePos(connectingTerminal.componentId, connectingTerminal.terminalId);

      const p2 = customPoint && comp
        ? { x: Math.round(comp.x + customPoint.x), y: Math.round(comp.y + customPoint.y) }
        : getTerminalAbsolutePos(compId, termId);

      const comp1 = connectingTerminal.componentId
        ? components.find((c) => c.id === connectingTerminal.componentId)
        : null;
      const comp2 = comp;
      const term1 = comp1?.terminals?.find((t) => t.id === connectingTerminal.terminalId);
      const term2 = comp2?.terminals?.find((t) => t.id === termId);

      const isCustom = connectingWaypoints.length > 0;
      let finalWaypoints = connectingWaypoints;
      if (!isCustom) {
        if (comp1 && comp2) {
          finalWaypoints = computeAutoRoute(p1, p2, comp1, comp2, term1, term2, wires.length, components);
        } else {
          finalWaypoints = [
            { x: p1.x, y: Math.round((p1.y + p2.y) / 2) },
            { x: p2.x, y: Math.round((p1.y + p2.y) / 2) },
          ];
        }
      }

      onAddWire({
        id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...(connectingTerminal.wireId
          ? { fromWireId: connectingTerminal.wireId, fromPoint: connectingTerminal.point }
          : {
              fromComponent: connectingTerminal.componentId,
              fromTerminal: connectingTerminal.terminalId,
              ...(connectingTerminal.terminalX != null ? { fromTerminalX: connectingTerminal.terminalX } : {}),
              ...(connectingTerminal.terminalY != null ? { fromTerminalY: connectingTerminal.terminalY } : {}),
            }),
        toComponent: compId,
        toTerminal: termId,
        ...(customPoint?.x != null ? { toTerminalX: customPoint.x } : {}),
        ...(customPoint?.y != null ? { toTerminalY: customPoint.y } : {}),
        color:
          String(connectingTerminal.terminalId).toUpperCase() === 'PE' ||
          String(termId).toUpperCase() === 'PE' ||
          (comp1?.type === 'power_source' && String(connectingTerminal.terminalId).toUpperCase() === 'PE') ||
          (comp2?.type === 'power_source' && String(termId).toUpperCase() === 'PE')
            ? '#16a34a'
            : activeWireColor,
        isCustomRouted: isCustom,
        waypoints: finalWaypoints,
      });

      setConnectingTerminal(null);
      setConnectingWaypoints([]);
    }
  };

  // Wire Click handler: select, or complete T-junction if connecting, or start branch if Alt/Shift
  const handleWireClick = (e, wireId) => {
    e.stopPropagation();
    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    // If connecting, check first if user actually clicked on or near a component terminal covered by this wire
    if (connectingTerminal) {
      let snappedCompId = null;
      let snappedTermId = null;
      let minDist = 28;

      for (const comp of components) {
        if (!comp.terminals) continue;
        for (const t of comp.terminals) {
          const tPos = getTerminalAbsolutePos(comp.id, t.id);
          const dist = Math.hypot(tPos.x - canvasPos.x, tPos.y - canvasPos.y);
          if (dist < minDist) {
            minDist = dist;
            snappedCompId = comp.id;
            snappedTermId = t.id;
          }
        }
      }

      if (snappedCompId && snappedTermId) {
        handleTerminalClick(snappedCompId, snappedTermId);
        return;
      }
    }

    const targetWireIndex = wires.findIndex((w) => w.id === wireId);
    if (targetWireIndex === -1) return;

    const pts = wiresPointLists[targetWireIndex];
    const closest = getClosestPointOnWire(pts, canvasPos.x, canvasPos.y);

    if (connectingTerminal) {
      // Connect to this wire (creates an electrical T-junction / splice)!
      sounds.playButtonClick();
      const p1 = connectingTerminal.wireId
        ? connectingTerminal.point
        : getTerminalAbsolutePos(connectingTerminal.componentId, connectingTerminal.terminalId);
      const p2 = closest ? closest.point : canvasPos;

      const finalWaypoints =
        connectingWaypoints.length > 0
          ? connectingWaypoints
          : [
              { x: p1.x, y: Math.round((p1.y + p2.y) / 2) },
              { x: p2.x, y: Math.round((p1.y + p2.y) / 2) },
            ];

      onAddWire({
        id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...(connectingTerminal.wireId
          ? { fromWireId: connectingTerminal.wireId, fromPoint: connectingTerminal.point }
          : { fromComponent: connectingTerminal.componentId, fromTerminal: connectingTerminal.terminalId }),
        toWireId: wireId,
        toPoint: p2,
        color:
          String(connectingTerminal?.terminalId).toUpperCase() === 'PE' ||
          wires.find((w) => w.id === wireId)?.color === '#16a34a'
            ? '#16a34a'
            : activeWireColor,
        waypoints: finalWaypoints,
      });

      setConnectingTerminal(null);
      setConnectingWaypoints([]);
      return;
    }

    if (e.altKey || e.shiftKey) {
      // Instant branch start from this wire
      sounds.playButtonClick();
      setConnectingTerminal({ wireId, point: closest ? closest.point : canvasPos });
      setConnectingWaypoints([]);
      return;
    }

    // Normal wire selection
    sounds.playButtonClick();
    setSelectedWireId(wireId);
  };

  // Pointer down on wire-to-wire junction splice to move it along target wire
  const handleSplicePointerDown = (e, wireId, isFrom, targetWireId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulationMode) return;
    if (e.button !== 0) return;
    draggingSpliceRef.current = {
      wireId,
      isFrom,
      targetWireId,
    };
    setSelectedWireId(wireId);
  };

  // Wire Right-Click: Instant Deletion in 1 click!
  const handleWireContextMenu = (e, wireId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulationMode) return;
    sounds.playButtonClick();
    onRemoveWire(wireId);
    if (selectedWireId === wireId) setSelectedWireId(null);
    if (hoveredWireId === wireId) setHoveredWireId(null);
  };

  // Start wire branch from a selected wire
  const handleStartBranchFromWire = (wireId, pt) => {
    if (isSimulationMode) return;
    sounds.playButtonClick();
    setConnectingTerminal({ wireId, point: pt });
    setConnectingWaypoints([]);
    setSelectedWireId(null);
  };

  // Segment Drag Handler (Classic Control style dragging of orthogonal segments)
  const handleSegmentPointerDown = (e, wireId, segIdx) => {
    if (isSimulationMode) return;
    e.stopPropagation();
    sounds.playButtonClick();
    setSelectedWireId(wireId);

    const targetWireIndex = wires.findIndex((w) => w.id === wireId);
    if (targetWireIndex === -1) return;

    const currentPts = wiresPointLists[targetWireIndex];
    const { points: splitPts, segIdx: splitIdx } = splitSegmentForDrag(currentPts, segIdx);
    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    draggingSegmentRef.current = {
      wireId,
      segIdx: splitIdx,
      initialPoints: splitPts,
      startCanvasPos: canvasPos,
    };
  };

  // Waypoint Dragging handlers
  const handleWaypointPointerDown = (e, wireId, index) => {
    if (isSimulationMode) return;
    e.stopPropagation();
    sounds.playButtonClick();
    draggingWaypointRef.current = { wireId, index };
  };

  // Remove waypoint on right click
  const handleWaypointContextMenu = (e, wireId, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSimulationMode) return;
    sounds.playButtonClick();
    const targetWireIndex = wires.findIndex((w) => w.id === wireId);
    if (targetWireIndex !== -1) {
      const pts = wiresPointLists[targetWireIndex];
      const currentWaypoints = pts.slice(1, -1).filter((_, i) => i !== index);
      onUpdateWire(wireId, { waypoints: currentWaypoints });
    }
  };

  // Zoom Toolbar Handlers
  const handleZoomIn = () => {
    setZoom((z) => Math.min(2.5, Number((z * 1.2).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.35, Number((z * 0.83).toFixed(2))));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomFit = () => {
    if (!components.length || !containerRef.current) return;
    const minX = Math.min(...components.map((c) => c.x));
    const maxX = Math.max(...components.map((c) => c.x + 200));
    const minY = Math.min(...components.map((c) => c.y));
    const maxY = Math.max(...components.map((c) => c.y + 250));

    const rect = containerRef.current.getBoundingClientRect();
    const boundW = maxX - minX + 120;
    const boundH = maxY - minY + 120;

    const scaleX = rect.width / boundW;
    const scaleY = rect.height / boundH;
    const newZoom = Math.min(1.4, Math.max(0.4, Number(Math.min(scaleX, scaleY).toFixed(2))));

    setZoom(newZoom);
    setPan({
      x: (rect.width - boundW * newZoom) / 2 - minX * newZoom + 60,
      y: (rect.height - boundH * newZoom) / 2 - minY * newZoom + 40,
    });
  };

  const [workbenchLight, setWorkbenchLight] = useState(() => {
    try {
      return localStorage.getItem('simulador_workbench_light') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleWorkbenchLight = () => {
    setWorkbenchLight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('simulador_workbench_light', String(next));
      } catch {}
      return next;
    });
  };

  const handleStartResizeDinRail = useCallback((e, railId, currentLength) => {
    if (isSimulationMode) return;
    resizingRailRef.current = {
      railId,
      startClientX: e.clientX,
      initialLength: currentLength,
    };
  }, [isSimulationMode]);

  return (
    <div
      ref={containerRef}
      className={`panel-workbench-canvas ${isPanning ? 'is-panning' : ''} ${
        workbenchLight ? 'workbench-light-mode' : ''
      }`}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={(e) => {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setMousePos(canvasPos);
      }}
      onClick={handleCanvasClick}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const type =
          e.dataTransfer.getData('application/simulador-component') ||
          e.dataTransfer.getData('text/plain');
        if (type && onAddComponent) {
          const pos = screenToCanvas(e.clientX, e.clientY);
          onAddComponent(
            type,
            Math.round(pos.x - 70),
            Math.round(pos.y - 50)
          );
        }
      }}
    >
      {/* Dynamic Background Grid (synchronizes with pan & zoom) */}
      <div
        className="canvas-background-grid"
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${96 * zoom}px ${96 * zoom}px`,
        }}
      />

      {/* Floating Banner when All Components are Selected */}
      {isAllSelected && !isSimulationMode && (
        <div className="canvas-all-selected-banner" onClick={(e) => e.stopPropagation()}>
          <div className="all-selected-badge-text">
            <Boxes size={16} className="all-selected-icon" />
            <span>
              <strong>{components.length} componentes selecionados</strong> — Arraste qualquer componente para mover o circuito e fios juntos
            </span>
          </div>
          <button
            type="button"
            className="btn-all-selected-clear"
            onClick={() => setIsAllSelected(false)}
            title="Desmarcar seleção (Esc)"
          >
            ✕ Desmarcar
          </button>
        </div>
      )}

      {/* Floating Canvas View Controls (Zoom \u0026 Actions) */}
      <div className="canvas-floating-toolbar" onClick={(e) => e.stopPropagation()}>
        <div className="toolbar-group zoom-group">
          <button
            type="button"
            className="btn-toolbar-icon"
            onClick={handleZoomOut}
            title="Diminuir Zoom (ou role a roda do mouse)"
          >
            −
          </button>
          <button
            type="button"
            className="btn-toolbar-text zoom-percentage-btn"
            onClick={handleZoomReset}
            title="Redefinir Zoom para 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className="btn-toolbar-icon"
            onClick={handleZoomIn}
            title="Aumentar Zoom (ou role a roda do mouse)"
          >
            +
          </button>
          <button
            type="button"
            className="btn-toolbar-icon"
            onClick={handleZoomFit}
            title="Enquadrar todos os componentes na tela"
          >
            ⛶
          </button>
          <div className="toolbar-divider" />
          <button
            type="button"
            className={`btn-toolbar-icon btn-toolbar-select-all ${isAllSelected ? 'active' : ''}`}
            onClick={() => {
              setIsAllSelected((prev) => {
                const next = !prev;
                if (next) {
                  setSelectedComponentId(null);
                  setSelectedWireId(null);
                }
                return next;
              });
            }}
            title={
              isAllSelected
                ? 'Desmarcar Seleção em Bloco (Esc)'
                : 'Selecionar Todos os Componentes (Ctrl+A) para arrastar todo o circuito e fios de uma vez'
            }
            aria-label="Selecionar Todos os Componentes"
          >
            <Boxes size={17} />
          </button>
          <div className="toolbar-divider" />
          <button
            type="button"
            className={`btn-toolbar-icon btn-toolbar-light-toggle ${workbenchLight ? 'active' : ''}`}
            onClick={handleToggleWorkbenchLight}
            title={workbenchLight ? 'Modo Escuro (Fundo Padrão)' : 'Iluminação da Bancada (Painel Claro - Realça Fios)'}
            aria-label="Alternar Iluminação da Bancada"
          >
            {workbenchLight ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            className={`btn-toolbar-icon btn-toolbar-electron-toggle ${showElectronFlow ? 'active' : ''}`}
            onClick={onToggleElectronFlow}
            title={
              showElectronFlow
                ? 'Desativar Fluxo de Elétrons nos cabos (Modo Edição e Simulação)'
                : 'Ativar Fluxo de Elétrons estilo Falstad nos cabos (Modo Edição e Simulação)'
            }
            aria-label="Alternar Fluxo de Elétrons"
          >
            <Zap size={17} className={showElectronFlow ? 'electron-icon-active' : ''} />
          </button>
        </div>
      </div>



      {/* Scaled and Panned Workbench Board */}
      <div
        ref={boardRef}
        className={`canvas-board ${workbenchLight ? 'workbench-light-active' : ''} ${
          viewMode === 'schematic' ? 'schematic-cad-mode' : ''
        }`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Render Component Blocks */}
        {components.map((comp) => {
          const isThisDragging = draggedCompId === comp.id;
          const linkedPartnerId = comp.linkedRelayId || comp.linkedContactorId;
          const isPartnerDragging = Boolean(linkedPartnerId && draggedCompId === linkedPartnerId);
          const isPairDragging = isThisDragging || isPartnerDragging;
          const isDragging = isPairDragging;

          let compZIndex = 20;
          if (comp.type === 'din_rail') {
            // DIN Rail sits behind modular devices so they clip onto its front surface
            compZIndex = isThisDragging ? 26 : 12;
          } else if (comp.type === 'contactor') {
            // Contactor is ALWAYS higher than thermal relay (55 vs 50 when dragging pair, 30 vs 28/20 otherwise)
            compZIndex = isPairDragging || isThisDragging ? 55 : 30;
          } else if (comp.type === 'thermal_relay') {
            // Thermal relay stays underneath contactor so copper pins never pop out in front
            compZIndex = isPairDragging ? 50 : isThisDragging ? 28 : 20;
          } else if (isThisDragging) {
            compZIndex = 50;
          }

          const style = {
            position: 'absolute',
            left: `${comp.x}px`,
            top: `${comp.y}px`,
            zIndex: compZIndex,
          };
          const isCompSelected = isAllSelected || selectedComponentId === comp.id;
          const showLateralButtons = !isSimulationMode && !isAllSelected && selectedComponentId === comp.id;
          const isCompSchematic =
            comp.displayMode === 'schematic' || comp.state?.displayMode === 'schematic' || viewMode === 'schematic';

          return (
            <div
              key={comp.id}
              className={`component-card-wrapper ${isDragging ? 'dragging' : ''} ${isCompSelected ? 'selected' : ''}`}
              style={style}
              onPointerDown={(e) => handleCompPointerDown(e, comp.id)}
            >
              {/* Lateral Action Buttons (Toggle Real/Schematic, Settings, Delete) - ONLY VISIBLE WHEN INDIVIDUALLY SELECTED */}
              {showLateralButtons && (
                <div className="comp-card-actions-lateral">
                  {/* 1. Toggle Mode Button (Icon only) */}
                  {comp.type !== 'din_rail' && (
                    <button
                      type="button"
                      className="btn-action-lateral btn-lateral-mode"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextMode = isCompSchematic ? 'real' : 'schematic';
                        onUpdateComponentState(comp.id, { displayMode: nextMode });
                      }}
                      title={isCompSchematic ? 'Alternar para Peça Real' : 'Alternar para Símbolo Esquemático'}
                    >
                      {isCompSchematic ? '🔌' : '📐'}
                    </button>
                  )}

                  {/* 2. Configuration Button (Icon only, for power_source or circuit_breaker) */}
                  {comp.type === 'power_source' && (
                    <button
                      type="button"
                      className="btn-action-lateral btn-lateral-settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPowerSettings?.();
                      }}
                      title="Configurar Tensões do Transformador"
                    >
                      <Settings size={14} />
                    </button>
                  )}

                  {comp.type === 'circuit_breaker' && (
                    <button
                      type="button"
                      className="btn-action-lateral btn-lateral-settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBreakerSettings?.(comp);
                      }}
                      title="Ajustes do Disjuntor (Polos, Corrente, Curva)"
                    >
                      <Settings size={14} />
                    </button>
                  )}

                  {/* DIN Rail Specific Actions: Align, + Length, - Length */}
                  {comp.type === 'din_rail' && (
                    <>
                      <button
                        type="button"
                        className="btn-action-lateral btn-lateral-align"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            sounds.playSwitch();
                          } catch {}
                          onAlignDinRail?.(comp.id);
                        }}
                        title="Alinhar e distribuir componentes no trilho DIN"
                      >
                        <AlignHorizontalJustifyStart size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-action-lateral btn-lateral-size"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentLen = Math.max(300, Math.min(2200, Number(comp.state?.length) || 800));
                          const newLen = Math.min(2000, currentLen + 100);
                          try {
                            sounds.playButtonClick();
                          } catch {}
                          onUpdateComponentState(comp.id, { length: newLen });
                        }}
                        title="Aumentar comprimento (+100mm)"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-action-lateral btn-lateral-size"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentLen = Math.max(300, Math.min(2200, Number(comp.state?.length) || 800));
                          const newLen = Math.max(300, currentLen - 100);
                          try {
                            sounds.playButtonClick();
                          } catch {}
                          onUpdateComponentState(comp.id, { length: newLen });
                        }}
                        title="Diminuir comprimento (-100mm)"
                      >
                        <Minus size={14} />
                      </button>
                    </>
                  )}

                  {/* 3. Delete Button (Icon only) */}
                  {!(comp.type === 'thermal_relay' && comp.linkedContactorId) && (
                    <button
                      type="button"
                      className="btn-action-lateral btn-lateral-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveComponent(comp.id);
                        setSelectedComponentId(null);
                      }}
                      title={comp.type === 'din_rail' ? 'Remover trilho DIN' : 'Excluir este componente'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

              {isCompSchematic ? (
                <SchematicElement
                  component={comp}
                  isSelected={isCompSelected}
                  terminalVoltages={terminalVoltages}
                  activeTerminal={connectingTerminal}
                  wires={wires}
                  onTerminalClick={handleTerminalClick}
                  onUpdateComponentState={onUpdateComponentState}
                  onOpenBreakerSettings={!isSimulationMode ? () => onOpenBreakerSettings?.(comp) : undefined}
                  onOpenPowerSettings={onOpenPowerSettings}
                  onAlignDinRail={onAlignDinRail}
                  onStartResizeDinRail={handleStartResizeDinRail}
                  isSimulationMode={isSimulationMode}
                />
              ) : (
            <>
              {comp.type === 'din_rail' && (
                <DinRailElement
                  component={comp}
                  isSelected={isCompSelected}
                  onStartResize={handleStartResizeDinRail}
                  isSimulationMode={isSimulationMode}
                />
              )}

              {comp.type === 'power_source' && (
                <PowerSourceElement
                  component={comp}
                  terminalVoltages={terminalVoltages}
                  activeTerminal={connectingTerminal}
                  onTerminalClick={handleTerminalClick}
                  onUpdateComponentState={onUpdateComponentState}
                  onOpenSettings={onOpenPowerSettings}
                />
              )}

              {comp.type === 'circuit_breaker' && (
                <BreakerElement
                  component={comp}
                  isSelected={isCompSelected}
                  terminalVoltages={terminalVoltages}
                  activeTerminal={connectingTerminal}
                  onTerminalClick={handleTerminalClick}
                  onUpdateComponentState={onUpdateComponentState}
                  onOpenSettings={!isSimulationMode ? () => onOpenBreakerSettings?.(comp) : undefined}
                  onRemoveComponent={onRemoveComponent}
                  isSimulationMode={isSimulationMode}
                />
              )}

                  {comp.type === 'contactor' && (
                    <ContactorElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                    />
                  )}

                  {comp.type === 'thermal_relay' && (
                    <ThermalRelayElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                    />
                  )}

                  {comp.type === 'timer_relay' && (
                    <TimerRelayElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                    />
                  )}

                  {comp.type === 'button_stop' && (
                    <ButtonStopElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                    />
                  )}

                  {comp.type === 'button_start' && (
                    <ButtonStartElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                    />
                  )}

                  {comp.type === 'button_emergency' && (
                    <ButtonEmergencyElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                    />
                  )}

                  {comp.type === 'motor_6p' && (
                    <Motor6PElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                      wires={wires}
                    />
                  )}

                  {(comp.type === 'pilot_light' || comp.type === 'pilot_lamp' || comp.type === 'led_green' || comp.type === 'led_red' || comp.type === 'led_yellow') && (
                    <PilotLampElement
                      component={comp}
                      terminalVoltages={terminalVoltages}
                      activeTerminal={connectingTerminal}
                      onTerminalClick={handleTerminalClick}
                      onUpdateComponentState={onUpdateComponentState}
                      isSimulationMode={isSimulationMode}
                      isSelected={isCompSelected}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Ghost docking alignment indicator during magnetic snapping */}
        {!isSimulationMode && snapTarget && (
          <div
            className={`snap-docking-ghost ${snapTarget.isDinRail ? 'din-rail-snap-ghost' : ''}`}
            style={{
              position: 'absolute',
              left: `${snapTarget.x}px`,
              top: `${snapTarget.y}px`,
              width: `${snapTarget.width || 210}px`,
              height: `${snapTarget.height || 355}px`,
              pointerEvents: 'none',
              zIndex: 45,
            }}
          />
        )}

        {/* Floating Unlink Button for linked Contactor + Relay pairs (strictly icon, no text, hidden during simulation) */}
        {!isSimulationMode &&
          components
            .filter((c) => c.type === 'contactor' && c.linkedRelayId)
            .map((contactor) => {
              const relay = components.find((r) => r.id === contactor.linkedRelayId);
              if (!relay) return null;

              return (
                <div
                  key={`unlink-${contactor.id}-${relay.id}`}
                  className="unlink-pair-badge-container"
                  style={{
                    position: 'absolute',
                    left: `${contactor.x + 214}px`,
                    top: `${contactor.y + 338}px`,
                    zIndex: 120,
                  }}
                >
                  <button
                    type="button"
                    className="btn-unlink-pair"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlinkComponents?.(contactor.id, relay.id);
                    }}
                    title="Desvincular"
                    aria-label="Desvincular"
                  >
                    <Unlink size={16} strokeWidth={2.4} />
                  </button>
                </div>
              );
            })}

        {/* SVG Wire Layer */}
        <svg className="svg-wire-overlay" width="2800" height="2000" style={{ zIndex: 100, overflow: 'visible' }}>
          <defs>
            <filter id="glow-l1" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
            <filter id="glow-neutral" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.8" />
            </filter>
            <filter id="glow-electron-l1" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#a855f7" floodOpacity="0.95" />
            </filter>
            <filter id="glow-electron-l2" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38bdf8" floodOpacity="0.95" />
            </filter>
            <filter id="glow-electron-l3" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ef4444" floodOpacity="0.95" />
            </filter>
            <filter id="glow-electron-n" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#2563eb" floodOpacity="0.95" />
            </filter>
            <filter id="glow-electron-pe" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#16a34a" floodOpacity="0.95" />
            </filter>
            <filter id="glow-electron-signal" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#eab308" floodOpacity="0.95" />
            </filter>
            <linearGradient id="hexGrad-cap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="silverNut" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6e9ec" />
              <stop offset="50%" stopColor="#b0b7bd" />
              <stop offset="100%" stopColor="#7a8289" />
            </linearGradient>
            <linearGradient id="nutBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a8289" />
              <stop offset="50%" stopColor="#b0b7bd" />
              <stop offset="100%" stopColor="#e6e9ec" />
            </linearGradient>
          </defs>

          {/* Existing Wires with Automatic Bridge Jumps ("Voltinhas") */}
          {wires.map((wire, idx) => {
            const points = wiresPointLists[idx];
            if (!points || points.length < 2) return null;

            // Prioritize earlier wires so only crossing wires jump over
            const otherWiresPointsList = wiresPointLists.slice(0, idx);
            const pathD = buildWirePathWithJumps(points, otherWiresPointsList, allJunctionPoints);

            const p1 = points[0];
            const p2 = points[points.length - 1];
            const waypoints = points.slice(1, -1);

            const isHovered = hoveredWireId === wire.id;
            const compFrom = wire.fromComponent ? components.find((c) => c.id === wire.fromComponent) : null;
            const compTo = wire.toComponent ? components.find((c) => c.id === wire.toComponent) : null;
            const isCompFromSchematic = Boolean(
              compFrom &&
              (compFrom.displayMode === 'schematic' || compFrom.state?.displayMode === 'schematic' || viewMode === 'schematic')
            );
            const isCompToSchematic = Boolean(
              compTo &&
              (compTo.displayMode === 'schematic' || compTo.state?.displayMode === 'schematic' || viewMode === 'schematic')
            );
            const isFromPowerSource = Boolean(compFrom?.type === 'power_source' && !isCompFromSchematic && viewMode === 'real');
            const isToPowerSource = Boolean(compTo?.type === 'power_source' && !isCompToSchematic && viewMode === 'real');
            const getTransformerTermColor = (termId) => {
              const t = String(termId || '').toUpperCase().trim();
              if (t === 'L1') return '#a855f7';
              if (t === 'L2') return '#ffffff';
              if (t === 'L3') return '#ef4444';
              if (t === 'PE') return '#16a34a';
              return '#2563eb';
            };
            const p1TransformerColor = isFromPowerSource ? getTransformerTermColor(wire.fromTerminal) : null;
            const p2TransformerColor = isToPowerSource ? getTransformerTermColor(wire.toTerminal) : null;
            const isFromCageTerminal = Boolean(
              compFrom &&
              (compFrom.type === 'circuit_breaker' || compFrom.type === 'contactor' || compFrom.type === 'thermal_relay') &&
              !isCompFromSchematic &&
              viewMode === 'real'
            );
            const isToCageTerminal = Boolean(
              compTo &&
              (compTo.type === 'circuit_breaker' || compTo.type === 'contactor' || compTo.type === 'thermal_relay') &&
              !isCompToSchematic &&
              viewMode === 'real'
            );
            const isFromMotor = Boolean(
              compFrom &&
              compFrom.type === 'motor_6p' &&
              !isCompFromSchematic &&
              viewMode === 'real'
            );
            const isToMotor = Boolean(
              compTo &&
              compTo.type === 'motor_6p' &&
              !isCompToSchematic &&
              viewMode === 'real'
            );

            const isSelected = selectedWireId === wire.id;
            const vFrom = wire.fromComponent
              ? terminalVoltages.get(`${wire.fromComponent}:${wire.fromTerminal}`)
              : null;
            const vTo = wire.toComponent
              ? terminalVoltages.get(`${wire.toComponent}:${wire.toTerminal}`)
              : null;
            const vWire = terminalVoltages.get(`wire:${wire.id}`);
            const parentFromWireVolt = wire.fromWireId ? terminalVoltages.get(`wire:${wire.fromWireId}`) : null;
            const parentToWireVolt = wire.toWireId ? terminalVoltages.get(`wire:${wire.toWireId}`) : null;
            const potential = vWire || vFrom || vTo || parentFromWireVolt || parentToWireVolt;
            const isEnergized = Boolean(potential);

            // Cores de fase da simulação:
            // L1: Roxo (#a855f7)
            // L2: Branco (#ffffff)
            // L3: Vermelho (#ef4444)
            // N:  Azul/Cyan (#06b6d4 / #2563eb)
            // PE: Verde (#16a34a)
            const PHASE_COLORS_MAP = {
              L1: '#a855f7',
              L2: '#ffffff',
              L3: '#ef4444',
              N: '#06b6d4',
              PE: '#16a34a',
            };

            const phaseColor =
              isSimulationMode && isEnergized && potential && PHASE_COLORS_MAP[potential]
                ? PHASE_COLORS_MAP[potential]
                : null;
            const isFromPowerPE = Boolean(
              compFrom?.type === 'power_source' && String(wire.fromTerminal).toUpperCase() === 'PE'
            );
            const isToPowerPE = Boolean(
              compTo?.type === 'power_source' && String(wire.toTerminal).toUpperCase() === 'PE'
            );
            const isPowerGroundWire = isFromPowerPE || isToPowerPE;
            const isPEConductor =
              (isSimulationMode && potential === 'PE') ||
              wire.color === '#16a34a' ||
              isPowerGroundWire ||
              String(wire.fromTerminal).toUpperCase() === 'PE' ||
              String(wire.toTerminal).toUpperCase() === 'PE';

            const activeWireColor = (isPowerGroundWire || isPEConductor)
              ? '#16a34a'
              : (phaseColor || wire.color);

            // Cores dedicadas dos pontos de conexão nas extremidades P1 e P2 (adotam a fase quando energizados)
            const p1Volt = vFrom || parentFromWireVolt || potential;
            const p1PhaseColor =
              isSimulationMode && isEnergized && p1Volt && PHASE_COLORS_MAP[p1Volt]
                ? PHASE_COLORS_MAP[p1Volt]
                : null;
            const p1Color = (isPowerGroundWire || isPEConductor)
              ? '#16a34a'
              : (p1PhaseColor || activeWireColor);

            const p2Volt = vTo || parentToWireVolt || potential;
            const p2PhaseColor =
              isSimulationMode && isEnergized && p2Volt && PHASE_COLORS_MAP[p2Volt]
                ? PHASE_COLORS_MAP[p2Volt]
                : null;
            const p2Color = (isPowerGroundWire || isPEConductor)
              ? '#16a34a'
              : (p2PhaseColor || activeWireColor);

            const isSchematicMode =
              viewMode === 'schematic' || isCompFromSchematic || isCompToSchematic;
            const isSchematicDashedPE = isSchematicMode && (isPowerGroundWire || isPEConductor);

            // Find longest segment to anchor the solid control buttons
            let longestSeg = { len: 0, mid: { x: p1.x, y: p1.y } };
            for (let s = 0; s < points.length - 1; s++) {
              const slen = Math.hypot(points[s + 1].x - points[s].x, points[s + 1].y - points[s].y);
              if (slen > longestSeg.len) {
                longestSeg = {
                  len: slen,
                  mid: {
                    x: Math.round((points[s].x + points[s + 1].x) / 2),
                    y: Math.round((points[s].y + points[s + 1].y) / 2),
                  },
                };
              }
            }

            const isShorted = shortedWireIds.includes(wire.id);

            // Determine if electron flow should be displayed on this wire
            const hasAnyPowerSource = components.some((c) => c.type === 'power_source');
            const shouldShowElectrons =
              showElectronFlow && (!isSimulationMode || isEnergized || !hasAnyPowerSource);

            // Determine the electrical phase identity and color of the electron flow
            let phaseClass = 'phase-l1';
            const effPotential = potential ? String(potential).toUpperCase() : null;

            if (effPotential === 'L1') {
              phaseClass = 'phase-l1';
            } else if (effPotential === 'L2') {
              phaseClass = 'phase-l2';
            } else if (effPotential === 'L3') {
              phaseClass = 'phase-l3';
            } else if (effPotential === 'N') {
              phaseClass = 'phase-n';
            } else if (effPotential === 'PE') {
              phaseClass = 'phase-pe';
            } else {
              // Not energized or in Edit Mode: deduce from connected terminals or wire color
              const checkTermPhase = (comp, term) => {
                if (!comp || !term) return null;
                const t = String(term).toUpperCase().trim();
                if (comp.type === 'power_source') {
                  if (t.startsWith('L1')) return 'phase-l1';
                  if (t.startsWith('L2')) return 'phase-l2';
                  if (t.startsWith('L3')) return 'phase-l3';
                  if (t.startsWith('N')) return 'phase-n';
                  if (t.startsWith('PE')) return 'phase-pe';
                }
                // Common industrial power terminals (disjuntor, contator, relé térmico, motor)
                if (t === '1' || t === '2' || t === 'U1' || t === 'U2') return 'phase-l1';
                if (t === '3' || t === '4' || t === 'V1' || t === 'V2') return 'phase-l2';
                if (t === '5' || t === '6' || t === 'W1' || t === 'W2') return 'phase-l3';
                if (t === 'N' || t === 'A2') return 'phase-n';
                if (t === 'PE') return 'phase-pe';
                return null;
              };

              const pFrom = checkTermPhase(compFrom, wire.fromTerminal);
              const pTo = checkTermPhase(compTo, wire.toTerminal);

              if (pFrom) {
                phaseClass = pFrom;
              } else if (pTo) {
                phaseClass = pTo;
              } else {
                // Color-based phase deduction (NBR 5410 & custom palette)
                const c = (wire.color || '').toLowerCase();
                if (c === '#0077b6' || c === '#0ea5e9' || c === '#2563eb' || c.includes('blue')) {
                  phaseClass = 'phase-n';
                } else if (c === '#2d6a4f' || c === '#16a34a' || c.includes('green')) {
                  phaseClass = 'phase-pe';
                } else if (c === '#ef4444' || c === '#dc2626' || c === '#c1121f' || c.includes('red')) {
                  phaseClass = 'phase-l3';
                } else if (c === '#a855f7' || c.includes('purple') || c.includes('violet') || c.includes('roxo')) {
                  phaseClass = 'phase-l1';
                } else if (c === '#ffffff' || c.includes('white') || c.includes('branco')) {
                  phaseClass = 'phase-l2';
                } else if (c === '#18181b' || c === '#2b2d42' || c === '#5c677d' || c.includes('black') || c.includes('grey')) {
                  phaseClass = 'phase-l2';
                } else if (c === '#d4a373' || c === '#eab308' || c.includes('yellow')) {
                  phaseClass = 'phase-signal';
                } else {
                  phaseClass = 'phase-l1';
                }
              }
            }

            // Direction of electron flow (from power source/phase towards load/neutral)
            let flowReverse = false;
            if (isToPowerSource) {
              flowReverse = true;
            } else if (!isFromPowerSource) {
              if (
                vTo &&
                (vTo === 'L1' || vTo === 'L2' || vTo === 'L3') &&
                (!vFrom || vFrom === 'N' || vFrom === 'PE')
              ) {
                flowReverse = true;
              }
            }

            return (
              <g
                key={wire.id}
                className={`wire-group ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''} ${
                  showWireVoltageGlow && isEnergized ? 'energized-flow' : ''
                } ${isShorted ? 'wire-short-circuit-flashing' : ''}`}
                onMouseEnter={() => setHoveredWireId(wire.id)}
                onMouseLeave={() => setHoveredWireId(null)}
                onClick={(e) => handleWireClick(e, wire.id)}
                onContextMenu={(e) => handleWireContextMenu(e, wire.id)}
              >
                {/* Generous hit stroke for comfortable cursor selection / click */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  style={{ cursor: connectingTerminal ? 'crosshair' : 'pointer' }}
                />

                {isSchematicDashedPE ? (
                  <>
                    {/* Hover/Selection glow highlight */}
                    {(isHovered || isSelected) && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="6"
                        strokeDasharray="8 5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.45"
                      />
                    )}

                    {/* Fio de terra da rede esquemático: Linha tracejada verde IEC */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth={isHovered || isSelected ? '3.5' : '2.4'}
                      strokeDasharray="8 5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <>
                    {/* Wire high-contrast casing so dark or white wires stand out razor-sharp */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        activeWireColor === '#ffffff' || activeWireColor?.toLowerCase() === '#fff'
                          ? 'rgba(0, 0, 0, 0.65)'
                          : activeWireColor === '#18181b'
                          ? (workbenchLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.45)')
                          : (workbenchLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.28)')
                      }
                      strokeWidth={isHovered || isSelected ? '7.5' : '6.5'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Wire realistic shadow */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(0,0,0,0.5)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform="translate(1.5, 3)"
                    />

                    {/* Primary insulated rounded wire body (adota a cor da fase quando energizado em simulação) */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={activeWireColor}
                      strokeWidth={isHovered || isSelected ? '5' : '4'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Listra amarela contínua no condutor de proteção (PE) verde-amarelo no modo realista */}
                    {isPEConductor && !isSchematicMode && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#eab308"
                        strokeWidth={isHovered || isSelected ? '1.8' : '1.4'}
                        strokeDasharray="10 8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pointerEvents="none"
                      />
                    )}
                  </>
                )}

                {/* Falstad-style Moving Electron Flow Beads (Phase-colored) */}
                {shouldShowElectrons && (
                  <path
                    d={pathD}
                    fill="none"
                    className={`wire-electron-flow ${phaseClass} ${
                      flowReverse ? 'flow-reverse' : 'flow-forward'
                    } ${isShorted ? 'flow-short' : ''}`}
                    filter={isShorted ? undefined : `url(#glow-electron-${phaseClass.replace('phase-', '')})`}
                    pointerEvents="none"
                  />
                )}

                {/* Terminal tipo ilhós / ferrule plug, borne gaiola ou parafuso sextavado no P1 */}
                {wire.fromWireId ? (
                  <g
                    className="wire-junction-splice"
                    transform={`translate(${p1.x}, ${p1.y})`}
                    onPointerDown={(e) => handleSplicePointerDown(e, wire.id, true, wire.fromWireId)}
                    title="Ponto de conexão (Emenda): Clique e arraste para mover ao longo do condutor"
                  >
                    <circle cx="0" cy="0" r="14" fill="transparent" />
                    {viewMode === 'schematic' ? (
                      <circle cx="0" cy="0" r="5.5" fill={p1Color} stroke={p1Color} strokeWidth="1" />
                    ) : (
                      <>
                        <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="0" cy="0" r="2.5" fill={p1Color} />
                      </>
                    )}
                  </g>
                ) : isCompFromSchematic || viewMode === 'schematic' ? (
                  <g className="schematic-wire-terminal-dot" pointerEvents="none">
                    <circle
                      cx={p1.x}
                      cy={p1.y}
                      r="5.5"
                      fill={p1Color}
                      stroke={p1Color}
                      strokeWidth="1"
                    />
                  </g>
                ) : isFromPowerSource ? (
                  <g className="wire-transformer-bolt-cap" transform={`translate(${p1.x}, ${p1.y})`} pointerEvents="none">
                    {/* Arruela de encosto lisa em aço zincado prensando o cabo contra o transformador */}
                    <circle
                      cx="0"
                      cy="0"
                      r="14.5"
                      fill="#0f172a"
                      stroke={p1TransformerColor}
                      strokeWidth="2.8"
                      style={{
                        filter: isShorted
                          ? 'drop-shadow(0 0 8px #ef4444)'
                          : isEnergized
                          ? `drop-shadow(0 0 6px ${p1TransformerColor})`
                          : 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
                      }}
                    />
                    <circle cx="0" cy="0" r="12.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                    {/* Cabeça do Parafuso Sextavado sobre o cabo (o cabo fica visivelmente ABAIXO do parafuso) */}
                    <polygon
                      points="0,-9.5 8.2,-4.8 8.2,4.8 0,9.5 -8.2,4.8 -8.2,-4.8"
                      fill="url(#hexGrad-cap)"
                      stroke="#1e293b"
                      strokeWidth="1.2"
                    />
                    {/* Rebaixo central usinado */}
                    <circle
                      cx="0"
                      cy="0"
                      r="3.2"
                      fill={isEnergized ? p1TransformerColor : '#1e293b'}
                      stroke="#334155"
                      strokeWidth="0.8"
                    />
                  </g>
                ) : isFromMotor ? (
                  <WireMotorRingLug pt={p1} nextPt={points[1]} wireColor={activeWireColor} />
                ) : isFromCageTerminal ? (
                  <WireTerminalCageEntry pt={p1} nextPt={points[1]} wireColor={activeWireColor} />
                ) : (
                  <WireFerrulePlug pt={p1} nextPt={points[1]} wireColor={activeWireColor} />
                )}

                {/* Terminal tipo ilhós / ferrule plug, borne gaiola ou parafuso sextavado no P2 */}
                {wire.toWireId ? (
                  <g
                    className="wire-junction-splice"
                    transform={`translate(${p2.x}, ${p2.y})`}
                    onPointerDown={(e) => handleSplicePointerDown(e, wire.id, false, wire.toWireId)}
                    title="Ponto de conexão (Emenda): Clique e arraste para mover ao longo do condutor"
                  >
                    <circle cx="0" cy="0" r="14" fill="transparent" />
                    {viewMode === 'schematic' ? (
                      <circle cx="0" cy="0" r="5.5" fill={p2Color} stroke={p2Color} strokeWidth="1" />
                    ) : (
                      <>
                        <circle cx="0" cy="0" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="0" cy="0" r="2.5" fill={p2Color} />
                      </>
                    )}
                  </g>
                ) : isCompToSchematic || viewMode === 'schematic' ? (
                  <g className="schematic-wire-terminal-dot" pointerEvents="none">
                    <circle
                      cx={p2.x}
                      cy={p2.y}
                      r="5.5"
                      fill={p2Color}
                      stroke={p2Color}
                      strokeWidth="1"
                    />
                  </g>
                ) : isToPowerSource ? (
                  <g className="wire-transformer-bolt-cap" transform={`translate(${p2.x}, ${p2.y})`} pointerEvents="none">
                    {/* Arruela de encosto lisa em aço zincado prensando o cabo contra o transformador */}
                    <circle
                      cx="0"
                      cy="0"
                      r="14.5"
                      fill="#0f172a"
                      stroke={p2TransformerColor}
                      strokeWidth="2.8"
                      style={{
                        filter: isShorted
                          ? 'drop-shadow(0 0 8px #ef4444)'
                          : isEnergized
                          ? `drop-shadow(0 0 6px ${p2TransformerColor})`
                          : 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
                      }}
                    />
                    <circle cx="0" cy="0" r="12.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                    {/* Cabeça do Parafuso Sextavado sobre o cabo (o cabo fica visivelmente ABAIXO do parafuso) */}
                    <polygon
                      points="0,-9.5 8.2,-4.8 8.2,4.8 0,9.5 -8.2,4.8 -8.2,-4.8"
                      fill="url(#hexGrad-cap)"
                      stroke="#1e293b"
                      strokeWidth="1.2"
                    />
                    {/* Rebaixo central usinado */}
                    <circle
                      cx="0"
                      cy="0"
                      r="3.2"
                      fill={isEnergized ? p2TransformerColor : '#1e293b'}
                      stroke="#334155"
                      strokeWidth="0.8"
                    />
                  </g>
                ) : isToMotor ? (
                  <WireMotorRingLug pt={p2} nextPt={points[points.length - 2]} wireColor={activeWireColor} />
                ) : isToCageTerminal ? (
                  <WireTerminalCageEntry pt={p2} nextPt={points[points.length - 2]} wireColor={activeWireColor} />
                ) : (
                  <WireFerrulePlug pt={p2} nextPt={points[points.length - 2]} wireColor={activeWireColor} />
                )}

                {/* Segment drag handles on selected wire (hidden during simulation) */}
                {!isSimulationMode && isSelected &&
                  points.slice(0, -1).map((pStart, sIdx) => {
                    const pEnd = points[sIdx + 1];
                    const isHoriz = Math.abs(pStart.y - pEnd.y) <= Math.abs(pStart.x - pEnd.x);
                    const midX = (pStart.x + pEnd.x) / 2;
                    const midY = (pStart.y + pEnd.y) / 2;
                    const segLen = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
                    if (segLen < 12) return null;

                    return (
                      <g
                        key={`seg-handle-${sIdx}`}
                        className="wire-segment-handle-group"
                        onPointerDown={(e) => handleSegmentPointerDown(e, wire.id, sIdx)}
                        style={{ cursor: isHoriz ? 'ns-resize' : 'ew-resize' }}
                        title="Arraste este trecho do fio para reposicionar livremente"
                      >
                        {/* Invisible wide hit area for effortless grabbing */}
                        <rect
                          x={isHoriz ? Math.min(pStart.x, pEnd.x) + 4 : midX - 12}
                          y={isHoriz ? midY - 12 : Math.min(pStart.y, pEnd.y) + 4}
                          width={isHoriz ? Math.max(segLen - 8, 20) : 24}
                          height={isHoriz ? 24 : Math.max(segLen - 8, 20)}
                          fill="transparent"
                        />
                        {/* Visual indicator handle (green dot) */}
                        <circle
                          cx={midX}
                          cy={midY}
                          r="5"
                          fill="#10b981"
                          stroke="#064e3b"
                          strokeWidth="1.5"
                          filter="drop-shadow(0 0 3px rgba(16,185,129,0.7))"
                        />
                      </g>
                    );
                  })}

                {/* Waypoint Handles (Corner/Angle nodes) - hidden during simulation */}
                {!isSimulationMode && isSelected &&
                  waypoints.map((wp, wIdx) => (
                    <g
                      key={`wp-${wIdx}`}
                      className="wire-waypoint-group"
                      transform={`translate(${wp.x}, ${wp.y})`}
                      onPointerDown={(e) => handleWaypointPointerDown(e, wire.id, wIdx)}
                      onContextMenu={(e) => handleWaypointContextMenu(e, wire.id, wIdx)}
                      title="Arraste para mover o canto • Botão direito para remover esta dobra"
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="7"
                        fill="#38bdf8"
                        stroke="#ffffff"
                        strokeWidth="2"
                        style={{ cursor: 'grab' }}
                      />
                      <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
                    </g>
                  ))}

                {/* Dedicated Solid Control Buttons on Selected Wire (hidden during simulation) */}
                {!isSimulationMode && isSelected && (
                  <g
                    className="wire-selected-controls"
                    transform={`translate(${longestSeg.mid.x}, ${longestSeg.mid.y})`}
                  >
                    {/* Delete Button (Red circle with white X) */}
                    <g
                      className="btn-wire-del-badge"
                      transform="translate(-16, -18)"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playButtonClick();
                        onRemoveWire(wire.id);
                        setSelectedWireId(null);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Excluir este fio (Delete)"
                    >
                      <circle cx="0" cy="0" r="11" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
                      <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                    </g>

                    {/* Derive / Branch Button (Blue circle with +) */}
                    <g
                      className="btn-wire-derive-badge"
                      transform="translate(16, -18)"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartBranchFromWire(wire.id, longestSeg.mid);
                      }}
                      style={{ cursor: 'pointer' }}
                      title="Puxar novo fio a partir deste ponto (Emenda / Derivação)"
                    >
                      <circle cx="0" cy="0" r="11" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
                      <path d="M 0 -5 L 0 5 M -5 0 L 5 0" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                  </g>
                )}
              </g>
            );
          })}

          {/* Rubber-band wire while connecting (supports starting from terminal or wire, and intermediate clicks!) */}
          {connectingTerminal && (
            <g className="rubber-wire">
              {(() => {
                const p1 = connectingTerminal.point
                  ? connectingTerminal.point
                  : getTerminalAbsolutePos(
                      connectingTerminal.componentId,
                      connectingTerminal.terminalId
                    );
                const pts = [p1, ...connectingWaypoints, mousePos];
                const pathD = buildWirePathWithJumps(pts, wiresPointLists, allJunctionPoints);

                const isConnPE =
                  String(connectingTerminal.terminalId).toUpperCase() === 'PE' ||
                  connectingTerminal.componentId && components.find((c) => c.id === connectingTerminal.componentId)?.type === 'power_source' && String(connectingTerminal.terminalId).toUpperCase() === 'PE';
                const previewColor = isConnPE ? '#16a34a' : activeWireColor;

                return (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={previewColor}
                      strokeWidth={isConnPE && viewMode === 'schematic' ? '2.8' : '3.6'}
                      strokeDasharray={isConnPE ? '8 5' : '6,4'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx={p1.x} cy={p1.y} r="5.5" fill={isConnPE ? '#16a34a' : '#ffd166'} stroke="#0f172a" strokeWidth="1.2" />
                    {connectingWaypoints.map((wp, i) => (
                      <circle key={i} cx={wp.x} cy={wp.y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                    ))}
                    <circle cx={mousePos.x} cy={mousePos.y} r="4.5" fill={isConnPE ? '#16a34a' : '#ffd166'} />
                  </>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Short Circuit Alert Banner - Always Fixed at Top Center of Screen Viewport */}
      {shortCircuit && (
        <div className="short-circuit-alert-overlay" role="alert">
          <div className="alert-content">
            <span className="alert-icon">⚡</span>
            <div className="alert-text">
              <h3>CURTO-CIRCUITO DETECTADO!</h3>
              <p>
                {shortCircuitDetails?.description ||
                  'Houve uma ligação direta entre Fase e Neutro (ou entre Fases) sem carga intermediária. Verifique a fiação.'}
              </p>
            </div>
            {onClearShortWires && (
              <button
                type="button"
                className="btn-clear-short"
                onClick={onClearShortWires}
                title="Desconectar imediatamente o fio em curto"
              >
                Desfazer Curto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Simulation Running Indicator */}
      {isSimulationMode && (
        <div className="simulation-running-pill">
          <span className="sim-pulse-dot"></span>
          <span>MODO SIMULAÇÃO ATIVO • Alterações Bloqueadas</span>
        </div>
      )}
    </div>
  );
}
