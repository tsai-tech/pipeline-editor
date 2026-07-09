import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'trigger'
  | 'middleware'
  | 'result';

const BASE =
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium';

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-2 text-text-2 border border-border',
  accent: 'bg-accent-quiet text-accent',
  success: 'bg-surface-2 text-success',
  warning: 'bg-surface-2 text-warning',
  danger: 'bg-surface-2 text-danger',
  trigger: 'bg-role-trigger/15 text-role-trigger',
  middleware: 'bg-role-middleware/15 text-role-middleware',
  result: 'bg-role-result/15 text-role-result',
};

/** `tsai-badge` — a small status / label pill. */
@Component({
  selector: 'tsai-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class Badge {
  readonly variant = input<BadgeVariant>('neutral');
  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]}`,
  );
}
