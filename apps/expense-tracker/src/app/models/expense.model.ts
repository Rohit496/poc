export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Housing"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  description: string;
  createdAt: string;
}

export type NewExpenseInput = Omit<Expense, "id" | "createdAt">;

export interface CategorySlice {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
  path: string;
  startAngle: number;
  sweepAngle: number;
}

export type CategoryView = "list" | "chart";

export interface DonutConfig {
  outerRadius: number;
  innerRadius: number;
  center: number;
}
