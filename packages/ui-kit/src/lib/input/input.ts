import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

export type InputSize = 'sm' | 'md';

/**
 * `tsai-input` — single-line text input over a native `<input>`.
 *
 * Supports leading / trailing addon slots (`[icon-left]` / `[icon-right]`) which
 * collapse when empty, an optional `clearable` button, and — for password
 * inputs — a `revealable` show/hide toggle. The bordered wrapper owns the focus
 * ring (rounded, `focus-within`) so it matches the field shape.
 */
@Component({
  selector: 'tsai-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [class]="wrapClasses()">
    <span class="inline-flex shrink-0 text-text-3 empty:hidden">
      <ng-content select="[icon-left]" />
    </span>
    <input
      [type]="effectiveType()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [value]="value()"
      [attr.aria-invalid]="invalid() || null"
      class="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-3 focus-visible:shadow-none disabled:cursor-not-allowed"
      (input)="value.set($any($event.target).value)"
    />
    @if (clearable() && value()) {
      <button
        type="button"
        aria-label="Clear"
        class="grid size-5 shrink-0 place-items-center rounded-full text-text-3 transition-colors hover:text-text focus-visible:outline-none"
        (click)="value.set('')"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    }
    @if (revealable() && type() === 'password') {
      <button
        type="button"
        [attr.aria-label]="revealed() ? 'Hide password' : 'Show password'"
        [attr.aria-pressed]="revealed()"
        class="grid size-5 shrink-0 place-items-center rounded-full text-text-3 transition-colors hover:text-text focus-visible:outline-none"
        (click)="revealed.set(!revealed())"
      >
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          @if (revealed()) {
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path
              d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
            />
            <path
              d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
            />
            <path d="m2 2 20 20" />
          } @else {
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          }
        </svg>
      </button>
    }
    <span class="inline-flex shrink-0 text-text-3 empty:hidden">
      <ng-content select="[icon-right]" />
    </span>
  </div>`,
})
export class Input implements FormValueControl<string> {
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'search'>(
    'text',
  );
  readonly placeholder = input('');
  readonly size = input<InputSize>('md');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly clearable = input(false);
  /** For password inputs, show a reveal (show/hide) toggle. */
  readonly revealable = input(false);
  readonly value = model('');

  protected readonly revealed = signal(false);

  protected readonly effectiveType = computed(() =>
    this.type() === 'password' && this.revealable() && this.revealed()
      ? 'text'
      : this.type(),
  );

  protected readonly wrapClasses = computed(
    () =>
      `flex items-center gap-2 rounded-sm border bg-surface-2 px-3 transition-colors focus-within:border-accent-hover ${
        this.size() === 'sm' ? 'h-8' : 'h-9'
      } ${this.invalid() ? 'border-danger' : 'border-border'} ${
        this.disabled() ? 'opacity-50' : ''
      }`,
  );
}
