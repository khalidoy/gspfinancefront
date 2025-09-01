import React, { useState, useEffect, useCallback } from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogCloseTrigger,
  Button,
  Field,
  FieldLabel,
  FieldErrorText,
  Input,
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
  NumberInputRoot,
  NumberInputInput,
  NumberInputIncrementTrigger,
  NumberInputDecrementTrigger,
  Textarea,
  VStack,
  HStack,
  Alert,
  AlertIndicator,
  Grid,
  GridItem,
  Text,
  Separator,
  Box,
  Badge,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { createToaster } from "@chakra-ui/react";
import {
  FaDollarSign,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";

const toaster = createToaster({
  placement: "top",
});

const PAYMENT_TYPES = [
  "TUITION",
  "TRANSPORT",
  "INSURANCE",
  "REGISTRATION",
  "BOOKS",
  "UNIFORM",
  "EXAM_FEE",
  "LIBRARY",
  "ACTIVITY",
  "OTHER",
];

const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "CHECK",
  "CREDIT_CARD",
  "MOBILE_MONEY",
  "ONLINE",
];

const PaymentModal = ({
  isOpen,
  onClose,
  onPaymentRecorded,
  selectedStudent = null,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    payment_type: "TUITION",
    payment_method: "CASH",
    payment_date: new Date().toISOString().split("T")[0],
    reference_number: "",
    notes: "",
    month_paid_for: "",
    year_paid_for: new Date().getFullYear(),
  });

  const [studentData, setStudentData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load student data function
  const loadStudentData = useCallback(async (studentId) => {
    if (!studentId) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/students/${studentId}`
      );
      if (response.data) {
        setStudentData(response.data);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      toaster.create({
        title: "Error",
        description: "Failed to load student information",
        status: "error",
        duration: 3000,
      });
    }
  }, []);

  // Reset form when modal opens/closes or selected student changes
  useEffect(() => {
    if (isOpen) {
      if (selectedStudent) {
        setFormData({
          amount: "",
          payment_type: "TUITION",
          payment_method: "CASH",
          payment_date: new Date().toISOString().split("T")[0],
          reference_number: "",
          notes: "",
          month_paid_for: "",
          year_paid_for: new Date().getFullYear(),
        });
        loadStudentData(selectedStudent.id);
      } else {
        setStudentData(null);
      }
      setErrors({});
    }
  }, [isOpen, selectedStudent, loadStudentData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.payment_date) {
      newErrors.payment_date = "Payment date is required";
    }

    if (!selectedStudent) {
      newErrors.student = "Please select a student";
    }

    // Validate month for recurring payments
    if (
      ["TUITION", "TRANSPORT"].includes(formData.payment_type) &&
      !formData.month_paid_for
    ) {
      newErrors.month_paid_for =
        "Month is required for tuition and transport payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toaster.create({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        student_id: selectedStudent.id,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        reference_number: formData.reference_number,
        notes: formData.notes,
        month_paid_for: formData.month_paid_for
          ? parseInt(formData.month_paid_for)
          : null,
        year_paid_for: formData.year_paid_for,
      };

      const response = await axios.post(
        "http://localhost:5000/payments/api/payments",
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toaster.create({
          title: "Payment Recorded",
          description: `Payment of $${formData.amount} has been successfully recorded for ${selectedStudent?.full_name}`,
          status: "success",
          duration: 3000,
        });

        onPaymentRecorded && onPaymentRecorded(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error recording payment:", error);

      let errorMessage = "An unexpected error occurred";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toaster.create({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
    })
      .format(amount || 0)
      .replace("MAD", "DH");
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1] || "";
  };

  if (!selectedStudent) {
    return (
      <DialogRoot
        open={isOpen}
        onOpenChange={(e) => !e.open && onClose()}
        size="md"
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <HStack gap={3}>
              <Box p={2} bg="orange.100" borderRadius="md">
                <Icon color="orange.600">
                  <FaExclamationTriangle />
                </Icon>
              </Box>
              <Text fontSize="lg" fontWeight="semibold">
                Record Payment
              </Text>
            </HStack>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            <Alert status="warning">
              <AlertIndicator>
                <Icon color="orange.500">
                  <FaExclamationTriangle />
                </Icon>
              </AlertIndicator>
              Please select a student first to record a payment.
            </Alert>
          </DialogBody>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    );
  }

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="xl"
    >
      <DialogBackdrop />
      <DialogContent maxW="900px">
        <DialogHeader>
          <HStack gap={3}>
            <Box p={2} bg="green.100" borderRadius="md">
              <Icon color="green.600">
                <FaDollarSign />
              </Icon>
            </Box>
            <Text fontSize="lg" fontWeight="semibold">
              Record Payment - {selectedStudent?.full_name}
            </Text>
          </HStack>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap={6} align="stretch">
            {/* Student Information */}
            {studentData && (
              <Box
                p={4}
                bg="blue.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="blue.500"
              >
                <SimpleGrid columns={2} gap={4}>
                  <Box>
                    <Text fontWeight="semibold" color="blue.700">
                      Student Details
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      ID: {studentData.student_id}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Class: {studentData.school_class || "Not assigned"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Academic Year:{" "}
                      {studentData.academic_year || "Not assigned"}
                    </Text>
                  </Box>

                  {studentData.financial_record && (
                    <Box>
                      <Text fontWeight="semibold" color="blue.700">
                        Financial Summary
                      </Text>
                      <HStack gap={2}>
                        <Badge colorPalette="green" size="sm">
                          Paid:{" "}
                          {formatCurrency(
                            studentData.financial_record.total_paid
                          )}
                        </Badge>
                        <Badge colorPalette="orange" size="sm">
                          Balance:{" "}
                          {formatCurrency(
                            studentData.financial_record.outstanding_balance
                          )}
                        </Badge>
                      </HStack>
                    </Box>
                  )}
                </SimpleGrid>
              </Box>
            )}

            {/* Payment Information */}
            <VStack gap={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Payment Information
              </Text>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Field invalid={errors.amount} required>
                    <FieldLabel>Amount</FieldLabel>
                    <NumberInputRoot
                      value={formData.amount}
                      onValueChange={(e) =>
                        handleInputChange("amount", e.value)
                      }
                      min={0}
                      formatOptions={{
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                    >
                      <NumberInputInput placeholder="0.00" />
                      <NumberInputIncrementTrigger />
                      <NumberInputDecrementTrigger />
                    </NumberInputRoot>
                    {errors.amount && (
                      <FieldErrorText>{errors.amount}</FieldErrorText>
                    )}
                  </Field>
                </GridItem>

                <GridItem>
                  <Field invalid={errors.payment_date} required>
                    <FieldLabel>Payment Date</FieldLabel>
                    <Input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) =>
                        handleInputChange("payment_date", e.target.value)
                      }
                    />
                    {errors.payment_date && (
                      <FieldErrorText>{errors.payment_date}</FieldErrorText>
                    )}
                  </Field>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Field required>
                    <FieldLabel>Payment Type</FieldLabel>
                    <SelectRoot
                      value={[formData.payment_type]}
                      onValueChange={(e) =>
                        handleInputChange("payment_type", e.value[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TYPES.map((type) => (
                          <SelectItem key={type} item={type}>
                            {type
                              .replace("_", " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                </GridItem>

                <GridItem>
                  <Field required>
                    <FieldLabel>Payment Method</FieldLabel>
                    <SelectRoot
                      value={[formData.payment_method]}
                      onValueChange={(e) =>
                        handleInputChange("payment_method", e.value[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} item={method}>
                            {method
                              .replace("_", " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                </GridItem>
              </Grid>

              {/* Month and Year for recurring payments */}
              {["TUITION", "TRANSPORT"].includes(formData.payment_type) && (
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <Field invalid={errors.month_paid_for} required>
                      <FieldLabel>Month Paid For</FieldLabel>
                      <SelectRoot
                        value={
                          formData.month_paid_for
                            ? [formData.month_paid_for]
                            : []
                        }
                        onValueChange={(e) =>
                          handleInputChange("month_paid_for", e.value[0])
                        }
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <SelectItem key={month} item={month.toString()}>
                                {getMonthName(month)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </SelectRoot>
                      {errors.month_paid_for && (
                        <FieldErrorText>{errors.month_paid_for}</FieldErrorText>
                      )}
                    </Field>
                  </GridItem>

                  <GridItem>
                    <Field required>
                      <FieldLabel>Year</FieldLabel>
                      <NumberInputRoot
                        value={formData.year_paid_for.toString()}
                        onValueChange={(e) =>
                          handleInputChange(
                            "year_paid_for",
                            parseInt(e.value) || new Date().getFullYear()
                          )
                        }
                        min={2020}
                        max={2030}
                      >
                        <NumberInputInput />
                        <NumberInputIncrementTrigger />
                        <NumberInputDecrementTrigger />
                      </NumberInputRoot>
                    </Field>
                  </GridItem>
                </Grid>
              )}

              <Field>
                <FieldLabel>Reference Number</FieldLabel>
                <Input
                  value={formData.reference_number}
                  onChange={(e) =>
                    handleInputChange("reference_number", e.target.value)
                  }
                  placeholder="Receipt number, transaction ID, etc."
                />
              </Field>

              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about this payment..."
                  rows={3}
                />
              </Field>
            </VStack>

            {/* Payment Summary */}
            {formData.amount && (
              <>
                <Separator />
                <Alert status="info">
                  <AlertIndicator>
                    <Icon color="blue.500">
                      <FaInfoCircle />
                    </Icon>
                  </AlertIndicator>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold">Payment Summary:</Text>
                    <Text fontSize="sm">
                      {formatCurrency(formData.amount)} payment for{" "}
                      {formData.payment_type.toLowerCase().replace("_", " ")}
                      {formData.month_paid_for &&
                        ` (${getMonthName(parseInt(formData.month_paid_for))} ${
                          formData.year_paid_for
                        })`}
                    </Text>
                    <Text fontSize="sm">
                      Method:{" "}
                      {formData.payment_method.toLowerCase().replace("_", " ")}{" "}
                      • Date: {formData.payment_date}
                    </Text>
                  </VStack>
                </Alert>
              </>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorPalette="green"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Recording Payment..."
          >
            <Icon>
              <FaDollarSign />
            </Icon>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default PaymentModal;
