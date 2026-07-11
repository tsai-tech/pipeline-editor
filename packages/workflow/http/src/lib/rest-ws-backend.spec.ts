import type { Pipeline, RunSnapshot } from '@tsai-pe/shared/models';
import { RestWsBackend, type RunSocket } from './rest-ws-backend';

const pipeline: Pipeline = { id: 'p', name: 'P', nodes: [], edges: [] };

/** A controllable fake of the snapshot stream. */
class FakeSocket implements RunSocket {
  private msg?: (d: unknown) => void;
  private err?: (e: unknown) => void;
  closed = false;
  onMessage(h: (d: unknown) => void): void {
    this.msg = h;
  }
  onError(h: (e: unknown) => void): void {
    this.err = h;
  }
  close(): void {
    this.closed = true;
  }
  push(data: unknown): void {
    this.msg?.(data);
  }
  fail(error: unknown): void {
    this.err?.(error);
  }
}

/** Fake `fetch` that resolves ok with the given JSON body, recording calls. */
function okFetch(body: unknown) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

function makeBackend(fetchImpl: typeof fetch) {
  const ref: { socket?: FakeSocket } = {};
  const connect = vi.fn(() => (ref.socket = new FakeSocket()));
  const backend = new RestWsBackend({
    baseUrl: 'http://api.test',
    fetch: fetchImpl,
    connect,
  });
  const socket = (): FakeSocket => {
    if (!ref.socket) throw new Error('stream not opened');
    return ref.socket;
  };
  const last = (seen: RunSnapshot[]): RunSnapshot => seen[seen.length - 1];
  return { backend, connect, socket, last };
}

describe('RestWsBackend', () => {
  it('returns a local run id synchronously and replays a pending snapshot', () => {
    const { backend } = makeBackend(okFetch({ runId: 'srv1' }));
    const runId = backend.startRun(pipeline);
    expect(runId).toBe('run-local-1');

    const seen: RunSnapshot[] = [];
    backend.observe(runId, (s) => seen.push(s));
    expect(seen[0]).toMatchObject({ runId, status: 'pending' });
  });

  it('opens the stream with the server id and relabels snapshots to the local id', async () => {
    const { backend, connect, socket, last } = makeBackend(
      okFetch({ runId: 'srv1' }),
    );
    const runId = backend.startRun(pipeline);
    const seen: RunSnapshot[] = [];
    backend.observe(runId, (s) => seen.push(s));

    await tick(); // let the POST resolve and the socket open
    expect(connect).toHaveBeenCalledWith('srv1');

    socket().push({
      runId: 'srv1',
      status: 'running',
      nodes: { a: { nodeId: 'a', status: 'running' } },
      log: [],
    });
    expect(last(seen).status).toBe('running');
    expect(last(seen).runId).toBe(runId); // relabeled from srv1 → local id
    expect(last(seen).nodes['a'].status).toBe('running');
  });

  it('parses stringified JSON stream messages', async () => {
    const { backend, socket, last } = makeBackend(okFetch({ runId: 'srv1' }));
    const runId = backend.startRun(pipeline);
    const seen: RunSnapshot[] = [];
    backend.observe(runId, (s) => seen.push(s));
    await tick();

    socket().push(JSON.stringify({ status: 'success', nodes: {}, log: [] }));
    expect(last(seen)).toMatchObject({ runId, status: 'success' });
  });

  it('emits an error snapshot when the start request fails', async () => {
    const failing = vi.fn(async () => ({
      ok: false,
      status: 500,
    })) as unknown as typeof fetch;
    const { backend, last } = makeBackend(failing);
    const runId = backend.startRun(pipeline);
    const seen: RunSnapshot[] = [];
    backend.observe(runId, (s) => seen.push(s));

    await tick();
    expect(last(seen).status).toBe('error');
    expect(last(seen).log.some((l) => /Backend error/.test(l.message))).toBe(
      true,
    );
  });

  it('stop() posts to the server, closes the stream, and cancels', async () => {
    const fetchImpl = okFetch({ runId: 'srv1' });
    const { backend, socket, last } = makeBackend(fetchImpl);
    const runId = backend.startRun(pipeline);
    const seen: RunSnapshot[] = [];
    backend.observe(runId, (s) => seen.push(s));
    await tick();

    backend.stop(runId);
    expect(last(seen).status).toBe('canceled');
    expect(socket().closed).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://api.test/runs/srv1/stop',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('observing an unknown run yields a terminal error snapshot', () => {
    const { backend } = makeBackend(okFetch({ runId: 'srv1' }));
    let snap: RunSnapshot | undefined;
    backend.observe('nope', (s) => (snap = s));
    expect(snap?.status).toBe('error');
    expect(snap?.nodes).toEqual({});
  });
});
