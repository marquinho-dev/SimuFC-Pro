// Smart Auto-Routing, Obstacle Avoidance, Segment Dragging, Rounded Fillets, and Wire Jump ("Voltinha") Engine

export const COMP_DIMENSIONS = {
  power_source: { w: 440, h: 250 },
  circuit_breaker: { w: 156, h: 218 },
  breaker_3p: { w: 156, h: 218 },
  breaker_1p: { w: 52, h: 218 },
  contactor: { w: 210, h: 360 },
  thermal_relay: { w: 220, h: 160 },
  timer_relay: { w: 120, h: 350 },
  button_stop: { w: 136, h: 170 },
  button_start: { w: 136, h: 170 },
  button_emergency: { w: 136, h: 170 },
  pilot_lamp: { w: 80, h: 120 },
  motor_6p: { w: 260, h: 530 },
};

export function getComponentBounds(c) {
  if (!c) return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
  let dim = COMP_DIMENSIONS[c.type] || { w: 120, h: 160 };
  if (c.type === 'circuit_breaker') {
    const poles = Number(c.state?.poles) || 3;
    const w = poles * 52;
    dim = { w, h: 218 };
  }
  const w = c.width || dim.w;
  const h = c.height || dim.h;
  return {
    left: c.x,
    right: c.x + w,
    top: c.y,
    bottom: c.y + h,
    width: w,
    height: h,
  };
}

/**
 * Check if two line segments (p1-p2) and (p3-p4) intersect.
 * Returns intersection coordinates and fraction along (p1-p2), or null.
 */
export function getLineIntersection(p1, p2, p3, p4) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-6) return null; // Parallel or collinear

  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  // Intersects strictly inside both segments with safe margin near endpoints
  if (u > 0.04 && u < 0.96 && v > 0.04 && v < 0.96) {
    return {
      x: p1.x + u * (p2.x - p1.x),
      y: p1.y + u * (p2.y - p1.y),
      u,
    };
  }
  return null;
}

/**
 * Determine perpendicular terminal exit vector based on terminal and component position.
 */
export function getTerminalExitVector(term, comp) {
  if (!comp || !term) return { dx: 0, dy: 1 }; // Default exit downward

  // Power source sockets exit downwards in real mode, or rightwards in schematic mode
  if (comp.type === 'power_source') {
    const isCompSchematic =
      comp.displayMode === 'schematic' || comp.state?.displayMode === 'schematic';
    if (isCompSchematic) {
      return { dx: 1, dy: 0 };
    }
    return { dx: 0, dy: 1 };
  }

  // Pushbuttons: top terminal exits UP, bottom terminal exits DOWN
  if (comp.type === 'button_start' || comp.type === 'button_stop' || comp.type === 'button_emergency') {
    return term.y < 85 ? { dx: 0, dy: -1 } : { dx: 0, dy: 1 };
  }

  // Motor terminals: top row exits up, bottom row exits down, PE exits right
  if (comp.type === 'motor_6p') {
    if (term.id === 'PE') return { dx: 1, dy: 0 };
    if (['W2', 'U2', 'V2'].includes(term.id)) return { dx: 0, dy: -1 };
    return { dx: 0, dy: 1 };
  }

  // Circuit breakers: top exits up, bottom exits down
  if (comp.type === 'breaker_1p' || comp.type === 'breaker_3p' || comp.type === 'circuit_breaker') {
    return (term.type === 'breaker_in' || term.y < 100) ? { dx: 0, dy: -1 } : { dx: 0, dy: 1 };
  }

  // General industrial devices (Contactor, Thermal Relay, Lamps)
  const compHeight = comp.height || (comp.type === 'contactor' ? 350 : 150);
  if (term.y < compHeight * 0.35) {
    return { dx: 0, dy: -1 }; // Exit upward
  } else if (term.y > compHeight * 0.65) {
    return { dx: 0, dy: 1 }; // Exit downward
  }

  // Middle/auxiliary terminals exit towards the closer vertical border
  return term.x < 100 ? { dx: -1, dy: 0 } : { dx: 1, dy: 0 };
}

