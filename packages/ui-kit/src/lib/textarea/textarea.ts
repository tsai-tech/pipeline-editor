import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

const CONTROL =
  'w-full resize-y rounded-sm border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-3 transition-colors focus-visible:outline-none focus-visible:border-accent-hover disabled:opacity-50 disabled:cursor-not-allowed';

/** `tsai-textarea` — multi-line text input over a native `<textarea>`. */
@Component({
  selector: 'tsai-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<textarea
    [placeholder]="placeholder()"
    [disabled]="disabled()"
    [rows]="rows()"
    [attr.aria-invalid]="invalid() || null"
    [value]="value()"
    [class]="classes()"
    (input)="value.set($any($event.target).value)"
  ></textarea>`,
})
export class Textarea {
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly value = model('');

  protected readonly classes = computed(
    () => `${CONTROL} ${this.invalid() ? 'border-danger' : 'border-border'}`,
  );
}
