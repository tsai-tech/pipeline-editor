import type { BoardNode } from '@tsai-pe/models';
import {
  createNodeCatalog,
  defaultData,
  derivePorts,
  EMPTY_NODE_CATALOG,
  fieldGroups,
  inferOutputSchema,
  isControlFlow,
  type NodeTypeSpec,
} from './registry';

const switchSpec: NodeTypeSpec = {
  id: 'switch',
  label: 'Switch',
  section: 'Flow',
  kind: 'action',
  category: 'control-flow',
  params: [
    { key: 'discriminant', label: 'Discriminant', type: 'expression' },
    {
      key: 'cases',
      label: 'Cases',
      type: 'array',
      defaultValue: [{ id: '1', label: 'Case 1', value: '' }],
      item: [
        { key: 'id', label: 'Id', type: 'text' },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'value', label: 'Value', type: 'expression' },
      ],
    },
    { key: 'hasDefault', label: 'Default', type: 'boolean', defaultValue: true },
  ],
  ports: {
    static: [{ id: 'in', role: 'input', side: 'left' }],
    dynamic: [
      {
        role: 'output',
        side: 'right',
        from: 'cases',
        id: 'case-{{id}}',
        label: '{{label}}',
      },
    ],
    conditional: [
      {
        role: 'output',
        side: 'right',
        when: 'hasDefault',
        equals: true,
        id: 'default',
        label: 'default',
      },
    ],
  },
  outputExample: { branch: 'case-1' },
};

function node(data: Record<string, unknown>): BoardNode {
  return {
    id: 'n',
    kind: 'action',
    category: 'control-flow',
    type: 'switch',
    title: 'Switch',
    pos: { col: 0, row: 0 },
    size: { cols: 6, rows: 2 },
    data,
    ports: [],
  };
}

describe('isControlFlow', () => {
  it('is true only for action + control-flow', () => {
    expect(isControlFlow({ kind: 'action', category: 'control-flow' })).toBe(
      true,
    );
    expect(isControlFlow({ kind: 'action', category: 'transform' })).toBe(
      false,
    );
    expect(isControlFlow({ kind: 'trigger' })).toBe(false);
  });
});

describe('createNodeCatalog', () => {
  it('creates an isolated catalog adapter', () => {
    const catalog = createNodeCatalog([switchSpec], 'custom-v1');
    expect(catalog.version).toBe('custom-v1');
    expect(catalog.specs()).toEqual([switchSpec]);
    expect(catalog.entry('switch')?.label).toBe('Switch');
    expect(catalog.params({ kind: 'action', type: 'switch' })).toHaveLength(3);
    expect(catalog.entry('missing')).toBeUndefined();
  });

  it('keeps an empty catalog empty by default', () => {
    expect(EMPTY_NODE_CATALOG.specs()).toEqual([]);
    expect(EMPTY_NODE_CATALOG.params({ kind: 'trigger' })).toEqual([]);
  });

  it('exposes output examples separately from inferred schemas', () => {
    const catalog = createNodeCatalog([
      {
        id: 'sample',
        label: 'Sample',
        kind: 'trigger',
        params: [],
        outputExample: { body: { ok: true }, items: [{ id: 1 }] },
      },
    ]);

    expect(catalog.outputExample('sample')).toEqual({
      body: { ok: true },
      items: [{ id: 1 }],
    });
    expect(catalog.outputSchema('sample')).toEqual({
      type: 'object',
      properties: {
        body: { type: 'object', properties: { ok: { type: 'boolean' } } },
        items: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'number' } } },
        },
      },
    });
  });
});

describe('derivePorts', () => {
  it('derives switch branch ports from node data', () => {
    expect(
      derivePorts(
        node({
          cases: [
            { id: 'tg', label: 'telegram', value: 'telegram' },
            { id: 'wa', label: 'whatsapp', value: 'whatsapp' },
          ],
          hasDefault: true,
        }),
        switchSpec,
      ),
    ).toEqual([
      { id: 'in', role: 'input', side: 'left' },
      { id: 'case-tg', role: 'output', side: 'right', label: 'telegram' },
      { id: 'case-wa', role: 'output', side: 'right', label: 'whatsapp' },
      { id: 'default', role: 'output', side: 'right', label: 'default' },
    ]);
  });

  it('drops conditional ports when their predicate is false', () => {
    expect(
      derivePorts(node({ cases: [{ id: 'tg', label: 'telegram' }] }), switchSpec)
        .map((port) => port.id),
    ).toEqual(['in', 'case-tg']);
  });

  it('falls back to default ports when no spec is provided', () => {
    expect(derivePorts({ kind: 'trigger', ports: [] }).map((p) => p.role)).toEqual(
      ['output', 'output', 'output'],
    );
  });
});

describe('defaultData', () => {
  it('creates node data from field defaults', () => {
    expect(defaultData(switchSpec)).toEqual({
      cases: [{ id: '1', label: 'Case 1', value: '' }],
      hasDefault: true,
    });
  });
});

describe('fieldGroups', () => {
  it('groups fields by section while preserving order', () => {
    expect(
      fieldGroups([
        { key: 'a', label: 'A', type: 'text', section: 'One' },
        { key: 'b', label: 'B', type: 'text' },
        { key: 'c', label: 'C', type: 'text', section: 'One' },
      ]),
    ).toEqual([
      { section: 'One', fields: expect.arrayContaining([expect.objectContaining({ key: 'a' }), expect.objectContaining({ key: 'c' })]) },
      { section: 'Parameters', fields: [expect.objectContaining({ key: 'b' })] },
    ]);
  });
});

describe('inferOutputSchema', () => {
  it('returns undefined for missing output', () => {
    expect(inferOutputSchema(undefined)).toBeUndefined();
  });
});
