import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./components/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "add",
    loadComponent: () =>
      import("./components/add-expense/add-expense.component").then(
        (m) => m.AddExpenseComponent,
      ),
  },
  { path: "**", redirectTo: "" },
];
