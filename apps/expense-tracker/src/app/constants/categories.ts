import { ExpenseCategory } from '../models/expense.model';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
];

export const STORAGE_KEY = 'expense-tracker:expenses';

export const DEFAULT_RECENT_LIMIT = 10;

export const AMOUNT_PRECISION_FACTOR = 100;

export const MIN_EXPENSE_AMOUNT = 0.01;
