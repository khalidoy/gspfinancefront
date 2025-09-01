import React, { memo, useState } from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Spinner,
  Center,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  Badge,
  Input,
} from "@chakra-ui/react";

const PaymentGrid = ({
  studentGrid,
  months,
  loading,
  onStudentClick,
  summary,
  onInlineEdit, // New prop for inline editing
  onAgreedEdit, // New prop for editing agreed amounts
}) => {
  const [editingCell, setEditingCell] = useState(null); // { studentId, month, type, editType: 'paid' | 'agreed' }
  const [editValue, setEditValue] = useState("");
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace("MAD", "DH");
  };

  const handleCellClick = (
    studentId,
    month,
    currentValue,
    e,
    paymentType = "tuition",
    editType = "paid"
  ) => {
    e.stopPropagation(); // Prevent row click

    // Check if this cell is disabled (before enrollment)
    const student = studentGrid.find((s) => s.id === studentId);
    if (student && isMonthBeforeEnrollment(student, month)) {
      return; // Don't allow editing disabled cells
    }

    setEditingCell({ studentId, month, type: paymentType, editType });
    // Don't show "0" - start with empty string if value is 0
    setEditValue(currentValue === 0 ? "" : currentValue.toString());
  };

  const handleCellSave = async (
    studentId,
    month,
    paymentType = "tuition",
    editType = "paid"
  ) => {
    const enteredAmount = parseFloat(editValue) || 0;

    if (editType === "agreed") {
      // Handle agreed amount editing with validation

      // Get current paid amount for validation
      const student = studentGrid.find((s) => s.id === studentId);
      let currentPaidAmount = 0;

      if (month === "insurance") {
        currentPaidAmount = student?.insurance?.paid || 0;
      } else {
        const monthData = student?.months[month];
        currentPaidAmount = monthData?.[paymentType]?.paid || 0;
      }

      // Validation for agreed amounts
      let MAX_AGREED_AMOUNT = 5000; // Default for monthly payments
      if (month === "insurance") {
        MAX_AGREED_AMOUNT = 1500;
      }

      // 1. Check maximum agreed amount
      if (enteredAmount > MAX_AGREED_AMOUNT) {
        alert(`Agreed amount cannot exceed ${MAX_AGREED_AMOUNT} DH`);
        setEditingCell(null);
        setEditValue("");
        return;
      }

      // 2. Check if agreed amount is smaller than current paid amount
      if (currentPaidAmount > 0 && enteredAmount < currentPaidAmount) {
        alert(
          `Agreed amount (${enteredAmount} DH) cannot be smaller than already paid amount (${currentPaidAmount} DH)`
        );
        setEditingCell(null);
        setEditValue("");
        return;
      }

      if (onAgreedEdit) {
        await onAgreedEdit(studentId, month, paymentType, enteredAmount);
      }
    } else {
      // Handle paid amount editing (existing logic)
      if (onInlineEdit) {
        const paymentKey = `${month}_${paymentType}_real`;

        // Get the current data for validation
        const student = studentGrid.find((s) => s.id === studentId);

        let agreedAmount = 0;

        // Handle insurance vs monthly payments differently
        if (month === "insurance") {
          agreedAmount = student?.insurance?.agreed || 0;
        } else {
          const monthData = student?.months[month];
          agreedAmount = monthData?.[paymentType]?.agreed || 0;
        }

        // Validation logic
        let MAX_AMOUNT = 2500; // Default for monthly payments

        // Different max amount for insurance
        if (month === "insurance") {
          MAX_AMOUNT = 1500;
        }

        // 1. Check maximum amount
        if (enteredAmount > MAX_AMOUNT) {
          alert(`Amount cannot exceed ${MAX_AMOUNT} DH`);
          setEditingCell(null);
          setEditValue("");
          return;
        }

        // 2. Check if amount exceeds agreed (unless agreed is 0)
        if (agreedAmount > 0 && enteredAmount > agreedAmount) {
          alert(`Amount cannot exceed agreed amount of ${agreedAmount} DH`);
          setEditingCell(null);
          setEditValue("");
          return;
        }

        // 3. For insurance: if both agreed and paid were 0, and we're entering a paid amount,
        // we'll set the agreed amount to the same value
        let shouldSetAgreedToSame = false;
        if (month === "insurance" && editType === "paid") {
          const currentPaidAmount = student?.insurance?.paid || 0;
          if (
            agreedAmount === 0 &&
            currentPaidAmount === 0 &&
            enteredAmount > 0
          ) {
            shouldSetAgreedToSame = true;
          }
        }

        // 4. If agreed is 0, we'll set this amount as agreed for all next months (not applicable for insurance)
        const shouldUpdateAgreedAmounts =
          month !== "insurance" && agreedAmount === 0 && enteredAmount > 0;

        await onInlineEdit(
          studentId,
          paymentKey,
          editValue,
          shouldUpdateAgreedAmounts,
          shouldSetAgreedToSame
        );
      }
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyPress = (
    e,
    studentId,
    month,
    paymentType = "tuition",
    editType = "paid"
  ) => {
    if (e.key === "Enter") {
      handleCellSave(studentId, month, paymentType, editType);
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleInputBlur = (
    studentId,
    month,
    paymentType = "tuition",
    editType = "paid"
  ) => {
    handleCellSave(studentId, month, paymentType, editType);
  };

  // Helper function to check if month is before student enrollment
  const isMonthBeforeEnrollment = (student, month) => {
    // Insurance is never disabled
    if (month === "insurance") {
      return false;
    }

    const enrollmentMonth = student.joined_month || 9; // Default to September if not set

    // Month order mapping (September = 1st month of academic year)
    const monthOrder = {
      september: 1,
      october: 2,
      november: 3,
      december: 4,
      january: 5,
      february: 6,
      march: 7,
      april: 8,
      may: 9,
      june: 10,
    };

    // Convert enrollment month number to academic year order
    // 9=September(1), 10=October(2), 11=November(3), 12=December(4)
    // 1=January(5), 2=February(6), 3=March(7), 4=April(8), 5=May(9), 6=June(10)
    let enrollmentOrder;
    if (enrollmentMonth >= 9) {
      enrollmentOrder = enrollmentMonth - 8; // 9->1, 10->2, 11->3, 12->4
    } else {
      enrollmentOrder = enrollmentMonth + 4; // 1->5, 2->6, 3->7, 4->8, 5->9, 6->10
    }

    const currentMonthOrder = monthOrder[month];

    // If month is not in the mapping, don't disable it
    if (currentMonthOrder === undefined) {
      return false;
    }

    return currentMonthOrder < enrollmentOrder;
  };

  // Editable Payment Cell Component
  // Insurance Cell Component - Similar to EditablePaymentCell
  const EditableInsuranceCell = ({ student }) => {
    const isEditingPaid =
      editingCell?.studentId === student.id &&
      editingCell?.month === "insurance" &&
      editingCell?.editType === "paid";

    const isEditingAgreed =
      editingCell?.studentId === student.id &&
      editingCell?.month === "insurance" &&
      editingCell?.editType === "agreed";

    const paidAmount = student.insurance?.paid || 0;
    const agreedAmount = student.insurance?.agreed || 0;

    // If editing paid amount
    if (isEditingPaid) {
      return (
        <Box p={1} onClick={(e) => e.stopPropagation()} position="relative">
          <Input
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) =>
              handleKeyPress(e, student.id, "insurance", "insurance", "paid")
            }
            onBlur={() =>
              handleInputBlur(student.id, "insurance", "insurance", "paid")
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            bg="blue.50"
            border="2px solid"
            borderColor="blue.400"
            borderRadius="md"
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)",
              bg: "white",
              transform: "scale(1.02)",
              transition: "all 0.2s ease-in-out",
            }}
            _hover={{
              borderColor: "blue.300",
              bg: "blue.25",
            }}
            fontWeight="semibold"
            textAlign="center"
            fontSize="sm"
            placeholder="Enter paid amount"
            _placeholder={{
              color: "gray.400",
              fontWeight: "normal",
            }}
            transition="all 0.2s ease-in-out"
          />
        </Box>
      );
    }

    // If editing agreed amount
    if (isEditingAgreed) {
      return (
        <Box p={1} onClick={(e) => e.stopPropagation()} position="relative">
          <Input
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) =>
              handleKeyPress(e, student.id, "insurance", "insurance", "agreed")
            }
            onBlur={() =>
              handleInputBlur(student.id, "insurance", "insurance", "agreed")
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            bg="orange.50"
            border="2px solid"
            borderColor="orange.400"
            borderRadius="md"
            _focus={{
              borderColor: "orange.500",
              boxShadow: "0 0 0 3px rgba(251, 211, 141, 0.3)",
              bg: "white",
              transform: "scale(1.02)",
              transition: "all 0.2s ease-in-out",
            }}
            _hover={{
              borderColor: "orange.300",
              bg: "orange.25",
            }}
            fontWeight="semibold"
            textAlign="center"
            fontSize="sm"
            placeholder="Enter agreed amount"
            _placeholder={{
              color: "gray.400",
              fontWeight: "normal",
            }}
            transition="all 0.2s ease-in-out"
          />
        </Box>
      );
    }

    // Normal display mode
    const isZeroZero = paidAmount === 0 && agreedAmount === 0;

    const colors = {
      bg: isZeroZero
        ? "gray.100"
        : paidAmount >= agreedAmount
        ? "purple.50"
        : paidAmount > 0
        ? "orange.50"
        : "red.50",
      borderColor: isZeroZero
        ? "gray.300"
        : paidAmount >= agreedAmount
        ? "purple.200"
        : paidAmount > 0
        ? "orange.200"
        : "red.200",
      textColor: isZeroZero
        ? "gray.600"
        : paidAmount >= agreedAmount
        ? "purple.700"
        : paidAmount > 0
        ? "orange.700"
        : "red.700",
      badgeColor: isZeroZero
        ? "gray"
        : paidAmount >= agreedAmount
        ? "purple"
        : paidAmount > 0
        ? "orange"
        : "red",
      hoverBg: isZeroZero
        ? "gray.200"
        : paidAmount >= agreedAmount
        ? "purple.100"
        : paidAmount > 0
        ? "orange.100"
        : "red.100",
    };

    return (
      <Box
        p={2}
        borderRadius="md"
        bg={colors.bg}
        border="1px solid"
        borderColor={colors.borderColor}
        textAlign="center"
        minH="55px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        cursor="pointer"
        title={`Click paid amount or agreed amount to edit - Agreed: ${formatCurrency(
          agreedAmount
        )}, Paid: ${formatCurrency(paidAmount)}`}
        _hover={{
          bg: colors.hoverBg,
          transform: "translateY(-1px)",
          shadow: "sm",
        }}
        transition="all 0.2s"
        position="relative"
      >
        {/* Insurance indicator and warning for zero/zero case */}
        <Box position="absolute" top="1px" left="2px" zIndex={1}>
          <Text fontSize="xs" color={colors.textColor} title="Insurance Fee">
            🛡️
          </Text>
        </Box>

        {/* Warning for zero/zero case */}
        {isZeroZero && (
          <Box position="absolute" top="1px" right="2px" zIndex={1}>
            <Text
              fontSize="md"
              color="red.500"
              title="Warning: Both agreed and paid amounts are zero"
            >
              ⚠️
            </Text>
          </Box>
        )}

        {/* Paid Amount - clickable */}
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={colors.textColor}
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={(e) =>
            handleCellClick(
              student.id,
              "insurance",
              paidAmount,
              e,
              "insurance",
              "paid"
            )
          }
        >
          {formatCurrency(paidAmount)}
        </Text>

        {/* Separator */}
        <Text fontSize="xs" color="gray.400" fontWeight="bold">
          /
        </Text>

        {/* Agreed Amount - clickable */}
        <Text
          fontSize="xs"
          color={colors.textColor}
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={(e) =>
            handleCellClick(
              student.id,
              "insurance",
              agreedAmount,
              e,
              "insurance",
              "agreed"
            )
          }
        >
          {formatCurrency(agreedAmount)}
        </Text>

        {/* Status Badge */}
        <Badge size="sm" colorScheme={colors.badgeColor} mt={1}>
          {paidAmount >= agreedAmount && agreedAmount > 0
            ? "✓ Paid"
            : paidAmount > 0
            ? "Partial"
            : "Not Paid"}
        </Badge>
      </Box>
    );
  };

  const EditablePaymentCell = ({
    student,
    month,
    monthData,
    paymentType = "tuition",
  }) => {
    const isEditingPaid =
      editingCell?.studentId === student.id &&
      editingCell?.month === month &&
      editingCell?.type === paymentType &&
      editingCell?.editType === "paid";

    const isEditingAgreed =
      editingCell?.studentId === student.id &&
      editingCell?.month === month &&
      editingCell?.type === paymentType &&
      editingCell?.editType === "agreed";

    const paymentData = monthData?.[paymentType] || { paid: 0, agreed: 0 };
    const paidAmount = paymentData.paid || 0;
    const agreedAmount = paymentData.agreed || 0;
    const isDisabled = isMonthBeforeEnrollment(student, month);

    // Don't render transport cell if no transport fees
    if (paymentType === "transport" && agreedAmount === 0 && paidAmount === 0) {
      return null;
    }

    // Disabled cell (before enrollment)
    if (isDisabled) {
      return (
        <Box
          p={1}
          borderRadius="md"
          bg="gray.100"
          border="1px solid"
          borderColor="gray.300"
          textAlign="center"
          minH={paymentType === "transport" ? "40px" : "60px"}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          opacity={0.6}
          title="Not enrolled for this month"
        >
          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            Not enrolled
          </Text>
          <Text fontSize="xs" color="gray.400">
            -
          </Text>
        </Box>
      );
    }

    // If editing paid amount
    if (isEditingPaid) {
      return (
        <Box p={1} onClick={(e) => e.stopPropagation()} position="relative">
          <Input
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) =>
              handleKeyPress(e, student.id, month, paymentType, "paid")
            }
            onBlur={() =>
              handleInputBlur(student.id, month, paymentType, "paid")
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            bg="blue.50"
            border="2px solid"
            borderColor="blue.400"
            borderRadius="md"
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.3)",
              bg: "white",
              transform: "scale(1.02)",
              transition: "all 0.2s ease-in-out",
            }}
            _hover={{
              borderColor: "blue.300",
              bg: "blue.25",
            }}
            fontWeight="semibold"
            textAlign="center"
            fontSize="sm"
            placeholder="Enter paid amount"
            _placeholder={{
              color: "gray.400",
              fontWeight: "normal",
            }}
            transition="all 0.2s ease-in-out"
          />
        </Box>
      );
    }

    // If editing agreed amount
    if (isEditingAgreed) {
      return (
        <Box p={1} onClick={(e) => e.stopPropagation()} position="relative">
          <Input
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) =>
              handleKeyPress(e, student.id, month, paymentType, "agreed")
            }
            onBlur={() =>
              handleInputBlur(student.id, month, paymentType, "agreed")
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            bg="orange.50"
            border="2px solid"
            borderColor="orange.400"
            borderRadius="md"
            _focus={{
              borderColor: "orange.500",
              boxShadow: "0 0 0 3px rgba(251, 211, 141, 0.3)",
              bg: "white",
              transform: "scale(1.02)",
              transition: "all 0.2s ease-in-out",
            }}
            _hover={{
              borderColor: "orange.300",
              bg: "orange.25",
            }}
            fontWeight="semibold"
            textAlign="center"
            fontSize="sm"
            placeholder="Enter agreed amount"
            _placeholder={{
              color: "gray.400",
              fontWeight: "normal",
            }}
            transition="all 0.2s ease-in-out"
          />
        </Box>
      );
    }

    const getColorScheme = (type) => {
      // Check if this is a "zero/zero" case (agreed=0 and paid=0)
      const isZeroZero = paidAmount === 0 && agreedAmount === 0;

      if (isZeroZero) {
        // Grey scheme for zero/zero cases
        return {
          bg: "gray.100",
          borderColor: "gray.300",
          textColor: "gray.600",
          badgeColor: "gray",
          hoverBg: "gray.200",
        };
      }

      if (type === "transport") {
        return {
          bg:
            paidAmount >= agreedAmount
              ? "purple.50"
              : paidAmount > 0
              ? "orange.50"
              : "red.50",
          borderColor:
            paidAmount >= agreedAmount
              ? "purple.200"
              : paidAmount > 0
              ? "orange.200"
              : "red.200",
          textColor:
            paidAmount >= agreedAmount
              ? "purple.700"
              : paidAmount > 0
              ? "orange.700"
              : "red.700",
          badgeColor:
            paidAmount >= agreedAmount
              ? "purple"
              : paidAmount > 0
              ? "orange"
              : "red",
          hoverBg:
            paidAmount >= agreedAmount
              ? "purple.100"
              : paidAmount > 0
              ? "orange.100"
              : "red.100",
        };
      } else {
        return {
          bg:
            paidAmount >= agreedAmount
              ? "green.50"
              : paidAmount > 0
              ? "orange.50"
              : "red.50",
          borderColor:
            paidAmount >= agreedAmount
              ? "green.200"
              : paidAmount > 0
              ? "orange.200"
              : "red.200",
          textColor:
            paidAmount >= agreedAmount
              ? "green.700"
              : paidAmount > 0
              ? "orange.700"
              : "red.700",
          badgeColor:
            paidAmount >= agreedAmount
              ? "green"
              : paidAmount > 0
              ? "orange"
              : "red",
          hoverBg:
            paidAmount >= agreedAmount
              ? "green.100"
              : paidAmount > 0
              ? "orange.100"
              : "red.100",
        };
      }
    };

    const colors = getColorScheme(paymentType);

    return (
      <Box
        p={paymentType === "transport" ? 1 : 2}
        borderRadius="md"
        bg={colors.bg}
        border="1px solid"
        borderColor={colors.borderColor}
        textAlign="center"
        minH={paymentType === "transport" ? "35px" : "55px"}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        cursor="pointer"
        title={`Click paid amount or agreed amount to edit - Agreed: ${formatCurrency(
          agreedAmount
        )}, Paid: ${formatCurrency(paidAmount)}`}
        _hover={{
          bg: colors.hoverBg,
          transform: "translateY(-1px)",
          shadow: "sm",
        }}
        transition="all 0.2s"
        position="relative"
      >
        {/* Warning triangle for zero agreed amount or zero/zero case */}
        {(agreedAmount === 0 || (agreedAmount === 0 && paidAmount === 0)) &&
          paymentType === "tuition" && (
            <Box position="absolute" top="2px" right="2px" zIndex={1}>
              <Text
                fontSize={agreedAmount === 0 && paidAmount === 0 ? "md" : "xs"}
                color={
                  agreedAmount === 0 && paidAmount === 0
                    ? "red.500"
                    : "yellow.600"
                }
                title={
                  agreedAmount === 0 && paidAmount === 0
                    ? "Warning: Both agreed and paid amounts are zero"
                    : "Warning: No agreed amount set for this month"
                }
              >
                {agreedAmount === 0 && paidAmount === 0 ? "⚠️" : "⚠️"}
              </Text>
            </Box>
          )}

        {/* Transport indicator */}
        {paymentType === "transport" && (
          <Box position="absolute" top="1px" left="2px" zIndex={1}>
            <Text fontSize="xs" color={colors.textColor} title="Transport Fee">
              🚌
            </Text>
          </Box>
        )}

        {/* Paid Amount - clickable */}
        <Text
          fontSize={paymentType === "transport" ? "xs" : "xs"}
          fontWeight="bold"
          color={colors.textColor}
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={(e) =>
            !isDisabled &&
            handleCellClick(
              student.id,
              month,
              paidAmount,
              e,
              paymentType,
              "paid"
            )
          }
          title="Click to edit paid amount"
        >
          {formatCurrency(paidAmount)}
        </Text>

        {/* Separator and Agreed Amount - clickable */}
        <Text fontSize="xs" color="gray.600">
          /
          <Text
            as="span"
            cursor="pointer"
            _hover={{ textDecoration: "underline", color: "orange.600" }}
            onClick={(e) =>
              !isDisabled &&
              handleCellClick(
                student.id,
                month,
                agreedAmount,
                e,
                paymentType,
                "agreed"
              )
            }
            title="Click to edit agreed amount"
            ml={1}
          >
            {formatCurrency(agreedAmount)}
          </Text>
        </Text>

        {paymentType === "tuition" && (
          <Badge size="xs" colorScheme={colors.badgeColor} variant="subtle">
            {paidAmount >= agreedAmount
              ? "Paid"
              : paidAmount > 0
              ? "Partial"
              : "Unpaid"}
          </Badge>
        )}
      </Box>
    );
  };

  const formatMonthName = (month) => {
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  if (loading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading payment data...</Text>
        </VStack>
      </Center>
    );
  }

  if (!studentGrid || studentGrid.length === 0) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.500">
            No students found for this class
          </Text>
          <Text fontSize="sm" color="gray.400">
            Select a different class or academic year
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Payment Grid Table */}
      <Box overflowX="auto" maxW="100vw">
        <TableRoot size="sm" variant="outline">
          <TableHeader bg="gray.50" position="sticky" top={0} zIndex={1}>
            <TableRow>
              <TableColumnHeader
                border="1px"
                borderColor="gray.300"
                py={4}
                position="sticky"
                left={0}
                bg="gray.50"
                zIndex={2}
                minW="180px"
                maxW="180px"
              >
                <Text fontWeight="bold">Student</Text>
              </TableColumnHeader>
              <TableColumnHeader
                border="1px"
                borderColor="gray.300"
                textAlign="center"
                minW="100px"
                maxW="100px"
                bg="purple.50"
              >
                <Text fontWeight="bold" fontSize="sm" color="purple.700">
                  Insurance
                </Text>
              </TableColumnHeader>
              {months.map((month) => (
                <TableColumnHeader
                  key={month}
                  border="1px"
                  borderColor="gray.300"
                  textAlign="center"
                  minW="100px"
                  maxW="100px"
                >
                  <Text fontWeight="bold" fontSize="xs">
                    {formatMonthName(month)}
                  </Text>
                </TableColumnHeader>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentGrid.map((student, index) => (
              <TableRow
                key={student.id}
                bg={index % 2 === 0 ? "white" : "gray.25"}
                _hover={{ bg: "blue.25" }}
                cursor="pointer"
                onClick={() => onStudentClick && onStudentClick(student)}
                minH="80px"
              >
                <TableCell
                  border="1px"
                  borderColor="gray.200"
                  p={3}
                  position="sticky"
                  left={0}
                  bg={index % 2 === 0 ? "white" : "gray.25"}
                  zIndex={1}
                  _hover={{ bg: "blue.25" }}
                  minW="180px"
                  maxW="180px"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                      {student.full_name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      ID: {student.student_id}
                    </Text>
                  </VStack>
                </TableCell>

                {/* Insurance Cell */}
                <TableCell
                  border="1px"
                  borderColor="gray.200"
                  p={1}
                  onClick={(e) => e.stopPropagation()}
                  minW="100px"
                  maxW="100px"
                >
                  <EditableInsuranceCell student={student} />
                </TableCell>

                {months.map((month) => (
                  <TableCell
                    key={month}
                    border="1px"
                    borderColor="gray.200"
                    p={1}
                    minW="100px"
                    maxW="100px"
                  >
                    <VStack spacing={1} align="stretch">
                      {/* Tuition Payment Cell */}
                      <EditablePaymentCell
                        student={student}
                        month={month}
                        monthData={student.months[month]}
                        paymentType="tuition"
                      />

                      {/* Transport Payment Cell - only show if student has transport fees */}
                      {(student.months[month]?.transport?.agreed > 0 ||
                        student.months[month]?.transport?.paid > 0) && (
                        <EditablePaymentCell
                          student={student}
                          month={month}
                          monthData={student.months[month]}
                          paymentType="transport"
                        />
                      )}
                    </VStack>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </Box>

      {/* Legend */}
      <Box
        mt={4}
        p={4}
        bg="gray.50"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="sm" fontWeight="bold" mb={2}>
          Payment Status Legend:
        </Text>
        <VStack spacing={3} align="start">
          {/* Tuition Legend */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={1}>
              Tuition Payments:
            </Text>
            <HStack spacing={4} wrap="wrap">
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="green.100"
                  border="1px solid"
                  borderColor="green.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Paid</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="orange.100"
                  border="1px solid"
                  borderColor="orange.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Partial</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="red.100"
                  border="1px solid"
                  borderColor="red.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Unpaid</Text>
              </HStack>
            </HStack>
          </Box>

          {/* Transport Legend */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={1}>
              Transport Payments (🚌):
            </Text>
            <HStack spacing={4} wrap="wrap">
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="purple.100"
                  border="1px solid"
                  borderColor="purple.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Paid</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="orange.100"
                  border="1px solid"
                  borderColor="orange.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Partial</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="red.100"
                  border="1px solid"
                  borderColor="red.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Unpaid</Text>
              </HStack>
            </HStack>
          </Box>

          {/* Insurance Legend */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={1}>
              Insurance Payments (🏥):
            </Text>
            <HStack spacing={4} wrap="wrap">
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="green.100"
                  border="1px solid"
                  borderColor="green.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">✓ Paid (Registered)</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="yellow.100"
                  border="1px solid"
                  borderColor="yellow.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Partial Payment</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="red.100"
                  border="1px solid"
                  borderColor="red.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Not Paid (Unregistered)</Text>
              </HStack>
            </HStack>
          </Box>

          {/* General */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={1}>
              General:
            </Text>
            <HStack spacing={4} wrap="wrap">
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="gray.100"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Not Enrolled</Text>
              </HStack>
              <HStack>
                <Box
                  w={4}
                  h={4}
                  bg="gray.100"
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius="sm"
                />
                <Text fontSize="xs">Zero Amount (No agreed & no paid)</Text>
              </HStack>
              <HStack>
                <Text fontSize="xs">⚠️</Text>
                <Text fontSize="xs">No agreed amount</Text>
              </HStack>
              <HStack>
                <Text fontSize="xs" color="red.500">
                  ⚠️
                </Text>
                <Text fontSize="xs">Zero/Zero Warning (bigger icon)</Text>
              </HStack>
            </HStack>
          </Box>

          {/* Instructions */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={1}>
              How to Edit:
            </Text>
            <VStack spacing={1} align="start">
              <Text fontSize="xs" color="blue.600">
                • Click the <strong>top number</strong> (paid amount) to edit
                payments
              </Text>
              <Text fontSize="xs" color="orange.600">
                • Click the <strong>bottom number</strong> (after "/") to edit
                agreed amounts
              </Text>
              <Text fontSize="xs" color="gray.600">
                • Press Enter to save, Escape to cancel
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default memo(PaymentGrid);
