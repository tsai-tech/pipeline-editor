/**
 * Pure board / pipeline data-model types. No framework dependencies.
 *
 * Design notes (see ARCHITECTURE.md):
 * - Nodes are positioned on a 32-unit grid (`GridPos`, in cells).
 * - Connections are always **1:1** (one output port → one input port). merge and
 *   split are *nodes*, not a connection cardinality: `merge` buffers N incoming
 *   events and emits a single `Array[N]`; `split` receives an array and emits each
 *   element downstream. See `ActionCategory`.
 * - Every node conceptually has access to the whole-pipeline execution context at
 *   runtime; that is a backend concern, but the model leaves room for it (`data`).
 */

/** A point in board (world) coordinate space, in pixels. */
export interface Point {
  x: number;
  y: number;
}

/** A width/height pair in board coordinate space, in pixels. */
export interface Size {
  width: number;
  height: number;
}

/** An axis-aligned rectangle in board coordinate space, in pixels. */
export interface Rect extends Point, Size {}

/** Integer cell coordinates on the 32-unit node grid. */
export interface GridPos {
  col: number;
  row: number;
}

/** Integer cell coordinates on the 16-unit connection-routing subgrid. */
export interface SubPos {
  col: number;
  row: number;
}

/** Node size expressed in 32-unit grid cells. */
export interface CellSize {
  cols: number;
  rows: number;
}

/** Coarse node family. Determines the fundamental shape and port layout. */
export type NodeKind = 'trigger' | 'action' | 'effect';

/**
 * Sub-category of an `action` node. Each gets a distinct icon/look:
 * - `control-flow` — if / switch / filter routing.
 * - `transform`    — pure computation / mapping.
 * - `integration`  — external calls (LLM, HTTP, image gen, …).
 * - `split`        — receives an array, emits each element downstream (queue).
 * - `merge`        — buffers N incoming events, emits a single `Array[N]`.
 */
export type ActionCategory =
  | 'control-flow'
  | 'transform'
  | 'integration'
  | 'split'
  | 'merge';

/**
 * Flattened node "type" used by the visual registry (icon + accent). Derived from
 * `kind` (+ `category` for actions).
 */
export type NodeType =
  | 'trigger'
  | 'effect'
  | 'control-flow'
  | 'transform'
  | 'integration'
  | 'split'
  | 'merge';

/** Which edge of a node a port sits on. Left = input; right/top/bottom = output. */
export type PortSide = 'left' | 'right' | 'top' | 'bottom';

/** Direction of data flow through a port. */
export type PortRole = 'input' | 'output';

/** A connection anchor on a node. */
export interface NodePort {
  id: string;
  role: PortRole;
  side: PortSide;
  /** Optional label, e.g. a control-flow branch name ("then" / "else"). */
  label?: string;
}

/** A node placed on the board. */
export interface BoardNode {
  id: string;
  kind: NodeKind;
  /** Present (and required) when `kind === 'action'`. */
  category?: ActionCategory;
  title: string;
  subtitle?: string;
  /** Top-left cell on the 32-unit grid. */
  pos: GridPos;
  /** Footprint in grid cells. */
  size: CellSize;
  ports: NodePort[];
  /**
   * effect only — whether failure fails the whole run (required) or is ignored
   * (optional, e.g. a logger). Undefined ⇒ treated as required.
   */
  required?: boolean;
  /** merge only — how many events to buffer before emitting (may be dynamic at runtime). */
  bufferSize?: number;
  /** Arbitrary per-node config / runtime hints. */
  data?: Record<string, unknown>;
}

/** One end of a connection: a specific port on a specific node. */
export interface EdgeEnd {
  nodeId: string;
  portId: string;
}

/** A directed **1:1** connection from an output port to an input port. */
export interface Edge {
  id: string;
  /** Output side. */
  source: EdgeEnd;
  /** Input side. */
  target: EdgeEnd;
  /** Optional 16-subgrid waypoints for future routing. */
  waypoints?: SubPos[];
}

/** The full serializable pipeline document. */
export interface Pipeline {
  id: string;
  name: string;
  nodes: BoardNode[];
  edges: Edge[];
}

/** Resolve a node's flattened visual type from its kind/category. */
export function nodeType(node: Pick<BoardNode, 'kind' | 'category'>): NodeType {
  if (node.kind === 'trigger') return 'trigger';
  if (node.kind === 'effect') return 'effect';
  return node.category ?? 'transform';
}

/**
 * Default port layout for a node kind:
 * - trigger: 3 output anchors (right / top / bottom), no input.
 * - action:  1 input (left) + 3 output anchors.
 * - effect:  1 input (left) only — its response is ignored, so it is terminal.
 */
export function defaultPorts(kind: NodeKind): NodePort[] {
  const outputs: NodePort[] = [
    { id: 'out-right', role: 'output', side: 'right' },
    { id: 'out-top', role: 'output', side: 'top' },
    { id: 'out-bottom', role: 'output', side: 'bottom' },
  ];
  const input: NodePort = { id: 'in', role: 'input', side: 'left' };

  switch (kind) {
    case 'trigger':
      return outputs;
    case 'effect':
      return [input];
    default:
      return [input, ...outputs];
  }
}
