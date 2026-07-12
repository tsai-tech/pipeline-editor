# @tsai-pe/board

The **`<pe-board>`** visual pipeline editor — the main package of
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme). Drop it
into an Angular app to edit AI-agent pipelines on a canvas: palette drag-and-drop,
connections, inspector, validation, minimap, undo/redo, export/import, run and
persistence.

> The editor does **not** execute pipelines. It talks to a backend through the
> vendor-neutral [`PipelineBackend`](../../shared/models) port; wire one to enable
> the Run controls.

## Install

```bash
npm i @tsai-pe/board @tsai-pe/theme
```

`@tsai-pe/board` pulls its siblings (`board-core`, `board-ui`, `ui-kit`, `models`,
`nodes`) as dependencies; `@tsai-pe/theme` provides the styles (below). Peer deps:
`@angular/core` ^21, `lucide-angular`.

## Quick start

**1. Styles** — import the theme and let Tailwind scan the library classes
(`styles.css`):

```css
@import '@tsai-pe/theme'; /* design tokens + Tailwind entry */
@source '../node_modules/@tsai-pe'; /* scan classes shipped in the libs (incl. .ts) */
@import '@angular/cdk/overlay-prebuilt.css'; /* overlays: menus, dialogs */
```

**2. Provide a node catalog**, a backend (optional — enables Run) and a store
(optional — enables Save / Open). For local dev use the in-browser mock catalog
and backend:

```ts
import { PIPELINE_BACKEND, PIPELINE_NODE_CATALOG, PIPELINE_STORE } from '@tsai-pe/board';
import {
  MOCK_NODE_CATALOG,
  TestBackendSystem,
  InMemoryPipelineStore,
} from '@tsai-pe/workflow-mock';

providers: [
  { provide: PIPELINE_NODE_CATALOG, useValue: MOCK_NODE_CATALOG },
  { provide: PIPELINE_BACKEND, useFactory: () => new TestBackendSystem() },
  { provide: PIPELINE_STORE, useFactory: () => new InMemoryPipelineStore() },
]
```

**3. Render** the board:

```ts
import { Board } from '@tsai-pe/board';
import type { Pipeline } from '@tsai-pe/models';

@Component({
  selector: 'app-editor',
  imports: [Board],
  template: `<pe-board [pipeline]="pipeline" [readonly]="false" class="block h-dvh" />`,
})
export class EditorComponent {
  protected readonly pipeline: Pipeline = {
    id: 'p1',
    name: 'My pipeline',
    nodes: [],
    edges: [],
  };
}
```

## API

`Board` (`<pe-board>`)

| Input | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `pipeline` | `Pipeline \| null` | `null` | Document to load; reloaded whenever the reference changes. |
| `readonly` | `boolean` | `false` | View-only: pan / zoom / select / inspect stay, editing is off. |

The board fills its host — give it a sized container (`h-dvh`, a flex child, …).

Tokens (from this package):

- `PIPELINE_BACKEND` — a [`PipelineBackend`](../../shared/models); absent → Run hidden.
- `PIPELINE_NODE_CATALOG` — a [`NodeCatalog`](../../shared/nodes); absent → empty palette/forms.
- `PIPELINE_STORE` — an optional [`PipelineStore`](../../shared/models); absent → Save/Open hidden.

> **Getting changes out:** edits live in the board's internal store; persistence
> is via `PIPELINE_STORE` (the Save control). A reactive `pipelineChange` output is
> not yet exposed — track it if you need live two-way sync.

## Backends

- [`@tsai-pe/workflow-mock`](../../workflow/mock) — in-browser mock (evaluates the
  expression language) for dev/demo.
- [`@tsai-pe/workflow-http`](../../workflow/http) — REST/WS adapter skeleton.
- Or implement `PipelineBackend` (`startRun` / `observe` / `stop`) against your own.

## License

MIT © Mikhail Tsai
