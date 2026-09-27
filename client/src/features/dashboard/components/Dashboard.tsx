import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Users,
  Clock3,
  FileWarning,
  MoreHorizontal,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const STATS: Stat[] = [
  {
    label: "Total payroll (Sep)",
    value: "Rs.284,120",
    delta: "4.2%",
    trend: "up",
    icon: Banknote,
  },
  {
    label: "Employees paid",
    value: "146",
    delta: "2 new",
    trend: "up",
    icon: Users,
  },
  {
    label: "Pending approvals",
    value: "5",
    delta: "1.1%",
    trend: "down",
    icon: Clock3,
  },
  {
    label: "Compliance flags",
    value: "2",
    delta: "3 resolved",
    trend: "down",
    icon: FileWarning,
  },
];

type Run = {
  period: string;
  employees: number;
  amount: string;
  status: "Paid" | "Processing" | "Scheduled";
  date: string;
};

const RUNS: Run[] = [
  {
    period: "Sep 16 – Sep 30",
    employees: 146,
    amount: "Rs.142,300",
    status: "Scheduled",
    date: "Oct 1",
  },
  {
    period: "Sep 1 – Sep 15",
    employees: 144,
    amount: "Rs.139,820",
    status: "Paid",
    date: "Sep 16",
  },
  {
    period: "Aug 16 – Aug 31",
    employees: 141,
    amount: "Rs.136,910",
    status: "Paid",
    date: "Sep 1",
  },
  {
    period: "Aug 1 – Aug 15",
    employees: 141,
    amount: "Rs.135,600",
    status: "Paid",
    date: "Aug 16",
  },
];

const STATUS_STYLES: Record<Run["status"], string> = {
  Paid: "bg-[#1E3A2E] text-[#7FD8A4]",
  Processing: "bg-[#3A2E1B] text-[#E3B15C]",
  Scheduled: "bg-[#1B2C3D] text-[#9FB2C2]",
};

const ACTIVITY = [
  { who: "Priya Nair", what: "approved off-cycle payment", when: "12m ago" },
  {
    who: "System",
    what: "flagged a missing W-4 for a new hire",
    when: "1h ago",
  },
  { who: "Marcus Lee", what: "updated direct deposit details", when: "3h ago" },
  { who: "System", what: "completed tax filing for Q3", when: "Yesterday" },
];

const Dashboard = () => {
  return (
    <main className="min-h-screen bg-[#0F1B26] text-[#E6ECF1] p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[#7E93A6]">
            Overview of payroll for September 2026
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#C89B4C] text-[#0F1B26] text-sm font-semibold hover:opacity-90 transition-opacity">
          <Banknote size={16} strokeWidth={2} />
          Run payroll
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          const trendColor =
            stat.trend === "up" ? "text-[#7FD8A4]" : "text-[#E38080]";
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-[#233647] bg-[#152331] p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#7E93A6]">{stat.label}</span>
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">{stat.value}</span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}
                >
                  <TrendIcon size={13} strokeWidth={2} />
                  {stat.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payroll runs + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Runs table */}
        <div className="lg:col-span-2 rounded-lg border border-[#233647] bg-[#152331]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
            <h2 className="text-sm font-semibold">Payroll runs</h2>
            <button className="text-xs text-[#7E93A6] hover:text-[#9FB2C2]">
              View all
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#7E93A6]">
                <th className="font-medium px-5 py-3">Pay period</th>
                <th className="font-medium px-5 py-3">Employees</th>
                <th className="font-medium px-5 py-3">Amount</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3">Pay date</th>
              </tr>
            </thead>
            <tbody>
              {RUNS.map((run) => (
                <tr
                  key={run.period}
                  className="border-t border-[#233647] hover:bg-[#1B2C3D] transition-colors"
                >
                  <td className="px-5 py-3">{run.period}</td>
                  <td className="px-5 py-3 text-[#7E93A6]">{run.employees}</td>
                  <td className="px-5 py-3 font-medium">{run.amount}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium rounded-full px-2 py-1 ${STATUS_STYLES[run.status]}`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#7E93A6]">{run.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity feed */}
        <div className="rounded-lg border border-[#233647] bg-[#152331]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#233647]">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <button className="text-[#7E93A6] hover:text-[#9FB2C2]">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <ul className="p-5 space-y-4">
            {ACTIVITY.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C89B4C] mt-2 shrink-0" />
                <p className="text-sm leading-snug">
                  <span className="font-medium">{item.who}</span>{" "}
                  <span className="text-[#7E93A6]">{item.what}</span>
                  <span className="block text-xs text-[#7E93A6] mt-0.5">
                    {item.when}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
