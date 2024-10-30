// src/components/CreditReports.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Form, Button, Modal } from "react-bootstrap";
import "./CreditReports.css";
import html2canvas from "html2canvas";
import moment from "moment"; // For formatting date

function CreditReports() {
  const [schoolYearPeriods, setSchoolYearPeriods] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStudents, setModalStudents] = useState([]);
  const todayDate = moment().format("MMMM Do, YYYY"); // Get today's date

  // Map month numbers to month names
  const monthNames = {
    9: "September",
    10: "October",
    11: "November",
    12: "December",
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
  };

  // Fetch available school year periods on component mount
  useEffect(() => {
    const fetchSchoolYearPeriods = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/schoolyearperiods"
        );
        setSchoolYearPeriods(response.data.data);
      } catch (err) {
        console.error("Error fetching school year periods:", err);
      }
    };

    fetchSchoolYearPeriods();
  }, []);

  // Fetch report data for all months of the selected school year period
  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/creditreports/all_months_report?schoolyear_id=${selectedSchoolYear}`
      );
      setReportData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to fetch report");
      setLoading(false);
    }
  };

  const handleSchoolYearChange = (e) => {
    setSelectedSchoolYear(e.target.value);
  };

  // Handle the modal to show unpaid students for a specific month or payment category
  const handleShowModal = (title, students) => {
    setModalTitle(title);
    setModalStudents(students);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle("");
    setModalStudents([]);
  };

  // Download report as PNG
  const handleDownload = () => {
    const element = document.getElementById("report-container"); // Capture full container
    html2canvas(element).then((canvas) => {
      const link = document.createElement("a");
      link.download = `credit_report_${selectedSchoolYear}_${todayDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="credit-reports-container" id="report-container">
      <h1 className="credit-reports-title">Credit Report</h1>
      <p className="report-date">Date: {todayDate}</p>

      {/* Dropdown for School Year Period selection */}
      <Form.Group controlId="schoolYearSelect">
        <Form.Label>Select School Year Period</Form.Label>
        <Form.Control
          as="select"
          value={selectedSchoolYear}
          onChange={handleSchoolYearChange}
        >
          <option value="">Select a School Year Period</option>
          {schoolYearPeriods.map((period) => (
            <option key={period._id.$oid} value={period._id.$oid}>
              {period.name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Button
        onClick={fetchReport}
        disabled={!selectedSchoolYear}
        className="get-report-button"
      >
        Get Report
      </Button>

      {loading && (
        <div className="spinner-container">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      )}
      {error && (
        <Alert className="alert-container" variant="danger">
          {error}
        </Alert>
      )}
      {!loading && !error && reportData.length > 0 && (
        <div>
          <h2 className="school-year-period">
            School Year Period:{" "}
            {
              schoolYearPeriods.find(
                (period) => period._id.$oid === selectedSchoolYear
              )?.name
            }
          </h2>
          <Table className="credit-reports-table" bordered hover>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Paid (DH)</th>
                <th>Total Left (DH)</th>
                <th>Unpaid Students</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.month}>
                  <td>{monthNames[row.month]}</td>
                  <td>{(row.total_paid || 0).toFixed(2)}</td>
                  <td>{(row.total_left || 0).toFixed(2)}</td>
                  <td>
                    {row.unpaid_students && row.unpaid_students.length > 0 ? (
                      <Button
                        variant="link"
                        onClick={() =>
                          handleShowModal(
                            `Unpaid Students - ${monthNames[row.month]}`,
                            row.unpaid_students
                          )
                        }
                      >
                        Show Unpaid Students
                      </Button>
                    ) : (
                      "None"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button
            className="download-button"
            onClick={handleDownload}
            disabled={!selectedSchoolYear}
          >
            Download
          </Button>
        </div>
      )}

      {/* Modal for Unpaid Students */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalStudents.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Agreed Payment (DH)</th>
                  <th>Real Payment (DH)</th>
                  <th>Agreed Transport (DH)</th>
                  <th>Real Transport (DH)</th>
                </tr>
              </thead>
              <tbody>
                {modalStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.agreed_payment.toLocaleString()} DH</td>
                    <td>{student.real_payment.toLocaleString()} DH</td>
                    <td>{student.agreed_transport.toLocaleString()} DH</td>
                    <td>{student.real_transport.toLocaleString()} DH</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No unpaid students.</p>
          )}
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

export default CreditReports;
