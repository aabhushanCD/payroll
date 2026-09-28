import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { requestLogger } from "./middleware/logger.middleware.ts";
import { employeeRoutes } from "./modules/employee/employee.routes.ts";
import { globalErrorHandler } from "./middleware/error.middleware.ts";
import { connectDB } from "./config/db.ts";
import { allowanceRouter } from "./modules/allowance/allowance.routes.ts";
import { salaryRouter } from "./modules/salary/salary.routes.ts";
import { advanceRouter } from "./modules/advance/advance.routes.ts";
import { reimbursementRouter } from "./modules/reimbursement/reimbursement.routes.ts";
import { payrollRoutes } from "./modules/payroll/payrollRun.routes.ts";
import { payrollConfigRoutes } from "./modules/payrollConfig/payrollconfig.routes.ts";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Routes
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy",
  });
});
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/allowances", allowanceRouter);
app.use("/api/v1/salaries", salaryRouter);
app.use("/api/v1/payroll-config", payrollConfigRoutes);
app.use("/api/v1/advances", advanceRouter);
app.use("/api/v1/reimbursements", reimbursementRouter);
app.use("/api/v1/payroll", payrollRoutes);
// global error handling middleware
app.use(globalErrorHandler);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
