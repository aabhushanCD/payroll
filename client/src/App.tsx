import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import DashboardPage from "./features/dashboard/pages/DashboardPage";

import Employees from "./features/employee/pages/EmployeePage";
import Allowances from "./features/allowance/pages/AllowancePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/allowances" element={<Allowances />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
