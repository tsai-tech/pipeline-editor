import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Badge, GlowSurface } from '@tsai-pe/ui-kit';

/** Placeholder playground for the `workflow` (execution) domain. */
@Component({
  selector: 'app-workflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlowSurface, Badge],
  template: `<tsai-glow-surface class="block">
    <div class="flex flex-col items-center gap-3 py-16 text-center">
      <tsai-badge variant="accent">Coming soon</tsai-badge>
      <h2 class="text-lg font-semibold text-text">Workflow playground</h2>
      <p class="max-w-md text-sm text-text-2">
        The business domain — the n8n-style execution engine and node catalog
        (triggers / middlewares / results) — will be exercised here once the
        <code>workflow/*</code> and <code>nodes/*</code> libraries exist. See
        ARCHITECTURE.md.
      </p>
    </div>
  </tsai-glow-surface>`,
})
export class WorkflowPlayground {}
