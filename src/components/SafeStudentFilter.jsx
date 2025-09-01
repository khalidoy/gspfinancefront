import React, { useState } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  Select,
} from "@chakra-ui/react";

const SafeStudentFilter = ({ 
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
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      mb={4}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
        cursor="pointer"
        borderRadius="md"
        _hover={{ bg: "gray.50" }}
        onClick={handleToggle}
      >
        <Box>
          <Text fontWeight="semibold" fontSize="md" color="gray.800">
            Student Filters
          </Text>
          <Text fontSize="sm" color="gray.600">
            {statistics ? `${statistics.filtered} of ${statistics.total} students` : `${totalStudents} students`}
          </Text>
        </Box>
        
        <Text fontSize="20px">
          {isExpanded ? "↑" : "↓"}
        </Text>
      </Box>

      {isExpanded && (
        <Box p={4} mt={4} bg="gray.50" borderRadius="md">
          <Box mb={6}>
            <Box mb={6}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                Quick Filters
              </Text>
              
              <Box display="flex" gap={2} flexWrap="wrap">
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
              </Box>
            </Box>

            <Box mb={6}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Search Student
              </Text>
              <Input
                placeholder="Name or ID..."
                value={filters.searchText || ''}
                onChange={(e) => updateFilter('searchText', e.target.value)}
                size="sm"
              />
            </Box>

            <Box mb={6}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                Payment Status
              </Text>
              <Select
                value={filters.paymentStatus || 'all'}
                onChange={(e) => updateFilter('paymentStatus', e.target.value)}
                size="sm"
              >
                <option value="all">All Students</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </Select>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              pt={4}
              borderTop="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="sm" color="gray.600">
                {statistics ? `Showing ${statistics.filtered} of ${statistics.total} students` : ''}
              </Text>
              
              <Box display="flex" gap={2}>
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
                      agreedAmountStatus: 'all',
                      transportStatus: 'all',
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
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SafeStudentFilter;
