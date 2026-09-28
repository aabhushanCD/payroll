import type { Request, Response } from "express";
import { AppError } from "../../utils/appError.ts";
import { payrollRunService } from "./payrollRun.services.ts";
import {
  runPayrollBatchSchema,
  runPayrollSchema,
} from "./payrollRun.schema.ts";
import {
  buildPayslipHtml,
  type PayslipData,
  type PayslipViewMode,
} from "./payslip.template.ts";

// Payroll-run triggering gets explicit Zod validation here (rather than
// relying purely on the type cast used elsewhere) because a malformed
// request here (e.g. periodEnd before periodStart, a negative
// hoursWorked) would otherwise reach the orchestrator and fail deeper in
// the stack with a less useful error.
const runPayroll = async (req: Request, res: Response) => {
  const parsed = runPayrollSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }

  const run = await payrollRunService.runPayroll(parsed.data);
  res.status(201).json({ success: true, data: run });
};

const getPayrollRuns = async (_req: Request, res: Response) => {
  const runs = await payrollRunService.getPayrollRuns();
  res.status(200).json({ success: true, data: runs });
};

const getPayrollRunById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const run = await payrollRunService.getPayrollRunById(id);

  if (!run) {
    throw new AppError("Payroll run not found", 404);
  }

  res.status(200).json({ success: true, data: run });
};

const getPayrollRunsByEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params as { employeeId: string };
  const runs = await payrollRunService.getPayrollRunsByEmployee(employeeId);
  res.status(200).json({ success: true, data: runs });
};

// Spec requirement: "Both groups should be filterable/reportable
// separately" — e.g. GET /ssf/SSF or GET /ssf/NON_SSF, optionally
// narrowed to one period via ?periodStart=2026-08-01
const getPayrollRunsBySsfStatus = async (req: Request, res: Response) => {
  const { status } = req.params;
  const { periodStart } = req.query;

  if (status !== "SSF" && status !== "NON_SSF") {
    throw new AppError("status must be 'SSF' or 'NON_SSF'", 400);
  }

  const periodStartDate = periodStart
    ? new Date(periodStart as string)
    : undefined;

  if (periodStart && Number.isNaN(periodStartDate?.getTime())) {
    throw new AppError("Invalid 'periodStart' date", 400);
  }

  const runs = await payrollRunService.getPayrollRunsBySsfStatus(
    status,
    periodStartDate,
  );
  res.status(200).json({ success: true, data: runs });
};
// Spec requirement: "A simple role flag ('admin' vs 'employee' view) is
// enough to demonstrate this — no need for real auth." So the view is
// picked via a query param rather than a real auth/role system.
// GET /:id/payslip           -> employee view (default, secret components stripped)
// GET /:id/payslip?view=admin -> admin view (everything, incl. employer cost)
const getPayslip = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const view: PayslipViewMode =
    req.query.view === "admin" ? "admin" : "employee";

  const run = await payrollRunService.getPayrollRunById(id);

  if (!run) {
    throw new AppError("Payroll run not found", 404);
  }

  // employeeId is populated by payrollRunService.getPayrollRunById
  const employeeDoc = run.employeeId as unknown as {
    employeeCode: string;
    name: string;
    designation: string;
    employmentType: string;
    ssfStatus: "SSF" | "NON_SSF";
    bank?: { name?: string; accountNumber?: string; branch?: string };
  };

  const payslipData: PayslipData = {
    employee: {
      employeeCode: employeeDoc.employeeCode,
      name: employeeDoc.name,
      designation: employeeDoc.designation,
      employmentType: employeeDoc.employmentType,
      ssfStatus: employeeDoc.ssfStatus,
      ...(employeeDoc.bank ? { bank: employeeDoc.bank } : {}),
    },
    periodStart: run.periodStart,
    periodEnd: run.periodEnd,
    fiscalYear: run.configSnapshot.fiscalYear,
    generatedAt: run.generatedAt,

    basicSalary: run.basicSalary,
    allowances: run.allowances,
    overtimePay: run.overtimePay,
    hoursWorked: run.hoursWorked,
    oneTimeReimbursements: run.oneTimeReimbursements,
    recurringReimbursements: run.recurringReimbursements,

    ssfEmployeeContribution: run.ssfEmployeeContribution,
    ssfEmployerContribution: run.ssfEmployerContribution,
    incomeTax: run.incomeTax,
    securityFundDeduction: run.securityFundDeduction,
    advanceRecovery: run.advanceRecovery,

    grossEarningsVisible: run.grossEarningsVisible,
    grossEarningsAdmin: run.grossEarningsAdmin,
    totalDeductionsVisible: run.totalDeductionsVisible,
    totalEmployerCost: run.totalEmployerCost,
    netPay: run.netPay,

    monthlyTaxableIncome: run.monthlyTaxableIncome,
    annualizedTaxableIncome: run.annualizedTaxableIncome,
    annualTax: run.annualTax,
  };

  const html = buildPayslipHtml(payslipData, view);

  res.status(200).setHeader("Content-Type", "text/html").send(html);
};

const runPayrollBatch = async (req: Request, res: Response) => {
  const parsed = runPayrollBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
  }
  const summary = await payrollRunService.runPayrollBatch(parsed.data);
  res.status(200).json({ success: true, data: summary });
};
export const payrollRunController = {
  runPayroll,
  getPayrollRuns,
  getPayrollRunById,
  getPayrollRunsByEmployee,
  getPayrollRunsBySsfStatus,
  runPayrollBatch,
  getPayslip,
};
