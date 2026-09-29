/**
 * Seeds PayrollConfig, Allowances, Employees and Salaries.
 * Idempotent: safe to run multiple times (existing records are skipped).
 *
 * Run with: npx tsx src/seed/seed.ts
 *
 * ASSUMPTIONS (adjust to match your project):
 *  - Model default exports live at the paths imported below.
 *  - Salary model links to the employee via `employeeId`.
 *  - Salary `allowances` items look like { allowance: ObjectId, amount: number }.
 *  - FY 2083/84 starts 2026-07-17 AD (Shrawan 1, 2083 BS).
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import PayrollConfig from "../modules/payrollConfig/payrollconfig.model.ts";
import AllowanceModel from "../modules/allowance/allowance.model.ts";
import Employee from "../modules/employee/employee.model.ts";
import Salary from "../modules/salary/salary.model.ts";

dotenv.config();

const EMPLOYEE_REF_FIELD = "employeeId";
const EFFECTIVE_DATE = new Date("2026-07-17T00:00:00.000Z");

/* ----------------------------- PAYROLL CONFIG ----------------------------- */
const PAYROLL_CONFIG = {
  fiscalYear: "2083/84",
  ssfEmployeeRate: 0.11,
  ssfEmployerRate: 0.2,
  securityFundRate: 0.01, // placeholder, company-configurable
  overtimeMultiplier: 1.5,
  taxSlabs: [
    { upTo: 1_000_000, rate: 0.01 },
    { upTo: 1_500_000, rate: 0.1 },
    { upTo: 2_500_000, rate: 0.2 },
    { upTo: 4_000_000, rate: 0.27 },
    { upTo: null, rate: 0.29 },
  ],
  effectiveFrom: EFFECTIVE_DATE,
  isActive: true,
};

/* ------------------------------- ALLOWANCES ------------------------------- */
const ALLOWANCES = [
  {
    name: "Dearness Allowance",
    code: "DA",
    calculationType: "FIXED" as const,
    defaultAmount: 3000,
    taxable: true,
    isActive: true,
    isSecret: false,
  },
  {
    name: "House Rent Allowance",
    code: "HRA",
    calculationType: "PERCENTAGE" as const,
    defaultAmount: 20,
    taxable: true,
    isActive: true,
    isSecret: false,
  },
  {
    name: "Transport Allowance",
    code: "TA",
    calculationType: "FIXED" as const,
    defaultAmount: 2500,
    taxable: true,
    isActive: true,
    isSecret: false,
  },
  {
    name: "Meal Allowance",
    code: "MEAL",
    calculationType: "FIXED" as const,
    defaultAmount: 2000,
    taxable: false,
    isActive: true,
    isSecret: false,
  },
  {
    name: "Communication Allowance",
    code: "COMM",
    calculationType: "FIXED" as const,
    defaultAmount: 1000,
    taxable: true,
    isActive: true,
    isSecret: false,
  },
  {
    name: "Medical Allowance",
    code: "MED",
    calculationType: "PERCENTAGE" as const,
    defaultAmount: 5,
    taxable: false,
    isActive: true,
    isSecret: false,
  },
  {
    name: "Performance Allowance",
    code: "PERF",
    calculationType: "PERCENTAGE" as const,
    defaultAmount: 10,
    taxable: true,
    isActive: true,
    isSecret: true,
  },
  {
    name: "Remote Area Allowance",
    code: "REMOTE",
    calculationType: "FIXED" as const,
    defaultAmount: 4000,
    taxable: true,
    isActive: false,
    isSecret: true,
  },
];

