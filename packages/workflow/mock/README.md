# @tsai-pe/workflow-mock

In-browser mock backend for
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme) — a
`PipelineBackend` you can wire into `<pe-board>` to develop and demo with **no
real backend**. Not published to npm (dev/reference).

## Exports

- **`TestBackendSystem`** — walks the graph in topological order and pushes
  `RunSnapshot`s as nodes transition. It actually **evaluates the expression
  language** (`$json` / `$node["…"]`, operators, `{{ }}`), so control-flow routes
  for real, transforms extract from context, and a bad reference fails the node.
  Models one firing trigger per run (round-robin), split→merge fan-out as running
  waves, optional/fatal failures. Options: `stepDelayMs`, `tickProgressMs`,
  `firingTrigger`, `failNode`, `now`.
- **`InMemoryPipelineStore`** — an in-memory `PipelineStore` (save/load/list/
  remove + run history), deep-cloning stored documents.

```ts
import { TestBackendSystem, InMemoryPipelineStore } from '@tsai-pe/workflow-mock';
import { PIPELINE_BACKEND, PIPELINE_STORE } from '@tsai-pe/board';

providers: [
  { provide: PIPELINE_BACKEND, useFactory: () => new TestBackendSystem() },
  { provide: PIPELINE_STORE, useFactory: () => new InMemoryPipelineStore() },
];
```

## License

MIT © Mikhail Tsai
