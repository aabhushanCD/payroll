import type { EmploymentType, SSF_STATUS, Status } from "../types/types";

export interface EmployeeFormData {
  name: string;
  employeeCode: string;
  ssfStatus: SSF_STATUS;
  designation: string;
  payRate: number;
  status: Status;
  joiningDate: string;
  employmentType: EmploymentType;
  bank: {
    name: string;
    accountNumber: string;
    branch: string;
  };
}