/**
 * Auto-route a wire between P1 and P2 with intelligent Obstacle Avoidance.
 * Automatically goes around intermediate components without crossing them.
 */
export function computeAutoRoute(p1, p2, comp1, comp2, term1, term2, wireIndex = 0, allComponents = []) {
  if (!p1 || !p2) return [];

  // Case 0: Direct jumpers within the exact same component (e.g. Motor Star/Delta links, Contactor coil jumpers)
  if (comp1 && comp2 && comp1.id === comp2.id) {
    // Vertically aligned terminals (e.g. U1-W2, V1-U2, W1-V2 for Delta)
    if (Math.abs(p1.x - p2.x) < 8) {
      return []; // Direct straight vertical connection
    }
    // Horizontally aligned terminals (e.g. W2-U2, U2-V2 for Star)
    if (Math.abs(p1.y - p2.y) < 8) {
      const exitDy = term1?.y < 120 ? -18 : 18;
      return [
        { x: p1.x, y: Math.round(p1.y + exitDy) },
        { x: p2.x, y: Math.round(p2.y + exitDy) },
      ];
    }
    // Internal jumper with offset (e.g. 14 to A1)
    const exit1 = getTerminalExitVector(term1, comp1);
    const exit2 = getTerminalExitVector(term2, comp2);
    const sideX = Math.round(comp1.x + (term1?.x < 100 ? -22 : (comp1.width || 210) + 22));
    const y1 = Math.round(p1.y + exit1.dy * 20);
    const y2 = Math.round(p2.y + exit2.dy * 20);
    return simplifyOrthogonalPoints([
      p1,
      { x: p1.x, y: y1 },
      { x: sideX, y: y1 },
      { x: sideX, y: y2 },
      { x: p2.x, y: y2 },
      p2,
    ]).slice(1, -1);
  }

  const exit1 = getTerminalExitVector(term1, comp1);
  const exit2 = getTerminalExitVector(term2, comp2);

  // Subtle lane offset (-10px to +10px) to prevent multiple parallel wires from overlapping completely
  const laneOffset = ((wireIndex % 5) - 2) * 5;

  // Stubs extending perpendicularly from terminal socket
  const stubLen = 22;
  const s1 = {
    x: Math.round(p1.x + (exit1.dx || 0) * stubLen),
    y: Math.round(p1.y + (exit1.dy || 0) * stubLen),
  };
  const s2 = {
    x: Math.round(p2.x + (exit2.dx || 0) * stubLen),
    y: Math.round(p2.y + (exit2.dy || 0) * stubLen),
  };

  // Helper to check if a horizontal or vertical segment cuts through an obstacle box
  const candidateIntersectsObstacle = (pts) => {
    const candidateObstacles = (allComponents || []).filter((c) => {
      if (!c || c.type === 'din_rail') return false;
      if (c.id === comp1?.id || c.id === comp2?.id) return false;
      return true;
    });

    for (const c of candidateObstacles) {
      const b = getComponentBounds(c);
      // Box with safety padding
      const left = b.left + 4;
      const right = b.right - 4;
      const top = b.top + 4;
      const bottom = b.bottom - 4;

      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const bPt = pts[i + 1];

        // Vertical segment
        if (Math.abs(a.x - bPt.x) < 2) {
          if (a.x > left && a.x < right) {
            const minY = Math.min(a.y, bPt.y);
            const maxY = Math.max(a.y, bPt.y);
            if (maxY > top && minY < bottom) {
              return c; // Collision!
            }
          }
        } else if (Math.abs(a.y - bPt.y) < 2) {
          // Horizontal segment
          if (a.y > top && a.y < bottom) {
            const minX = Math.min(a.x, bPt.x);
            const maxX = Math.max(a.x, bPt.x);
            if (maxX > left && minX < right) {
              return c; // Collision!
            }
          }
        }
      }
    }
    return null;
  };

  let candidatePoints = [];

  // =========================================================================
  // CASE 1: Terminals face each other vertically
  // e.g. p1 exits DOWN and p2 exits UP (with p1.y < p2.y)
  // or p1 exits UP and p2 exits DOWN (with p1.y > p2.y)
  // =========================================================================
  if (
    (exit1.dy === 1 && exit2.dy === -1 && p1.y <= p2.y + 10) ||
    (exit1.dy === -1 && exit2.dy === 1 && p1.y >= p2.y - 10)
  ) {
    if (Math.abs(p1.x - p2.x) < 4) {
      // Directly aligned vertically -> straight line!
      candidatePoints = [p1, p2];
    } else {
      const midY = Math.round((s1.y + s2.y) / 2 + laneOffset);
      candidatePoints = [
        p1,
        { x: p1.x, y: midY },
        { x: p2.x, y: midY },
        p2,
      ];
    }
  }

  // =========================================================================
  // CASE 2: Both terminals exit UP (e.g. top of K1 to top of K2)
  // Route cleanly across the upper horizontal canaleta
  // =========================================================================
  else if (exit1.dy === -1 && exit2.dy === -1) {
    const canaletaY = Math.round(Math.min(s1.y, s2.y) - 18 + laneOffset);
    candidatePoints = [
      p1,
      { x: p1.x, y: canaletaY },
      { x: p2.x, y: canaletaY },
      p2,
    ];
  }

  // =========================================================================
  // CASE 3: Both terminals exit DOWN (e.g. bottom of K1 to bottom of K2)
  // Route cleanly across the lower horizontal canaleta
  // =========================================================================
  else if (exit1.dy === 1 && exit2.dy === 1) {
    const canaletaY = Math.round(Math.max(s1.y, s2.y) + 18 + laneOffset);
    candidatePoints = [
      p1,
      { x: p1.x, y: canaletaY },
      { x: p2.x, y: canaletaY },
      p2,
    ];
  }

  // =========================================================================
  // CASE 4: Terminals pointing in opposite directions but NOT facing each other
  // e.g. p1 exits DOWN and p2 is ABOVE p1 (so p1 points away from p2)
  // or p1 exits UP and p2 is BELOW p1 (so p1 points away from p2)
  // =========================================================================
  else {
    // Find a clean vertical channel between the components or on their outside
    const b1 = comp1 ? getComponentBounds(comp1) : { left: p1.x, right: p1.x, top: p1.y, bottom: p1.y };
    const b2 = comp2 ? getComponentBounds(comp2) : { left: p2.x, right: p2.x, top: p2.y, bottom: p2.y };

    let channelX;
    if (b1.right < b2.left) {
      // Space between comp1 and comp2
      channelX = Math.round((b1.right + b2.left) / 2 + laneOffset);
    } else if (b2.right < b1.left) {
      // Space between comp2 and comp1
      channelX = Math.round((b2.right + b1.left) / 2 + laneOffset);
    } else {
      // Vertically overlapping or near: route via the closer lateral side
      channelX = Math.round(Math.max(b1.right, b2.right) + 24 + laneOffset);
    }

    candidatePoints = [
      p1,
      { x: p1.x, y: s1.y },
      { x: channelX, y: s1.y },
      { x: channelX, y: s2.y },
      { x: p2.x, y: s2.y },
      p2,
    ];
  }

  // =========================================================================
  // OBSTACLE AVOIDANCE: Check if the candidate path cuts into any component
  // =========================================================================
  const hitObstacle = candidateIntersectsObstacle(candidatePoints);
  if (hitObstacle) {
    const obsB = getComponentBounds(hitObstacle);
    // Determine whether bypassing over the top or below the bottom of this specific obstacle is shorter
    const distOverTop = Math.abs(p1.y - obsB.top) + Math.abs(p2.y - obsB.top);
    const distUnderBottom = Math.abs(p1.y - obsB.bottom) + Math.abs(p2.y - obsB.bottom);

    if (distOverTop <= distUnderBottom) {
      const topY = Math.round(obsB.top - 24 + laneOffset);
      candidatePoints = [
        p1,
        { x: p1.x, y: topY },
        { x: p2.x, y: topY },
        p2,
      ];
    } else {
      const bottomY = Math.round(obsB.bottom + 24 + laneOffset);
      candidatePoints = [
        p1,
        { x: p1.x, y: bottomY },
        { x: p2.x, y: bottomY },
        p2,
      ];
    }
  }

  // Clean redundant points and return waypoints
  const simplified = simplifyOrthogonalPoints(candidatePoints);
  return simplified.slice(1, -1);
}

