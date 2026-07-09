import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  model,
} from '@angular/core';
import {
  Tab as AriaTab,
  TabContent,
  TabList,
  TabPanel,
  Tabs as AriaTabs,
} from '@angular/aria/tabs';
import { Tab } from './tab';

/**
 * `tsai-tabs` — tabbed interface built on Angular Aria's `ngTabs` family.
 *
 * Usage:
 * ```html
 * <tsai-tabs>
 *   <tsai-tab label="Overview">…</tsai-tab>
 *   <tsai-tab label="Settings">…</tsai-tab>
 * </tsai-tabs>
 * ```
 */
@Component({
  selector: 'tsai-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AriaTabs, TabList, AriaTab, TabPanel, TabContent, NgTemplateOutlet],
  template: `<div ngTabs>
    <ul
      ngTabList
      [(selectedTab)]="selected"
      class="flex gap-1 border-b border-border"
    >
      @for (tab of tabs(); track $index) {
        <li
          ngTab
          [value]="valueAt($index)"
          [disabled]="tab.disabled()"
          class="-mb-px cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm text-text-2 transition-colors hover:text-text aria-selected:border-accent aria-selected:text-text"
        >
          {{ tab.label() }}
        </li>
      }
    </ul>
    @for (tab of tabs(); track $index) {
      <div
        ngTabPanel
        [value]="valueAt($index)"
        class="py-4 text-sm text-text-2"
      >
        <ng-template ngTabContent>
          <ng-container [ngTemplateOutlet]="tab.content()" />
        </ng-template>
      </div>
    }
  </div>`,
})
export class Tabs implements AfterContentInit {
  readonly tabs = contentChildren(Tab);
  readonly selected = model<string>();

  protected valueAt(index: number): string {
    return this.tabs()[index]?.value() || String(index);
  }

  ngAfterContentInit(): void {
    if (this.selected() === undefined && this.tabs().length) {
      this.selected.set(this.valueAt(0));
    }
  }
}
