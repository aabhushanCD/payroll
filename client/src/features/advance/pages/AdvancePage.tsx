import { Fragment, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";

import AdvanceForm from "../components/AdvanceForm";
import { useAdvances, useCreateAdvance } from "../hooks/useAdvances";
import StatusBadge from "../../../common/components/StatusBadge";
import {
  employeeLabel,
  formatDate,
  formatNPR,
} from "../../../common/lib/format";
import { primaryBtn } from "../../../common/styles/formStyles";

const AdvancePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: advances = [], isLoading } = useAdvances();
  const create = useCreateAdvance();

  const close = () => {
    setIsOpen(false);
    create.reset();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Advances</h1>
        <button
          onClick={() => setIsOpen(true)}
          className={`${primaryBtn} flex items-center gap-1.5`}
        >
          <Plus size={14} /> Give advance
        </button>
      </div>

      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium w-56">Recovered</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Given</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-[#7E93A6]">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && advances.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-[#7E93A6]">
                  No advances yet.
                </td>
              </tr>
            )}
            {advances.map((a) => {
              const recovered = a.amount - a.outstandingBalance;
              const pct =
                a.amount > 0 ? Math.round((recovered / a.amount) * 100) : 0;
              const isOpenRow = expanded === a._id;
              return (
                <Fragment key={a._id}>
                  <tr className="border-b border-[#233647] last:border-0">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(isOpenRow ? null : a._id)}
                        className="text-[#7E93A6] hover:text-[#E6ECF1]"
                        aria-label="Toggle deductions"
                      >
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${isOpenRow ? "rotate-90" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">{employeeLabel(a.employeeId)}</td>
                    <td className="px-4 py-3">{formatNPR(a.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="h-1.5 w-full rounded-full bg-[#233647]">
                        <div
                          className="h-1.5 rounded-full bg-[#C89B4C]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-[#7E93A6]">{pct}%</div>
                    </td>
                    <td className="px-4 py-3">
                      {formatNPR(a.outstandingBalance)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">{formatDate(a.createdAt)}</td>
                  </tr>

                  {isOpenRow && (
                    <tr className="border-b border-[#233647] bg-[#0F1B26]/40">
                      <td />
                      <td colSpan={6} className="px-4 py-3">
                        {a.deductions.length === 0 ? (
                          <p className="text-xs text-[#7E93A6]">
                            No deductions yet.
                          </p>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {a.deductions.map((d, i) => (
                              <li key={i} className="flex gap-6 text-[#7E93A6]">
                                <span className="w-28">
                                  {formatDate(d.date)}
                                </span>
                                <span className="text-[#E6ECF1]">
                                  {formatNPR(d.amount)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdvanceForm
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

export default AdvancePage;
