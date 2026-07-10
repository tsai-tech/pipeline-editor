import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Board } from '@tsai-pe/board/feature';
import {
  type BoardNode,
  defaultPorts,
  type Pipeline,
} from '@tsai-pe/shared/models';

/** Build a node, deriving its default port layout from its kind. */
function node(spec: Omit<BoardNode, 'ports'>): BoardNode {
  return { ...spec, ports: defaultPorts(spec.kind) };
}

const SIZE = { cols: 8, rows: 2 } as const;
const ROW = 8;

/**
 * The "draw 10 cats" demo pipeline — the canonical example of the split/merge
 * buffer semantics, all wired with strict 1:1 connections:
 *
 *   Telegram trigger → LLM agent → split → Image generator → merge(10) → Telegram send
 */
const CAT_PIPELINE: Pipeline = {
  id: 'demo-cats',
  name: 'Draw 10 cats',
  nodes: [
    node({
      id: 'node-1',
      kind: 'trigger',
      title: 'Telegram',
      subtitle: '"draw 10 cats"',
      pos: { col: 2, row: ROW },
      size: SIZE,
    }),
    node({
      id: 'node-2',
      kind: 'action',
      category: 'integration',
      title: 'LLM Agent',
      subtitle: '→ { count: 10, commands }',
      pos: { col: 12, row: ROW },
      size: SIZE,
    }),
    node({
      id: 'node-3',
      kind: 'action',
      category: 'split',
      title: 'Split',
      subtitle: 'array → per element',
      pos: { col: 22, row: ROW },
      size: SIZE,
    }),
    node({
      id: 'node-4',
      kind: 'action',
      category: 'integration',
      title: 'Image Generator',
      subtitle: 'one cat per command',
      pos: { col: 32, row: ROW },
      size: SIZE,
    }),
    node({
      id: 'node-5',
      kind: 'action',
      category: 'merge',
      title: 'Merge',
      subtitle: 'buffer until complete',
      pos: { col: 42, row: ROW },
      size: SIZE,
      bufferSize: 10,
    }),
    node({
      id: 'node-6',
      kind: 'effect',
      title: 'Telegram',
      subtitle: 'send 10 cats',
      pos: { col: 52, row: ROW },
      size: SIZE,
      required: true,
    }),
  ],
  edges: [
    edge('node-1', 'node-2'),
    edge('node-2', 'node-3'),
    edge('node-3', 'node-4'),
    edge('node-4', 'node-5'),
    edge('node-5', 'node-6'),
  ],
};

/** A 1:1 connection from a node's right output onto the next node's input. */
function edge(from: string, to: string) {
  return {
    id: `edge-${from}-${to}`,
    source: { nodeId: from, portId: 'out-right' },
    target: { nodeId: to, portId: 'in' },
  };
}

/** Playground for the `board` (canvas) domain: the interactive `<pe-board>` editor. */
@Component({
  selector: 'app-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Board],
  template: `<div class="flex h-[75dvh] flex-col gap-3">
    <p class="text-sm text-text-2">
      Drag a node to move it (snaps to the 32-grid) · drag from a right / top /
      bottom port onto a left port to connect · hold the right mouse button (or
      swipe on touch) to pan · scroll to zoom · right-click or long-press for the
      context menu.
    </p>
    <pe-board
      [pipeline]="pipeline"
      class="min-h-0 flex-1 overflow-hidden rounded-xl border border-border"
    />
  </div>`,
})
export class BoardPlayground {
  protected readonly pipeline = CAT_PIPELINE;
}
