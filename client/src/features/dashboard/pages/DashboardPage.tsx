import AsideNav from "../components/AsideNav";
import Dashboard from "../components/Dashboard";

const DashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1B26] text-[#E6ECF1]">
      <AsideNav />
      <main className="min-w-0 overflow-y-auto scrollbar-thin">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
