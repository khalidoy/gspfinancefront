// src/MonthlyExpenses.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios"; // Import axios for API calls
import "./MonthlyExpenses.css";
import { useTranslation } from "react-i18next";

const monthsList = [
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
];

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + "/depences"; // Backend API URL

function MonthlyExpenses() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [fixedExpenses, setFixedExpenses] = useState({});
  const [expenseType, setExpenseType] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingIndex, setEditingIndex] = useState(null); // New state to track if editing
  const [populateSuccess, setPopulateSuccess] = useState("");
  const [populateError, setPopulateError] = useState("");

  // Function to handle edit action
  const handleEditExpense = (index) => {
    const expense = fixedExpenses[selectedMonth][index];
    setExpenseType(expense.expense_type);
    setExpenseAmount(expense.expense_amount);
    setEditingIndex(index); // Set the index of the expense being edited
  };

  // Fetch existing expenses when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/monthly`);
        if (response.data.status === "success") {
          // Map response to fixedExpenses with month as key
          const data = response.data.data.reduce((acc, expense) => {
            const month = new Date(expense.date).getMonth() + 1; // Get month from date
            acc[month] = expense.fixed_expenses || [];
            return acc;
          }, {});
          setFixedExpenses(data);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(t("failed_to_fetch_existing_expenses"));
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to handle opening the modal for a selected month
  const handleOpenModal = (monthId) => {
    setSelectedMonth(monthId);
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setExpenseType("");
    setExpenseAmount("");
    setEditingIndex(null); // Reset editing state
    setError("");
    setSuccess("");
  };

  // Function to add fixed expense
  const handleAddFixedExpense = () => {
    if (
      !expenseType ||
      !expenseAmount ||
      isNaN(expenseAmount) ||
      Number(expenseAmount) <= 0
    ) {
      setError(t("please_provide_valid_expense_type_amount"));
      return;
    }

    const monthExpenses = fixedExpenses[selectedMonth] || [];
    const updatedExpenses = [
      ...monthExpenses,
      { expense_type: expenseType, expense_amount: Number(expenseAmount) }, // Update keys to match backend
    ];
    setFixedExpenses({ ...fixedExpenses, [selectedMonth]: updatedExpenses });

    // Clear input fields
    setExpenseType("");
    setExpenseAmount("");
    setError("");
  };

  // Function to remove an expense from the list
  const handleRemoveExpense = (index) => {
    const monthExpenses = fixedExpenses[selectedMonth] || [];
    const updatedExpenses = monthExpenses.filter((_, i) => i !== index);
    setFixedExpenses({ ...fixedExpenses, [selectedMonth]: updatedExpenses });
  };

  const handleUpdateExpense = () => {
    if (
      !expenseType ||
      !expenseAmount ||
      isNaN(expenseAmount) ||
      Number(expenseAmount) <= 0
    ) {
      setError(t("please_provide_valid_expense_type_amount"));
      return;
    }

    const updatedExpenses = [...fixedExpenses[selectedMonth]];
    updatedExpenses[editingIndex] = {
      expense_type: expenseType,
      expense_amount: Number(expenseAmount),
    };

    setFixedExpenses({ ...fixedExpenses, [selectedMonth]: updatedExpenses });
    setExpenseType("");
    setExpenseAmount("");
    setEditingIndex(null); // Reset editing state
  };

  // Function to save expenses to the database
  const handleSaveExpenses = async () => {
    try {
      const expensesForMonth = fixedExpenses[selectedMonth] || [];
      const totalAmount = expensesForMonth.reduce(
        (sum, expense) => sum + expense.expense_amount, // Use expense_amount
        0
      );

      const data = {
        description: `Expenses for month ${selectedMonth}`,
        fixed_expenses: expensesForMonth,
        amount: totalAmount,
      };

      // Send the POST request to save the expenses
      const response = await axios.post(
        `${API_BASE_URL}/monthly/${selectedMonth}`,
        data
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(t("expenses_saved_successfully"));
      } else {
        setError(t("failed_to_save_expenses"));
      }
    } catch (err) {
      console.error("Error saving expenses:", err);
      setError(t("failed_to_save_expenses"));
    }
  };

  // Function to populate default monthly expenses
  const handlePopulateDefaults = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/monthly/populate_defaults`
      );
      if (response.data.status === "success") {
        setPopulateSuccess(
          response.data.message || t("expenses_saved_successfully")
        );
        setPopulateError("");
        // Refetch the expenses after populating defaults
        const fetchData = async () => {
          try {
            const res = await axios.get(`${API_BASE_URL}/monthly`);
            if (res.data.status === "success") {
              const data = res.data.data.reduce((acc, expense) => {
                const month = new Date(expense.date).getMonth() + 1;
                acc[month] = expense.fixed_expenses || [];
                return acc;
              }, {});
              setFixedExpenses(data);
            }
          } catch (error) {
            console.error("Error fetching data: ", error);
            setError(t("failed_to_fetch_existing_expenses"));
          }
        };
        fetchData();
      } else {
        setPopulateError(t("failed_to_populate_default_expenses"));
        setPopulateSuccess("");
      }
    } catch (error) {
      console.error("Error populating defaults:", error);
      setPopulateError(t("failed_to_populate_default_expenses"));
      setPopulateSuccess("");
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-center">{t("monthly_expenses_title")}</h1>

      {/* Success and error messages */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}
      {populateError && (
        <Alert
          variant="danger"
          onClose={() => setPopulateError("")}
          dismissible
        >
          {populateError}
        </Alert>
      )}
      {populateSuccess && (
        <Alert
          variant="success"
          onClose={() => setPopulateSuccess("")}
          dismissible
        >
          {populateSuccess}
        </Alert>
      )}

      {/* Button to populate default expenses */}
      <Button
        variant="warning"
        className="mb-4"
        onClick={handlePopulateDefaults}
      >
        {t("populate_default_expenses")}
      </Button>

      {/* Table to display months and their total expenses */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>{t("month")}</th>
            <th>{t("total_expenses_dh")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {monthsList.map((month, index) => {
            const monthExpenses = fixedExpenses[month.id] || [];
            const totalExpenses = monthExpenses.reduce(
              (sum, expense) => sum + expense.expense_amount, // Use expense_amount
              0
            );

            return (
              <tr key={month.id}>
                <td>{index + 1}</td>
                <td>{t(month.name.toLowerCase())}</td>
                <td>{totalExpenses.toFixed(2)} DH</td>
                <td className="d-flex justify-content-center align-items-center">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenModal(month.id)}
                  >
                    {t("view_expenses")}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Modal to display and add fixed expenses */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {t("expenses_for_month", {
              monthName: monthsList.find((m) => m.id === selectedMonth)?.name,
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Existing Expenses */}
          <h5>{t("existing_expenses")}</h5>
          <Table striped bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("expense_type")}</th>
                <th>{t("amount_dh")}</th>
                <th style={{ textAlign: "center" }}>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(fixedExpenses[selectedMonth] || []).map((expense, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{expense.expense_type}</td>
                  <td>{expense.expense_amount.toFixed(2)} DH</td>
                  <td style={{ textAlign: "center" }}>
                    <Button
                      variant="warning"
                      className="mr-2"
                      onClick={() => handleEditExpense(idx)}
                      style={{ marginRight: "10px" }} // Add space between buttons
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveExpense(idx)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {(fixedExpenses[selectedMonth] || []).length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">
                    {t("no_expenses_added_yet")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Total Expenses */}
          <div className="mt-3">
            <h6>
              {t("total_for_month", {
                month: monthsList.find((m) => m.id === selectedMonth)?.name,
                amount: (fixedExpenses[selectedMonth] || [])
                  .reduce((sum, expense) => sum + expense.expense_amount, 0)
                  .toFixed(2),
              })}{" "}
              DH
            </h6>
          </div>

          {/* Form to add or edit a fixed expense */}
          <h5 className="mt-4">
            {editingIndex !== null
              ? t("edit_fixed_expense")
              : t("add_fixed_expense")}
            :
          </h5>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="expenseType">
                  <Form.Label>{t("expense_type")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("enter_expense_description")}
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="expenseAmount">
                  <Form.Label>{t("amount_dh")}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t("enter_amount")}
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button
              style={{ marginTop: 10 }}
              variant="primary"
              onClick={
                editingIndex !== null
                  ? handleUpdateExpense
                  : handleAddFixedExpense
              }
            >
              {editingIndex !== null
                ? t("update_fixed_expense")
                : t("add_fixed_expense")}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close")}
          </Button>
          <Button variant="success" onClick={handleSaveExpenses}>
            {t("save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MonthlyExpenses;
