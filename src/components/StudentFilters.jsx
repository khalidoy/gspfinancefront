import React, { useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  FieldRoot,
  FieldLabel,
  Input,
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FaSearch, FaTimes, FaFilter } from "react-icons/fa";

const StudentFilters = ({
  searchQuery,
  onSearchChange,
  selectedAcademicYear,
  onAcademicYearChange,
  selectedStatus,
  onStatusChange,
  selectedClass,
  onClassChange,
  academicYears = [],
  classes = [],
  onClearFilters,
}) => {
  const [activeFilters, setActiveFilters] = useState([]);

  // Update active filters when filter values change
  React.useEffect(() => {
    const filters = [];

    if (searchQuery) {
      filters.push({
        type: "search",
        label: `Search: "${searchQuery}"`,
        value: searchQuery,
      });
    }

    if (selectedAcademicYear) {
      const year = academicYears.find((y) => y.id === selectedAcademicYear);
      filters.push({
        type: "year",
        label: `Year: ${year?.year_name || selectedAcademicYear}`,
        value: selectedAcademicYear,
      });
    }

    if (selectedStatus) {
      filters.push({
        type: "status",
        label: `Status: ${selectedStatus}`,
        value: selectedStatus,
      });
    }

    if (selectedClass) {
      const classObj = classes.find((c) => c.id === selectedClass);
      filters.push({
        type: "class",
        label: `Class: ${classObj?.class_name || selectedClass}`,
        value: selectedClass,
      });
    }

    setActiveFilters(filters);
  }, [
    searchQuery,
    selectedAcademicYear,
    selectedStatus,
    selectedClass,
    academicYears,
    classes,
  ]);

  const handleRemoveFilter = (filterType) => {
    switch (filterType) {
      case "search":
        onSearchChange("");
        break;
      case "year":
        onAcademicYearChange("");
        break;
      case "status":
        onStatusChange("");
        break;
      case "class":
        onClassChange("");
        break;
      default:
        break;
    }
  };

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "GRADUATED", label: "Graduated" },
    { value: "TRANSFERRED", label: "Transferred" },
  ];

  return (
    <Box>
      <VStack gap={4} align="stretch">
        {/* Filter Controls */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "1fr 1fr",
            lg: "2fr 1fr 1fr 1fr",
          }}
          gap={4}
        >
          <GridItem>
            <FieldRoot>
              <FieldLabel>Search Students</FieldLabel>
              <Box position="relative">
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  pl={10}
                />
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                >
                  <Icon as={FaSearch} color="gray.400" w={4} h={4} />
                </Box>
              </Box>
            </FieldRoot>
          </GridItem>

          <GridItem>
            <FieldRoot>
              <FieldLabel>Academic Year</FieldLabel>
              <SelectRoot
                value={selectedAcademicYear ? [selectedAcademicYear] : []}
                onValueChange={(e) => onAcademicYearChange(e.value[0] || "")}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem item="">All Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} item={year.id}>
                      {year.year_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </FieldRoot>
          </GridItem>

          <GridItem>
            <FieldRoot>
              <FieldLabel>Status</FieldLabel>
              <SelectRoot
                value={selectedStatus ? [selectedStatus] : []}
                onValueChange={(e) => onStatusChange(e.value[0] || "")}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem item="">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} item={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </FieldRoot>
          </GridItem>

          <GridItem>
            <FieldRoot>
              <FieldLabel>Class</FieldLabel>
              <SelectRoot
                value={selectedClass ? [selectedClass] : []}
                onValueChange={(e) => onClassChange(e.value[0] || "")}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem item="">All Classes</SelectItem>
                  {classes.map((classObj) => (
                    <SelectItem key={classObj.id} item={classObj.id}>
                      {classObj.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </FieldRoot>
          </GridItem>
        </Grid>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <Box>
            <HStack gap={2} wrap="wrap" align="center">
              <HStack gap={2} align="center">
                <Icon as={FaFilter} color="blue.500" w={4} h={4} />
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Active Filters:
                </Text>
              </HStack>

              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  colorPalette="blue"
                  size="md"
                  cursor="pointer"
                  onClick={() => handleRemoveFilter(filter.type)}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  px={2}
                  py={1}
                  borderRadius="md"
                  _hover={{ bg: "blue.600" }}
                >
                  <Text fontSize="xs">{filter.label}</Text>
                  <Icon as={FaTimes} w={3} h={3} />
                </Badge>
              ))}

              {activeFilters.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="gray"
                  onClick={onClearFilters}
                  fontSize="xs"
                >
                  Clear All
                </Button>
              )}
            </HStack>
          </Box>
        )}

        {/* Filter Summary */}
        {activeFilters.length === 0 && (
          <Box>
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              No filters applied - showing all students
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default StudentFilters;
