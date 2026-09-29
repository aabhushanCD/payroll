import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useRun } from "../hooks/usePayrollRuns";
import RunDetailSummary from "../components/RunDetailSummary";
import PayslipViewer from "../components/PayslipViewer";

const PayrollRunDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: run, isLoading, error } = useRun(id ?? "");

  if (isLoading) return <div className="p-6 text-[#7E93A6]">Loading…</div>;
  if (error || !run)
    return (
      <div className="p-6 text-[#E38080]">Could not load this payroll run.</div>
    );

  return (
    <div className="p-6 space-y-6">
      <Link
        to="/payroll"
        className="flex items-center gap-1.5 text-xs text-[#7E93A6] hover:text-[#E6ECF1]"
      >
        <ArrowLeft size={14} /> Back to runs
      </Link>

      <RunDetailSummary run={run} />
      <PayslipViewer runId={run._id} />
    </div>
  );
};

export default PayrollRunDetailPage;
