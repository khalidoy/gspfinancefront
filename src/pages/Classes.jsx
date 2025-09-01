import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  TableScrollArea,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  createToaster,
  Alert,
  AlertIndicator,
  Spinner,
  Grid,
  GridItem,
  Select,
  Input,
  InputGroup,
  InputElement,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiSearch as SearchIcon,
  FiPlus as AddIcon,
  FiEdit as EditIcon,
  FiEye as ViewIcon,
} from "react-icons/fi";
import axios from "axios";
import ClassModal from "../components/ClassModal";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filters, setFilters] = useState({
    education_level: "",
    search: "",
    is_active: "true",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const toaster = createToaster({
    placement: "top-right",
  });

  const toast = useCallback(
    (options) => {
      toaster.create({
        title: options.title,
        description: options.description,
        status: options.status,
        duration: options.duration || 5000,
        isClosable: true,
      });
    },
    [toaster]
  );

  const EDUCATION_LEVELS = [
    ["KINDERGARTEN", "Kindergarten"],
    ["PRIMARY", "Primary School"],
    ["MIDDLE", "Middle School"],
    ["HIGH_SCHOOL", "High School"],
    ["COLLEGE_PREP", "College Prep"],
  ];

  // Load classes data
  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/classes/api/classes",
        {
          params: filters,
        }
      );

      if (response.data && response.data.classes) {
        setClasses(response.data.classes);
        setFilteredClasses(response.data.classes);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      setError("Failed to load classes data");
      toast({
        title: "Error",
        description: "Failed to load classes data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Filter classes when filters change
  useEffect(() => {
    let filtered = classes;

    if (filters.education_level) {
      filtered = filtered.filter(
        (cls) => cls.education_level === filters.education_level
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.class_name.toLowerCase().includes(searchLower) ||
          cls.class_code.toLowerCase().includes(searchLower)
      );
    }

    if (filters.is_active !== "") {
      const isActive = filters.is_active === "true";
      filtered = filtered.filter((cls) => cls.is_active === isActive);
    }

    setFilteredClasses(filtered);
  }, [classes, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleEditClass = (classData) => {
    setEditingClass(classData);
    setIsClassModalOpen(true);
  };

  const handleClassCreated = () => {
    loadClasses(); // Reload classes data
  };

  const getEducationLevelDisplay = (level) => {
    const found = EDUCATION_LEVELS.find((item) => item[0] === level);
    return found ? found[1] : level;
  };

  const getCapacityColor = (utilization) => {
    if (utilization >= 90) return "red";
    if (utilization >= 70) return "yellow";
    return "green";
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading classes...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIndicator />
          {error}
        </Alert>
      </Container>
    );
  }

  const totalClasses = classes.length;
  const activeClasses = classes.filter((cls) => cls.is_active).length;
  const totalStudents = classes.reduce(
    (sum, cls) => sum + cls.active_student_count,
    0
  );
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.max_students, 0);
  const overallUtilization =
    totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="lg">
            School Classes Management
          </Heading>
          <Button colorScheme="blue" onClick={handleCreateClass}>
            <AddIcon style={{ marginRight: "8px" }} />
            Create New Class
          </Button>
        </HStack>

        {/* Statistics Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  Total Classes
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totalClasses}
                </Text>
                <Text fontSize="xs" color="green.500">
                  {activeClasses} active
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  Total Students
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totalStudents}
                </Text>
                <Text fontSize="xs" color="blue.500">
                  Across all classes
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  Total Capacity
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {totalCapacity}
                </Text>
                <Progress
                  value={overallUtilization}
                  colorScheme={getCapacityColor(overallUtilization)}
                  size="sm"
                />
                <Text fontSize="xs" color="gray.500">
                  {overallUtilization.toFixed(1)}% utilized
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Filters */}
        <Card>
          <CardHeader>
            <Text fontWeight="semibold">Filters</Text>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={4}
            >
              <GridItem>
                <Text fontSize="sm" mb={2}>
                  Education Level
                </Text>
                <Select
                  value={filters.education_level}
                  onChange={(e) =>
                    handleFilterChange("education_level", e.target.value)
                  }
                  placeholder="All levels"
                >
                  {EDUCATION_LEVELS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </GridItem>

              <GridItem>
                <Text fontSize="sm" mb={2}>
                  Status
                </Text>
                <Select
                  value={filters.is_active}
                  onChange={(e) =>
                    handleFilterChange("is_active", e.target.value)
                  }
                >
                  <option value="">All classes</option>
                  <option value="true">Active only</option>
                  <option value="false">Inactive only</option>
                </Select>
              </GridItem>

              <GridItem>
                <Text fontSize="sm" mb={2}>
                  Search
                </Text>
                <InputGroup>
                  <InputElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputElement>
                  <Input
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Search by class name or code..."
                  />
                </InputGroup>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontWeight="semibold">
                Classes ({filteredClasses.length})
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableScrollArea>
              <Table variant="simple">
                <TableHeader>
                  <TableRow>
                    <TableColumnHeader>Class Name</TableColumnHeader>
                    <TableColumnHeader>Code</TableColumnHeader>
                    <TableColumnHeader>Education Level</TableColumnHeader>
                    <TableColumnHeader>Grade</TableColumnHeader>
                    <TableColumnHeader>Students</TableColumnHeader>
                    <TableColumnHeader>Capacity</TableColumnHeader>
                    <TableColumnHeader>Status</TableColumnHeader>
                    <TableColumnHeader>Actions</TableColumnHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classData) => (
                    <TableRow key={classData.id}>
                      <TableCell>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {classData.class_name}
                          </Text>
                          {classData.classroom_location && (
                            <Text fontSize="xs" color="gray.500">
                              📍 {classData.classroom_location}
                            </Text>
                          )}
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" colorScheme="blue">
                          {classData.class_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getEducationLevelDisplay(classData.education_level)}
                      </TableCell>
                      <TableCell>{classData.grade_number}</TableCell>
                      <TableCell>
                        <VStack align="start" spacing={1}>
                          <Text>{classData.active_student_count} active</Text>
                          <Text fontSize="xs" color="gray.500">
                            ({classData.total_student_count} total)
                          </Text>
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <VStack align="start" spacing={1}>
                          <Text>{classData.max_students}</Text>
                          <Progress
                            value={classData.capacity_utilization}
                            colorScheme={getCapacityColor(
                              classData.capacity_utilization
                            )}
                            size="sm"
                            w="60px"
                          />
                          <Text fontSize="xs" color="gray.500">
                            {classData.capacity_utilization}%
                          </Text>
                        </VStack>
                      </TableCell>
                      <TableCell>
                        <Badge
                          colorScheme={classData.is_active ? "green" : "gray"}
                          variant={classData.is_active ? "solid" : "outline"}
                        >
                          {classData.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <HStack spacing={2}>
                          <Tooltip content="View details">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() =>
                                console.log("View class:", classData.id)
                              }
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip content="Edit class">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="orange"
                              onClick={() => handleEditClass(classData)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </HStack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScrollArea>

            {filteredClasses.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">
                  {classes.length === 0
                    ? "No classes found. Create your first class to get started!"
                    : "No classes match your current filters."}
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Class Modal */}
        <ClassModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onClassCreated={handleClassCreated}
          editingClass={editingClass}
        />
      </VStack>
    </Container>
  );
};

export default Classes;
