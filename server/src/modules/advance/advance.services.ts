import mongoose from "mongoose";
import type { AdvanceDocument } from "./advance.model.ts";
import Advance from "./advance.model.ts";
import type {
  AdvanceFormData,
  AdvanceDeductionInput,
} from "./advance.schema.ts";
import { AppError } from "../../utils/appError.ts";
import Employee from "../employee/employee.model.ts";

const getAdvances = async (): Promise<AdvanceDocument[]> => {
  return Advance.find().populate("employeeId").sort({ issuedDate: -1 });
};

const getAdvanceById = async (id: string): Promise<AdvanceDocument | null> => {
  return Advance.findById(id).populate("employeeId");
};

const getAdvancesByEmployee = async (
  employeeId: string,
): Promise<AdvanceDocument[]> => {
  return Advance.find({ employeeId }).sort({ issuedDate: -1 });
};

// What the payroll engine should call — only ACTIVE advances count toward
// deductions for the current run.
const getActiveAdvancesByEmployee = async (
  employeeId: string,
): Promise<AdvanceDocument[]> => {
  return Advance.find({ employeeId, status: "ACTIVE" }).sort({
    issuedDate: 1, // oldest first — recover earlier advances before newer ones
  });
};

const createAdvance = async (
  data: AdvanceFormData,
): Promise<AdvanceDocument> => {
  const existingEmployee = await Employee.findById(data.employeeId);
  if (!existingEmployee) {
    throw new AppError("Employee not found", 404);
  }
  return Advance.create({
    employeeId: data.employeeId,
    amount: data.amount,
    issuedDate: data.issuedDate,
    ...(data.reason === undefined ? {} : { reason: data.reason }),
    outstandingBalance: data.amount, // starts fully outstanding
    status: "ACTIVE",
  });
};

const updateAdvance = async (
  id: string,
  data: { reason?: string },
): Promise<AdvanceDocument | null> => {
  return Advance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteAdvance = async (id: string): Promise<AdvanceDocument | null> => {
  return Advance.findByIdAndDelete(id);
};

// Called by the payroll engine when a run recovers part (or all) of an advance.
// Decrements outstandingBalance, logs the deduction for audit, and flips
// status to SETTLED once the balance reaches zero.
const applyDeduction = async (
  advanceId: string,
  input: AdvanceDeductionInput,
): Promise<AdvanceDocument> => {
  const advance = await Advance.findById(advanceId);

  if (!advance) {
    throw new AppError("Advance not found", 404);
  }

  if (advance.status === "SETTLED") {
    throw new AppError("Advance is already settled", 400);
  }

  if (input.amountDeducted > advance.outstandingBalance) {
    throw new AppError(
      "Deduction amount exceeds outstanding advance balance",
      400,
    );
  }

  advance.outstandingBalance -= input.amountDeducted;
  advance.deductions.push({
    payrollRunId: new mongoose.Types.ObjectId(input.payrollRunId),
    amountDeducted: input.amountDeducted,
    deductedOn: new Date(),
  } as AdvanceDocument["deductions"][number]);

  if (advance.outstandingBalance === 0) {
    advance.status = "SETTLED";
  }

  await advance.save();
  return advance;
};

export const advanceService = {
  getAdvances,
  getAdvanceById,
  getAdvancesByEmployee,
  getActiveAdvancesByEmployee,
  createAdvance,
  updateAdvance,
  deleteAdvance,
  applyDeduction,
};
