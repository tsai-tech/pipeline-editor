/**
 * Expression help: flatten a node's output value into the list of variable
 * *paths* an expression downstream may reference (n8n-style). The editor can't
 * run a pipeline, so the shapes come from whatever a node actually produced in a
 * run (its `NodeRun.output`); this walks that value into dotted/bracketed paths.
 *
 * Examples:
 * - `{ count: 10, source: 'tg' }`     → `['count', 'source']`
 * - `{ items: [1, 2, 3] }`            → `['items', 'items[0]']`
 * - `{ user: { id: 1, name: 'a' } }`  → `['user.id', 'user.name']`
 */
export function variablePaths(
  value: unknown,
  maxDepth = 3,
  maxPaths = 50,
): string[] {
  const out: string[] = [];

  const walk = (v: unknown, prefix: string, depth: number): void => {
    if (out.length >= maxPaths || depth > maxDepth) return;

    if (Array.isArray(v)) {
      if (prefix) push(out, prefix, maxPaths);
      if (v.length) walk(v[0], `${prefix}[0]`, depth + 1);
      return;
    }

    if (v && typeof v === 'object') {
      for (const [key, child] of Object.entries(v as Record<string, unknown>)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === 'object') walk(child, path, depth + 1);
        else push(out, path, maxPaths);
      }
      return;
    }

    if (prefix) push(out, prefix, maxPaths);
  };

  walk(value, '', 0);
  return out;
}

function push(out: string[], path: string, max: number): void {
  if (out.length < max) out.push(path);
}
