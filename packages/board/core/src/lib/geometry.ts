import type {
  BoardNode,
  GridPos,
  NodePort,
  Point,
  Rect,
} from '@tsai-pe/shared/models';

/** Size of one node-grid cell, in board (world) pixels. */
export const GRID_CELL = 32;

/**
 * Size of one connection-routing subcell, in board pixels. 32 / 16 = 2, so each
 * node cell contains a 2×2 block of subcells (~4 per cell).
 */
export const GRID_SUBCELL = 16;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Top-left corner of a grid cell in world pixels. */
export function cellToPx(pos: GridPos): Point {
  return { x: pos.col * GRID_CELL, y: pos.row * GRID_CELL };
}

/** Snap a world-pixel point to the nearest 32-grid cell. */
export function snapToCell(point: Point): GridPos {
  return {
    col: Math.round(point.x / GRID_CELL),
    row: Math.round(point.y / GRID_CELL),
  };
}

/** A node's bounding rectangle in world pixels. */
export function nodeRect(node: BoardNode): Rect {
  return {
    x: node.pos.col * GRID_CELL,
    y: node.pos.row * GRID_CELL,
    width: node.size.cols * GRID_CELL,
    height: node.size.rows * GRID_CELL,
  };
}

/** World-pixel position of a port anchor on a node. */
export function portAnchor(node: BoardNode, port: NodePort): Point {
  const r = nodeRect(node);
  switch (port.side) {
    case 'left':
      return { x: r.x, y: r.y + r.height / 2 };
    case 'right':
      return { x: r.x + r.width, y: r.y + r.height / 2 };
    case 'top':
      return { x: r.x + r.width / 2, y: r.y };
    case 'bottom':
      return { x: r.x + r.width / 2, y: r.y + r.height };
  }
}

/** Whether a point lies within a rectangle (inclusive of edges). */
export function rectContains(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * SVG cubic-bezier path between two anchors, with horizontal tangents that fan out
 * from the source and into the target — the familiar n8n / flow-editor look.
 */
export function edgePath(from: Point, to: Point): string {
  const dx = Math.max(48, Math.abs(to.x - from.x) * 0.5);
  return `M ${from.x},${from.y} C ${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;
}
