import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

export type TableRow = Record<string, unknown>;

/** `tsai-table` — a compact, data-driven table with a hairline-bordered surface. */
@Component({
  selector: 'tsai-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="overflow-x-auto rounded-lg border border-border">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-border bg-surface-2">
          @for (col of columns(); track col.key) {
            <th
              scope="col"
              class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-3"
              [class]="alignClass(col)"
            >
              {{ col.label }}
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track $index) {
          <tr
            class="border-b border-border transition-colors last:border-b-0 hover:bg-surface-2"
          >
            @for (col of columns(); track col.key) {
              <td class="px-3 py-2 text-text" [class]="alignClass(col)">
                {{ row[col.key] }}
              </td>
            }
          </tr>
        } @empty {
          <tr>
            <td
              [attr.colspan]="columns().length"
              class="px-3 py-6 text-center text-text-3"
            >
              No data
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>`,
})
export class Table {
  readonly columns = input<TableColumn[]>([]);
  readonly rows = input<TableRow[]>([]);

  protected alignClass(col: TableColumn): string {
    return col.align === 'right'
      ? 'text-right'
      : col.align === 'center'
        ? 'text-center'
        : 'text-left';
  }
}
