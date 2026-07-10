import {
  Bot,
  Combine,
  GitBranch,
  type LucideIconData,
  Send,
  Shuffle,
  Split,
  Zap,
} from 'lucide-angular';
import type { NodeType } from '@tsai-pe/shared/models';

/** Visual descriptor for a node type: icon, human label, and accent color. */
export interface NodeMeta {
  icon: LucideIconData;
  label: string;
  /** CSS color (a `--node-*` custom property) used for the rail, icon and ports. */
  color: string;
}

/** Icon + accent registry, keyed by the flattened {@link NodeType}. */
export const NODE_META: Record<NodeType, NodeMeta> = {
  trigger: { icon: Zap, label: 'Trigger', color: 'var(--node-trigger)' },
  integration: {
    icon: Bot,
    label: 'Integration',
    color: 'var(--node-integration)',
  },
  transform: {
    icon: Shuffle,
    label: 'Transform',
    color: 'var(--node-transform)',
  },
  'control-flow': {
    icon: GitBranch,
    label: 'Control flow',
    color: 'var(--node-control-flow)',
  },
  split: { icon: Split, label: 'Split', color: 'var(--node-split)' },
  merge: { icon: Combine, label: 'Merge', color: 'var(--node-merge)' },
  effect: { icon: Send, label: 'Effect', color: 'var(--node-effect)' },
};
