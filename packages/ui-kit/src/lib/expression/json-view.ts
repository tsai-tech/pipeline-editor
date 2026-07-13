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
  display: DisplayValue;
}

interface DisplayValue {
  text: string;
  mediaUrl?: string;
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
                @if (entry.display.mediaUrl) {
                <button
                  type="button"
                  class="min-w-0 truncate rounded-sm text-left text-info underline decoration-dotted underline-offset-2 hover:text-info"
                  [attr.title]="entry.display.text"
                  (click)="openMedia(entry.display.mediaUrl, $event)"
                >
                  {{ entry.display.text }}
                </button>
                } @else {
                <span [class]="valueClasses(entry.value)">
                  {{ entry.display.text }}
                </span>
                }
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
      @if (displayRoot().mediaUrl) {
        <button
          type="button"
          class="min-w-0 truncate rounded-sm text-left text-info underline decoration-dotted underline-offset-2 hover:text-info"
          [attr.title]="displayRoot().text"
          (click)="openMedia(displayRoot().mediaUrl, $event)"
        >
          {{ displayRoot().text }}
        </button>
      } @else {
        <span [class]="valueClasses(data())">{{ displayRoot().text }}</span>
      }
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
        display: displayValue(item, `${this.root()}[${index}]`),
      }));
    }

    if (!isRecord(value)) return [];

    return Object.keys(value).map((key) => ({
      key,
      path: `${this.root()}${accessor(key)}`,
      value: value[key],
      container: isContainer(value[key]),
      variant: this.root() === '$json' ? 'json' : 'neutral',
      display: displayValue(value[key], `${this.root()}${accessor(key)}`),
    }));
  });

  protected readonly displayRoot = computed(() =>
    displayValue(this.data(), this.root()),
  );

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

  protected openMedia(url: string | undefined, event: MouseEvent): void {
    event.stopPropagation();
    if (!url) return;
    globalThis.open?.(url, '_blank', 'noopener,noreferrer');
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

const DATA_URL_RE = /^data:([^;,]+)?(?:;[^,]*)?,/i;
const MAX_STRING = 160;

function displayValue(value: unknown, path: string): DisplayValue {
  if (typeof value === 'string') {
    const media = dataUrlInfo(value, path);
    if (media) return { text: media, mediaUrl: value };
    const text =
      value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
    return { text: `"${text}"` };
  }
  if (Array.isArray(value))
    return { text: value.length ? `Array(${value.length})` : '[]' };
  if (isRecord(value)) return { text: Object.keys(value).length ? '{…}' : '{}' };
  if (value === null) return { text: 'null' };
  return { text: String(value) };
}

function dataUrlInfo(value: string, path: string): string | null {
  const match = DATA_URL_RE.exec(value);
  if (!match) return null;
  const mime = (match[1] || 'application/octet-stream').toLowerCase();
  const type = mime.startsWith('image/')
    ? 'image'
    : mime.startsWith('video/')
      ? 'video'
      : mime.startsWith('audio/')
        ? 'audio'
        : 'data';
  return `${type}#${indexLabel(path)} - ${mime} - ${byteLabel(value.length)}`;
}

function indexLabel(path: string): number {
  const indexes = [...path.matchAll(/\[(\d+)\]/g)];
  const last = indexes[indexes.length - 1]?.[1];
  return last === undefined ? 1 : Number(last) + 1;
}

function byteLabel(chars: number): string {
  const bytes = Math.max(0, Math.floor((chars * 3) / 4));
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function accessor(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `.${key}`
    : `["${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}
