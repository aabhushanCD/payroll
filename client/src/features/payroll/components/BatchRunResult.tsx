import type { BatchRunResult as Result } from "../types";
import { formatNPR } from "../../../common/lib/format";

const Section = ({
  title,
  color,
  items,
  renderRight,
}: {
  title: string;
  color: string;
  items: { employeeId: string; employeeName?: string }[];
  renderRight: (item: any) => React.ReactNode;
}) => (
  <div>
    <h3 className={`text-xs font-medium mb-2 ${color}`}>
      {title} ({items.length})
    </h3>
    {items.length === 0 ? (
      <p className="text-xs text-[#7E93A6]">None.</p>
    ) : (
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.employeeId}
            className="flex justify-between text-sm py-1"
          >
            <span>{item.employeeName ?? item.employeeId}</span>
            {renderRight(item)}
          </div>
        ))}
      </div>
    )}
  </div>
);

const BatchRunResult = ({ result }: { result: Result }) => (
  <div className="rounded-lg border border-[#233647] bg-[#152331] p-4 space-y-5">
    <Section
      title="Succeeded"
      color="text-green-400"
      items={result.succeeded}
      renderRight={(item) => (
        <span className="text-[#7E93A6]">
          {typeof item.netPay === "number" ? formatNPR(item.netPay) : "Done"}
        </span>
      )}
    />
    <Section
      title="Skipped"
      color="text-[#7E93A6]"
      items={result.skipped}
      renderRight={(item) => (
        <span className="text-[#7E93A6]">{item.reason}</span>
      )}
    />
    <Section
      title="Failed"
      color="text-[#E38080]"
      items={result.failed}
      renderRight={(item) => (
        <span className="text-[#E38080]">{item.reason}</span>
      )}
    />
  </div>
);

export default BatchRunResult;
