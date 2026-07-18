import { TestBed } from '@angular/core/testing';
import { BoardSurface } from './board-surface';

describe('BoardSurface', () => {
  it('renders the transformed world layer', async () => {
    const fixture = TestBed.createComponent(BoardSurface);
    fixture.componentRef.setInput('pan', { x: 10, y: 20 });
    fixture.componentRef.setInput('zoom', 1.5);
    fixture.detectChanges();
    await fixture.whenStable();

    const world = fixture.nativeElement.querySelector(
      '.origin-top-left',
    ) as HTMLElement;
    expect(world.style.transform).toBe('translate(10px, 20px) scale(1.5)');
  });

  it('emits surface pointer events', async () => {
    const fixture = TestBed.createComponent(BoardSurface);
    fixture.detectChanges();
    await fixture.whenStable();

    let pointerId = 0;
    fixture.componentInstance.surfacePointerDown.subscribe((event) => {
      pointerId = event.pointerId;
    });
    const event = new MouseEvent('pointerdown', { bubbles: true });
    Object.defineProperty(event, 'pointerId', { value: 7 });
    fixture.nativeElement.dispatchEvent(event);

    expect(pointerId).toBe(7);
  });
});
