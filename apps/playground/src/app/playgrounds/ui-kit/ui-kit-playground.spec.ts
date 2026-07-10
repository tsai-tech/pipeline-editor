import { TestBed } from '@angular/core/testing';
import { UiKitPlayground } from './ui-kit-playground';

describe('UiKitPlayground', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiKitPlayground],
    }).compileComponents();
  });

  it('renders the component catalog', async () => {
    const fixture = TestBed.createComponent(UiKitPlayground);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tsai-button').length).toBeGreaterThan(0);
    expect(el.textContent).toContain('Buttons');
  });
});
