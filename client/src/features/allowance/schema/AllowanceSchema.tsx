export interface AllowanceFormData {
  name: string;
  code: string;
  calculationType: "FIXED" | "PERCENTAGE";
  defaultAmount: number;
  taxable: boolean;
  isActive: boolean;
  isSecret: boolean;
}
