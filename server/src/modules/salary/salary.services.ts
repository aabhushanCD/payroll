import type { SalaryDocument } from "./salary.model.ts";
import Salary from "./salary.model.ts";
import type { SalaryFormData } from "./salary.schema.ts";

const getSalaries = async (): Promise<SalaryDocument[]> => {
  return Salary.find()
    .populate("employeeId")
    .populate("allowances.allowance")
    .sort({ effectiveDate: -1 });
};

const getSalaryById = async (id: string): Promise<SalaryDocument | null> => {
  return Salary.findById(id)
    .populate("employeeId")
    .populate("allowances.allowance");
};

const getSalariesByEmployee = async (
  employeeId: string,
): Promise<SalaryDocument[]> => {
  return Salary.find({ employeeId })
    .populate("allowances.allowance")
    .sort({ effectiveDate: -1 });
};

// The record whose effectiveDate is the most recent one on or before
// `asOf` is the one that applies — this is what a payroll run should call,
// not getSalariesByEmployee, since that returns the whole version history.
// Relies on the { employeeId: 1, effectiveDate: -1 } index on the model.
const getCurrentSalary = async (
  employeeId: string,
  asOf: Date = new Date(),
): Promise<SalaryDocument | null> => {
  return Salary.findOne({
    employeeId,
    effectiveDate: { $lte: asOf },
  })
    .sort({ effectiveDate: -1 })
    .populate("allowances.allowance");
};

const createSalary = async (data: SalaryFormData): Promise<SalaryDocument> => {
  return Salary.create(data);
};

const updateSalary = async (
  id: string,
  data: Partial<SalaryFormData>,
): Promise<SalaryDocument | null> => {
  return Salary.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteSalary = async (id: string): Promise<SalaryDocument | null> => {
  return Salary.findByIdAndDelete(id);
};

export const salaryService = {
  getSalaries,

  getSalaryById,

  getSalariesByEmployee,

  getCurrentSalary,

  createSalary,

  updateSalary,

  deleteSalary,
};
