import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { Variable } from './variable';

interface JsonEntry {
  key: string;
  path: string;
  value: unknown;
  container: boolean;
  variant: 'json' | 'neutral';
}

/**
 * `tsai-json-view` — recursive, draggable JSON context tree.
 *
 * Keys are rendered as `tsai-variable` chips carrying their full accessor path,
 * and nested containers can be expanded or collapsed without losing the stable
 * ref strings used by expression fields.
 */
@Component({
  selector: 'tsai-json-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Variable, forwardRef(() => JsonView)],
  template: `<div class="font-mono text-xs leading-6 text-text-2">
    @if (entries().length) {
      <div class="flex flex-col gap-0.5">
        @for (entry of entries(); track entry.path) {
          <div>
            <div class="flex min-w-0 items-center gap-1.5">
              @if (entry.container) {
                <button
                  type="button"
                  class="grid size-5 shrink-0 place-items-center rounded-sm text-text-3 transition-colors hover:bg-surface-3 hover:text-text focus-visible:outline-none"
                  [attr.aria-expanded]="isExpanded(entry.path)"
                  (click)="toggle(entry.path)"
                >
                  <svg
                    class="size-3 transition-transform"
                    [class.rotate-90]="isExpanded(entry.path)"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              } @else {
                <span class="size-5 shrink-0"></span>
              }

              <tsai-variable
                [ref]="entry.path"
                [label]="entry.key"
                [variant]="entry.variant"
                [draggable]="draggable()"
                (pick)="pick.emit($event)"
              />

              @if (entry.container) {
                <span class="truncate text-text-3">{{
                  summary(entry.value)
                }}</span>
              } @else {
                <span [class]="valueClasses(entry.value)">
                  {{ formatValue(entry.value) }}
                </span>
              }
            </div>

            @if (entry.container && isExpanded(entry.path)) {
              <div class="ml-6 border-l border-border/70 pl-3">
                <tsai-json-view
                  [data]="entry.value"
                  [root]="entry.path"
                  [draggable]="draggable()"
                  [autoExpandDepth]="autoExpandDepth() - 1"
                  (pick)="pick.emit($event)"
                />
              </div>
            }
          </div>
        }
      </div>
    } @else {
      <span [class]="valueClasses(data())">{{ formatValue(data()) }}</span>
    }
  </div>`,
})
export class JsonView {
  readonly data = input<unknown>();
  readonly root = input('$json');
  readonly draggable = input(true);
  readonly autoExpandDepth = input(2);
  readonly pick = output<string>();

  private readonly collapsed = signal<Record<string, boolean>>({});

  protected readonly entries = computed<JsonEntry[]>(() => {
    const value = this.data();
    if (Array.isArray(value)) {
      return value.map((item, index) => ({
        key: `[${index}]`,
        path: `${this.root()}[${index}]`,
        value: item,
        container: isContainer(item),
        variant: 'neutral',
      }));
    }

    if (!isRecord(value)) return [];

    return Object.keys(value).map((key) => ({
      key,
      path: `${this.root()}${accessor(key)}`,
      value: value[key],
      container: isContainer(value[key]),
      variant: this.root() === '$json' ? 'json' : 'neutral',
    }));
  });

  protected isExpanded(path: string): boolean {
    return this.collapsed()[path] ?? this.autoExpandDepth() > 0;
  }

  protected toggle(path: string): void {
    this.collapsed.update((state) => ({
      ...state,
      [path]: !this.isExpanded(path),
    }));
  }

  protected summary(value: unknown): string {
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (isRecord(value)) return `{${Object.keys(value).length}}`;
    return '';
  }

  protected formatValue(value: unknown): string {
    if (typeof value === 'string') return `"${value}"`;
    if (value === null) return 'null';
    return String(value);
  }

  protected valueClasses(value: unknown): string {
    const base = 'truncate';
    if (typeof value === 'string') return `${base} text-success`;
    if (typeof value === 'number') return `${base} text-warning`;
    if (typeof value === 'boolean') return `${base} text-info`;
    if (value === null) return `${base} text-text-3`;
    return `${base} text-text-2`;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isContainer(value: unknown): boolean {
  return Array.isArray(value) || isRecord(value);
}

function accessor(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `.${key}`
    : `["${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}
