// src/components/TransportReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Form,
  Button,
  Spinner,
  Alert,
  Table,
  Accordion,
  Modal,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./TransportReport.css"; // Import the CSS file
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TransportReport = () => {
  const { t } = useTranslation();
  const [schoolYearPeriods, setSchoolYearPeriods] = useState([]);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStudents, setModalStudents] = useState([]);

  // Define the months in desired order
  const months = [
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
  ];

  // Fetch available school year periods on component mount
  useEffect(() => {
    const fetchSchoolYearPeriods = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URL + "/schoolyearperiods"
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

  // Fetch transport report data based on selected school year
  const fetchTransportReport = async () => {
    if (!selectedSchoolYear) {
      setError(t("please_select_school_year_period"));
      return;
    }

    setLoading(true);
    setError("");
    setMonthlyData({});

    try {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/transport/transport-report",
        {
          params: { school_year: selectedSchoolYear },
        }
      );
      const { monthly_transport_data } = response.data;

      setMonthlyData(monthly_transport_data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transport report:", err);
      setError(
        err.response?.data?.error || t("failed_to_fetch_transport_report")
      );
      setLoading(false);
    }
  };

  const handleSchoolYearChange = (e) => {
    setSelectedSchoolYear(e.target.value);
  };

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

  const getBarChartData = (monthName) => {
    const monthData = monthlyData[monthName];
    if (!monthData) return {};

    const labels = monthData.payment_distribution.map((item) => item.amount);
    const data = monthData.payment_distribution.map(
      (item) => item.student_count
    );

    return {
      labels,
      datasets: [
        {
          label: t("number_of_students"),
          data,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const getMinMaxStudents = (monthName, type) => {
    const monthData = monthlyData[monthName];
    if (!monthData) return [];

    const { students } = monthData;
    if (students.length === 0) return [];

    let targetValue = 0;
    if (type === "min") {
      targetValue = Math.min(...students.map((s) => s.agreed_payment));
    } else if (type === "max") {
      targetValue = Math.max(...students.map((s) => s.agreed_payment));
    }

    return students.filter((s) => s.agreed_payment === targetValue);
  };

  const getStudentsByPayment = (monthName, paymentAmount) => {
    const monthData = monthlyData[monthName];
    if (!monthData) return [];

    const { students } = monthData;
    return students.filter((s) => s.agreed_payment === paymentAmount);
  };

  return (
    <div className="transport-container">
      <h1 className="transport-heading">{t("transport_report_title")}</h1>

      {/* School Year Selection */}
      <Form className="transport-form">
        <Form.Group controlId="schoolYearSelect">
          <Form.Label>{t("select_school_year_period")}</Form.Label>
          <Form.Control
            as="select"
            value={selectedSchoolYear}
            onChange={handleSchoolYearChange}
          >
            <option value="">{t("select_a_school_year_period")}</option>
            {schoolYearPeriods.map((period) => (
              <option key={period.id} value={period.name}>
                {period.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button
          variant="primary"
          onClick={fetchTransportReport}
          disabled={!selectedSchoolYear || loading}
          className="get-report-button"
        >
          {loading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            t("get_report")
          )}
        </Button>
      </Form>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="transport-error">
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="spinner-container">
          <Spinner animation="border" role="status">
            <span className="sr-only">{t("loading")}</span>
          </Spinner>
        </div>
      )}

      {/* Report Tables and Graphs */}
      {!loading && !error && Object.keys(monthlyData).length > 0 && (
        <div>
          {/* Monthly Data Accordion */}
          <Accordion defaultActiveKey="0">
            {months.map((monthName, idx) => {
              const monthData = monthlyData[monthName];
              if (!monthData) return null;
              const paymentStats = monthData.payment_statistics;
              const paymentDist = monthData.payment_distribution;

              const minStudents = getMinMaxStudents(monthName, "min");
              const maxStudents = getMinMaxStudents(monthName, "max");

              return (
                <Accordion.Item eventKey={String(idx)} key={idx}>
                  <Accordion.Header>
                    <strong>{t(monthName.toLowerCase())}</strong>
                  </Accordion.Header>
                  <Accordion.Body>
                    {/* Monthly Summary */}
                    <section className="transport-section">
                      <h4>{t("monthly_summary")}</h4>
                      <Table striped bordered hover className="transport-table">
                        <tbody>
                          <tr>
                            <td>
                              <strong>{t("number_of_students")}</strong>
                            </td>
                            <td>{monthData.students.length}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>{t("total_agreed_payment_dh")}</strong>
                            </td>
                            <td>
                              {monthData.total_agreed.toLocaleString()} DH
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </section>

                    {/* Payment Statistics */}
                    <section className="transport-section">
                      <h4>{t("payment_statistics")}</h4>
                      <Table bordered hover className="transport-table">
                        <tbody>
                          <tr>
                            <td>
                              <strong>{t("average_agreed_payment_dh")}</strong>
                            </td>
                            <td>
                              {paymentStats.average_agreed_payment.toLocaleString()}{" "}
                              DH
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>{t("minimum_agreed_payment_dh")}</strong>
                            </td>
                            <td
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() =>
                                handleShowModal(
                                  `${t("minimum_agreed_payment")} ${monthName}`,
                                  minStudents
                                )
                              }
                            >
                              {paymentStats.min_agreed_payment.toLocaleString()}{" "}
                              DH
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>{t("maximum_agreed_payment_dh")}</strong>
                            </td>
                            <td
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() =>
                                handleShowModal(
                                  `${t("maximum_agreed_payment")} ${monthName}`,
                                  maxStudents
                                )
                              }
                            >
                              {paymentStats.max_agreed_payment.toLocaleString()}{" "}
                              DH
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </section>

                    {/* Payment Distribution */}
                    <section className="transport-section">
                      <h4>{t("payment_distribution")}</h4>
                      <Table striped bordered hover className="transport-table">
                        <thead>
                          <tr>
                            <th>{t("agreed_payment_dh")}</th>
                            <th>{t("number_of_students")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentDist.map((item, index) => (
                            <tr key={index}>
                              <td
                                style={{ cursor: "pointer", color: "blue" }}
                                onClick={() =>
                                  handleShowModal(
                                    `${t(
                                      "students_with_agreed_payment_text"
                                    )} ${item.amount.toLocaleString()} DH - ${monthName}`,
                                    getStudentsByPayment(monthName, item.amount)
                                  )
                                }
                              >
                                {item.amount.toLocaleString()} DH
                              </td>
                              <td>{item.student_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </section>

                    {/* Payment Distribution Chart */}
                    <section className="transport-section">
                      <h4>{t("payment_distribution_chart")}</h4>
                      <Bar
                        data={getBarChartData(monthName)}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                            title: {
                              display: true,
                              text: `${t(
                                "payment_distribution_for"
                              )} ${monthName}`,
                            },
                          },
                        }}
                      />
                    </section>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>
      )}

      {/* Modal for Min/Max Students and Payment Distribution */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalStudents.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>{t("student_name")}</th>
                  <th>{t("agreed_payment_dh")}</th>
                </tr>
              </thead>
              <tbody>
                {modalStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.agreed_payment.toLocaleString()} DH</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>{t("no_students_found")}</p>
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
};

export default TransportReport;
