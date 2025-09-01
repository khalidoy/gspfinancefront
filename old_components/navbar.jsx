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
import logo from "../logo.png"; // Import logo from ../logo.png

function CustomNavbar() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="app-title">
          <img src={logo} alt="University Logo" className="navbar-logo" />
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
              <NavDropdown.Item as={Link} to="/reports/daily-acc-report">
                {t("daily_accounting_report")}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payments-report">
                {t("payments_report")}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/reports/normal-payments">
                {t("normal_payments")}
              </NavDropdown.Item>

              <NavDropdown.Item as={Link} to="/reports/credit-report">
                {t("credit_report")}
              </NavDropdown.Item>
            </NavDropdown>

            {/* Language Switcher */}
            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon icon={faGlobe} style={{ marginRight: 8 }} />
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
