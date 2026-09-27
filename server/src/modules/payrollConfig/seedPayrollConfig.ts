/**
 * Seeds the FY2083/84 PayrollConfig using the rates given in the assignment.
 *
 * Run with: npx tsx src/modules/payrollConfig/seedPayrollConfig.ts
 * (adjust path/command to match your project's script runner)
 *
 * ASSUMPTION: Nepali fiscal year 2083/84 is taken to start on Shrawan 1, 2083 BS,
 * which corresponds to 2026-07-17 AD. Document this assumption in the README —
 * it's the boundary effectiveFrom-based lookups depend on.
 */
import mongoose from "mongoose";
import PayrollConfig from "./payrollconfig.model.ts";
import dotenv from "dotenv";

dotenv.config();
const FY_2083_84_CONFIG = {
  fiscalYear: "2083/84",
  ssfEmployeeRate: 0.11,
  ssfEmployerRate: 0.2,
  // Company-internal fund — NOT given by the assignment as a fixed rate,
  // it's explicitly "configurable %". Seeded at 1% as a placeholder;
  // change to whatever your company's actual policy is and note it in the README.
  securityFundRate: 0.01,
  overtimeMultiplier: 1.5,
  taxSlabs: [
    { upTo: 1_000_000, rate: 0.01 }, // Up to 10,00,000 -> 1%
    { upTo: 1_500_000, rate: 0.1 }, // Next 5,00,000 -> 10% (cumulative ceiling 15,00,000)
    { upTo: 2_500_000, rate: 0.2 }, // Next 10,00,000 -> 20% (cumulative ceiling 25,00,000)
    { upTo: 4_000_000, rate: 0.27 }, // Next 15,00,000 -> 27% (cumulative ceiling 40,00,000)
    { upTo: null, rate: 0.29 }, // Above 40,00,000 -> 29%
  ],
  effectiveFrom: new Date("2026-07-17T00:00:00.000Z"),
  isActive: true,
};

const seed = async () => {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/payroll";
  await mongoose.connect(uri);

  const existing = await PayrollConfig.findOne({
    fiscalYear: FY_2083_84_CONFIG.fiscalYear,
  });

  if (existing) {
    console.log(
      `PayrollConfig for FY ${FY_2083_84_CONFIG.fiscalYear} already exists — skipping.`,
    );
  } else {
    const created = await PayrollConfig.create(FY_2083_84_CONFIG);
    console.log("Seeded PayrollConfig:", created._id.toString());
  }

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
