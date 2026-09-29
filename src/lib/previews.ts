/** Features that are planned but NOT built. Shown as static mock screens, clearly labeled. Source: master-plan.md 2.2 and 2.3. */
export type Preview = { slug: string; title: string; who: "Finance" | "Employee" | "Manager" | "Admin"; phase: "Phase 1" | "Phase 2"; blurb: string };

export const PREVIEWS: Preview[] = [
  { slug: "manager-approval", title: "Manager approval inbox", who: "Manager", phase: "Phase 1", blurb: "Managers approve their team's claims in one tap before Finance sees them." },
  { slug: "escalation", title: "High-value escalation", who: "Manager", phase: "Phase 1", blurb: "Claims above a set amount go to a second approver automatically." },
  { slug: "status-tracker", title: "Claim status tracker", who: "Employee", phase: "Phase 1", blurb: "Employees see where each claim is, from submitted to paid." },
  { slug: "budget-warning", title: "Budget warning while submitting", who: "Employee", phase: "Phase 1", blurb: "The form warns before an employee submits a claim over the limit." },
  { slug: "notifications", title: "Notifications", who: "Employee", phase: "Phase 1", blurb: "Email alerts when a claim needs approval, is approved, rejected or paid." },
  { slug: "audit-trail", title: "Audit trail", who: "Finance", phase: "Phase 1", blurb: "Every decision and rule change, with who and when, that nobody can edit." },
  { slug: "users-admin", title: "Users and org import", who: "Admin", phase: "Phase 1", blurb: "Add people, set roles and managers, import the org chart from a spreadsheet." },
  { slug: "ocr", title: "Receipt reading (OCR)", who: "Employee", phase: "Phase 2", blurb: "The app reads amount, date and merchant from the receipt photo." },
  { slug: "hris-sync", title: "HRIS / payroll sync", who: "Admin", phase: "Phase 2", blurb: "Org data comes in, approved claims go out to payroll automatically." },
  { slug: "analytics", title: "Spend analytics", who: "Finance", phase: "Phase 2", blurb: "Spend by category and department, trends, and audit turnaround time." },
];
