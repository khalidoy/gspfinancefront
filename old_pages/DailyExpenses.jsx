// src/pages/DailyExpenses.jsx
import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import "./DailyExpenses.css";
import { useTranslation } from "react-i18next";

function DailyExpenses() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once when the component mounts

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/depences/`);
      console.log("Fetched expenses:", response.data);
      // Read the expenses array from response.data.data
      const allExpenses = response.data.data || [];
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
      setError(t("failed_to_fetch_expenses"));
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
    if (!window.confirm(t("confirm_delete_expense"))) return;

    try {
      await axios.delete(`${API_BASE_URL}/depences/${expenseId}`);
      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      );
      setSuccess(t("expense_deleted_successfully"));
    } catch (err) {
      console.error("Error deleting expense:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(t("failed_to_delete_expense"));
      }
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseDescription.trim() || !expenseAmount) {
      setError(t("please_fill_all_fields"));
      return;
    }

    if (isNaN(expenseAmount) || Number(expenseAmount) <= 0) {
      setError(t("please_enter_valid_amount"));
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
        setSuccess(t("expense_updated_successfully"));
      } else {
        // Create new expense
        const createResponse = await axios.post(
          `${API_BASE_URL}/depences/`,
          expenseData
        );
        const newExpenseRaw = createResponse.data.data;
        let newExpense;
        if (typeof newExpenseRaw === "string") {
          newExpense = JSON.parse(newExpenseRaw);
        } else {
          newExpense = newExpenseRaw;
        }

        const id = newExpense._id?.$oid || newExpense.id;
        if (!id) {
          throw new Error(t("new_expense_missing_id"));
        }

        const expenseWithId = { ...newExpense, id };
        setExpenses((prevExpenses) => [...prevExpenses, expenseWithId]);
        setSuccess(t("expense_added_successfully"));
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving expense:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(t("failed_to_save_expense"));
      }
    } finally {
      setSavingExpense(false);
    }
  };

  // Compute Total Amount of Expenses Today
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-center">
        <FaCalendarAlt className="mr-2" style={{ marginRight: 5 }} />
        {t("daily_expenses")} - {formattedDate}
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
        <h4 className="mb-0">{t("expenses_list")}</h4>
        <Button variant="primary" onClick={handleAddExpense}>
          <FaPlus className="mr-2" />
          {t("add_expense")}
        </Button>
      </div>

      <Alert variant="info" className="text-right">
        {t("total_expenses_today")} :{" "}
        <strong>{totalAmount.toFixed(2)} DH</strong>
      </Alert>

      {loadingExpenses ? (
        <div className="d-flex align-items-center">
          <div className="spinner-border mr-2" role="status">
            <span className="sr-only">{t("loading")}</span>
          </div>
          {t("loading_expenses")}
        </div>
      ) : expenses.length === 0 ? (
        <p>{t("no_expenses_recorded_today")}</p>
      ) : (
        <Table striped bordered hover responsive className="expenses-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("expense_description")}</th>
              <th>{t("amount")} (DH)</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td>{index + 1}</td>
                <td>{expense.description}</td>
                <td>{expense.amount.toFixed(2)}</td>
                <td className="text-center">
                  <Button
                    variant="info"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEditExpense(expense)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      marginRight: 5,
                    }}
                  >
                    <FaEdit size={20} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense.id)}
                    style={{ padding: "0.5rem 0.75rem" }}
                  >
                    <FaTrash size={20} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExpense ? t("edit_expense") : t("add_expense")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="expenseDescription">
              <Form.Label>{t("expense_description")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("enter_expense_description")}
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="expenseAmount">
              <Form.Label>{t("amount")}</Form.Label>
              <Form.Control
                type="number"
                placeholder={t("enter_amount")}
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
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveExpense}
            disabled={savingExpense}
          >
            {savingExpense
              ? editingExpense
                ? t("updating")
                : t("adding")
              : editingExpense
              ? t("update_expense")
              : t("add_expense")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DailyExpenses;
