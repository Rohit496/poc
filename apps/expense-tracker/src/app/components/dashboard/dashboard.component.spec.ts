import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ExpenseService } from '../../services/expense.service';
import { Expense, ExpenseCategory } from '../../models/expense.model';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

const makeExpense = (overrides: Partial<Expense> = {}): Expense => ({
  id: Math.random().toString(),
  amount: 10,
  date: '2026-04-29',
  category: 'Food',
  description: '',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let expensesSubject: BehaviorSubject<Expense[]>;
  let expenseServiceSpy: Partial<ExpenseService>;

  beforeEach(async () => {
    expensesSubject = new BehaviorSubject<Expense[]>([]);

    expenseServiceSpy = {
      expenses$: expensesSubject.asObservable(),
      deleteExpense: jest.fn(),
      getCategoryTotals: jest.fn().mockReturnValue(
        Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, 0])) as Record<ExpenseCategory, number>
      ),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ExpenseService, useValue: expenseServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the empty state when there are no expenses', () => {
    expensesSubject.next([]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(emptyState).toBeTruthy();
  });

  it('should not show the empty state when expenses exist', () => {
    expensesSubject.next([makeExpense()]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(emptyState).toBeFalsy();
  });

  it('should render at most 10 expense rows', () => {
    expensesSubject.next(Array.from({ length: 15 }, () => makeExpense()));
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="expense-row"]');
    expect(rows.length).toBeLessThanOrEqual(10);
  });

  it('should display the all-time total', () => {
    expensesSubject.next([makeExpense({ amount: 25 }), makeExpense({ amount: 15 })]);
    fixture.detectChanges();
    const total = fixture.nativeElement.querySelector('[data-testid="all-time-total"]');
    expect(total?.textContent).toContain('40');
  });

  it('should render a row for every expense category', () => {
    expensesSubject.next([makeExpense()]);
    fixture.detectChanges();
    const catRows = fixture.nativeElement.querySelectorAll('[data-testid="category-row"]');
    expect(catRows.length).toBe(EXPENSE_CATEGORIES.length);
  });

  describe('delete flow', () => {
    it('should show the confirm dialog when delete is clicked', () => {
      const expense = makeExpense({ id: 'e1' });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]');
      deleteBtn.click();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]');
      expect(dialog).toBeTruthy();
    });

    it('should call deleteExpense with correct id on confirm', () => {
      const expense = makeExpense({ id: 'e2' });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="confirm-btn"]').click();
      fixture.detectChanges();

      expect(expenseServiceSpy.deleteExpense).toHaveBeenCalledWith('e2');
    });

    it('should not call deleteExpense when cancel is clicked', () => {
      const expense = makeExpense({ id: 'e3' });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="cancel-btn"]').click();
      fixture.detectChanges();

      expect(expenseServiceSpy.deleteExpense).not.toHaveBeenCalled();
    });

    it('should close the dialog after confirm', () => {
      const expense = makeExpense({ id: 'e4' });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="confirm-btn"]').click();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('[data-testid="confirm-btn"]');
      expect(dialog).toBeFalsy();
    });

    it('should close the dialog after cancel', () => {
      const expense = makeExpense({ id: 'e5' });
      expensesSubject.next([expense]);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="delete-btn"]').click();
      fixture.detectChanges();

      fixture.nativeElement.querySelector('[data-testid="cancel-btn"]').click();
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector('[data-testid="cancel-btn"]');
      expect(dialog).toBeFalsy();
    });
  });
});
