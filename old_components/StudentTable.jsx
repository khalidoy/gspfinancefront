// src/components/StudentTable.jsx

import React, { useState } from "react";
import { Table, Spinner, Alert, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const StudentTable = ({
  students,
  months,
  handleRowClick,
  filteredStudents,
  loadingStudents,
  error,
  handleInlineEdit,
}) => {
  const { t } = useTranslation();
  const [editingCell, setEditingCell] = useState({
    studentId: null,
    key: null,
    originalValue: null,
  });
  const [tempValue, setTempValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleCellClick = (studentId, key, currentValue) => {
    setEditingCell({ studentId, key, originalValue: currentValue });
    setTempValue(currentValue);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const { studentId, key, originalValue } = editingCell;
      if (Number(tempValue) !== Number(originalValue)) {
        setIsSaving(true);
        try {
          await handleInlineEdit(studentId, key, tempValue);
        } catch (err) {
          console.error("Error saving changes:", err);
          // Optionally, handle error (e.g., show a notification)
        }
        setIsSaving(false);
      }
      setEditingCell({ studentId: null, key: null, originalValue: null });
      setTempValue("");
    } else if (e.key === "Escape") {
      setEditingCell({ studentId: null, key: null, originalValue: null });
      setTempValue("");
    }
  };

  const handleBlur = () => {
    if (!isSaving) {
      setEditingCell({ studentId: null, key: null, originalValue: null });
      setTempValue("");
    }
  };

  return (
    <>
      {loadingStudents && (
        <div className="loading-overlay">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </Spinner>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="error-alert">
          {error}
        </Alert>
      )}
      {!loadingStudents && students.length === 0 ? (
        <div>{t("no_students_found")}</div>
      ) : (
        <div className="table-responsive">
          <Table bordered className="students-table">
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
                  <td colSpan={months.length + 2} className="text-center">
                    {t("no_students_found")}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  // Removed transport-related logic; rowSpan is always 1
                  const rowSpan = 1;
                  return (
                    <tr key={student._id} className="clickable-row">
                      <td
                        rowSpan={rowSpan}
                        onClick={() => handleRowClick(student)}
                        style={{ cursor: "pointer" }}
                      >
                        {student.name}
                      </td>
                      <td
                        rowSpan={rowSpan}
                        className={getCellClass(
                          student.payments.real_payments.insurance_real,
                          student.payments.agreed_payments.insurance_agreed
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(
                            student._id,
                            "insurance_real",
                            student.payments.real_payments.insurance_real
                          );
                        }}
                      >
                        {editingCell.studentId === student._id &&
                        editingCell.key === "insurance_real" ? (
                          isSaving ? (
                            <Spinner
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            <Form.Control
                              type="number"
                              min="0"
                              value={tempValue}
                              autoFocus
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleBlur}
                            />
                          )
                        ) : (
                          displayValue(
                            student.payments.real_payments.insurance_real
                          )
                        )}
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

                        const key = `${month.key}_real`;

                        return (
                          <td
                            key={month.key}
                            className={
                              isDisabled
                                ? "disabled-cell"
                                : getCellClass(
                                    student.payments.real_payments[key],
                                    student.payments.agreed_payments[
                                      `${month.key}_agreed`
                                    ]
                                  )
                            }
                            onClick={(e) => {
                              if (isDisabled) return;
                              e.stopPropagation();
                              handleCellClick(
                                student._id,
                                key,
                                student.payments.real_payments[key]
                              );
                            }}
                          >
                            {!isDisabled ? (
                              editingCell.studentId === student._id &&
                              editingCell.key === key ? (
                                isSaving ? (
                                  <Spinner
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Form.Control
                                    type="number"
                                    min="0"
                                    value={tempValue}
                                    autoFocus
                                    onChange={(e) =>
                                      setTempValue(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleBlur}
                                  />
                                )
                              ) : (
                                displayValue(
                                  student.payments.real_payments[key]
                                )
                              )
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default StudentTable;
