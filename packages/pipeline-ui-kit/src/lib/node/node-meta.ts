import {
  Bell,
  Bot,
  Braces,
  Database,
  GitBranch,
  GitMerge,
  ListFilter,
  PlugZap,
  Radio,
  RefreshCw,
  Rows3,
  Split,
  type LucideIconData,
} from 'lucide-angular';
import type { ControlFlowKind, NodeType } from '@tsai-pe/models';

export interface NodeMeta {
  label: string;
  color: string;
  icon: LucideIconData;
}

export const NODE_META: Record<NodeType, NodeMeta> = {
  trigger: { label: 'Trigger', color: 'var(--node-trigger)', icon: Radio },
  integration: {
    label: 'Integration',
    color: 'var(--node-integration)',
    icon: PlugZap,
  },
  transform: {
    label: 'Transform',
    color: 'var(--node-transform)',
    icon: Braces,
  },
  'control-flow': {
    label: 'Control',
    color: 'var(--node-control)',
    icon: GitBranch,
  },
  split: { label: 'Split', color: 'var(--node-split)', icon: Split },
  merge: { label: 'Merge', color: 'var(--node-merge)', icon: GitMerge },
  effect: { label: 'Effect', color: 'var(--node-effect)', icon: Bell },
};

export const CONTROL_FLOW_ICONS: Record<ControlFlowKind, LucideIconData> = {
  if: GitBranch,
  switch: Rows3,
  filter: ListFilter,
};

export const CATEGORY_ICONS = {
  agent: Bot,
  data: Database,
  refresh: RefreshCw,
} as const;
