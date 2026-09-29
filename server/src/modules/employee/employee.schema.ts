import { z } from "zod";

const bankSchema = z.object({
  name: z.string().trim().min(1, "Bank name is required"),
  accountNumber: z.string().trim().min(1, "Bank account number is required"),
  branch: z.string().trim().min(1, "Bank branch is required"),
});

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  employeeCode: z.string().trim().min(1, "Employee code is required"),

  designation: z.string().trim().min(1, "Designation is required"),

  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),

  ssfStatus: z.enum(["SSF", "NON_SSF"]),

  joiningDate: z.coerce.date(),

  payRate: z.number().min(0, "Pay rate must be a positive number"),

  bank: bankSchema,
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),

  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee code is required")
    .optional(),

  designation: z.string().trim().min(1, "Designation is required").optional(),

  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]).optional(),

  ssfStatus: z.enum(["SSF", "NON_SSF"]).optional(),

  joiningDate: z.coerce.date().optional(),

  payRate: z.number().min(0, "Pay rate must be a positive number").optional(),

  bank: bankSchema.partial().optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
