import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Badge, GlowSurface } from '@tsai-pe/ui-kit';

/** Placeholder playground for the `board` (canvas) domain. */
@Component({
  selector: 'app-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GlowSurface, Badge],
  template: `<tsai-glow-surface class="block">
    <div class="flex flex-col items-center gap-3 py-16 text-center">
      <tsai-badge variant="accent">Coming soon</tsai-badge>
      <h2 class="text-lg font-semibold text-text">Board playground</h2>
      <p class="max-w-md text-sm text-text-2">
        The canvas domain — an infinite 32×32 dot grid, trigger → middleware →
        result nodes, edges and pan / zoom navigation — will be showcased here
        once the <code>board/*</code> libraries are scaffolded. See
        ARCHITECTURE.md.
      </p>
    </div>
  </tsai-glow-surface>`,
})
export class BoardPlayground {}
