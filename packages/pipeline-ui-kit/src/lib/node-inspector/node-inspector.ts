import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { BoardNode } from '@tsai-pe/models';
import { fieldGroups, type NodeCatalog, type ParamField } from '@tsai-pe/nodes';
import { Input, Select, Textarea, type SelectOption } from '@tsai-pe/ui-kit';

@Component({
  selector: 'pe-node-inspector',
  imports: [Input, Select, Textarea],
  template: `
    <div class="flex min-h-0 flex-col gap-4 text-text">
      <section class="grid gap-3">
        <div class="grid gap-1.5">
          <span class="text-xs font-medium text-text-2">Title</span>
          <tsai-input
            size="sm"
            [value]="node().title"
            (valueChange)="updateNode({ title: $event })"
          />
        </div>
        <div class="grid gap-1.5">
          <span class="text-xs font-medium text-text-2">Subtitle</span>
          <tsai-input
            size="sm"
            [value]="node().subtitle ?? ''"
            (valueChange)="updateNode({ subtitle: $event })"
          />
        </div>
      </section>

      @for (group of groups(); track group.section) {
        <section class="grid gap-3 border-t border-border pt-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-text-3">
            {{ group.section }}
          </h3>
          @for (field of group.fields; track field.key) {
            @if (visible(field)) {
              <div class="grid gap-1.5">
                <span class="flex items-center justify-between gap-2">
                  <span class="text-xs font-medium text-text-2">
                    {{ field.label }}
                  </span>
                  @if (field.required) {
                    <span
                      class="text-[10px] font-semibold text-[var(--danger)]"
                    >
                      required
                    </span>
                  }
                </span>

                @switch (field.type) {
                  @case ('textarea') {
                    <tsai-textarea
                      [rows]="field.rows ?? 4"
                      [value]="stringValue(field)"
                      [placeholder]="field.placeholder ?? ''"
                      (valueChange)="updateData(field.key, $event)"
                    />
                  }
                  @case ('code') {
                    <tsai-textarea
                      [rows]="field.rows ?? 6"
                      [mono]="true"
                      [value]="stringValue(field)"
                      [placeholder]="field.placeholder ?? ''"
                      (valueChange)="updateData(field.key, $event)"
                    />
                  }
                  @case ('json') {
                    <tsai-textarea
                      [rows]="field.rows ?? 6"
                      [mono]="true"
                      [value]="jsonValue(field)"
                      [placeholder]="field.placeholder ?? '{}'"
                      (valueChange)="updateJson(field.key, $event)"
                    />
                  }
                  @case ('object') {
                    <tsai-textarea
                      [rows]="field.rows ?? 6"
                      [mono]="true"
                      [value]="jsonValue(field)"
                      [placeholder]="field.placeholder ?? '{}'"
                      (valueChange)="updateJson(field.key, $event)"
                    />
                  }
                  @case ('array') {
                    <tsai-textarea
                      [rows]="field.rows ?? 6"
                      [mono]="true"
                      [value]="jsonValue(field)"
                      [placeholder]="field.placeholder ?? '[]'"
                      (valueChange)="updateJson(field.key, $event)"
                    />
                  }
                  @case ('select') {
                    <tsai-select
                      [options]="options(field)"
                      [value]="selectValue(field)"
                      (valueChange)="
                        updateData(field.key, selectedValue($event))
                      "
                    />
                  }
                  @case ('boolean') {
                    <input
                      type="checkbox"
                      class="h-4 w-4 accent-[var(--accent)]"
                      [checked]="booleanValue(field)"
                      (change)="
                        updateData(field.key, $any($event.target).checked)
                      "
                    />
                  }
                  @case ('number') {
                    <tsai-input
                      type="number"
                      size="sm"
                      [value]="stringValue(field)"
                      [placeholder]="field.placeholder ?? ''"
                      (valueChange)="updateNumber(field.key, $event)"
                    />
                  }
                  @default {
                    <tsai-input
                      size="sm"
                      [value]="stringValue(field)"
                      [placeholder]="field.placeholder ?? ''"
                      (valueChange)="updateData(field.key, $event)"
                    />
                  }
                }

                @if (field.help) {
                  <span class="text-[11px] leading-snug text-text-3">
                    {{ field.help }}
                  </span>
                }
              </div>
            }
          }
        </section>
      } @empty {
        <div
          class="rounded-sm border border-border bg-surface-2 p-3 text-xs text-text-3"
        >
          This node has no catalog parameters.
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeInspector {
  readonly node = input.required<BoardNode>();
  readonly catalog = input.required<NodeCatalog>();

  readonly nodeChange = output<BoardNode>();

  protected readonly params = computed(() =>
    this.catalog().params(this.node()),
  );
  protected readonly groups = computed(() => fieldGroups(this.params()));

  protected updateNode(patch: Partial<BoardNode>): void {
    this.nodeChange.emit({ ...this.node(), ...patch });
  }

  protected updateData(key: string, value: unknown): void {
    this.updateNode({ data: { ...(this.node().data ?? {}), [key]: value } });
  }

  protected updateNumber(key: string, value: string): void {
    const parsed = Number(value);
    this.updateData(key, Number.isFinite(parsed) ? parsed : value);
  }

  protected updateJson(key: string, value: string): void {
    try {
      this.updateData(key, JSON.parse(value) as unknown);
    } catch {
      this.updateData(key, value);
    }
  }

  protected visible(field: ParamField): boolean {
    const condition = field.visibleWhen;
    return (
      !condition || (this.node().data ?? {})[condition.key] === condition.equals
    );
  }

  protected stringValue(field: ParamField): string {
    const value = (this.node().data ?? {})[field.key];
    return value === undefined || value === null ? '' : String(value);
  }

  protected jsonValue(field: ParamField): string {
    const value = (this.node().data ?? {})[field.key];
    if (typeof value === 'string') return value;
    return JSON.stringify(value ?? (field.type === 'array' ? [] : {}), null, 2);
  }

  protected booleanValue(field: ParamField): boolean {
    return Boolean((this.node().data ?? {})[field.key]);
  }

  protected selectValue(field: ParamField): string[] {
    const value = (this.node().data ?? {})[field.key];
    return typeof value === 'string' ? [value] : [];
  }

  protected selectedValue(values: readonly string[]): string {
    return values.length ? values[0] : '';
  }

  protected options(field: ParamField): SelectOption[] {
    return field.options ?? [];
  }
}