/**
 * Clean up redundant collinear or zero-length points from an orthogonal polyline.
 */
export function simplifyOrthogonalPoints(points) {
  if (!points || points.length <= 2) return points ? points.map((p) => ({ ...p })) : [];

  // 1. Remove duplicate adjacent points
  const noDups = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    const prev = noDups[noDups.length - 1];
    const curr = points[i];
    if (Math.abs(prev.x - curr.x) >= 1 || Math.abs(prev.y - curr.y) >= 1) {
      noDups.push({ ...curr });
    }
  }

  // 2. Remove collinear intermediate points (if 3 consecutive points share same X or Y)
  let changed = true;
  while (changed && noDups.length > 2) {
    changed = false;
    for (let i = 1; i < noDups.length - 1; i++) {
      const pPrev = noDups[i - 1];
      const pCurr = noDups[i];
      const pNext = noDups[i + 1];

      const isCollinearX = Math.abs(pPrev.x - pCurr.x) < 2 && Math.abs(pCurr.x - pNext.x) < 2;
      const isCollinearY = Math.abs(pPrev.y - pCurr.y) < 2 && Math.abs(pCurr.y - pNext.y) < 2;

      if (isCollinearX || isCollinearY) {
        noDups.splice(i, 1);
        changed = true;
        break;
      }
    }
  }

  return noDups;
}

