import express from "express";
import { allowanceController } from "./allowance.controller.ts";

import { allowanceSchema } from "./allowance.schema.ts";
import { validate } from "../../middleware/validator.middleware.ts";

export const allowanceRouter = express.Router();

allowanceRouter.get("/", allowanceController.listAllowancesHandler);
allowanceRouter.get("/:id", allowanceController.getAllowanceByIdHandler);
allowanceRouter.post(
  "/",
  validate(allowanceSchema),
  allowanceController.createAllowanceHandler,
);
allowanceRouter.put(
  "/:id",
  validate(allowanceSchema),
  allowanceController.updateAllowanceHandler,
);
allowanceRouter.delete("/:id", allowanceController.deleteAllowanceHandler);

allowanceRouter.patch(
  "/:id/toggle-active",
  allowanceController.toggleActiveStatusHandler,
);

allowanceRouter.patch(
  "/:id/toggle-secret",
  allowanceController.toggleSecretStatusHandler,
);
