import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DonutChartComponent } from "./donut-chart.component";
import { CategorySlice } from "../../models/expense.model";

const makeSlice = (
  category: string,
  path = "M 0 0 Z",
  sweepAngle = Math.PI,
): CategorySlice =>
  ({
    category: category as CategorySlice["category"],
    amount: 100,
    percentage: 50,
    color: "#ff0000",
    path,
    startAngle: 0,
    sweepAngle,
  }) as CategorySlice;

const TWO_SLICES: CategorySlice[] = [
  makeSlice(
    "Food",
    "M 100 20 A 80 80 0 0 1 180 100 L 145 100 A 45 45 0 0 0 100 55 Z",
  ),
  makeSlice(
    "Transport",
    "M 180 100 A 80 80 0 0 1 100 180 L 100 145 A 45 45 0 0 0 145 100 Z",
  ),
];

const SINGLE_SLICE: CategorySlice[] = [
  makeSlice("Food", "M 100 20 A 80 80 0 1 1 99.999 20 Z", Math.PI * 2 - 0.001),
];

describe("DonutChartComponent", () => {
  let fixture: ComponentFixture<DonutChartComponent>;
  let component: DonutChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DonutChartComponent);
    component = fixture.componentInstance;
  });

  it("renders one path element per slice", () => {
    fixture.componentRef.setInput("slices", TWO_SLICES);
    fixture.detectChanges();
    const paths = fixture.nativeElement.querySelectorAll(
      '[data-testid^="slice-"]',
    );
    expect(paths.length).toBe(2);
  });

  it("path data-testid contains category name", () => {
    fixture.componentRef.setInput("slices", TWO_SLICES);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="slice-Food"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="slice-Transport"]'),
    ).not.toBeNull();
  });

  it("renders no path when slices is empty", () => {
    fixture.componentRef.setInput("slices", []);
    fixture.detectChanges();
    const paths = fixture.nativeElement.querySelectorAll(
      '[data-testid^="slice-"]',
    );
    expect(paths.length).toBe(0);
  });

  it("single-slice input renders a path (full circle)", () => {
    fixture.componentRef.setInput("slices", SINGLE_SLICE);
    fixture.detectChanges();
    const paths = fixture.nativeElement.querySelectorAll(
      '[data-testid^="slice-"]',
    );
    expect(paths.length).toBe(1);
  });

  it("tooltip is absent when no slice is hovered", () => {
    fixture.componentRef.setInput("slices", TWO_SLICES);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="chart-tooltip"]'),
    ).toBeNull();
  });

  it("tooltip appears with correct content after mouseenter on a slice", () => {
    fixture.componentRef.setInput("slices", TWO_SLICES);
    fixture.detectChanges();
    const foodPath = fixture.nativeElement.querySelector(
      '[data-testid="slice-Food"]',
    );
    foodPath.dispatchEvent(new MouseEvent("mouseenter"));
    fixture.detectChanges();
    const tooltip = fixture.nativeElement.querySelector(
      '[data-testid="chart-tooltip"]',
    );
    expect(tooltip).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="tooltip-category"]')
        .textContent,
    ).toContain("Food");
    expect(
      fixture.nativeElement.querySelector('[data-testid="tooltip-amount"]')
        .textContent,
    ).toContain("100");
    expect(
      fixture.nativeElement.querySelector('[data-testid="tooltip-percentage"]')
        .textContent,
    ).toContain("50");
  });

  it("tooltip is absent after mouseleave", () => {
    fixture.componentRef.setInput("slices", TWO_SLICES);
    fixture.detectChanges();
    const foodPath = fixture.nativeElement.querySelector(
      '[data-testid="slice-Food"]',
    );
    foodPath.dispatchEvent(new MouseEvent("mouseenter"));
    fixture.detectChanges();
    foodPath.dispatchEvent(new MouseEvent("mouseleave"));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="chart-tooltip"]'),
    ).toBeNull();
  });

  it("SVG has correct viewBox attribute", () => {
    fixture.componentRef.setInput("slices", TWO_SLICES);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector(
      '[data-testid="donut-chart"]',
    );
    expect(svg).not.toBeNull();
    expect(svg.getAttribute("viewBox")).toBe("0 0 200 200");
  });
});
