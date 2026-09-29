import { useActiveAdvances } from "../../advance/hooks/useAdvances";
import { usePayableReimbursements } from "../../reimbursement/hooks/useReimbursements";
import { formatNPR } from "../../../common/lib/format";

const EmployeeContextPanel = ({ employeeId }: { employeeId: string }) => {
  const { data: advances = [], isLoading: loadingAdv } =
    useActiveAdvances(employeeId);
  const { data: reimbursements = [], isLoading: loadingReimb } =
    usePayableReimbursements(employeeId);

  if (!employeeId) {
    return (
      <div className="rounded-lg border border-[#233647] bg-[#152331] p-4 text-xs text-[#7E93A6]">
        Select an employee to see what this run will include.
      </div>
    );
  }

  const totalOutstanding = advances.reduce(
    (s, a) => s + a.outstandingBalance,
    0,
  );
  const totalReimb = reimbursements.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="rounded-lg border border-[#233647] bg-[#152331] p-4 space-y-4">
      <div>
        <h3 className="text-xs font-medium text-[#7E93A6] mb-2">
          Active advances
        </h3>
        {loadingAdv && <p className="text-xs text-[#7E93A6]">Loading…</p>}
        {!loadingAdv && advances.length === 0 && (
          <p className="text-xs text-[#7E93A6]">None.</p>
        )}
        {advances.map((a) => (
          <div key={a._id} className="flex justify-between text-sm py-1">
            <span className="text-[#7E93A6]">Given {formatNPR(a.amount)}</span>
            <span>{formatNPR(a.outstandingBalance)} left</span>
          </div>
        ))}
        {advances.length > 0 && (
          <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[#233647] font-medium">
            <span>Total outstanding</span>
            <span>{formatNPR(totalOutstanding)}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-medium text-[#7E93A6] mb-2">
          Reimbursements this run will pay
        </h3>
        {loadingReimb && <p className="text-xs text-[#7E93A6]">Loading…</p>}
        {!loadingReimb && reimbursements.length === 0 && (
          <p className="text-xs text-[#7E93A6]">None pending.</p>
        )}
        {reimbursements.map((r) => (
          <div key={r._id} className="flex justify-between text-sm py-1">
            <span className="text-[#7E93A6]">
              {r.description ||
                (r.type === "ONE_TIME" ? "One-time" : "Recurring")}
            </span>
            <span>{formatNPR(r.amount)}</span>
          </div>
        ))}
        {reimbursements.length > 0 && (
          <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[#233647] font-medium">
            <span>Total</span>
            <span>{formatNPR(totalReimb)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeContextPanel;
