import { useState } from "react";
import { Printer } from "lucide-react";
import { payrollRunServices } from "../service/payrollRunService";

const PayslipViewer = ({ runId }: { runId: string }) => {
  const [view, setView] = useState<"employee" | "admin">("employee");
  const url = payrollRunServices.payslipUrl(runId, view);

  const print = () => {
    const frame = document.getElementById(
      "payslip-frame",
    ) as HTMLIFrameElement | null;
    frame?.contentWindow?.print();
  };

  return (
    <div className="rounded-lg border border-[#233647] bg-[#152331] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#233647]">
        <div className="flex gap-1">
          {(["employee", "admin"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                view === v
                  ? "bg-[#C89B4C] text-[#0F1B26] font-semibold"
                  : "bg-[#0F1B26] border border-[#233647] text-[#7E93A6] hover:text-[#E6ECF1]"
              }`}
            >
              {v === "employee" ? "Employee view" : "Admin view"}
            </button>
          ))}
        </div>
        <button
          onClick={print}
          className="flex items-center gap-1.5 text-xs text-[#7E93A6] hover:text-[#E6ECF1]"
        >
          <Printer size={14} /> Print / save PDF
        </button>
      </div>

      <iframe
        id="payslip-frame"
        key={url}
        src={url}
        title="Payslip"
        className="w-full bg-white"
        style={{ height: "80vh", border: "none" }}
      />
    </div>
  );
};

export default PayslipViewer;
