import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from "@angular/core";
import { AsyncPipe, DecimalPipe } from "@angular/common";
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
import { AddExpenseComponent } from "../add-expense/add-expense.component";
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
    AddExpenseComponent,
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

  readonly categoryView = signal<CategoryView>(DEFAULT_CATEGORY_VIEW);

  readonly showAddModal = signal(false);

  readonly pendingDeleteExpense = signal<Expense | null>(null);

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly storageService: StorageService,
  ) {}

  ngOnInit(): void {
    const saved = this.storageService.get<CategoryView>(
      CATEGORY_VIEW_STORAGE_KEY,
    );
    if (saved === "list" || saved === "chart") {
      this.categoryView.set(saved);
    }
  }

  onToggleView(view: CategoryView): void {
    this.categoryView.set(view);
    this.storageService.set(CATEGORY_VIEW_STORAGE_KEY, view);
  }

  onDeleteClick(expense: Expense): void {
    this.pendingDeleteExpense.set(expense);
  }

  onDeleteConfirmed(): void {
    const expense = this.pendingDeleteExpense();
    if (expense) {
      this.expenseService.deleteExpense(expense.id);
      this.pendingDeleteExpense.set(null);
    }
  }

  onDeleteCancelled(): void {
    this.pendingDeleteExpense.set(null);
  }

  onAddClick(): void {
    this.showAddModal.set(true);
  }

  onAddSaved(): void {
    this.showAddModal.set(false);
  }

  onAddCancelled(): void {
    this.showAddModal.set(false);
  }
}
