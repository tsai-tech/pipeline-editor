import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';

/**
 * `tsai-tab` — declares a single tab (label + projected content) inside
 * `tsai-tabs`. The content is captured as a `TemplateRef` so the parent can
 * render it lazily into the matching Aria tab panel.
 */
@Component({
  selector: 'tsai-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class Tab {
  readonly label = input.required<string>();
  /** Optional stable value; defaults to the tab's index when omitted. */
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
