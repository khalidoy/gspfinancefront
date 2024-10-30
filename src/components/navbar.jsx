// CustomNavbar.jsx

import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faFileInvoice,
  faChartLine,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import "../components/navbar.css";

function CustomNavbar() {
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
              <FontAwesomeIcon icon={faHome} style={{ marginRight: 8 }} /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/daily-accounting" className="nav-item">
              <FontAwesomeIcon
                icon={faFileInvoice}
                style={{ marginRight: 8 }}
              />
              Daily Accounting
            </Nav.Link>

            {/* Expenses Dropdown Menu */}
            <NavDropdown
              title={
                <>
                  <FontAwesomeIcon
                    icon={faDollarSign}
                    style={{ marginRight: 8 }}
                  />
                  Expenses
                </>
              }
              id="expenses-nav-dropdown"
              className="nav-item"
              menuVariant="dark"
            >
              <NavDropdown.Item as={Link} to="/daily-expenses">
                Daily Expenses
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/monthly-expenses">
                Monthly Expenses
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
                  Reports
                </>
              }
              id="reports-nav-dropdown"
              className="nav-item"
              menuVariant="dark"
            >
              <NavDropdown.Item as={Link} to="/reports/normal-payments">
                Normal Payments
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/reports/credit-report">
                Credit Report
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/reports/daily-acc-report">
                Daily Accounting Report
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/transport-report">
                Transport Report
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/payments-report">
                Payments Report
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
