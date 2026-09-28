import { api } from "../../../common/axiosInstance";
import type { ReimbursementFormData } from "../schema/ReimbursementSchema";
import type { Reimbursement } from "../types";

const getReimbursements = async (): Promise<Reimbursement[]> => {
  const response = await api.get("/reimbursements");
  return response.data.data;
};

// PENDING + ACTIVE items the next payroll run will include.
const getPayableReimbursements = async (
  employeeId: string,
): Promise<Reimbursement[]> => {
  const response = await api.get(
    `/reimbursements/employee/${employeeId}/payable`,
  );
  return response.data;
};

const createReimbursement = async (data: ReimbursementFormData) => {
  const response = await api.post("/reimbursements", data);
  return response.data;
};

const applyReimbursement = async (id: string) => {
  const response = await api.post(`/reimbursements/${id}/apply`);
  return response.data;
};

const stopReimbursement = async (id: string) => {
  const response = await api.post(`/reimbursements/${id}/stop`);
  return response.data;
};

export const reimbursementServices = {
  getReimbursements,
  getPayableReimbursements,
  createReimbursement,
  applyReimbursement,
  stopReimbursement,
};
