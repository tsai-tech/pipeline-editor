import type {
  Pipeline,
  PipelineBackend,
  RunListener,
  RunSnapshot,
  RunStatus,
  Unsubscribe,
} from '@tsai-pe/models';

/**
 * Minimal snapshot stream — the WebSocket/SSE seam. A real adapter wraps a
 * `WebSocket` (or `EventSource`); tests inject a fake. Kept tiny and
 * framework-free so it can be driven from anywhere.
 */
export interface RunSocket {
  /** Register a handler for each incoming message (a raw string or parsed object). */
  onMessage(handler: (data: unknown) => void): void;
  /** Register a handler for a transport error. */
  onError(handler: (error: unknown) => void): void;
  /** Close the stream. */
  close(): void;
}

/** Configuration for {@link RestWsBackend}. */
export interface RestWsBackendConfig {
  /** Base URL of the run API, e.g. `https://api.example.com`. */
  baseUrl: string;
  /** Command transport (POST start/stop). Defaults to the global `fetch`. */
  fetch?: typeof fetch;
  /**
   * Snapshot-stream factory: given the server's run id, open a stream of
   * {@link RunSnapshot}s. Defaults to a `WebSocket` at
   * `${baseUrl→ws}/runs/{id}/events`.
   */
  connect?: (serverRunId: string) => RunSocket;
}

/** Server response to a start request. */
interface StartResponse {
  runId: string;
}

/** Client-side bookkeeping for one run. */
interface LocalRun {
  /** Id handed to the caller synchronously (before the server assigns one). */
  localId: string;
  /** Server-assigned id, once `startRun` resolves. */
  serverId?: string;
  socket?: RunSocket;
  listeners: Set<RunListener>;
  /** Last snapshot seen — replayed to new observers per the port contract. */
  last: RunSnapshot;
  /** Set once the caller stopped or the run reached a terminal state. */
  closed: boolean;
}

const TERMINAL: ReadonlySet<RunStatus> = new Set<RunStatus>([
  'success',
  'error',
  'canceled',
]);

/**
 * A real `PipelineBackend` over REST (commands) + a WebSocket/SSE stream
 * (snapshots), as a skeleton that proves the vendor-neutral contract against a
 * network transport (only the in-browser `TestBackendSystem` existed before).
 *
 * **Sync/async seam.** The port's `startRun` returns a run id *synchronously*,
 * but a REST backend assigns ids *asynchronously*. So we mint a **local** id up
 * front, return it, fire the POST in the background, and once the server
 * responds we open the snapshot stream and **relabel** every server snapshot
 * with the local id. Callers `observe`/`stop` using only the local id and never
 * see the reconciliation.
 *
 * Transport (`fetch`, `connect`) is injected, so the adapter stays headless and
 * unit-testable without a live server.
 *
 * @experimental A skeleton to prove the contract; the wire protocol (endpoints,
 * message shapes, auth) is illustrative and expected to change.
 */
export class RestWsBackend implements PipelineBackend {
  private readonly runs = new Map<string, LocalRun>();
  private seq = 0;

  constructor(private readonly config: RestWsBackendConfig) {}

  startRun(pipeline: Pipeline): string {
    const localId = `run-local-${++this.seq}`;
    const run: LocalRun = {
      localId,
      listeners: new Set(),
      last: { runId: localId, status: 'pending', nodes: {}, log: [] },
      closed: false,
    };
    this.runs.set(localId, run);

    // Fire-and-forget; reconcile the server id + open the stream on resolve.
    this.post<StartResponse>('/runs', { pipeline })
      .then((res) => this.onStarted(run, res.runId))
      .catch((err) => this.fail(run, err));

    return localId;
  }

  observe(runId: string, listener: RunListener): Unsubscribe {
    const run = this.runs.get(runId);
    if (!run) {
      listener({ runId, status: 'error', nodes: {}, log: [] });
      return () => undefined;
    }
    run.listeners.add(listener);
    listener(run.last); // immediate current state, per the port contract
    return () => {
      run.listeners.delete(listener);
    };
  }

  stop(runId: string): void {
    const run = this.runs.get(runId);
    if (!run || run.closed || TERMINAL.has(run.last.status)) return;
    run.closed = true;
    run.socket?.close();
    if (run.serverId) {
      this.post(`/runs/${run.serverId}/stop`, {}).catch(() => undefined);
    }
    // Optimistic — a real backend would confirm via the (now closed) stream.
    this.emit(run, { ...run.last, status: 'canceled' });
  }

  // ── internals ─────────────────────────────────────────────────────────────

  private onStarted(run: LocalRun, serverId: string): void {
    run.serverId = serverId;
    if (run.closed) return; // stopped before the server answered
    const socket = (this.config.connect ?? ((id) => this.defaultConnect(id)))(
      serverId,
    );
    run.socket = socket;
    socket.onMessage((data) => {
      const snapshot = this.toSnapshot(data, run.localId);
      if (snapshot) this.emit(run, snapshot);
    });
    socket.onError((err) => this.fail(run, err));
  }

  /** Normalize a stream message into a local-labelled snapshot, or null. */
  private toSnapshot(data: unknown, localId: string): RunSnapshot | null {
    let value = data;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        return null;
      }
    }
    if (!value || typeof value !== 'object') return null;
    const raw = value as Partial<RunSnapshot>;
    if (!raw.status || typeof raw.nodes !== 'object') return null;
    return {
      runId: localId, // relabel: callers only know the local id
      status: raw.status,
      nodes: raw.nodes ?? {},
      log: raw.log ?? [],
    };
  }

  private fail(run: LocalRun, err: unknown): void {
    if (TERMINAL.has(run.last.status)) return;
    run.closed = true;
    run.socket?.close();
    this.emit(run, {
      ...run.last,
      status: 'error',
      log: [
        ...run.last.log,
        { at: Date.now(), message: `Backend error: ${errorMessage(err)}` },
      ],
    });
  }

  private emit(run: LocalRun, snapshot: RunSnapshot): void {
    run.last = snapshot;
    if (TERMINAL.has(snapshot.status)) run.closed = true;
    for (const listener of run.listeners) listener(snapshot);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const doFetch = this.config.fetch ?? globalThis.fetch;
    if (!doFetch) throw new Error('No fetch implementation available');
    const res = await doFetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  /** Default snapshot stream: a browser `WebSocket` to the run's event feed. */
  private defaultConnect(serverId: string): RunSocket {
    const WS = (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
    if (!WS) {
      throw new Error(
        'No WebSocket available — pass a `connect` factory in the config',
      );
    }
    const wsBase = this.config.baseUrl.replace(/^http/, 'ws');
    const ws = new WS(`${wsBase}/runs/${serverId}/events`);
    return {
      onMessage: (handler) =>
        ws.addEventListener('message', (e: MessageEvent) => handler(e.data)),
      onError: (handler) => ws.addEventListener('error', (e) => handler(e)),
      close: () => ws.close(),
    };
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
