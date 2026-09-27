import type { Request, Response } from "express";

import type { SalaryFormData } from "./salary.schema.ts";
import { salaryService } from "./salary.services.ts";
import { AppError } from "../../utils/appError.ts";

const getSalaries = async (_req: Request, res: Response) => {
  const salaries = await salaryService.getSalaries();
  res.status(200).json({ success: true, data: salaries });
};

const getSalaryById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const salary = await salaryService.getSalaryById(id);

  if (!salary) {
    throw new AppError("Salary record not found", 404);
  }

  res.status(200).json({ success: true, data: salary });
};

const getSalariesByEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params as { employeeId: string };
  const salaries = await salaryService.getSalariesByEmployee(employeeId);
  res.status(200).json({ success: true, data: salaries });
};

const getCurrentSalary = async (req: Request, res: Response) => {
  const { employeeId } = req.params as { employeeId: string };
  const { asOf } = req.query as { asOf?: string };

  const asOfDate = asOf ? new Date(asOf as string) : undefined;

  if (asOf && Number.isNaN(asOfDate?.getTime())) {
    throw new AppError("Invalid 'asOf' date", 400);
  }

  const salary = await salaryService.getCurrentSalary(employeeId, asOfDate);

  if (!salary) {
    throw new AppError(
      "No effective salary found for this employee as of the given date",
      404,
    );
  }

  res.status(200).json({ success: true, data: salary });
};

const createSalary = async (req: Request, res: Response) => {
  const data: SalaryFormData = req.body;
  const salary = await salaryService.createSalary(data);
  res.status(201).json({ success: true, data: salary });
};

const updateSalary = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data: Partial<SalaryFormData> = req.body;

  const salary = await salaryService.updateSalary(id, data);

  if (!salary) {
    throw new AppError("Salary record not found", 404);
  }

  res.status(200).json({ success: true, data: salary });
};

const deleteSalary = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const salary = await salaryService.deleteSalary(id);

  if (!salary) {
    throw new AppError("Salary record not found", 404);
  }

  res.status(200).json({ success: true, data: salary });
};

export const salaryController = {
  getSalaries,
  getSalaryById,
  getSalariesByEmployee,
  getCurrentSalary,
  createSalary,
  updateSalary,
  deleteSalary,
};
