import React from "react";
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  Badge,
  Text,
  HStack,
  VStack,
  Spinner,
  Center,
  Box,
  IconButton,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { FaEye, FaEdit, FaMoneyBillWave } from "react-icons/fa";

function StudentTable({ students, loading, onRowClick, onInlineEdit }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { colorScheme: "green", label: "Active" },
      WITHDRAWN: { colorScheme: "red", label: "Withdrawn" },
      SUSPENDED: { colorScheme: "orange", label: "Suspended" },
      GRADUATED: { colorScheme: "blue", label: "Graduated" },
      TRANSFERRED: { colorScheme: "purple", label: "Transferred" },
    };

    const config = statusConfig[status] || {
      colorScheme: "gray",
      label: status,
    };

    return (
      <Badge colorScheme={config.colorScheme} variant="subtle" px={2} py={1}>
        {config.label}
      </Badge>
    );
  };

  const getFinancialStatus = (financial) => {
    if (!financial) {
      return <Badge colorScheme="gray">No Data</Badge>;
    }

    const { total_agreed = 0, total_paid = 0 } = financial;

    if (total_paid >= total_agreed) {
      return <Badge colorScheme="green">Paid</Badge>;
    } else if (total_paid > 0) {
      return <Badge colorScheme="orange">Partial</Badge>;
    } else {
      return <Badge colorScheme="red">Unpaid</Badge>;
    }
  };

  if (loading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading students...</Text>
        </VStack>
      </Center>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.500">
            No students found
          </Text>
          <Text fontSize="sm" color="gray.400">
            Add some students to get started
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box overflowX="auto">
      <TableRoot size="sm" variant="outline">
        <TableHeader bg="gray.50">
          <TableRow>
            <TableColumnHeader border="1px" borderColor="gray.200" py={4}>
              Student Info
            </TableColumnHeader>
            <TableColumnHeader border="1px" borderColor="gray.200">
              Class & Year
            </TableColumnHeader>
            <TableColumnHeader border="1px" borderColor="gray.200">
              Status
            </TableColumnHeader>
            <TableColumnHeader border="1px" borderColor="gray.200">
              Financial Status
            </TableColumnHeader>
            <TableColumnHeader border="1px" borderColor="gray.200">
              Contact
            </TableColumnHeader>
            <TableColumnHeader border="1px" borderColor="gray.200">
              Actions
            </TableColumnHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow
              key={student._id}
              bg={index % 2 === 0 ? "white" : "gray.25"}
              _hover={{ bg: "gray.50" }}
              cursor="pointer"
              onClick={() => onRowClick && onRowClick(student)}
            >
              <TableCell border="1px" borderColor="gray.200" p={4}>
                <HStack spacing={3}>
                  <Avatar size="sm" name={student.full_name} bg="blue.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium" fontSize="sm">
                      {student.full_name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      ID: {student.student_id}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {student.birth_date
                        ? new Date(student.birth_date).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </VStack>
                </HStack>
              </TableCell>

              <TableCell border="1px" borderColor="gray.200">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {student.class_id?.name || "No Class"}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {student.academic_year || "N/A"}
                  </Text>
                </VStack>
              </TableCell>

              <TableCell border="1px" borderColor="gray.200">
                {getStatusBadge(student.status)}
              </TableCell>

              <TableCell border="1px" borderColor="gray.200">
                {getFinancialStatus(student.financial_summary)}
              </TableCell>

              <TableCell border="1px" borderColor="gray.200">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="gray.600">
                    {student.guardian_phone || "No Phone"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {student.guardian_email || "No Email"}
                  </Text>
                </VStack>
              </TableCell>

              <TableCell border="1px" borderColor="gray.200">
                <Flex justify="center">
                  <HStack spacing={1}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      icon={<FaEye />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(student);
                      }}
                    />

                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      icon={<FaMoneyBillWave />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle quick payment
                      }}
                    />

                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="orange"
                      icon={<FaEdit />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(student);
                      }}
                    />
                  </HStack>
                </Flex>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </Box>
  );
}

export default StudentTable;
