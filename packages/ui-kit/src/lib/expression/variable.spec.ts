import { TestBed } from '@angular/core/testing';
import { PE_REF_MIME, Variable } from './variable';

describe('Variable', () => {
  it('renders the label and emits the ref when picked', async () => {
    const fixture = TestBed.createComponent(Variable);
    fixture.componentRef.setInput('ref', '$json.customerName');
    fixture.componentRef.setInput('label', 'customerName');
    let picked = '';
    fixture.componentInstance.pick.subscribe((ref) => (picked = ref));
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('customerName');

    button.click();
    expect(picked).toBe('$json.customerName');
  });

  it('sets expression drag data', async () => {
    const fixture = TestBed.createComponent(Variable);
    fixture.componentRef.setInput('ref', '$node["Telegram Trigger"].message');
    await fixture.whenStable();

    const data = new Map<string, string>();
    const event = new Event('dragstart');
    Object.defineProperty(event, 'dataTransfer', {
      value: {
        setData: (type: string, value: string) => data.set(type, value),
        effectAllowed: '',
      },
    });

    fixture.nativeElement.querySelector('button').dispatchEvent(event);

    expect(data.get(PE_REF_MIME)).toBe('$node["Telegram Trigger"].message');
    expect(data.get('text/plain')).toBe('$node["Telegram Trigger"].message');
  });
});
