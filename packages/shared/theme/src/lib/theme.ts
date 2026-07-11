/**
 * `@tsai-pe/theme` — design tokens + global stylesheet.
 *
 * The real payload of this library is CSS, consumed via
 * `@import '@tsai-pe/theme';` (see `src/index.css` / `src/theme.css`).
 * These constants expose the stylesheet entry points for tooling that needs to
 * resolve them programmatically (e.g. bundler globs, docs).
 */

/** Tailwind v4 entry: imports Tailwind + tokens and maps them to `@theme`. */
export const themeStylesheet = '@tsai-pe/theme/index.css';

/** Raw design tokens as CSS custom properties (source of truth). */
export const themeTokensStylesheet = '@tsai-pe/theme/theme.css';

/** Convenience: the default stylesheet import specifier for consumers. */
export function theme(): string {
  return themeStylesheet;
}
