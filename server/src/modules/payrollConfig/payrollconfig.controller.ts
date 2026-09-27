import type { Request, Response } from "express";
import { payrollConfigService } from "./payrollconfig.service.ts";
import { AppError } from "../../utils/appError.ts";
import type { PayrollConfigFormData } from "./payrollconfig.schema.ts";

const getPayrollConfigs = async (_req: Request, res: Response) => {
  const configs = await payrollConfigService.getPayrollConfigs();
  res.status(200).json({ success: true, data: configs });
};

const getPayrollConfigById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const config = await payrollConfigService.getPayrollConfigById(id);

  if (!config) {
    throw new AppError("Payroll config not found", 404);
  }

  res.status(200).json({ success: true, data: config });
};

const getConfigForDate = async (req: Request, res: Response) => {
  const { asOf } = req.query;

  const asOfDate = asOf ? new Date(asOf as string) : undefined;

  if (asOf && Number.isNaN(asOfDate?.getTime())) {
    throw new AppError("Invalid 'asOf' date", 400);
  }

  const config = await payrollConfigService.getConfigForDate(asOfDate);

  if (!config) {
    throw new AppError(
      "No payroll config found effective on or before the given date",
      404,
    );
  }

  res.status(200).json({ success: true, data: config });
};

const getConfigByFiscalYear = async (req: Request, res: Response) => {
  const { fiscalYear } = req.params as { fiscalYear: string };
  const config = await payrollConfigService.getConfigByFiscalYear(fiscalYear);

  if (!config) {
    throw new AppError(
      `No payroll config found for fiscal year ${fiscalYear}`,
      404,
    );
  }

  res.status(200).json({ success: true, data: config });
};

const createPayrollConfig = async (req: Request, res: Response) => {
  const data: PayrollConfigFormData = req.body;
  const config = await payrollConfigService.createPayrollConfig(data);
  res.status(201).json({ success: true, data: config });
};

const updatePayrollConfig = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data: Partial<PayrollConfigFormData> = req.body;

  const config = await payrollConfigService.updatePayrollConfig(id, data);

  if (!config) {
    throw new AppError("Payroll config not found", 404);
  }

  res.status(200).json({ success: true, data: config });
};

const deletePayrollConfig = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const config = await payrollConfigService.deletePayrollConfig(id);

  if (!config) {
    throw new AppError("Payroll config not found", 404);
  }

  res.status(200).json({ success: true, data: config });
};

export const payrollConfigController = {
  getPayrollConfigs,
  getPayrollConfigById,
  getConfigForDate,
  getConfigByFiscalYear,
  createPayrollConfig,
  updatePayrollConfig,
  deletePayrollConfig,
};
