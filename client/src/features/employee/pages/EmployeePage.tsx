import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Landmark } from "lucide-react";

import {
  useEmployeesQuery,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../hooks/useEmployees";
import type { Employee, Status } from "../types/types";
import type { EmployeeFormData } from "../schema/EmployeeSchema";
import EmployeeFormModal from "../components/EmployeeForm";

const STATUS_STYLES: Record<Status, string> = {
  ACTIVE: "bg-[#1E3A2E] text-[#7FD8A4]",
  ON_LEAVE: "bg-[#3A2E1B] text-[#E3B15C]",
  Terminated: "bg-[#3A1E1E] text-[#E38080]",
};

const EMPLOYMENT_TYPE_LABELS: Record<Employee["employmentType"], string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTOR: "Contractor",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const maskAccountNumber = (accountNumber: string) =>
  `•••• ${accountNumber.slice(-4)}`;

const Employees = () => {
  const {
    data: employees = [],
    isLoading,
    isError,
    error,
  } = useEmployeesQuery();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = (data: EmployeeFormData) => {
    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee._id, data },
        { onSuccess: closeForm },
      );
    } else {
      createEmployee.mutate(data, { onSuccess: closeForm });
    }
  };

  const pendingDeleteEmployee = employees.find(
    (e) => e._id === pendingDeleteId,
  );

  return (
    <div className="min-h-screen bg-[#0F1B26] text-[#E6ECF1] p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-[#7E93A6]">
            {isLoading ? "Loading…" : `${employees.length} people on record`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#C89B4C] text-[#0F1B26] text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} strokeWidth={2} />
          Add employee
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7E93A6]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, code, designation"
          className="w-full pl-9 pr-3 py-2 rounded-md bg-[#152331] border border-[#233647] text-sm placeholder:text-[#7E93A6] focus:outline-none focus:border-[#C89B4C]"
        />
      </div>

      {isError && (
        <div className="rounded-md border border-[#3A1E1E] bg-[#1A1010] px-4 py-3 text-sm text-[#E38080]">
          {(error as Error)?.message ?? "Failed to load employees."}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
              <th className="font-medium px-5 py-3">Employee</th>
              <th className="font-medium px-5 py-3">Designation</th>
              <th className="font-medium px-5 py-3">Employment type</th>
              <th className="font-medium px-5 py-3">SSF</th>
              <th className="font-medium px-5 py-3">Joined</th>
              <th className="font-medium px-5 py-3">Bank</th>
              <th className="font-medium px-5 py-3">Status</th>
              <th className="font-medium px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-[#7E93A6]"
                >
                  Loading employees…
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((employee) => (
                <tr
                  key={employee._id}
                  className="border-t border-[#233647] hover:bg-[#1B2C3D] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#1B2C3D] flex items-center justify-center text-xs font-medium shrink-0">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="leading-tight">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-[#7E93A6]">
                          {employee.employeeCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#7E93A6]">
                    {employee.designation}
                  </td>
                  <td className="px-5 py-3 text-[#7E93A6]">
                    {EMPLOYMENT_TYPE_LABELS[employee.employmentType]}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium rounded-full px-2 py-1 ${
                        employee.ssfStatus === "SSF"
                          ? "bg-[#1B2C3D] text-[#9FB2C2]"
                          : "bg-transparent text-[#7E93A6]"
                      }`}
                    >
                      {employee.ssfStatus === "SSF" ? "SSF" : "Non-SSF"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#7E93A6]">
                    {formatDate(employee.joiningDate)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-[#7E93A6]">
                      <Landmark size={12} className="shrink-0" />
                      <span>
                        {employee.bank.name} ·{" "}
                        {maskAccountNumber(employee.bank.accountNumber)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium rounded-full px-2 py-1 ${STATUS_STYLES[employee.status]}`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(employee)}
                        className="p-1.5 rounded text-[#7E93A6] hover:text-[#E6ECF1] hover:bg-[#233647] transition-colors"
                        aria-label={`Edit ${employee.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(employee._id)}
                        className="p-1.5 rounded text-[#7E93A6] hover:text-[#E38080] hover:bg-[#233647] transition-colors"
                        aria-label={`Delete ${employee.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-[#7E93A6]"
                >
                  {employees.length === 0
                    ? "No employees yet."
                    : `No employees match "${query}"`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EmployeeFormModal
        isOpen={isFormOpen}
        employee={editingEmployee}
        isSaving={createEmployee.isPending || updateEmployee.isPending}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation */}
      {pendingDeleteEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-[#233647] bg-[#152331] p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Remove employee?</h2>
              <p className="text-sm text-[#7E93A6]">
                This will permanently remove {pendingDeleteEmployee.name} from
                your team list. This can't be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 rounded-md text-sm text-[#7E93A6] hover:text-[#E6ECF1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteEmployee.mutate(pendingDeleteEmployee._id, {
                    onSuccess: () => setPendingDeleteId(null),
                  })
                }
                disabled={deleteEmployee.isPending}
                className="px-4 py-2 rounded-md bg-[#E38080] text-[#0F1B26] text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {deleteEmployee.isPending ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
