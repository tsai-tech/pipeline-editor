import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { EdgeGeometry } from '@tsai-pe/board-core';
import { PipelineEdge, type EdgePointer } from './pipeline-edge';

@Component({
  selector: 'pe-pipeline-edge-layer',
  imports: [PipelineEdge],
  template: `
    <svg
      class="absolute left-0 top-0 h-px w-px overflow-visible pointer-events-none"
    >
      <svg:defs>
        <svg:marker
          [attr.id]="arrowId()"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <svg:path
            class="fill-[var(--edge,rgba(255,255,255,0.28))]"
            d="M 0 1 L 9 5 L 0 9 z"
          />
        </svg:marker>
        <svg:marker
          [attr.id]="activeArrowId()"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <svg:path
            class="fill-[var(--accent,#7c5cff)]"
            d="M 0 1 L 9 5 L 0 9 z"
          />
        </svg:marker>
      </svg:defs>

      @for (edge of edges(); track edge.id) {
        <svg:g
          pe-pipeline-edge
          [edge]="edge"
          [active]="activeEdgeIds().has(edge.id)"
          [marker]="marker()"
          [activeMarker]="activeMarker()"
          (edgePointerDown)="edgePointerDown.emit($event)"
        ></svg:g>
      }

      @if (draftPath(); as path) {
        <svg:path
          class="fill-none stroke-[var(--accent,#7c5cff)] [stroke-width:2] [stroke-dasharray:6_5] [pointer-events:none]"
          [attr.d]="path"
          [attr.marker-end]="activeMarker()"
        />
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineEdgeLayer {
  readonly edges = input<readonly EdgeGeometry[]>([]);
  readonly activeEdgeIds = input<ReadonlySet<string>>(new Set());
  readonly draftPath = input<string | null>(null);
  readonly markerPrefix = input('pe');

  readonly edgePointerDown = output<EdgePointer>();

  protected arrowId(): string {
    return `${this.markerPrefix()}-arrow`;
  }

  protected activeArrowId(): string {
    return `${this.markerPrefix()}-arrow-active`;
  }

  protected marker(): string {
    return `url(#${this.arrowId()})`;
  }

  protected activeMarker(): string {
    return `url(#${this.activeArrowId()})`;
  }
}
