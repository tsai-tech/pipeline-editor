import type { Pipeline } from '@tsai-pe/models';
import { LocalStoragePipelineStore } from './local-storage-pipeline-store';

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function pipeline(id: string, name = id): Pipeline {
  return { id, name, nodes: [], edges: [] };
}

describe('LocalStoragePipelineStore', () => {
  it('seeds only when storage is empty', async () => {
    const store = new LocalStoragePipelineStore(new MemoryStorage(), 'test');
    store.seed(pipeline('seed', 'Seed'));
    store.seed(pipeline('other', 'Other'));

    expect(await store.list()).toHaveLength(1);
    expect(await store.load('seed')).toMatchObject({ name: 'Seed' });
  });

  it('persists through another instance using the same storage and key', async () => {
    const storage = new MemoryStorage();
    const a = new LocalStoragePipelineStore(storage, 'test');
    await a.save(pipeline('p', 'Saved'));

    const b = new LocalStoragePipelineStore(storage, 'test');
    expect(b.loadSync('p')).toMatchObject({ name: 'Saved' });
  });

  it('clears all persisted state', async () => {
    const store = new LocalStoragePipelineStore(new MemoryStorage(), 'test');
    await store.save(pipeline('p'));
    store.recordRun({
      runId: 'r',
      pipelineId: 'p',
      status: 'success',
      startedAt: 1,
    });

    store.clear();

    expect(await store.list()).toEqual([]);
    expect(await store.runHistory('p')).toEqual([]);
  });
});
