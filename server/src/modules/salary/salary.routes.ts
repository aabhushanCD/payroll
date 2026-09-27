import { Router } from "express";
import { salaryController } from "./salary.controller.ts";

export const salaryRouter = Router();

salaryRouter.get(
  "/employee/:employeeId/current",
  salaryController.getCurrentSalary,
);
salaryRouter.get(
  "/employee/:employeeId",
  salaryController.getSalariesByEmployee,
);
salaryRouter.get("/", salaryController.getSalaries);
salaryRouter.post("/", salaryController.createSalary);

salaryRouter.get("/:id", salaryController.getSalaryById);
salaryRouter.patch("/:id", salaryController.updateSalary);
salaryRouter.delete("/:id", salaryController.deleteSalary);
