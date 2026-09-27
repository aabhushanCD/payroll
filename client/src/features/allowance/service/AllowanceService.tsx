import { api } from "../../../common/axiosInstance";
import type { AllowanceFormData } from "../schema/AllowanceSchema";
import type { Allowance } from "../types/AllowanceTypes";

const getAllowances = async (): Promise<Allowance[]> => {
  const response = await api.get("/allowances");

  return response.data;
};

const createAllowance = async (data: AllowanceFormData) => {
  const response = await api.post("/allowances", data);

  return response.data;
};

const updateAllowance = async (
  id: string,
  data: Partial<AllowanceFormData>,
) => {
  const response = await api.put(`/allowances/${id}`, data);

  return response.data;
};

const deleteAllowance = async (id: string) => {
  const response = await api.delete(`/allowances/${id}`);

  return response.data;
};

export const allowanceServices = {
  getAllowances,

  createAllowance,

  updateAllowance,

  deleteAllowance,
};
