// src/pages/StudentPayment.jsx
import React, { useEffect, useState } from "react";
import { Container, Card, Table, Alert, Dropdown } from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./StudentPayment.css";
import logo from "../logo.png"; // Adjust path if necessary

function StudentPayment() {
  const { t, i18n } = useTranslation();
  const { token } = useParams(); // Unique token from URL
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState("");
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  // Mapping month numbers to translated month names.
  const monthNames = {
    1: t("january"),
    2: t("february"),
    3: t("march"),
    4: t("april"),
    5: t("may"),
    6: t("june"),
    7: t("july"),
    8: t("august"),
    9: t("september"),
    10: t("october"),
    11: t("november"),
    12: t("december"),
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/student-payment/${token}`
        );
        if (response.data.status === "success") {
          setStudentData(response.data.data);
          console.log(response.data.data);
        } else {
          setError(t("failed_to_fetch_student_data"));
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(t("failed_to_fetch_student_data"));
      }
    };
    fetchStudentData();
  }, [API_BASE_URL, token, t]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  if (error) {
    return (
      <Container className="student-payment-container">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!studentData) {
    return (
      <Container className="student-payment-container">
        <div className="loading-wrapper">
          <p>{t("loading")}...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="student-payment-container">
      <Card className="student-payment-card shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          {/* University Logo on the top left */}
          <img src={logo} alt="University Logo" className="university-logo" />
          <div className="language-dropdown">
            <Dropdown>
              <Dropdown.Toggle variant="link" id="language-dropdown-toggle">
                <span className="language-icon">&#127760;</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleLanguageChange("fr")}>
                  Français
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleLanguageChange("ar")}>
                  العربية
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Header>
        <Card.Body>
          <h1 className="student-name">{studentData.name}</h1>
          <div className="student-info">
            {studentData.observations && (
              <p className="student-detail">
                <strong>{t("observations")}:</strong> {studentData.observations}
              </p>
            )}
            <p className="student-detail">
              <strong>{t("insurance_paid")}:</strong>{" "}
              {studentData.insurance_paid || 0} DH
            </p>
          </div>
          <h2 className="payment-header">{t("my_payment_info")}</h2>
          {studentData.payments && studentData.payments.length > 0 ? (
            <Table striped bordered hover responsive className="payment-table">
              <thead>
                <tr>
                  <th>{t("payment_date")}</th>
                  <th>{t("payment_amount")}</th>
                  <th>{t("month")}</th>
                </tr>
              </thead>
              <tbody>
                {studentData.payments.map((payment) => {
                  let paymentDate = t("n_a");
                  if (payment.date) {
                    // payment.date should be an ISO string
                    paymentDate = new Date(payment.date).toLocaleDateString();
                  }
                  return (
                    <tr key={payment.id}>
                      <td>{paymentDate}</td>
                      <td>{payment.amount}</td>
                      <td>
                        {payment.month
                          ? monthNames[payment.month] || payment.month
                          : t("n_a")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <p>{t("no_payment_info_found")}</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default StudentPayment;
