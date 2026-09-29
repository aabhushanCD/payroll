import { api } from "../../../common/axiosInstance";
import { monthToPeriod } from "../../../common/lib/format";
import type {
  SingleRunFormData,
  BatchRunFormData,
} from "../schema/PayrollRunSchema";
import type { BatchRunResult, PayrollRun } from "../types";

const runSingle = async (data: SingleRunFormData): Promise<PayrollRun> => {
  const { periodStart, periodEnd } = monthToPeriod(data.periodMonth);
  const payload: Record<string, unknown> = {
    employeeId: data.employeeId,
    periodStart,
    periodEnd,
    hoursWorked: data.hoursWorked,
  };
  if (data.advanceMode === "FIXED") {
    payload.requestedAdvanceRecovery = data.requestedAdvanceRecovery ?? 0;
  } else if (data.advanceMode === "SKIP") {
    payload.requestedAdvanceRecovery = 0;
  }
  // AUTO: field omitted, so the backend recovers what net pay can absorb.
  const response = await api.post("/payroll/run", payload);
  return response.data.data;
};

const runBatch = async (data: BatchRunFormData): Promise<BatchRunResult> => {
  const { periodStart, periodEnd } = monthToPeriod(data.periodMonth);
  const payload: Record<string, unknown> = { periodStart, periodEnd };
  if (data.ssfStatus !== "ALL") payload.ssfStatus = data.ssfStatus;
  const response = await api.post("/payroll/run-batch", payload);
  return response.data.data;
};

type RunFilters = {
  periodMonth?: string;
  ssfStatus?: "ALL" | "SSF" | "NON_SSF";
};

const getRuns = async (filters: RunFilters): Promise<PayrollRun[]> => {
  const period: Partial<ReturnType<typeof monthToPeriod>> = filters.periodMonth
    ? monthToPeriod(filters.periodMonth)
    : {};
  if (filters.ssfStatus && filters.ssfStatus !== "ALL") {
    const response = await api.get(`/payroll/ssf/${filters.ssfStatus}`, {
      params: { periodStart: period.periodStart },
    });
    return response.data.data;
  }
  const response = await api.get("/payroll", { params: period });
  return response.data.data;
};

const getRun = async (id: string): Promise<PayrollRun> => {
  const response = await api.get(`/payroll/${id}`);
  console.log("getRun response", response.data.data);
  return response.data.data;
};

const getEmployeeRuns = async (employeeId: string): Promise<PayrollRun[]> => {
  const response = await api.get(`/payroll/employee/${employeeId}`);
  return response.data.data;
};

// Not a data call - builds the direct HTML url for the <iframe>.
const payslipUrl = (id: string, view: "employee" | "admin") => {
  const base = (api.defaults.baseURL ?? "").replace(/\/$/, "");
  return `${base}/payroll/${id}/payslip${view === "admin" ? "?view=admin" : ""}`;
};

export const payrollRunServices = {
  runSingle,
  runBatch,
  getRuns,
  getRun,
  getEmployeeRuns,
  payslipUrl,
};
