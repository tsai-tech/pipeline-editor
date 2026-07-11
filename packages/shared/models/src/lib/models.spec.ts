import type { BoardNode } from './models';
import { defaultPorts, nodeType, portFraction } from './models';

describe('nodeType', () => {
  it('flattens trigger/effect by kind', () => {
    expect(nodeType({ kind: 'trigger' })).toBe('trigger');
    expect(nodeType({ kind: 'effect' })).toBe('effect');
  });

  it('uses the action category, defaulting to transform', () => {
    expect(nodeType({ kind: 'action', category: 'integration' })).toBe('integration');
    expect(nodeType({ kind: 'action' })).toBe('transform');
  });
});

describe('defaultPorts', () => {
  it('gives a trigger three outputs and no input', () => {
    const ports = defaultPorts('trigger');
    expect(ports.every((p) => p.role === 'output')).toBe(true);
    expect(ports).toHaveLength(3);
  });

  it('gives an action one input and three outputs', () => {
    const ports = defaultPorts('action');
    expect(ports.filter((p) => p.role === 'input')).toHaveLength(1);
    expect(ports.filter((p) => p.role === 'output')).toHaveLength(3);
  });

  it('gives an effect a single terminal input', () => {
    expect(defaultPorts('effect')).toEqual([
      { id: 'in', role: 'input', side: 'left' },
    ]);
  });
});

describe('portFraction', () => {
  const nodeWith = (ports: BoardNode['ports']): BoardNode => ({
    id: 'n',
    kind: 'action',
    category: 'transform',
    title: 'N',
    pos: { col: 0, row: 0 },
    size: { cols: 4, rows: 2 },
    ports,
  });

  it('centres a lone port on its side', () => {
    const node = nodeWith([{ id: 'out', role: 'output', side: 'right' }]);
    expect(portFraction(node, node.ports[0])).toBe(0.5);
  });

  it('spaces ports sharing a side evenly by 1/(n+1)', () => {
    const node = nodeWith([
      { id: 'a', role: 'output', side: 'right' },
      { id: 'b', role: 'output', side: 'right' },
      { id: 'c', role: 'output', side: 'right' },
    ]);
    expect(node.ports.map((p) => portFraction(node, p))).toEqual([0.25, 0.5, 0.75]);
  });

  it('counts only mates on the same side', () => {
    const node = nodeWith([
      { id: 'in', role: 'input', side: 'left' },
      { id: 'out', role: 'output', side: 'right' },
    ]);
    // each is alone on its own side → centred
    expect(node.ports.map((p) => portFraction(node, p))).toEqual([0.5, 0.5]);
  });
});
