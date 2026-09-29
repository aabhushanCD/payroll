import { z } from "zod";

export const singleRunSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  periodMonth: z.string().min(1, "Select a period"), // "2026-09" input[type=month]
  hoursWorked: z.number().min(0, "Can't be negative"),
  advanceMode: z.enum(["AUTO", "FIXED", "SKIP"]),
  requestedAdvanceRecovery: z.number().min(0).optional(),
});

export type SingleRunFormData = z.infer<typeof singleRunSchema>;

export const batchRunSchema = z.object({
  periodMonth: z.string().min(1, "Select a period"),
  ssfStatus: z.enum(["ALL", "SSF", "NON_SSF"]),
});

export type BatchRunFormData = z.infer<typeof batchRunSchema>;
