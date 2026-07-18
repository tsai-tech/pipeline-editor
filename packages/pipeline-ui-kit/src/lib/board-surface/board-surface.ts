import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { Point } from '@tsai-pe/models';
import { BoardGrid } from '../board-grid/board-grid';

export interface BoardDrop {
  event: DragEvent;
  local: Point;
}

/**
 * Generic board viewport shell. The host app owns state and gestures; this
 * component provides stable layers and emits raw surface-level events.
 */
@Component({
  selector: 'pe-board-surface',
  imports: [BoardGrid],
  template: `
    @if (grid()) {
      <pe-board-grid [pan]="pan()" [zoom]="zoom()" />
    }
    <div
      class="absolute inset-0 origin-top-left will-change-transform"
      [style.transform]="transform()"
    >
      <ng-content select="[pe-board-world]" />
    </div>
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative block size-full overflow-hidden bg-[var(--canvas-bg)] touch-none',
    '[class.cursor-grab]': '!readonly()',
    '[class.cursor-default]': 'readonly()',
    '(pointerdown)': 'surfacePointerDown.emit($event)',
    '(pointermove)': 'surfacePointerMove.emit($event)',
    '(pointerup)': 'surfacePointerUp.emit($event)',
    '(pointerleave)': 'surfacePointerLeave.emit($event)',
    '(wheel)': 'surfaceWheel.emit($event)',
    '(dragover)': 'onDragOver($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class BoardSurface {
  readonly pan = input<Point>({ x: 0, y: 0 });
  readonly zoom = input(1);
  readonly grid = input(true);
  readonly readonly = input(false);

  readonly surfacePointerDown = output<PointerEvent>();
  readonly surfacePointerMove = output<PointerEvent>();
  readonly surfacePointerUp = output<PointerEvent>();
  readonly surfacePointerLeave = output<PointerEvent>();
  readonly surfaceWheel = output<WheelEvent>();
  readonly boardDrop = output<BoardDrop>();

  protected readonly transform = computed(() => {
    const { x, y } = this.pan();
    return `translate(${x}px, ${y}px) scale(${this.zoom()})`;
  });

  protected onDragOver(event: DragEvent): void {
    if (this.readonly()) return;
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    if (this.readonly()) return;
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.boardDrop.emit({
      event,
      local: { x: event.clientX - rect.left, y: event.clientY - rect.top },
    });
  }
}
