import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

/**
 * `tsai-slider` — a numeric range control over a native `<input type="range">`
 * (accessible + keyboard out of the box), tinted with the accent color. Works
 * with signal forms via `FormValueControl<number>`.
 */
@Component({
  selector: 'tsai-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="flex items-center gap-3">
    <input
      type="range"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [value]="value()"
      [disabled]="disabled()"
      [attr.aria-invalid]="invalid() || null"
      class="h-1.5 w-full cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-50"
      (input)="value.set(+$any($event.target).value)"
    />
    @if (showValue()) {
      <span class="w-10 shrink-0 text-right text-sm tabular-nums text-text-2">
        {{ value() }}
      </span>
    }
  </div>`,
})
export class Slider implements FormValueControl<number> {
  readonly min = input<number | undefined>(0);
  readonly max = input<number | undefined>(100);
  readonly step = input(1);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly showValue = input(true);
  readonly value = model(0);
}
