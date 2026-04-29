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

export const CATEGORY_VIEW_STORAGE_KEY = 'expense-tracker:category-view';

export const DEFAULT_RECENT_LIMIT = 10;

export const AMOUNT_PRECISION_FACTOR = 100;

export const MIN_EXPENSE_AMOUNT = 0.01;

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#4CAF50',
  Transport: '#2196F3',
  Housing: '#FF9800',
  Entertainment: '#9C27B0',
  Health: '#F44336',
  Shopping: '#00BCD4',
  Other: '#607D8B',
};

export const DONUT_OUTER_RADIUS = 80;
export const DONUT_INNER_RADIUS = 45;
export const DONUT_CENTER = 100;
