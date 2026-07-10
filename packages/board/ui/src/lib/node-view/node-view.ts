import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { GRID_CELL } from '@tsai-pe/board/core';
import { type BoardNode, type NodePort, nodeType } from '@tsai-pe/shared/models';
import { NODE_META } from './node-meta';

/** A raw pointer intent originating from a specific port. */
export interface PortPointer {
  port: NodePort;
  event: PointerEvent;
}

/**
 * Presentational node. Positioned in world pixels (absolute, inside the board's
 * transformed world layer). Visually distinct per node type via {@link NODE_META}
 * (rail color + icon). Emits raw pointer intents; the feature layer owns state.
 */
@Component({
  selector: 'pe-node',
  imports: [LucideAngularModule],
  templateUrl: './node-view.html',
  styleUrl: './node-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.pe-node--selected]': 'selected()',
    '[class.pe-node--connecting]': 'connecting()',
    '[attr.data-node-id]': 'node().id',
    '[style.left.px]': 'rect().x',
    '[style.top.px]': 'rect().y',
    '[style.width.px]': 'rect().width',
    '[style.height.px]': 'rect().height',
    '[style.--node-accent]': 'meta().color',
    '(dblclick)': 'onOpen($event)',
  },
})
export class NodeView {
  readonly node = input.required<BoardNode>();
  readonly selected = input(false);
  /** True while a connection is being drawn — input ports light up as targets. */
  readonly connecting = input(false);
  /** Id of the port currently being magnet-targeted, if it belongs to this node. */
  readonly targetPort = input<string | null>(null);

  /** Pointer went down on the node body (select / start move). */
  readonly bodyPointerDown = output<PointerEvent>();
  /** Pointer went down on a port (start drawing a connection from an output). */
  readonly portPointerDown = output<PortPointer>();
  /** Pointer released over a port (drop a connection onto an input). */
  readonly portPointerUp = output<PortPointer>();
  /** Double-click — request opening the node inspector. */
  readonly openRequested = output<void>();

  protected readonly typeLabel = computed(() => this.meta().label);

  protected readonly meta = computed(() => NODE_META[nodeType(this.node())]);

  protected readonly rect = computed(() => {
    const n = this.node();
    return {
      x: n.pos.col * GRID_CELL,
      y: n.pos.row * GRID_CELL,
      width: n.size.cols * GRID_CELL,
      height: n.size.rows * GRID_CELL,
    };
  });

  protected onBodyPointerDown(event: PointerEvent): void {
    this.bodyPointerDown.emit(event);
  }

  protected onPortPointerDown(port: NodePort, event: PointerEvent): void {
    event.stopPropagation();
    this.portPointerDown.emit({ port, event });
  }

  protected onPortPointerUp(port: NodePort, event: PointerEvent): void {
    event.stopPropagation();
    this.portPointerUp.emit({ port, event });
  }

  protected onOpen(event: MouseEvent): void {
    event.preventDefault();
    this.openRequested.emit();
  }

  /** Human tooltip for a port. */
  protected portTitle(port: NodePort): string {
    return port.role === 'input'
      ? 'Input — receives data'
      : `Output (${port.side}) — drag to connect`;
  }
}
