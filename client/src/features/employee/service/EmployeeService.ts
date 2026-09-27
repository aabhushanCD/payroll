import { api } from "../../../common/axiosInstance";
import type { EmployeeFormData } from "../schema/EmployeeSchema";
import type { Employee } from "../types/types";

const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get("/employees");

  return response.data;
};

const createEmployee = async (data: EmployeeFormData) => {
  const response = await api.post("/employees", data);

  return response.data;
};

const updateEmployee = async (id: string, data: Partial<EmployeeFormData>) => {
  const response = await api.put(`/employees/${id}`, data);

  return response.data;
};

const deleteEmployee = async (id: string) => {
  const response = await api.delete(`/employees/${id}`);

  return response.data;
};

export const employeeServices = {
  getEmployees,

  createEmployee,

  updateEmployee,

  deleteEmployee,
};
