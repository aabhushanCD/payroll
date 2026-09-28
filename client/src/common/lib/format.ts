export const formatNPR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(n);

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// "2026-09" -> { periodStart: "2026-09-01", periodEnd: "2026-09-30" }
export const monthToPeriod = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return {
    periodStart: `${y}-${mm}-01`,
    periodEnd: `${y}-${mm}-${String(last).padStart(2, "0")}`,
  };
};

export const employeeLabel = (id: unknown) => {
  if (typeof id === "object" && id !== null && "name" in id) {
    return String(id.name);
  }
  return "";
};
