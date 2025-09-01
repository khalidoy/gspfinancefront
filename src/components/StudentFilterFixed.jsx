import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Badge,
  Flex,
  InputGroup,
  SimpleGrid,
  Wrap,
  WrapItem,
  Separator,
  NativeSelect,
} from "@chakra-ui/react";

const StudentFilterFixed = ({ 
  filters = {},
  onFiltersChange = () => {},
  statistics = null,
  totalStudents = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = (e) => {
    if (e) e.stopPropagation();
    const defaultFilters = {
      searchText: '',
      paymentStatus: 'all',
      studentType: 'all',
      level: 'all',
      ageRange: [5, 18],
      agreedAmountStatus: 'all',
      transportStatus: 'all',
      enrollmentMonth: 'all',
      outstandingRange: [0, 10000],
      collectionRate: [0, 100],
      showOnlyProblems: false
    };
    onFiltersChange(defaultFilters);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      mb={4}
    >
      <Flex
        justify="space-between"
        align="center"
        p={3}
        cursor="pointer"
        onClick={handleToggle}
        _hover={{ bg: "gray.100" }}
      >
        <HStack spacing={3} flex={1}>
          <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
            📊
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="semibold" fontSize="md" color="gray.800">
              Student Filters
            </Text>
            <Text fontSize="sm" color="gray.600">
              {statistics ? `${statistics.filtered} of ${statistics.total} students` : `${totalStudents} students`}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={2}>
          <Badge colorScheme="blue" variant="solid">
            Filters
          </Badge>
          <Button size="sm" variant="ghost">
            {isExpanded ? "↑" : "↓"}
          </Button>
        </HStack>
      </Flex>

      {isExpanded ? (
        <VStack p={4} spacing={6} align="stretch">
          
          {/* Quick Filter Buttons */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
              Quick Filters
            </Text>
            <Wrap spacing={2}>
              <WrapItem>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilter('agreedAmountStatus', 'noAgreed');
                  }}
                >
                  Agreed = 0
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilter('studentType', 'new');
                  }}
                >
                  New Students
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilter('transportStatus', 'hasTransport');
                  }}
                >
                  Transport
                </Button>
              </WrapItem>
            </Wrap>
          </Box>

          <Separator />

          {/* Search and Basic Filters */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            
            {/* Search Box */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Search Student
              </Text>
              <InputGroup>
                <Input
                  placeholder="Name or ID..."
                  value={filters.searchText || ''}
                  onChange={(e) => updateFilter('searchText', e.target.value)}
                  size="sm"
                />
              </InputGroup>
            </Box>

            {/* Payment Status */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Payment Status
              </Text>
              <NativeSelect
                size="sm"
                value={filters.paymentStatus || 'all'}
                onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </NativeSelect>
            </Box>

          </SimpleGrid>

          {/* Action Buttons */}
          <Flex justify="space-between" align="center" pt={4}>
            <Text fontSize="sm" color="gray.600">
              {statistics ? `Showing ${statistics.filtered} of ${statistics.total} students` : ''}
            </Text>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                Collapse
              </Button>
            </HStack>
          </Flex>
        </VStack>
      ) : null}
    </Box>
  );
};

export default StudentFilterFixed;
