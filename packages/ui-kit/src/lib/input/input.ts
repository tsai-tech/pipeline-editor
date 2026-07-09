import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

export type InputSize = 'sm' | 'md';

const CONTROL =
  'w-full rounded-sm border bg-surface-2 px-3 text-sm text-text placeholder:text-text-3 transition-colors focus-visible:outline-none focus-visible:border-accent-hover disabled:opacity-50 disabled:cursor-not-allowed';

/** `tsai-input` — single-line text input over a native `<input>`. */
@Component({
  selector: 'tsai-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<input
    [type]="type()"
    [placeholder]="placeholder()"
    [disabled]="disabled()"
    [value]="value()"
    [attr.aria-invalid]="invalid() || null"
    [class]="classes()"
    (input)="value.set($any($event.target).value)"
  />`,
})
export class Input {
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'search'>(
    'text',
  );
  readonly placeholder = input('');
  readonly size = input<InputSize>('md');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly value = model('');

  protected readonly classes = computed(
    () =>
      `${CONTROL} ${this.size() === 'sm' ? 'h-8' : 'h-9'} ${
        this.invalid() ? 'border-danger' : 'border-border'
      }`,
  );
}
