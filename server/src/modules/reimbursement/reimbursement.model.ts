import mongoose from "mongoose";

export type ReimbursementType = "ONE_TIME" | "RECURRING";

// ONE_TIME moves PENDING -> APPLIED (once consumed by a payroll run, never again)
// RECURRING moves ACTIVE -> STOPPED (included in every run until stopped)
export type ReimbursementStatus = "PENDING" | "APPLIED" | "ACTIVE" | "STOPPED";

export interface ReimbursementDocument extends mongoose.Document {
  employeeId: mongoose.Types.ObjectId;
  label: string;
  amount: number;
  type: ReimbursementType;
  status: ReimbursementStatus;
  taxable: boolean;
  createdDate: Date;
  appliedInPayrollRunId?: mongoose.Types.ObjectId; // set once consumed, ONE_TIME only
  stoppedDate?: Date; // set when a RECURRING reimbursement is stopped
}

const ReimbursementSchema = new mongoose.Schema<ReimbursementDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["ONE_TIME", "RECURRING"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPLIED", "ACTIVE", "STOPPED"],
      required: true,
    },
    taxable: { type: Boolean, required: true, default: true },
    createdDate: { type: Date, required: true, default: () => new Date() },
    appliedInPayrollRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayrollRun",
    },
    stoppedDate: { type: Date },
  },
  { timestamps: true },
);

ReimbursementSchema.index({ employeeId: 1, status: 1 });

const Reimbursement = mongoose.model<ReimbursementDocument>(
  "Reimbursement",
  ReimbursementSchema,
);

export default Reimbursement;
