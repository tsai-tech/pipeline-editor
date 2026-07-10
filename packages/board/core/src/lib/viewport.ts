import { computed, signal, Signal } from '@angular/core';
import type { Point } from '@tsai-pe/shared/models';
import { clamp } from './geometry';

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.5;

/** Viewport pan/zoom state for the board, backed by Angular signals. */
export class Viewport {
  private readonly _pan = signal<Point>({ x: 0, y: 0 });
  private readonly _zoom = signal<number>(1);

  readonly pan: Signal<Point> = this._pan.asReadonly();
  readonly zoom: Signal<number> = this._zoom.asReadonly();

  /** The current view transform as a CSS `transform` string. */
  readonly transform: Signal<string> = computed(() => {
    const { x, y } = this._pan();
    return `translate(${x}px, ${y}px) scale(${this._zoom()})`;
  });

  setPan(pan: Point): void {
    this._pan.set(pan);
  }

  panBy(delta: Point): void {
    this._pan.update((p) => ({ x: p.x + delta.x, y: p.y + delta.y }));
  }

  setZoom(zoom: number): void {
    this._zoom.set(clamp(zoom, MIN_ZOOM, MAX_ZOOM));
  }

  /**
   * Zoom by a multiplicative `factor` while keeping the given screen-space point
   * anchored (so content under the cursor stays put).
   */
  zoomAround(screenPoint: Point, factor: number): void {
    const next = clamp(this._zoom() * factor, MIN_ZOOM, MAX_ZOOM);
    const pan = this._pan();
    const zoom = this._zoom();
    // Keep the board point under the cursor fixed on screen.
    const boardX = (screenPoint.x - pan.x) / zoom;
    const boardY = (screenPoint.y - pan.y) / zoom;
    this._pan.set({
      x: screenPoint.x - boardX * next,
      y: screenPoint.y - boardY * next,
    });
    this._zoom.set(next);
  }

  reset(): void {
    this._pan.set({ x: 0, y: 0 });
    this._zoom.set(1);
  }

  /** Convert a point from screen space to board (world) space. */
  screenToBoard(point: Point): Point {
    const pan = this._pan();
    const zoom = this._zoom();
    return { x: (point.x - pan.x) / zoom, y: (point.y - pan.y) / zoom };
  }

  /** Convert a point from board (world) space to screen space. */
  boardToScreen(point: Point): Point {
    const pan = this._pan();
    const zoom = this._zoom();
    return { x: point.x * zoom + pan.x, y: point.y * zoom + pan.y };
  }
}
