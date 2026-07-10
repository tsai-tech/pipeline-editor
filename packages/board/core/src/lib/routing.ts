import type { BoardNode, Point, PortSide } from '@tsai-pe/shared/models';
import { GRID_SUBCELL, nodeRect } from './geometry';

/**
 * Orthogonal edge routing on the 16-unit subgrid via A*.
 *
 * Connections leave a port along its outward normal, then find a Manhattan path
 * to the target that:
 * - **avoids nodes** — each node rectangle (inflated by a margin) blocks cells;
 * - **avoids other edges** — cells already used by previously-routed edges cost
 *   extra, so connections softly repel each other instead of overlapping;
 * - **prefers straight runs** — turns are penalized, so paths stay tidy.
 *
 * Falls back (returns `null`) when the search area is too large or no path is
 * found, so the caller can draw a simple bezier instead.
 */

const S = GRID_SUBCELL;
const MARGIN = 1; // subcells of clearance kept around every node
const STUB = 2; // subcells a connection travels straight out of its port
const PAD = 6; // extra subcells of search area around obstacles
const TURN_COST = 3; // penalty per 90° turn — keeps routes straight
const CROSS_COST = 8; // penalty for entering a cell used by another edge
const MAX_CELLS = 60_000; // bail out (→ bezier) beyond this search area
const MAX_ITERS = 40_000;
const CORNER_R = 6; // rounded-corner radius, world px

interface Vec {
  x: number;
  y: number;
}

interface OpenNode {
  f: number;
  g: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/** The result of routing one edge. */
export interface EdgeRoute {
  /** Rounded orthogonal SVG path in world px. */
  path: string;
  /** Every subgrid cell the route occupies (fed back for edge-avoidance). */
  cells: string[];
}

function normal(side: PortSide): Vec {
  switch (side) {
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    case 'top':
      return { x: 0, y: -1 };
    case 'bottom':
      return { x: 0, y: 1 };
  }
}

export function routeEdge(
  from: Point,
  to: Point,
  fromSide: PortSide,
  toSide: PortSide,
  nodes: readonly BoardNode[],
  occupied: ReadonlySet<string>,
): EdgeRoute | null {
  const fn = normal(fromSide);
  const tn = normal(toSide);
  const start: Vec = {
    x: Math.round(from.x / S) + fn.x * STUB,
    y: Math.round(from.y / S) + fn.y * STUB,
  };
  const goal: Vec = {
    x: Math.round(to.x / S) + tn.x * STUB,
    y: Math.round(to.y / S) + tn.y * STUB,
  };

  // Inflated node rectangles, in subgrid coordinates.
  const rects = nodes.map((n) => {
    const r = nodeRect(n);
    return {
      x0: Math.floor(r.x / S) - MARGIN,
      y0: Math.floor(r.y / S) - MARGIN,
      x1: Math.ceil((r.x + r.width) / S) + MARGIN,
      y1: Math.ceil((r.y + r.height) / S) + MARGIN,
    };
  });
  const blocked = (x: number, y: number): boolean =>
    rects.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1);

  let minX = Math.min(start.x, goal.x);
  let minY = Math.min(start.y, goal.y);
  let maxX = Math.max(start.x, goal.x);
  let maxY = Math.max(start.y, goal.y);
  for (const r of rects) {
    minX = Math.min(minX, r.x0);
    minY = Math.min(minY, r.y0);
    maxX = Math.max(maxX, r.x1);
    maxY = Math.max(maxY, r.y1);
  }
  minX -= PAD;
  minY -= PAD;
  maxX += PAD;
  maxY += PAD;

  if ((maxX - minX) * (maxY - minY) > MAX_CELLS) return null;
  if (blocked(start.x, start.y) || blocked(goal.x, goal.y)) return null;

  const inBounds = (x: number, y: number): boolean =>
    x >= minX && x <= maxX && y >= minY && y <= maxY;
  const heuristic = (x: number, y: number): number =>
    Math.abs(x - goal.x) + Math.abs(y - goal.y);
  const key = (x: number, y: number, dx: number, dy: number): string =>
    `${x},${y},${dx},${dy}`;

  const dirs: Vec[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  // Binary min-heap keyed on f.
  const heap: OpenNode[] = [];
  const push = (n: OpenNode): void => {
    heap.push(n);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p].f <= heap[i].f) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = (): OpenNode => {
    const top = heap[0];
    const last = heap.pop() as OpenNode;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let s = i;
        if (l < heap.length && heap[l].f < heap[s].f) s = l;
        if (r < heap.length && heap[r].f < heap[s].f) s = r;
        if (s === i) break;
        [heap[s], heap[i]] = [heap[i], heap[s]];
        i = s;
      }
    }
    return top;
  };

  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const cellOf = new Map<string, Vec>();

  const startKey = key(start.x, start.y, fn.x, fn.y);
  gScore.set(startKey, 0);
  cellOf.set(startKey, { x: start.x, y: start.y });
  push({ f: heuristic(start.x, start.y), g: 0, ...start, dx: fn.x, dy: fn.y });

  let goalKey: string | null = null;
  let iters = 0;
  while (heap.length) {
    if (++iters > MAX_ITERS) return null;
    const cur = pop();
    const curKey = key(cur.x, cur.y, cur.dx, cur.dy);
    if (cur.g > (gScore.get(curKey) ?? Infinity)) continue;
    if (cur.x === goal.x && cur.y === goal.y) {
      goalKey = curKey;
      break;
    }
    for (const d of dirs) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (!inBounds(nx, ny) || blocked(nx, ny)) continue;
      const turn = cur.dx !== d.x || cur.dy !== d.y ? TURN_COST : 0;
      const cross = occupied.has(`${nx},${ny}`) ? CROSS_COST : 0;
      const ng = cur.g + 1 + turn + cross;
      const nk = key(nx, ny, d.x, d.y);
      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        cameFrom.set(nk, curKey);
        cellOf.set(nk, { x: nx, y: ny });
        push({ f: ng + heuristic(nx, ny), g: ng, x: nx, y: ny, dx: d.x, dy: d.y });
      }
    }
  }

  if (!goalKey) return null;

  const cellPath: Vec[] = [];
  let k: string | undefined = goalKey;
  while (k) {
    cellPath.push(cellOf.get(k) as Vec);
    k = cameFrom.get(k);
  }
  cellPath.reverse();

  const cells = cellPath.map((c) => `${c.x},${c.y}`);
  const points: Point[] = [
    from,
    ...cellPath.map((c) => ({ x: c.x * S, y: c.y * S })),
    to,
  ];
  return { path: roundedPath(simplify(points), CORNER_R), cells };
}

/** Drop points that lie on a straight run, keeping only corners + endpoints. */
function simplify(points: Point[]): Point[] {
  if (points.length <= 2) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = out[out.length - 1];
    const b = points[i];
    const c = points[i + 1];
    const collinear = (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y);
    if (!collinear) out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** A point `d` px from `from` toward `to`. */
function toward(from: Point, to: Point, d: number): Point {
  const len = distance(from, to) || 1;
  return { x: from.x + ((to.x - from.x) / len) * d, y: from.y + ((to.y - from.y) / len) * d };
}

/** Build an SVG path through the corner points, rounding each bend. */
function roundedPath(points: Point[], radius: number): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const r = Math.min(
      radius,
      distance(prev, corner) / 2,
      distance(corner, next) / 2,
    );
    const a = toward(corner, prev, r);
    const b = toward(corner, next, r);
    d += ` L ${a.x},${a.y} Q ${corner.x},${corner.y} ${b.x},${b.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x},${last.y}`;
  return d;
}
