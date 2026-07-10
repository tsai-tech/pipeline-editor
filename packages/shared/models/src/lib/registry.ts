import {
  type BoardNode,
  type ControlFlowConfig,
  type ControlFlowKind,
  defaultPorts,
  type NodePort,
} from './models';

/**
 * Node-type registry (n8n-style descriptions) shared by the editor and the
 * future execution engine. For now it covers control-flow: mapping a node's
 * configuration to its named output ports, and the default config per subtype.
 *
 * Kept in `shared` so both `board` (editor) and the future `workflow` engine can
 * depend on it without crossing scope boundaries; split into its own lib when the
 * engine lands.
 */

/** Whether a node is a control-flow node (if / switch / filter). */
export function isControlFlow(node: Pick<BoardNode, 'kind' | 'category'>): boolean {
  return node.kind === 'action' && node.category === 'control-flow';
}

/** The named branch outputs implied by a control-flow configuration. */
export function controlFlowOutputs(
  config: ControlFlowConfig,
): { id: string; label: string }[] {
  switch (config.type) {
    case 'if':
      return [
        { id: 'true', label: 'true' },
        { id: 'false', label: 'false' },
      ];
    case 'switch':
      return [
        ...config.cases.map((c) => ({
          id: `case-${c.id}`,
          label: c.label || c.value || 'case',
        })),
        ...(config.hasDefault ? [{ id: 'default', label: 'default' }] : []),
      ];
    case 'filter':
      return [{ id: 'pass', label: 'pass' }];
  }
}

/**
 * Ports for a node. Control-flow nodes derive named output ports (stacked on the
 * right) from their config; everything else uses the default 3-anchor layout.
 */
export function derivePorts(node: BoardNode): NodePort[] {
  if (isControlFlow(node) && node.config) {
    return [
      { id: 'in', role: 'input', side: 'left' },
      ...controlFlowOutputs(node.config).map(
        (o): NodePort => ({
          id: o.id,
          role: 'output',
          side: 'right',
          label: o.label,
        }),
      ),
    ];
  }
  return defaultPorts(node.kind);
}

/** Default configuration when a control-flow subtype is first chosen. */
export function defaultControlFlowConfig(
  type: ControlFlowKind,
): ControlFlowConfig {
  switch (type) {
    case 'if':
      return { type: 'if', expression: '' };
    case 'switch':
      return {
        type: 'switch',
        discriminant: '',
        cases: [{ id: '1', label: 'Case 1', value: '' }],
        hasDefault: true,
      };
    case 'filter':
      return { type: 'filter', expression: '' };
  }
}