/**
 * Ensures that any non-orthogonal (slanted/diagonal) segment in a wire path
 * is converted into a clean 90-degree orthogonal step, preserving terminal exit orientations.
 */
export function ensureOrthogonalPath(points, exit1, exit2) {
  if (!points || points.length < 2) return points ? points.map((p) => ({ ...p })) : [];

  const result = [{ ...points[0] }];

  for (let i = 0; i < points.length - 1; i++) {
    const a = result[result.length - 1];
    const b = points[i + 1];
    const isFirstSeg = i === 0;
    const isLastSeg = i === points.length - 2;

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    // If already horizontal or vertical (within 1.5px tolerance), push b directly
    if (Math.abs(dx) < 2 || Math.abs(dy) < 2) {
      result.push({ ...b });
      continue;
    }

    // Segment is slanted / diagonal! Insert an orthogonal corner point to fix it cleanly!
    let corner;
    if (isFirstSeg && exit1 && exit1.dx !== 0) {
      // First segment exits horizontally from p1 -> step horizontally first, then vertically
      corner = { x: b.x, y: a.y };
    } else if (isFirstSeg && exit1 && exit1.dy !== 0) {
      // First segment exits vertically from p1 -> step vertically first, then horizontally
      corner = { x: a.x, y: b.y };
    } else if (isLastSeg && exit2 && exit2.dy !== 0) {
      // Last segment enters vertically into p2 -> arrive horizontally first, then vertically into p2
      corner = { x: b.x, y: a.y };
    } else if (isLastSeg && exit2 && exit2.dx !== 0) {
      // Last segment enters horizontally into p2 -> arrive vertically first, then horizontally into p2
      corner = { x: a.x, y: b.y };
    } else {
      // General orthogonal corner
      corner = { x: b.x, y: a.y };
    }

    result.push(corner);
    result.push({ ...b });
  }

  return simplifyOrthogonalPoints(result);
}


/**
 * Prepares points for dragging a segment.
 */
export function splitSegmentForDrag(points, segIdx) {
  const pts = points.map((p) => ({ ...p }));
  let idx = segIdx;

  if (idx === 0) {
    pts.splice(1, 0, { ...pts[0] });
    idx = 1;
  }
  if (idx >= pts.length - 2) {
    pts.splice(pts.length - 1, 0, { ...pts[pts.length - 1] });
  }

  return { points: pts, segIdx: idx };
}

