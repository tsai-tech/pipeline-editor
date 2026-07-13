# @tsai-pe/board-ui

Presentational board components for
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme) — the
"dumb", `OnPush` pieces the [`@tsai-pe/board`](../feature) editor composes. You
normally consume `@tsai-pe/board`, not this package directly.

## Install

```bash
npm i @tsai-pe/board-ui
```

Peer deps: `@angular/core` ^21, `@tsai-pe/board-core`, `@tsai-pe/models`,
`@tsai-pe/nodes`, `lucide-angular`.

## Exports

- **`BoardGrid`** (`pe-board-grid`) — infinite dot-grid background that tracks the
  viewport.
- **`NodeView`** (`pe-node`) — one node: ports distributed by side fraction,
  control-flow branch labels, run status overlays, merge buffer fill.
- **`NODE_META`** / `CONTROL_FLOW_ICONS` — icon + accent metadata per node type.

Styling comes from [`@tsai-pe/theme`](../../shared/theme).

## License

MIT © Mikhail Tsai
