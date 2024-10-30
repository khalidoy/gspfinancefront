// src/MonthlyExpenses.js
import packageJson from "../package.json";

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

const API_BASE_URL = packageJson.backend.url + "/depences"; // Backend API URL

function MonthlyExpenses() {
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
        setError("Failed to fetch existing expenses.");
      }
    };
    fetchData();
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
      setError("Please provide valid expense type and amount.");
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
      setError("Please provide valid expense type and amount.");
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
        setSuccess("Expenses saved successfully.");
      } else {
        setError("Failed to save expenses.");
      }
    } catch (err) {
      console.error("Error saving expenses:", err);
      setError("Failed to save expenses.");
    }
  };

  // Function to populate default monthly expenses
  const handlePopulateDefaults = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/monthly/populate_defaults`
      );
      if (response.data.status === "success") {
        setPopulateSuccess(response.data.message);
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
            setError("Failed to fetch existing expenses.");
          }
        };
        fetchData();
      } else {
        setPopulateError("Failed to populate default expenses.");
        setPopulateSuccess("");
      }
    } catch (error) {
      console.error("Error populating defaults:", error);
      setPopulateError("Failed to populate default expenses.");
      setPopulateSuccess("");
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-center">
        Monthly Expenses (September - August)
      </h1>

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
        Populate Default Expenses
      </Button>

      {/* Table to display months and their total expenses */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Month</th>
            <th>Total Expenses (DH)</th>
            <th>Actions</th>
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
                <td>{month.name}</td>
                <td>{totalExpenses.toFixed(2)} DH</td>
                <td className="d-flex justify-content-center align-items-center">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenModal(month.id)}
                  >
                    View Expenses
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
            Expenses for {monthsList.find((m) => m.id === selectedMonth)?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Existing Expenses */}
          <h5>Existing Expenses:</h5>
          <Table striped bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Expense Type</th>
                <th>Amount (DH)</th>
                <th style={{ textAlign: "center" }}>Actions</th>{" "}
                {/* Center Actions */}
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
                    No expenses added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Total Expenses */}
          <div className="mt-3">
            <h6>
              Total for {monthsList.find((m) => m.id === selectedMonth)?.name}:{" "}
              {(fixedExpenses[selectedMonth] || [])
                .reduce((sum, expense) => sum + expense.expense_amount, 0)
                .toFixed(2)}{" "}
              DH
            </h6>
          </div>

          {/* Form to add or edit a fixed expense */}
          <h5 className="mt-4">
            {editingIndex !== null ? "Edit Fixed Expense" : "Add Fixed Expense"}
            :
          </h5>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="expenseType">
                  <Form.Label>Expense Type</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter expense type (e.g., electricity)"
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="expenseAmount">
                  <Form.Label>Amount (DH)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
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
                ? "Update Fixed Expense"
                : "Add Fixed Expense"}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleSaveExpenses}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MonthlyExpenses;
