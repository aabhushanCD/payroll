import type { PayrollConfigDocument } from "./payrollconfig.model.ts";
import PayrollConfig from "./payrollconfig.model.ts";
import type { PayrollConfigFormData } from "./payrollconfig.schema.ts";

const getPayrollConfigs = async (): Promise<PayrollConfigDocument[]> => {
  return PayrollConfig.find().sort({ effectiveFrom: -1 });
};

const getPayrollConfigById = async (
  id: string,
): Promise<PayrollConfigDocument | null> => {
  return PayrollConfig.findById(id);
};

// The config whose effectiveFrom is the most recent one on or before `asOf`
// is the one that applies — this is what the payroll engine should call,
// mirroring Salary.getCurrentSalary. Never resolve by `isActive` alone,
// since that flag is for admin-UI convenience, not lookup correctness.
const getConfigForDate = async (
  asOf: Date = new Date(),
): Promise<PayrollConfigDocument | null> => {
  return PayrollConfig.findOne({
    effectiveFrom: { $lte: asOf },
  }).sort({ effectiveFrom: -1 });
};

const getConfigByFiscalYear = async (
  fiscalYear: string,
): Promise<PayrollConfigDocument | null> => {
  return PayrollConfig.findOne({ fiscalYear });
};

const createPayrollConfig = async (
  data: PayrollConfigFormData,
): Promise<PayrollConfigDocument> => {
  return PayrollConfig.create(data);
};

const updatePayrollConfig = async (
  id: string,
  data: Partial<PayrollConfigFormData>,
): Promise<PayrollConfigDocument | null> => {
  return PayrollConfig.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deletePayrollConfig = async (
  id: string,
): Promise<PayrollConfigDocument | null> => {
  return PayrollConfig.findByIdAndDelete(id);
};

export const payrollConfigService = {
  getPayrollConfigs,
  getPayrollConfigById,
  getConfigForDate,
  getConfigByFiscalYear,
  createPayrollConfig,
  updatePayrollConfig,
  deletePayrollConfig,
};
