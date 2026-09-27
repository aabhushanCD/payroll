import express from "express";
import {
  createEmployeeHandler,
  deleteEmployeeHandler,
  getEmployeeByIdHandler,
  listEmployeesHandler,
  updateEmployeeHandler,
} from "./employee.controller.ts";
import { validate } from "../../middleware/validator.middleware.ts";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "./employee.schema.ts";

export const employeeRoutes = express.Router();

employeeRoutes.post("/", validate(createEmployeeSchema), createEmployeeHandler);
employeeRoutes.get("/", listEmployeesHandler);
employeeRoutes.get("/:id", getEmployeeByIdHandler);
employeeRoutes.put(
  "/:id",
  validate(updateEmployeeSchema),
  updateEmployeeHandler,
);
employeeRoutes.delete("/:id", deleteEmployeeHandler);
