import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Alert,
  Button,
  VStack,
  HStack,
  Flex,
  Spinner,
  Center,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaGraduationCap,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
});

function Home({ user, onLogout }) {
  const { t } = useTranslation();

  // State management
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch academic years
  const fetchAcademicYears = async () => {
    try {
      const response = await api.get("/api/academic-years/");
      const years = response.data.academic_years || [];
      setAcademicYears(years);

      // Set current academic year as default
      const currentYear = years.find((year) => year.is_current_year);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      } else if (years.length > 0) {
        setSelectedAcademicYear(years[0].id);
      }
    } catch (err) {
      console.error("Error fetching academic years:", err);
      setError("Failed to fetch academic years");
    }
  };

  // Fetch students
  const fetchStudents = async (academicYearId) => {
    if (!academicYearId) return;

    try {
      const response = await api.get(
        `/api/academic-years/${academicYearId}/students`
      );
      setStudents(response.data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchStudents(selectedAcademicYear);
    }
  }, [selectedAcademicYear]);

  // Calculate statistics
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "ACTIVE").length,
    graduated: students.filter((s) => s.status === "GRADUATED").length,
    dropped: students.filter((s) => s.status === "DROPPED_OUT").length,
  };

  if (loading) {
    return (
      <Center h="100vh">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text>{t("loading_students")}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Top Navigation Bar */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="blue.600">
              GSP Finance System
            </Heading>

            {user && (
              <HStack spacing={4}>
                <VStack align="end" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user.full_name || user.username}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.role}
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FaSignOutAlt />}
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  colorScheme="red"
                >
                  Logout
                </Button>
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8}>
        <VStack align="stretch" spacing={6}>
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="gray.800">
              {t("students_management")}
            </Heading>
            <HStack>
              <Button
                leftIcon={<FaGraduationCap />}
                colorScheme="blue"
                variant="outline"
                size="sm"
              >
                {t("new_academic_year")}
              </Button>
              <Button leftIcon={<FaPlus />} colorScheme="blue" size="sm">
                {t("add_student")}
              </Button>
            </HStack>
          </Flex>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md">
              <Text>{error}</Text>
            </Alert>
          )}

          {/* Academic Year Selection */}
          {academicYears.length > 0 && (
            <Box>
              <Text mb={2} fontWeight="medium">
                {t("academic_year")}:
              </Text>
              <HStack>
                {academicYears.map((year) => (
                  <Button
                    key={year.id}
                    size="sm"
                    variant={
                      selectedAcademicYear === year.id ? "solid" : "outline"
                    }
                    colorScheme="blue"
                    onClick={() => setSelectedAcademicYear(year.id)}
                  >
                    {year.name}
                  </Button>
                ))}
              </HStack>
            </Box>
          )}

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Card>
              <CardHeader pb={2}>
                <HStack>
                  <FaChartBar color="blue" />
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    {t("total_students")}
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {stats.total}
                </Text>
              </CardBody>
            </Card>

            <Card>
              <CardHeader pb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {t("active_students")}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {stats.active}
                </Text>
              </CardBody>
            </Card>

            <Card>
              <CardHeader pb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {t("graduated")}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {stats.graduated}
                </Text>
              </CardBody>
            </Card>

            <Card>
              <CardHeader pb={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {t("dropped_out")}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  {stats.dropped}
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Students List */}
          <Card>
            <CardHeader>
              <Heading size="md">{t("students_list")}</Heading>
            </CardHeader>
            <CardBody>
              {students.length > 0 ? (
                <VStack align="stretch" spacing={2}>
                  {students.slice(0, 10).map((student) => (
                    <Box
                      key={student._id}
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {student.first_name} {student.last_name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {student.student_id} - {student.level}
                          </Text>
                        </VStack>
                        <Box
                          px={2}
                          py={1}
                          bg={
                            student.status === "ACTIVE"
                              ? "green.100"
                              : "gray.100"
                          }
                          color={
                            student.status === "ACTIVE"
                              ? "green.800"
                              : "gray.800"
                          }
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {student.status}
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                  {students.length > 10 && (
                    <Text textAlign="center" color="gray.600" fontSize="sm">
                      ... and {students.length - 10} more students
                    </Text>
                  )}
                </VStack>
              ) : (
                <Center py={8}>
                  <VStack>
                    <FaGraduationCap size="48" color="gray.400" />
                    <Text color="gray.600">{t("no_students_found")}</Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export default Home;
