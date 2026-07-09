import { TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();
  });

  it('renders a native button with projected content', async () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('variant', 'primary');
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.disabled).toBe(false);
  });

  it('reflects the variant on the host and disables when requested', async () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-variant')).toBe('ghost');
    expect(host.querySelector('button')?.disabled).toBe(true);
  });
});
