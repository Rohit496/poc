import { Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { AddExpenseComponent } from "./components/add-expense/add-expense.component";

export const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "add", component: AddExpenseComponent },
  { path: "**", redirectTo: "" },
];
