import React, { useState, useEffect } from 'react';

const SimpleAdvancedFilters = ({ filters = {}, onFiltersChange = () => {}, statistics = null, onApplyFilters = () => {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onToggle = () => setIsOpen(!isOpen);

  // Initialize filters properly on mount
  useEffect(() => {
    if (!filters.hasOwnProperty('searchText')) {
      // Use the exact same default filters as in Home.jsx
      const clearedFilters = {
        searchText: '',
        paymentStatus: 'all',
        studentType: 'all',
        agreedAmountStatus: 'all',
        transportStatus: 'all',
        enrollmentMonth: 'all',
        outstandingRange: [0, 10000],
        collectionRate: [0, 100],
        showOnlyProblems: false
      };
      onFiltersChange(clearedFilters);
    }
  }, [filters, onFiltersChange]);

  // Update active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value && value !== 'all' && value !== '' && value !== 'any'
    ).length;
    setActiveFilters(count);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters };
    
    // Map our component's filter keys to the backend filter keys
    if (key === 'search') {
      newFilters.searchText = value;
    } else {
      newFilters[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    // Use the exact same default filters as in Home.jsx
    const clearedFilters = {
      searchText: '',
      paymentStatus: 'all',
      studentType: 'all',
      agreedAmountStatus: 'all',
      transportStatus: 'all',
      enrollmentMonth: 'all',
      outstandingRange: [0, 10000],
      collectionRate: [0, 100],
      showOnlyProblems: false
    };
    onFiltersChange(clearedFilters);
  };

  // Quick filter configurations
  const getQuickFilters = () => [
    {
      label: '💰 Outstanding Balance',
      key: 'paymentStatus',
      value: 'unpaid',
      color: '#E53E3E'
    },
    {
      label: '✅ Paid Up',
      key: 'paymentStatus',
      value: 'paid',
      color: '#38A169'
    },
    {
      label: '🆕 New Students',
      key: 'studentType',
      value: 'new',
      color: '#3182CE'
    },
    {
      label: '🚌 Transport',
      key: 'transportStatus',
      value: 'hasTransport',
      color: '#805AD5'
    },
    {
      label: '⭐ Problems',
      key: 'showOnlyProblems',
      value: true,
      color: '#DD6B20'
    }
  ];

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      border: '1px solid #E2E8F0',
      marginBottom: '24px',
      overflow: 'hidden',
      position: 'relative'
    },
    header: {
      padding: '16px',
      backgroundColor: '#F7FAFC',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    content: {
      padding: '24px',
      backgroundColor: '#F7FAFC'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: '2px solid',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '14px',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '2px solid #E2E8F0',
      backgroundColor: 'white',
      fontSize: '14px'
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '2px solid #E2E8F0',
      backgroundColor: 'white',
      fontSize: '14px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    flexWrap: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Top Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #805AD5, #ED64A6, #3182CE)',
        opacity: 0.8
      }} />

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2D3748' }}>
            🔍 Advanced Student Filters
          </span>
          {activeFilters > 0 && (
            <span style={{
              backgroundColor: '#805AD5',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {activeFilters} active
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          style={{
            ...styles.button,
            borderColor: '#E2E8F0',
            color: '#718096'
          }}
        >
          {isOpen ? '▲ Hide' : '▼ Show'}
        </button>
      </div>

      {/* Filter Content */}
      {isOpen && (
        <div style={styles.content}>
          
          {/* Quick Filter Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4A5568', marginBottom: '16px' }}>
              ⚡ Quick Filters
            </h3>
            
            <div style={styles.flexWrap}>
              {getQuickFilters().map((quickFilter) => (
                <button
                  key={quickFilter.label}
                  onClick={() => {
                    if (quickFilter.key === 'showOnlyProblems') {
                      // Handle boolean toggle
                      updateFilter(quickFilter.key, !filters[quickFilter.key]);
                    } else {
                      // Handle regular filters
                      if (filters[quickFilter.key] === quickFilter.value) {
                        updateFilter(quickFilter.key, 'all');
                      } else {
                        updateFilter(quickFilter.key, quickFilter.value);
                      }
                    }
                  }}
                  style={{
                    ...styles.button,
                    borderColor: quickFilter.color,
                    color: (quickFilter.key === 'showOnlyProblems' ? 
                      filters[quickFilter.key] : 
                      filters[quickFilter.key] === quickFilter.value) ? 'white' : quickFilter.color,
                    backgroundColor: (quickFilter.key === 'showOnlyProblems' ? 
                      filters[quickFilter.key] : 
                      filters[quickFilter.key] === quickFilter.value) ? quickFilter.color : 'white'
                  }}
                >
                  {quickFilter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Filter Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4A5568', marginBottom: '16px' }}>
              🎯 Main Filters
            </h3>
            
            <div style={styles.grid}>
              {/* Search Input */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                  🔍 Search Student
                </label>
                <input
                  type="text"
                  placeholder="🔍 Name, ID, or Email..."
                  value={filters.searchText || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* Enrollment Status */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                  📚 Enrollment Status
                </label>
                <select
                  value={filters.enrollmentStatus || 'all'}
                  onChange={(e) => updateFilter('enrollmentStatus', e.target.value)}
                  style={styles.select}
                >
                  <option value="all">All Statuses</option>
                  <option value="ENROLLED">Enrolled</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                  <option value="TRANSFERRED">Transferred</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                  💳 Payment Status
                </label>
                <select
                  value={filters.paymentStatus || 'all'}
                  onChange={(e) => updateFilter('paymentStatus', e.target.value)}
                  style={styles.select}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Fully Paid</option>
                  <option value="partial">Partially Paid</option>
                  <option value="outstanding">Outstanding Balance</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* School Class */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                  🏫 School Class
                </label>
                <select
                  value={filters.schoolClass || 'all'}
                  onChange={(e) => updateFilter('schoolClass', e.target.value)}
                  style={styles.select}
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
                </select>
              </div>

              {/* Gender */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                  👤 Gender
                </label>
                <select
                  value={filters.gender || 'all'}
                  onChange={(e) => updateFilter('gender', e.target.value)}
                  style={styles.select}
                >
                  <option value="all">All Genders</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* Transport */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                  🚌 Transport
                </label>
                <select
                  value={filters.hasTransport || 'all'}
                  onChange={(e) => updateFilter('hasTransport', e.target.value)}
                  style={styles.select}
                >
                  <option value="all">All Students</option>
                  <option value="yes">Has Transport</option>
                  <option value="no">No Transport</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div style={{ marginBottom: '24px' }}>
            <div
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: showAdvanced ? '16px' : '0'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4A5568' }}>
                🔧 Advanced Filters
              </h3>
              <span style={{ color: '#718096' }}>{showAdvanced ? '▲' : '▼'}</span>
            </div>

            {showAdvanced && (
              <div style={{
                ...styles.grid,
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0'
              }}>
                
                {/* Age Range */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                    🎂 Age Range
                  </label>
                  <select
                    value={filters.ageRange || 'all'}
                    onChange={(e) => updateFilter('ageRange', e.target.value)}
                    style={styles.select}
                  >
                    <option value="all">All Ages</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-8">6-8 years</option>
                    <option value="9-11">9-11 years</option>
                    <option value="12-14">12-14 years</option>
                    <option value="15+">15+ years</option>
                  </select>
                </div>

                {/* Special Needs */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                    ⭐ Special Needs
                  </label>
                  <select
                    value={filters.hasSpecialNeeds || 'all'}
                    onChange={(e) => updateFilter('hasSpecialNeeds', e.target.value)}
                    style={styles.select}
                  >
                    <option value="all">All Students</option>
                    <option value="yes">Has Special Needs</option>
                    <option value="no">No Special Needs</option>
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                    📅 Academic Year
                  </label>
                  <select
                    value={filters.academicYear || 'all'}
                    onChange={(e) => updateFilter('academicYear', e.target.value)}
                    style={styles.select}
                  >
                    <option value="all">All Years</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2022-2023">2022-2023</option>
                  </select>
                </div>

                {/* Student Type */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#4A5568', marginBottom: '8px', display: 'block' }}>
                    🆔 Student Type
                  </label>
                  <select
                    value={filters.isNewStudent || 'all'}
                    onChange={(e) => updateFilter('isNewStudent', e.target.value)}
                    style={styles.select}
                  >
                    <option value="all">All Students</option>
                    <option value="yes">New Students</option>
                    <option value="no">Returning Students</option>
                    <option value="transfer">Transfer Students</option>
                  </select>
                </div>

              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0'
          }}>
            <span style={{ fontSize: '14px', color: '#718096' }}>
              {statistics && (
                <>
                  Showing {statistics.filtered} of {statistics.total} students
                  {statistics.filtered < statistics.total && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      backgroundColor: '#FED7D7',
                      color: '#C53030',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {statistics.total - statistics.filtered} filtered out
                    </span>
                  )}
                </>
              )}
            </span>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={clearAllFilters}
                disabled={activeFilters === 0}
                style={{
                  ...styles.button,
                  borderColor: '#E53E3E',
                  color: activeFilters === 0 ? '#CBD5E0' : '#E53E3E',
                  cursor: activeFilters === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                🗑️ Clear All
              </button>
              
              <button
                onClick={() => onApplyFilters(filters)}
                style={{
                  ...styles.button,
                  borderColor: '#38A169',
                  color: 'white',
                  backgroundColor: '#38A169',
                  fontWeight: 'bold'
                }}
              >
                🔍 Apply Filters
              </button>
              
              <button
                onClick={onToggle}
                style={{
                  ...styles.button,
                  borderColor: '#805AD5',
                  color: '#805AD5'
                }}
              >
                📁 Collapse
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SimpleAdvancedFilters;
