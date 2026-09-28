import { Router } from "express";
import { payrollRunController } from "./payrollRun.controller.ts";

export const payrollRoutes = Router();

// Specific paths before "/:id" so they aren't shadowed
payrollRoutes.get(
  "/employee/:employeeId",
  payrollRunController.getPayrollRunsByEmployee,
);
payrollRoutes.get(
  "/ssf/:status",
  payrollRunController.getPayrollRunsBySsfStatus,
);

payrollRoutes.get("/", payrollRunController.getPayrollRuns);
payrollRoutes.post("/run", payrollRunController.runPayroll);

payrollRoutes.get("/:id", payrollRunController.getPayrollRunById);
payrollRoutes.get("/:id/payslip", payrollRunController.getPayslip);

// Batch payroll run endpoint
payrollRoutes.post("/run-batch", payrollRunController.runPayrollBatch);
