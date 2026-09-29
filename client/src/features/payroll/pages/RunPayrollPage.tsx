import { useState } from "react";
import SingleRunForm from "../components/SingleRunForm";
import BatchRunForm from "../components/BatchRunForm";
import BatchRunResult from "../components/BatchRunResult";
import { useRunSingle, useRunBatch } from "../hooks/usePayrollRun";
import type { AxiosError } from "axios";

const TABS = ["single", "batch"] as const;

const RunPayrollPage = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]>("single");

  const single = useRunSingle();
  const batch = useRunBatch();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Run payroll</h1>

      <div className="flex gap-1 border-b border-[#233647]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[#C89B4C] text-[#E6ECF1]"
                : "border-transparent text-[#7E93A6] hover:text-[#E6ECF1]"
            }`}
          >
            {t === "single" ? "Single employee" : "Batch"}
          </button>
        ))}
      </div>

      {tab === "single" && (
        <SingleRunForm
          isRunning={single.isPending}
          errorMessage={
            single.error
              ? (single.error as AxiosError<{ message?: string }>).response
                  ?.data?.message
              : undefined
          }
          result={single.data}
          onRun={(input) => single.mutate(input)}
        />
      )}

      {tab === "batch" && (
        <div className="space-y-4">
          <BatchRunForm
            isRunning={batch.isPending}
            errorMessage={
              batch.error ? (batch.error as Error).message : undefined
            }
            onRun={(input) => batch.mutate(input)}
          />
          {batch.data && <BatchRunResult result={batch.data} />}
        </div>
      )}
    </div>
  );
};

export default RunPayrollPage;
