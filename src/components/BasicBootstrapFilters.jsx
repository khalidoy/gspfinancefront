import React from "react";
import {
  Box,
  Text,
  Input,
  Select,
  Button,
} from "@chakra-ui/react";

const BasicBootstrapFilters = ({
  filters = {},
  onFiltersChange = () => {},
  statistics = null,
  totalStudents = 0,
  loadingSchoolYears = false,
  schoolYearPeriods = [],
  selectedSchoolYearPeriod = "",
  handleSchoolYearChange = () => {},
  handleOpenNewSchoolYearModal = () => {},
}) => {
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  return (
    <Box mb={4} p={4} bg="white" borderRadius="md" shadow="sm" border="1px solid" borderColor="gray.200">
      {/* Three column layout using CSS Grid */}
      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={4}>
        
        {/* School Year Selection */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2} display="flex" alignItems="center">
            🎓 School Year Period
          </Text>
          
          <Box display="flex" alignItems="center">
            {loadingSchoolYears ? (
              <Text fontSize="sm">Loading...</Text>
            ) : schoolYearPeriods.length === 0 ? (
              <Text fontSize="sm">No school year periods</Text>
            ) : (
              <Select
                value={selectedSchoolYearPeriod}
                onChange={(e) => handleSchoolYearChange(e)}
                size="sm"
                flex="1"
              >
                {schoolYearPeriods.map((sy) => (
                  <option key={sy._id?.$oid || sy._id} value={sy._id?.$oid || sy._id}>
                    {sy.name}
                  </option>
                ))}
              </Select>
            )}
            
            <Button
              colorScheme="green"
              size="sm"
              ml={2}
              onClick={handleOpenNewSchoolYearModal}
              title="Add new school year period"
            >
              ➕
            </Button>
          </Box>
        </Box>

        {/* Search Input Field */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2} display="flex" alignItems="center">
            🔍 Search by Name
          </Text>
          
          <Input
            type="text"
            placeholder="Enter student name..."
            value={filters.searchText || ""}
            onChange={(e) => updateFilter("searchText", e.target.value)}
            size="sm"
          />
        </Box>

        {/* Status Filter */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2} display="flex" alignItems="center">
            🔧 Filter by Status
          </Text>
          
          <Select
            value={filters.statusFilter || "active"}
            onChange={(e) => updateFilter("statusFilter", e.target.value)}
            size="sm"
          >
            <option value="active">Active</option>
            <option value="left">Left</option>
            <option value="new">New</option>
            <option value="all">All</option>
          </Select>
        </Box>
        
      </Box>

      {/* Statistics Display */}
      {statistics && (
        <Box mt={3} pt={3} borderTop="1px solid" borderColor="gray.200">
          <Text fontSize="sm" color="gray.600">
            Showing {statistics.filtered} of {statistics.total} students
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default BasicBootstrapFilters;
