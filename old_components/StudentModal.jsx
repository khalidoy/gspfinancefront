// src/components/StudentModal.jsx

import React from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

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
  isSaving, // New prop to indicate saving state
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
    // Remove transport-related updates
    if (key.includes("transport")) return;

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
    // Remove transport-related updates
    if (key.includes("transport")) return;

    const newValue = value === "" ? "0" : value;

    setStudent((prev) => {
      if (!prev) return prev;

      const updatedAgreedPayments = { ...prev.payments.agreed_payments };
      updatedAgreedPayments[key] = newValue;

      if (autocompleteEnabled) {
        const keysToUpdate = Object.keys(updatedAgreedPayments).filter((k) => {
          return (
            k.endsWith("_agreed") &&
            !k.includes("transport") &&
            !k.includes("insurance")
          );
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
              disabled={isSaving} // Disable input during save
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
                const insuranceReal =
                  student.payments.real_payments.insurance_real;
                const insuranceAgreed =
                  student.payments.agreed_payments.insurance_agreed;

                return (
                  Number(student.payments.real_payments[realKey] || 0) > 0 ||
                  Number(student.payments.agreed_payments[agreedKey] || 0) >
                    0 ||
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

              // Reset previous months' payments (transport keys removed)
              const updatedRealPayments = { ...student.payments.real_payments };
              const updatedAgreedPayments = {
                ...student.payments.agreed_payments,
              };

              previousMonths.forEach((m) => {
                updatedRealPayments[`${m.key}_real`] = 0;
                updatedAgreedPayments[`${m.key}_agreed`] = "0";
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
            disabled={isSaving} // Disable select during save
          >
            {months.map((month) => (
              <option key={month.key} value={month.monthNum}>
                {month.displayName}
              </option>
            ))}
          </Form.Control>
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
                <td
                  className={
                    student.payments.real_payments.insurance_real > 0
                      ? "highlight-green"
                      : "highlight-red"
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f8ff";
                    e.currentTarget.style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.cursor = "default";
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement click handler if needed
                  }}
                >
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
                    disabled={isSaving} // Disable input during save
                  />
                </td>
                <td
                  className={
                    student.payments.agreed_payments.insurance_agreed > 0
                      ? "highlight-green"
                      : "highlight-red"
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f8ff";
                    e.currentTarget.style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.cursor = "default";
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement click handler if needed
                  }}
                >
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
                    disabled={isSaving} // Disable input during save
                  />
                </td>
              </tr>
            </tbody>
          </table>
          {/* Agreed Payments */}
          <h5>{t("agreed_payments")}</h5>

          <Form.Group controlId="autocompleteSwitch" className="mb-3">
            <Form.Check
              type="switch"
              id="autocomplete-switch"
              label={t("enable_autocomplete")}
              checked={autocompleteEnabled}
              onChange={(e) => setAutocompleteEnabled(e.target.checked)}
              disabled={isSaving} // Disable switch during save
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
                {["monthly"].map((paymentType) => (
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
                      const key = `${month.key}_agreed`;

                      return (
                        <td
                          key={key}
                          className={isDisabled ? "disabled-cell" : ""}
                          onMouseEnter={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.backgroundColor = "#f0f8ff";
                              e.currentTarget.style.cursor = "pointer";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.backgroundColor = "";
                              e.currentTarget.style.cursor = "default";
                            }
                          }}
                          onClick={(e) => {
                            if (isDisabled) return;
                            e.stopPropagation();
                            // Implement click handler if needed
                          }}
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
                              disabled={isSaving} // Disable input during save
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
                {["monthly"].map((paymentType) => (
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
                      const key = `${month.key}_real`;

                      return (
                        <td
                          key={key}
                          className={isDisabled ? "disabled-cell" : ""}
                          onMouseEnter={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.backgroundColor = "#f0f8ff";
                              e.currentTarget.style.cursor = "pointer";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDisabled) {
                              e.currentTarget.style.backgroundColor = "";
                              e.currentTarget.style.cursor = "default";
                            }
                          }}
                          onClick={(e) => {
                            if (isDisabled) return;
                            e.stopPropagation();
                            // Implement click handler if needed
                          }}
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
                              disabled={isSaving} // Disable input during save
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
            disabled={isSaving} // Disable textarea during save
          />
        </Modal.Body>
        <Modal.Footer>
          {originalStudent && (
            <Button
              variant="danger"
              onClick={() => handleDelete(student)}
              disabled={isSaving} // Disable during save
            >
              {t("delete_student")}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving} // Disable during save
          >
            {t("close")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSaving} // Disable during save
          >
            {isSaving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                {t("saving")}
              </>
            ) : (
              t("save_changes")
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StudentModal;
