// src/components/CreditReports.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spinner, Alert, Form, Button, Modal } from "react-bootstrap";
import "./CreditReports.css";
import html2canvas from "html2canvas";
import moment from "moment"; // For formatting date
import { useTranslation } from "react-i18next";

function CreditReports() {
  const { t } = useTranslation();

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
    9: t("September"),
    10: t("October"),
    11: t("November"),
    12: t("December"),
    1: t("January"),
    2: t("February"),
    3: t("March"),
    4: t("April"),
    5: t("May"),
    6: t("June"),
  };

  // Fetch available school year periods on component mount
  useEffect(() => {
    const fetchSchoolYearPeriods = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URL + "/schoolyearperiods"
        );
        // Adjust according to your backend response structure
        setSchoolYearPeriods(response.data.data);
      } catch (err) {
        console.error("Error fetching school year periods:", err);
        setError(t("failed_to_fetch_school_year_periods"));
      }
    };

    fetchSchoolYearPeriods();
  }, [t]);

  // Fetch report data for all months of the selected school year period
  const fetchReport = async () => {
    if (!selectedSchoolYear) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_URL +
          `/creditreports/all_months_report?schoolyear_id=${selectedSchoolYear}`
      );
      if (response.data.status === "success") {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || t("failed_to_fetch_report"));
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(t("failed_to_fetch_report"));
      setLoading(false);
    }
  };

  const handleSchoolYearChange = (e) => {
    setSelectedSchoolYear(e.target.value);
  };

  // Handle the modal to show unpaid students for a specific month
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
      <h1 className="credit-reports-title">{t("credit_report")}</h1>
      <p className="report-date">
        {t("report_date")} {todayDate}
      </p>

      {/* Dropdown for School Year Period selection */}
      <Form.Group controlId="schoolYearSelect">
        <Form.Label>{t("select_school_year_period")}</Form.Label>
        <Form.Control
          as="select"
          value={selectedSchoolYear}
          onChange={handleSchoolYearChange}
        >
          <option value="">{t("select_school_year_period")}</option>
          {schoolYearPeriods.map((period) => (
            <option
              key={period._id.$oid || period._id}
              value={period._id.$oid || period._id}
            >
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
        {t("get_report")}
      </Button>

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
      {!loading && !error && reportData.length > 0 && (
        <div>
          <h2 className="school-year-period">
            {t("school_year_period_label")}{" "}
            {
              schoolYearPeriods.find(
                (period) =>
                  period._id.$oid === selectedSchoolYear ||
                  period._id === selectedSchoolYear
              )?.name
            }
          </h2>
          <Table className="credit-reports-table" bordered hover>
            <thead>
              <tr>
                <th>{t("month")}</th>
                <th>{t("total_paid")}</th>
                <th>{t("total_left")}</th>
                <th>{t("total_payee_restant")}</th>
                <th>{t("depence")}</th>
                <th>{t("net_profit")}</th>
                <th className="highlight-column-7">
                  {t("current_net_profit")}
                </th>
                <th>{t("unpaid_students")}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => {
                const {
                  month,
                  total_paid,
                  total_left,
                  depence,
                  net_profit,
                  current_net_profit,
                } = row;

                const total_payee_restant = total_paid + total_left;

                return (
                  <tr key={month}>
                    <td>{monthNames[month]}</td>
                    <td>{(total_paid || 0).toFixed(2)}</td>
                    <td>{(total_left || 0).toFixed(2)}</td>
                    <td>{total_payee_restant.toFixed(2)}</td>
                    <td>{depence.toFixed(2)}</td>
                    <td>{net_profit.toFixed(2)}</td>
                    <td className="highlight-column-7">
                      {current_net_profit.toFixed(2)}
                    </td>
                    <td>
                      {row.unpaid_students && row.unpaid_students.length > 0 ? (
                        <Button
                          variant="link"
                          onClick={() =>
                            handleShowModal(
                              `${t("unpaid_students_title")} ${
                                monthNames[month]
                              }`,
                              row.unpaid_students
                            )
                          }
                        >
                          {t("show_unpaid_students")}
                        </Button>
                      ) : (
                        t("none")
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Button
            className="download-button"
            onClick={handleDownload}
            disabled={!selectedSchoolYear}
          >
            {t("download")}
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
                  <th>{t("name")}</th>
                  <th>{t("agreed_payment")}</th>
                  <th>{t("real_payment")}</th>
                </tr>
              </thead>
              <tbody>
                {modalStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.agreed_payment.toLocaleString()} DH</td>
                    <td>{student.real_payment.toLocaleString()} DH</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>{t("no_unpaid_students")}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CreditReports;
