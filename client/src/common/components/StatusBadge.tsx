const colors: Record<string, string> = {
  ACTIVE: "bg-green-500/15 text-green-400",
  PENDING: "bg-[#C89B4C]/15 text-[#C89B4C]",
  APPLIED: "bg-blue-500/15 text-blue-400",
  SETTLED: "bg-[#233647] text-[#7E93A6]",
  STOPPED: "bg-[#233647] text-[#7E93A6]",
  SSF: "bg-indigo-500/15 text-indigo-300",
  NON_SSF: "bg-orange-500/15 text-orange-300",
  SECRET: "bg-[#E38080]/15 text-[#E38080]",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
      colors[status] ?? "bg-[#233647] text-[#7E93A6]"
    }`}
  >
    {status.replace("_", "-")}
  </span>
);

export default StatusBadge;
