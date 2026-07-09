import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `tsai-field` — label / hint / error wrapper for a single form control.
 *
 * Projects the control (input, textarea, select) and adds a `<label>`, so
 * clicking the label focuses the control. Use for text-like controls; checkbox
 * and switch carry their own inline label.
 */
@Component({
  selector: 'tsai-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
    <label class="flex flex-col gap-1.5">
      @if (label()) {
        <span class="text-sm font-medium text-text-2">
          {{ label() }}
          @if (required()) {
            <span class="text-danger">&nbsp;*</span>
          }
        </span>
      }
      <ng-content />
      @if (error()) {
        <span class="text-xs text-danger">{{ error() }}</span>
      } @else if (hint()) {
        <span class="text-xs text-text-3">{{ hint() }}</span>
      }
    </label>`,
})
export class Field {
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly required = input(false);
}
