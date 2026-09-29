import { Users, Banknote, CircleDollarSign, PlayCircle } from "lucide-react";
import { Link } from "react-router";

import { useCurrentConfig } from "../../payrollConfig/hooks/usePayrollConfig";
import { useRuns } from "../../payroll/hooks/usePayrollRuns";
import { useAdvances } from "../../advance/hooks/useAdvances";
import StatCard from "../../../common/components/StatCard";
import { formatNPR } from "../../../common/lib/format";
import { primaryBtn } from "../../../common/styles/formStyles";
import { useEmployeesQuery } from "../../employee/hooks/useEmployees";

const currentMonth = new Date().toISOString().slice(0, 7);

const DashboardHome = () => {
  const { data: employees = [] } = useEmployeesQuery();
  const { data: config } = useCurrentConfig();
  const { data: runs = [] } = useRuns(currentMonth, "ALL");
  const { data: advances = [] } = useAdvances();

  const active = employees.filter((e) => e.status === "ACTIVE");
  const ssfCount = active.filter((e) => e.ssfStatus === "SSF").length;
  const netThisMonth = runs.reduce((s, r) => s + r.netPay, 0);
  const outstanding = advances
    .filter((a) => a.status === "ACTIVE")
    .reduce((s, a) => s + a.outstandingBalance, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Link
          to="/payroll/run"
          className={`${primaryBtn} flex items-center gap-1.5`}
        >
          <PlayCircle size={14} /> Run payroll
        </Link>
      </div>

      {!config && (
        <div className="rounded-md border border-[#C89B4C]/40 bg-[#C89B4C]/10 px-4 py-3 text-sm text-[#C89B4C]">
          No payroll config is active for today.{" "}
          <Link to="/payroll-config" className="underline">
            Add a fiscal year
          </Link>{" "}
          before running payroll.
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Active employees"
          value={String(active.length)}
          hint={`${ssfCount} SSF · ${active.length - ssfCount} non-SSF`}
          icon={Users}
        />
        <StatCard
          label="This month's runs"
          value={String(runs.length)}
          hint={`out of ${active.length} employees`}
          icon={PlayCircle}
        />
        <StatCard
          label="Net pay this month"
          value={formatNPR(netThisMonth)}
          icon={Banknote}
        />
        <StatCard
          label="Outstanding advances"
          value={formatNPR(outstanding)}
          hint={`${advances.filter((a) => a.status === "ACTIVE").length} active`}
          icon={CircleDollarSign}
        />
      </div>

      <div className="rounded-lg border border-[#233647] bg-[#152331] p-4">
        <h2 className="text-xs font-medium text-[#7E93A6] mb-3">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ["Payroll runs", "/payroll"],
            ["Salaries", "/salaries"],
            ["Advances", "/advances"],
            ["Reimbursements", "/reimbursements"],
            ["Employees", "/employees"],
          ].map(([label, path]) => (
            <Link
              key={path}
              to={path}
              className="rounded-md border border-[#233647] px-3 py-1.5 text-xs text-[#7E93A6] hover:text-[#E6ECF1] hover:border-[#C89B4C]/40"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
