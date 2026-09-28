import { z } from "zod";

export const runPayrollSchema = z
  .object({
    employeeId: z.string().min(1, "employeeId is required"),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    hoursWorked: z.number().min(0).default(0),
    // If omitted, the engine recovers as much of the outstanding advance
    // balance as the payslip's net pay can absorb without going negative
    // (see ASSUMPTION in payrollRun.service.ts). Pass 0 explicitly to skip
    // advance recovery entirely for this run.
    requestedAdvanceRecovery: z.number().min(0).optional(),
  })
  .refine((data) => data.periodEnd > data.periodStart, {
    message: "periodEnd must be after periodStart",
    path: ["periodEnd"],
  });

export type RunPayrollInput = z.infer<typeof runPayrollSchema>;

export const runPayrollBatchSchema = z
  .object({
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    // Omit to run everyone; pass "SSF" or "NON_SSF" to run one group only
    ssfStatus: z.enum(["SSF", "NON_SSF"]).optional(),
    // Optional overtime hours keyed by employeeId; missing employees default to 0
    hoursByEmployee: z.record(z.string(), z.number().min(0)).optional(),
  })
  .refine((d) => d.periodEnd > d.periodStart, {
    message: "periodEnd must be after periodStart",
    path: ["periodEnd"],
  });

export type RunPayrollBatchInput = z.infer<typeof runPayrollBatchSchema>;
