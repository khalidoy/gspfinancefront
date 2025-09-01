import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableScrollArea,
  TableColumnHeader,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Alert,
  AlertIndicator,
  Spinner,
  Grid,
  GridItem,
  NativeSelect,
  Input,
  InputGroup,
  InputElement,
  IconButton,
  Tooltip,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  SimpleGrid,
  createToaster,
} from "@chakra-ui/react";
import {
  FiSearch as SearchIcon,
  FiPlus as AddIcon,
  FiEye as ViewIcon,
} from "react-icons/fi";
import axios from "axios";
import PaymentModal from "../components/PaymentModal";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    payment_type: "",
    payment_method: "",
    search: "",
    date_from: "",
    date_to: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStats, setPaymentStats] = useState({
    total_amount: 0,
    total_payments: 0,
    by_type: {},
    by_method: {},
  });
  const toaster = createToaster({
    placement: "top-right",
  });

  const toast = useCallback(
    (options) => {
      toaster.create({
        title: options.title,
        description: options.description,
        status: options.status,
        duration: options.duration || 5000,
        isClosable: true,
      });
    },
    [toaster]
  );

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

  // Load payments data
  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/payments/api/payments"
      );

      if (response.data && response.data.payments) {
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);
        calculateStats(response.data.payments);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      setError("Failed to load payments data");
      toast({
        title: "Error",
        description: "Failed to load payments data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load students for payment modal
  const loadStudents = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/students/api");
      if (response.data && response.data.students) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  }, []);

  // Calculate payment statistics
  const calculateStats = (paymentsData) => {
    const stats = {
      total_amount: 0,
      total_payments: paymentsData.length,
      by_type: {},
      by_method: {},
    };

    paymentsData.forEach((payment) => {
      stats.total_amount += payment.amount;

      // By type
      if (stats.by_type[payment.payment_type]) {
        stats.by_type[payment.payment_type] += payment.amount;
      } else {
        stats.by_type[payment.payment_type] = payment.amount;
      }

      // By method
      if (stats.by_method[payment.payment_method]) {
        stats.by_method[payment.payment_method] += payment.amount;
      } else {
        stats.by_method[payment.payment_method] = payment.amount;
      }
    });

    setPaymentStats(stats);
  };

  // Load data on component mount
  useEffect(() => {
    loadPayments();
    loadStudents();
  }, [loadPayments, loadStudents]);

  // Filter payments when filters change
  useEffect(() => {
    let filtered = payments;

    if (filters.payment_type) {
      filtered = filtered.filter(
        (payment) => payment.payment_type === filters.payment_type
      );
    }

    if (filters.payment_method) {
      filtered = filtered.filter(
        (payment) => payment.payment_method === filters.payment_method
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.student_name.toLowerCase().includes(searchLower) ||
          payment.student_id.toLowerCase().includes(searchLower) ||
          payment.reference_number?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.date_from) {
      filtered = filtered.filter(
        (payment) =>
          new Date(payment.payment_date) >= new Date(filters.date_from)
      );
    }

    if (filters.date_to) {
      filtered = filtered.filter(
        (payment) => new Date(payment.payment_date) <= new Date(filters.date_to)
      );
    }

    setFilteredPayments(filtered);
    calculateStats(filtered);
  }, [payments, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePayment = () => {
    if (students.length === 0) {
      toast({
        title: "No Students Available",
        description: "Please add students first before recording payments.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedStudent(students[0]); // Select first student by default
    setIsPaymentModalOpen(true);
  };

  const handlePaymentRecorded = () => {
    loadPayments(); // Reload payments data
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
    })
      .format(amount || 0)
      .replace("MAD", "DH");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPaymentType = (type) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatPaymentMethod = (method) => {
    return method
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading payments...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIndicator />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="lg">
            Payments Management
          </Heading>
          <Button colorScheme="green" onClick={handleCreatePayment}>
            <AddIcon style={{ marginRight: "8px" }} />
            Record Payment
          </Button>
        </HStack>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Amount</StatLabel>
                <StatValueText color="green.500">
                  {formatCurrency(paymentStats.total_amount)}
                </StatValueText>
                <StatHelpText>{filteredPayments.length} payments</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tuition Payments</StatLabel>
                <StatValueText>
                  {formatCurrency(paymentStats.by_type.TUITION || 0)}
                </StatValueText>
                <StatHelpText>Most common type</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Transport Payments</StatLabel>
                <StatValueText>
                  {formatCurrency(paymentStats.by_type.TRANSPORT || 0)}
                </StatValueText>
                <StatHelpText>Secondary income</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Cash Payments</StatLabel>
                <StatValueText>
                  {formatCurrency(paymentStats.by_method.CASH || 0)}
                </StatValueText>
                <StatHelpText>Preferred method</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card>
          <CardHeader>
            <Text fontWeight="semibold">Filters</Text>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={4}
            >
              <GridItem>
                <Text fontSize="sm" mb={2}>
                  Payment Type
                </Text>
                <NativeSelect
                  value={filters.payment_type}
                  onChange={(e) =>
                    handleFilterChange("payment_type", e.target.value)
                  }
                  placeholder="All types"
                >
                  <option value="">All types</option>
                  {PAYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatPaymentType(type)}
                    </option>
                  ))}
                </NativeSelect>
              </GridItem>

              <GridItem>
                <Text fontSize="sm" mb={2}>
                  Payment Method
                </Text>
                <NativeSelect
                  value={filters.payment_method}
                  onChange={(e) =>
                    handleFilterChange("payment_method", e.target.value)
                  }
                  placeholder="All methods"
                >
                  <option value="">All methods</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {formatPaymentMethod(method)}
                    </option>
                  ))}
                </NativeSelect>
              </GridItem>

              <GridItem>
                <Text fontSize="sm" mb={2}>
                  From Date
                </Text>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) =>
                    handleFilterChange("date_from", e.target.value)
                  }
                />
              </GridItem>

              <GridItem>
                <Text fontSize="sm" mb={2}>
                  To Date
                </Text>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) =>
                    handleFilterChange("date_to", e.target.value)
                  }
                />
              </GridItem>

              <GridItem>
                <Text fontSize="sm" mb={2}>
                  Search
                </Text>
                <InputGroup>
                  <InputElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputElement>
                  <Input
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Search by student name, ID, or reference..."
                  />
                </InputGroup>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontWeight="semibold">
                Payment Transactions ({filteredPayments.length})
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableScrollArea>
              <Table variant="simple">
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>Date</TableColumnHeader>
                    <TableColumnHeader>Student</TableColumnHeader>
                    <TableColumnHeader>Amount</TableColumnHeader>
                    <TableColumnHeader>Type</TableColumnHeader>
                    <TableColumnHeader>Method</TableColumnHeader>
                    <TableColumnHeader>Reference</TableColumnHeader>
                    <TableColumnHeader>Actions</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {formatDate(payment.payment_date)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(payment.payment_date).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Text>
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {payment.student_name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ID: {payment.student_id}
                          </Text>
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <Text fontWeight="bold" color="green.600">
                          {formatCurrency(payment.amount)}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme="blue" variant="subtle">
                          {formatPaymentType(payment.payment_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme="purple" variant="outline">
                          {formatPaymentMethod(payment.payment_method)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Text fontSize="sm" color="gray.600">
                          {payment.reference_number || "N/A"}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <HStack spacing={2}>
                          <Tooltip content="View details">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() =>
                                console.log("View payment:", payment.id)
                              }
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </HStack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScrollArea>

            {filteredPayments.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">
                  {payments.length === 0
                    ? "No payments recorded yet. Create your first payment to get started!"
                    : "No payments match your current filters."}
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentRecorded={handlePaymentRecorded}
          selectedStudent={selectedStudent}
        />
      </VStack>
    </Container>
  );
};

export default Payments;
