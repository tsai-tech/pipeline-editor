import { TestBed } from '@angular/core/testing';
import type { BoardNode } from '@tsai-pe/models';
import { createNodeCatalog, type NodeTypeSpec } from '@tsai-pe/nodes';
import { NodeInspector } from './node-inspector';

const spec: NodeTypeSpec = {
  id: 'http-action',
  label: 'HTTP',
  kind: 'action',
  category: 'integration',
  params: [
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'retries', label: 'Retries', type: 'number' },
    { key: 'body', label: 'Body', type: 'json' },
  ],
};

const node: BoardNode = {
  id: 'http',
  type: 'http-action',
  kind: 'action',
  category: 'integration',
  title: 'HTTP',
  pos: { col: 0, row: 0 },
  size: { cols: 7, rows: 2 },
  data: { url: 'https://example.com', retries: 2, body: { ok: true } },
  ports: [],
};

describe('NodeInspector', () => {
  it('renders catalog params and emits node changes', async () => {
    const fixture = TestBed.createComponent(NodeInspector);
    fixture.componentRef.setInput('node', node);
    fixture.componentRef.setInput('catalog', createNodeCatalog([spec]));
    fixture.detectChanges();
    await fixture.whenStable();

    const changes: BoardNode[] = [];
    fixture.componentInstance.nodeChange.subscribe((next) =>
      changes.push(next),
    );

    const inputs = fixture.nativeElement.querySelectorAll('input');
    const title = inputs[0] as HTMLInputElement;
    title.value = 'Fetch account';
    title.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('URL');
    expect(changes[changes.length - 1]?.title).toBe('Fetch account');
  });

  it('parses JSON field edits before emitting node data', async () => {
    const fixture = TestBed.createComponent(NodeInspector);
    fixture.componentRef.setInput('node', node);
    fixture.componentRef.setInput('catalog', createNodeCatalog([spec]));
    fixture.detectChanges();
    await fixture.whenStable();

    const changes: BoardNode[] = [];
    fixture.componentInstance.nodeChange.subscribe((next) =>
      changes.push(next),
    );

    const textarea = fixture.nativeElement.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    textarea.value = '{"ok":false}';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(changes[changes.length - 1]?.data?.['body']).toEqual({ ok: false });
  });
});
