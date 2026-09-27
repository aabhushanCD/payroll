import type { Request, Response } from "express";
import {
  createEmployee,
  deleteEmployeeById,
  getEmployeeById,
  listEmployees,
  updateEmployeeById,
} from "./employee.services.ts";

export const createEmployeeHandler = async (req: Request, res: Response) => {
  const employee = await createEmployee(req.body);
  res.status(201).json(employee);
};

export const listEmployeesHandler = async (req: Request, res: Response) => {
  const employees = await listEmployees();
  res.status(200).json(employees);
};

export const getEmployeeByIdHandler = async (req: Request, res: Response) => {
  const employee = await getEmployeeById(req.params.id as unknown as string);
  res.status(200).json(employee);
};

export const updateEmployeeHandler = async (req: Request, res: Response) => {
  const updatedEmployee = await updateEmployeeById(
    req.params.id as unknown as string,
    req.body,
  );
  res.status(200).json(updatedEmployee);
};

export const deleteEmployeeHandler = async (req: Request, res: Response) => {
  await deleteEmployeeById(req.params.id as unknown as string);
  res.status(204).send();
};
