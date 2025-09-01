import React, { useState } from "react";
import { Box, Text, Button } from "@chakra-ui/react";

const UltraSimpleFilter = ({ 
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
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" mb={4}>
      <Box p={3} cursor="pointer" onClick={handleToggle}>
        <Text fontWeight="semibold" fontSize="md" color="gray.800">
          Student Filters
        </Text>
        <Text fontSize="sm" color="gray.600">
          {statistics ? `${statistics.filtered} of ${statistics.total} students` : `${totalStudents} students`}
        </Text>
        <Text fontSize="20px">
          {isExpanded ? "↑" : "↓"}
        </Text>
      </Box>

      {isExpanded && (
        <Box p={4} bg="gray.50">
          <Text fontSize="sm" mb={3}>Quick Filters</Text>
          
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            mr={2}
            mb={2}
            onClick={() => updateFilter('agreedAmountStatus', 'noAgreed')}
          >
            Agreed = 0
          </Button>
          
          <Button
            size="sm"
            colorScheme="green"
            variant="outline"
            mr={2}
            mb={2}
            onClick={() => updateFilter('studentType', 'new')}
          >
            New Students
          </Button>
          
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            mr={2}
            mb={2}
            onClick={() => updateFilter('transportStatus', 'hasTransport')}
          >
            Transport
          </Button>

          <Box mt={4}>
            <Text fontSize="sm" mb={2}>Search Student</Text>
            <input
              type="text"
              placeholder="Name or ID..."
              value={filters.searchText || ''}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </Box>

          <Box mt={4}>
            <Text fontSize="sm" mb={2}>Payment Status</Text>
            <select
              value={filters.paymentStatus || 'all'}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Students</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </Box>

          <Box mt={4}>
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              mr={2}
              onClick={() => {
                const defaultFilters = {
                  searchText: '',
                  paymentStatus: 'all',
                  studentType: 'all',
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
              onClick={() => setIsExpanded(false)}
            >
              Collapse
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UltraSimpleFilter;
