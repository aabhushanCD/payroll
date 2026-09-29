import { AppError } from "../../utils/appError.ts";
import Employee from "./employee.model.ts";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./employee.schema.ts";

export const createEmployee = async (data: CreateEmployeeInput) => {
  const newEmployee = {
    ...data,
    payRate: Number(data.payRate),
    bank: {
      name: data.bank.name,
      accountNumber: data.bank.accountNumber,
      branch: data.bank.branch,
    },
  };
  const employee = new Employee(newEmployee);
  return await employee.save();
};

export const listEmployees = async () => {
  return await Employee.find();
};

export const getEmployeeById = async (id: string) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }
  return employee;
};

export const updateEmployeeById = async (
  id: string,
  data: UpdateEmployeeInput,
) => {
  const employee = await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  return employee;
};

export const deleteEmployeeById = async (id: string) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new Error("Employee not found");
  }
  return employee;
};
