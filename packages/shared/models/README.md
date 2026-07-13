# @tsai-pe/models

The data model and contracts of
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme) — a pure,
framework-free TypeScript package shared by the editor and any backend.

## Install

```bash
npm i @tsai-pe/models
```

## Exports

- **Model** — `Pipeline`, `BoardNode`, `Edge`, `NodePort`, `NodeKind`
  (`trigger`/`action`/`effect`), `ActionCategory`, `ControlFlowConfig`,
  `NodeStatus`, grid types; helpers `nodeType`, `defaultPorts`, `portFraction`.
- **Validation** — `validatePipeline` (DAG / port-role / orphan checks; inputs
  may fan in), `hasCycle`, `reaches`.
- **Backend contract** — `PipelineBackend` (`startRun` / `observe` / `stop`),
  `RunSnapshot`, `NodeRun`, `EdgeRun`, `RunLogEntry`, `RunStatus`. Framework-free
  callbacks so it lives next to the model. Backends own runtime edge activity;
  collector nodes such as `merge` expose buffer fill through `NodeRun.buffer`.
- **Persistence contract** — `PipelineStore` (`save` / `load` / `list` / `remove`
  / `runHistory`), `PipelineSummary`, `RunSummary`.

Connections run `output → input`; **inputs accept fan-in** (multiple sources, OR
semantics). `split` / `merge` are buffer *nodes*, not connection cardinality.

## License

MIT © Mikhail Tsai
