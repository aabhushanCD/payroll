import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const salaryAllowanceSchema = z.object({
  allowance: objectIdSchema,
  amount: z.coerce
    .number({ message: "Amount must be a number" })
    .min(0, "Amount can't be negative"),
});

export const salarySchema = z.object({
  employeeId: objectIdSchema,
  basicSalary: z.coerce
    .number({ message: "Basic salary must be a number" })
    .min(0, "Basic salary can't be negative"),
  allowances: z.array(salaryAllowanceSchema).default([]),
  effectiveDate: z.string().min(1, "Effective date is required"),
});

export type SalaryFormData = z.infer<typeof salarySchema>;
export type SalaryAllowanceFormData = z.infer<typeof salaryAllowanceSchema>;
