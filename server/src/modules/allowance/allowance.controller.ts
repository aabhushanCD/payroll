import type { Request, Response, NextFunction } from "express";
import { allowanceService } from "./allowance.services.ts";
import { AppError } from "../../utils/appError.ts";

const listAllowancesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowances = await allowanceService.getAllowances();

  res.status(200).json(allowances);
};

const getAllowanceByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowance = await allowanceService.getAllowanceById(
    req.params.id as string,
  );

  if (!allowance) {
    return res.status(404).json({ message: "Allowance not found" });
  }

  res.status(200).json(allowance);
};

const createAllowanceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowance = await allowanceService.createAllowance(req.body);

  res.status(201).json(allowance);
};

const updateAllowanceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowance = await allowanceService.updateAllowance(
    req.params.id as string,
    req.body,
  );

  if (!allowance) {
    throw new AppError("Allowance not found", 404);
  }

  res.status(200).json(allowance);
};

const deactivateAllowanceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowance = await allowanceService.deactivateAllowance(
    req.params.id as string,
  );

  if (!allowance) {
    throw new AppError("Allowance not found", 404);
  }

  res.status(200).json({ message: "Allowance deactivated" });
};

const deleteAllowanceHandler = async (req: Request, res: Response) => {
  const allowance = await allowanceService.deleteAllowance(
    req.params.id as string,
  );
  if (!allowance) {
    throw new AppError("Allowance not found", 404);
  }
  res.status(200).json({ message: "Allowance deleted" });
};

export const allowanceController = {
  listAllowancesHandler,

  getAllowanceByIdHandler,

  createAllowanceHandler,

  updateAllowanceHandler,

  deactivateAllowanceHandler,

  deleteAllowanceHandler,
};
