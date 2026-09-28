import { useState } from "react";
import { Plus } from "lucide-react";

import ReimbursementForm from "../components/ReimbursementForm";
import {
  useApplyReimbursement,
  useCreateReimbursement,
  useReimbursements,
  useStopReimbursement,
} from "../hooks/useReimbursements";
import StatusBadge from "../../../common/components/StatusBadge";
import {
  employeeLabel,
  formatDate,
  formatNPR,
} from "../../../common/lib/format";
import { primaryBtn } from "../../../common/styles/formStyles";
import type { ReimbursementStatus } from "../types";

const FILTERS: ("ALL" | ReimbursementStatus)[] = [
  "ALL",
  "PENDING",
  "ACTIVE",
  "APPLIED",
  "STOPPED",
];

const ReimbursementPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const { data: items = [], isLoading } = useReimbursements();
  const create = useCreateReimbursement();
  const apply = useApplyReimbursement();
  const stop = useStopReimbursement();

  const visible =
    filter === "ALL" ? items : items.filter((r) => r.status === filter);
  const actionError = (apply.error ?? stop.error) as Error | null;

  const close = () => {
    setIsOpen(false);
    create.reset();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Reimbursements</h1>
        <button
          onClick={() => setIsOpen(true)}
          className={`${primaryBtn} flex items-center gap-1.5`}
        >
          <Plus size={14} /> Add reimbursement
        </button>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === f
                ? "bg-[#C89B4C] text-[#0F1B26] font-semibold"
                : "bg-[#152331] border border-[#233647] text-[#7E93A6] hover:text-[#E6ECF1]"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="text-xs text-[#E38080]">{actionError.message}</p>
      )}

      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Taxable</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-[#7E93A6]">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-[#7E93A6]">
                  No reimbursements here.
                </td>
              </tr>
            )}
            {visible.map((r) => (
              <tr
                key={r._id}
                className="border-b border-[#233647] last:border-0"
              >
                <td className="px-4 py-3">{employeeLabel(r.employeeId)}</td>
                <td className="px-4 py-3 text-[#7E93A6]">
                  {r.description || "-"}
                </td>
                <td className="px-4 py-3">
                  {r.type === "ONE_TIME" ? "One-time" : "Recurring"}
                </td>
                <td className="px-4 py-3">{formatNPR(r.amount)}</td>
                <td className="px-4 py-3">{r.taxable ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {r.type === "ONE_TIME" && r.status === "PENDING" && (
                    <button
                      disabled={apply.isPending}
                      onClick={() =>
                        confirm("Mark as applied without a payroll run?") &&
                        apply.mutate(r._id)
                      }
                      className="text-xs text-[#C89B4C] hover:opacity-80"
                    >
                      Mark applied
                    </button>
                  )}
                  {r.type === "RECURRING" && r.status === "ACTIVE" && (
                    <button
                      disabled={stop.isPending}
                      onClick={() =>
                        confirm("Stop this recurring reimbursement?") &&
                        stop.mutate(r._id)
                      }
                      className="text-xs text-[#E38080] hover:opacity-80"
                    >
                      Stop
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReimbursementForm
        isOpen={isOpen}
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

export default ReimbursementPage;
