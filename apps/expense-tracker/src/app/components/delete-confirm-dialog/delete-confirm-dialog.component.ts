import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { Expense } from "../../models/expense.model";

@Component({
  selector: "app-delete-confirm-dialog",
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: "./delete-confirm-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmDialogComponent {
  readonly expense = input.required<Expense>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
