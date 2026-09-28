import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advanceServices } from "../service/advanceService";
import type { AdvanceFormData } from "../schema/AdvanceSchema";

export const advanceKeys = {
  all: ["advances"] as const,
  active: (employeeId: string) => ["advances", "active", employeeId] as const,
};

export const useAdvances = () =>
  useQuery({ queryKey: advanceKeys.all, queryFn: advanceServices.getAdvances });

export const useActiveAdvances = (employeeId: string) =>
  useQuery({
    queryKey: advanceKeys.active(employeeId),
    queryFn: () => advanceServices.getActiveEmployeeAdvances(employeeId),
    enabled: !!employeeId,
  });

export const useCreateAdvance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: AdvanceFormData) => advanceServices.createAdvance(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: advanceKeys.all }),
  });
};
