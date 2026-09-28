import type { TaxSlab } from "../payrollConfig/payrollconfig.model.ts";

export type SSFStatus = "SSF" | "NON_SSF";

export interface AllowanceLine {
  name: string;
  amount: number;
  taxable: boolean;
  isSecret: boolean; // excluded from TDS, excluded from employee-facing payslip
}

export interface ReimbursementLine {
  label: string;
  amount: number;
  taxable: boolean;
}

export interface PayrollCalcConfig {
  ssfEmployeeRate: number; // e.g. 0.11
  ssfEmployerRate: number; // e.g. 0.20
  securityFundRate: number; // in-house, applied to basicSalary — see ASSUMPTIONS below
  overtimeMultiplier: number; // e.g. 1.5
  taxSlabs: TaxSlab[]; // annual, cumulative ceilings, ordered ascending
}

export interface PayrollCalcInput {
  employeeId: string;
  ssfStatus: SSFStatus;
  basicSalary: number;
  allowances: AllowanceLine[]; // resolved amounts from Salary.allowances, includes secret ones
  hoursWorked: number;
  standardMonthlyHours: number; // see ASSUMPTIONS below
  oneTimeReimbursements: ReimbursementLine[];
  recurringReimbursements: ReimbursementLine[];
  advanceRecoveryAmount: number; // decided by the caller (payrollRun.service), not this engine
  config: PayrollCalcConfig;
  prorationFactor?: number;
}

export interface PayrollCalcResult {
  // ---- Earnings (admin view — everything, including secret) ----
  basicSalary: number;
  visibleAllowanceTotal: number; // excludes secret allowances
  secretAllowanceTotal: number;
  overtimePay: number;
  oneTimeReimbursementTotal: number;
  recurringReimbursementTotal: number;
  grossEarningsVisible: number; // what the employee payslip shows as gross
  grossEarningsAdmin: number; // grossEarningsVisible + secretAllowanceTotal

  // ---- Deductions ----
  ssfEmployeeContribution: number; // 0 if NON_SSF
  incomeTax: number; // monthly TDS
  securityFundDeduction: number;
  advanceRecovery: number;
  totalDeductionsVisible: number;

  // ---- Employer-side cost (never shown to employee) ----
  ssfEmployerContribution: number; // 0 if NON_SSF
  totalEmployerCost: number; // grossEarningsAdmin + ssfEmployerContribution

  // ---- Net ----
  netPay: number; // grossEarningsVisible - totalDeductionsVisible

  // ---- Diagnostics, useful for the payslip's TDS breakdown line ----
  monthlyTaxableIncome: number;
  annualizedTaxableIncome: number;
  annualTax: number;
}
