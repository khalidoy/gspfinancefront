import React from "react";
import {
  Box,
  Text,
  Input,
  Select,
  Button,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaPlus } from "react-icons/fa";

const BootstrapStyleFilters = ({
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
    <Box className="filters-container" mb={4} p={4} bg="white" borderRadius="md" shadow="sm">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        
        {/* School Year Selection */}
        <FormControl>
          <FormLabel display="flex" alignItems="center" fontSize="sm" fontWeight="medium">
            <Box as={FaFilter} mr={2} />
            School Year Period
          </FormLabel>
          
          <Box display="flex" alignItems="center">
            {loadingSchoolYears ? (
              <Box display="flex" alignItems="center">
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm">Loading...</Text>
              </Box>
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
            
            {/* Plus Icon Button */}
            <Button
              colorScheme="green"
              size="sm"
              ml={2}
              onClick={handleOpenNewSchoolYearModal}
              title="Add new school year period"
            >
              <FaPlus />
            </Button>
          </Box>
        </FormControl>

        {/* Search Input Field */}
        <FormControl>
          <FormLabel display="flex" alignItems="center" fontSize="sm" fontWeight="medium">
            <Box as={FaSearch} mr={2} />
            Search by Name
          </FormLabel>
          
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Enter student name..."
              value={filters.searchText || ""}
              onChange={(e) => updateFilter("searchText", e.target.value)}
            />
          </InputGroup>
        </FormControl>

        {/* Status Filter */}
        <FormControl>
          <FormLabel display="flex" alignItems="center" fontSize="sm" fontWeight="medium">
            <Box as={FaFilter} mr={2} />
            Filter by Status
          </FormLabel>
          
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <FaFilter color="gray.400" />
            </InputLeftElement>
            <Select
              value={filters.statusFilter || "active"}
              onChange={(e) => updateFilter("statusFilter", e.target.value)}
              pl={10}
            >
              <option value="active">Active</option>
              <option value="left">Left</option>
              <option value="new">New</option>
              <option value="all">All</option>
            </Select>
          </InputGroup>
        </FormControl>
        
      </SimpleGrid>

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

export default BootstrapStyleFilters;
