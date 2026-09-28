import { z } from "zod";

export const advanceSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be above 0"),
  issuedDate: z.date(),
});

export type AdvanceFormData = z.infer<typeof advanceSchema>;