/**
 * Drags an orthogonal segment by delta (dx, dy).
 */
export function dragOrthogonalSegment(points, segIdx, dx, dy) {
  const pts = points.map((p) => ({ ...p }));
  const a = segIdx;
  const b = segIdx + 1;
  if (a < 0 || b >= pts.length) return pts;

  const isHoriz = Math.abs(pts[a].y - pts[b].y) <= Math.abs(pts[a].x - pts[b].x);

  if (isHoriz) {
    const newY = Math.round(pts[a].y + dy);
    pts[a].y = newY;
    pts[b].y = newY;
    if (a > 0) pts[a].x = pts[a - 1].x;
    if (b < pts.length - 1) pts[b].x = pts[b + 1].x;
  } else {
    const newX = Math.round(pts[a].x + dx);
    pts[a].x = newX;
    pts[b].x = newX;
    if (a > 0) pts[a].y = pts[a - 1].y;
    if (b < pts.length - 1) pts[b].y = pts[b + 1].y;
  }

  return pts;
}

/**
 * Find the closest point and distance on a wire polyline from target point (px, py).
 */
export function getClosestPointOnWire(points, px, py) {
  if (!points || points.length < 2) return null;
  let bestPt = null;
  let bestDist = Infinity;
  let bestSegIdx = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? ((px - p1.x) * dx + (py - p1.y) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    const dist = Math.hypot(px - projX, py - projY);

    if (dist < bestDist) {
      bestDist = dist;
      bestPt = { x: Math.round(projX), y: Math.round(projY) };
      bestSegIdx = i;
    }
  }

  return { point: bestPt, distance: bestDist, segIdx: bestSegIdx };
}

/**
 * Build SVG path with Rounded Corner Fillets and Semicircular "Voltinha" (Bridge Jump Arcs).
 *
 * @param {Array} points - Polyline points [P1, ...waypoints, P2]
 * @param {Array} otherWiresPointsList - Array of points arrays of other wires that this wire might cross
 * @param {Array} junctionPoints - Points where wires are intentionally spliced together
 * @returns {string} SVG Path 'd' attribute string
 */
export function buildWirePathWithJumps(points, otherWiresPointsList = [], junctionPoints = []) {
  if (!points || points.length < 2) return '';

  const pts = simplifyOrthogonalPoints(points);
  if (pts.length < 2) return '';

  const jumpRadius = 8;
  const cornerRadius = 14;
  const N = pts.length;

  if (N === 2) {
    // Single straight segment
    return drawStraightSegmentWithJumps(pts[0], pts[1], otherWiresPointsList, junctionPoints, jumpRadius, true);
  }

  // Precompute corner fillet points at each intermediate vertex (1 to N-2)
  const cornerStart = [];
  const cornerEnd = [];
  const canFillet = [];

  for (let i = 1; i < N - 1; i++) {
    const pPrev = pts[i - 1];
    const pCurr = pts[i];
    const pNext = pts[i + 1];

    const dxIn = pCurr.x - pPrev.x;
    const dyIn = pCurr.y - pPrev.y;
    const lenIn = Math.hypot(dxIn, dyIn);

    const dxOut = pNext.x - pCurr.x;
    const dyOut = pNext.y - pCurr.y;
    const lenOut = Math.hypot(dxOut, dyOut);

    const maxR = Math.min(cornerRadius, lenIn / 2.3, lenOut / 2.3);

    if (maxR > 2.5 && lenIn > 0 && lenOut > 0) {
      const uxIn = dxIn / lenIn;
      const uyIn = dyIn / lenIn;
      const uxOut = dxOut / lenOut;
      const uyOut = dyOut / lenOut;

      cornerStart[i] = {
        x: Math.round(pCurr.x - uxIn * maxR),
        y: Math.round(pCurr.y - uyIn * maxR),
      };
      cornerEnd[i] = {
        x: Math.round(pCurr.x + uxOut * maxR),
        y: Math.round(pCurr.y + uyOut * maxR),
      };
      canFillet[i] = true;
    } else {
      cornerStart[i] = { ...pCurr };
      cornerEnd[i] = { ...pCurr };
      canFillet[i] = false;
    }
  }

  // Build the complete path: straight sub-segments + rounded corner fillets
  let d = `M ${Math.round(pts[0].x)} ${Math.round(pts[0].y)}`;

  for (let i = 0; i < N - 1; i++) {
    const segStart = i === 0 ? pts[0] : cornerEnd[i];
    const segEnd = i === N - 2 ? pts[N - 1] : cornerStart[i + 1];

    // Draw straight sub-segment with any bridge jump arcs
    const subSegPath = drawStraightSegmentWithJumps(segStart, segEnd, otherWiresPointsList, junctionPoints, jumpRadius, false);
    d += subSegPath;

    // Draw corner fillet curve at vertex i + 1 (if not at last segment)
    if (i < N - 2) {
      const cornerIdx = i + 1;
      const pCurr = pts[cornerIdx];
      const pEnd = cornerEnd[cornerIdx];

      if (canFillet[cornerIdx]) {
        d += ` Q ${pCurr.x} ${pCurr.y} ${pEnd.x} ${pEnd.y}`;
      } else {
        d += ` L ${pCurr.x} ${pCurr.y}`;
      }
    }
  }

  return d;
}

