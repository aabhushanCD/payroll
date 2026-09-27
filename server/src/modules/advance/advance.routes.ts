import { Router } from "express";
import { advanceController } from "./advance.controller.ts";

export const advanceRouter = Router();

// Specific paths before "/:id" so they aren't shadowed
advanceRouter.get(
  "/employee/:employeeId/active",
  advanceController.getActiveAdvancesByEmployee,
);
advanceRouter.get(
  "/employee/:employeeId",
  advanceController.getAdvancesByEmployee,
);

advanceRouter.get("/", advanceController.getAdvances);
advanceRouter.post("/", advanceController.createAdvance);

advanceRouter.get("/:id", advanceController.getAdvanceById);
advanceRouter.patch("/:id", advanceController.updateAdvance);
advanceRouter.delete("/:id", advanceController.deleteAdvance);
advanceRouter.post("/:id/deduct", advanceController.applyDeduction);
