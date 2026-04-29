import { ExpenseCategory, CategorySlice } from '../models/expense.model';
import { EXPENSE_CATEGORIES, DONUT_OUTER_RADIUS, DONUT_INNER_RADIUS, DONUT_CENTER } from '../constants/categories';

const TWO_PI = Math.PI * 2;
const FULL_CIRCLE_SWEEP = TWO_PI - 0.001;
const START_ANGLE_OFFSET = -Math.PI / 2;
const PERCENTAGE_PRECISION = 10;

function arcPoint(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function buildSlicePath(startAngle: number, sweepAngle: number): string {
  const endAngle = startAngle + sweepAngle;
  const largeArc = sweepAngle > Math.PI ? 1 : 0;

  const outerStart = arcPoint(DONUT_CENTER, DONUT_CENTER, DONUT_OUTER_RADIUS, startAngle);
  const outerEnd = arcPoint(DONUT_CENTER, DONUT_CENTER, DONUT_OUTER_RADIUS, endAngle);
  const innerStart = arcPoint(DONUT_CENTER, DONUT_CENTER, DONUT_INNER_RADIUS, startAngle);
  const innerEnd = arcPoint(DONUT_CENTER, DONUT_CENTER, DONUT_INNER_RADIUS, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${DONUT_OUTER_RADIUS} ${DONUT_OUTER_RADIUS} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${DONUT_INNER_RADIUS} ${DONUT_INNER_RADIUS} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export function buildSlices(
  totals: Record<ExpenseCategory, number>,
  colors: Record<ExpenseCategory, string>
): CategorySlice[] {
  const nonZeroCategories = EXPENSE_CATEGORIES.filter((cat) => totals[cat] > 0);
  if (nonZeroCategories.length === 0) {
    return [];
  }

  const allTimeTotal = nonZeroCategories.reduce((sum, cat) => sum + totals[cat], 0);
  const isSingleCategory = nonZeroCategories.length === 1;

  let currentAngle = START_ANGLE_OFFSET;
  return nonZeroCategories.map((cat) => {
    const amount = totals[cat];
    const percentage = Math.round((amount / allTimeTotal) * 100 * PERCENTAGE_PRECISION) / PERCENTAGE_PRECISION;
    const sweepAngle = isSingleCategory ? FULL_CIRCLE_SWEEP : (amount / allTimeTotal) * TWO_PI;
    const startAngle = currentAngle;
    currentAngle += sweepAngle;

    return {
      category: cat,
      amount,
      percentage,
      color: colors[cat],
      path: buildSlicePath(startAngle, sweepAngle),
      startAngle,
      sweepAngle,
    };
  });
}
