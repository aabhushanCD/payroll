import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollConfigServices } from "../service/payrollConfigService";
import type { PayrollConfigFormData } from "../schema/PayrollConfigSchema";

export const configKeys = {
  all: ["payroll-config"] as const,
  current: ["payroll-config", "current"] as const,
};

export const usePayrollConfigs = () =>
  useQuery({
    queryKey: configKeys.all,
    queryFn: payrollConfigServices.getConfigs,
  });

// May 400/404 when no config exists yet, so don't retry.
export const useCurrentConfig = () =>
  useQuery({
    queryKey: configKeys.current,
    queryFn: () => payrollConfigServices.getCurrentConfig(),
    retry: false,
  });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: configKeys.all });
};

export const useCreateConfig = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (d: PayrollConfigFormData) =>
      payrollConfigServices.createConfig(d),
    onSuccess: invalidate,
  });
};

export const useUpdateConfig = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayrollConfigFormData }) =>
      payrollConfigServices.updateConfig(id, data),
    onSuccess: invalidate,
  });
};

export const useDeleteConfig = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => payrollConfigServices.deleteConfig(id),
    onSuccess: invalidate,
  });
};
