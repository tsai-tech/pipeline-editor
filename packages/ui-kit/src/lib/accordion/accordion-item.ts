import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
  viewChild,
} from '@angular/core';

/**
 * `tsai-accordion-item` — one collapsible item (header + projected content)
 * inside `tsai-accordion`. Content is captured as a `TemplateRef` for lazy
 * rendering into the matching Aria accordion panel.
 */
@Component({
  selector: 'tsai-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class AccordionItem {
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}
