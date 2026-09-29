export type PopulatedEmployee = {
  _id: string;
  employeeCode: string;
  name: string;
  designation?: string;
  employmentType?: string;
  ssfStatus: "SSF" | "NON_SSF";
  joiningDate?: string;
  status?: string;
  bank?: { name: string; accountNumber: string; branch: string };
};

export type AllowanceLine = {
  name: string;
  amount: number;
  taxable: boolean;
  isSecret: boolean;
};

export type ReimbursementLine = {
  label: string;
  amount: number;
  taxable: boolean;
};

export type AdvanceDeductionLine = {
  advanceId: string;
  amountDeducted: number;
};

export type ConfigSnapshot = {
  fiscalYear: string;
  ssfEmployeeRate: number;
  ssfEmployerRate: number;
  securityFundRate: number;
  overtimeMultiplier: number;
};

export type PayrollRun = {
  _id: string;
  employeeId: string | PopulatedEmployee;
  periodStart: string;
  periodEnd: string;
  status: string;
  payableDays: number;
  totalDays: number;
  prorationFactor: number;
  ssfStatus: "SSF" | "NON_SSF";

  basicSalary: number;
  allowances: AllowanceLine[];
  hoursWorked: number;
  standardMonthlyHours: number;
  oneTimeReimbursements: ReimbursementLine[];
  recurringReimbursements: ReimbursementLine[];
  advanceDeductions: AdvanceDeductionLine[];
  configSnapshot: ConfigSnapshot;

  visibleAllowanceTotal: number;
  secretAllowanceTotal: number;
  overtimePay: number;
  oneTimeReimbursementTotal: number;
  recurringReimbursementTotal: number;

  grossEarningsVisible: number;
  grossEarningsAdmin: number;

  ssfEmployeeContribution: number;
  incomeTax: number;
  securityFundDeduction: number;
  advanceRecovery: number;
  totalDeductionsVisible: number;

  ssfEmployerContribution: number;
  totalEmployerCost: number;
  netPay: number;

  monthlyTaxableIncome: number;
  annualizedTaxableIncome: number;
  annualTax: number;

  generatedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type BatchResultItem = {
  employeeId: string;
  employeeName?: string;
};

export type BatchSucceeded = BatchResultItem & {
  payrollRunId: string;
  netPay?: number;
};
export type BatchSkipped = BatchResultItem & { reason: string };
export type BatchFailed = BatchResultItem & { reason: string };

export type BatchRunResult = {
  succeeded: BatchSucceeded[];
  skipped: BatchSkipped[];
  failed: BatchFailed[];
};
