import { z } from "zod";

export const allowanceSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    code: z.string().min(1, "Code is required").trim(),
    calculationType: z.enum(["FIXED", "PERCENTAGE"]),
    defaultAmount: z.coerce
      .number({ message: "Amount must be a number" })
      .min(0, "Amount can't be negative"),
    taxable: z.boolean(),
    isActive: z.boolean(),
    isSecret: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.calculationType === "PERCENTAGE" && data.defaultAmount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["defaultAmount"],
        message: "Percentage-based amount can't exceed 100",
      });
    }
  });

export type AllowanceFormData = z.infer<typeof allowanceSchema>;
