import { TestBed } from '@angular/core/testing';
import { createNodeCatalog, type NodeTypeSpec } from '@tsai-pe/nodes';
import { NodePicker } from './node-picker';

const specs: NodeTypeSpec[] = [
  {
    id: 'webhook-trigger',
    label: 'Webhook',
    kind: 'trigger',
    params: [
      { key: 'path', label: 'Path', type: 'text', defaultValue: '/hook' },
    ],
  },
  {
    id: 'slack-effect',
    label: 'Slack',
    kind: 'effect',
    params: [{ key: 'channel', label: 'Channel', type: 'text' }],
  },
];

describe('NodePicker', () => {
  it('renders catalog entries and emits selected item with default data', async () => {
    const fixture = TestBed.createComponent(NodePicker);
    fixture.componentRef.setInput('catalog', createNodeCatalog(specs));
    fixture.detectChanges();
    await fixture.whenStable();

    const selected: string[] = [];
    fixture.componentInstance.nodeSelected.subscribe((item) => {
      selected.push(item.id);
      expect(item.data).toEqual({ path: '/hook' });
    });

    const first = fixture.nativeElement.querySelector('button') as HTMLElement;
    first.click();

    expect(fixture.nativeElement.textContent).toContain('Webhook');
    expect(selected).toEqual(['webhook-trigger']);
  });

  it('filters entries by search text', async () => {
    const fixture = TestBed.createComponent(NodePicker);
    fixture.componentRef.setInput('catalog', createNodeCatalog(specs));
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    input.value = 'slack';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Webhook');
    expect(fixture.nativeElement.textContent).toContain('Slack');
  });
});
