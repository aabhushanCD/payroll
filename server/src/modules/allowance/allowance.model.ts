import mongoose from "mongoose";

export type CalculationType = "FIXED" | "PERCENTAGE";

export interface AllowanceDocument extends mongoose.Document {
  name: string;
  code: string;
  calculationType: CalculationType;
  defaultAmount: number;
  taxable: boolean;
  isSecret: boolean;
  isActive: boolean;
}

const AllowanceSchema = new mongoose.Schema<AllowanceDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    calculationType: {
      type: String,
      enum: ["FIXED", "PERCENTAGE"],
      required: true,
    },
    defaultAmount: { type: Number, required: true, min: 0 },
    taxable: { type: Boolean, required: true, default: true },
    isSecret: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

const AllowanceModel = mongoose.model<AllowanceDocument>(
  "Allowance",
  AllowanceSchema,
);

export default AllowanceModel;
