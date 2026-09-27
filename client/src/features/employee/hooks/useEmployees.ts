import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeServices } from "../service/EmployeeService";
import type { EmployeeFormData } from "../schema/EmployeeSchema";

const EMPLOYEES_KEY = ["employees"] as const;

export function useEmployeesQuery() {
  return useQuery({
    queryKey: EMPLOYEES_KEY,
    queryFn: employeeServices.getEmployees,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormData) =>
      employeeServices.createEmployee(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EmployeeFormData>;
    }) => employeeServices.updateEmployee(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeServices.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY }),
  });
}
