// src/components/CustomNavbar.jsx

import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFileInvoice,
  faChartLine,
  faDollarSign,
  faGlobe, // Import the globe icon
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next"; // Import useTranslation hook
import "../components/navbar.css";

function CustomNavbar() {
  const { i18n, t } = useTranslation(); // Initialize i18n and t function

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Function to change language
  };

  return (
    <Navbar expand="lg" className="custom-navbar" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="app-title">
          <span className="brand-icon">
            <FontAwesomeIcon icon={faDollarSign} />
          </span>
          <span>Gsak Finance</span>
          <div className="brand-subtext">
            <div style={{ color: "yellow", fontSize: 12, margin: 5 }}>
              by Khalid Yakhloufi
            </div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-item">
              <FontAwesomeIcon icon={faHome} style={{ marginRight: 8 }} />{" "}
              {t("home")}
            </Nav.Link>
            <Nav.Link as={Link} to="/daily-accounting" className="nav-item">
              <FontAwesomeIcon
                icon={faFileInvoice}
                style={{ marginRight: 8 }}
              />
              {t("daily_accounting")}
            </Nav.Link>

            {/* Expenses Dropdown Menu */}
            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon
                    icon={faDollarSign}
                    style={{ marginRight: 8 }}
                  />
                  {t("expenses")}
                </>
              }
              id="expenses-nav-dropdown"
              className="nav-item"
              menuVariant="dark"
            >
              <NavDropdown.Item as={Link} to="/daily-expenses">
                {t("daily_expenses")}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/monthly-expenses">
                {t("monthly_expenses")}
              </NavDropdown.Item>
            </NavDropdown>

            {/* Reports Dropdown Menu */}
            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon
                    icon={faChartLine}
                    style={{ marginRight: 8 }}
                  />
                  {t("reports")}
                </>
              }
              id="reports-nav-dropdown"
              className="nav-item"
              menuVariant="dark"
            >
              {/* <NavDropdown.Item as={Link} to="/reports/normal-payments">
                {t("normal_payments")}
              </NavDropdown.Item> */}
              <NavDropdown.Item as={Link} to="/reports/credit-report">
                {t("credit_report")}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/reports/daily-acc-report">
                {t("daily_accounting_report")}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/transport-report">
                {t("transport_report")}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payments-report">
                {t("payments_report")}
              </NavDropdown.Item>
            </NavDropdown>

            {/* Language Switcher */}
            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon
                    icon={faGlobe} // Add the globe icon
                    style={{ marginRight: 8 }}
                  />
                  {t("language")}
                </>
              }
              id="language-nav-dropdown"
              menuVariant="dark"
              className="nav-item"
            >
              <NavDropdown.Item onClick={() => changeLanguage("ar")}>
                العربية
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => changeLanguage("fr")}>
                Français
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
