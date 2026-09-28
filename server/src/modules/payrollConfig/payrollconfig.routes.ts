import express from "express";
import { payrollConfigController } from "./payrollconfig.controller.ts";

export const payrollConfigRoutes = express.Router();

payrollConfigRoutes.get("/", payrollConfigController.getPayrollConfigs);
payrollConfigRoutes.get("/:id", payrollConfigController.getPayrollConfigById);
payrollConfigRoutes.post("/", payrollConfigController.createPayrollConfig);
payrollConfigRoutes.patch("/:id", payrollConfigController.updatePayrollConfig);
payrollConfigRoutes.delete("/:id", payrollConfigController.deletePayrollConfig);
