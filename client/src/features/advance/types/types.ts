import type { Employee } from "../../employee/types/types";

export type AdvanceDeduction = {
  amount: number;
  date: string;
  payrollRunId?: string;
};

export type Advance = {
  _id: string;
  employeeId: string | Employee;
  amount: number;
  outstandingBalance: number;
  status: "ACTIVE" | "SETTLED";
  deductions: AdvanceDeduction[];
  createdAt: string;
};
