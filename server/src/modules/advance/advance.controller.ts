import type { Request, Response } from "express";

import type {
  AdvanceFormData,
  AdvanceDeductionInput,
} from "./advance.schema.ts";
import { advanceService } from "./advance.services.ts";
import { AppError } from "../../utils/appError.ts";

const getAdvances = async (_req: Request, res: Response) => {
  const advances = await advanceService.getAdvances();
  res.status(200).json({ success: true, data: advances });
};

const getAdvanceById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const advance = await advanceService.getAdvanceById(id);

  if (!advance) {
    throw new AppError("Advance not found", 404);
  }

  res.status(200).json({ success: true, data: advance });
};

const getAdvancesByEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params as { employeeId: string };
  const advances = await advanceService.getAdvancesByEmployee(employeeId);
  res.status(200).json({ success: true, data: advances });
};

const getActiveAdvancesByEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params as { employeeId: string };
  const advances = await advanceService.getActiveAdvancesByEmployee(employeeId);
  res.status(200).json({ success: true, data: advances });
};

const createAdvance = async (req: Request, res: Response) => {
  const data: AdvanceFormData = req.body;
  const advance = await advanceService.createAdvance(data);
  res.status(201).json({ success: true, data: advance });
};

const updateAdvance = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data: { reason?: string } = req.body;

  const advance = await advanceService.updateAdvance(id, data);

  if (!advance) {
    throw new AppError("Advance not found", 404);
  }

  res.status(200).json({ success: true, data: advance });
};

const deleteAdvance = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const advance = await advanceService.deleteAdvance(id);

  if (!advance) {
    throw new AppError("Advance not found", 404);
  }

  res.status(200).json({ success: true, data: advance });
};

// Mainly invoked internally by the payroll engine, but exposed as an
// endpoint too so it can be tested directly (e.g. via Thunder Client)
// without running a full payroll cycle.
const applyDeduction = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const input: AdvanceDeductionInput = req.body;

  const advance = await advanceService.applyDeduction(id, input);
  res.status(200).json({ success: true, data: advance });
};

export const advanceController = {
  getAdvances,
  getAdvanceById,
  getAdvancesByEmployee,
  getActiveAdvancesByEmployee,
  createAdvance,
  updateAdvance,
  deleteAdvance,
  applyDeduction,
};
