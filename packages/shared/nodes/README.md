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

- **Ports from config** — `derivePorts`, `controlFlowOutputs`, `isControlFlow`,
  `defaultControlFlowConfig`: control-flow (if/switch/filter) derives its named
  output ports from configuration.
- **Node catalog** — `NODE_CATALOG`, `catalogEntry`, `paramSchema`, and the
  `NodeTypeSpec` / `ParamField` / `ParamType` types. The seed catalog stands in
  for a real backend's node catalog (open-ended trigger / integration / effect
  types, each with its own parameter schema and an illustrative `output` shape).
- **Expression help** — `variablePaths(value)`: flatten a node's output into the
  dotted/bracketed variable paths downstream expressions may reference.

```ts
import { derivePorts, catalogEntry, variablePaths } from '@tsai-pe/nodes';
```

## License

MIT © Mikhail Tsai
