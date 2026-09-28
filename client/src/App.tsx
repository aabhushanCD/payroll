import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import DashboardPage from "./features/dashboard/pages/DashboardPage";

import Employees from "./features/employee/pages/EmployeePage";
import Allowances from "./features/allowance/pages/AllowancePage";
import SalaryPage from "./features/salaries/pages/SalaryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/allowances" element={<Allowances />} />
        <Route path="/salaries" element={<SalaryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
