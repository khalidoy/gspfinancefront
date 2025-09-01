// src/pages/NormalPayments.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Form, Button, Modal } from "react-bootstrap";
import "./NormalPayments.css"; // Import the custom CSS file
import html2canvas from "html2canvas"; // Import html2canvas
import { useTranslation } from "react-i18next";

function NormalPayments() {
  const { t } = useTranslation();
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

  // Map month numbers to month names using translations
  const monthNames = {
    9: t("september"),
    10: t("october"),
    11: t("november"),
    12: t("december"),
    1: t("january"),
    2: t("february"),
    3: t("march"),
    4: t("april"),
    5: t("may"),
    6: t("june"),
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
        setError(t("failed_to_fetch_school_year_periods"));
      }
    };

    fetchSchoolYearPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(t("failed_to_fetch_report"));
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
      <h1 className="normal-payments-title">
        {t("normal_payments_report_title")}
      </h1>

      {/* Dropdown for School Year Period selection */}
      <Form.Group controlId="schoolYearSelect">
        <Form.Label>{t("select_school_year_period")}</Form.Label>
        <Form.Control
          as="select"
          value={selectedSchoolYear}
          onChange={handleSchoolYearChange}
        >
          <option value="">{t("select_a_school_year_period")}</option>
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
            <span className="sr-only">{t("loading")}</span>
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
          {unknownStudents.length} {t("unknown_student_agreed_payments")}
        </Alert>
      )}

      {/* Only show the report and download button if a school year is selected */}
      {!loading && !error && selectedSchoolYear && reportData.length > 0 && (
        <>
          <div id="report-table">
            {/* Add the school year period and title in the screenshot */}
            <h2 className="report-title">
              {t("school_year_period")} {selectedSchoolYearName}
            </h2>

            <Table className="normal-payments-table" bordered hover>
              <thead>
                <tr>
                  <th>{t("month")}</th>
                  <th>{t("monthly_agreed_payments")}</th>
                  <th>{t("total_expenses")}</th>
                  <th>{t("net_profit")}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.month}>
                    <td>{monthNames[row.month] || row.month}</td>
                    <td>
                      {(row.total_monthly_agreed_payments || 0).toFixed(2)} DH
                    </td>
                    <td>{(row.total_expenses || 0).toFixed(2)} DH</td>
                    <td>{(row.net_profit || 0).toFixed(2)} DH</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>{t("total_yearly")}</strong>
                  </td>
                  <td>
                    <strong>{totalYearlyIncome.toFixed(2)} DH</strong>
                  </td>
                  <td>
                    <strong>
                      {reportData
                        .reduce(
                          (acc, row) => acc + (row.total_expenses || 0),
                          0
                        )
                        .toFixed(2)}{" "}
                      DH
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {reportData
                        .reduce((acc, row) => acc + (row.net_profit || 0), 0)
                        .toFixed(2)}{" "}
                      DH
                    </strong>
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Additional Information */}
            <div className="additional-info">
              <p>
                <strong>{t("total_number_of_students_paid_insurance")}</strong>{" "}
                {totalStudentsWithInsurance || "0"}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <Button className="download-button" onClick={handleDownload}>
            {t("download")}
          </Button>
        </>
      )}

      {/* Modal to display unknown students */}
      <Modal show={showUnknownModal} onHide={handleCloseUnknownModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {t("unknown_students_with_zero_agreed_payments")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {unknownStudents.length === 0 ? (
            <p>{t("no_unknown_students_found")}</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("student_name")}</th>
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
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NormalPayments;
