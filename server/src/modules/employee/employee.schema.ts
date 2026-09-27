import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "First name is required").trim(),
  employeeCode: z.string().min(1, "Employee code is required").trim(),
  designation: z.string().min(1, "Designation is required").trim(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  ssfStatus: z.enum(["SSF", "NON_SSF"]),
  basicSalary: z.number().min(0, "Basic salary must be a positive number"),
  joiningDate: z.coerce.date(),
  payRate: z.number().min(0, "Pay rate must be a positive number"),
  bankName: z.string().min(1, "Bank name is required").trim(),
  bankAccountNumber: z
    .string()
    .min(1, "Bank account number is required")
    .trim(),
  bankBranch: z.string().min(1, "Bank branch is required").trim(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  name: z.string().min(1, "First name is required").trim().optional(),
  employeeCode: z
    .string()
    .min(1, "Employee code is required")
    .trim()
    .optional(),
  designation: z.string().min(1, "Designation is required").trim().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).optional(),
  ssfStatus: z.enum(["SSF", "NON_SSF"]).optional(),
  basicSalary: z
    .number()
    .min(0, "Basic salary must be a positive number")
    .optional(),
  joiningDate: z.coerce.date().optional(),
  payRate: z.number().min(0, "Pay rate must be a positive number").optional(),
  bankName: z.string().min(1, "Bank name is required").trim().optional(),
  bankAccountNumber: z
    .string()
    .min(1, "Bank account number is required")
    .trim()
    .optional(),
  bankBranch: z.string().min(1, "Bank branch is required").trim().optional(),
});
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
