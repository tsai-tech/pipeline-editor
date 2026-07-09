import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * `tsai-select` — a listbox selection control built on Angular Aria's headless
 * `ngListbox` / `ngOption` directives (keyboard, focus, ARIA handled for us),
 * styled with our theme. Supports single and multiple selection.
 */
@Component({
  selector: 'tsai-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Listbox, Option],
  template: `<ul
    ngListbox
    [(values)]="value"
    [multi]="multi()"
    class="flex max-h-64 flex-col gap-0.5 overflow-auto rounded-md border border-border bg-surface-1 p-1 text-sm text-text focus-visible:outline-none"
  >
    @for (opt of options(); track opt.value) {
      <li
        ngOption
        [value]="opt.value"
        [label]="opt.label"
        [disabled]="opt.disabled ?? false"
        class="flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 transition-colors hover:bg-surface-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-selected:bg-accent-quiet aria-selected:text-text"
      >
        <span>{{ opt.label }}</span>
        @if (isSelected(opt.value)) {
          <span class="text-accent">✓</span>
        }
      </li>
    }
  </ul>`,
})
export class Select {
  readonly options = input<SelectOption[]>([]);
  readonly multi = input(false);
  readonly value = model<string[]>([]);

  protected readonly isSelected = (v: string): boolean =>
    this.value().includes(v);
}
