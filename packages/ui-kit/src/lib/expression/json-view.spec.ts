import { TestBed } from '@angular/core/testing';
import { JsonView } from './json-view';

describe('JsonView', () => {
  it('renders object keys as draggable variable refs', async () => {
    const fixture = TestBed.createComponent(JsonView);
    fixture.componentRef.setInput('data', {
      customer: { name: 'Ada' },
      'order id': 'ord_1',
    });
    await fixture.whenStable();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('tsai-variable button'),
    ).map((item) => (item as HTMLElement).textContent?.trim());

    expect(chips).toContain('customer');
    expect(chips).toContain('order id');
  });

  it('bubbles picked refs from key chips', async () => {
    const fixture = TestBed.createComponent(JsonView);
    fixture.componentRef.setInput('data', { customerName: 'Ada' });
    let picked = '';
    fixture.componentInstance.pick.subscribe((ref) => (picked = ref));
    await fixture.whenStable();

    fixture.nativeElement.querySelector('tsai-variable button').click();

    expect(picked).toBe('$json.customerName');
  });

  it('renders empty containers explicitly instead of object stringification', async () => {
    const fixture = TestBed.createComponent(JsonView);
    fixture.componentRef.setInput('data', {});
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('{}');

    fixture.componentRef.setInput('data', []);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('[]');
  });

  it('renders data URLs as compact media placeholders', async () => {
    const fixture = TestBed.createComponent(JsonView);
    const image = `data:image/png;base64,${'a'.repeat(4096)}`;
    fixture.componentRef.setInput('data', { images: [{ imageUrl: image }] });
    fixture.componentRef.setInput('autoExpandDepth', 3);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('image#1');
    expect(fixture.nativeElement.textContent).not.toContain('aaaa');
  });

  it('renders unknown data URLs as data placeholders', async () => {
    const fixture = TestBed.createComponent(JsonView);
    fixture.componentRef.setInput('data', {
      file: `data:application/octet-stream;base64,${'a'.repeat(4096)}`,
    });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('data#1');
    expect(fixture.nativeElement.textContent).not.toContain('aaaa');
  });
});
