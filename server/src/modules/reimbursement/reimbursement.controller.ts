import type { Request, Response } from "express";

import type { ReimbursementFormData } from "./reimbursement.schema.ts";
import { reimbursementService } from "./reimbursement.services.ts";
import { AppError } from "../../utils/appError.ts";

const getReimbursements = async (_req: Request, res: Response) => {
  const reimbursements = await reimbursementService.getReimbursements();
  res.status(200).json({ success: true, data: reimbursements });
};

const getReimbursementById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const reimbursement = await reimbursementService.getReimbursementById(id);

  if (!reimbursement) {
    throw new AppError("Reimbursement not found", 404);
  }

  res.status(200).json({ success: true, data: reimbursement });
};

const getReimbursementsByEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params as { employeeId: string }   ;
  const reimbursements =
    await reimbursementService.getReimbursementsByEmployee(employeeId);
  res.status(200).json({ success: true, data: reimbursements });
};

const getPayableReimbursementsByEmployee = async (
  req: Request,
  res: Response,
) => {
  const { employeeId } = req.params as { employeeId: string };
  const reimbursements =
    await reimbursementService.getPayableReimbursementsByEmployee(employeeId);
  res.status(200).json({ success: true, data: reimbursements });
};

const createReimbursement = async (req: Request, res: Response) => {
  const data: ReimbursementFormData = req.body;
  const reimbursement = await reimbursementService.createReimbursement(data);
  res.status(201).json({ success: true, data: reimbursement });
};

const updateReimbursement = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = req.body;

  const reimbursement = await reimbursementService.updateReimbursement(
    id,
    data,
  );

  if (!reimbursement) {
    throw new AppError("Reimbursement not found", 404);
  }

  res.status(200).json({ success: true, data: reimbursement });
};

const deleteReimbursement = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const reimbursement = await reimbursementService.deleteReimbursement(id);

  if (!reimbursement) {
    throw new AppError("Reimbursement not found", 404);
  }

  res.status(200).json({ success: true, data: reimbursement });
};

// Mainly invoked internally by the payroll engine, exposed for direct
// testing (e.g. via Thunder Client) without running a full payroll cycle.
const markApplied = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { payrollRunId } = req.body as { payrollRunId: string };

  if (!payrollRunId) {
    throw new AppError("payrollRunId is required", 400);
  }

  const reimbursement = await reimbursementService.markApplied(
    id,
    payrollRunId,
  );
  res.status(200).json({ success: true, data: reimbursement });
};

const stopRecurring = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const reimbursement = await reimbursementService.stopRecurring(id);
  res.status(200).json({ success: true, data: reimbursement });
};

export const reimbursementController = {
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
