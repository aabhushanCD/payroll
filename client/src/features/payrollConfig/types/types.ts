export type TaxSlab = {
  upTo: number | null; // cumulative annual ceiling, null = no limit
  rate: number;
};

export type PayrollConfig = {
  _id: string;
  fiscalYear: string; // "2083/84"
  effectiveFrom: string;
  ssfEmployeeRate: number;
  ssfEmployerRate: number;
  securityFundRate: number;
  overtimeMultiplier: number;
  taxSlabs: TaxSlab[];
};
