import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const FORBIDDEN = [
  '@tsai-pe/workflow-mock',
  '@tsai-pe/workflow-http',
  'TestBackendSystem',
  'MOCK_NODE_CATALOG',
];

describe('board architecture boundaries', () => {
  it('does not import workflow/runtime implementations', () => {
    const root = resolve(process.cwd(), '..');
    const files = walk(root).filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.html')) &&
        !file.endsWith('.spec.ts'),
    );

    const violations = files.flatMap((file) => {
      const text = readFileSync(file, 'utf8');
      return FORBIDDEN.filter((pattern) => text.includes(pattern)).map(
        (pattern) => `${relative(root, file)} contains ${pattern}`,
      );
    });

    expect(violations).toEqual([]);
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) return walk(file);
    return [file];
  });
}
