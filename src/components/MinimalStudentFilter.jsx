import React, { useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
} from "@chakra-ui/react";

const MinimalStudentFilter = ({ 
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

  const handleToggle = () => {
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
        borderRadius="md"
        _hover={{ bg: "gray.50" }}
        onClick={handleToggle}
      >
        <VStack align="start" spacing={0}>
          <Text fontWeight="semibold" fontSize="md" color="gray.800">
            Student Filters
          </Text>
          <Text fontSize="sm" color="gray.600">
            {statistics ? `${statistics.filtered} of ${statistics.total} students` : `${totalStudents} students`}
          </Text>
        </VStack>
        
        <Text fontSize="20px">
          {isExpanded ? "↑" : "↓"}
        </Text>
      </Flex>

      {isExpanded && (
        <VStack spacing={6} p={4} mt={4} bg="gray.50" borderRadius="md">
          <VStack align="stretch" spacing={3} width="100%">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
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
          </VStack>

          <VStack align="stretch" spacing={3} width="100%">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Search Student
            </Text>
            <Input
              placeholder="Name or ID..."
              value={filters.searchText || ''}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              size="sm"
            />
          </VStack>

          <VStack align="stretch" spacing={3} width="100%">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Payment Status
            </Text>
            <NativeSelect
              value={filters.paymentStatus || 'all'}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              size="sm"
            >
              <option value="all">All Students</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </NativeSelect>
          </VStack>

          <Flex
            justify="space-between"
            align="center"
            mt={6}
            pt={4}
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="sm" color="gray.600">
              {statistics ? `Showing ${statistics.filtered} of ${statistics.total} students` : ''}
            </Text>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={(e) => {
                  e.stopPropagation();
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
                }}
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
      )}
    </Box>
  );
};

export default MinimalStudentFilter;
