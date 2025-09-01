import React from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaUsers, FaGraduationCap } from "react-icons/fa";

const ClassSelector = ({
  classes,
  selectedClassId,
  onClassSelect,
  loading,
  academicYear,
}) => {
  const getEducationLevelColor = (level) => {
    switch (level) {
      case "PRESCHOOL":
        return "pink";
      case "KINDERGARTEN":
        return "orange";
      case "PRIMARY":
        return "green";
      case "MIDDLE":
        return "blue";
      case "HIGH":
        return "purple";
      default:
        return "gray";
    }
  };

  const formatEducationLevel = (level) => {
    switch (level) {
      case "PRESCHOOL":
        return "Preschool";
      case "KINDERGARTEN":
        return "Kindergarten";
      case "PRIMARY":
        return "Primary";
      case "MIDDLE":
        return "Middle School";
      case "HIGH":
        return "High School";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading classes...</Text>
        </VStack>
      </Center>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.500">
            No classes found
          </Text>
          <Text fontSize="sm" color="gray.400">
            Create classes for the academic year to get started
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Select a Class
          </Text>
          {academicYear && (
            <Text fontSize="sm" color="gray.600">
              Academic Year: {academicYear.name}
            </Text>
          )}
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          {classes.map((cls) => (
            <Box
              key={cls.id}
              p={4}
              border="2px solid"
              borderColor={selectedClassId === cls.id ? "blue.500" : "gray.200"}
              borderRadius="lg"
              bg={selectedClassId === cls.id ? "blue.50" : "white"}
              cursor="pointer"
              onClick={() => onClassSelect(cls.id)}
              _hover={{
                borderColor: "blue.300",
                bg: "blue.25",
                transform: "translateY(-1px)",
                shadow: "md",
              }}
              transition="all 0.2s"
            >
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <Text
                      fontWeight="bold"
                      fontSize="md"
                      color={
                        selectedClassId === cls.id ? "blue.700" : "gray.800"
                      }
                    >
                      {cls.class_name}
                    </Text>
                    <Badge
                      colorScheme={getEducationLevelColor(cls.education_level)}
                      variant="subtle"
                      size="sm"
                    >
                      {formatEducationLevel(cls.education_level)}
                    </Badge>
                  </VStack>

                  <Box
                    p={2}
                    bg={selectedClassId === cls.id ? "blue.100" : "gray.100"}
                    borderRadius="lg"
                    color={selectedClassId === cls.id ? "blue.600" : "gray.600"}
                  >
                    <FaGraduationCap size={16} />
                  </Box>
                </HStack>

                <HStack justify="space-between">
                  <HStack>
                    <FaUsers size={14} color="gray" />
                    <Text fontSize="sm" color="gray.600">
                      {cls.student_count} students
                    </Text>
                  </HStack>
                  {cls.max_students && (
                    <Text fontSize="xs" color="gray.500">
                      Max: {cls.max_students}
                    </Text>
                  )}
                </HStack>

                {cls.student_count > 0 && (
                  <Box
                    w="full"
                    h={2}
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      bg={selectedClassId === cls.id ? "blue.500" : "green.500"}
                      borderRadius="full"
                      style={{
                        width: cls.max_students
                          ? `${Math.min(
                              (cls.student_count / cls.max_students) * 100,
                              100
                            )}%`
                          : "100%",
                      }}
                    />
                  </Box>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {selectedClassId && (
          <Box
            p={4}
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            borderRadius="lg"
          >
            <Text fontSize="sm" color="blue.700">
              ✓ Class selected. The payment grid will show students from this
              class only for optimal performance.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ClassSelector;
