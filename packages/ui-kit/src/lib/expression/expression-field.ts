import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import type { FormValueControl } from '@angular/forms/signals';
import {
  completeAt,
  ExpressionCompletion,
  ExpressionCompletionOption,
  ExpressionScope,
} from './expression-complete';
import { PE_REF_MIME } from './variable';

const POSITIONS: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -4,
  },
];

let expressionFieldId = 0;

/**
 * `tsai-expression-field` — smart expression input with refs, drops and autocomplete.
 *
 * Autocomplete is powered by the pure `completeAt` engine. The overlay follows
 * the same focus-in-input pattern as `tsai-combobox`: arrow keys move the active
 * option, Enter/Tab accept it, and Escape closes the list.
 */
@Component({
  selector: 'tsai-expression-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkConnectedOverlay, CdkOverlayOrigin],
  template: `<div
      #triggerElement
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [class]="wrapClasses()"
      (dragover)="onDragover($event)"
      (drop)="onDrop($event)"
    >
      @if (multiline()) {
        <textarea
          #control
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="invalid() || null"
          [attr.aria-controls]="listId"
          [attr.aria-expanded]="open()"
          [attr.aria-activedescendant]="
            open() && active() >= 0 ? listId + '-' + active() : null
          "
          rows="4"
          class="min-h-24 w-full resize-y bg-transparent font-mono text-[13px] leading-relaxed text-text outline-none placeholder:text-text-3 disabled:cursor-not-allowed"
          (input)="onInput($event)"
          (click)="refreshFromControl()"
          (keyup)="refreshFromControl()"
          (keydown)="onKeydown($event)"
        ></textarea>
      } @else {
        <input
          #control
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="invalid() || null"
          [attr.aria-controls]="listId"
          [attr.aria-expanded]="open()"
          [attr.aria-activedescendant]="
            open() && active() >= 0 ? listId + '-' + active() : null
          "
          class="h-9 w-full bg-transparent font-mono text-[13px] text-text outline-none placeholder:text-text-3 disabled:cursor-not-allowed"
          (input)="onInput($event)"
          (click)="refreshFromControl()"
          (keyup)="refreshFromControl()"
          (keydown)="onKeydown($event)"
        />
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayMinWidth]="triggerWidth()"
      [cdkConnectedOverlayPositions]="positions"
    >
      <ul
        [id]="listId"
        role="listbox"
        class="flex max-h-72 min-w-64 flex-col gap-0.5 overflow-auto rounded-md border border-border bg-surface-2 p-1 text-sm text-text shadow-elev-2"
        (mousedown)="onOptionMousedown($event)"
      >
        @for (option of options(); track option.insert; let i = $index) {
          <li
            [id]="listId + '-' + i"
            role="option"
            [attr.data-index]="i"
            [attr.aria-selected]="i === active()"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 transition-colors aria-selected:bg-surface-3"
          >
            <span class="truncate font-mono text-xs">{{ option.label }}</span>
            @if (option.detail) {
              <span class="shrink-0 text-xs text-text-3">{{
                option.detail
              }}</span>
            }
          </li>
        }
      </ul>
    </ng-template>`,
})
export class ExpressionField implements FormValueControl<string> {
  readonly value = model('');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly multiline = input(false);
  readonly scope = input<ExpressionScope>({});
  readonly template = input(true);

  protected readonly positions = POSITIONS;
  protected readonly listId = `tsai-expression-field-${expressionFieldId++}`;
  protected readonly active = signal(0);
  protected readonly completion = signal<ExpressionCompletion | null>(null);
  protected readonly triggerWidth = signal(0);
  protected readonly open = computed(() => this.options().length > 0);
  protected readonly options = computed(() => this.completion()?.options ?? []);

  private readonly control =
    viewChild.required<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(
      'control',
    );
  private readonly triggerElement =
    viewChild.required<ElementRef<HTMLElement>>('triggerElement');

  protected readonly wrapClasses = computed(
    () =>
      `rounded-sm border bg-surface-2 px-3 transition-colors focus-within:border-accent-hover ${
        this.multiline() ? 'py-2' : ''
      } ${this.invalid() ? 'border-danger' : 'border-border'} ${
        this.disabled() ? 'opacity-50' : ''
      }`,
  );

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
    this.refresh(target.selectionStart ?? target.value.length);
  }

  protected refreshFromControl(): void {
    const element = this.control().nativeElement;
    this.refresh(element.selectionStart ?? element.value.length);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        if (!this.open()) return;
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        if (!this.open()) return;
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter':
      case 'Tab':
        if (!this.open()) return;
        event.preventDefault();
        this.accept(this.options()[this.active()]);
        break;
      case 'Escape':
        if (!this.open()) return;
        event.preventDefault();
        this.completion.set(null);
        break;
      default:
        break;
    }
  }

  protected onOptionMousedown(event: MouseEvent): void {
    event.preventDefault();
    const element = (event.target as HTMLElement).closest('[data-index]');
    if (!element) return;
    this.accept(this.options()[Number(element.getAttribute('data-index'))]);
  }

  protected onDragover(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  protected onDrop(event: DragEvent): void {
    if (this.disabled()) return;
    const ref =
      event.dataTransfer?.getData(PE_REF_MIME) ||
      event.dataTransfer?.getData('text/plain');
    if (!ref) return;

    event.preventDefault();
    const element = this.control().nativeElement;
    element.focus();
    const at = element.selectionStart ?? this.value().length;
    this.insertText(this.wrapRef(ref, at), at, at);
  }

  private refresh(caret: number): void {
    const completion = completeAt(this.value(), caret, this.scope());
    this.triggerWidth.set(this.triggerElement().nativeElement.offsetWidth);
    this.completion.set(completion);
    this.active.set(0);
  }

  private accept(option: ExpressionCompletionOption | undefined): void {
    const completion = this.completion();
    if (!option || !completion) return;

    this.insertText(option.insert, completion.from, completion.to, true);
    this.completion.set(null);
  }

  private insertText(
    insert: string,
    from: number,
    to: number,
    completeToken = false,
  ): void {
    const previous = this.value();
    let next = previous.slice(0, from) + insert + previous.slice(to);
    let caret = from + insert.length;

    if (completeToken && this.template() && !isInsideTemplate(previous, from)) {
      const tokenStart = previous.lastIndexOf('$', from);
      if (tokenStart >= 0) {
        const token = next.slice(tokenStart, caret);
        const wrapped = `{{ ${token} }}`;
        next = next.slice(0, tokenStart) + wrapped + next.slice(caret);
        caret = tokenStart + wrapped.length;
      }
    }

    this.value.set(next);
    queueMicrotask(() => {
      const element = this.control().nativeElement;
      element.focus();
      element.setSelectionRange(caret, caret);
    });
  }

  private wrapRef(ref: string, at: number): string {
    return this.template() && !isInsideTemplate(this.value(), at)
      ? `{{ ${ref} }}`
      : ref;
  }

  private move(direction: 1 | -1): void {
    const count = this.options().length;
    if (!count) return;
    this.active.set((this.active() + direction + count) % count);
  }
}

function isInsideTemplate(text: string, at: number): boolean {
  const before = text.slice(0, at);
  return before.lastIndexOf('{{') > before.lastIndexOf('}}');
}