/**
 * Helper to draw a straight segment with bridge jump arcs ("voltinhas") over crossing wires.
 */
function drawStraightSegmentWithJumps(segStart, segEnd, otherWiresPointsList, junctionPoints, jumpRadius, includeStartMove = false) {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const segLen = Math.hypot(dx, dy);

  let res = includeStartMove ? `M ${Math.round(segStart.x)} ${Math.round(segStart.y)}` : '';

  if (segLen < 1) return res;

  const ux = dx / segLen;
  const uy = dy / segLen;

  // Find all intersections along this sub-segment with other wires
  const intersections = [];
  for (const otherPoints of otherWiresPointsList) {
    if (!otherPoints || otherPoints.length < 2) continue;
    for (let j = 0; j < otherPoints.length - 1; j++) {
      const oStart = otherPoints[j];
      const oEnd = otherPoints[j + 1];
      const hit = getLineIntersection(segStart, segEnd, oStart, oEnd);
      if (hit) {
        // Do not jump if this hit is near an electrical splice junction
        const isJunction = junctionPoints.some(
          (jp) => Math.hypot(jp.x - hit.x, jp.y - hit.y) < 14
        );
        if (!isJunction) {
          intersections.push(hit);
        }
      }
    }
  }

  // Sort intersections along the direction of this segment
  intersections.sort((a, b) => a.u - b.u);

  // Filter out jumps that are too close to endpoints or each other
  const validJumps = [];
  let lastDist = -999;
  for (const inter of intersections) {
    const distAlong = inter.u * segLen;
    if (distAlong > jumpRadius + 4 && distAlong < segLen - (jumpRadius + 4)) {
      if (distAlong - lastDist >= jumpRadius * 2 + 4) {
        validJumps.push({ ...inter, distAlong });
        lastDist = distAlong;
      }
    }
  }

  if (validJumps.length === 0) {
    res += ` L ${Math.round(segEnd.x)} ${Math.round(segEnd.y)}`;
  } else {
    // Semicircular bridge jump arc
    const isHorizontal = Math.abs(dx) >= Math.abs(dy);
    const sweepFlag = isHorizontal ? (dx > 0 ? 0 : 1) : dy > 0 ? 1 : 0;

    for (const jump of validJumps) {
      const jStartX = Math.round(jump.x - ux * jumpRadius);
      const jStartY = Math.round(jump.y - uy * jumpRadius);
      const jEndX = Math.round(jump.x + ux * jumpRadius);
      const jEndY = Math.round(jump.y + uy * jumpRadius);

      res += ` L ${jStartX} ${jStartY}`;
      res += ` A ${jumpRadius} ${jumpRadius} 0 0 ${sweepFlag} ${jEndX} ${jEndY}`;
    }

    res += ` L ${Math.round(segEnd.x)} ${Math.round(segEnd.y)}`;
  }

  return res;
}
