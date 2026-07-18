import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { GRID_CELL } from '@tsai-pe/board-core';
import {
  type BoardNode,
  type NodePort,
  type NodeStatus,
  nodeType,
  portFraction,
  type PortSide,
} from '@tsai-pe/models';
import { LucideAngularModule } from 'lucide-angular';
import { CONTROL_FLOW_ICONS, NODE_META } from './node-meta';

export interface PortPointer {
  port: NodePort;
  event: PointerEvent;
}

const PORT_POSITION: Record<PortSide, string> = {
  left: 'left-[-11px] -translate-y-1/2',
  right: 'right-[-11px] -translate-y-1/2',
  top: 'top-[-11px] -translate-x-1/2',
  bottom: 'bottom-[-11px] -translate-x-1/2',
};

@Component({
  selector: 'pe-pipeline-node',
  imports: [LucideAngularModule],
  templateUrl: './pipeline-node.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block absolute select-none',
    '[attr.data-node-id]': 'node().id',
    '[style.left.px]': 'rect().x',
    '[style.top.px]': 'rect().y',
    '[style.width.px]': 'rect().width',
    '[style.height.px]': 'rect().height',
    '[style.--node-accent]': 'meta().color',
    '(pointerenter)': 'hovered.set(true)',
    '(pointerleave)': 'hovered.set(false)',
    '(dblclick)': 'onOpen($event)',
  },
})
export class PipelineNode {
  readonly node = input.required<BoardNode>();
  readonly selected = input(false);
  readonly connecting = input(false);
  readonly targetPort = input<string | null>(null);
  readonly resizable = input(true);
  readonly runStatus = input<NodeStatus | undefined>(undefined);
  readonly runError = input<string | undefined>(undefined);
  readonly buffer = input<{ done: number; total: number } | undefined>(
    undefined,
  );

  readonly bodyPointerDown = output<PointerEvent>();
  readonly portPointerDown = output<PortPointer>();
  readonly portPointerUp = output<PortPointer>();
  readonly openRequested = output<void>();
  readonly resizePointerDown = output<PointerEvent>();
  readonly resizeAuto = output<void>();

  protected readonly hovered = signal(false);

  protected readonly bufferSizeLabel = computed(() => {
    const total = this.buffer()?.total;
    if (typeof total === 'number' && Number.isFinite(total))
      return String(total);
    const configured = this.node().bufferSize;
    return typeof configured === 'number' && Number.isFinite(configured)
      ? String(configured)
      : 'N';
  });

  protected readonly meta = computed(() => {
    const node = this.node();
    const base = NODE_META[nodeType(node)];
    if (
      node.category === 'control-flow' &&
      (node.type === 'if' || node.type === 'switch' || node.type === 'filter')
    ) {
      return { ...base, icon: CONTROL_FLOW_ICONS[node.type] };
    }
    if (node.category === 'control-flow' && node.config) {
      return { ...base, icon: CONTROL_FLOW_ICONS[node.config.type] };
    }
    return base;
  });

  protected readonly rect = computed(() => {
    const n = this.node();
    return {
      x: n.pos.col * GRID_CELL,
      y: n.pos.row * GRID_CELL,
      width: n.size.cols * GRID_CELL,
      height: n.size.rows * GRID_CELL,
    };
  });

  protected readonly statusOverlay = computed(() => {
    switch (this.runStatus() ?? this.node().status) {
      case 'running':
        return {
          ring: 'border-2 border-[var(--info)] shadow-[0_0_16px_var(--info)] animate-pulse',
          dot: 'bg-[var(--info)] animate-pulse',
        };
      case 'success':
        return {
          ring: 'border-2 border-[var(--success)]',
          dot: 'bg-[var(--success)]',
        };
      case 'error':
        return {
          ring: 'border-2 border-[var(--danger)]',
          dot: 'bg-[var(--danger)]',
        };
      case 'skipped':
        return {
          ring: 'border-2 border-dashed border-[var(--border)] opacity-70',
          dot: 'bg-[var(--text-3,var(--text-2))]',
        };
      default:
        return null;
    }
  });

  protected readonly showError = computed(
    () =>
      (this.runStatus() ?? this.node().status) === 'error' && !!this.runError(),
  );

  protected readonly bodyClasses = computed(() => {
    const base =
      'relative flex h-full items-center gap-2.5 overflow-hidden rounded-[var(--r-md)] border bg-[var(--surface-2)] pr-3.5 pl-4 cursor-grab select-none transition-[border-color,box-shadow] duration-150 active:cursor-grabbing';
    return this.selected()
      ? `${base} border-[var(--node-accent)] shadow-[var(--elev-2),0_0_0_1px_var(--node-accent)]`
      : `${base} border-[var(--border)] shadow-[var(--elev-1)]`;
  });

  protected fraction(port: NodePort): number {
    return portFraction(this.node(), port) * 100;
  }

  protected isAlongY(side: PortSide): boolean {
    return side === 'left' || side === 'right';
  }

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

  protected onResizeDown(event: PointerEvent): void {
    event.stopPropagation();
    this.resizePointerDown.emit(event);
  }

  protected onResizeAuto(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizeAuto.emit();
  }

  protected portClasses(port: NodePort): string {
    return (
      'pe-port group absolute grid h-[22px] w-[22px] place-items-center bg-transparent p-0 cursor-crosshair ' +
      PORT_POSITION[port.side]
    );
  }

  protected dotClasses(port: NodePort): string {
    const shape =
      port.role === 'output'
        ? 'rounded-full border-[var(--node-accent)] bg-[var(--node-accent)]'
        : 'rounded-[3px] border-[var(--port-border)] bg-[var(--surface-1)]';
    const base =
      'h-[11px] w-[11px] border-2 transition-[transform,opacity,border-color,background] duration-150 group-hover:scale-[1.3] group-hover:border-[var(--node-accent)] group-hover:opacity-100 ' +
      shape;

    if (this.targetPort() === port.id) {
      return `${base} scale-150 opacity-100 border-[var(--node-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--node-accent)_22%,transparent)]`;
    }
    const reveal =
      this.selected() ||
      this.hovered() ||
      (this.connecting() && port.role === 'input');
    return `${base} ${reveal ? 'opacity-100' : 'opacity-35'}`;
  }

  protected portTitle(port: NodePort): string {
    return port.role === 'input'
      ? 'Input - receives data'
      : `Output (${port.side}) - drag to connect`;
  }
}
