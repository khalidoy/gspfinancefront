import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseTrigger,
  DialogRoot,
  DialogBody,
  DialogBackdrop,
  Box,
  Text,
  HStack,
  VStack,
  Badge,
  SimpleGrid,
  Separator,
  Spinner,
  Center,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
} from "@chakra-ui/react";
import { FaUser, FaMoneyBillWave, FaPhoneAlt } from "react-icons/fa";

const StudentDetailModal = ({
  isOpen,
  onClose,
  studentId,
  studentData,
  loading,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).replace("MAD", "DH");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "INACTIVE":
        return "red";
      case "SUSPENDED":
        return "orange";
      case "GRADUATED":
        return "blue";
      case "TRANSFERRED":
        return "purple";
      default:
        return "gray";
    }
  };

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case "TUITION":
        return "blue";
      case "TRANSPORT":
        return "green";
      case "INSURANCE":
        return "orange";
      case "REGISTRATION":
        return "purple";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="2xl"
      placement="center"
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <HStack spacing={3}>
              <Box p={2} bg="blue.100" borderRadius="lg" color="blue.600">
                <FaUser size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  {loading
                    ? "Loading..."
                    : studentData?.full_name || "Student Details"}
                </Text>
                {!loading && studentData && (
                  <HStack>
                    <Text fontSize="sm" color="gray.600">
                      ID: {studentData.student_id}
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(
                        studentData.enrollment_status
                      )}
                    >
                      {studentData.enrollment_status}
                    </Badge>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          {loading ? (
            <Center p={8}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Loading student details...</Text>
              </VStack>
            </Center>
          ) : studentData ? (
            <VStack spacing={6} align="stretch">
              {/* Student Information */}
              <Box>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  mb={3}
                  color="gray.700"
                >
                  Student Information
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Full Name
                    </Text>
                    <Text fontWeight="medium">{studentData.full_name}</Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Class
                    </Text>
                    <Text fontWeight="medium">
                      {studentData.class_name || "N/A"}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Academic Year
                    </Text>
                    <Text fontWeight="medium">
                      {studentData.academic_year || "N/A"}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Status
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(
                        studentData.enrollment_status
                      )}
                    >
                      {studentData.enrollment_status}
                    </Badge>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Contact Information */}
              <Box>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  mb={3}
                  color="gray.700"
                >
                  <HStack>
                    <FaPhoneAlt />
                    <Text>Contact Information</Text>
                  </HStack>
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Student Email
                    </Text>
                    <Text fontWeight="medium">
                      {studentData.contact_info?.email || "Not provided"}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Student Phone
                    </Text>
                    <Text fontWeight="medium">
                      {studentData.contact_info?.phone || "Not provided"}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Parent Name
                    </Text>
                    <Text fontWeight="medium">
                      {studentData.contact_info?.parent_name || "Not provided"}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Parent Phone
                    </Text>
                    <Text fontWeight="medium">
                      {studentData.contact_info?.parent_phone || "Not provided"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Financial Summary */}
              <Box>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  mb={3}
                  color="gray.700"
                >
                  <HStack>
                    <FaMoneyBillWave />
                    <Text>Financial Summary</Text>
                  </HStack>
                </Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="blue.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Agreed
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {formatCurrency(
                        studentData.financial_summary?.total_agreed || 0
                      )}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="green.50"
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Total Paid
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {formatCurrency(
                        studentData.financial_summary?.total_paid || 0
                      )}
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg={
                      studentData.financial_summary?.outstanding_balance > 0
                        ? "red.50"
                        : "green.50"
                    }
                  >
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Outstanding Balance
                    </Text>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={
                        studentData.financial_summary?.outstanding_balance > 0
                          ? "red.600"
                          : "green.600"
                      }
                    >
                      {formatCurrency(
                        studentData.financial_summary?.outstanding_balance || 0
                      )}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Separator />

              {/* Recent Transactions */}
              <Box>
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  mb={3}
                  color="gray.700"
                >
                  Recent Transactions
                </Text>
                {studentData.recent_transactions &&
                studentData.recent_transactions.length > 0 ? (
                  <Box overflowX="auto">
                    <TableRoot size="sm" variant="outline">
                      <TableHeader bg="gray.50">
                        <TableRow>
                          <TableColumnHeader>Date</TableColumnHeader>
                          <TableColumnHeader>Type</TableColumnHeader>
                          <TableColumnHeader>Month</TableColumnHeader>
                          <TableColumnHeader>Amount</TableColumnHeader>
                          <TableColumnHeader>Method</TableColumnHeader>
                          <TableColumnHeader>Notes</TableColumnHeader>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentData.recent_transactions.map(
                          (transaction, index) => (
                            <TableRow key={transaction.id || index}>
                              <TableCell>
                                <Text fontSize="sm">
                                  {formatDate(transaction.payment_date)}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  colorScheme={getPaymentTypeColor(
                                    transaction.payment_type
                                  )}
                                  variant="subtle"
                                >
                                  {transaction.payment_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Text fontSize="sm" textTransform="capitalize">
                                  {transaction.payment_month || "N/A"}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Text fontWeight="medium" color="green.600">
                                  {formatCurrency(transaction.amount)}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Text fontSize="sm">
                                  {transaction.payment_method || "N/A"}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Text fontSize="sm" color="gray.600">
                                  {transaction.notes || "-"}
                                </Text>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </TableRoot>
                  </Box>
                ) : (
                  <Box
                    p={6}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                    textAlign="center"
                  >
                    <Text color="gray.500">No recent transactions found</Text>
                  </Box>
                )}
              </Box>
            </VStack>
          ) : (
            <Center p={8}>
              <Text color="red.500">Failed to load student details</Text>
            </Center>
          )}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default StudentDetailModal;
