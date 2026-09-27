import type { AllowanceFormData } from "../schema/AllowanceSchema";

export interface Allowance extends AllowanceFormData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
