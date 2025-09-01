import React, { useState, useEffect, useCallback } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import {
  FaUser,
  FaMoneyBillWave,
  FaHistory,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";

const StudentDetailDrawer = ({
  isOpen,
  onClose,
  studentId,
  studentData,
  loading,
  onStudentUpdated,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    enrollment_status: "ACTIVE",
    transport_fees: 0,
    lunch_fees: 0,
    class_id: "",
    contact_info: {
      phone: "",
      email: "",
      address: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadPaymentHistory = useCallback(async () => {
    if (!studentId) return;

    setLoadingHistory(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payments/student/${studentId}/history`
      );
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error("Error loading payment history:", error);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [studentId]);

  // Reset form when modal opens/closes or studentData changes
  useEffect(() => {
    if (isOpen && studentData) {
      setFormData({
        first_name: studentData.first_name || "",
        last_name: studentData.last_name || "",
        enrollment_status: studentData.enrollment_status || "ACTIVE",
        transport_fees: studentData.transport_fees || 0,
        lunch_fees: studentData.lunch_fees || 0,
        class_id: studentData.class_id || "",
        contact_info: {
          phone: studentData.contact_info?.phone || "",
          email: studentData.contact_info?.email || "",
          address: studentData.contact_info?.address || "",
        },
      });

      // Load payment history
      if (studentId) {
        loadPaymentHistory();
      }
    }
  }, [isOpen, studentData, studentId, loadPaymentHistory]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!studentData?.student_id) return;

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        transport_fees: Number(formData.transport_fees),
        lunch_fees: Number(formData.lunch_fees),
      };

      const response = await axios.put(
        `http://localhost:5000/api/students/${studentData.student_id}`,
        updateData
      );

      if (response.data.success) {
        onStudentUpdated && onStudentUpdated(response.data.student);
        onClose();
      }
    } catch (error) {
      console.error("Error updating student:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "red";
      case "GRADUATED":
        return "blue";
      case "TRANSFERRED":
        return "orange";
      default:
        return "gray";
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0 DH";
    return `${Number(amount).toLocaleString()} DH`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "GRADUATED", label: "Graduated" },
    { value: "TRANSFERRED", label: "Transferred" },
  ];

  return (
    <>
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex="1000"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <Box
            bg="white"
            borderRadius="lg"
            maxH="90vh"
            overflowY="auto"
            maxW="4xl"
            w="90%"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Box p={6} borderBottom="1px" borderColor="gray.200">
              <HStack spacing={3} justify="space-between">
                <HStack spacing={3}>
                  <Box p={2} bg="blue.100" borderRadius="lg" color="blue.600">
                    <FaUser size={20} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="lg" fontWeight="bold">
                      {loading ? "Loading Student..." : "Student Details"}
                    </Text>
                    {!loading && studentData && (
                      <HStack>
                        <Text fontSize="sm" color="gray.600">
                          ID: {studentData.student_id}
                        </Text>
                        <Badge
                          colorScheme={getStatusColor(
                            formData.enrollment_status
                          )}
                        >
                          {formData.enrollment_status}
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </HStack>
                <Button variant="ghost" onClick={onClose} size="sm">
                  <FaTimes />
                </Button>
              </HStack>
            </Box>

            <Box p={6}>
              {loading ? (
                <Center py={10}>
                  <VStack spacing={3}>
                    <Spinner size="lg" color="blue.500" />
                    <Text color="gray.600">Loading student information...</Text>
                  </VStack>
                </Center>
              ) : (
                <VStack spacing={6} align="stretch">
                  {/* Personal Information Section */}
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={0}
                    bg="white"
                    shadow="sm"
                  >
                    <Box p={4} borderBottom="1px" borderColor="gray.200">
                      <HStack justify="space-between">
                        <HStack>
                          <Box
                            p={2}
                            bg="blue.100"
                            borderRadius="lg"
                            color="blue.600"
                          >
                            <FaEdit />
                          </Box>
                          <Heading size="md">Personal Information</Heading>
                        </HStack>
                      </HStack>
                    </Box>
                    <Box p={4}>
                      <VStack spacing={4} align="stretch">
                        <HStack spacing={4}>
                          <VStack align="start" spacing={2} flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              First Name
                            </Text>
                            <Input
                              value={formData.first_name}
                              onChange={(e) =>
                                handleInputChange("first_name", e.target.value)
                              }
                              placeholder="Enter first name"
                            />
                          </VStack>
                          <VStack align="start" spacing={2} flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              Last Name
                            </Text>
                            <Input
                              value={formData.last_name}
                              onChange={(e) =>
                                handleInputChange("last_name", e.target.value)
                              }
                              placeholder="Enter last name"
                            />
                          </VStack>
                        </HStack>
                      </VStack>

                      <VStack align="start" spacing={2} mt={4}>
                        <Text fontSize="sm" fontWeight="medium">
                          Enrollment Status
                        </Text>
                        <Select
                          value={formData.enrollment_status}
                          onValueChange={(value) =>
                            handleInputChange("enrollment_status", value)
                          }
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Contact Information Section */}
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={0}
                    bg="white"
                    shadow="sm"
                  >
                    <Box p={4} borderBottom="1px" borderColor="gray.200">
                      <HStack>
                        <Box
                          p={2}
                          bg="green.100"
                          borderRadius="lg"
                          color="green.600"
                        >
                          <FaUser />
                        </Box>
                        <Heading size="md">Contact Information</Heading>
                      </HStack>
                    </Box>
                    <Box p={4}>
                      <VStack spacing={4} align="stretch">
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            Phone
                          </Text>
                          <Input
                            value={formData.contact_info.phone}
                            onChange={(e) =>
                              handleInputChange(
                                "contact_info.phone",
                                e.target.value
                              )
                            }
                            placeholder="Enter phone number"
                          />
                        </VStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            Email
                          </Text>
                          <Input
                            type="email"
                            value={formData.contact_info.email}
                            onChange={(e) =>
                              handleInputChange(
                                "contact_info.email",
                                e.target.value
                              )
                            }
                            placeholder="Enter email address"
                          />
                        </VStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            Address
                          </Text>
                          <Textarea
                            value={formData.contact_info.address}
                            onChange={(e) =>
                              handleInputChange(
                                "contact_info.address",
                                e.target.value
                              )
                            }
                            placeholder="Enter address"
                            rows={3}
                          />
                        </VStack>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Payment Information Section */}
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={0}
                    bg="white"
                    shadow="sm"
                  >
                    <Box p={4} borderBottom="1px" borderColor="gray.200">
                      <HStack>
                        <Box
                          p={2}
                          bg="orange.100"
                          borderRadius="lg"
                          color="orange.600"
                        >
                          <FaMoneyBillWave />
                        </Box>
                        <Heading size="md">Fee Structure</Heading>
                      </HStack>
                    </Box>
                    <Box p={4}>
                      <VStack spacing={4} align="stretch">
                        <HStack spacing={4}>
                          <VStack align="start" spacing={2} flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              Transport Fees (DH)
                            </Text>
                            <Input
                              type="number"
                              value={formData.transport_fees}
                              onChange={(e) =>
                                handleInputChange(
                                  "transport_fees",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                            />
                          </VStack>
                          <VStack align="start" spacing={2} flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              Lunch Fees (DH)
                            </Text>
                            <Input
                              type="number"
                              value={formData.lunch_fees}
                              onChange={(e) =>
                                handleInputChange("lunch_fees", e.target.value)
                              }
                              placeholder="0"
                            />
                          </VStack>
                        </HStack>
                      </VStack>

                      <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                        <Text fontWeight="bold" mb={2}>
                          Current Monthly Fees:
                        </Text>
                        <HStack justify="space-between">
                          <Text>Transport:</Text>
                          <Text fontWeight="semibold">
                            {formatCurrency(formData.transport_fees)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Lunch:</Text>
                          <Text fontWeight="semibold">
                            {formatCurrency(formData.lunch_fees)}
                          </Text>
                        </HStack>
                        <Separator my={2} />
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Total:</Text>
                          <Text fontWeight="bold" color="blue.600">
                            {formatCurrency(
                              Number(formData.transport_fees) +
                                Number(formData.lunch_fees)
                            )}
                          </Text>
                        </HStack>
                      </Box>
                    </Box>
                  </Box>

                  {/* Payment History Section */}
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    p={0}
                    bg="white"
                    shadow="sm"
                  >
                    <Box p={4} borderBottom="1px" borderColor="gray.200">
                      <HStack>
                        <Box
                          p={2}
                          bg="purple.100"
                          borderRadius="lg"
                          color="purple.600"
                        >
                          <FaHistory />
                        </Box>
                        <Heading size="md">Payment History</Heading>
                      </HStack>
                    </Box>
                    <Box p={4}>
                      {loadingHistory ? (
                        <Center py={6}>
                          <VStack spacing={3}>
                            <Spinner size="lg" color="blue.500" />
                            <Text color="gray.600">
                              Loading payment history...
                            </Text>
                          </VStack>
                        </Center>
                      ) : paymentHistory.length === 0 ? (
                        <Box
                          p={6}
                          bg="blue.50"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="blue.200"
                          textAlign="center"
                        >
                          <VStack spacing={2}>
                            <Text fontWeight="bold" color="blue.700">
                              No payment history found!
                            </Text>
                            <Text color="blue.600" fontSize="sm">
                              This student doesn't have any payment records yet.
                            </Text>
                          </VStack>
                        </Box>
                      ) : (
                        <VStack spacing={3} align="stretch">
                          {paymentHistory.map((payment, index) => (
                            <Box
                              key={index}
                              borderWidth="1px"
                              borderRadius="md"
                              p={4}
                              bg="gray.50"
                            >
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">
                                    {payment.month} {payment.year}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Paid on: {formatDate(payment.payment_date)}
                                  </Text>
                                  {payment.notes && (
                                    <Text fontSize="sm" color="gray.500">
                                      Notes: {payment.notes}
                                    </Text>
                                  )}
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Text fontWeight="bold" color="green.600">
                                    {formatCurrency(payment.amount_paid)}
                                  </Text>
                                  <Badge colorScheme="green" size="sm">
                                    Paid
                                  </Badge>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </VStack>
              )}
            </Box>

            <Box p={6} borderTop="1px" borderColor="gray.200">
              <HStack spacing={3} w="full" justify="end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  leftIcon={<FaTimes />}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving..."
                  leftIcon={<FaSave />}
                  isDisabled={!studentData || loading}
                >
                  Save Changes
                </Button>
              </HStack>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default StudentDetailDrawer;
