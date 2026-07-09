import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
} from '@angular/core';
import {
  AccordionContent,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
} from '@angular/aria/accordion';
import { AccordionItem } from './accordion-item';

/**
 * `tsai-accordion` — collapsible sections built on Angular Aria's
 * `ngAccordionGroup` family.
 *
 * Usage:
 * ```html
 * <tsai-accordion [multi]="true">
 *   <tsai-accordion-item label="Section 1">…</tsai-accordion-item>
 * </tsai-accordion>
 * ```
 */
@Component({
  selector: 'tsai-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccordionGroup,
    AccordionPanel,
    AccordionTrigger,
    AccordionContent,
    NgTemplateOutlet,
  ],
  template: `<div
    ngAccordionGroup
    [multiExpandable]="multi()"
    class="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-surface-1"
  >
    @for (item of items(); track $index) {
      <div>
        <h3 class="m-0">
          <button
            ngAccordionTrigger
            [panel]="panel"
            [disabled]="item.disabled()"
            class="group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text transition-colors hover:bg-surface-2 focus-visible:outline-none disabled:opacity-50"
          >
            {{ item.label() }}
            <span
              class="text-text-3 transition-transform group-aria-expanded:rotate-180"
              aria-hidden="true"
              >⌄</span
            >
          </button>
        </h3>
        <div
          ngAccordionPanel
          #panel="ngAccordionPanel"
          class="px-4 pb-3 text-sm text-text-2"
        >
          <ng-template ngAccordionContent>
            <ng-container [ngTemplateOutlet]="item.content()" />
          </ng-template>
        </div>
      </div>
    }
  </div>`,
})
export class Accordion {
  readonly items = contentChildren(AccordionItem);
  readonly multi = input(false);
}
