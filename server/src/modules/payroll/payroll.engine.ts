import type { TaxSlab } from "../payrollConfig/payrollconfig.model.ts";
import type { PayrollCalcInput, PayrollCalcResult } from "./payroll.types.ts";

/**
 * =========================================================================
 * ASSUMPTIONS
 * =========================================================================
 *
 * 1. SSF base = basicSalary only. Per Nepal's Labour Rules, basic must be
 *    >= 60% of gross wages, and SSF contributions are calculated on basic
 *    only — allowances are excluded from the SSF base entirely.
 *
 * 2. In-house Security Fund base = basicSalary (same base as SSF, for
 *    consistency, since it's explicitly a company-internal analogue of
 *    SSF). Change this to `grossEarningsVisible` if your company intends
 *    otherwise — it's a one-line change (see calculateSecurityFund below).
 *
 * 3. Tax slabs are ANNUAL, but payroll runs monthly. This engine
 *    annualizes the monthly taxable income (x12), applies the slabs, then
 *    divides the resulting annual tax by 12 to get the monthly TDS. This
 *    is the standard approach for progressive-slab monthly withholding.
 *
 * 4. SSF employee contribution is tax-deductible (subtracted from taxable
 *    income before applying slabs), since SSF contributions are
 *    statutorily exempt from income tax in Nepal.
 *
 * 5. Overtime pay is taxable. Reimbursements respect their own `taxable`
 *    flag (set per reimbursement, since e.g. a documented travel
 *    reimbursement may be non-taxable while a cash allowance-like one may
 *    not be).
 *
 * 6. `standardMonthlyHours` is a configurable input, not hardcoded, because
 *    it's genuinely ambiguous (30 days x 8 hrs vs a fixed 208 constant,
 *    etc.) — pass whatever your company defines and document the choice.
 *
 * 7. Secret allowances are excluded from BOTH the SSF base (moot — SSF
 *    never includes allowances anyway, see #1) and the taxable income base,
 *    and are excluded from grossEarningsVisible / totalDeductionsVisible /
 *    netPay — i.e. everything the employee-facing payslip shows.
 */

export const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Applies Nepal's progressive tax slabs to an ANNUAL income figure.
 * Slabs are cumulative ceilings ascending, e.g.:
 *   [{ upTo: 1_000_000, rate: 0.01 }, { upTo: 1_500_000, rate: 0.10 }, ..., { upTo: null, rate: 0.29 }]
 * meaning: first 10,00,000 at 1%, next 5,00,000 (i.e. 10,00,001-15,00,000) at 10%, etc.
 */
export const calculateAnnualTax = (
  annualIncome: number,
  slabs: TaxSlab[],
): number => {
  if (annualIncome <= 0) return 0;

  let remainingIncome = annualIncome;
  let previousCeiling = 0;
  let totalTax = 0;

  for (const slab of slabs) {
    const slabCeiling = slab.upTo ?? Infinity;
    const slabWidth = slabCeiling - previousCeiling;
    const amountInThisSlab = Math.min(remainingIncome, slabWidth);

    if (amountInThisSlab <= 0) break;

    totalTax += amountInThisSlab * slab.rate;
    remainingIncome -= amountInThisSlab;
    previousCeiling = slabCeiling;

    if (remainingIncome <= 0) break;
  }

  return totalTax;
};

const calculateOvertimePay = (
  basicSalary: number,
  hoursWorked: number,
  standardMonthlyHours: number,
  overtimeMultiplier: number,
): number => {
  if (hoursWorked <= 0 || standardMonthlyHours <= 0) return 0;
  const hourlyRate = basicSalary / standardMonthlyHours;
  return hoursWorked * hourlyRate * overtimeMultiplier;
};

const sumAmounts = (lines: { amount: number }[]): number =>
  lines.reduce((sum, l) => sum + l.amount, 0);

const sumTaxable = (lines: { amount: number; taxable: boolean }[]): number =>
  lines.filter((l) => l.taxable).reduce((sum, l) => sum + l.amount, 0);

/**
 * The single entry point — computes a full payroll result for one
 * employee for one pay period. Pure function: same input always produces
 * the same output, no side effects, nothing persisted here.
 */
