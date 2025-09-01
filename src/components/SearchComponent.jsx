import React from "react";
import { Input, Box, Text } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";

const SearchComponent = ({ searchQuery, onSearchChange, resultCount }) => {
  return (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      mb={4}
    >
      <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
        🔍 Search Students
      </Text>
      <Box position="relative">
        <Input
          placeholder="Search by name, student ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          bg="gray.50"
          border="1px solid"
          borderColor="gray.300"
          paddingLeft="40px"
          _focus={{
            borderColor: "blue.400",
            bg: "white",
          }}
        />
        <Box
          position="absolute"
          left="12px"
          top="50%"
          transform="translateY(-50%)"
          color="gray.400"
          pointerEvents="none"
        >
          <FaSearch />
        </Box>
      </Box>
      {searchQuery && (
        <Text fontSize="xs" color="gray.600" mt={2}>
          Found {resultCount} students matching "{searchQuery}"
        </Text>
      )}
    </Box>
  );
};

export default SearchComponent;
