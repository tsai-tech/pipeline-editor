# @tsai-pe/theme

Design tokens + global stylesheet for Pipeline Editor. Dark-first, premium
("technological") visual language — single indigo accent, hairline borders,
muted node-role tints.

```bash
npm i @tsai-pe/theme
```

It ships two CSS files; no build step is required — the consuming app imports and
scans them.

## Files

- `src/theme.css` — design tokens as CSS custom properties (source of truth).
  Usable in Tailwind, component styles, and inline styles in the board renderer.
- `src/index.css` — Tailwind v4 entry: imports Tailwind + tokens, maps tokens to
  Tailwind's `@theme` namespaces, and adds a base layer + board helpers
  (`.board-grid`, `.glass`, `.grain`).

## Usage

In the consuming app's global stylesheet (`src/styles.css`):

```css
@import '@tsai-pe/theme';

/* Tailwind v4: scan the class names shipped inside the installed libraries. */
@source '../node_modules/@tsai-pe/board';
@source '../node_modules/@tsai-pe/ui-kit';
```

> Inside this monorepo the playground instead points `@source` at the workspace
> sources (`../../../packages/board`, `../../../packages/ui-kit`).

Angular's application builder picks up Tailwind via the workspace `.postcssrc.json`
(`@tailwindcss/postcss`). Vite-based previews/tests use `@tailwindcss/vite`.

## Tokens (quick reference)

| Group   | Tokens                                                                         |
| ------- | ------------------------------------------------------------------------------ |
| Surface | `--bg`, `--bg-sunken`, `--surface-1..3`                                        |
| Border  | `--border`, `--border-strong`, `--border-subtle`, `--highlight-top`            |
| Text    | `--text`, `--text-2`, `--text-3`, `--text-disabled`                            |
| Accent  | `--accent`, `--accent-hover/press/fg/quiet/glow`                               |
| Roles   | `--role-trigger`, `--role-middleware`, `--role-result` (+ `-quiet`)            |
| Board   | `--canvas-bg`, `--canvas-grid-dot`, `--canvas-grid-size`, `--edge*`, `--port*` |
| Shape   | `--r-xs..xl`, `--r-full`, `--elev-1..3`                                        |
| Type    | `--font-sans`, `--font-mono`                                                   |

Light theme: add `class="light"` to `<html>`. Same token names, mirrored values.
