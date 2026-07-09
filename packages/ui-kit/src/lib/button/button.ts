import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm font-medium select-none transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-press',
  secondary: 'bg-surface-2 text-text border border-border hover:bg-surface-3',
  ghost: 'text-text-2 hover:bg-surface-2 hover:text-text',
  danger: 'bg-danger text-white hover:brightness-110',
};

/**
 * `tsai-button` — the ui-kit's baseline action control.
 *
 * A thin, fully-styled wrapper over a native `<button>` (already accessible),
 * driven entirely by the design tokens in `@tsai-pe/shared/theme`.
 */
@Component({
  selector: 'tsai-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    [type]="type()"
    [disabled]="disabled()"
    [class]="classes()"
  >
    <ng-content />
  </button>`,
  host: {
    '[attr.data-variant]': 'variant()',
  },
})
export class Button {
  /** Visual emphasis of the button. */
  readonly variant = input<ButtonVariant>('primary');
  /** Control height / padding. */
  readonly size = input<ButtonSize>('md');
  /** Native button `type`. */
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Disable interaction and dim the control. */
  readonly disabled = input(false);

  protected readonly classes = computed(
    () => `${BASE} ${SIZES[this.size()]} ${VARIANTS[this.variant()]}`,
  );
}
