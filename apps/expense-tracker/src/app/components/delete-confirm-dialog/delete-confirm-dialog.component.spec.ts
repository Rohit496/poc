import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';
import { Expense } from '../../models/expense.model';

const MOCK_EXPENSE: Expense = {
  id: 'abc-123',
  amount: 25.5,
  date: '2026-04-29',
  category: 'Food',
  description: 'Lunch',
  createdAt: '2026-04-29T12:00:00.000Z',
};

describe('DeleteConfirmDialogComponent', () => {
  let component: DeleteConfirmDialogComponent;
  let fixture: ComponentFixture<DeleteConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmDialogComponent);
    component = fixture.componentInstance;
    component.expense = MOCK_EXPENSE;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the expense amount in the dialog', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('25.5');
  });

  it('should display the expense category in the dialog', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Food');
  });

  it('should emit confirmed event when confirm button is clicked', () => {
    const spy = jest.fn();
    component.confirmed.subscribe(spy);

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]') as HTMLButtonElement;
    confirmBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit cancelled event when cancel button is clicked', () => {
    const spy = jest.fn();
    component.cancelled.subscribe(spy);

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="cancel-btn"]') as HTMLButtonElement;
    cancelBtn.click();

    expect(spy).toHaveBeenCalled();
  });
});
