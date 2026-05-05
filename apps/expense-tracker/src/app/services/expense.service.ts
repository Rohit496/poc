import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {
  Expense,
  ExpenseCategory,
  NewExpenseInput,
} from "../models/expense.model";
import { StorageService } from "./storage.service";
import {
  EXPENSE_CATEGORIES,
  STORAGE_KEY,
  AMOUNT_PRECISION_FACTOR,
} from "../constants/categories";

@Injectable({ providedIn: "root" })
export class ExpenseService {
  private readonly subject: BehaviorSubject<Expense[]>;

  readonly expenses$: Observable<Expense[]>;

  constructor(private readonly storage: StorageService) {
    this.subject = new BehaviorSubject<Expense[]>(this.loadFromStorage());
    this.expenses$ = this.subject.asObservable();
  }

  addExpense(input: NewExpenseInput): Expense {
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount:
        Math.round(input.amount * AMOUNT_PRECISION_FACTOR) /
        AMOUNT_PRECISION_FACTOR,
      date: input.date,
      category: input.category,
      description: input.description,
      createdAt: new Date().toISOString(),
    };
    this.persist([expense, ...this.subject.getValue()]);
    return expense;
  }

  deleteExpense(id: string): void {
    this.persist(this.subject.getValue().filter((e) => e.id !== id));
  }

  getCategoryTotals(): Record<ExpenseCategory, number> {
    const totals = Object.fromEntries(
      EXPENSE_CATEGORIES.map((cat) => [cat, 0]),
    ) as Record<ExpenseCategory, number>;

    for (const expense of this.subject.getValue()) {
      totals[expense.category] += expense.amount;
    }
    return totals;
  }

  private loadFromStorage(): Expense[] {
    return this.storage.get<Expense[]>(STORAGE_KEY) ?? [];
  }

  private persist(expenses: Expense[]): void {
    this.storage.set(STORAGE_KEY, expenses);
    this.subject.next(expenses);
  }
}
