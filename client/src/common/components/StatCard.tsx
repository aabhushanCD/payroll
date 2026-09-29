type Props = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const StatCard = ({ label, value, hint, icon: Icon }: Props) => (
  <div className="rounded-lg border border-[#233647] bg-[#152331] p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#7E93A6]">{label}</span>
      <Icon size={16} strokeWidth={1.75} className="text-[#7E93A6]" />
    </div>
    <div className="mt-2 text-xl font-semibold text-[#E6ECF1]">{value}</div>
    {hint && <div className="mt-1 text-xs text-[#7E93A6]">{hint}</div>}
  </div>
);

export default StatCard;
