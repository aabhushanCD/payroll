import { api } from "../../../common/axiosInstance";
import type { PayrollConfig } from "../types/types";
import {
  formToPayload,
  type PayrollConfigFormData,
} from "../schema/PayrollConfigSchema";

const getConfigs = async (): Promise<PayrollConfig[]> => {
  const response = await api.get("/payroll-config");
  return response.data.data;
};

const getCurrentConfig = async (asOf?: string): Promise<PayrollConfig> => {
  const response = await api.get("/payroll-config/current", {
    params: { asOf },
  });
  return response.data;
};

const createConfig = async (data: PayrollConfigFormData) => {
  const response = await api.post("/payroll-config", formToPayload(data));
  return response.data;
};

const updateConfig = async (id: string, data: PayrollConfigFormData) => {
  const response = await api.patch(
    `/payroll-config/${id}`,
    formToPayload(data),
  );
  return response.data;
};

const deleteConfig = async (id: string) => {
  const response = await api.delete(`/payroll-config/${id}`);
  return response.data;
};

export const payrollConfigServices = {
  getConfigs,
  getCurrentConfig,
  createConfig,
  updateConfig,
  deleteConfig,
};
