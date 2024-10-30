// src/NormalPayments.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Form, Button, Modal } from "react-bootstrap";
import "./NormalPayments.css"; // Import the custom CSS file
import html2canvas from "html2canvas"; // Import html2canvas

function NormalPayments() {
  const [reportData, setReportData] = useState([]);
  const [schoolYearPeriods, setSchoolYearPeriods] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [selectedSchoolYearName, setSelectedSchoolYearName] = useState(""); // Store selected school year name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalYearlyIncome, setTotalYearlyIncome] = useState(0);
  const [totalStudentsWithInsurance, setTotalStudentsWithInsurance] =
    useState(0); // New state for total number of students with insurance
  const [unknownStudents, setUnknownStudents] = useState([]); // State to hold unknown students
  const [showUnknownModal, setShowUnknownModal] = useState(false); // State to control modal visibility

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
          process.env.REACT_APP_BACKEND_URL + "/schoolyearperiods/"
        );
        setSchoolYearPeriods(response.data.data);
      } catch (err) {
        console.error("Error fetching school year periods:", err);
        setError("Failed to fetch school year periods.");
      }
    };

    fetchSchoolYearPeriods();
  }, []);

  const fetchReport = async (schoolyear_id, schoolyear_name) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_URL +
          `/reports/normal_profit_report?schoolyear_id=${schoolyear_id}`
      );
      setReportData(response.data.data);
      setTotalYearlyIncome(response.data.total_yearly_income);
      setTotalStudentsWithInsurance(
        response.data.total_students_with_insurance
      ); // Set the total number of students with insurance
      setSelectedSchoolYearName(schoolyear_name); // Set the name for the school year

      // Fetch unknown students
      const unknownResponse = await axios.get(
        process.env.REACT_APP_BACKEND_URL +
          `/reports/unknown_agreed_payments?schoolyear_id=${schoolyear_id}`
      );
      if (unknownResponse.data.status === "success") {
        setUnknownStudents(unknownResponse.data.students);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to fetch report");
      setLoading(false);
    }
  };

  const handleSchoolYearChange = (e) => {
    const selectedId = e.target.value;
    const selectedName = e.target.options[e.target.selectedIndex].text; // Get the school year name
    setSelectedSchoolYear(selectedId);
    fetchReport(selectedId, selectedName);
  };

  const handleDownload = () => {
    const element = document.getElementById("report-table");
    html2canvas(element).then((canvas) => {
      const link = document.createElement("a");
      link.download = `normal_payments_report_${selectedSchoolYearName}.png`; // Include school year period in filename
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handleShowUnknownModal = () => {
    setShowUnknownModal(true);
  };

  const handleCloseUnknownModal = () => {
    setShowUnknownModal(false);
  };

  return (
    <div className="normal-payments-container">
      <h1 className="normal-payments-title">Normal Payments Report</h1>

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

      {/* Warning Alert for Unknown Students */}
      {!loading && !error && selectedSchoolYear && (
        <Alert
          variant="danger"
          onClick={handleShowUnknownModal}
          style={{ cursor: "pointer" }}
        >
          {unknownStudents.length} Unknown Student Agreed Payments
        </Alert>
      )}

      {/* Only show the report and download button if a school year is selected */}
      {!loading && !error && selectedSchoolYear && reportData.length > 0 && (
        <>
          <div id="report-table">
            {/* Add the school year period and title in the screenshot */}
            <h2 className="report-title">
              School Year Period: {selectedSchoolYearName}
            </h2>

            <Table className="normal-payments-table" bordered hover>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Monthly Agreed Payments</th>
                  <th>Transport Agreed Payments</th>
                  <th>Total Expenses</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.month}>
                    <td>{monthNames[row.month] || row.month}</td>
                    <td>
                      {(row.total_monthly_agreed_payments || 0).toFixed(2)}
                    </td>
                    <td>
                      {(row.total_transport_agreed_payments || 0).toFixed(2)}
                    </td>
                    <td>{(row.total_expenses || 0).toFixed(2)}</td>
                    <td>{(row.net_profit || 0).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Total Yearly</strong>
                  </td>
                  <td>
                    <strong>{totalYearlyIncome.toFixed(2)}</strong>
                  </td>
                  <td>
                    <strong>
                      {reportData
                        .reduce(
                          (acc, row) =>
                            acc + (row.total_transport_agreed_payments || 0),
                          0
                        )
                        .toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <strong>0.00</strong>
                  </td>
                  <td>
                    <strong>
                      {reportData
                        .reduce((acc, row) => acc + (row.net_profit || 0), 0)
                        .toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Additional Information */}
            <div className="additional-info">
              <p>
                <strong>Total Number of Students Who Paid Insurance:</strong>{" "}
                {totalStudentsWithInsurance || "0"}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <Button className="download-button" onClick={handleDownload}>
            Download
          </Button>
        </>
      )}

      {/* Modal to display unknown students */}
      <Modal show={showUnknownModal} onHide={handleCloseUnknownModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unknown Students with Zero Agreed Payments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {unknownStudents.length === 0 ? (
            <p>No unknown students found.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                </tr>
              </thead>
              <tbody>
                {unknownStudents.map((student, index) => (
                  <tr key={student._id.$oid}>
                    <td>{index + 1}</td>
                    <td>{student.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUnknownModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NormalPayments;
