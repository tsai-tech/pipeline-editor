import type {
  Pipeline,
  PipelineStore,
  PipelineSummary,
  RunSummary,
} from '@tsai-pe/models';

interface StoredState {
  pipelines: Record<string, Pipeline>;
  updatedAt: Record<string, number>;
  runs: RunSummary[];
}

const EMPTY_STATE: StoredState = {
  pipelines: {},
  updatedAt: {},
  runs: [],
};

/**
 * `PipelineStore` backed by browser `localStorage`.
 *
 * Used by the playground to keep the editable board document across refreshes
 * while preserving the same async persistence contract as a future REST store.
 */
export class LocalStoragePipelineStore implements PipelineStore {
  constructor(
    private readonly storage: Storage,
    private readonly key = 'tsai-pe:pipeline-store',
    private readonly now: () => number = () => Date.now(),
  ) {}

  seed(pipeline: Pipeline): void {
    const state = this.read();
    if (Object.keys(state.pipelines).length) return;
    state.pipelines[pipeline.id] = clone(pipeline);
    state.updatedAt[pipeline.id] = this.now();
    this.write(state);
  }

  loadSync(id: string): Pipeline | null {
    const stored = this.read().pipelines[id];
    return stored ? clone(stored) : null;
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }

  async save(pipeline: Pipeline): Promise<void> {
    const state = this.read();
    state.pipelines[pipeline.id] = clone(pipeline);
    state.updatedAt[pipeline.id] = this.now();
    this.write(state);
  }

  async load(id: string): Promise<Pipeline | null> {
    return this.loadSync(id);
  }

  async list(): Promise<PipelineSummary[]> {
    const state = this.read();
    return Object.values(state.pipelines)
      .map((pipeline) => ({
        id: pipeline.id,
        name: pipeline.name,
        nodeCount: pipeline.nodes.length,
        updatedAt: state.updatedAt[pipeline.id] ?? 0,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async remove(id: string): Promise<void> {
    const state = this.read();
    delete state.pipelines[id];
    delete state.updatedAt[id];
    state.runs = state.runs.filter((run) => run.pipelineId !== id);
    this.write(state);
  }

  async runHistory(pipelineId: string): Promise<RunSummary[]> {
    return this.read()
      .runs.filter((run) => run.pipelineId === pipelineId)
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  recordRun(summary: RunSummary): void {
    const state = this.read();
    state.runs.push({ ...summary });
    this.write(state);
  }

  private read(): StoredState {
    const raw = this.storage.getItem(this.key);
    if (!raw) return cloneState(EMPTY_STATE);
    try {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      return {
        pipelines: parsed.pipelines ?? {},
        updatedAt: parsed.updatedAt ?? {},
        runs: parsed.runs ?? [],
      };
    } catch {
      return cloneState(EMPTY_STATE);
    }
  }

  private write(state: StoredState): void {
    this.storage.setItem(this.key, JSON.stringify(state));
  }
}

function clone(pipeline: Pipeline): Pipeline {
  return JSON.parse(JSON.stringify(pipeline)) as Pipeline;
}

function cloneState(state: StoredState): StoredState {
  return JSON.parse(JSON.stringify(state)) as StoredState;
}
