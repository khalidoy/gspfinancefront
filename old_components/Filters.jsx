// src/components/Filters.jsx

import React from "react";
import { Form, Button, Spinner, InputGroup, Row, Col } from "react-bootstrap";
import { FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Filters = ({
  loadingSchoolYears,
  schoolYearPeriods,
  selectedSchoolYearPeriod,
  handleSchoolYearChange,
  handleOpenNewSchoolYearModal,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => {
  const { t } = useTranslation();

  return (
    <div className="filters-container mb-2">
      <Row>
        {/* School Year Selection */}
        <Form.Group as={Col} md="4" controlId="schoolYearFilter">
          <Form.Label>
            <FaFilter className="mr-2" />
            {t("school_year_period")}
          </Form.Label>
          <div className="d-flex align-items-center">
            {loadingSchoolYears ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="mr-2" />
                {t("loading")}
              </div>
            ) : schoolYearPeriods.length === 0 ? (
              <div>{t("no_school_year_periods")}</div>
            ) : (
              <Form.Control
                as="select"
                value={selectedSchoolYearPeriod}
                onChange={handleSchoolYearChange}
              >
                {schoolYearPeriods.map((sy) => (
                  <option key={sy._id.$oid} value={sy._id.$oid}>
                    {sy.name}
                  </option>
                ))}
              </Form.Control>
            )}
            {/* Plus Icon Button */}
            <Button
              variant="success"
              className="ml-2"
              onClick={handleOpenNewSchoolYearModal}
              title={t("add_new_school_year_period")}
            >
              <FaPlus />
            </Button>
          </div>
        </Form.Group>

        {/* Search Input Field */}
        <Form.Group as={Col} md="4" controlId="searchStudent">
          <Form.Label>
            <FaSearch className="mr-2" />
            {t("search_by_name")}
          </Form.Label>
          <InputGroup>
            <InputGroup.Text id="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t("enter_student_name")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Form.Group>

        {/* Status Filter */}
        <Form.Group as={Col} md="4" controlId="statusFilter">
          <Form.Label>
            <FaFilter className="mr-2" />
            {t("filter_by_status")}
          </Form.Label>
          <InputGroup>
            <InputGroup.Text id="filter-icon">
              <FaFilter />
            </InputGroup.Text>
            <Form.Control
              as="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">{t("active")}</option>
              <option value="left">{t("left")}</option>
              <option value="new">{t("new")}</option>
              <option value="all">{t("all")}</option>
            </Form.Control>
          </InputGroup>
        </Form.Group>
      </Row>
    </div>
  );
};

export default Filters;
