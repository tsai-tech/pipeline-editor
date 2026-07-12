import {
  type ActionCategory,
  type BoardNode,
  defaultPorts,
  type NodeKind,
  type NodePort,
  nodeType,
} from '@tsai-pe/models';

/**
 * Backend-provided node catalog contract. This package intentionally contains no
 * concrete Telegram/LLM/mock node catalog: host apps or backend adapters provide
 * node specs, and the editor renders forms/ports from those specs.
 */

export type ParamType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'boolean'
  | 'select'
  | 'expression'
  | 'file'
  | 'json'
  | 'array'
  | 'object'
  | 'secret'
  | 'credential'
  | 'code'
  | 'url'
  | 'model'
  | 'resource-picker';

export interface ParamOption {
  value: string;
  label: string;
}

export interface ParamField {
  key: string;
  label: string;
  type: ParamType;
  section?: string;
  placeholder?: string;
  help?: string;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  language?: 'json' | 'javascript' | 'typescript' | 'markdown' | 'text';
  defaultValue?: unknown;
  visibleWhen?: { key: string; equals: unknown };
  options?: ParamOption[];
  /** For `array` fields. A list means each item is an object with these fields. */
  item?: ParamField | ParamField[];
  /** For `object` fields. */
  fields?: ParamField[];
}

export type OutputSchema =
  | { type: 'string' | 'number' | 'boolean' | 'null' }
  | { type: 'array'; items?: OutputSchema }
  | { type: 'object'; properties: Record<string, OutputSchema> };

export type PortTemplate =
  | NodePort
  | {
      id: string;
      role: 'input' | 'output';
      side: 'left' | 'right' | 'top' | 'bottom';
      label?: string;
    };

export interface DynamicPortTemplate {
  role: 'output';
  side?: 'right' | 'top' | 'bottom';
  from: string;
  id: string;
  label?: string;
}

export interface ConditionalPortTemplate {
  role: 'output';
  side?: 'right' | 'top' | 'bottom';
  when: string;
  equals?: unknown;
  id: string;
  label?: string;
}

export interface NodePortSpec {
  static?: PortTemplate[];
  dynamic?: DynamicPortTemplate[];
  conditional?: ConditionalPortTemplate[];
}

export interface NodeTypeSpec {
  id: string;
  label: string;
  section?: string;
  kind: NodeKind;
  category?: ActionCategory;
  params: ParamField[];
  ports?: NodePortSpec;
  outputSchema?: OutputSchema;
  /** Optional schema example for expression help; not runtime behavior. */
  outputExample?: Record<string, unknown>;
}

export interface NodeCatalog {
  readonly version: string;
  specs(): readonly NodeTypeSpec[];
  entry(type: string | undefined): NodeTypeSpec | undefined;
  params(node: Pick<BoardNode, 'kind' | 'category' | 'type'>): ParamField[];
  ports(node: Pick<BoardNode, 'kind' | 'category' | 'type' | 'data' | 'ports'>): NodePort[];
  outputSchema(type: string | undefined): OutputSchema | undefined;
  outputExample(type: string | undefined): Record<string, unknown> | undefined;
}

export const EMPTY_NODE_CATALOG = createNodeCatalog([], 'empty-v1');

export function createNodeCatalog(
  specs: readonly NodeTypeSpec[],
  version = 'catalog-v1',
): NodeCatalog {
  const byId = new Map(specs.map((spec) => [spec.id, spec]));
  return {
    version,
    specs: () => specs,
    entry: (type) => (type ? byId.get(type) : undefined),
    params: (node) => byId.get(node.type ?? '')?.params ?? [],
    ports: (node) => derivePorts(node, byId.get(node.type ?? '')),
    outputSchema: (type) => {
      const spec = type ? byId.get(type) : undefined;
      return spec?.outputSchema ?? inferOutputSchema(spec?.outputExample);
    },
    outputExample: (type) => (type ? byId.get(type)?.outputExample : undefined),
  };
}

export function isControlFlow(
  node: Pick<BoardNode, 'kind' | 'category'>,
): boolean {
  return node.kind === 'action' && node.category === 'control-flow';
}

export function derivePorts(
  node: Pick<BoardNode, 'kind' | 'category' | 'type' | 'data' | 'ports'>,
  spec?: NodeTypeSpec,
): NodePort[] {
  if (!spec?.ports) return defaultPorts(node.kind);

  const ports: NodePort[] = [];
  for (const port of spec.ports.static ?? []) ports.push({ ...port });

  for (const dynamic of spec.ports.dynamic ?? []) {
    const items = valueAt(node.data, dynamic.from);
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      ports.push({
        id: renderTemplate(dynamic.id, item),
        role: dynamic.role,
        side: dynamic.side ?? 'right',
        label: renderTemplate(dynamic.label ?? dynamic.id, item),
      });
    }
  }

  for (const conditional of spec.ports.conditional ?? []) {
    const value = valueAt(node.data, conditional.when);
    const shouldRender =
      'equals' in conditional ? value === conditional.equals : Boolean(value);
    if (!shouldRender) continue;
    ports.push({
      id: conditional.id,
      role: conditional.role,
      side: conditional.side ?? 'right',
      label: conditional.label,
    });
  }

  return ports.length ? ports : defaultPorts(node.kind);
}

export function defaultData(spec: NodeTypeSpec): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of spec.params) {
    if (field.defaultValue !== undefined) {
      data[field.key] = clone(field.defaultValue);
    } else if (field.type === 'array') {
      data[field.key] = [];
    } else if (field.type === 'object') {
      data[field.key] = {};
    }
  }
  return data;
}

export function fieldGroups(
  fields: readonly ParamField[],
): { section: string; fields: ParamField[] }[] {
  const groups: { section: string; fields: ParamField[] }[] = [];
  for (const field of fields) {
    const section = field.section ?? 'Parameters';
    const existing = groups.find((group) => group.section === section);
    if (existing) existing.fields.push(field);
    else groups.push({ section, fields: [field] });
  }
  return groups;
}

export function inferOutputSchema(value: unknown): OutputSchema | undefined {
  if (value === undefined) return undefined;
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    return { type: 'array', items: inferOutputSchema(value[0]) };
  }
  if (typeof value === 'object') {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Object.entries(value as Record<string, unknown>).flatMap(
          ([key, child]) => {
            const schema = inferOutputSchema(child);
            return schema ? [[key, schema]] : [];
          },
        ),
      ),
    };
  }
  if (typeof value === 'string') return { type: 'string' };
  if (typeof value === 'number') return { type: 'number' };
  if (typeof value === 'boolean') return { type: 'boolean' };
  return undefined;
}

export function specVisualType(spec: Pick<NodeTypeSpec, 'kind' | 'category'>) {
  return nodeType(spec);
}

function valueAt(data: Record<string, unknown> | undefined, path: string): unknown {
  if (!data) return undefined;
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, data);
}

function renderTemplate(template: string, item: unknown): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, path: string) => {
    const value =
      item && typeof item === 'object'
        ? valueAt(item as Record<string, unknown>, path)
        : undefined;
    return value == null ? '' : String(value);
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
