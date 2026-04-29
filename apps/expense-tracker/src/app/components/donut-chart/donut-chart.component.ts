import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CategorySlice } from '../../models/expense.model';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  @Input() slices: CategorySlice[] = [];

  activeSlice: CategorySlice | null = null;

  onSliceEnter(slice: CategorySlice): void {
    this.activeSlice = slice;
  }

  onSliceLeave(): void {
    this.activeSlice = null;
  }
}
