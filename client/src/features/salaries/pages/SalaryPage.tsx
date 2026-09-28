import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import SalaryForm from "../components/SalaryForm";
import {
  useCreateSalary,
  useDeleteSalary,
  useSalaries,
} from "../hooks/useSalaries";
import type { Salary } from "../types/types";
import { formatDate, formatNPR } from "../../../common/lib/format";
import { primaryBtn } from "../../../common/styles/formStyles";

const SalaryPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [revising, setRevising] = useState<Salary | null>(null);

  const { data: salaries = [], isLoading } = useSalaries();
  const create = useCreateSalary();
  const remove = useDeleteSalary();

  const close = () => {
    setIsOpen(false);
    setRevising(null);
    create.reset();
  };

  const employeeLabel = (s: Salary) =>
    typeof s.employeeId === "string"
      ? s.employeeId
      : `${s.employeeId.employeeCode} - ${s.employeeId.name}`;

  return (
    <div className="min-h-screen bg-[#0F1B26] text-[#E6ECF1] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Salaries</h1>
        <button
          onClick={() => setIsOpen(true)}
          className={`${primaryBtn} flex items-center gap-1.5`}
        >
          <Plus size={14} /> Assign salary
        </button>
      </div>

      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Basic</th>
              <th className="px-4 py-3 font-medium">Allowances</th>
              <th className="px-4 py-3 font-medium">Effective</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-[#7E93A6]">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && salaries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-[#7E93A6]">
                  No salaries assigned yet.
                </td>
              </tr>
            )}
            {salaries.map((s) => (
              <tr
                key={s._id}
                className="border-b border-[#233647] last:border-0"
              >
                <td className="px-4 py-3">{employeeLabel(s)}</td>
                <td className="px-4 py-3">{formatNPR(s.basicSalary)}</td>
                <td className="px-4 py-3">{s.allowances.length}</td>
                <td className="px-4 py-3">{formatDate(s.effectiveDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-[#7E93A6]">
                    <button
                      title="Revise (new version)"
                      onClick={() => {
                        setRevising(s);
                        setIsOpen(true);
                      }}
                      className="hover:text-[#E6ECF1]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() =>
                        confirm("Delete this salary version?") &&
                        remove.mutate(s._id)
                      }
                      className="hover:text-[#E38080]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SalaryForm
        isOpen={isOpen}
        revising={revising}
        isSaving={create.isPending}
        errorMessage={
          create.error ? (create.error as Error).message : undefined
        }
        onClose={close}
        onSubmit={(input) => create.mutate(input, { onSuccess: close })}
      />
    </div>
  );
};

export default SalaryPage;
