import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollRunServices } from "../service/payrollRunService";
import type {
  SingleRunFormData,
  BatchRunFormData,
} from "../schema/PayrollRunSchema";
import { advanceKeys } from "../../advance/hooks/useAdvances";
import { reimbursementKeys } from "../../reimbursement/hooks/useReimbursements";

// A run consumes advances/reimbursements, so both caches go stale after any run.
const useInvalidateAfterRun = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: advanceKeys.all });
    qc.invalidateQueries({ queryKey: reimbursementKeys.all });
    qc.invalidateQueries({ queryKey: ["payroll-runs"] });
  };
};

export const useRunSingle = () => {
  const invalidate = useInvalidateAfterRun();
  return useMutation({
    mutationFn: (d: SingleRunFormData) => payrollRunServices.runSingle(d),
    onSuccess: invalidate,
  });
};

export const useRunBatch = () => {
  const invalidate = useInvalidateAfterRun();
  return useMutation({
    mutationFn: (d: BatchRunFormData) => payrollRunServices.runBatch(d),
    onSuccess: invalidate,
  });
};
