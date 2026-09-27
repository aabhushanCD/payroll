export type Status = "ACTIVE" | "ON_LEAVE" | "Terminated";

export type SSF_STATUS = "SSF" | "NON_SSF";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation: string;
  employeeCode: string;
  employmentType: EmploymentType;
  ssfStatus: SSF_STATUS;
  payRate: number;
  status: Status;
  joiningDate: string;
  basicSalary: number;
  bank: {
    name: string;
    accountNumber: string;
    branch: string;
  };
}
