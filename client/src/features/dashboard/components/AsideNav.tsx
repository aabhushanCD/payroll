import { useState } from "react";
import {
  LayoutGrid,
  Banknote,
  History,
  CalendarClock,
  Users,
  Briefcase,
  Clock,
  FileBarChart,
  FileText,
  HeartPulse,
  Settings,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutGrid }],
  },
  {
    label: "Payroll",
    items: [
      { label: "Run payroll", icon: Banknote, badge: "2" },
      { label: "Pay history", icon: History },
      { label: "Off-cycle payments", icon: CalendarClock },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Employees", icon: Users },
      { label: "Contractors", icon: Briefcase },
      { label: "Time & attendance", icon: Clock },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Reports", icon: FileBarChart },
      { label: "Tax filings", icon: FileText },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Benefits", icon: HeartPulse },
      { label: "Settings", icon: Settings },
    ],
  },
];

const AsideNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true])),
  );

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside
      className={`h-screen flex flex-col justify-between bg-[#0F1B26] border-r border-[#233647] font-sans transition-[width] duration-150 ${
        collapsed ? "w-19" : "w-64"
      }`}
    >
      <div className="min-h-0 overflow-y-auto  scrollbar-thin">
        {/* Brand */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-[#233647]">
          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-sm bg-[#C89B4C] text-[#0F1B26] text-sm font-semibold">
            L
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[#E6ECF1]">Ledger</div>
              <div className="text-xs text-[#7E93A6]">Payroll</div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-[#7E93A6] hover:text-[#9FB2C2]"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-100 ${
                      openGroups[group.label] ? "" : "-rotate-90"
                    }`}
                  />
                </button>
              )}

              {(collapsed || openGroups[group.label]) && (
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.label;
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => setActive(item.label)}
                          title={collapsed ? item.label : undefined}
                          className={`w-full flex items-center gap-3 pl-3 pr-3 py-2 rounded-r-md border-l-2 text-sm transition-colors ${
                            isActive
                              ? "bg-[#1B2C3D] border-[#C89B4C] text-[#E6ECF1]"
                              : "border-transparent text-[#7E93A6] hover:bg-[#152331] hover:text-[#9FB2C2]"
                          }`}
                        >
                          <Icon size={17} strokeWidth={1.75} />
                          {!collapsed && (
                            <span className="flex-1 text-left truncate">
                              {item.label}
                            </span>
                          )}
                          {!collapsed && item.badge && (
                            <span className="text-[11px] leading-none font-semibold rounded-full px-1.5 py-0.5 bg-[#C89B4C] text-[#0F1B26]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer: user + collapse toggle */}
      <div className="p-3 border-t border-[#233647] space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-[#1B2C3D] text-[#E6ECF1] text-xs font-medium">
            JD
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-sm font-medium text-[#E6ECF1] truncate">
                Jordan Diaz
              </div>
              <div className="text-xs text-[#7E93A6] truncate">
                Payroll admin
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#7E93A6] hover:bg-[#152331] hover:text-[#9FB2C2]"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default AsideNav;
