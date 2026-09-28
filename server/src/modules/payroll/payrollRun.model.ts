import mongoose from "mongoose";
import type {
  AllowanceLine,
  ReimbursementLine,
  SSFStatus,
} from "./payroll.types.ts";

export type PayrollRunStatus = "DRAFT" | "FINALIZED";

// ---- Snapshots: everything the calculation actually used, frozen at run
// time. Even if Salary, PayrollConfig, or an Allowance definition changes
// later, this record still explains exactly how THIS payslip's numbers
// were produced — required for the math to be auditable/reproducible.

export interface AdvanceDeductionSnapshot {
  advanceId: mongoose.Types.ObjectId;
  amountDeducted: number;
}

export interface ConfigSnapshot {
  fiscalYear: string;
  ssfEmployeeRate: number;
  ssfEmployerRate: number;
  securityFundRate: number;
  overtimeMultiplier: number;
}

export interface PayrollRunDocument extends mongoose.Document {
  employeeId: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  status: PayrollRunStatus;
  payableDays: number;
  totalDays: number;
  prorationFactor: number;
  // ---- Inputs (snapshotted) ----
  ssfStatus: SSFStatus;
  basicSalary: number;
  allowances: AllowanceLine[];
  hoursWorked: number;
  standardMonthlyHours: number;
  oneTimeReimbursements: ReimbursementLine[];
  recurringReimbursements: ReimbursementLine[];
  advanceDeductions: AdvanceDeductionSnapshot[];
  configSnapshot: ConfigSnapshot;

  // ---- Outputs (from payroll.engine.ts's PayrollCalcResult) ----
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

  generatedAt: Date;
}

const AllowanceLineSchema = new mongoose.Schema<AllowanceLine>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    taxable: { type: Boolean, required: true },
    isSecret: { type: Boolean, required: true },
  },
  { _id: false },
);

const ReimbursementLineSchema = new mongoose.Schema<ReimbursementLine>(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
    taxable: { type: Boolean, required: true },
  },
  { _id: false },
);

const AdvanceDeductionSnapshotSchema =
  new mongoose.Schema<AdvanceDeductionSnapshot>(
    {
      advanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Advance",
        required: true,
      },
      amountDeducted: { type: Number, required: true },
    },
    { _id: false },
  );

const ConfigSnapshotSchema = new mongoose.Schema<ConfigSnapshot>(
  {
    fiscalYear: { type: String, required: true },
    ssfEmployeeRate: { type: Number, required: true },
    ssfEmployerRate: { type: Number, required: true },
    securityFundRate: { type: Number, required: true },
    overtimeMultiplier: { type: Number, required: true },
  },
  { _id: false },
);

const PayrollRunSchema = new mongoose.Schema<PayrollRunDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "FINALIZED"],
      required: true,
      default: "FINALIZED",
    },
    payableDays: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    prorationFactor: { type: Number, required: true },
    ssfStatus: { type: String, enum: ["SSF", "NON_SSF"], required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: [AllowanceLineSchema], default: [] },
    hoursWorked: { type: Number, required: true, default: 0 },
    standardMonthlyHours: { type: Number, required: true },
    oneTimeReimbursements: { type: [ReimbursementLineSchema], default: [] },
    recurringReimbursements: { type: [ReimbursementLineSchema], default: [] },
    advanceDeductions: { type: [AdvanceDeductionSnapshotSchema], default: [] },
    configSnapshot: { type: ConfigSnapshotSchema, required: true },

    visibleAllowanceTotal: { type: Number, required: true },
    secretAllowanceTotal: { type: Number, required: true },
    overtimePay: { type: Number, required: true },
    oneTimeReimbursementTotal: { type: Number, required: true },
    recurringReimbursementTotal: { type: Number, required: true },
    grossEarningsVisible: { type: Number, required: true },
    grossEarningsAdmin: { type: Number, required: true },

    ssfEmployeeContribution: { type: Number, required: true },
    incomeTax: { type: Number, required: true },
    securityFundDeduction: { type: Number, required: true },
    advanceRecovery: { type: Number, required: true },
    totalDeductionsVisible: { type: Number, required: true },

    ssfEmployerContribution: { type: Number, required: true },
    totalEmployerCost: { type: Number, required: true },

    netPay: { type: Number, required: true },

    monthlyTaxableIncome: { type: Number, required: true },
    annualizedTaxableIncome: { type: Number, required: true },
    annualTax: { type: Number, required: true },

    generatedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true },
);

// One payroll run per employee per period — prevents accidentally double-
// paying someone for the same month.
PayrollRunSchema.index({ employeeId: 1, periodStart: 1 }, { unique: true });

const PayrollRun = mongoose.model<PayrollRunDocument>(
  "PayrollRun",
  PayrollRunSchema,
);

export default PayrollRun;
