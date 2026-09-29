import { useState } from "react";
import type { PayrollRun } from "../types";
import {
  formatDate,
  formatNPR,
  employeeLabel,
} from "../../../common/lib/format";
import StatusBadge from "../../../common/components/StatusBadge";

const RunDetailSummary = ({ run }: { run: PayrollRun }) => {
  const [admin, setAdmin] = useState(false);

  const gross = admin ? run.grossEarningsAdmin : run.grossEarningsVisible;
  const visibleAllowances = run.allowances.filter((a) => !a.isSecret);
  const secretAllowances = run.allowances.filter((a) => a.isSecret);
  const allReimbursements = [
    ...run.oneTimeReimbursements,
    ...run.recurringReimbursements,
  ];

  const deductionLines = [
    { label: "SSF employee", amount: run.ssfEmployeeContribution },
    { label: "Security fund", amount: run.securityFundDeduction },
    ...(run.advanceRecovery > 0
      ? [{ label: "Advance recovery", amount: run.advanceRecovery }]
      : []),
    { label: "Income tax (TDS)", amount: run.incomeTax },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">
            {employeeLabel(run.employeeId)}{" "}
            <span className="text-[#7E93A6] font-normal">
              ({formatDate(run.periodStart)} – {formatDate(run.periodEnd)})
            </span>
          </h2>
          <div className="mt-1 flex gap-2">
            <StatusBadge status={run.ssfStatus} />
            <StatusBadge status={run.status} />
            <span className="text-xs text-[#7E93A6] self-center">
              {run.configSnapshot.fiscalYear}
            </span>
          </div>
        </div>

        <button
          onClick={() => setAdmin((v) => !v)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            admin
              ? "bg-[#C89B4C] text-[#0F1B26] font-semibold"
              : "bg-[#152331] border border-[#233647] text-[#7E93A6]"
          }`}
        >
          {admin ? "Showing admin figures" : "Show admin figures"}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          ["Gross", gross],
          ["Deductions", run.totalDeductionsVisible],
          ["Net pay", run.netPay],
          ["Employer cost", run.totalEmployerCost],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-lg border border-[#233647] bg-[#152331] p-4"
          >
            <div className="text-xs text-[#7E93A6]">{label}</div>
            <div className="mt-1 text-lg font-semibold">
              {formatNPR(value as number)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#233647] bg-[#152331] p-4">
          <h3 className="text-xs font-medium text-[#7E93A6] mb-2">Earnings</h3>

          <div className="flex justify-between text-sm py-1">
            <span>Basic salary</span>
            <span>{formatNPR(run.basicSalary)}</span>
          </div>

          {visibleAllowances.map((a, i) => (
            <div key={`va-${i}`} className="flex justify-between text-sm py-1">
              <span>{a.name}</span>
              <span>{formatNPR(a.amount)}</span>
            </div>
          ))}

          {run.overtimePay > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span>Overtime ({run.hoursWorked}h)</span>
              <span>{formatNPR(run.overtimePay)}</span>
            </div>
          )}

          {allReimbursements.map((r, i) => (
            <div key={`re-${i}`} className="flex justify-between text-sm py-1">
              <span>{r.label}</span>
              <span>{formatNPR(r.amount)}</span>
            </div>
          ))}

          {admin && secretAllowances.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[#233647] space-y-1">
              {secretAllowances.map((a, i) => (
                <div
                  key={`sa-${i}`}
                  className="flex justify-between text-sm py-1"
                >
                  <span className="flex items-center gap-1.5">
                    {a.name}
                    <span className="rounded-full bg-[#E38080]/15 px-1.5 py-0 text-[10px] text-[#E38080]">
                      Secret
                    </span>
                  </span>
                  <span>{formatNPR(a.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[#233647] bg-[#152331] p-4">
          <h3 className="text-xs font-medium text-[#7E93A6] mb-2">
            Deductions
          </h3>
          {deductionLines.map((d, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{d.label}</span>
              <span>{formatNPR(d.amount)}</span>
            </div>
          ))}

          {admin && (
            <div className="flex justify-between text-sm py-1 text-[#7E93A6] border-t border-[#233647] mt-2 pt-2">
              <span>SSF employer (cost only, not deducted)</span>
              <span>{formatNPR(run.ssfEmployerContribution)}</span>
            </div>
          )}

          <div className="text-xs text-[#7E93A6] mt-3 pt-3 border-t border-[#233647] space-y-0.5">
            <div className="flex justify-between">
              <span>Monthly taxable income</span>
              <span>{formatNPR(run.monthlyTaxableIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Annualized</span>
              <span>{formatNPR(run.annualizedTaxableIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Annual tax</span>
              <span>{formatNPR(run.annualTax)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunDetailSummary;
