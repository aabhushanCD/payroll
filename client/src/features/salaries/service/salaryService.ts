import { api } from "../../../common/axiosInstance";
import type { SalaryFormData } from "../schema/SalarySchema";
import type { Salary } from "../types/types";

const getSalaries = async (): Promise<Salary[]> => {
  const response = await api.get("/salaries");
  return response.data.data;
};

const getSalaryHistory = async (employeeId: string): Promise<Salary[]> => {
  const response = await api.get(`/salaries/employee/${employeeId}`);
  return response.data;
};

const getCurrentSalary = async (
  employeeId: string,
  asOf?: string,
): Promise<Salary> => {
  const response = await api.get(`/salaries/employee/${employeeId}/current`, {
    params: { asOf },
  });
  return response.data;
};

const createSalary = async (data: SalaryFormData) => {
  const response = await api.post("/salaries", {
    ...data,
    effectiveDate: new Date(data.effectiveDate).toISOString(),
  });
  return response.data;
};

const updateSalary = async (id: string, data: Partial<SalaryFormData>) => {
  const response = await api.patch(`/salaries/${id}`, data);
  return response.data;
};

const deleteSalary = async (id: string) => {
  const response = await api.delete(`/salaries/${id}`);
  return response.data;
};

export const salaryServices = {
  getSalaries,
  getSalaryHistory,
  getCurrentSalary,
  createSalary,
  updateSalary,
  deleteSalary,
};
