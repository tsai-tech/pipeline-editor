import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { BoardStore } from '@tsai-pe/board-core';
import {
  BoardSurface,
  NodeInspector,
  NodePicker,
  type NodePickerItem,
  PipelineEdgeLayer,
  PipelineNode,
} from '@tsai-pe/pipeline-ui-kit';
import type { BoardNode, Pipeline } from '@tsai-pe/models';
import { MOCK_NODE_CATALOG } from '@tsai-pe/workflow-mock';
import { Button } from '@tsai-pe/ui-kit';

const SIZE = { cols: 7, rows: 2 } as const;

function node(spec: Omit<BoardNode, 'ports'>): BoardNode {
  return { ...spec, ports: MOCK_NODE_CATALOG.ports({ ...spec, ports: [] }) };
}

const PIPELINE: Pipeline = {
  id: 'pipeline-ui-kit-demo',
  name: 'Composable primitives demo',
  nodes: [
    node({
      id: 'trigger',
      type: 'webhook-trigger',
      kind: 'trigger',
      title: 'Webhook',
      subtitle: 'POST /lead',
      pos: { col: 2, row: 3 },
      size: SIZE,
      data: { method: 'POST', path: '/lead' },
    }),
    node({
      id: 'score',
      type: 'llm-agent',
      kind: 'action',
      category: 'integration',
      title: 'Score Lead',
      subtitle: 'classify intent',
      pos: { col: 13, row: 3 },
      size: SIZE,
      data: {
        model: 'mock-llm',
        prompt: 'Score {{ $json.body.email }}',
        mockOutput: { score: 0.91 },
      },
    }),
    node({
      id: 'branch',
      type: 'if',
      kind: 'action',
      category: 'control-flow',
      title: 'High intent?',
      subtitle: '$json.score > 0.8',
      pos: { col: 24, row: 3 },
      size: { cols: 8, rows: 3 },
      data: { expression: '$json.score > 0.8' },
    }),
  ],
  edges: [
    {
      id: 'e1',
      source: { nodeId: 'trigger', portId: 'out-right' },
      target: { nodeId: 'score', portId: 'in' },
    },
    {
      id: 'e2',
      source: { nodeId: 'score', portId: 'out-right' },
      target: { nodeId: 'branch', portId: 'in' },
    },
  ],
};

@Component({
  selector: 'app-pipeline-ui-kit-playground',
  imports: [
    BoardSurface,
    PipelineEdgeLayer,
    PipelineNode,
    NodePicker,
    NodeInspector,
    Button,
  ],
  template: `
    <div
      class="grid h-full min-h-[680px] grid-cols-[280px_minmax(0,1fr)_320px] overflow-hidden rounded-[var(--r-md)] border border-border bg-surface-1 shadow-elev-1"
    >
      <aside class="min-h-0 border-r border-border">
        <header class="border-b border-border px-3 py-3">
          <h1 class="text-sm font-semibold text-text">Pipeline UI Kit</h1>
          <p class="mt-0.5 text-xs text-text-3">
            Picker emits items; the host decides where to place them.
          </p>
        </header>
        <pe-node-picker [catalog]="catalog" (nodeSelected)="addNode($event)" />
      </aside>

      <section class="relative min-w-0">
        <pe-board-surface
          [pan]="store.viewport.pan()"
          [zoom]="store.viewport.zoom()"
        >
          <ng-container pe-board-world>
            <pe-pipeline-edge-layer
              [edges]="store.edgeGeometries()"
              [activeEdgeIds]="activeEdges()"
              (edgePointerDown)="selectEdge($event.edgeId)"
            />
            @for (node of store.nodes(); track node.id) {
              <pe-pipeline-node
                [node]="node"
                [selected]="selectedId() === node.id"
                [runStatus]="status()"
                (bodyPointerDown)="selectNode(node.id)"
                (openRequested)="selectNode(node.id)"
              />
            }
          </ng-container>

          <div
            class="absolute top-3 right-3 z-10 flex gap-1 rounded-[var(--r-sm)] border border-border bg-surface-2 p-1 shadow-elev-1"
          >
            <tsai-button size="sm" variant="secondary" (click)="fit()">
              Fit
            </tsai-button>
            <tsai-button
              size="sm"
              variant="secondary"
              (click)="toggleRunStatus()"
            >
              {{ status() === 'running' ? 'Idle' : 'Running' }}
            </tsai-button>
          </div>
        </pe-board-surface>
      </section>

      <aside class="min-h-0 overflow-y-auto border-l border-border p-4">
        @if (selectedNode(); as node) {
          <div class="mb-4">
            <h2 class="text-sm font-semibold text-text">Node Inspector</h2>
            <p class="mt-0.5 text-xs text-text-3">
              The inspector emits updated nodes; this panel is owned by the app.
            </p>
          </div>
          <pe-node-inspector
            [node]="node"
            [catalog]="catalog"
            (nodeChange)="updateNode($event)"
          />
        } @else {
          <div
            class="rounded-sm border border-border bg-surface-2 p-3 text-sm text-text-2"
          >
            Select a node or edge on the board.
          </div>
        }
      </aside>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineUiKitPlayground {
  protected readonly catalog = MOCK_NODE_CATALOG;
  protected readonly store = new BoardStore(MOCK_NODE_CATALOG);
  protected readonly selectedId = signal('trigger');
  protected readonly selectedEdgeId = signal<string | null>(null);
  protected readonly status = signal<'idle' | 'running'>('idle');

  protected readonly selectedNode = computed(() =>
    this.store.nodes().find((node) => node.id === this.selectedId()),
  );
  protected readonly activeEdges = computed(() => {
    const id = this.selectedEdgeId();
    return id ? new Set([id]) : new Set<string>();
  });

  constructor() {
    this.store.load(PIPELINE);
    this.store.viewport.fitTo(this.store.contentBounds(), {
      width: 900,
      height: 560,
    });
  }

  protected selectNode(id: string): void {
    this.selectedId.set(id);
    this.selectedEdgeId.set(null);
    this.store.select(id);
  }

  protected selectEdge(id: string): void {
    this.selectedEdgeId.set(id);
    this.store.select(id);
  }

  protected addNode(item: NodePickerItem): void {
    const id = this.store.addNode({
      kind: item.kind,
      category: item.category,
      type: item.id,
      title: item.label,
      pos: { col: 8 + this.store.nodes().length * 2, row: 10 },
      data: item.data,
    });
    this.selectNode(id);
  }

  protected updateNode(node: BoardNode): void {
    this.store.updateNode(node.id, node);
  }

  protected fit(): void {
    this.store.viewport.fitTo(this.store.contentBounds(), {
      width: 900,
      height: 560,
    });
  }

  protected toggleRunStatus(): void {
    this.status.set(this.status() === 'running' ? 'idle' : 'running');
  }
}
