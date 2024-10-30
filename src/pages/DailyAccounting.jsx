// src/pages/DailyAccounting.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Table,
  Button,
  Alert,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import axios from "axios"; // Axios for API calls
import { FaDownload } from "react-icons/fa"; // Import download icon
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./DailyAccounting.css"; // Import your CSS file

const API_BASE_URL = "http://127.0.0.1:5000/accounting"; // Adjust the URL according to your backend

function DailyAccounting() {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validateLoading, setValidateLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false); // New state for download loading

  const reportRef = useRef(); // Reference for the visible report section
  const downloadRef = useRef(); // Reference for the hidden download report section

  // Get today's date and format it
  const todayDate = new Date().toLocaleDateString();

  // Fetch data when the component mounts
  useEffect(() => {
    fetchPaymentsAndExpenses();
    fetchValidationStatus();
  }, []);

  // Function to fetch today's payments and expenses
  const fetchPaymentsAndExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/daily/today`);

      if (response.data.status === "success") {
        const { payments, expenses } = response.data;
        setPayments(payments);
        setExpenses(expenses);

        const totalPay = payments.reduce(
          (sum, payment) => sum + parseFloat(payment.amount),
          0
        );
        const totalExp = expenses.reduce(
          (sum, expense) => sum + parseFloat(expense.amount),
          0
        );

        setTotalPayments(totalPay);
        setTotalExpenses(totalExp);
        setNetProfit(totalPay - totalExp);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch today's payments and expenses.");
      setLoading(false);
    }
  };

  // Function to fetch validation status
  const fetchValidationStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily/status`);

      if (response.data.status === "success") {
        setIsValidated(response.data.isValidated);
        if (response.data.isValidated) {
          setTotalPayments(parseFloat(response.data.total_payments));
          setTotalExpenses(parseFloat(response.data.total_expenses));
          setNetProfit(parseFloat(response.data.net_profit));
        }
      }
    } catch (error) {
      console.error("Error fetching validation status:", error);
      setError("Failed to fetch validation status.");
    }
  };

  // Function to handle the "Validate" button
  const handleValidateAccounting = async () => {
    try {
      setValidateLoading(true);
      const response = await axios.post(`${API_BASE_URL}/daily/validate`);

      if (response.data.status === "success") {
        setSuccess("Daily accounting has been successfully validated.");
        setIsValidated(true);
        fetchPaymentsAndExpenses(); // Optionally refresh the data
      } else {
        setError("Failed to validate daily accounting.");
      }
      setValidateLoading(false);
    } catch (error) {
      console.error("Error validating accounting:", error);
      setError(error.response?.data?.message || "Error validating accounting.");
      setValidateLoading(false);
    }
  };

  // Optional: Function to group payments by student
  const groupedPayments = (payments) => {
    const grouped = payments.reduce((acc, payment) => {
      if (!acc[payment.student]) {
        acc[payment.student] = [];
      }
      acc[payment.student].push(payment);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  // Function to handle downloading the report as PDF
  const handleDownload = () => {
    setDownloadLoading(true);
    const input = downloadRef.current;
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Optional: Add page numbers
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 30,
            pdf.internal.pageSize.getHeight() - 10
          );
        }

        pdf.save(`Daily_Accounting_Report_${todayDate}.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        setError("Failed to download the report.");
      })
      .finally(() => {
        setDownloadLoading(false);
      });
  };

  return (
    <Container className="mt-4">
      {/* Main Title with Date */}
      <h1 className="mb-2 text-center">Daily Accounting Report</h1>
      <h2 className="mb-4 text-center">{todayDate}</h2>{" "}
      {/* Subtitle with Date */}
      {/* Display Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {/* Display Success Alert */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}
      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <span className="ml-2">Loading data...</span>
        </div>
      ) : (
        <>
          {/* Visible Report Section */}
          <div ref={reportRef}>
            <Row>
              {/* Payments Table */}
              <Col md={6}>
                <h4>Today's Payments</h4>
                <Table striped bordered hover>
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
                    {groupedPayments(payments).map((group, idx) => (
                      <React.Fragment key={idx}>
                        {group.map((payment, index) => (
                          <tr key={payment.id}>
                            {index === 0 ? (
                              <td rowSpan={group.length}>{idx + 1}</td>
                            ) : null}
                            {index === 0 ? (
                              <td rowSpan={group.length}>{payment.student}</td>
                            ) : null}
                            <td>{parseFloat(payment.amount).toFixed(2)} DH</td>
                            <td>{payment.payment_type}</td>
                            <td>{payment.month}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No payments today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-payments">
                      <td colSpan="2" style={{ textAlign: "right" }}>
                        <strong>Total Payments</strong>
                      </td>
                      <td colSpan="3">{totalPayments.toFixed(2)} DH</td>
                    </tr>
                  </tfoot>
                </Table>
              </Col>

              {/* Expenses Table */}
              <Col md={6}>
                <h4>Today's Expenses</h4>
                <Table striped bordered hover>
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
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No expenses today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-expenses">
                      <td colSpan="2" style={{ textAlign: "right" }}>
                        <strong>Total Expenses</strong>
                      </td>
                      <td>{totalExpenses.toFixed(2)} DH</td>
                    </tr>
                  </tfoot>
                </Table>
              </Col>
            </Row>

            {/* Summary Section - Always Displayed */}
            <div className="mt-4 text-center">
              <h5
                className="net-profit"
                style={{
                  backgroundColor: "yellow",
                  width: "50%",
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                Net Profit: {netProfit.toFixed(2)} DH
              </h5>
            </div>
          </div>

          {/* Hidden Download Report Section */}
          <div className="hidden-download-report" ref={downloadRef}>
            {/* Main Title with Date */}
            <h1 className="mb-2 text-center">Daily Accounting Report</h1>
            <h2 className="mb-4 text-center">{todayDate}</h2>{" "}
            {/* Subtitle with Date */}
            {/* Payments Table */}
            <Row>
              <Col>
                <h4>Today's Payments</h4>
                <Table striped bordered hover>
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
                    {groupedPayments(payments).map((group, idx) => (
                      <React.Fragment key={idx}>
                        {group.map((payment, index) => (
                          <tr key={payment.id}>
                            {index === 0 ? (
                              <td rowSpan={group.length}>{idx + 1}</td>
                            ) : null}
                            {index === 0 ? (
                              <td rowSpan={group.length}>{payment.student}</td>
                            ) : null}
                            <td>{parseFloat(payment.amount).toFixed(2)} DH</td>
                            <td>{payment.payment_type}</td>
                            <td>{payment.month}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No payments today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-payments">
                      <td colSpan="2" style={{ textAlign: "right" }}>
                        <strong>Total Payments</strong>
                      </td>
                      <td colSpan="3">{totalPayments.toFixed(2)} DH</td>
                    </tr>
                  </tfoot>
                </Table>
              </Col>
            </Row>
            {/* Expenses Table */}
            <Row className="mt-4">
              <Col>
                <h4>Today's Expenses</h4>
                <Table striped bordered hover>
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
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No expenses today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-expenses">
                      <td colSpan="2" style={{ textAlign: "right" }}>
                        <strong>Total Expenses</strong>
                      </td>
                      <td>{totalExpenses.toFixed(2)} DH</td>
                    </tr>
                  </tfoot>
                </Table>
              </Col>
            </Row>
            {/* Summary Section - Always Displayed */}
            <div className="mt-4 text-center">
              <h5
                className="net-profit"
                style={{
                  backgroundColor: "yellow",
                  width: "50%",
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                Net Profit: {netProfit.toFixed(2)} DH
              </h5>
            </div>
            {/* Signature Section - Always Displayed */}
            <div className="signature-section">
              <Row className="mt-5">
                <Col md={6} className="text-center">
                  <div className="signature-line"></div>
                  <p>Authorized Signatory 1</p>
                </Col>
                <Col md={6} className="text-center">
                  <div className="signature-line"></div>
                  <p>Authorized Signatory 2</p>
                </Col>
              </Row>
            </div>
          </div>

          {/* Validate and Download Buttons */}
          <div className="validate-print-buttons mt-3 text-center">
            {/* Validate Button */}
            <Button
              className="validate"
              onClick={handleValidateAccounting}
              style={{ marginRight: 10, marginBottom: 30 }}
              disabled={isValidated || validateLoading}
            >
              {validateLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  &nbsp;Validating...
                </>
              ) : isValidated ? (
                "Validated"
              ) : (
                "Validate Daily Accounting"
              )}
            </Button>

            {/* Download Report Button - Visible Only After Validation */}
            {isValidated && (
              <Button
                className="download"
                style={{ marginBottom: 30 }}
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    &nbsp;Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload style={{ marginRight: "5px" }} />
                    Download Report
                  </>
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </Container>
  );
}

export default DailyAccounting;