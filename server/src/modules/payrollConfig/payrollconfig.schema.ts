import { z } from "zod";

const taxSlabSchema = z.object({
  upTo: z.number().min(0).nullable(), // null = open-ended top slab
  rate: z.number().min(0).max(1), // decimal, e.g. 0.01 for 1%
});

export const payrollConfigSchema = z.object({
  fiscalYear: z.string().trim().min(1, "Fiscal year is required"),
  ssfEmployeeRate: z.number().min(0).max(1),
  ssfEmployerRate: z.number().min(0).max(1),
  securityFundRate: z.number().min(0).max(1),
  overtimeMultiplier: z.number().min(0).default(1.5),
  taxSlabs: z.array(taxSlabSchema).min(1, "At least one tax slab is required"),
  effectiveFrom: z.coerce.date(),
});

export const payrollConfigUpdateSchema = payrollConfigSchema.partial();

export type PayrollConfigFormData = z.infer<typeof payrollConfigSchema>;