/* -------------------------------- EMPLOYEES -------------------------------- */
const EMPLOYEES = [
  {
    name: "Ramesh Adhikari",
    employeeCode: "EMP001",
    designation: "Software Engineer",
    employmentType: "FULL_TIME",
    ssfStatus: "SSF",
    joiningDate: "2024-01-15",
    payRate: 65000,
    bank: {
      name: "Nabil Bank",
      accountNumber: "0101012345678",
      branch: "Biratnagar",
    },
  },
  {
    name: "Sita Karki",
    employeeCode: "EMP002",
    designation: "Senior Accountant",
    employmentType: "FULL_TIME",
    ssfStatus: "SSF",
    joiningDate: "2022-06-01",
    payRate: 85000,
    bank: {
      name: "Global IME Bank",
      accountNumber: "1234500987654",
      branch: "Kathmandu",
    },
  },
  {
    name: "Bikash Shrestha",
    employeeCode: "EMP003",
    designation: "HR Manager",
    employmentType: "FULL_TIME",
    ssfStatus: "SSF",
    joiningDate: "2021-03-10",
    payRate: 110000,
    bank: {
      name: "NIC Asia Bank",
      accountNumber: "5501234567890",
      branch: "Lalitpur",
    },
  },
  {
    name: "Anita Gurung",
    employeeCode: "EMP004",
    designation: "UI/UX Designer",
    employmentType: "FULL_TIME",
    ssfStatus: "NON_SSF",
    joiningDate: "2025-02-20",
    payRate: 55000,
    bank: {
      name: "Siddhartha Bank",
      accountNumber: "0027700112233",
      branch: "Pokhara",
    },
  },
  {
    name: "Sanjay Yadav",
    employeeCode: "EMP005",
    designation: "Office Assistant",
    employmentType: "PART_TIME",
    ssfStatus: "NON_SSF",
    joiningDate: "2025-08-05",
    payRate: 22000,
    bank: {
      name: "Nepal Investment Mega Bank",
      accountNumber: "0180012349876",
      branch: "Biratnagar",
    },
  },
  {
    name: "Pooja Thapa",
    employeeCode: "EMP006",
    designation: "QA Engineer",
    employmentType: "FULL_TIME",
    ssfStatus: "SSF",
    joiningDate: "2023-09-12",
    payRate: 58000,
    bank: {
      name: "Machhapuchchhre Bank",
      accountNumber: "0140056781234",
      branch: "Butwal",
    },
  },
  {
    name: "Dipesh Rai",
    employeeCode: "EMP007",
    designation: "Marketing Consultant",
    employmentType: "CONTRACT",
    ssfStatus: "NON_SSF",
    joiningDate: "2026-01-01",
    payRate: 70000,
    bank: {
      name: "Nabil Bank",
      accountNumber: "0101098765432",
      branch: "Dharan",
    },
  },
  {
    name: "Kabita Mahato",
    employeeCode: "EMP008",
    designation: "Customer Support Lead",
    employmentType: "FULL_TIME",
    ssfStatus: "SSF",
    joiningDate: "2022-11-28",
    payRate: 48000,
    bank: {
      name: "Global IME Bank",
      accountNumber: "1234500112233",
      branch: "Biratnagar",
    },
  },
] as const;

/* ---------------------- SALARIES (per employee code) ---------------------- */
// amounts follow each allowance's calculationType: FIXED = NPR, PERCENTAGE = % of basic
const SALARIES: Record<
  string,
  { basicSalary: number; allowances: { code: string; amount: number }[] }
