export type PayslipViewMode = "employee" | "admin";

export interface PayslipEmployeeInfo {
  employeeCode: string;
  name: string;
  designation: string;
  employmentType: string;
  ssfStatus: "SSF" | "NON_SSF";
  bank?: { name?: string; accountNumber?: string; branch?: string };
}

export interface PayslipAllowanceLine {
  name: string;
  amount: number;
  taxable: boolean;
  isSecret: boolean;
}

export interface PayslipReimbursementLine {
  label: string;
  amount: number;
}

export interface PayslipData {
  employee: PayslipEmployeeInfo;
  periodStart: Date;
  periodEnd: Date;
  fiscalYear: string;
  generatedAt: Date;

  basicSalary: number;
  allowances: PayslipAllowanceLine[];
  overtimePay: number;
  hoursWorked: number;
  oneTimeReimbursements: PayslipReimbursementLine[];
  recurringReimbursements: PayslipReimbursementLine[];

  ssfEmployeeContribution: number;
  ssfEmployerContribution: number;
  incomeTax: number;
  securityFundDeduction: number;
  advanceRecovery: number;

  grossEarningsVisible: number;
  grossEarningsAdmin: number;
  totalDeductionsVisible: number;
  totalEmployerCost: number;
  netPay: number;

  monthlyTaxableIncome: number;
  annualizedTaxableIncome: number;
  annualTax: number;

  companyName?: string;
  companyAddress?: string;
}

const formatCurrency = (n: number): string =>
  "Rs. " +
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const formatDate = (d: Date): string =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const lineItem = (label: string, amount: number, badge?: string): string => `
  <tr>
    <td class="li-label">${escapeHtml(label)}${badge ? ` <span class="badge">${badge}</span>` : ""}</td>
    <td class="li-amount">${formatCurrency(amount)}</td>
  </tr>`;

