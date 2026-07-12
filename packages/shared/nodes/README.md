# @tsai-pe/nodes

The node-type registry of
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme) — pure
TypeScript, read by both the editor and (eventually) an engine. Depends only on
[`@tsai-pe/models`](../models).

## Install

```bash
npm i @tsai-pe/nodes
```

## Exports

- **Catalog contract** — `NodeCatalog`, `NodeTypeSpec`, `ParamField` and
  `ParamType`. Concrete catalogs are supplied by a backend/host app.
- **Ports from specs** — `derivePorts`: dynamic output ports can be derived from
  node data, e.g. switch cases.
- **Catalog helpers** — `createNodeCatalog`, `defaultData`, `fieldGroups`,
  `EMPTY_NODE_CATALOG`.
- **Expression help** — `variablePaths(value)`: flatten a node's output into the
  dotted/bracketed variable paths downstream expressions may reference.

```ts
import { createNodeCatalog, derivePorts, variablePaths } from '@tsai-pe/nodes';
```

## License

MIT © Mikhail Tsai
