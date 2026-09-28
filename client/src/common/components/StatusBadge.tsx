const colors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  APPLIED: "bg-blue-100 text-blue-700",
  SETTLED: "bg-gray-100 text-gray-700",
  STOPPED: "bg-gray-100 text-gray-700",
  SSF: "bg-indigo-100 text-indigo-700",
  NON_SSF: "bg-orange-100 text-orange-700",
  SECRET: "bg-red-100 text-red-700",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
      colors[status] ?? "bg-gray-100 text-gray-700"
    }`}
  >
    {status.replace("_", "-")}
  </span>
);
