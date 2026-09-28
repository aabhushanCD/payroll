import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reimbursementServices } from "../service/reimbursementService";
import type { ReimbursementFormData } from "../schema/ReimbursementSchema";

export const reimbursementKeys = {
  all: ["reimbursements"] as const,
  payable: (employeeId: string) =>
    ["reimbursements", "payable", employeeId] as const,
};

export const useReimbursements = () =>
  useQuery({
    queryKey: reimbursementKeys.all,
    queryFn: reimbursementServices.getReimbursements,
  });

export const usePayableReimbursements = (employeeId: string) =>
  useQuery({
    queryKey: reimbursementKeys.payable(employeeId),
    queryFn: () => reimbursementServices.getPayableReimbursements(employeeId),
    enabled: !!employeeId,
  });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: reimbursementKeys.all });
};

export const useCreateReimbursement = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (d: ReimbursementFormData) =>
      reimbursementServices.createReimbursement(d),
    onSuccess: invalidate,
  });
};

export const useApplyReimbursement = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => reimbursementServices.applyReimbursement(id),
    onSuccess: invalidate,
  });
};

export const useStopReimbursement = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => reimbursementServices.stopReimbursement(id),
    onSuccess: invalidate,
  });
};
