import mongoose from "mongoose";
import type { AllowanceDocument } from "../allowance/allowance.model.ts";

export interface SalaryAllowance {
  _id: mongoose.Types.ObjectId;
  allowance: mongoose.Types.ObjectId | AllowanceDocument;
  amount: number;
}

export interface SalaryDocument extends mongoose.Document {
  employeeId: mongoose.Types.ObjectId;
  basicSalary: number;
  allowances: SalaryAllowance[];
  effectiveDate: Date;
}

const SalarySchema = new mongoose.Schema<SalaryDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: [
      {
        allowance: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Allowance",
          required: true,
        },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    effectiveDate: { type: Date, required: true },
  },
  { timestamps: true },
);

SalarySchema.index({ employeeId: 1, effectiveDate: -1 }, { unique: true });
const Salary = mongoose.model<SalaryDocument>("Salary", SalarySchema);

export default Salary;
