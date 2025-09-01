import React from "react";
import { SimpleGrid, Box, Icon, HStack, VStack, Text } from "@chakra-ui/react";
import {
  FaUsers,
  FaUserPlus,
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

function StudentStatistics({ statistics }) {
  const iconColors = {
    primary: "teal.500",
    success: "green.500",
    warning: "orange.500",
    danger: "red.500",
    info: "blue.500",
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "0 DH";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("MAD", "DH");
  };

  const StatCard = ({ title, value, icon, color, subtitle, percentage }) => (
    <Box
      bg="white"
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={6}
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="shadow 0.2s"
    >
      <HStack justify="space-between" align="start" mb={4}>
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            {value}
          </Text>
        </VStack>
        <Box bg={color} p={3} borderRadius="lg" color="white">
          <Icon boxSize={6} />
        </Box>
      </HStack>

      {subtitle && (
        <Text fontSize="sm" color="gray.500">
          {subtitle}
        </Text>
      )}
    </Box>
  );

  if (!statistics) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Students"
          value="0"
          icon={FaUsers}
          color={iconColors.primary}
          subtitle="No data available"
        />
        <StatCard
          title="Active Students"
          value="0"
          icon={FaUserPlus}
          color={iconColors.success}
          subtitle="Currently enrolled"
        />
        <StatCard
          title="Total Revenue"
          value="$0"
          icon={FaDollarSign}
          color={iconColors.info}
          subtitle="This academic year"
        />
        <StatCard
          title="Collection Rate"
          value="0%"
          icon={FaChartLine}
          color={iconColors.warning}
          subtitle="Payment efficiency"
        />
      </SimpleGrid>
    );
  }

  const {
    totalStudents = 0,
    activeStudents = 0,
    totalRevenue = 0,
    collectionRate = 0,
    pendingPayments = 0,
  } = statistics;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      <StatCard
        title="Total Students"
        value={totalStudents.toLocaleString()}
        icon={FaUsers}
        color={iconColors.primary}
        subtitle={`${activeStudents} active students`}
      />

      <StatCard
        title="Active Students"
        value={activeStudents.toLocaleString()}
        icon={FaUserPlus}
        color={iconColors.success}
        subtitle="Currently enrolled"
      />

      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={FaDollarSign}
        color={iconColors.info}
        subtitle="This academic year"
      />

      <StatCard
        title="Collection Rate"
        value={`${Math.round(collectionRate)}%`}
        icon={FaChartLine}
        color={collectionRate >= 80 ? iconColors.success : iconColors.warning}
        subtitle="Payment efficiency"
      />

      {pendingPayments > 0 && (
        <StatCard
          title="Pending Payments"
          value={pendingPayments.toLocaleString()}
          icon={FaExclamationTriangle}
          color={iconColors.danger}
          subtitle="Requires attention"
        />
      )}
    </SimpleGrid>
  );
}

export default StudentStatistics;
