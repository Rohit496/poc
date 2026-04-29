import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { AsyncPipe, DecimalPipe, NgFor } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Observable, map } from "rxjs";
import { ExpenseService } from "../../services/expense.service";
import { StorageService } from "../../services/storage.service";
import {
  Expense,
  ExpenseCategory,
  CategorySlice,
  CategoryView,
} from "../../models/expense.model";
import {
  EXPENSE_CATEGORIES,
  DEFAULT_RECENT_LIMIT,
  CATEGORY_COLORS,
  CATEGORY_VIEW_STORAGE_KEY,
} from "../../constants/categories";
import { DeleteConfirmDialogComponent } from "../delete-confirm-dialog/delete-confirm-dialog.component";
import { DonutChartComponent } from "../donut-chart/donut-chart.component";
import { buildSlices } from "../../utils/chart.utils";

const DEFAULT_CATEGORY_VIEW: CategoryView = "list";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe,
    NgFor,
    RouterLink,
    DeleteConfirmDialogComponent,
    DonutChartComponent,
  ],
  templateUrl: "./dashboard.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly categories = EXPENSE_CATEGORIES;

  readonly recentExpenses$: Observable<Expense[]> =
    this.expenseService.expenses$.pipe(
      map((expenses) => expenses.slice(0, DEFAULT_RECENT_LIMIT)),
    );

  readonly allTimeTotal$: Observable<number> =
    this.expenseService.expenses$.pipe(
      map((expenses) => expenses.reduce((sum, e) => sum + e.amount, 0)),
    );

  readonly categoryTotals$: Observable<Record<ExpenseCategory, number>> =
    this.expenseService.expenses$.pipe(
      map(() => this.expenseService.getCategoryTotals()),
    );

  readonly slices$: Observable<CategorySlice[]> = this.categoryTotals$.pipe(
    map((totals) => buildSlices(totals, CATEGORY_COLORS)),
  );

  categoryView: CategoryView = DEFAULT_CATEGORY_VIEW;

  pendingDeleteExpense: Expense | null = null;

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly storageService: StorageService,
  ) {}

  ngOnInit(): void {
    const saved = this.storageService.get<CategoryView>(
      CATEGORY_VIEW_STORAGE_KEY,
    );
    if (saved === "list" || saved === "chart") {
      this.categoryView = saved;
    }
  }

  onToggleView(view: CategoryView): void {
    this.categoryView = view;
    this.storageService.set(CATEGORY_VIEW_STORAGE_KEY, view);
  }

  onDeleteClick(expense: Expense): void {
    this.pendingDeleteExpense = expense;
  }

  onDeleteConfirmed(): void {
    if (this.pendingDeleteExpense) {
      this.expenseService.deleteExpense(this.pendingDeleteExpense.id);
      this.pendingDeleteExpense = null;
    }
  }

  onDeleteCancelled(): void {
    this.pendingDeleteExpense = null;
  }
}
