import { z } from "zod";

export const reimbursementSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  type: z.enum(["ONE_TIME", "RECURRING"]),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be above 0"),
  label: z.string().max(200, "Keep it under 200 characters").optional(),
  taxable: z.boolean(),
});

export type ReimbursementFormData = z.infer<typeof reimbursementSchema>;
