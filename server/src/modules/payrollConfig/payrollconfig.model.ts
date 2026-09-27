import mongoose from "mongoose";

export interface TaxSlab {
  upTo: number | null; // null = "and above" (the top open-ended slab)
  rate: number; // decimal, e.g. 0.01 for 1%
}

export interface PayrollConfigDocument extends mongoose.Document {
  fiscalYear: string; // e.g. "2083/84"
  ssfEmployeeRate: number; // decimal, e.g. 0.11
  ssfEmployerRate: number; // decimal, e.g. 0.20
  securityFundRate: number; // in-house, company-set %, decimal
  overtimeMultiplier: number; // default 1.5
  taxSlabs: TaxSlab[];
  effectiveFrom: Date; // start of this fiscal year (or policy change date)
  isActive: boolean; // convenience/admin flag only — lookups resolve by date, not this
}

const TaxSlabSchema = new mongoose.Schema<TaxSlab>(
  {
    upTo: { type: Number, default: null, min: 0 },
    rate: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const PayrollConfigSchema = new mongoose.Schema<PayrollConfigDocument>(
  {
    fiscalYear: { type: String, required: true, trim: true, unique: true },
    ssfEmployeeRate: { type: Number, required: true, min: 0, max: 1 },
    ssfEmployerRate: { type: Number, required: true, min: 0, max: 1 },
    securityFundRate: { type: Number, required: true, min: 0, max: 1 },
    overtimeMultiplier: { type: Number, required: true, min: 0, default: 1.5 },
    taxSlabs: {
      type: [TaxSlabSchema],
      required: true,
      validate: {
        validator: (slabs: TaxSlab[]) => slabs.length > 0,
        message: "At least one tax slab is required",
      },
    },
    effectiveFrom: { type: Date, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

// Lookups resolve "which config applies to this date" by effectiveFrom,
// same pattern as Salary.getCurrentSalary — this index makes that query fast.
PayrollConfigSchema.index({ effectiveFrom: -1 });

const PayrollConfig = mongoose.model<PayrollConfigDocument>(
  "PayrollConfig",
  PayrollConfigSchema,
);

export default PayrollConfig;