export const buildPayslipHtml = (
  data: PayslipData,
  view: PayslipViewMode,
): string => {
  const isAdmin = view === "admin";
  const companyName = data.companyName ?? "Simal Enterprises Pvt. Ltd.";
  const companyAddress =
    data.companyAddress ?? "Kathmandu, Bagmati Province, Nepal";

  const visibleAllowances = data.allowances.filter((a) => !a.isSecret);
  const secretAllowances = data.allowances.filter((a) => a.isSecret);

  let earningsRows = lineItem("Basic Salary", data.basicSalary);
  earningsRows += visibleAllowances
    .map((a) => lineItem(a.name, a.amount))
    .join("");

  if (data.overtimePay > 0) {
    earningsRows += lineItem(
      `Overtime — ${data.hoursWorked} hrs`,
      data.overtimePay,
    );
  }
  data.oneTimeReimbursements.forEach((r) => {
    earningsRows += lineItem(`${r.label} · one-time`, r.amount);
  });
  data.recurringReimbursements.forEach((r) => {
    earningsRows += lineItem(`${r.label} · recurring`, r.amount);
  });

  if (isAdmin) {
    earningsRows += secretAllowances
      .map((a) => lineItem(a.name, a.amount, "Confidential"))
      .join("");
  }

  const grossTotal = isAdmin
    ? data.grossEarningsAdmin
    : data.grossEarningsVisible;

  let deductionRows = "";
  if (data.employee.ssfStatus === "SSF") {
    deductionRows += lineItem(
      "SSF — employee share (11%)",
      data.ssfEmployeeContribution,
    );
  }
  deductionRows += lineItem("Income Tax (TDS)", data.incomeTax);
  deductionRows += lineItem(
    "In-house Security Fund",
    data.securityFundDeduction,
  );
  if (data.advanceRecovery > 0) {
    deductionRows += lineItem("Advance recovery", data.advanceRecovery);
  }

  const adminPanel = isAdmin
    ? `
    <section class="admin-panel">
      <p class="admin-panel-kicker">Internal · not shown on employee copy</p>
      <table class="line-table">
        <tbody>
          <tr><td class="li-label">SSF — employer share (20%)</td><td class="li-amount">${formatCurrency(data.ssfEmployerContribution)}</td></tr>
          <tr><td class="li-label">Gross incl. confidential components</td><td class="li-amount">${formatCurrency(data.grossEarningsAdmin)}</td></tr>
          <tr class="line-total"><td class="li-label">Total cost to company</td><td class="li-amount">${formatCurrency(data.totalEmployerCost)}</td></tr>
        </tbody>
      </table>
    </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Payslip — ${escapeHtml(data.employee.name)} — ${formatDate(data.periodStart)}</title>
<style>
  :root {
    --ink: #22252a;
    --ink-soft: #6b6f76;
    --ink-faint: #9a9ea5;
    --paper: #fbfaf8;
    --card: #ffffff;
    --line: #e8e5df;
    --brand: #2f5d50;
    --brand-tint: #eef3f1;
    --accent: #b3812f;
    --admin: #8a5a1f;
    --admin-tint: #fbf1e3;
    --admin-line: #e6d3b0;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--ink);
    background: var(--paper);
    padding: 40px 20px;
    line-height: 1.5;
  }
  .sheet {
    max-width: 720px;
    margin: 0 auto;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 10px;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding: 36px 40px 28px;
    border-bottom: 1px solid var(--line);
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-mark {
    width: 42px; height: 42px;
    border-radius: 10px;
    background: var(--brand);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 600;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  .company-name { font-size: 16px; font-weight: 600; color: var(--ink); }
  .company-address { font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }
  .header-meta { text-align: right; }
  .payslip-kicker {
    font-size: 10.5px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1.2px;
    color: var(--ink-faint);
  }
  .period { font-size: 15px; font-weight: 600; color: var(--ink); margin-top: 4px; }
  .admin-flag {
    display: inline-block;
    margin-top: 8px;
    font-size: 10.5px; font-weight: 600;
    letter-spacing: 0.6px;
    color: var(--admin);
    background: var(--admin-tint);
    border: 1px solid var(--admin-line);
    padding: 3px 9px;
    border-radius: 20px;
  }

  /* Employee strip */
  .employee-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px 24px;
    padding: 24px 40px;
    border-bottom: 1px solid var(--line);
  }
  .field-label {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px;
    color: var(--ink-faint); margin-bottom: 3px;
  }
  .field-value { font-size: 13.5px; font-weight: 600; color: var(--ink); }

  /* Summary strip */
  .summary-strip {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1px;
    background: var(--line);
    border-bottom: 1px solid var(--line);
  }
  .summary-cell { background: var(--card); padding: 20px 24px; }
  .summary-cell.is-net { background: var(--brand-tint); }
  .summary-cell .field-label { margin-bottom: 6px; }
  .summary-cell .summary-value {
    font-size: 19px; font-weight: 700; color: var(--ink);
    font-variant-numeric: tabular-nums;
  }
  .summary-cell.is-net .summary-value { color: var(--brand); }

  /* Line-item tables */
  .tables { display: grid; grid-template-columns: 1fr 1fr; }
  .table-col { padding: 28px 40px 8px; }
  .table-col + .table-col { border-left: 1px solid var(--line); padding-left: 32px; }
  .table-col:first-child { padding-right: 32px; }
  .section-heading {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.8px;
    color: var(--ink-faint);
    margin: 0 0 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);
  }
  table.line-table { width: 100%; border-collapse: collapse; }
  .li-label { font-size: 13px; color: var(--ink); padding: 7px 0; }
  .li-amount {
    font-size: 13px; text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--ink); padding: 7px 0;
    white-space: nowrap;
  }
  .line-table tr:not(:last-child) td { border-bottom: 1px solid #f1efe9; }
  .line-total td {
    border-top: 1.5px solid var(--ink) !important;
    border-bottom: none !important;
    font-weight: 700;
    padding-top: 11px;
  }
  .badge {
    font-size: 9.5px; font-weight: 600;
    color: var(--admin);
    background: var(--admin-tint);
    border: 1px solid var(--admin-line);
    padding: 1px 6px;
    border-radius: 10px;
    vertical-align: middle;
  }

  /* Tax note */
  .tax-note {
    margin: 8px 40px 28px;
    padding: 14px 18px;
    background: #f6f5f1;
    border-left: 3px solid var(--accent);
    border-radius: 4px;
    font-size: 12px;
    color: var(--ink-soft);
  }
  .tax-note strong { color: var(--ink); }

  /* Admin panel */
  .admin-panel {
    margin: 0 40px 28px;
    padding: 18px 22px;
    background: var(--admin-tint);
    border: 1px solid var(--admin-line);
    border-radius: 8px;
  }
  .admin-panel-kicker {
    font-size: 10.5px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.7px;
    color: var(--admin);
    margin: 0 0 10px;
  }
  .admin-panel .li-label, .admin-panel .li-amount { font-size: 12.5px; }
  .admin-panel .line-table tr:not(:last-child) td { border-bottom: 1px solid var(--admin-line); }
  .admin-panel .line-total td { border-top: 1.5px solid var(--admin) !important; }

  /* Footer */
  .footer {
    padding: 20px 40px 32px;
    font-size: 11px;
    color: var(--ink-faint);
    text-align: center;
  }

  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: none; border-radius: 0; max-width: 100%; }
  }
  @media (max-width: 560px) {
    .tables, .employee-strip, .summary-strip { grid-template-columns: 1fr; }
    .table-col + .table-col { border-left: none; border-top: 1px solid var(--line); padding-left: 40px; }
    .header { flex-direction: column; }
    .header-meta { text-align: left; }
  }
</style>
</head>
<body>
  <div class="sheet">

    <div class="header">
      <div class="brand-row">
        <div class="brand-mark">${escapeHtml(initials(companyName))}</div>
        <div>
          <div class="company-name">${escapeHtml(companyName)}</div>
          <div class="company-address">${escapeHtml(companyAddress)}</div>
        </div>
      </div>
      <div class="header-meta">
        <div class="payslip-kicker">Payslip</div>
        <div class="period">${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}</div>
        ${isAdmin ? '<div class="admin-flag">Admin copy</div>' : ""}
      </div>
    </div>

    <div class="employee-strip">
      <div><div class="field-label">Employee</div><div class="field-value">${escapeHtml(data.employee.name)}</div></div>
      <div><div class="field-label">Employee Code</div><div class="field-value">${escapeHtml(data.employee.employeeCode)}</div></div>
      <div><div class="field-label">Designation</div><div class="field-value">${escapeHtml(data.employee.designation)}</div></div>
      <div><div class="field-label">Employment Type</div><div class="field-value">${escapeHtml(data.employee.employmentType)}</div></div>
      <div><div class="field-label">SSF Status</div><div class="field-value">${data.employee.ssfStatus === "SSF" ? "SSF Registered" : "Non-SSF"}</div></div>
      <div><div class="field-label">Fiscal Year</div><div class="field-value">${escapeHtml(data.fiscalYear)}</div></div>
      ${
        data.employee.bank?.accountNumber
          ? `<div><div class="field-label">Bank Account</div><div class="field-value">${escapeHtml(data.employee.bank.name ?? "")} · ${escapeHtml(data.employee.bank.accountNumber)}</div></div>`
          : ""
      }
    </div>

    <div class="summary-strip">
      <div class="summary-cell">
        <div class="field-label">Gross Earnings</div>
        <div class="summary-value">${formatCurrency(grossTotal)}</div>
      </div>
      <div class="summary-cell">
        <div class="field-label">Total Deductions</div>
        <div class="summary-value">${formatCurrency(data.totalDeductionsVisible)}</div>
      </div>
      <div class="summary-cell is-net">
        <div class="field-label">Net Pay</div>
        <div class="summary-value">${formatCurrency(data.netPay)}</div>
      </div>
    </div>

    <div class="tables">
      <div class="table-col">
        <p class="section-heading">Earnings</p>
        <table class="line-table"><tbody>
          ${earningsRows}
          <tr class="line-total"><td class="li-label">Gross Earnings</td><td class="li-amount">${formatCurrency(grossTotal)}</td></tr>
        </tbody></table>
      </div>
      <div class="table-col">
        <p class="section-heading">Deductions</p>
        <table class="line-table"><tbody>
          ${deductionRows}
          <tr class="line-total"><td class="li-label">Total Deductions</td><td class="li-amount">${formatCurrency(data.totalDeductionsVisible)}</td></tr>
        </tbody></table>
      </div>
    </div>

    <div class="tax-note">
      <strong>How TDS was calculated —</strong> monthly taxable income of ${formatCurrency(data.monthlyTaxableIncome)}
      is annualized (×12) to ${formatCurrency(data.annualizedTaxableIncome)}, taxed progressively per the fiscal year's
      slabs to give an annual liability of ${formatCurrency(data.annualTax)}, then divided by 12 for this month's
      deduction of ${formatCurrency(data.incomeTax)}.
    </div>

    ${adminPanel}

    <div class="footer">
      System-generated payslip — no signature required. Generated ${formatDate(data.generatedAt)}.
    </div>

  </div>
</body>
</html>`;
};
