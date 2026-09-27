import mongoose from "mongoose";
import type { ReimbursementDocument } from "./reimbursement.model.ts";
import Reimbursement from "./reimbursement.model.ts";
import type { ReimbursementFormData } from "./reimbursement.schema.ts";
import { AppError } from "../../utils/appError.ts";

const getReimbursements = async (): Promise<ReimbursementDocument[]> => {
  return Reimbursement.find().populate("employeeId").sort({ createdDate: -1 });
};

const getReimbursementById = async (
  id: string,
): Promise<ReimbursementDocument | null> => {
  return Reimbursement.findById(id).populate("employeeId");
};

const getReimbursementsByEmployee = async (
  employeeId: string,
): Promise<ReimbursementDocument[]> => {
  return Reimbursement.find({ employeeId }).sort({ createdDate: -1 });
};

// What the payroll engine should call — PENDING (unconsumed one-time) +
// ACTIVE (ongoing recurring) are the only statuses that belong in a run.
// APPLIED and STOPPED are historical and must never be re-included.
const getPayableReimbursementsByEmployee = async (
  employeeId: string,
): Promise<ReimbursementDocument[]> => {
  return Reimbursement.find({
    employeeId,
    status: { $in: ["PENDING", "ACTIVE"] },
  }).sort({ createdDate: 1 });
};

const createReimbursement = async (
  data: ReimbursementFormData,
): Promise<ReimbursementDocument> => {
  const { employeeId, label, amount, type, taxable } = data;

  return Reimbursement.create({
    employeeId,
    label,
    amount,
    type,
    taxable,
    status: type === "ONE_TIME" ? "PENDING" : "ACTIVE",
  });
};

const updateReimbursement = async (
  id: string,
  data: { label?: string; amount?: number; taxable?: boolean },
): Promise<ReimbursementDocument | null> => {
  const existing = await Reimbursement.findById(id);

  if (!existing) {
    return null;
  }

  if (existing.status === "APPLIED" || existing.status === "STOPPED") {
    throw new AppError(
      "Cannot edit a reimbursement that has already been applied or stopped",
      400,
    );
  }

  return Reimbursement.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteReimbursement = async (
  id: string,
): Promise<ReimbursementDocument | null> => {
  const existing = await Reimbursement.findById(id);

  if (!existing) {
    return null;
  }

  if (existing.status === "APPLIED") {
    throw new AppError(
      "Cannot delete a reimbursement that has already been applied — it is part of payroll history",
      400,
    );
  }

  return Reimbursement.findByIdAndDelete(id);
};

// Called by the payroll engine once a ONE_TIME reimbursement has been
// included in a run's earnings. Marks it consumed so it never appears again.
const markApplied = async (
  id: string,
  payrollRunId: string,
): Promise<ReimbursementDocument> => {
  const reimbursement = await Reimbursement.findById(id);

  if (!reimbursement) {
    throw new AppError("Reimbursement not found", 404);
  }

  if (reimbursement.type !== "ONE_TIME") {
    throw new AppError(
      "Only ONE_TIME reimbursements can be marked applied",
      400,
    );
  }

  if (reimbursement.status !== "PENDING") {
    throw new AppError("Reimbursement is not in a PENDING state", 400);
  }

  reimbursement.status = "APPLIED";
  reimbursement.appliedInPayrollRunId = new mongoose.Types.ObjectId(
    payrollRunId,
  );

  await reimbursement.save();
  return reimbursement;
};

// Stops a RECURRING reimbursement so future payroll runs stop including it.
const stopRecurring = async (id: string): Promise<ReimbursementDocument> => {
  const reimbursement = await Reimbursement.findById(id);

  if (!reimbursement) {
    throw new AppError("Reimbursement not found", 404);
  }

  if (reimbursement.type !== "RECURRING") {
    throw new AppError("Only RECURRING reimbursements can be stopped", 400);
  }

  if (reimbursement.status !== "ACTIVE") {
    throw new AppError("Reimbursement is not currently ACTIVE", 400);
  }

  reimbursement.status = "STOPPED";
  reimbursement.stoppedDate = new Date();

  await reimbursement.save();
  return reimbursement;
};

export const reimbursementService = {
  getReimbursements,
  getReimbursementById,
  getReimbursementsByEmployee,
  getPayableReimbursementsByEmployee,
  createReimbursement,
  updateReimbursement,
  deleteReimbursement,
  markApplied,
  stopRecurring,
};
