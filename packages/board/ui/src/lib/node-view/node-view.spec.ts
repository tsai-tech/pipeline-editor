import { TestBed } from '@angular/core/testing';
import type { BoardNode } from '@tsai-pe/models';
import { NodeView } from './node-view';

function node(overrides: Partial<BoardNode> = {}): BoardNode {
  return {
    id: 'n1',
    kind: 'action',
    category: 'transform',
    title: 'My Node',
    pos: { col: 0, row: 0 },
    size: { cols: 6, rows: 2 },
    ports: [
      { id: 'in', role: 'input', side: 'left' },
      { id: 'out-right', role: 'output', side: 'right' },
    ],
    ...overrides,
  };
}

describe('NodeView', () => {
  it('renders the node title', async () => {
    const fixture = TestBed.createComponent(NodeView);
    fixture.componentRef.setInput('node', node());
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('My Node');
  });

  it('surfaces the run error on the node when it failed', async () => {
    const fixture = TestBed.createComponent(NodeView);
    fixture.componentRef.setInput('node', node());
    fixture.componentRef.setInput('runStatus', 'error');
    fixture.componentRef.setInput('runError', 'boom');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('boom');
  });

  it('shows the runtime buffer badge only on merge nodes', async () => {
    const fixture = TestBed.createComponent(NodeView);
    fixture.componentRef.setInput('node', node({ category: 'merge' }));
    fixture.componentRef.setInput('buffer', { done: 3, total: 10 });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('3/10');
  });

  it('does not show buffer fill on regular worker nodes', async () => {
    const fixture = TestBed.createComponent(NodeView);
    fixture.componentRef.setInput('node', node());
    fixture.componentRef.setInput('buffer', { done: 3, total: 10 });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('3/10');
  });

  it('renders a right-side branch label for control-flow outputs', async () => {
    const fixture = TestBed.createComponent(NodeView);
    fixture.componentRef.setInput(
      'node',
      node({
        category: 'control-flow',
        ports: [
          { id: 'in', role: 'input', side: 'left' },
          { id: 'true', role: 'output', side: 'right', label: 'true' },
        ],
      }),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('true');
  });
});
