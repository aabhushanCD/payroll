import { useQuery } from "@tanstack/react-query";
import { payrollRunServices } from "../service/payrollRunService";

export const runKeys = {
  all: ["payroll-runs"] as const,
  list: (periodMonth?: string, ssfStatus?: string) =>
    ["payroll-runs", "list", periodMonth ?? "any", ssfStatus ?? "ALL"] as const,
  detail: (id: string) => ["payroll-runs", "detail", id] as const,
  byEmployee: (employeeId: string) =>
    ["payroll-runs", "employee", employeeId] as const,
};

export const useRuns = (
  periodMonth?: string,
  ssfStatus?: "ALL" | "SSF" | "NON_SSF",
) =>
  useQuery({
    queryKey: runKeys.list(periodMonth, ssfStatus),
    queryFn: () => payrollRunServices.getRuns({ periodMonth, ssfStatus }),
  });

export const useRun = (id: string) =>
  useQuery({
    queryKey: runKeys.detail(id),
    queryFn: () => payrollRunServices.getRun(id),
    enabled: !!id,
  });

export const useEmployeeRuns = (employeeId: string) =>
  useQuery({
    queryKey: runKeys.byEmployee(employeeId),
    queryFn: () => payrollRunServices.getEmployeeRuns(employeeId),
    enabled: !!employeeId,
  });
