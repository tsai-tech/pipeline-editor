import { TestBed } from '@angular/core/testing';
import { Table } from './table';

describe('Table', () => {
  it('renders column headers and rows', async () => {
    const fixture = TestBed.createComponent(Table);
    fixture.componentRef.setInput('columns', [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ]);
    fixture.componentRef.setInput('rows', [
      { name: 'Ada', age: 36 },
      { name: 'Alan', age: 41 },
    ]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('th').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Ada');
  });
});
