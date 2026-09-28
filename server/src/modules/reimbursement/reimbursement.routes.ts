import { Router } from "express";
import { reimbursementController } from "./reimbursement.controller.ts";
import { validate } from "../../middleware/validator.middleware.ts";
import { reimbursementSchema } from "./reimbursement.schema.ts";

export const reimbursementRouter = Router();

reimbursementRouter.get(
  "/employee/:employeeId/payable",
  reimbursementController.getPayableReimbursementsByEmployee,
);
reimbursementRouter.get(
  "/employee/:employeeId",
  reimbursementController.getReimbursementsByEmployee,
);

reimbursementRouter.get("/", reimbursementController.getReimbursements);
reimbursementRouter.post(
  "/",
  validate(reimbursementSchema),
  reimbursementController.createReimbursement,
);

reimbursementRouter.get("/:id", reimbursementController.getReimbursementById);
reimbursementRouter.patch("/:id", reimbursementController.updateReimbursement);
reimbursementRouter.delete("/:id", reimbursementController.deleteReimbursement);
reimbursementRouter.post("/:id/apply", reimbursementController.markApplied);
reimbursementRouter.post("/:id/stop", reimbursementController.stopRecurring);
