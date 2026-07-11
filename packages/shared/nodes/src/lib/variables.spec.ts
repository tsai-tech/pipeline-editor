import { variablePaths } from './variables';

describe('variablePaths', () => {
  it('lists top-level primitive keys', () => {
    expect(variablePaths({ count: 10, source: 'telegram' })).toEqual([
      'count',
      'source',
    ]);
  });

  it('includes an array and a sample element path', () => {
    expect(variablePaths({ items: [1, 2, 3] })).toEqual(['items', 'items[0]']);
  });

  it('drills into nested objects with dotted paths', () => {
    expect(variablePaths({ user: { id: 1, name: 'a' } })).toEqual([
      'user.id',
      'user.name',
    ]);
  });

  it('walks arrays of objects via a sample element', () => {
    expect(variablePaths({ rows: [{ x: 1 }] })).toEqual(['rows', 'rows[0].x']);
  });

  it('returns nothing for primitives or empty containers', () => {
    expect(variablePaths(42)).toEqual([]);
    expect(variablePaths('hi')).toEqual([]);
    expect(variablePaths({})).toEqual([]);
    expect(variablePaths([])).toEqual([]);
  });

  it('respects the depth limit', () => {
    const deep = { a: { b: { c: { d: 1 } } } };
    // maxDepth 2 → stops before reaching d
    expect(variablePaths(deep, 2)).toEqual([]);
    expect(variablePaths(deep, 4)).toEqual(['a.b.c.d']);
  });

  it('respects the path-count cap', () => {
    const wide: Record<string, number> = {};
    for (let i = 0; i < 100; i++) wide[`k${i}`] = i;
    expect(variablePaths(wide, 3, 10)).toHaveLength(10);
  });
});