> = {
  EMP001: {
    basicSalary: 65000,
    allowances: [
      { code: "DA", amount: 3000 },
      { code: "HRA", amount: 20 },
      { code: "TA", amount: 2500 },
      { code: "COMM", amount: 1000 },
    ],
  },
  EMP002: {
    basicSalary: 85000,
    allowances: [
      { code: "DA", amount: 3000 },
      { code: "HRA", amount: 20 },
      { code: "TA", amount: 3000 },
      { code: "MED", amount: 5 },
    ],
  },
  EMP003: {
    basicSalary: 110000,
    allowances: [
      { code: "DA", amount: 3500 },
      { code: "HRA", amount: 25 },
      { code: "TA", amount: 4000 },
      { code: "COMM", amount: 1500 },
      { code: "PERF", amount: 10 },
    ],
  },
  EMP004: {
    basicSalary: 55000,
    allowances: [
      { code: "DA", amount: 3000 },
      { code: "MEAL", amount: 2000 },
      { code: "COMM", amount: 1000 },
    ],
  },
  EMP005: {
    basicSalary: 22000,
    allowances: [
      { code: "MEAL", amount: 2000 },
      { code: "TA", amount: 1500 },
    ],
  },
  EMP006: {
    basicSalary: 58000,
    allowances: [
      { code: "DA", amount: 3000 },
      { code: "HRA", amount: 15 },
      { code: "TA", amount: 2500 },
      { code: "MEAL", amount: 2000 },
    ],
  },
  EMP007: {
    basicSalary: 70000,
    allowances: [
      { code: "COMM", amount: 2000 },
      { code: "TA", amount: 3000 },
    ],
  },
  EMP008: {
    basicSalary: 48000,
    allowances: [
      { code: "DA", amount: 3000 },
      { code: "HRA", amount: 15 },
      { code: "MEAL", amount: 2000 },
      { code: "PERF", amount: 8 },
    ],
  },
};

/* ---------------------------------- SEED ---------------------------------- */
const seed = async () => {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/payroll";
  await mongoose.connect(uri);

  // 1. Payroll config
  if (await PayrollConfig.findOne({ fiscalYear: PAYROLL_CONFIG.fiscalYear })) {
    console.log(`PayrollConfig ${PAYROLL_CONFIG.fiscalYear} exists — skipped`);
  } else {
    await PayrollConfig.create(PAYROLL_CONFIG);
    console.log(`Seeded PayrollConfig ${PAYROLL_CONFIG.fiscalYear}`);
  }

  // 2. Allowances
  const allowanceIdByCode = new Map<string, mongoose.Types.ObjectId>();
  for (const a of ALLOWANCES) {
    let doc = await AllowanceModel.findOne({ code: a.code });
    if (doc) {
      console.log(`Allowance ${a.code} exists — skipped`);
    } else {
      doc = await AllowanceModel.create(a);
      console.log(`Seeded allowance ${a.code}`);
    }
    allowanceIdByCode.set(a.code, doc._id as mongoose.Types.ObjectId);
  }

  // 3. Employees
  const employeeIdByCode = new Map<string, mongoose.Types.ObjectId>();
  for (const e of EMPLOYEES) {
    let doc = await Employee.findOne({ employeeCode: e.employeeCode });
    if (doc) {
      console.log(`Employee ${e.employeeCode} exists — skipped`);
    } else {
      doc = await Employee.create({
        ...e,
        joiningDate: new Date(e.joiningDate),
      });
      console.log(`Seeded employee ${e.employeeCode} (${e.name})`);
    }
    employeeIdByCode.set(e.employeeCode, doc._id as mongoose.Types.ObjectId);
  }

  // 4. Salaries
  for (const [empCode, s] of Object.entries(SALARIES)) {
    const employeeId = employeeIdByCode.get(empCode);
    if (!employeeId) continue;

    const filter = {
      [EMPLOYEE_REF_FIELD]: employeeId,
      effectiveDate: EFFECTIVE_DATE,
    };
    if (await Salary.findOne(filter)) {
      console.log(`Salary for ${empCode} exists — skipped`);
      continue;
    }

    await Salary.create({
      [EMPLOYEE_REF_FIELD]: employeeId,
      basicSalary: s.basicSalary,
      allowances: s.allowances.map((al) => ({
        allowance: allowanceIdByCode.get(al.code)!,
        amount: al.amount,
      })),
      effectiveDate: EFFECTIVE_DATE,
    });
    console.log(`Seeded salary for ${empCode}`);
  }

  await mongoose.disconnect();
  console.log("Seeding complete");
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
