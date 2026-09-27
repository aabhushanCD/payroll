import { AppError } from "../../utils/appError.ts";
import type { AllowanceDocument } from "./allowance.model.ts";
import AllowanceModel from "./allowance.model.ts";
import type { AllowanceFormData } from "./allowance.schema.ts";

const getAllowances = async (): Promise<AllowanceDocument[]> => {
  return AllowanceModel.find().sort({ createdAt: -1 });
};

const getAllowanceById = async (
  id: string,
): Promise<AllowanceDocument | null> => {
  return AllowanceModel.findById(id);
};

const createAllowance = async (
  data: AllowanceFormData,
): Promise<AllowanceDocument> => {
  const existingAllowance = await AllowanceModel.findOne({ code: data.code });
  if (existingAllowance) {
    throw new AppError("Allowance with this code already exists", 409);
  }
  return AllowanceModel.create(data);
};

const updateAllowance = async (
  id: string,
  data: Partial<AllowanceFormData>,
): Promise<AllowanceDocument | null> => {
  return AllowanceModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deactivateAllowance = async (
  id: string,
): Promise<AllowanceDocument | null> => {
  return AllowanceModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
};

const deleteAllowance = async (
  id: string,
): Promise<AllowanceDocument | null> => {
  return AllowanceModel.findByIdAndDelete(id);
};

export const allowanceService = {
  getAllowances,

  getAllowanceById,

  createAllowance,

  updateAllowance,

  deactivateAllowance,

  deleteAllowance,
};
