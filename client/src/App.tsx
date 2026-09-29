import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import DashboardPage from "./features/dashboard/pages/DashboardPage";

import Employees from "./features/employee/pages/EmployeePage";
import Allowances from "./features/allowance/pages/AllowancePage";
import SalaryPage from "./features/salaries/pages/SalaryPage";
import PayrollConfigPage from "./features/payrollConfig/pages/PayrollConfigPage";
import AdvancePage from "./features/advance/pages/AdvancePage";
import ReimbursementPage from "./features/reimbursement/pages/ReimbursementPage";
import RunPayrollPage from "./features/payroll/pages/RunPayrollPage";
import PayrollRunDetailPage from "./features/payroll/pages/PayrollRunDetailPage";
import PayrollRunsPage from "./features/payroll/pages/PayrollRunsPage";
import DashboardHome from "./features/dashboard/pages/DashboardHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />}>
          <Route index element={<DashboardHome />} />
          <Route path="employees" element={<Employees />} />
          <Route path="allowances" element={<Allowances />} />
          <Route path="salaries" element={<SalaryPage />} />
          <Route path="payroll-config" element={<PayrollConfigPage />} />
          <Route path="advances" element={<AdvancePage />} />
          <Route path="reimbursements" element={<ReimbursementPage />} />
          <Route path="payroll/" element={<PayrollRunsPage />} />
          <Route path="payroll/run/" element={<RunPayrollPage />} />
          <Route path="payroll/:id" element={<PayrollRunDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
