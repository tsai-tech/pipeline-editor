import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * `tsai-navbar` — a glass top bar with brand / center / actions slots.
 *
 * ```html
 * <tsai-navbar>
 *   <span brand>Pipeline Editor</span>
 *   <nav center>…</nav>
 *   <tsai-button actions size="sm">New</tsai-button>
 * </tsai-navbar>
 * ```
 */
@Component({
  selector: 'tsai-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<header
    class="glass flex min-h-14 flex-wrap items-center gap-2 rounded-lg px-3 py-2 sm:gap-4 sm:px-4"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2 font-semibold text-text sm:flex-none">
      <ng-content select="[brand]" />
    </div>
    <nav class="flex min-w-0 flex-1 items-center gap-1 empty:hidden">
      <ng-content select="[center]" />
    </nav>
    <div class="flex shrink-0 items-center gap-2">
      <ng-content select="[actions]" />
    </div>
  </header>`,
})
export class Navbar {}
