import React, { useState, useEffect } from 'react';
import { Box, Text, Input, Select, Button } from '@chakra-ui/react';

const ChakraAdvancedFilters = ({ filters, onFiltersChange, statistics }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onToggle = () => setIsOpen(!isOpen);

  // Update active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value && value !== 'all' && value !== '' && value !== 'any'
    ).length;
    setActiveFilters(count);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    onFiltersChange(clearedFilters);
  };

  // Quick filter configurations
  const getQuickFilters = () => [
    {
      label: '💰 Outstanding Balance',
      key: 'paymentStatus',
      value: 'outstanding',
      colorScheme: 'red'
    },
    {
      label: '✅ Paid Up',
      key: 'paymentStatus',
      value: 'paid',
      colorScheme: 'green'
    },
    {
      label: '🆕 New Students',
      key: 'isNewStudent',
      value: 'yes',
      colorScheme: 'blue'
    },
    {
      label: '🚌 Transport',
      key: 'hasTransport',
      value: 'yes',
      colorScheme: 'purple'
    },
    {
      label: '⭐ Special Needs',
      key: 'hasSpecialNeeds',
      value: 'yes',
      colorScheme: 'orange'
    },
    {
      label: '👦 Male',
      key: 'gender',
      value: 'M',
      colorScheme: 'cyan'
    },
    {
      label: '👧 Female',
      key: 'gender',
      value: 'F',
      colorScheme: 'pink'
    },
    {
      label: '🔄 Withdrawn',
      key: 'enrollmentStatus',
      value: 'WITHDRAWN',
      colorScheme: 'orange'
    }
  ];

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="xl"
      border="1px solid"
      borderColor="gray.200"
      mb={6}
      overflow="hidden"
      position="relative"
    >
      {/* Animated Top Border */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        bgGradient="linear(to-r, purple.400, pink.400, blue.400)"
        opacity={0.8}
      />

      {/* Header */}
      <Box
        p={4}
        bg="gray.50"
        borderBottom="1px solid"
        borderColor="gray.200"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" alignItems="center" gap={3}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            🔍 Advanced Student Filters
          </Text>
          {activeFilters > 0 && (
            <Box 
              bg="purple.500" 
              color="white" 
              px={3} 
              py={1} 
              borderRadius="full" 
              fontSize="sm" 
              fontWeight="bold"
            >
              {activeFilters} active
            </Box>
          )}
        </Box>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggle}
          color="gray.600"
          _hover={{ color: 'purple.600', bg: 'purple.50' }}
          fontWeight="medium"
        >
          {isOpen ? '▲ Hide' : '▼ Show'}
        </Button>
      </Box>

      {/* Filter Content */}
      {isOpen && (
        <Box 
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          opacity={isOpen ? 1 : 0}
          transform={isOpen ? "translateY(0)" : "translateY(-10px)"}
        >
          <Box p={6} bg="gray.50">
            
            {/* Quick Filter Buttons */}
            <Box mb={6}>
              <Text fontSize="md" fontWeight="bold" color="gray.700" mb={4} display="flex" alignItems="center" gap={2}>
                ⚡ Quick Filters
              </Text>
              
              <Box display="flex" flexWrap="wrap" gap={3}>
                {getQuickFilters().map((quickFilter) => (
                  <Button
                    key={quickFilter.label}
                    size="sm"
                    colorScheme={quickFilter.colorScheme}
                    variant={filters[quickFilter.key] === quickFilter.value ? "solid" : "outline"}
                    onClick={() => {
                      if (filters[quickFilter.key] === quickFilter.value) {
                        updateFilter(quickFilter.key, '');
                      } else {
                        updateFilter(quickFilter.key, quickFilter.value);
                      }
                    }}
                    borderRadius="full"
                    px={4}
                    _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                    transition="all 0.2s"
                  >
                    {quickFilter.label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Main Filter Grid */}
            <Box mb={6}>
              <Text fontSize="md" fontWeight="bold" color="gray.700" mb={4}>
                🎯 Main Filters
              </Text>
              
              <Box
                display="grid"
                gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={4}
              >
                {/* Search Input */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    🔍 Search Student
                  </Text>
                  <Input
                    placeholder="🔍 Name, ID, or Email..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px purple.400' }}
                  />
                </Box>

                {/* Enrollment Status */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    📚 Enrollment Status
                  </Text>
                  <Select
                    value={filters.enrollmentStatus || 'all'}
                    onChange={(e) => updateFilter('enrollmentStatus', e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="ENROLLED">Enrolled</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                    <option value="TRANSFERRED">Transferred</option>
                    <option value="GRADUATED">Graduated</option>
                  </Select>
                </Box>

                {/* Payment Status */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    💳 Payment Status
                  </Text>
                  <Select
                    value={filters.paymentStatus || 'all'}
                    onChange={(e) => updateFilter('paymentStatus', e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400' }}
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Fully Paid</option>
                    <option value="partial">Partially Paid</option>
                    <option value="outstanding">Outstanding Balance</option>
                    <option value="overdue">Overdue</option>
                  </Select>
                </Box>

                {/* School Class */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    🏫 School Class
                  </Text>
                  <Select
                    value={filters.schoolClass || 'all'}
                    onChange={(e) => updateFilter('schoolClass', e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400' }}
                  >
                    <option value="all">All Classes</option>
                    <option value="PG">Playground</option>
                    <option value="PP1">PP1</option>
                    <option value="PP2">PP2</option>
                    <option value="Grade1">Grade 1</option>
                    <option value="Grade2">Grade 2</option>
                    <option value="Grade3">Grade 3</option>
                    <option value="Grade4">Grade 4</option>
                    <option value="Grade5">Grade 5</option>
                    <option value="Grade6">Grade 6</option>
                    <option value="Grade7">Grade 7</option>
                    <option value="Grade8">Grade 8</option>
                  </Select>
                </Box>

                {/* Gender */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    👤 Gender
                  </Text>
                  <Select
                    value={filters.gender || 'all'}
                    onChange={(e) => updateFilter('gender', e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400' }}
                  >
                    <option value="all">All Genders</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </Select>
                </Box>

                {/* Transport */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                    🚌 Transport
                  </Text>
                  <Select
                    value={filters.hasTransport || 'all'}
                    onChange={(e) => updateFilter('hasTransport', e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400' }}
                  >
                    <option value="all">All Students</option>
                    <option value="yes">Has Transport</option>
                    <option value="no">No Transport</option>
                  </Select>
                </Box>
              </Box>
            </Box>

            {/* Advanced Filters Section */}
            <Box mb={6}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={() => setShowAdvanced(!showAdvanced)}
                _hover={{ color: 'purple.600' }}
                transition="color 0.2s"
              >
                <Text fontSize="md" fontWeight="bold" color="gray.700">
                  🔧 Advanced Filters
                </Text>
                <Text color="gray.500">{showAdvanced ? '▲' : '▼'}</Text>
              </Box>

              {showAdvanced && (
                <Box 
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  opacity={showAdvanced ? 1 : 0}
                  transform={showAdvanced ? "translateY(0)" : "translateY(-10px)"}
                  mt={4}
                  pt={4}
                  borderTop="1px solid"
                  borderColor="gray.200"
                  display="grid"
                  gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                  gap={4}
                >
                  
                  {/* Age Range */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      🎂 Age Range
                    </Text>
                    <Select
                      value={filters.ageRange || 'all'}
                      onChange={(e) => updateFilter('ageRange', e.target.value)}
                      size="sm"
                      borderRadius="lg"
                      bg="white"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.400' }}
                    >
                      <option value="all">All Ages</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-8">6-8 years</option>
                      <option value="9-11">9-11 years</option>
                      <option value="12-14">12-14 years</option>
                      <option value="15+">15+ years</option>
                    </Select>
                  </Box>

                  {/* Special Needs */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      ⭐ Special Needs
                    </Text>
                    <Select
                      value={filters.hasSpecialNeeds || 'all'}
                      onChange={(e) => updateFilter('hasSpecialNeeds', e.target.value)}
                      size="sm"
                      borderRadius="lg"
                      bg="white"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.400' }}
                    >
                      <option value="all">All Students</option>
                      <option value="yes">Has Special Needs</option>
                      <option value="no">No Special Needs</option>
                    </Select>
                  </Box>

                  {/* Academic Year */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      📅 Academic Year
                    </Text>
                    <Select
                      value={filters.academicYear || 'all'}
                      onChange={(e) => updateFilter('academicYear', e.target.value)}
                      size="sm"
                      borderRadius="lg"
                      bg="white"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.400' }}
                    >
                      <option value="all">All Years</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2022-2023">2022-2023</option>
                    </Select>
                  </Box>

                  {/* Student Type */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      🆔 Student Type
                    </Text>
                    <Select
                      value={filters.isNewStudent || 'all'}
                      onChange={(e) => updateFilter('isNewStudent', e.target.value)}
                      size="sm"
                      borderRadius="lg"
                      bg="white"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'purple.400' }}
                    >
                      <option value="all">All Students</option>
                      <option value="yes">New Students</option>
                      <option value="no">Returning Students</option>
                      <option value="transfer">Transfer Students</option>
                    </Select>
                  </Box>

                </Box>
              )}
            </Box>

            {/* Filter Actions */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              pt={4}
              borderTop="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="sm" color="gray.600">
                {statistics && (
                  <>
                    Showing {statistics.filtered} of {statistics.total} students
                    {statistics.filtered < statistics.total && (
                      <Box
                        as="span"
                        ml={2}
                        px={2}
                        py={1}
                        bg="orange.100"
                        color="orange.700"
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        {statistics.total - statistics.filtered} filtered out
                      </Box>
                    )}
                  </>
                )}
              </Text>
              
              <Box display="flex" gap={3}>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={clearAllFilters}
                  isDisabled={activeFilters === 0}
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  🗑️ Clear All
                </Button>
                
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  onClick={onToggle}
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  📁 Collapse
                </Button>
              </Box>
            </Box>

          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChakraAdvancedFilters;
