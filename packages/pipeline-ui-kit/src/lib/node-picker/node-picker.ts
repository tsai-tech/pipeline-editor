import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  defaultData,
  type NodeCatalog,
  type NodeTypeSpec,
  variablePaths,
} from '@tsai-pe/nodes';
import { type ActionCategory, type NodeKind, nodeType } from '@tsai-pe/models';
import { Input } from '@tsai-pe/ui-kit';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';
import { NODE_META } from '../node/node-meta';

export interface NodePickerItem {
  id: string;
  label: string;
  description: string;
  section: string;
  kind: NodeKind;
  category?: ActionCategory;
  icon: LucideIconData;
  color: string;
  spec: NodeTypeSpec;
  data: Record<string, unknown>;
}

function defaultSection(spec: NodeTypeSpec): string {
  const t = nodeType(spec);
  if (t === 'trigger') return 'Triggers';
  if (t === 'effect') return 'Effects';
  if (t === 'integration') return 'Integrations';
  if (t === 'transform') return 'Transforms';
  return 'Flow';
}

function description(spec: NodeTypeSpec): string {
  if (spec.params.length) {
    return spec.params.map((param) => param.label).join(' · ');
  }
  if (spec.outputExample) {
    return `Outputs ${Object.keys(spec.outputExample).slice(0, 3).join(', ')}`;
  }
  return spec.category ? `${spec.category} node` : `${spec.kind} node`;
}

function searchText(item: NodePickerItem): string {
  const paramText = item.spec.params
    .flatMap((param) => [
      param.key,
      param.label,
      param.placeholder ?? '',
      param.help ?? '',
      ...(param.options?.flatMap((o) => [o.value, o.label]) ?? []),
    ])
    .join(' ');
  return [
    item.section,
    item.label,
    item.description,
    item.kind,
    item.category ?? '',
    item.id,
    paramText,
    variablePaths(item.spec.outputExample).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

@Component({
  selector: 'pe-node-picker',
  imports: [Input, LucideAngularModule],
  template: `
    <div class="flex h-full min-h-0 flex-col bg-[var(--surface-1)]">
      @if (searchable()) {
        <div class="border-b border-border p-3">
          <tsai-input
            type="search"
            size="sm"
            placeholder="Search nodes..."
            [clearable]="true"
            [value]="search()"
            (valueChange)="search.set($event)"
          />
        </div>
      }

      <div class="min-h-0 flex-1 overflow-y-auto p-2">
        @for (group of groups(); track group.section) {
          <section class="mb-2">
            <div
              class="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-3"
            >
              {{ group.section }}
            </div>
            <div class="flex flex-col gap-1">
              @for (item of group.items; track item.id) {
                <button
                  type="button"
                  class="group flex min-h-[68px] w-full items-start gap-3 rounded-md border border-border bg-surface-1 px-2.5 py-2 text-left transition-colors hover:border-[var(--node-accent)] hover:bg-surface-3"
                  [style.--node-accent]="item.color"
                  [attr.aria-label]="'Add ' + item.label + ' node'"
                  draggable="true"
                  (click)="nodeSelected.emit(item)"
                  (dragstart)="onDragStart(item, $event)"
                >
                  <span
                    class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm text-[var(--node-accent)] bg-[color-mix(in_srgb,var(--node-accent)_14%,transparent)]"
                  >
                    <lucide-icon [img]="item.icon" [size]="16" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="flex min-w-0 items-center gap-2">
                      <span class="truncate text-sm font-medium text-text">
                        {{ item.label }}
                      </span>
                      <span
                        class="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--node-accent)_12%,transparent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--node-accent)]"
                      >
                        {{ item.kind }}
                      </span>
                    </span>
                    <span
                      class="mt-0.5 line-clamp-2 text-xs leading-snug text-text-3"
                    >
                      {{ item.description }}
                    </span>
                  </span>
                </button>
              }
            </div>
          </section>
        } @empty {
          <div class="px-2 py-6 text-center text-xs text-text-3">
            No matching nodes.
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodePicker {
  readonly catalog = input.required<NodeCatalog>();
  readonly searchable = input(true);
  readonly dragDataType = input('application/x-tsai-pe-node');

  readonly nodeSelected = output<NodePickerItem>();

  protected readonly search = signal('');

  protected readonly items = computed<NodePickerItem[]>(() =>
    this.catalog()
      .specs()
      .map((spec) => {
        const meta = NODE_META[nodeType(spec)];
        return {
          id: spec.id,
          label: spec.label,
          description: description(spec),
          section: spec.section ?? defaultSection(spec),
          kind: spec.kind,
          category: spec.category,
          icon: meta.icon,
          color: meta.color,
          spec,
          data: defaultData(spec),
        };
      }),
  );

  protected readonly groups = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const items = needle
      ? this.items().filter((item) => searchText(item).includes(needle))
      : this.items();
    const groups: { section: string; items: NodePickerItem[] }[] = [];
    for (const item of items) {
      const group = groups.find((g) => g.section === item.section);
      if (group) group.items.push(item);
      else groups.push({ section: item.section, items: [item] });
    }
    return groups;
  });

  protected onDragStart(item: NodePickerItem, event: DragEvent): void {
    event.dataTransfer?.setData(this.dragDataType(), JSON.stringify(item));
    event.dataTransfer?.setData('text/plain', item.label);
  }
}
