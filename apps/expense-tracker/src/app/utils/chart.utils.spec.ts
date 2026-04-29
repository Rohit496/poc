import { buildSlices } from './chart.utils';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '../constants/categories';
import { ExpenseCategory } from '../models/expense.model';

const ALL_ZERO_TOTALS: Record<ExpenseCategory, number> = {
  Food: 0,
  Transport: 0,
  Housing: 0,
  Entertainment: 0,
  Health: 0,
  Shopping: 0,
  Other: 0,
};

describe('buildSlices', () => {
  it('returns empty array when all totals are zero', () => {
    const result = buildSlices(ALL_ZERO_TOTALS, CATEGORY_COLORS);
    expect(result).toEqual([]);
  });

  it('returns one slice per non-zero category', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 50, Transport: 30 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    expect(result).toHaveLength(2);
  });

  it('does not include zero-value categories in result', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 100 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    expect(result.every((s) => s.amount > 0)).toBe(true);
    expect(result.find((s) => s.category !== 'Food')).toBeUndefined();
  });

  it('percentages sum to approximately 100', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 50, Transport: 30, Health: 20 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    const sum = result.reduce((acc, s) => acc + s.percentage, 0);
    expect(sum).toBeCloseTo(100, 0);
  });

  it('single non-zero category produces sweepAngle close to 2π', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 100 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    expect(result).toHaveLength(1);
    expect(result[0].sweepAngle).toBeGreaterThan(Math.PI * 1.9);
    expect(result[0].sweepAngle).toBeLessThanOrEqual(Math.PI * 2);
  });

  it('slice path strings are non-empty', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 60, Housing: 40 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    result.forEach((s) => expect(s.path.length).toBeGreaterThan(0));
  });

  it('result order follows EXPENSE_CATEGORIES declaration order', () => {
    const totals = { ...ALL_ZERO_TOTALS, Other: 10, Food: 20, Health: 30 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    const resultCategories = result.map((s) => s.category);
    const expectedOrder = EXPENSE_CATEGORIES.filter((c) => totals[c] > 0);
    expect(resultCategories).toEqual(expectedOrder);
  });

  it('assigns correct color from colors map', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 100 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    expect(result[0].color).toBe(CATEGORY_COLORS['Food']);
  });

  it('computes percentage proportional to amount', () => {
    const totals = { ...ALL_ZERO_TOTALS, Food: 75, Transport: 25 };
    const result = buildSlices(totals, CATEGORY_COLORS);
    const food = result.find((s) => s.category === 'Food')!;
    const transport = result.find((s) => s.category === 'Transport')!;
    expect(food.percentage).toBeCloseTo(75, 0);
    expect(transport.percentage).toBeCloseTo(25, 0);
  });
});
