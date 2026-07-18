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
npm i @tsai-pe/board @tsai-pe/board-core @tsai-pe/pipeline-ui-kit \
      @tsai-pe/ui-kit @tsai-pe/models @tsai-pe/nodes @tsai-pe/theme
```

`@tsai-pe/board`'s sibling libraries (`board-core`, `pipeline-ui-kit`,
`ui-kit`, `models`, `nodes`) are **peer dependencies**. npm 7+ installs them
automatically, but pnpm/yarn do not — so the command above lists them explicitly.
`@tsai-pe/theme` provides the styles (below).

Framework peers (normally already in your Angular app): `@angular/core` ^21,
`@angular/cdk`, `@angular/aria`, `@angular/forms`, and `lucide-angular`.

## Quick start

**1. Styles** — import the theme and let Tailwind scan the library classes
(`styles.css`):

```css
@import '@tsai-pe/theme'; /* design tokens + Tailwind entry */
@source '../node_modules/@tsai-pe'; /* scan classes shipped in the libs (incl. .ts) */
@import '@angular/cdk/overlay-prebuilt.css'; /* overlays: menus, dialogs */
```

**2. Provide a node catalog**, a backend (optional — enables Run) and a store
(optional — enables Save / Open):

```ts
import { PIPELINE_BACKEND, PIPELINE_NODE_CATALOG, PIPELINE_STORE } from '@tsai-pe/board';

providers: [
  { provide: PIPELINE_NODE_CATALOG, useValue: MY_NODE_CATALOG }, // your NodeCatalog
  { provide: PIPELINE_BACKEND, useExisting: MyPipelineBackend }, // optional — enables Run
  { provide: PIPELINE_STORE, useExisting: MyPipelineStore }, // optional — enables Save / Open
];
```

> For a ready-made in-browser mock catalog + backend that evaluates the expression
> language (`MOCK_NODE_CATALOG`, `TestBackendSystem`, `InMemoryPipelineStore` from
> `@tsai-pe/workflow-mock`), clone the [monorepo](https://github.com/tsai-tech/pipeline-editor) —
> it's a dev/demo package and is **not published to npm**.

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

| Input      | Type               | Default | Description                                                    |
| ---------- | ------------------ | ------- | -------------------------------------------------------------- |
| `pipeline` | `Pipeline \| null` | `null`  | Document to load; reloaded whenever the reference changes.     |
| `readonly` | `boolean`          | `false` | View-only: pan / zoom / select / inspect stay, editing is off. |

The board fills its host — give it a sized container (`h-dvh`, a flex child, …).

Need only the canvas primitives, node visuals, edge layer, node picker or
inspector body? Use `@tsai-pe/pipeline-ui-kit` directly and compose your own
modal/drawer/save/run shell around `BoardStore`.

Tokens (from this package):

- `PIPELINE_BACKEND` — a [`PipelineBackend`](../../shared/models); absent → Run hidden.
- `PIPELINE_NODE_CATALOG` — a [`NodeCatalog`](../../shared/nodes); absent → empty palette/forms.
- `PIPELINE_STORE` — an optional [`PipelineStore`](../../shared/models); absent → Save/Open hidden.

> **Getting changes out:** edits live in the board's internal store; persistence
> is via `PIPELINE_STORE` (the Save control). A reactive `pipelineChange` output is
> not yet exposed — track it if you need live two-way sync.

## Backends

- [`@tsai-pe/workflow-mock`](../../workflow/mock) — in-browser mock (evaluates the
  expression language) for dev/demo. _Monorepo only — not published to npm._
- [`@tsai-pe/workflow-http`](../../workflow/http) — REST/WS adapter skeleton.
  _Monorepo only — not published to npm._
- Or implement `PipelineBackend` (`startRun` / `observe` / `stop`) against your own.

## License

MIT © Mikhail Tsai
