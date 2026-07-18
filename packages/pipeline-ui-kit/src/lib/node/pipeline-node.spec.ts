import { TestBed } from '@angular/core/testing';
import type { BoardNode } from '@tsai-pe/models';
import { PipelineNode } from './pipeline-node';

const node: BoardNode = {
  id: 'node-1',
  type: 'if',
  kind: 'action',
  category: 'control-flow',
  title: 'Branch',
  subtitle: 'Check score',
  pos: { col: 2, row: 3 },
  size: { cols: 7, rows: 2 },
  data: {},
  ports: [
    { id: 'in', role: 'input', side: 'left' },
    { id: 'true', role: 'output', side: 'right', label: 'true' },
  ],
};

describe('PipelineNode', () => {
  it('positions itself from grid coordinates and renders ports', async () => {
    const fixture = TestBed.createComponent(PipelineNode);
    fixture.componentRef.setInput('node', node);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.dataset['nodeId']).toBe('node-1');
    expect(host.style.left).toBe('64px');
    expect(host.style.top).toBe('96px');
    expect(host.style.width).toBe('224px');
    expect(host.querySelectorAll('.pe-port')).toHaveLength(2);
    expect(host.textContent).toContain('Branch');
  });

  it('emits port and open intents without owning board behavior', async () => {
    const fixture = TestBed.createComponent(PipelineNode);
    fixture.componentRef.setInput('node', node);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const ports: string[] = [];
    let opened = false;
    component.portPointerDown.subscribe(({ port }) => ports.push(port.id));
    component.openRequested.subscribe(() => {
      opened = true;
    });

    const host = fixture.nativeElement as HTMLElement;
    host
      .querySelector<HTMLElement>('[data-port="true"]')
      ?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    host.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

    expect(ports).toEqual(['true']);
    expect(opened).toBe(true);
  });
});