export const calculatePayroll = (
  input: PayrollCalcInput,
): PayrollCalcResult => {
  const {
    ssfStatus,
    basicSalary, // FULL-month basic, as stored on the Salary record
    allowances, // FULL-month amounts
    hoursWorked,
    standardMonthlyHours,
    oneTimeReimbursements,
    recurringReimbursements,
    advanceRecoveryAmount,
    config,
    prorationFactor = 1,
  } = input;

  const isSsf = ssfStatus === "SSF";

  // ---- Prorated earnings (what is actually paid this period) ----
  const proratedBasic = round2(basicSalary * prorationFactor);
  const scaledAllowances = allowances.map((a) => ({
    ...a,
    amount: round2(a.amount * prorationFactor),
  }));

  const visibleAllowances = scaledAllowances.filter((a) => !a.isSecret);
  const secretAllowances = scaledAllowances.filter((a) => a.isSecret);

  const visibleAllowanceTotal = round2(sumAmounts(visibleAllowances));
  const secretAllowanceTotal = round2(sumAmounts(secretAllowances));

  // Overtime hourly rate uses the FULL basic: working fewer days this month
  // doesn't make an overtime hour worth less.
  const overtimePay = round2(
    calculateOvertimePay(
      basicSalary,
      hoursWorked,
      standardMonthlyHours,
      config.overtimeMultiplier,
    ),
  );

  const oneTimeReimbursementTotal = round2(sumAmounts(oneTimeReimbursements));
  const recurringReimbursementTotal = round2(
    sumAmounts(recurringReimbursements),
  );

  const grossEarningsVisible = round2(
    proratedBasic +
      visibleAllowanceTotal +
      overtimePay +
      oneTimeReimbursementTotal +
      recurringReimbursementTotal,
  );
  const grossEarningsAdmin = round2(
    grossEarningsVisible + secretAllowanceTotal,
  );

  // ---- SSF and Security Fund follow the PRORATED basic ----
  const ssfEmployeeContribution = isSsf
    ? round2(proratedBasic * config.ssfEmployeeRate)
    : 0;
  const ssfEmployerContribution = isSsf
    ? round2(proratedBasic * config.ssfEmployerRate)
    : 0;
  const securityFundDeduction = round2(proratedBasic * config.securityFundRate);

  // ---- TDS: annualize the FULL-month equivalent, then prorate the result ----
  // If we annualized the half-month income directly, the employee would look
  // like they earn half as much per year and fall into a lower slab.
  const fullMonthTaxable = round2(
    basicSalary +
      sumTaxable(allowances.filter((a) => !a.isSecret)) + // full amounts
      overtimePay +
      sumTaxable(oneTimeReimbursements) +
      sumTaxable(recurringReimbursements) -
      (isSsf ? round2(basicSalary * config.ssfEmployeeRate) : 0),
  );

  const monthlyTaxableIncome = fullMonthTaxable;
  const annualizedTaxableIncome = round2(Math.max(fullMonthTaxable, 0) * 12);
  const annualTax = round2(
    calculateAnnualTax(annualizedTaxableIncome, config.taxSlabs),
  );
  const incomeTax = round2((annualTax / 12) * prorationFactor);

  const totalDeductionsVisible = round2(
    ssfEmployeeContribution +
      incomeTax +
      securityFundDeduction +
      advanceRecoveryAmount,
  );

  const netPay = round2(grossEarningsVisible - totalDeductionsVisible);
  const totalEmployerCost = round2(
    grossEarningsAdmin + ssfEmployerContribution,
  );

  return {
    basicSalary: proratedBasic, // what was actually paid
    visibleAllowanceTotal,
    secretAllowanceTotal,
    overtimePay,
    oneTimeReimbursementTotal,
    recurringReimbursementTotal,
    grossEarningsVisible,
    grossEarningsAdmin,

    ssfEmployeeContribution,
    incomeTax,
    securityFundDeduction,
    advanceRecovery: round2(advanceRecoveryAmount),
    totalDeductionsVisible,

    ssfEmployerContribution,
    totalEmployerCost,

    netPay,

    monthlyTaxableIncome,
    annualizedTaxableIncome,
    annualTax,
  };
};
