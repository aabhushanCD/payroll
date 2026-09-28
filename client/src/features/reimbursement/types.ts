import type { Employee } from "../employee/types/types";

export type ReimbursementType = "ONE_TIME" | "RECURRING";
export type ReimbursementStatus = "PENDING" | "APPLIED" | "ACTIVE" | "STOPPED";

export type Reimbursement = {
  _id: string;
  employeeId: string | Employee;
  type: ReimbursementType;
  amount: number;
  description?: string;
  taxable: boolean;
  status: ReimbursementStatus;
  appliedInPayrollRunId?: string;
  createdAt: string;
};
