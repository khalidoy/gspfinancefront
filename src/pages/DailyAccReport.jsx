import React, { useState } from "react";
import axios from "axios";

import {
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  Modal,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faDownload } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autoTable plugin for jsPDF
import "react-datepicker/dist/react-datepicker.css";
import "./DailyAccReport.css";
import moment from "moment";

function DailyAccReport() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});

  // Handle report fetching based on date range
  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select a valid date range");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/dailyacc/daily_accounting_report",
        {
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        }
      );
      setReportData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to fetch report");
      setLoading(false);
    }
  };

  // Handle modal opening
  const handleShowModal = (data) => {
    setModalData(data);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Calculate totals
  const totalPayments = reportData.reduce(
    (acc, curr) => acc + curr.total_payments,
    0
  );
  const totalExpenses = reportData.reduce(
    (acc, curr) => acc + curr.total_expenses,
    0
  );
  const totalNetProfit = reportData.reduce(
    (acc, curr) => acc + curr.net_profit,
    0
  );

  // Handle PDF generation
  const handleDownloadPDF = () => {
    const doc = new jsPDF("portrait", "pt", "A4");
    const title = "Daily Accounting Report";
    const fromDate = moment(startDate).format("YYYY-MM-DD");
    const toDate = moment(endDate).format("YYYY-MM-DD");

    // Add title
    doc.setFontSize(18);
    doc.text(title, 40, 40);

    // Add date information
    doc.setFontSize(12);
    doc.text(`From: ${fromDate} To: ${toDate}`, 40, 60);

    // Table Header
    const headers = [
      ["Date", "Total Payments (DH)", "Total Expenses (DH)", "Net Profit (DH)"],
    ];
    const data = reportData.map((row) => [
      moment(row.date).format("YYYY-MM-DD"),
      row.total_payments.toFixed(2),
      row.total_expenses.toFixed(2),
      row.net_profit.toFixed(2),
    ]);

    // Add table to PDF using autoTable
    doc.autoTable({
      head: headers,
      body: data,
      startY: 80,
    });

    // Add totals row
    doc.text(
      `Total Payments: ${totalPayments.toFixed(2)} DH`,
      40,
      doc.lastAutoTable.finalY + 20
    );
    doc.text(
      `Total Expenses: ${totalExpenses.toFixed(2)} DH`,
      40,
      doc.lastAutoTable.finalY + 40
    );
    doc.text(
      `Net Profit: ${totalNetProfit.toFixed(2)} DH`,
      40,
      doc.lastAutoTable.finalY + 60
    );

    // Save the PDF
    doc.save(`daily_accounting_report_${fromDate}_to_${toDate}.pdf`);
  };

  return (
    <div className="daily-acc-container">
      <h1 className="daily-acc-title">Daily Accounting Report</h1>

      {/* Filtering Area in a Beautiful Container */}
      <div className="filter-container shadow p-4 mb-4 bg-white rounded">
        <h5>Filter by Date Range</h5>
        <Row>
          <Col md={5}>
            <Form.Label>From Date:</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faCalendarAlt} />
              </InputGroup.Text>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="date-picker form-control"
              />
            </InputGroup>
          </Col>
          <Col md={5}>
            <Form.Label>To Date:</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faCalendarAlt} />
              </InputGroup.Text>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="date-picker form-control"
              />
            </InputGroup>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button onClick={fetchReport} disabled={!startDate || !endDate}>
              Get Report
            </Button>
          </Col>
        </Row>
      </div>

      {/* Display Loading Spinner */}
      {loading && (
        <div className="spinner-container">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Display Error Message */}
      {error && (
        <Alert className="alert-container" variant="danger">
          {error}
        </Alert>
      )}

      {/* Display Report Table */}
      {!loading && !error && reportData.length > 0 && (
        <div id="report-table">
          <Table className="daily-acc-table" bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Payments</th>
                <th>Total Expenses</th>
                <th>Net Profit</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.date}>
                  <td>{moment(row.date).format("YYYY-MM-DD")}</td>
                  <td>{row.total_payments.toFixed(2)} DH</td>
                  <td>{row.total_expenses.toFixed(2)} DH</td>
                  <td>{row.net_profit.toFixed(2)} DH</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleShowModal(row)}
                    >
                      Show Details
                    </Button>
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="totals-row">
                <td>
                  <strong>Totals</strong>
                </td>
                <td>
                  <strong>{totalPayments.toFixed(2)} DH</strong>
                </td>
                <td>
                  <strong>{totalExpenses.toFixed(2)} DH</strong>
                </td>
                <td>
                  <strong>{totalNetProfit.toFixed(2)} DH</strong>
                </td>
                <td></td> {/* No button for totals row */}
              </tr>
            </tbody>
          </Table>

          {/* Download PDF Button */}
          <Button className="mt-3 download-button" onClick={handleDownloadPDF}>
            <FontAwesomeIcon icon={faDownload} /> Download PDF
          </Button>
        </div>
      )}

      {/* Modal for Showing Detailed Info */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Daily Accounting Details for{" "}
            {moment(modalData.date).format("YYYY-MM-DD")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                <h5>Payments:</h5>
                {modalData.details &&
                modalData.details.payments &&
                modalData.details.payments.length > 0 ? (
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.details.payments.map((payment, index) => (
                        <tr key={index}>
                          <td>{payment.student_name}</td>
                          <td>{payment.amount.toFixed(2)} DH</td>
                          <td>{payment.payment_type}</td>
                          <td>{moment(payment.date).format("YYYY-MM-DD")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No payments available</p>
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                <h5>Expenses:</h5>
                {modalData.details &&
                modalData.details.daily_expenses &&
                modalData.details.daily_expenses.length > 0 ? (
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.details.daily_expenses.map(
                        (expense, index) => (
                          <tr key={index}>
                            <td>{expense.description}</td>
                            <td>{expense.amount.toFixed(2)} DH</td>
                            <td>{moment(expense.date).format("YYYY-MM-DD")}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                ) : (
                  <p>No expenses available</p>
                )}
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DailyAccReport;
