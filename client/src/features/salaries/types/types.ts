import type { Allowance } from "../../allowance/types/AllowanceTypes";
import type { Employee } from "../../employee/types/types";

export type SalaryAllowanceLine = {
  allowance: string | Allowance; // id, or populated doc
  amount: number;
};

export type Salary = {
  _id: string;
  employeeId: string | Employee;
  basicSalary: number;
  allowances: SalaryAllowanceLine[];
  effectiveDate: string;
  createdAt?: string;
};
