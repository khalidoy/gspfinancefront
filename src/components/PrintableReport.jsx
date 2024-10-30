// src/components/PrintableReport.jsx
import React from "react";
import { Table } from "react-bootstrap";
import "../components/PrintableReport.css"; // Ensure the path is correct

const PrintableReport = React.forwardRef(
  (
    { date, payments, expenses, totalPayments, totalExpenses, netProfit },
    ref
  ) => {
    return (
      <div ref={ref} className="printable-report">
        <h1 style={{ textAlign: "center" }}>Daily Accounting Report</h1>
        <h2 style={{ textAlign: "center" }}>{date}</h2>

        <div
          className="summary"
          style={{ marginTop: "20px", marginBottom: "40px" }}
        >
          <h3>Summary</h3>
          <Table bordered>
            <tbody>
              <tr>
                <th>Total Payments (DH)</th>
                <td>{totalPayments.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Total Expenses (DH)</th>
                <td>{totalExpenses.toFixed(2)}</td>
              </tr>
              <tr>
                <th>Net Profit (DH)</th>
                <td>{netProfit.toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </div>

        <div className="payments" style={{ marginBottom: "40px" }}>
          <h3>Payments</h3>
          <Table striped bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Amount (DH)</th>
                <th>Type</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr key={payment.id}>
                  <td>{idx + 1}</td>
                  <td>{payment.student}</td>
                  <td>{parseFloat(payment.amount).toFixed(2)} DH</td>
                  <td>{payment.payment_type}</td>
                  <td>{payment.month}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="expenses" style={{ marginBottom: "40px" }}>
          <h3>Expenses</h3>
          <Table striped bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Expense Type</th>
                <th>Amount (DH)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, idx) => (
                <tr key={expense.id}>
                  <td>{idx + 1}</td>
                  <td>{expense.description}</td>
                  <td>{parseFloat(expense.amount).toFixed(2)} DH</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
);

export default PrintableReport;
