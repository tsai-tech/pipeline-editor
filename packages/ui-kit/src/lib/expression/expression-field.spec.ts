import { TestBed } from '@angular/core/testing';
import { ExpressionField } from './expression-field';

describe('ExpressionField', () => {
  it('opens completions from the expression scope', async () => {
    const fixture = TestBed.createComponent(ExpressionField);
    fixture.componentRef.setInput('scope', {
      json: { customerName: 'Ada' },
    });
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '$j';
    input.selectionStart = input.selectionEnd = 2;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('accepts completions and wraps refs as templates by default', async () => {
    const fixture = TestBed.createComponent(ExpressionField);
    fixture.componentRef.setInput('scope', {
      json: { customerName: 'Ada' },
    });
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '$j';
    input.selectionStart = input.selectionEnd = 2;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('{{ $json }}');
  });

  it('keeps accepted refs bare when template is false', async () => {
    const fixture = TestBed.createComponent(ExpressionField);
    fixture.componentRef.setInput('template', false);
    fixture.componentRef.setInput('scope', {
      json: { customerName: 'Ada' },
    });
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = '$j';
    input.selectionStart = input.selectionEnd = 2;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe('$json');
  });
});
