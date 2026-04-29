import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';
import { Expense, ExpenseCategory } from '../../models/expense.model';
import { EXPENSE_CATEGORIES, DEFAULT_RECENT_LIMIT } from '../../constants/categories';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, NgFor, RouterLink, DeleteConfirmDialogComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly categories = EXPENSE_CATEGORIES;

  readonly recentExpenses$: Observable<Expense[]> = this.expenseService.expenses$.pipe(
    map((expenses) => expenses.slice(0, DEFAULT_RECENT_LIMIT))
  );

  readonly allTimeTotal$: Observable<number> = this.expenseService.expenses$.pipe(
    map((expenses) => expenses.reduce((sum, e) => sum + e.amount, 0))
  );

  readonly categoryTotals$: Observable<Record<ExpenseCategory, number>> =
    this.expenseService.expenses$.pipe(
      map(() => this.expenseService.getCategoryTotals())
    );

  pendingDeleteExpense: Expense | null = null;

  constructor(private readonly expenseService: ExpenseService) {}

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
