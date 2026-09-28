import { api } from "../../../common/axiosInstance";
import type { AdvanceFormData } from "../schema/AdvanceSchema";
import type { Advance } from "../types/types";

const getAdvances = async (): Promise<Advance[]> => {
  const response = await api.get("/advances");
  return response.data.data;
};

const getEmployeeAdvances = async (employeeId: string): Promise<Advance[]> => {
  const response = await api.get(`/advances/employee/${employeeId}`);
  return response.data;
};

// Only what payroll can still recover. Used on the Run Payroll screen later.
const getActiveEmployeeAdvances = async (
  employeeId: string,
): Promise<Advance[]> => {
  const response = await api.get(`/advances/employee/${employeeId}/active`);
  return response.data;
};

const createAdvance = async (data: AdvanceFormData) => {
  const response = await api.post("/advances", data);
  return response.data;
};

export const advanceServices = {
  getAdvances,
  getEmployeeAdvances,
  getActiveEmployeeAdvances,
  createAdvance,
};
