import { z } from "zod";

export const reimbursementSchema = z.object({
  employeeId: z.string().min(1, "employeeId is required"),
  label: z.string().trim().min(1, "label is required"),
  amount: z.number().positive("amount must be greater than 0"),
  type: z.enum(["ONE_TIME", "RECURRING"]),
  taxable: z.boolean().optional().default(true),
  createdDate: z.coerce.date().optional(),
});
// status is NOT accepted from the client — the service sets the correct
// starting status based on `type` (PENDING for ONE_TIME, ACTIVE for RECURRING)

export const reimbursementUpdateSchema = z.object({
  label: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  taxable: z.boolean().optional(),
});

export type ReimbursementFormData = z.infer<typeof reimbursementSchema>;
