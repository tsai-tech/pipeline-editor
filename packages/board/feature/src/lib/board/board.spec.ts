import { TestBed } from '@angular/core/testing';
import type { Pipeline } from '@tsai-pe/models';
import { Board } from './board';

const withNode: Pipeline = {
  id: 'p',
  name: 'Test',
  nodes: [
    {
      id: 'n1',
      kind: 'trigger',
      title: 'Telegram',
      pos: { col: 0, row: 0 },
      size: { cols: 6, rows: 2 },
      ports: [{ id: 'out-right', role: 'output', side: 'right' }],
    },
  ],
  edges: [],
};

const empty: Pipeline = { id: 'e', name: 'Empty', nodes: [], edges: [] };

describe('Board', () => {
  it('renders the given pipeline nodes', async () => {
    const fixture = TestBed.createComponent(Board);
    fixture.componentRef.setInput('pipeline', withNode);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Telegram');
  });

  it('shows the empty-canvas hint when there are no nodes', async () => {
    const fixture = TestBed.createComponent(Board);
    fixture.componentRef.setInput('pipeline', empty);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Empty canvas');
  });

  it('hides the Run control when no backend is provided', async () => {
    const fixture = TestBed.createComponent(Board);
    fixture.componentRef.setInput('pipeline', withNode);
    await fixture.whenStable();
    // no PIPELINE_BACKEND provided → Run button is not rendered
    expect(fixture.nativeElement.textContent).not.toContain('▶ Run');
    // but always-available tools are
    expect(fixture.nativeElement.textContent).toContain('Export');
  });

  it('formats run data without embedding raw data URLs', () => {
    const fixture = TestBed.createComponent(Board);
    const json = (fixture.componentInstance as unknown as {
      json(value: unknown): string;
    }).json({
      images: [{ imageUrl: `data:image/png;base64,${'a'.repeat(4096)}` }],
    });

    expect(json).toContain('image#1');
    expect(json).not.toContain('aaaa');
  });
});
