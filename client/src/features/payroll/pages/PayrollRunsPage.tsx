import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { useRuns } from "../hooks/usePayrollRuns";
import {
  formatDate,
  formatNPR,
  employeeLabel,
} from "../../../common/lib/format";
import StatusBadge from "../../../common/components/StatusBadge";
import { fieldClass } from "../../../common/styles/formStyles";

const PayrollRunsPage = () => {
  const [periodMonth, setPeriodMonth] = useState("");
  const [ssfStatus, setSsfStatus] = useState<"ALL" | "SSF" | "NON_SSF">("ALL");

  const { data: runs = [], isLoading } = useRuns(
    periodMonth || undefined,
    ssfStatus,
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Payroll runs</h1>

      <div className="flex gap-3">
        <input
          type="month"
          value={periodMonth}
          onChange={(e) => setPeriodMonth(e.target.value)}
          className={`${fieldClass} w-44`}
        />
        <div className="relative w-40">
          <select
            value={ssfStatus}
            onChange={(e) => setSsfStatus(e.target.value as typeof ssfStatus)}
            className={`${fieldClass} appearance-none pr-8`}
          >
            <option value="ALL">All employees</option>
            <option value="SSF">SSF only</option>
            <option value="NON_SSF">Non-SSF only</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E93A6] pointer-events-none"
          />
        </div>
      </div>

      <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-[#7E93A6] border-b border-[#233647]">
            <tr>
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Group</th>
              <th className="px-4 py-3 font-medium">Net pay</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Run on</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-[#7E93A6]">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && runs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-[#7E93A6]">
                  No runs found.
                </td>
              </tr>
            )}
            {runs.map((r) => (
              <tr
                key={r._id}
                className="border-b border-[#233647] last:border-0 hover:bg-[#0F1B26]/40"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/payroll/${r._id}`}
                    className="text-[#C89B4C] hover:underline"
                  >
                    {r.employeeName ?? employeeLabel(r.employeeId)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.ssfStatus} />
                </td>
                <td className="px-4 py-3">{formatNPR(r.netPay)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollRunsPage;
