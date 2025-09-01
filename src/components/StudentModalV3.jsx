import React, { useState, useEffect, useMemo } from "react";
import { Dialog, Button, Text, Input, Box } from "@chakra-ui/react";

const StudentModalV3 = ({
  isOpen,
  onClose,
  student,
  onSave,
  onDelete,
  months = [],
  isNew = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    joined_month: 1,
    agreed_payment: "",
    payment_status: "pending",
    monthly_payment: "",
    transport_fees: 0,
    lunch_fees: 0,
    insurance_real: 0,
    insurance_agreed: 0,
    monthly_payments: {},
    real_payments: {},
    observations: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(false);

  // Initialize months data if not provided
  const defaultMonths = useMemo(
    () =>
      months.length > 0
        ? months
        : [
            {
              key: "september",
              displayName: "September",
              monthNum: 9,
              order: 1,
            },
            { key: "october", displayName: "October", monthNum: 10, order: 2 },
            {
              key: "november",
              displayName: "November",
              monthNum: 11,
              order: 3,
            },
            {
              key: "december",
              displayName: "December",
              monthNum: 12,
              order: 4,
            },
            { key: "january", displayName: "January", monthNum: 1, order: 5 },
            { key: "february", displayName: "February", monthNum: 2, order: 6 },
            { key: "march", displayName: "March", monthNum: 3, order: 7 },
            { key: "april", displayName: "April", monthNum: 4, order: 8 },
            { key: "may", displayName: "May", monthNum: 5, order: 9 },
            { key: "june", displayName: "June", monthNum: 6, order: 10 },
          ],
    [months]
  );

  useEffect(() => {
    if (student) {
      // Initialize monthly payments objects for all months
      const monthlyPayments = {};
      const realPayments = {};

      defaultMonths.forEach((month) => {
        const agreedKey = `${month.key}_agreed`;
        const realKey = `${month.key}_real`;
        monthlyPayments[agreedKey] =
          student.payments?.agreed_payments?.[agreedKey] || "0";
        realPayments[realKey] = student.payments?.real_payments?.[realKey] || 0;
      });

      setFormData({
        name: student.name || "",
        grade: student.grade || "",
        joined_month: student.joined_month || 1,
        agreed_payment: student.agreed_payment || "",
        payment_status: student.payment_status || "pending",
        monthly_payment: student.monthly_payment || "",
        transport_fees: student.transport_fees || 0,
        lunch_fees: student.lunch_fees || 0,
        insurance_real: student.payments?.real_payments?.insurance_real || 0,
        insurance_agreed:
          student.payments?.agreed_payments?.insurance_agreed || "0",
        monthly_payments: monthlyPayments,
        real_payments: realPayments,
        observations: student.observations || "",
      });
    } else {
      // Reset form for new student
      const monthlyPayments = {};
      const realPayments = {};

      defaultMonths.forEach((month) => {
        const agreedKey = `${month.key}_agreed`;
        const realKey = `${month.key}_real`;
        monthlyPayments[agreedKey] = "0";
        realPayments[realKey] = 0;
      });

      setFormData({
        name: "",
        grade: "",
        joined_month: 1,
        agreed_payment: "",
        payment_status: "pending",
        monthly_payment: "",
        transport_fees: 0,
        lunch_fees: 0,
        insurance_real: 0,
        insurance_agreed: "0",
        monthly_payments: monthlyPayments,
        real_payments: realPayments,
        observations: "",
      });
    }
  }, [student, defaultMonths]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Student name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const saveData = {
        ...formData,
        payments: {
          agreed_payments: {
            ...formData.monthly_payments,
            insurance_agreed: formData.insurance_agreed,
          },
          real_payments: {
            ...formData.real_payments,
            insurance_real: formData.insurance_real,
          },
        },
      };

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error saving student:", error);
      setError("Failed to save student. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;

    if (
      window.confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await onDelete(student);
        onClose();
      } catch (error) {
        console.error("Error deleting student:", error);
        setError("Failed to delete student. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(""); // Clear error when user makes changes
  };

  const handleMonthlyPaymentChange = (key, value, type = "agreed") => {
    const field = type === "agreed" ? "monthly_payments" : "real_payments";

    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: {
          ...prev[field],
          [key]:
            value === ""
              ? type === "agreed"
                ? "0"
                : 0
              : type === "agreed"
              ? value
              : Number(value),
        },
      };

      // Autocomplete functionality for agreed payments
      if (
        type === "agreed" &&
        autocompleteEnabled &&
        !key.includes("insurance")
      ) {
        const newValue = value === "" ? "0" : value;
        const monthlyPayments = { ...updated[field] };

        defaultMonths.forEach((month) => {
          const agreedKey = `${month.key}_agreed`;
          if (!agreedKey.includes("insurance")) {
            monthlyPayments[agreedKey] = newValue;
          }
        });

        updated[field] = monthlyPayments;
      }

      return updated;
    });

    setError(""); // Clear error when user makes changes
  };

  const handleJoinedMonthChange = (monthNum) => {
    const joinedMonth = defaultMonths.find(
      (m) => m.monthNum === Number(monthNum)
    );
    if (!joinedMonth) return;

    const joinedOrder = joinedMonth.order;
    const previousMonths = defaultMonths.filter((m) => m.order < joinedOrder);

    // Check if there are payments in previous months
    const hasPreviousPayments = previousMonths.some((m) => {
      const realKey = `${m.key}_real`;
      const agreedKey = `${m.key}_agreed`;
      return (
        Number(formData.real_payments[realKey] || 0) > 0 ||
        Number(formData.monthly_payments[agreedKey] || 0) > 0
      );
    });

    if (hasPreviousPayments && student?.joined_month !== Number(monthNum)) {
      setError(
        "Cannot set joined month: student has payments in previous months"
      );
      return;
    }

    // Reset previous months' payments
    const updatedRealPayments = { ...formData.real_payments };
    const updatedMonthlyPayments = { ...formData.monthly_payments };

    previousMonths.forEach((m) => {
      updatedRealPayments[`${m.key}_real`] = 0;
      updatedMonthlyPayments[`${m.key}_agreed`] = "0";
    });

    setFormData((prev) => ({
      ...prev,
      joined_month: Number(monthNum),
      real_payments: updatedRealPayments,
      monthly_payments: updatedMonthlyPayments,
    }));

    setError(""); // Clear error when user makes changes
  };

  const isMonthDisabled = (month) => {
    const joinedMonth = defaultMonths.find(
      (m) => m.monthNum === formData.joined_month
    );
    if (!joinedMonth) return false;
    return month.order < joinedMonth.order;
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="full"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="90vw" maxH="90vh" overflow="auto">
          <Dialog.Header>
            <Dialog.Title>
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                {isNew ? "Add New Student" : "Edit Student"}
              </Text>
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.CloseTrigger />

          <Dialog.Body>
            <Box p={4}>
              {error && (
                <Box
                  p={3}
                  mb={4}
                  backgroundColor="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  borderRadius="md"
                >
                  <Text color="red.700" fontSize="sm">
                    {error}
                  </Text>
                </Box>
              )}

              {/* Student Name */}
              <Box mb={6}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Student Name *
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter student name"
                  isDisabled={isLoading}
                />
              </Box>

              {/* Joined Month */}
              <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Joined In
                </Text>
                <select
                  value={formData.joined_month}
                  onChange={(e) => handleJoinedMonthChange(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: "200px",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  {defaultMonths.map((month) => (
                    <option key={month.key} value={month.monthNum}>
                      {month.displayName}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Insurance Payments */}
              <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Insurance Payments
                </Text>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f7fafc" }}>
                        <th
                          style={{
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            textAlign: "left",
                          }}
                        >
                          Real Insurance
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            textAlign: "left",
                          }}
                        >
                          Agreed Insurance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor:
                              Number(formData.insurance_real) > 0
                                ? "#f0fff4"
                                : "#fef5e7",
                          }}
                        >
                          <Input
                            type="number"
                            min="0"
                            value={formData.insurance_real}
                            onChange={(e) =>
                              handleInputChange(
                                "insurance_real",
                                Number(e.target.value)
                              )
                            }
                            isDisabled={isLoading}
                          />
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor:
                              Number(formData.insurance_agreed) > 0
                                ? "#f0fff4"
                                : "#fef5e7",
                          }}
                        >
                          <Input
                            type="number"
                            min="0"
                            value={formData.insurance_agreed}
                            onChange={(e) =>
                              handleInputChange(
                                "insurance_agreed",
                                e.target.value
                              )
                            }
                            isDisabled={isLoading}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Box>

              {/* Agreed Payments */}
              <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Agreed Payments
                </Text>

                <Box mb={4}>
                  <Switch
                    isChecked={autocompleteEnabled}
                    onChange={(e) => setAutocompleteEnabled(e.target.checked)}
                    isDisabled={isLoading}
                  >
                    <Text ml={2}>Enable Autocomplete</Text>
                  </Switch>
                </Box>

                {autocompleteEnabled && (
                  <Alert status="info" mb={4}>
                    <Text>
                      When autocomplete is enabled, changing one month will
                      update all months with the same value.
                    </Text>
                  </Alert>
                )}

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f7fafc" }}>
                        <th
                          style={{
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            textAlign: "left",
                          }}
                        >
                          Payment Type
                        </th>
                        {defaultMonths.map((month) => (
                          <th
                            key={month.key}
                            style={{
                              padding: "12px",
                              border: "1px solid #e2e8f0",
                              textAlign: "center",
                            }}
                          >
                            {month.displayName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            fontWeight: "medium",
                          }}
                        >
                          Monthly Agreed
                        </td>
                        {defaultMonths.map((month) => {
                          const key = `${month.key}_agreed`;
                          const isDisabled = isMonthDisabled(month);
                          const value = formData.monthly_payments[key] || "0";

                          return (
                            <td
                              key={key}
                              style={{
                                padding: "8px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: isDisabled
                                  ? "#f7fafc"
                                  : Number(value) > 0
                                  ? "#f0fff4"
                                  : "#fef5e7",
                              }}
                            >
                              {!isDisabled ? (
                                <Input
                                  type="number"
                                  min="0"
                                  value={value}
                                  onChange={(e) =>
                                    handleMonthlyPaymentChange(
                                      key,
                                      e.target.value,
                                      "agreed"
                                    )
                                  }
                                  isDisabled={isLoading}
                                  size="sm"
                                />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Box>

              {/* Real Payments */}
              <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Real Payments
                </Text>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f7fafc" }}>
                        <th
                          style={{
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            textAlign: "left",
                          }}
                        >
                          Payment Type
                        </th>
                        {defaultMonths.map((month) => (
                          <th
                            key={month.key}
                            style={{
                              padding: "12px",
                              border: "1px solid #e2e8f0",
                              textAlign: "center",
                            }}
                          >
                            {month.displayName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "12px",
                            border: "1px solid #e2e8f0",
                            fontWeight: "medium",
                          }}
                        >
                          Monthly Real
                        </td>
                        {defaultMonths.map((month) => {
                          const key = `${month.key}_real`;
                          const isDisabled = isMonthDisabled(month);
                          const value = formData.real_payments[key] || 0;

                          return (
                            <td
                              key={key}
                              style={{
                                padding: "8px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: isDisabled
                                  ? "#f7fafc"
                                  : Number(value) > 0
                                  ? "#f0fff4"
                                  : "#fef5e7",
                              }}
                            >
                              {!isDisabled ? (
                                <Input
                                  type="number"
                                  min="0"
                                  value={value}
                                  onChange={(e) =>
                                    handleMonthlyPaymentChange(
                                      key,
                                      e.target.value,
                                      "real"
                                    )
                                  }
                                  isDisabled={isLoading}
                                  size="sm"
                                />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Box>

              {/* Observations */}
              <Box mb={6}>
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Observations
                </Text>
                <Textarea
                  value={formData.observations}
                  onChange={(e) =>
                    handleInputChange("observations", e.target.value)
                  }
                  placeholder="Enter any observations or notes..."
                  rows={3}
                  isDisabled={isLoading}
                />
              </Box>
            </Box>
          </Dialog.Body>

          <Dialog.Footer>
            {!isNew && student && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleDelete}
                isDisabled={isLoading}
                mr={3}
              >
                Delete Student
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              isDisabled={isLoading}
              mr={3}
            >
              Close
            </Button>

            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default StudentModalV3;
