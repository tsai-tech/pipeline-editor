import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GRID_CELL } from '@tsai-pe/board-core';
import type { Point } from '@tsai-pe/models';

/**
 * Infinite dot grid. It follows viewport pan/zoom but owns no board state.
 */
@Component({
  selector: 'pe-board-grid',
  imports: [],
  template: `<div
    class="absolute inset-0 opacity-80"
    [style.background-image]="'radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)'"
    [style.background-size]="cell()"
    [style.background-position]="position()"
  ></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block absolute inset-0 overflow-hidden' },
})
export class BoardGrid {
  readonly pan = input<Point>({ x: 0, y: 0 });
  readonly zoom = input(1);

  protected readonly cell = computed(() => `${GRID_CELL * this.zoom()}px`);
  protected readonly position = computed(() => {
    const { x, y } = this.pan();
    return `${x}px ${y}px`;
  });
}
