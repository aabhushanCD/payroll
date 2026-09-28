import { z } from "zod";
import type { PayrollConfig } from "../types/types";

// Set to true if the backend stores 0.11 instead of 11 for 11%.
export const RATES_AS_FRACTION = false;
const toForm = (r: number) => (RATES_AS_FRACTION ? +(r * 100).toFixed(4) : r);
const toApi = (r: number) => (RATES_AS_FRACTION ? +(r / 100).toFixed(6) : r);

const pct = (label: string) =>
  z
    .number({ message: `${label} is required` })
    .min(0, "Can't be negative")
    .max(100, "Can't exceed 100%");

export const payrollConfigSchema = z.object({
  fiscalYear: z.string().regex(/^\d{4}\/\d{2}$/, "Use the format 2083/84"),
  effectiveFrom: z.string().min(1, "Effective date is required"),
  ssfEmployeeRate: pct("SSF employee rate"),
  ssfEmployerRate: pct("SSF employer rate"),
  securityFundRate: pct("Security fund rate"),
  overtimeMultiplier: z
    .number({ message: "Multiplier is required" })
    .min(1, "Must be at least 1"),
  taxSlabs: z
    .array(
      z.object({
        upTo: z.number().positive("Must be above 0").nullable(),
        rate: pct("Rate"),
      }),
    )
    .min(1, "Add at least one slab")
    .superRefine((slabs, ctx) => {
      const last = slabs.length - 1;
      slabs.forEach((s, i) => {
        if (i < last && s.upTo === null)
          ctx.addIssue({
            code: "custom",
            message: "Only the last slab can have no limit",
            path: [i, "upTo"],
          });
        if (
          i > 0 &&
          i < last &&
          s.upTo !== null &&
          slabs[i - 1].upTo !== null &&
          s.upTo <= slabs[i - 1].upTo!
        )
          ctx.addIssue({
            code: "custom",
            message: "Must be higher than the previous slab",
            path: [i, "upTo"],
          });
      });
      if (slabs[last]?.upTo !== null)
        ctx.addIssue({
          code: "custom",
          message: "The last slab must have no limit",
          path: [last, "upTo"],
        });
    }),
});

export type PayrollConfigFormData = z.infer<typeof payrollConfigSchema>;

export const DEFAULT_SLABS: PayrollConfigFormData["taxSlabs"] = [
  { upTo: 1_000_000, rate: 1 },
  { upTo: 1_500_000, rate: 10 },
  { upTo: 2_500_000, rate: 20 },
  { upTo: 4_000_000, rate: 27 },
  { upTo: null, rate: 29 },
];

// API <-> form conversion (percent handling lives only here)
export const configToForm = (c: PayrollConfig): PayrollConfigFormData => ({
  fiscalYear: c.fiscalYear,
  effectiveFrom: c.effectiveFrom.slice(0, 10),
  ssfEmployeeRate: toForm(c.ssfEmployeeRate),
  ssfEmployerRate: toForm(c.ssfEmployerRate),
  securityFundRate: toForm(c.securityFundRate),
  overtimeMultiplier: c.overtimeMultiplier,
  taxSlabs: c.taxSlabs.map((s) => ({ upTo: s.upTo, rate: toForm(s.rate) })),
});

export const formToPayload = (d: PayrollConfigFormData) => ({
  ...d,
  effectiveFrom: new Date(d.effectiveFrom).toISOString(),
  ssfEmployeeRate: toApi(d.ssfEmployeeRate),
  ssfEmployerRate: toApi(d.ssfEmployerRate),
  securityFundRate: toApi(d.securityFundRate),
  taxSlabs: d.taxSlabs.map((s) => ({ upTo: s.upTo, rate: toApi(s.rate) })),
});
