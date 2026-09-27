import { z } from "zod";

export const advanceSchema = z.object({
  employeeId: z.string().min(1, "employeeId is required"),
  amount: z.number().positive("amount must be greater than 0"),
  reason: z.string().trim().optional(),
  issuedDate: z.coerce.date(),
});

// outstandingBalance and status are set by the service, not accepted from the client
export const advanceUpdateSchema = z.object({
  reason: z.string().trim().optional(),
});

export const advanceDeductionSchema = z.object({
  payrollRunId: z.string().min(1, "payrollRunId is required"),
  amountDeducted: z.number().positive("amountDeducted must be greater than 0"),
});

export type AdvanceFormData = z.infer<typeof advanceSchema>;
export type AdvanceDeductionInput = z.infer<typeof advanceDeductionSchema>;
