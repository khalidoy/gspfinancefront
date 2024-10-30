// App.jsx

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DailyExpenses from "./pages/DailyExpenses";
import CustomNavbar from "./components/navbar"; // Assuming your Navbar is named CustomNavbar.jsx
import MonthlyExpenses from "./pages/MonthlyExpenses";
import DailyAccounting from "./pages/DailyAccounting";
import NormalPayments from "./pages/NormalPayments"; // Import the new NormalPayments component
import CreditReport from "./pages/CreditReports"; // Import the new CreditReport component
import DailyAccReport from "./pages/DailyAccReport"; // Import the new DailyAccReport component
import TransportReport from "./pages/TransportReport"; // Import the TransportReport component
import PaymentsReport from "./pages/PaymentsReport"; // Import the PaymentsReport component

function App() {
  return (
    <Router>
      <div>
        <CustomNavbar /> {/* Including the Navbar at the top of the page */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily-expenses" element={<DailyExpenses />} />
          <Route path="/monthly-expenses" element={<MonthlyExpenses />} />
          <Route path="/daily-accounting" element={<DailyAccounting />} />
          <Route path="/reports/normal-payments" element={<NormalPayments />} />
          <Route path="/reports/credit-report" element={<CreditReport />} />
          <Route
            path="/reports/daily-acc-report"
            element={<DailyAccReport />}
          />
          <Route path="/transport-report" element={<TransportReport />} />{" "}
          {/* Add the TransportReport route */}
          <Route path="/payments-report" element={<PaymentsReport />} />{" "}
          {/* Add the PaymentsReport route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
