import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

export const PE_REF_MIME = 'application/x-pe-ref';

export type VariableVariant = 'json' | 'node' | 'neutral';

const VARIANTS: Record<VariableVariant, string> = {
  json: 'border-success/30 bg-success/10 text-success',
  node: 'border-info/30 bg-info/10 text-info',
  neutral: 'border-border bg-surface-2 text-text-2',
};

/**
 * `tsai-variable` — draggable expression reference chip.
 *
 * Dragging writes the Pipeline Editor ref MIME type and `text/plain`, so smart
 * fields can accept the same payload while native text targets still receive
 * a useful fallback.
 */
@Component({
  selector: 'tsai-variable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    [class]="classes()"
    [attr.draggable]="draggable()"
    (click)="pick.emit(ref())"
    (dragstart)="onDragstart($event)"
  >
    {{ label() || ref() }}
  </button>`,
})
export class Variable {
  readonly ref = input.required<string>();
  readonly label = input('');
  readonly variant = input<VariableVariant>('neutral');
  readonly draggable = input(true);
  readonly pick = output<string>();

  protected readonly classes = computed(
    () =>
      `inline-flex max-w-full items-center rounded-full border px-2 py-0.5 font-mono text-xs leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        VARIANTS[this.variant()]
      } ${
        this.draggable()
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-pointer'
      }`,
  );

  protected onDragstart(event: DragEvent): void {
    if (!this.draggable()) {
      event.preventDefault();
      return;
    }

    event.dataTransfer?.setData(PE_REF_MIME, this.ref());
    event.dataTransfer?.setData('text/plain', this.ref());
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
  }
}
