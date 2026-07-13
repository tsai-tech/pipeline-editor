import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import {
  Board,
  PIPELINE_BACKEND,
  PIPELINE_NODE_CATALOG,
  PIPELINE_STORE,
} from '@tsai-pe/board';
import type { BoardNode, Pipeline } from '@tsai-pe/models';
import { MOCK_NODE_CATALOG, TestBackendSystem } from '@tsai-pe/workflow-mock';
import { InMemoryPipelineStore } from '@tsai-pe/workflow-mock';
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Select,
  type SelectOption,
  Table,
  type TableColumn,
  type TableRow,
  Tag,
} from '@tsai-pe/ui-kit';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';

interface NavItem {
  id: string;
  label: string;
}

type CodeLanguage = 'bash' | 'css' | 'ts';

const DEMO_BACKEND = new TestBackendSystem({
  stepDelayMs: 350,
  tickProgressMs: 100,
});
const DEMO_STORE = new InMemoryPipelineStore();

const SIZE = { cols: 7, rows: 2 } as const;

function node(spec: Omit<BoardNode, 'ports'>): BoardNode {
  return { ...spec, ports: MOCK_NODE_CATALOG.ports({ ...spec, ports: [] }) };
}

function edge(id: string, from: string, fromPort: string, to: string) {
  return {
    id,
    source: { nodeId: from, portId: fromPort },
    target: { nodeId: to, portId: 'in' },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightBash(code: string): string {
  return escapeHtml(code)
    .replace(
      /^(npm|npx|pnpm|yarn)(\s+)/gm,
      '<span class="syntax-keyword">$1</span>$2',
    )
    .replace(/(--[\w-]+)/g, '<span class="syntax-attr">$1</span>')
    .replace(/(@[\w-]+\/[\w-]+)/g, '<span class="syntax-type">$1</span>');
}

function highlightCss(code: string): string {
  return escapeHtml(code)
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syntax-comment">$1</span>')
    .replace(/(@[\w-]+)/g, '<span class="syntax-keyword">$1</span>')
    .replace(/('.*?')/g, '<span class="syntax-string">$1</span>');
}

function highlightTypeScript(code: string): string {
  return escapeHtml(code)
    .replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$1</span>')
    .replace(
      /('(?:\\.|[^'])*'|`(?:\\.|[^`])*`)/g,
      '<span class="syntax-string">$1</span>',
    )
    .replace(
      /\b(import|export|from|const|readonly|class|implements|return|new|async|await|type|interface|providers|template|selector|imports|useValue|useExisting|useFactory)\b/g,
      '<span class="syntax-keyword">$1</span>',
    )
    .replace(
      /\b(Component|Pipeline|PipelineBackend|PipelineStore|RunListener|Unsubscribe|NodeCatalog|BoardNode|NodeTypeSpec|ExpressionScope)\b/g,
      '<span class="syntax-type">$1</span>',
    )
    .replace(
      /(\b[A-Za-z_$][\w$]*)(?=\s*:)/g,
      '<span class="syntax-attr">$1</span>',
    );
}

const STARTER_PIPELINE: Pipeline = {
  id: 'docs-starter',
  name: 'Docs starter pipeline',
  nodes: [
    node({
      id: 'trigger',
      type: 'webhook-trigger',
      kind: 'trigger',
      title: 'Webhook',
      subtitle: 'POST /lead',
      pos: { col: 2, row: 3 },
      size: SIZE,
      data: {
        method: 'POST',
        path: '/lead',
        body: { email: 'ada@example.com', plan: 'pro' },
      },
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
        prompt: 'Score lead quality from {{ $json.body.email }}',
        mockOutput: { score: 0.91, segment: 'enterprise' },
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
    node({
      id: 'notify',
      type: 'toast-effect',
      kind: 'effect',
      title: 'Notify Sales',
      subtitle: 'required',
      pos: { col: 36, row: 2 },
      size: SIZE,
      required: true,
      data: {
        title: 'Hot lead',
        message: '{{ $json.segment }} lead is ready for sales',
        variant: 'success',
      },
    }),
  ],
  edges: [
    edge('e1', 'trigger', 'out-right', 'score'),
    edge('e2', 'score', 'out-right', 'branch'),
    edge('e3', 'branch', 'true', 'notify'),
  ],
};

DEMO_STORE.save(STARTER_PIPELINE);

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    Board,
    Button,
    Card,
    Alert,
    Badge,
    Tag,
    Input,
    Select,
    Table,
    LucideAngularModule,
  ],
  providers: [
    { provide: PIPELINE_BACKEND, useValue: DEMO_BACKEND },
    { provide: PIPELINE_STORE, useValue: DEMO_STORE },
    { provide: PIPELINE_NODE_CATALOG, useValue: MOCK_NODE_CATALOG },
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly Sun = Sun;
  protected readonly Moon = Moon;
  protected readonly isLight = signal(false);
  protected readonly active = signal('start');
  protected readonly search = signal('customer.email');
  protected readonly backendMode = signal<string[]>(['rest-ws']);
  protected readonly pipeline = signal(STARTER_PIPELINE);

  protected readonly nav: NavItem[] = [
    { id: 'start', label: 'Start' },
    { id: 'install', label: 'Install' },
    { id: 'board', label: 'Board' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'ports', label: 'Ports' },
    { id: 'styling', label: 'Styling' },
    { id: 'expressions', label: 'Expressions' },
    { id: 'backend', label: 'Backend' },
    { id: 'ui-kit', label: 'UI Kit' },
  ];

  protected readonly packageColumns: TableColumn[] = [
    { key: 'name', label: 'Package' },
    { key: 'purpose', label: 'Purpose' },
  ];

  protected readonly packages: TableRow[] = [
    { name: '@tsai-pe/board', purpose: '<pe-board> editor and tokens' },
    { name: '@tsai-pe/ui-kit', purpose: 'Reusable Angular UI controls' },
    { name: '@tsai-pe/theme', purpose: 'Tailwind v4 tokens and global CSS' },
    {
      name: '@tsai-pe/models',
      purpose: 'Pipeline, store and backend contracts',
    },
    { name: '@tsai-pe/nodes', purpose: 'Node catalog and parameter schemas' },
  ];

  protected readonly backendOptions: SelectOption[] = [
    { value: 'rest-ws', label: 'REST + WebSocket adapter' },
    { value: 'local', label: 'Local prototype backend' },
    { value: 'readonly', label: 'Read-only catalog viewer' },
  ];

  protected readonly installSnippet = `npm install @tsai-pe/board @tsai-pe/ui-kit @tsai-pe/theme @tsai-pe/models @tsai-pe/nodes lucide-angular @angular/cdk @angular/aria`;

  protected readonly stylesSnippet = `/* src/styles.css */
@import '@tsai-pe/theme';
@import '@angular/cdk/overlay-prebuilt.css';

@source '../node_modules/@tsai-pe/board';
@source '../node_modules/@tsai-pe/ui-kit';`;

  protected readonly boardSnippet = `import { Component, signal } from '@angular/core';
import { Board, PIPELINE_BACKEND, PIPELINE_NODE_CATALOG, PIPELINE_STORE } from '@tsai-pe/board';
import type { Pipeline } from '@tsai-pe/models';

@Component({
  standalone: true,
  selector: 'app-workflow-builder',
  imports: [Board],
  providers: [
    { provide: PIPELINE_BACKEND, useExisting: MyPipelineBackend },
    { provide: PIPELINE_STORE, useExisting: MyPipelineStore },
    { provide: PIPELINE_NODE_CATALOG, useValue: MY_NODE_CATALOG },
  ],
  template: \`<pe-board class="block h-dvh" [pipeline]="pipeline()" />\`,
})
export class WorkflowBuilder {
  readonly pipeline = signal<Pipeline>(initialPipeline);
}`;

  protected readonly catalogSnippet = `import { createNodeCatalog } from '@tsai-pe/nodes';

export const MY_NODE_CATALOG = createNodeCatalog([
  {
    id: 'crm-create-lead',
    label: 'Create CRM Lead',
    section: 'CRM',
    kind: 'effect',
    params: [
      { key: 'email', label: 'Email', type: 'expression', required: true },
      { key: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
      ] },
    ],
    outputExample: { leadId: 'lead_123', status: 'created' },
  },
]);`;

  protected readonly portSnippet = `import type { NodeTypeSpec } from '@tsai-pe/nodes';

export const ROUTER_NODE = {
  id: 'route-by-segment',
  label: 'Route by segment',
  section: 'Logic',
  kind: 'action',
  category: 'control-flow',
  params: [
    { key: 'field', label: 'Field', type: 'expression', defaultValue: '$json.segment' },
    {
      key: 'routes',
      label: 'Routes',
      type: 'array',
      item: [
        { key: 'id', label: 'Port id', type: 'text', required: true },
        { key: 'label', label: 'Label', type: 'text', required: true },
      ],
    },
  ],
  ports: {
    static: [{ id: 'in', role: 'input', side: 'left' }],
    dynamic: [
      { from: 'routes', id: '{{ id }}', label: '{{ label }}', role: 'output' },
    ],
    conditional: [
      { when: 'fallback', id: 'fallback', label: 'Fallback', role: 'output' },
    ],
  },
  outputExample: { segment: 'enterprise', matched: true },
} satisfies NodeTypeSpec;`;

  protected readonly stylingSnippet = `/* app styles */
@import '@tsai-pe/theme';
@import '@angular/cdk/overlay-prebuilt.css';

@source '../node_modules/@tsai-pe/board';
@source '../node_modules/@tsai-pe/ui-kit';

:root {
  --accent: #22b8cf;
  --node-integration: #845ef7;
  --node-effect: #f06595;
}

.light {
  --accent: #0b7285;
}`;

  protected readonly expressionSnippet = `import type { ExpressionScope } from '@tsai-pe/ui-kit';

readonly scope: ExpressionScope = {
  trigger: ['body.email', 'headers.authorization'],
  json: ['customer.email', 'customer.plan', 'score'],
  nodes: [
    { title: 'Score Lead', paths: ['score', 'segment', 'reason'] },
    { title: 'Create CRM Lead', paths: ['leadId', 'status'] },
  ],
};

template: \`
  <tsai-expression-field
    [value]="message"
    [scope]="scope"
    [template]="true"
    (valueChange)="message = $event"
  />
\`;`;

  protected readonly backendSnippet = `import type { Pipeline, PipelineBackend, RunListener, Unsubscribe } from '@tsai-pe/models';

export class RestPipelineBackend implements PipelineBackend {
  startRun(pipeline: Pipeline): string {
    return crypto.randomUUID();
  }

  observe(runId: string, listener: RunListener): Unsubscribe {
    const socket = new WebSocket(\`/api/runs/\${runId}/events\`);
    socket.onmessage = (event) => listener(JSON.parse(event.data));
    return () => socket.close();
  }

  stop(runId: string): void {
    void fetch(\`/api/runs/\${runId}/stop\`, { method: 'POST' });
  }
}`;

  protected readonly storeSnippet = `import type { Pipeline, PipelineStore, PipelineSummary, RunSummary } from '@tsai-pe/models';

export class HttpPipelineStore implements PipelineStore {
  async list(): Promise<PipelineSummary[]> {
    return fetch('/api/pipelines').then((res) => res.json());
  }

  async load(id: string): Promise<Pipeline | null> {
    const res = await fetch(\`/api/pipelines/\${id}\`);
    if (res.status === 404) return null;
    return res.json();
  }

  async save(pipeline: Pipeline): Promise<void> {
    await fetch(\`/api/pipelines/\${pipeline.id}\`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
  }

  async remove(id: string): Promise<void> {
    await fetch(\`/api/pipelines/\${id}\`, { method: 'DELETE' });
  }

  async runHistory(pipelineId: string): Promise<RunSummary[]> {
    return fetch(\`/api/pipelines/\${pipelineId}/runs\`).then((res) => res.json());
  }
}`;

  protected highlight(code: string, language: CodeLanguage): SafeHtml {
    const html =
      language === 'bash'
        ? highlightBash(code)
        : language === 'css'
          ? highlightCss(code)
          : highlightTypeScript(code);

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  protected go(id: string): void {
    this.active.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  protected toggleTheme(): void {
    const next = !this.isLight();
    this.isLight.set(next);
    document.documentElement.classList.toggle('light', next);
  }
}
