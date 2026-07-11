# @tsai-pe/board-core

Framework-light state and logic for the
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme) board —
pure TypeScript + Angular signals, no templates. Consumed by
[`@tsai-pe/board`](../feature); usable standalone (headless) too.

## Install

```bash
npm i @tsai-pe/board-core
```

Peer deps: `@angular/core` ^21, `@tsai-pe/models`, `@tsai-pe/nodes`.

## Exports

- **`BoardStore`** — signal document store: nodes, edges, selection, history
  (undo/redo), clipboard, viewport; live validation `issues`, `edgeGeometries`
  (routed), `ancestorsOf(id)`, and connection rules (`canConnect`: output→input,
  no cycle, fan-in allowed).
- **`Viewport`** — pan/zoom, `screen ↔ world`, `zoomAround`, `fitTo`.
- **`geometry`** — grid math, `nodeRect`, `portAnchor`, rect intersection, bezier
  edge path, `GRID_CELL`.
- **`routing`** — orthogonal A\* edge routing on the 16-unit subgrid (avoids nodes
  and other edges; bezier fallback).

```ts
import { BoardStore } from '@tsai-pe/board-core';

const store = new BoardStore();
const id = store.addNode({ kind: 'trigger', title: 'Telegram', pos: { col: 0, row: 0 } });
```

## License

MIT © Mikhail Tsai
