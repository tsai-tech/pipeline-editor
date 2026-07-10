import { TestBed } from '@angular/core/testing';
import { Slider } from './slider';

describe('Slider', () => {
  it('reflects and updates the value via the range input', async () => {
    const fixture = TestBed.createComponent(Slider);
    fixture.componentRef.setInput('value', 20);
    await fixture.whenStable();

    const range = fixture.nativeElement.querySelector(
      'input[type=range]',
    ) as HTMLInputElement;
    expect(range.value).toBe('20');

    range.value = '55';
    range.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(55);
  });
});
