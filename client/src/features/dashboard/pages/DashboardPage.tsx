import { Outlet } from "react-router";
import AsideNav from "../components/AsideNav";

const DashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1B26] text-[#E6ECF1]">
      <AsideNav />
      <main className="min-w-0 flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardPage;
