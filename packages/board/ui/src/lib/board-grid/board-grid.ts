import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { GRID_CELL } from '@tsai-pe/board/core';
import type { Point } from '@tsai-pe/shared/models';

/**
 * Infinite 32×32 dot grid drawn as a single CSS `radial-gradient` layer whose
 * `background-position` follows the viewport pan and whose `background-size`
 * scales with zoom. No per-cell DOM is generated, so it is effectively infinite
 * and cheap to pan.
 */
@Component({
  selector: 'pe-board-grid',
  imports: [],
  templateUrl: './board-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block absolute inset-0 overflow-hidden' },
})
export class BoardGrid {
  /** Viewport pan offset in screen pixels. */
  readonly pan = input<Point>({ x: 0, y: 0 });
  /** Viewport zoom factor. */
  readonly zoom = input(1);

  protected readonly cell = computed(() => `${GRID_CELL * this.zoom()}px`);
  protected readonly position = computed(() => {
    const { x, y } = this.pan();
    return `${x}px ${y}px`;
  });
}
