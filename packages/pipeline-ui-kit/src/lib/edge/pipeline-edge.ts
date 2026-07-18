import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { EdgeGeometry } from '@tsai-pe/board-core';

export interface EdgePointer {
  edgeId: string;
  event: PointerEvent;
}

@Component({
  selector: 'pe-pipeline-edge',
  imports: [],
  template: `
    <svg:g class="group cursor-pointer" (pointerdown)="onPointerDown($event)">
      <svg:title>{{ edge().label }}</svg:title>
      <svg:path
        class="fill-none stroke-[transparent] [stroke-width:16] [pointer-events:stroke]"
        [attr.d]="edge().path"
      />
      <svg:path
        [class]="pathClasses()"
        [attr.d]="edge().path"
        [attr.marker-end]="
          active() || edge().selected ? activeMarker() : marker()
        "
      />
      @if (edge().midLabel; as label) {
        <svg:text
          class="fill-[var(--text-2)] stroke-[var(--canvas-bg)] [stroke-width:3] [paint-order:stroke] text-[10px] font-medium [pointer-events:none] select-none"
          text-anchor="middle"
          dominant-baseline="central"
          [attr.x]="edge().mid.x"
          [attr.y]="edge().mid.y"
        >
          {{ label }}
        </svg:text>
      }
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineEdge {
  readonly edge = input.required<EdgeGeometry>();
  readonly active = input(false);
  readonly marker = input('url(#pe-arrow)');
  readonly activeMarker = input('url(#pe-arrow-active)');

  readonly edgePointerDown = output<EdgePointer>();

  protected readonly pathClasses = computed(() => {
    const active = this.active() || this.edge().selected;
    return (
      'fill-none [stroke-width:2.25] transition-[stroke,stroke-width,opacity] ' +
      (active
        ? 'stroke-[var(--accent)] [stroke-width:3]'
        : 'stroke-[var(--edge)] group-hover:stroke-[var(--text-3)]')
    );
  });

  protected onPointerDown(event: PointerEvent): void {
    this.edgePointerDown.emit({ edgeId: this.edge().id, event });
  }
}
