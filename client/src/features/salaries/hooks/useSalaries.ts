import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salaryServices } from "../service/salaryService";
import type { SalaryFormData } from "../schema/SalarySchema";

export const salaryKeys = {
  all: ["salaries"] as const,
  history: (employeeId: string) => ["salaries", "history", employeeId] as const,
};

export const useSalaries = () =>
  useQuery({ queryKey: salaryKeys.all, queryFn: salaryServices.getSalaries });

export const useSalaryHistory = (employeeId: string) =>
  useQuery({
    queryKey: salaryKeys.history(employeeId),
    queryFn: () => salaryServices.getSalaryHistory(employeeId),
    enabled: !!employeeId,
  });

export const useCreateSalary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SalaryFormData) => salaryServices.createSalary(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryKeys.all }),
  });
};

export const useDeleteSalary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryServices.deleteSalary(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: salaryKeys.all }),
  });
};
