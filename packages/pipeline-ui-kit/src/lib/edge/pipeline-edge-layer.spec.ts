import { TestBed } from '@angular/core/testing';
import type { EdgeGeometry } from '@tsai-pe/board-core';
import { PipelineEdgeLayer } from './pipeline-edge-layer';

const edge: EdgeGeometry = {
  id: 'edge-1',
  path: 'M 0 0 L 100 0',
  from: { x: 0, y: 0 },
  to: { x: 100, y: 0 },
  mid: { x: 50, y: 0 },
  selected: false,
  label: 'A -> B',
  midLabel: 'success',
};

describe('PipelineEdgeLayer', () => {
  it('renders edge paths, labels and draft connection', async () => {
    const fixture = TestBed.createComponent(PipelineEdgeLayer);
    fixture.componentRef.setInput('edges', [edge]);
    fixture.componentRef.setInput('draftPath', 'M 0 0 L 20 20');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('path[d="M 0 0 L 100 0"]')).toBeTruthy();
    expect(host.querySelector('path[d="M 0 0 L 20 20"]')).toBeTruthy();
    expect(host.textContent).toContain('success');
    expect(host.querySelector('pe-pipeline-edge')).toBeNull();
    expect(host.querySelector('svg g[pe-pipeline-edge]')).toBeTruthy();
  });

  it('emits edge pointer intents', async () => {
    const fixture = TestBed.createComponent(PipelineEdgeLayer);
    fixture.componentRef.setInput('edges', [edge]);
    fixture.detectChanges();
    await fixture.whenStable();

    const ids: string[] = [];
    fixture.componentInstance.edgePointerDown.subscribe(({ edgeId }) =>
      ids.push(edgeId),
    );
    fixture.nativeElement
      .querySelector('g')
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));

    expect(ids).toEqual(['edge-1']);
  });
});
