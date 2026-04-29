import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseCategory } from '../../models/expense.model';
import { EXPENSE_CATEGORIES, MIN_EXPENSE_AMOUNT } from '../../constants/categories';

interface AddExpenseForm {
  amount: FormControl<number | null>;
  date: FormControl<string | null>;
  category: FormControl<string | null>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-expense.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddExpenseComponent {
  readonly categories = EXPENSE_CATEGORIES;

  readonly form = new FormGroup<AddExpenseForm>({
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(MIN_EXPENSE_AMOUNT),
    ]),
    date: new FormControl<string | null>(this.todayAsIsoDate(), [
      Validators.required,
    ]),
    category: new FormControl<string | null>('', [Validators.required]),
    description: new FormControl<string | null>(''),
  });

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { amount, date, category, description } = this.form.getRawValue();
    this.expenseService.addExpense({
      amount: amount!,
      date: date!,
      category: category! as ExpenseCategory,
      description: description ?? '',
    });
    void this.router.navigate(['/']);
  }

  private todayAsIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
