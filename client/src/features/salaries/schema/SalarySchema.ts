import { z } from "zod";

export const salarySchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  basicSalary: z
    .number({ message: "Enter a number" })
    .min(0, "Cannot be negative"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  allowances: z
    .array(
      z.object({
        allowance: z.string().min(1, "Select an allowance"),
        amount: z
          .number({ message: "Enter a number" })
          .min(0, "Cannot be negative"),
      }),
    )
    .refine(
      (rows) => new Set(rows.map((r) => r.allowance)).size === rows.length,
      "Each allowance can be added only once",
    ),
});

export type SalaryFormData = z.infer<typeof salarySchema>;
