import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allowanceServices } from "../service/AllowanceService";
import type { AllowanceFormData } from "../schema/AllowanceSchema";
import type { Allowance } from "../types/AllowanceTypes";

const ALLOWANCES_KEY = ["allowances"] as const;

export function useAllowancesQuery() {
  return useQuery({
    queryKey: ALLOWANCES_KEY,
    queryFn: allowanceServices.getAllowances,
  });
}

export function useCreateAllowance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllowanceFormData) =>
      allowanceServices.createAllowance(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ALLOWANCES_KEY }),
  });
}

export function useUpdateAllowance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AllowanceFormData>;
    }) => allowanceServices.updateAllowance(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ALLOWANCES_KEY }),
  });
}

export function useToggleSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (allowance: Allowance) =>
      allowanceServices.toggleSecret(allowance),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ALLOWANCES_KEY }),
  });
}

export function useToggleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (allowance: Allowance) =>
      allowanceServices.toggleActive(allowance),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ALLOWANCES_KEY }),
  });
}

export function useDeleteAllowance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allowanceServices.deleteAllowance(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ALLOWANCES_KEY }),
  });
}
