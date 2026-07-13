import type { NodeStatus, Pipeline } from './models';

/**
 * Frontend ↔ backend contract. The editor never runs a pipeline itself — a
 * pipeline runs in "the system" (24/7), and the editor talks to it through this
 * vendor-neutral port. `TestBackendSystem` (workflow/mock) is one in-browser
 * implementation; a real REST/WS backend is just another.
 *
 * Kept framework-free (callback subscription, no Signal/Observable) so it can
 * live in `shared` alongside the data model.
 */

/** Overall lifecycle state of a run. */
export type RunStatus = 'pending' | 'running' | 'success' | 'error' | 'canceled';

/** Per-node state within a run. */
export interface NodeRun {
  nodeId: string;
  status: NodeStatus;
  /** Illustrative output the node produced (backend-defined shape). */
  output?: unknown;
  error?: string;
  /** Buffer fill state for collector nodes such as `merge`. */
  buffer?: { done: number; total: number };
  /** @deprecated Use backend-defined `buffer` on collector nodes instead. */
  progress?: { done: number; total: number };
}

/** Per-edge runtime state. Only backend/simulation decides whether an edge is active. */
export interface EdgeRun {
  edgeId: string;
  status: 'idle' | 'active';
}

/** Runtime metadata about the trigger event currently driving a node/run pass. */
export interface TriggerContext {
  /** Trigger node id in the pipeline document. */
  id: string;
  /** Human-readable trigger node title. */
  title: string;
  /** Concrete catalog type id, e.g. `telegram-trigger`. */
  type?: string;
  /** Stable channel/name for branching, e.g. `telegram`, `whatsapp`, `webhook`. */
  channel: string;
  /** Configured trigger event name when provided by the node/backend. */
  event?: string;
}

/** A single line in the run log. */
export interface RunLogEntry {
  at: number;
  nodeId?: string;
  message: string;
}

/** Outputs captured for one trigger pass in a multi-trigger run. */
export interface RunPassSnapshot {
  trigger?: TriggerContext;
  triggerIndex: number;
  outputs: Record<string, unknown>;
}

/** An immutable snapshot of a run, pushed to observers on every change. */
export interface RunSnapshot {
  runId: string;
  status: RunStatus;
  nodes: Record<string, NodeRun>;
  /** Runtime edge activity, keyed by edge id. Omitted edges are idle. */
  edges?: Record<string, EdgeRun>;
  log: RunLogEntry[];
  /** Per-trigger-pass outputs, useful for inspecting multi-trigger runs. */
  passes?: RunPassSnapshot[];
}

export type RunListener = (snapshot: RunSnapshot) => void;
export type Unsubscribe = () => void;

/**
 * The port the editor uses to run pipelines and observe their progress.
 *
 * `startRun` returns a client-visible run id immediately. Remote adapters that
 * receive a server id asynchronously should mint a local id, reconcile in the
 * background, and keep snapshots labelled with the local id.
 */
export interface PipelineBackend {
  /** Submit a pipeline to run; returns a run id. */
  startRun(pipeline: Pipeline): string;
  /** Subscribe to run snapshots; the listener fires immediately with current state. */
  observe(runId: string, listener: RunListener): Unsubscribe;
  /** Request cancellation of a run. */
  stop(runId: string): void;
}
