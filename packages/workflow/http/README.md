# @tsai-pe/workflow-http

A **REST/WS adapter skeleton** for the
[Pipeline Editor](https://github.com/tsai-tech/pipeline-editor#readme)
`PipelineBackend` port — proves the vendor-neutral contract against a real
transport. Not published to npm (reference/starting point).

## Exports

- **`RestWsBackend`** — commands over REST (`POST /runs`, `POST /runs/{id}/stop`),
  run snapshots over a `WebSocket`/SSE stream. Transport (`fetch` + socket
  factory) is injected, so it stays headless and unit-testable without a server.
- **`RunSocket`**, **`RestWsBackendConfig`** — the streaming seam + config.

> **Note (sync/async seam):** the port's `startRun` returns an id synchronously
> while REST assigns one asynchronously. The adapter mints a local id, POSTs in
> the background, then relabels server snapshots onto it — see the class docs.

```ts
import { RestWsBackend } from '@tsai-pe/workflow-http';
const backend = new RestWsBackend({ baseUrl: 'https://api.example.com' });
```

## License

MIT © Mikhail Tsai
