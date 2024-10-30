// src/components/PaymentsReport.jsx

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
import "./PaymentsReport.css"; // Import the CSS file

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PaymentsReport = () => {
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
          "http://127.0.0.1:5000/schoolyearperiods"
        );
        setSchoolYearPeriods(response.data.data);
      } catch (err) {
        console.error("Error fetching school year periods:", err);
        setError("Failed to fetch school year periods.");
      }
    };

    fetchSchoolYearPeriods();
  }, []);

  // Fetch payments report data based on selected school year
  const fetchPaymentsReport = async () => {
    if (!selectedSchoolYear) {
      setError("Please select a school year period.");
      return;
    }

    setLoading(true);
    setError("");
    setMonthlyData({});

    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/payments-report/payments-report",
        {
          params: { school_year: selectedSchoolYear },
        }
      );
      const { monthly_payment_data } = response.data;

      setMonthlyData(monthly_payment_data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments report:", err);
      setError(err.response?.data?.error || "Failed to fetch payments report.");
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
          label: "Number of Students",
          data,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
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
    <div className="payments-container">
      <h1 className="payments-heading">Payments Report</h1>

      {/* School Year Selection */}
      <Form className="payments-form">
        <Form.Group controlId="schoolYearSelect">
          <Form.Label>Select School Year Period</Form.Label>
          <Form.Control
            as="select"
            value={selectedSchoolYear}
            onChange={handleSchoolYearChange}
          >
            <option value="">-- Select School Year Period --</option>
            {schoolYearPeriods.map((period) => (
              <option key={period.id} value={period.name}>
                {period.name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button
          variant="primary"
          onClick={fetchPaymentsReport}
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
            "Get Report"
          )}
        </Button>
      </Form>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="payments-error">
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="spinner-container">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
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
                    <strong>{monthName}</strong>
                  </Accordion.Header>
                  <Accordion.Body>
                    {/* Monthly Summary */}
                    <section className="payments-section">
                      <h4>Monthly Summary</h4>
                      <Table striped bordered hover className="payments-table">
                        <tbody>
                          <tr>
                            <td>
                              <strong>Number of Students</strong>
                            </td>
                            <td>{monthData.students.length}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Total Agreed Payment (DH)</strong>
                            </td>
                            <td>
                              {monthData.total_agreed.toLocaleString()} DH
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </section>

                    {/* Payment Statistics */}
                    <section className="payments-section">
                      <h4>Payment Statistics</h4>
                      <Table bordered hover className="payments-table">
                        <tbody>
                          <tr>
                            <td>
                              <strong>Average Agreed Payment (DH)</strong>
                            </td>
                            <td>
                              {paymentStats.average_agreed_payment.toLocaleString()}{" "}
                              DH
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Minimum Agreed Payment (DH)</strong>
                            </td>
                            <td
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() =>
                                handleShowModal(
                                  `Minimum Agreed Payment - ${monthName}`,
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
                              <strong>Maximum Agreed Payment (DH)</strong>
                            </td>
                            <td
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() =>
                                handleShowModal(
                                  `Maximum Agreed Payment - ${monthName}`,
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
                    <section className="payments-section">
                      <h4>Payment Distribution</h4>
                      <Table striped bordered hover className="payments-table">
                        <thead>
                          <tr>
                            <th>Agreed Payment (DH)</th>
                            <th>Number of Students</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentDist.map((item, index) => (
                            <tr key={index}>
                              <td
                                style={{ cursor: "pointer", color: "blue" }}
                                onClick={() =>
                                  handleShowModal(
                                    `Students with Agreed Payment ${item.amount} DH - ${monthName}`,
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
                    <section className="payments-section">
                      <h4>Payment Distribution Chart</h4>
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
                              text: `Payment Distribution for ${monthName}`,
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
                  <th>Name</th>
                  <th>Agreed Payment (DH)</th>
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
            <p>No students found.</p>
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
};

export default PaymentsReport;
