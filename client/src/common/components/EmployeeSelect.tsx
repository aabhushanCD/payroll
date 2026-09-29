import { useEmployeesQuery } from "../../features/employee/hooks/useEmployees";

type Props = {
  value: string;
  onChange: (id: string) => void;
  error?: string;
  disabled?: boolean;
};

export const EmployeeSelect = ({ value, onChange, error, disabled }: Props) => {
  const { data: employees = [], isLoading } = useEmployeesQuery();

  return (
    <div>
      <select
        value={value}
        disabled={disabled || isLoading}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm  text-gray-400"
      >
        <option value="">{isLoading ? "Loading..." : "Select employee"}</option>
        {employees.map((e) => (
          <option key={e._id} value={e._id} className="truncate">
            {e.employeeCode} - {e.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
