// src/Home.js

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./Home.css";
import {
  Modal,
  Button,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import { FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

// Configure axios with a base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

const currentUserId = "670ac94fc3d3342280ec3d62";

const months = [
  { key: "m9", displayName: "M9", monthNum: 9, order: 1 },
  { key: "m10", displayName: "M10", monthNum: 10, order: 2 },
  { key: "m11", displayName: "M11", monthNum: 11, order: 3 },
  { key: "m12", displayName: "M12", monthNum: 12, order: 4 },
  { key: "m1", displayName: "M1", monthNum: 1, order: 5 },
  { key: "m2", displayName: "M2", monthNum: 2, order: 6 },
  { key: "m3", displayName: "M3", monthNum: 3, order: 7 },
  { key: "m4", displayName: "M4", monthNum: 4, order: 8 },
  { key: "m5", displayName: "M5", monthNum: 5, order: 9 },
  { key: "m6", displayName: "M6", monthNum: 6, order: 10 },
];

// Reusable component for School Year Period Modal
const SchoolYearModal = ({
  show,
  handleClose,
  handleCreate,
  creating,
  error,
  formData,
  setFormData,
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("add_new_school_year_period_title")}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleCreate}>
        <Modal.Body>
          {error && (
            <Alert
              variant="danger"
              onClose={() => setFormData({ ...formData, error: "" })}
              dismissible
            >
              {error}
            </Alert>
          )}
          <Form.Group controlId="newSchoolYearName">
            <Form.Label>{t("name")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("enter_name")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group controlId="newSchoolYearStartDate">
            <Form.Label>{t("start_date")}</Form.Label>
            <Form.Control
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group controlId="newSchoolYearEndDate">
            <Form.Label>{t("end_date")}</Form.Label>
            <Form.Control
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" disabled={creating}>
            {creating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                {t("creating")}...
              </>
            ) : (
              t("create")
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Reusable component for Student Modal
const StudentModal = ({
  show,
  handleClose,
  student,
  setStudent,
  originalStudent,
  handleSave,
  handleDelete,
  months,
  autocompleteEnabled,
  setAutocompleteEnabled,
  error,
  setError,
}) => {
  const { t } = useTranslation();

  if (!student) return null;

  const handlePaymentChange = (type, key, value) => {
    if (type === "real") {
      handleRealPaymentChange(key, value);
    } else if (type === "agreed") {
      handleAgreedPaymentChange(key, value);
    }
  };

  const handleRealPaymentChange = (key, value) => {
    const agreedKey = key.replace("_real", "_agreed");
    const agreedValue = Number(
      student.payments.agreed_payments?.[agreedKey] || 0
    );
    if (agreedValue <= 0 && Number(value) > 0) {
      setError(t("cannot_set_real_payment_without_agreed"));
      return;
    }

    setStudent((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        real_payments: {
          ...prev.payments.real_payments,
          [key]: value === "" ? 0 : Number(value),
        },
      },
    }));
  };

  const handleAgreedPaymentChange = (key, value) => {
    const isTransport = key.includes("_transport_agreed");
    const paymentCategory = isTransport
      ? "transport_agreed"
      : key === "insurance_agreed"
      ? "insurance_agreed"
      : "monthly_agreed";
    const newValue = value === "" ? "0" : value;

    setStudent((prev) => {
      if (!prev) return prev;

      const updatedAgreedPayments = { ...prev.payments.agreed_payments };
      updatedAgreedPayments[key] = newValue;

      if (autocompleteEnabled) {
        const keysToUpdate = Object.keys(updatedAgreedPayments).filter((k) => {
          if (paymentCategory === "monthly_agreed") {
            return (
              k.endsWith("_agreed") &&
              !k.includes("transport") &&
              !k.includes("insurance")
            );
          } else if (paymentCategory === "transport_agreed") {
            return k.endsWith("_transport_agreed") && k !== key;
          }
          return false;
        });

        keysToUpdate.forEach((k) => {
          updatedAgreedPayments[k] = newValue;
        });
      }

      return {
        ...prev,
        payments: {
          ...prev.payments,
          agreed_payments: updatedAgreedPayments,
        },
      };
    });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      aria-labelledby="student-modal-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="student-modal-title" className="w-100 text-center">
          {originalStudent ? t("edit_student") : t("add_new_student")}
        </Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}
          {/* Student Name */}
          <Form.Group controlId="studentName" className="mb-3">
            <Form.Label>{t("student_name")}</Form.Label>
            <Form.Control
              type="text"
              value={student.name}
              onChange={(e) =>
                setStudent((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </Form.Group>
          {/* Joined Month */}
          <h5>{t("joined_in")}</h5>
          <Form.Control
            as="select"
            value={student.joined_month}
            onChange={(e) => {
              const value = Number(e.target.value);
              const currentMonth = months.find((m) => m.monthNum === value);

              if (!currentMonth) return;

              const joinedOrder = currentMonth.order;
              const previousMonths = months.filter(
                (m) => m.order < joinedOrder
              );

              const hasPreviousPayments = previousMonths.some((m) => {
                const realKey = `${m.key}_real`;
                const agreedKey = `${m.key}_agreed`;
                const transportRealKey = `${m.key}_transport_real`;
                const transportAgreedKey = `${m.key}_transport_agreed`;
                const insuranceReal =
                  student.payments.real_payments.insurance_real;
                const insuranceAgreed =
                  student.payments.agreed_payments.insurance_agreed;

                return (
                  Number(student.payments.real_payments[realKey] || 0) > 0 ||
                  Number(student.payments.agreed_payments[agreedKey] || 0) >
                    0 ||
                  Number(
                    student.payments.real_payments[transportRealKey] || 0
                  ) > 0 ||
                  Number(
                    student.payments.agreed_payments[transportAgreedKey] || 0
                  ) > 0 ||
                  Number(insuranceReal || 0) > 0 ||
                  Number(insuranceAgreed || 0) > 0
                );
              });

              if (
                hasPreviousPayments &&
                originalStudent?.joined_month !== value
              ) {
                setError(t("cannot_set_joined_month_with_previous_payments"));
                return;
              }

              // Reset previous months' payments
              const updatedRealPayments = { ...student.payments.real_payments };
              const updatedAgreedPayments = {
                ...student.payments.agreed_payments,
              };

              previousMonths.forEach((m) => {
                updatedRealPayments[`${m.key}_real`] = 0;
                updatedRealPayments[`${m.key}_transport_real`] = 0;
                updatedAgreedPayments[`${m.key}_agreed`] = "0";
                updatedAgreedPayments[`${m.key}_transport_agreed`] = "0";
              });

              setStudent((prev) => ({
                ...prev,
                joined_month: value,
                payments: {
                  ...prev.payments,
                  real_payments: updatedRealPayments,
                  agreed_payments: updatedAgreedPayments,
                },
              }));
            }}
            className="mb-3"
            style={{ width: "200px" }}
          >
            {months.map((month) => (
              <option key={month.key} value={month.monthNum}>
                {month.displayName}
              </option>
            ))}
          </Form.Control>
          {/* Real Payments */}
          <h5>{t("real_payments")}</h5>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>{t("payment_type")}</th>
                  {months.map((month) => (
                    <th key={month.key}>{month.displayName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["monthly", "transport"].map((paymentType) => (
                  <tr key={paymentType}>
                    <td>{`${
                      paymentType.charAt(0).toUpperCase() + paymentType.slice(1)
                    } ${t("real")}`}</td>
                    {months.map((month) => {
                      const joinedMonth = months.find(
                        (m) => m.monthNum === student.joined_month
                      );
                      const joinedOrder = joinedMonth
                        ? joinedMonth.order
                        : null;

                      const isDisabled =
                        joinedOrder && month.order < joinedOrder;

                      const key =
                        paymentType === "monthly"
                          ? `${month.key}_real`
                          : `${month.key}_transport_real`;

                      return (
                        <td
                          key={key}
                          className={isDisabled ? t("disabled_cell") : ""}
                        >
                          {!isDisabled ? (
                            <Form.Control
                              type="number"
                              min="0"
                              value={
                                student.payments.real_payments?.[key] || ""
                              }
                              onChange={(e) =>
                                handlePaymentChange("real", key, e.target.value)
                              }
                            />
                          ) : (
                            ""
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agreed Payments */}
          <h5>{t("agreed_payments")}</h5>

          <Form.Group controlId="autocompleteSwitch" className="mb-3">
            <Form.Check
              type="switch"
              id="autocomplete-switch"
              label={t("enable_autocomplete")}
              checked={autocompleteEnabled}
              onChange={(e) => setAutocompleteEnabled(e.target.checked)}
            />
          </Form.Group>

          {autocompleteEnabled && (
            <Alert variant="info">{t("autocomplete_info")}</Alert>
          )}

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>{t("payment_type")}</th>
                  {months.map((month) => (
                    <th key={month.key}>{month.displayName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["monthly", "transport"].map((paymentType) => (
                  <tr key={paymentType}>
                    <td>{`${
                      paymentType.charAt(0).toUpperCase() + paymentType.slice(1)
                    } ${t("agreed")}`}</td>
                    {months.map((month) => {
                      const joinedMonth = months.find(
                        (m) => m.monthNum === student.joined_month
                      );
                      const joinedOrder = joinedMonth
                        ? joinedMonth.order
                        : null;

                      const isDisabled =
                        joinedOrder && month.order < joinedOrder;

                      const key =
                        paymentType === "monthly"
                          ? `${month.key}_agreed`
                          : `${month.key}_transport_agreed`;

                      return (
                        <td
                          key={key}
                          className={isDisabled ? t("disabled_cell") : ""}
                        >
                          {!isDisabled ? (
                            <Form.Control
                              type="number"
                              min="0"
                              value={
                                student.payments.agreed_payments?.[key] || "0"
                              }
                              onChange={(e) =>
                                handlePaymentChange(
                                  "agreed",
                                  key,
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            ""
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insurance Payments */}
          <h5>{t("insurance_payments")}</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>{t("real_insurance")}</th>
                <th>{t("agreed_insurance")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    value={
                      student.payments.real_payments?.insurance_real || "0"
                    }
                    onChange={(e) =>
                      handlePaymentChange(
                        "real",
                        "insurance_real",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    value={
                      student.payments.agreed_payments?.insurance_agreed || "0"
                    }
                    onChange={(e) =>
                      handlePaymentChange(
                        "agreed",
                        "insurance_agreed",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Observations */}
          <h5>{t("observations")}</h5>
          <Form.Control
            as="textarea"
            value={student.observations}
            onChange={(e) =>
              setStudent((prev) => ({
                ...prev,
                observations: e.target.value,
              }))
            }
            rows={3}
          />
        </Modal.Body>
        <Modal.Footer>
          {originalStudent && (
            <Button variant="danger" onClick={() => handleDelete(student)}>
              {t("delete_student")}
            </Button>
          )}
          <Button variant="secondary" onClick={handleClose}>
            {t("close")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t("save_changes")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Reusable component for Student Statistics
const StudentStatistics = ({ left, newCount, unregistered, registered }) => {
  const { t } = useTranslation();

  return (
    <div className="student-statistics mb-4">
      <h5>{t("student_statistics")}</h5>
      <ul className="list-inline">
        <li className="list-inline-item">
          <span className="stat-label">{t("students_left")}</span> {left}
        </li>
        <li className="list-inline-item">
          <span className="stat-label">{t("new_students")}</span> {newCount}
        </li>
        <li className="list-inline-item">
          <span className="stat-label">{t("unregistered_students")}</span>{" "}
          {unregistered}
        </li>
        <li className="list-inline-item">
          <span className="stat-label">{t("registered_students")}</span>{" "}
          {registered}
        </li>
      </ul>
    </div>
  );
};

// Reusable component for Filters and Search
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

// Reusable component for Student Table
const StudentTable = ({
  students,
  months,
  handleRowClick,
  filteredStudents,
  loadingStudents,
  error,
}) => {
  const { t } = useTranslation();

  const getCellClass = (real, agreed) => {
    const realNum = Number(real);
    const agreedNum = Number(agreed);

    if (realNum === 0) return "highlight-red";
    if (realNum >= agreedNum) return "highlight-green";

    return "highlight-yellow";
  };

  const displayValue = (value) => {
    return Number(value) === 0 ? "" : value;
  };

  return (
    <>
      {loadingStudents ? (
        <div className="d-flex align-items-center">
          <Spinner animation="border" className="mr-2" />{" "}
          {t("loading_students")}
        </div>
      ) : students.length === 0 ? (
        <div>{t("no_students_found")}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered students-table">
            <thead>
              <tr>
                <th>{t("full_name")}</th>
                <th>{t("real_insurance")}</th>
                {months.map((month) => (
                  <th key={month.key}>{month.displayName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center">
                    {t("no_students_found")}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const hasTransport = Object.keys(
                    student.payments.agreed_payments
                  ).some(
                    (key) =>
                      key.includes("transport_agreed") &&
                      Number(student.payments.agreed_payments[key]) > 0
                  );

                  const rowSpan = hasTransport ? 2 : 1;

                  return (
                    <React.Fragment key={student._id}>
                      <tr
                        onClick={() => handleRowClick(student)}
                        className="clickable-row"
                      >
                        <td rowSpan={rowSpan}>{student.name}</td>

                        {/* Modified Real Insurance Cell with Coloring */}
                        <td
                          rowSpan={rowSpan}
                          className={getCellClass(
                            student.payments.real_payments.insurance_real,
                            student.payments.agreed_payments.insurance_agreed
                          )}
                        >
                          {student.payments.real_payments.insurance_real}
                        </td>

                        {months.map((month) => {
                          const joinedMonth = months.find(
                            (m) => m.monthNum === student.joined_month
                          );
                          const joinedOrder = joinedMonth
                            ? joinedMonth.order
                            : null;

                          const isDisabled =
                            joinedOrder && month.order < joinedOrder;

                          return (
                            <td
                              key={month.key}
                              className={
                                isDisabled
                                  ? t("disabled_cell")
                                  : getCellClass(
                                      student.payments.real_payments[
                                        `${month.key}_real`
                                      ],
                                      student.payments.agreed_payments[
                                        `${month.key}_agreed`
                                      ]
                                    )
                              }
                            >
                              {isDisabled
                                ? ""
                                : displayValue(
                                    student.payments.real_payments[
                                      `${month.key}_real`
                                    ]
                                  )}
                            </td>
                          );
                        })}
                      </tr>
                      {hasTransport && (
                        <tr className="transport-row">
                          {months.map((month) => {
                            const joinedMonth = months.find(
                              (m) => m.monthNum === student.joined_month
                            );
                            const joinedOrder = joinedMonth
                              ? joinedMonth.order
                              : null;

                            const isDisabled =
                              joinedOrder && month.order < joinedOrder;

                            return (
                              <td
                                key={month.key}
                                className={
                                  isDisabled
                                    ? t("disabled_cell")
                                    : getCellClass(
                                        student.payments.real_payments[
                                          `${month.key}_transport_real`
                                        ],
                                        student.payments.agreed_payments[
                                          `${month.key}_transport_agreed`
                                        ]
                                      )
                                }
                              >
                                {isDisabled
                                  ? ""
                                  : displayValue(
                                      student.payments.real_payments[
                                        `${month.key}_transport_real`
                                      ]
                                    )}
                              </td>
                            );
                          })}
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

function Home() {
  const { t, i18n } = useTranslation();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // Default to 'active'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [originalStudentData, setOriginalStudentData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSchoolYears, setLoadingSchoolYears] = useState(false);
  const [error, setError] = useState("");
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(false);

  // School Year Period modal state
  const [showNewSchoolYearModal, setShowNewSchoolYearModal] = useState(false);
  const [schoolYearForm, setSchoolYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    error: "",
  });
  const [creatingSchoolYear, setCreatingSchoolYear] = useState(false);

  const [schoolYearPeriods, setSchoolYearPeriods] = useState([]);
  const [selectedSchoolYearPeriod, setSelectedSchoolYearPeriod] = useState("");

  useEffect(() => {
    const fetchSchoolYearPeriods = async () => {
      setLoadingSchoolYears(true);
      try {
        const response = await api.get("/schoolyearperiods/");
        const periods = response.data.data;
        if (!periods || periods.length === 0) {
          setError(t("no_school_year_periods"));
          setLoadingSchoolYears(false);
          return;
        }

        // Sort the periods by start_date in descending order
        periods.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setSchoolYearPeriods(periods);

        // Set the selectedSchoolYearPeriod to the latest one
        setSelectedSchoolYearPeriod(periods[0]._id.$oid || periods[0]._id);

        setLoadingSchoolYears(false);
      } catch (err) {
        console.error("Error fetching school year periods:", err);
        setError(t("failed_to_fetch_school_year_periods"));
        setLoadingSchoolYears(false);
      }
    };

    fetchSchoolYearPeriods();
  }, [t]);

  const fetchStudents = async (schoolYearPeriod) => {
    if (!schoolYearPeriod) {
      // Do not fetch students until a school year period is selected
      return;
    }

    setLoadingStudents(true);
    setError("");
    try {
      const params = { schoolyearperiod: schoolYearPeriod };
      const response = await api.get("/students", { params });

      if (!response.data || !response.data.students) {
        throw new Error("Invalid response structure.");
      }

      const processedData = response.data.students.map((student) => ({
        ...student,
        _id: student._id && student._id.$oid ? student._id.$oid : student._id,
        isNew: student.isNew || false,
        isLeft: student.isLeft || false,
      }));

      setStudents(processedData);
      setLoadingStudents(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(t("failed_to_fetch_students"));
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents(selectedSchoolYearPeriod);
  }, [selectedSchoolYearPeriod]);

  // Function to open the New School Year Period modal
  const handleOpenNewSchoolYearModal = () => {
    setSchoolYearForm({
      name: "",
      startDate: "",
      endDate: "",
      error: "",
    });
    setShowNewSchoolYearModal(true);
  };

  // Function to close the New School Year Period modal
  const handleCloseNewSchoolYearModal = () => {
    setShowNewSchoolYearModal(false);
  };

  // Function to handle the submission of the new School Year Period
  const handleCreateSchoolYearPeriod = async (e) => {
    e.preventDefault();
    const { name, startDate, endDate } = schoolYearForm;

    // Basic validation
    if (!name || !startDate || !endDate) {
      setSchoolYearForm((prev) => ({
        ...prev,
        error: t("all_fields_required"),
      }));
      return;
    }

    // Validate date ranges
    if (new Date(startDate) >= new Date(endDate)) {
      setSchoolYearForm((prev) => ({
        ...prev,
        error: t("start_date_before_end_date"),
      }));
      return;
    }

    setCreatingSchoolYear(true);
    setSchoolYearForm((prev) => ({ ...prev, error: "" }));

    try {
      const payload = {
        name,
        start_date: startDate,
        end_date: endDate,
      };

      const response = await api.post("/schoolyearperiods/", payload);

      if (response.data.status === "success") {
        // Add the new period to state
        const newPeriod = response.data.data;
        setSchoolYearPeriods((prev) => [newPeriod, ...prev]);

        // Set the selectedSchoolYearPeriod to the newly created one
        setSelectedSchoolYearPeriod(newPeriod.id || newPeriod._id);

        // Close the modal
        setShowNewSchoolYearModal(false);
      } else {
        setSchoolYearForm((prev) => ({
          ...prev,
          error:
            response.data.message || t("failed_to_create_school_year_period"),
        }));
      }
    } catch (error) {
      console.error("Error creating School Year Period:", error);
      setSchoolYearForm((prev) => ({
        ...prev,
        error:
          error.response?.data?.message ||
          t("error_creating_school_year_period"),
      }));
    } finally {
      setCreatingSchoolYear(false);
    }
  };

  const handleRowClick = (student) => {
    setSelectedStudent({ ...student });
    setOriginalStudentData(JSON.parse(JSON.stringify(student)));
    setAutocompleteEnabled(false);
    setError("");
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setOriginalStudentData(null);
    setAutocompleteEnabled(false);
    setError("");
  };

  const handleDelete = async (student) => {
    if (!window.confirm(t("delete_confirmation", { name: student.name }))) {
      return;
    }
    try {
      await api.put(`/students/${student._id}/delete`);
      setStudents((prevStudents) =>
        prevStudents.filter((s) => s._id !== student._id)
      );
      handleClose();
    } catch (error) {
      console.error("There was an error deleting the student!", error);
      setError(t("failed_to_delete_student"));
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedStudent) {
      handleClose();
      return;
    }

    // Validation and business rules can be handled here or within the StudentModal component

    try {
      if (!originalStudentData) {
        // Adding a new student
        const newStudentData = {
          name: selectedStudent.name,
          joined_month: selectedStudent.joined_month || 9, // Default to month 9 (September)
          payments: selectedStudent.payments,
          observations: selectedStudent.observations || "",
          school_year_id: selectedSchoolYearPeriod, // Use the selected school year
          isNew: selectedStudent.isNew,
          isLeft: selectedStudent.isLeft,
        };
        // Post request to create a new student
        await api.post("/students", newStudentData);

        // Re-fetch the students after adding the new student
        await fetchStudents(selectedSchoolYearPeriod);
      } else {
        // Editing an existing student
        const isEqual =
          JSON.stringify(selectedStudent) ===
          JSON.stringify(originalStudentData);
        if (!isEqual) {
          const realChangedPayments = [];
          const agreedChangedPayments = {};

          // Detect changes in real payments
          for (let key in selectedStudent.payments.real_payments) {
            if (
              selectedStudent.payments.real_payments[key] !==
              originalStudentData.payments.real_payments[key]
            ) {
              const payment_type = key.includes("transport_real")
                ? "transport"
                : key === "insurance_real"
                ? "insurance"
                : "monthly";
              const paymentObj = {
                student_id: selectedStudent._id,
                user_id: currentUserId,
                amount: selectedStudent.payments.real_payments[key],
                payment_type: payment_type,
              };
              if (payment_type !== "insurance") {
                const monthKey = key.split("_")[0];
                const monthNum = parseInt(monthKey.substring(1));
                paymentObj.month = monthNum;
              }
              realChangedPayments.push(paymentObj);
            }
          }

          // Detect changes in agreed payments
          for (let key in selectedStudent.payments.agreed_payments) {
            if (
              selectedStudent.payments.agreed_payments[key] !==
              originalStudentData.payments.agreed_payments[key]
            ) {
              agreedChangedPayments[key] =
                selectedStudent.payments.agreed_payments[key];
            }
          }

          // Update real payments
          for (let payment of realChangedPayments) {
            await api.post("/payments/create_or_update", payment);
          }

          // Update agreed payments
          if (Object.keys(agreedChangedPayments).length > 0) {
            const agreedPaymentsNumber = {};
            for (let key in agreedChangedPayments) {
              agreedPaymentsNumber[key] =
                Number(agreedChangedPayments[key]) || 0;
            }

            await api.post("/payments/agreed_changes", {
              student_id: selectedStudent._id,
              user_id: currentUserId,
              agreed_payments: agreedPaymentsNumber,
              date: new Date().toISOString(),
            });
          }

          // Update student basic info
          const studentUpdateData = {
            name: selectedStudent.name,
            observations: selectedStudent.observations,
            joined_month: selectedStudent.joined_month,
            isNew: selectedStudent.isNew,
            isLeft: selectedStudent.isLeft,
          };

          await api.put(`/students/${selectedStudent._id}`, studentUpdateData);

          setStudents((prevStudents) =>
            prevStudents.map((s) =>
              s._id === selectedStudent._id ? selectedStudent : s
            )
          );
        }
      }
      // Close the modal after saving changes
      handleClose();
    } catch (error) {
      console.error("There was an error saving the changes!", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(
          `${t("failed_to_save_changes")}: ${error.response.data.message}`
        );
      } else {
        setError(t("failed_to_save_changes"));
      }
    }
  };

  const handleAddNewStudent = () => {
    const defaultPayments = {
      agreed_payments: {
        m9_agreed: "0",
        m10_agreed: "0",
        m11_agreed: "0",
        m12_agreed: "0",
        m1_agreed: "0",
        m2_agreed: "0",
        m3_agreed: "0",
        m4_agreed: "0",
        m5_agreed: "0",
        m6_agreed: "0",
        m9_transport_agreed: "0",
        m10_transport_agreed: "0",
        m11_transport_agreed: "0",
        m12_transport_agreed: "0",
        m1_transport_agreed: "0",
        m2_transport_agreed: "0",
        m3_transport_agreed: "0",
        m4_transport_agreed: "0",
        m5_transport_agreed: "0",
        m6_transport_agreed: "0",
        insurance_agreed: "0",
      },
      real_payments: {
        m9_real: 0,
        m10_real: 0,
        m11_real: 0,
        m12_real: 0,
        m1_real: 0,
        m2_real: 0,
        m3_real: 0,
        m4_real: 0,
        m5_real: 0,
        m6_real: 0,
        m9_transport_real: 0,
        m10_transport_real: 0,
        m11_transport_real: 0,
        m12_transport_real: 0,
        m1_transport_real: 0,
        m2_transport_real: 0,
        m3_transport_real: 0,
        m4_transport_real: 0,
        m5_transport_real: 0,
        m6_transport_real: 0,
        insurance_real: 0,
      },
    };

    setSelectedStudent({
      name: "",
      joined_month: 9, // Default to September
      payments: defaultPayments,
      observations: "",
      school_year_id: selectedSchoolYearPeriod,
      isNew: false,
      isLeft: false,
    });
    setOriginalStudentData(null); // Reset the original data for new student
    setAutocompleteEnabled(false); // Ensure autocomplete is in the desired default state
    setError("");
    setShowModal(true);
  };

  const handleSchoolYearChange = (e) => {
    const selectedId = e.target.value;
    setSelectedSchoolYearPeriod(selectedId);
    fetchStudents(selectedId);
  };

  // Calculate statistics using isNew and isLeft
  const leftStudents = useMemo(
    () => students.filter((s) => s.isLeft).length,
    [students]
  );
  const newStudents = useMemo(
    () => students.filter((s) => s.isNew).length,
    [students]
  );
  const unregisteredStudents = useMemo(
    () =>
      students.filter((s) => s.payments.real_payments.insurance_real === 0)
        .length - leftStudents,
    [students, leftStudents]
  );
  const registeredStudents = useMemo(
    () =>
      students.filter((s) => s.payments.real_payments.insurance_real > 0)
        .length,
    [students]
  );

  // Filtering students based on search term and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearchTerm = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesStatus = true;

      if (statusFilter === "active") {
        matchesStatus = !student.isLeft;
      } else if (statusFilter === "left") {
        matchesStatus = student.isLeft;
      } else if (statusFilter === "new") {
        matchesStatus = student.isNew;
      } // else statusFilter === "all", so matchesStatus remains true

      return matchesSearchTerm && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{t("student_data")}</h1>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {/* Student Statistics */}
      <StudentStatistics
        left={leftStudents}
        newCount={newStudents}
        unregistered={unregisteredStudents}
        registered={registeredStudents}
      />

      {/* Filters and Search */}
      <Filters
        loadingSchoolYears={loadingSchoolYears}
        schoolYearPeriods={schoolYearPeriods}
        selectedSchoolYearPeriod={selectedSchoolYearPeriod}
        handleSchoolYearChange={handleSchoolYearChange}
        handleOpenNewSchoolYearModal={handleOpenNewSchoolYearModal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Add New Student Button */}
      <Button
        variant="primary"
        className="mb-4"
        onClick={handleAddNewStudent}
        disabled={!selectedSchoolYearPeriod}
      >
        <FaPlus className="mr-2" />
        {t("add_new_student")}
      </Button>

      {/* Student Table */}
      <StudentTable
        students={students}
        months={months}
        handleRowClick={handleRowClick}
        filteredStudents={filteredStudents}
        loadingStudents={loadingStudents}
        error={error}
      />

      {/* New School Year Period Modal */}
      <SchoolYearModal
        show={showNewSchoolYearModal}
        handleClose={handleCloseNewSchoolYearModal}
        handleCreate={handleCreateSchoolYearPeriod}
        creating={creatingSchoolYear}
        error={schoolYearForm.error}
        formData={{
          name: schoolYearForm.name,
          startDate: schoolYearForm.startDate,
          endDate: schoolYearForm.endDate,
        }}
        setFormData={(data) =>
          setSchoolYearForm((prev) => ({ ...prev, ...data }))
        }
      />

      {/* Student Modal */}
      {selectedStudent && (
        <StudentModal
          show={showModal}
          handleClose={handleClose}
          student={selectedStudent}
          setStudent={setSelectedStudent}
          originalStudent={originalStudentData}
          handleSave={handleSaveChanges}
          handleDelete={handleDelete}
          months={months}
          autocompleteEnabled={autocompleteEnabled}
          setAutocompleteEnabled={setAutocompleteEnabled}
          error={error}
          setError={setError}
        />
      )}
    </div>
  );
}

export default Home;
