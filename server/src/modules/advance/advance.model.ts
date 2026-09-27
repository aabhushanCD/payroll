import mongoose from "mongoose";

export type AdvanceStatus = "ACTIVE" | "SETTLED";

export interface AdvanceDeduction {
  _id: mongoose.Types.ObjectId;
  payrollRunId: mongoose.Types.ObjectId;
  amountDeducted: number;
  deductedOn: Date;
}

export interface AdvanceDocument extends mongoose.Document {
  employeeId: mongoose.Types.ObjectId;
  amount: number; // original amount issued
  outstandingBalance: number; // decrements as it's recovered via payroll runs
  reason?: string;
  issuedDate: Date;
  status: AdvanceStatus;
  deductions: AdvanceDeduction[]; // audit trail — one entry per payroll run that recovered part of it
}

const AdvanceDeductionSchema = new mongoose.Schema<AdvanceDeduction>(
  {
    payrollRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayrollRun",
      required: true,
    },
    amountDeducted: { type: Number, required: true, min: 0 },
    deductedOn: { type: Date, required: true, default: () => new Date() },
  },
  { _id: true },
);

const AdvanceSchema = new mongoose.Schema<AdvanceDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    outstandingBalance: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    issuedDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "SETTLED"],
      required: true,
      default: "ACTIVE",
    },
    deductions: { type: [AdvanceDeductionSchema], default: [] },
  },
  { timestamps: true },
);

AdvanceSchema.index({ employeeId: 1, status: 1 });

const Advance = mongoose.model<AdvanceDocument>("Advance", AdvanceSchema);

export default Advance;
