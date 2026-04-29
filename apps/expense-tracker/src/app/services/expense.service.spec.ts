import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ExpenseService } from './expense.service';
import { StorageService } from './storage.service';
import { Expense, NewExpenseInput } from '../models/expense.model';
import { EXPENSE_CATEGORIES } from '../constants/categories';

const VALID_INPUT: NewExpenseInput = {
  amount: 25.5,
  date: '2026-04-29',
  category: 'Food',
  description: 'Lunch',
};

describe('ExpenseService', () => {
  let service: ExpenseService;
  let storageSpy: jest.Mocked<StorageService>;

  beforeEach(() => {
    storageSpy = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      remove: jest.fn(),
    } as jest.Mocked<StorageService>;

    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storageSpy }],
    });
    service = TestBed.inject(ExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addExpense()', () => {
    it('should generate an id and createdAt for the new expense', () => {
      const result = service.addExpense(VALID_INPUT);
      expect(result.id).toBeTruthy();
      expect(result.createdAt).toBeTruthy();
    });

    it('should round amount to 2 decimal places', () => {
      const result = service.addExpense({ ...VALID_INPUT, amount: 10.999 });
      expect(result.amount).toBe(11.0);
    });

    it('should persist the new expense via StorageService', () => {
      service.addExpense(VALID_INPUT);
      expect(storageSpy.set).toHaveBeenCalled();
    });

    it('should emit the updated list on expenses$', async () => {
      service.addExpense(VALID_INPUT);
      const expenses = await firstValueFrom(service.expenses$);
      expect(expenses.length).toBe(1);
      expect(expenses[0].category).toBe('Food');
    });

    it('should place the newest expense first', () => {
      service.addExpense({ ...VALID_INPUT, description: 'first' });
      service.addExpense({ ...VALID_INPUT, description: 'second' });
      const expenses = service.getRecentExpenses();
      expect(expenses[0].description).toBe('second');
    });
  });

  describe('deleteExpense()', () => {
    it('should remove the expense with the given id', () => {
      const added = service.addExpense(VALID_INPUT);
      service.deleteExpense(added.id);
      expect(service.getRecentExpenses()).toHaveLength(0);
    });

    it('should be a no-op when the id does not exist', () => {
      service.addExpense(VALID_INPUT);
      expect(() => service.deleteExpense('nonexistent-id')).not.toThrow();
      expect(service.getRecentExpenses()).toHaveLength(1);
    });

    it('should persist the updated list via StorageService', () => {
      const added = service.addExpense(VALID_INPUT);
      storageSpy.set.mockClear();
      service.deleteExpense(added.id);
      expect(storageSpy.set).toHaveBeenCalled();
    });
  });

  describe('getAllTimeTotal()', () => {
    it('should return 0 when no expenses exist', () => {
      expect(service.getAllTimeTotal()).toBe(0);
    });

    it('should return the sum of all expense amounts', () => {
      service.addExpense({ ...VALID_INPUT, amount: 10 });
      service.addExpense({ ...VALID_INPUT, amount: 20 });
      expect(service.getAllTimeTotal()).toBe(30);
    });
  });

  describe('getCategoryTotals()', () => {
    it('should return an entry for every ExpenseCategory', () => {
      const totals = service.getCategoryTotals();
      for (const cat of EXPENSE_CATEGORIES) {
        expect(totals[cat]).toBeDefined();
      }
    });

    it('should return 0 for categories with no expenses', () => {
      const totals = service.getCategoryTotals();
      expect(totals['Housing']).toBe(0);
    });

    it('should correctly sum amounts per category', () => {
      service.addExpense({ ...VALID_INPUT, category: 'Food', amount: 10 });
      service.addExpense({ ...VALID_INPUT, category: 'Food', amount: 15 });
      service.addExpense({ ...VALID_INPUT, category: 'Transport', amount: 5 });
      const totals = service.getCategoryTotals();
      expect(totals['Food']).toBe(25);
      expect(totals['Transport']).toBe(5);
    });
  });

  describe('getRecentExpenses()', () => {
    it('should return at most 10 expenses by default', () => {
      for (let i = 0; i < 15; i++) {
        service.addExpense(VALID_INPUT);
      }
      expect(service.getRecentExpenses()).toHaveLength(10);
    });

    it('should respect a custom limit', () => {
      for (let i = 0; i < 5; i++) {
        service.addExpense(VALID_INPUT);
      }
      expect(service.getRecentExpenses(3)).toHaveLength(3);
    });

    it('should return expenses newest-first', () => {
      const first = service.addExpense({ ...VALID_INPUT, description: 'older' });
      const second = service.addExpense({ ...VALID_INPUT, description: 'newer' });
      const recent = service.getRecentExpenses();
      expect(recent[0].id).toBe(second.id);
      expect(recent[1].id).toBe(first.id);
    });
  });
});
