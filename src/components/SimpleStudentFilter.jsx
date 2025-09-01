import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';

const SimpleStudentFilter = ({ filters, onFiltersChange, statistics, totalStudents }) => {
  return (
    <Box p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200">
      <Text>Simple Filter Test</Text>
      <Button size="sm" colorScheme="blue">
        <FaFilter style={{ marginRight: '8px' }} />
        Test Button
      </Button>
    </Box>
  );
};

export default SimpleStudentFilter;
