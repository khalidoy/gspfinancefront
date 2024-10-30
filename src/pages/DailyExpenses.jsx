// DailyExpenses.jsx
import packageJson from "../package.json";

import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import "./DailyExpenses.css";

function DailyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);

  const API_BASE_URL = packageJson.backend.url;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs only once when the component mounts

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/depences/`);
      const allExpenses = JSON.parse(response.data.data) || [];

      // Map each expense to include 'id' from '_id.$oid'
      const expensesWithId = allExpenses
        .map((expense) => ({
          ...expense,
          id: expense._id?.$oid || expense.id,
        }))
        .filter((expense) => expense.id); // Ensure 'id' exists

      setExpenses(expensesWithId);
      setLoadingExpenses(false);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to fetch expenses.");
      setLoadingExpenses(false);
    }
  };

  const handleAddExpense = () => {
    setExpenseDescription("");
    setExpenseAmount("");
    setEditingExpense(null);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleEditExpense = (expense) => {
    setExpenseDescription(expense.description);
    setExpenseAmount(expense.amount.toString());
    setEditingExpense(expense);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      await axios.delete(`${API_BASE_URL}/depences/${expenseId}`);
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      );
      setSuccess("Expense deleted successfully.");
    } catch (err) {
      console.error("Error deleting expense:", err);
      // Handle different error structures
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to delete expense.");
      }
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseDescription.trim() || !expenseAmount) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(expenseAmount) || Number(expenseAmount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const expenseData = {
      type: "daily",
      description: expenseDescription.trim(),
      amount: Number(expenseAmount),
      date: today.toISOString().split("T")[0],
    };

    setSavingExpense(true);

    try {
      if (editingExpense) {
        // Update existing expense
        const updateResponse = await axios.put(
          `${API_BASE_URL}/depences/${editingExpense.id}`,
          expenseData
        );
        const updatedExpenseRaw = updateResponse.data.data;

        // Check if 'data' is a string and parse it
        let updatedExpense;
        if (typeof updatedExpenseRaw === "string") {
          updatedExpense = JSON.parse(updatedExpenseRaw);
        } else {
          updatedExpense = updatedExpenseRaw;
        }

        const updatedExpenseWithId = {
          ...updatedExpense,
          id: updatedExpense._id?.$oid || updatedExpense.id,
        };

        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === editingExpense.id
              ? { ...expense, ...updatedExpenseWithId }
              : expense
          )
        );
        setSuccess("Expense updated successfully.");
      } else {
        // Create new expense
        const createResponse = await axios.post(
          `${API_BASE_URL}/depences/`,
          expenseData
        );
        const newExpenseRaw = createResponse.data.data;

        // Parse the 'data' field if it's a string
        let newExpense;
        if (typeof newExpenseRaw === "string") {
          newExpense = JSON.parse(newExpenseRaw);
        } else {
          newExpense = newExpenseRaw;
        }

        const id = newExpense._id?.$oid || newExpense.id;
        if (!id) {
          throw new Error("New expense is missing an ID.");
        }

        const expenseWithId = { ...newExpense, id };
        setExpenses((prevExpenses) => [...prevExpenses, expenseWithId]);
        setSuccess("Expense added successfully.");
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving expense:", err);
      // Handle different error structures
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save expense.");
      }
    } finally {
      setSavingExpense(false);
    }
  };

  // **Compute Total Amount of Expenses Today**
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-center">
        <FaCalendarAlt className="mr-2" style={{ marginRight: 5 }} />
        Daily Expenses - {formattedDate}
      </h1>

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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Expenses List</h4>
        <Button variant="primary" onClick={handleAddExpense}>
          <FaPlus className="mr-2" />
          Add Expense
        </Button>
      </div>

      {/* **Total Amount Display in DH** */}
      <Alert variant="info" className="text-right">
        Total Expenses Today : <strong>{totalAmount.toFixed(2)} DH</strong>
      </Alert>

      {loadingExpenses ? (
        <div className="d-flex align-items-center">
          <div className="spinner-border mr-2" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
        <p>No expenses recorded for today.</p>
      ) : (
        <Table striped bordered hover responsive className="expenses-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Amount in DH</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td>{index + 1}</td>
                <td>{expense.description}</td>
                {/* **Display Amount in DH** */}
                <td>{expense.amount.toFixed(2)}</td>
                <td className="text-center">
                  <Button
                    variant="info"
                    size="sm" // Increased button size
                    className="mr-2"
                    onClick={() => handleEditExpense(expense)}
                    style={{ padding: "0.5rem 0.75rem", marginRight: 5 }} // Adjust padding if necessary
                  >
                    <FaEdit size={20} /> {/* Increased icon size */}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm" // Increased button size
                    onClick={() => handleDeleteExpense(expense.id)}
                    style={{ padding: "0.5rem 0.75rem" }} // Adjust padding if necessary
                  >
                    <FaTrash size={20} /> {/* Increased icon size */}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="expenseDescription">
              <Form.Label>Expense Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter expense description"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="expenseAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </Form.Group>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveExpense}
            disabled={savingExpense}
          >
            {savingExpense
              ? editingExpense
                ? "Updating..."
                : "Adding..."
              : editingExpense
              ? "Update Expense"
              : "Add Expense"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DailyExpenses;
