import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AddExpenseComponent } from "./add-expense.component";
import { ExpenseService } from "../../services/expense.service";
import { Expense } from "../../models/expense.model";

const MOCK_EXPENSE: Expense = {
  id: "new-id",
  amount: 25.5,
  date: "2026-04-29",
  category: "Food",
  description: "Lunch",
  createdAt: "2026-04-29T12:00:00.000Z",
};

describe("AddExpenseComponent", () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;
  let expenseServiceSpy: jest.Mocked<ExpenseService>;

  beforeEach(async () => {
    expenseServiceSpy = {
      addExpense: jest.fn().mockReturnValue(MOCK_EXPENSE),
    } as unknown as jest.Mocked<ExpenseService>;

    await TestBed.configureTestingModule({
      imports: [AddExpenseComponent],
      providers: [{ provide: ExpenseService, useValue: expenseServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should be invalid when amount is empty", () => {
    component.form.get("amount")?.setValue(null);
    expect(component.form.invalid).toBe(true);
  });

  it("should be invalid when amount is zero", () => {
    component.form.get("amount")?.setValue(0);
    expect(component.form.get("amount")?.errors).toBeTruthy();
  });

  it("should be invalid when amount is negative", () => {
    component.form.get("amount")?.setValue(-5);
    expect(component.form.get("amount")?.errors).toBeTruthy();
  });

  it("should be invalid when category is not selected", () => {
    component.form.get("category")?.setValue("");
    expect(component.form.get("category")?.errors).toBeTruthy();
  });

  it("should be valid with amount, date, and category filled", () => {
    component.form.setValue({
      amount: 10,
      date: "2026-04-29",
      category: "Food",
      description: "",
    });
    expect(component.form.valid).toBe(true);
  });

  it("should be valid without a description (optional field)", () => {
    component.form.setValue({
      amount: 10,
      date: "2026-04-29",
      category: "Food",
      description: "",
    });
    expect(component.form.valid).toBe(true);
  });

  it("should call ExpenseService.addExpense() on valid submit", () => {
    component.form.setValue({
      amount: 10,
      date: "2026-04-29",
      category: "Food",
      description: "test",
    });
    component.onSubmit();
    expect(expenseServiceSpy.addExpense).toHaveBeenCalledWith({
      amount: 10,
      date: "2026-04-29",
      category: "Food",
      description: "test",
    });
  });

  it("should emit saved after successful submit", () => {
    const spy = jest.fn();
    component.saved.subscribe(spy as any);
    component.form.setValue({
      amount: 10,
      date: "2026-04-29",
      category: "Food",
      description: "",
    });
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });

  it("should not call addExpense when the form is invalid", () => {
    component.form.get("amount")?.setValue(null);
    component.onSubmit();
    expect(expenseServiceSpy.addExpense).not.toHaveBeenCalled();
  });

  it("should emit cancelled when onCancel is called", () => {
    const spy = jest.fn();
    component.cancelled.subscribe(spy as any);
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });
});
