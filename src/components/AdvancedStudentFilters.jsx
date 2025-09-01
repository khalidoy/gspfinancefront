import React, { useState, useEffect } from 'react';
import './AdvancedStudentFilters.css';

const AdvancedStudentFilters = ({
  filters = {},
  onFiltersChange = () => {},
  statistics = null,
  totalStudents = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Update active filter count when filters change
  useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value !== '' && value !== 'all' && value !== null && value !== undefined
    ).length;
    setActiveFilters(count);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchText: '',
      enrollmentStatus: 'all',
      enrollmentMonth: 'all',
      isNewStudent: 'all',
      hasOutstandingBalance: 'all',
      paymentStatus: 'all',
      usesTransport: 'all',
      gender: 'all',
      schoolClass: 'all',
      section: 'all',
      hasSpecialNeeds: 'all',
      ageRange: 'all',
      enrollmentYear: 'all'
    };
    onFiltersChange(clearedFilters);
  };

  const getQuickFilters = () => [
    {
      label: 'Outstanding Balance',
      key: 'hasOutstandingBalance',
      value: 'yes',
      color: 'red',
      icon: '💰'
    },
    {
      label: 'New Students',
      key: 'isNewStudent', 
      value: 'yes',
      color: 'green',
      icon: '🆕'
    },
    {
      label: 'Uses Transport',
      key: 'usesTransport',
      value: 'yes', 
      color: 'blue',
      icon: '🚌'
    },
    {
      label: 'Special Needs',
      key: 'hasSpecialNeeds',
      value: 'yes',
      color: 'purple',
      icon: '⭐'
    },
    {
      label: 'Fully Paid',
      key: 'paymentStatus',
      value: 'paid',
      color: 'emerald',
      icon: '✅'
    },
    {
      label: 'Withdrawn',
      key: 'enrollmentStatus',
      value: 'WITHDRAWN',
      color: 'orange',
      icon: '🔄'
    }
  ];

  return (
    <div className="student-filters">
      {/* Header */}
      <div className="filters-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="header-left">
          <div className="filter-icon">🔍</div>
          <div className="header-content">
            <h3>Student Filters</h3>
            <div className="filter-stats">
              {statistics ? (
                <span>{statistics.filtered} of {statistics.total} students</span>
              ) : (
                <span>{totalStudents} students</span>
              )}
              {activeFilters > 0 && (
                <span className="active-filters-badge">{activeFilters} active</span>
              )}
            </div>
          </div>
        </div>
        <div className="collapse-icon">
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="filters-content">
          
          {/* Quick Filter Buttons */}
          <div className="quick-filters-section">
            <h4>Quick Filters</h4>
            <div className="quick-filters">
              {getQuickFilters().map((quickFilter) => (
                <button
                  key={quickFilter.key}
                  className={`quick-filter-btn ${quickFilter.color} ${
                    filters[quickFilter.key] === quickFilter.value ? 'active' : ''
                  }`}
                  onClick={() => updateFilter(quickFilter.key, 
                    filters[quickFilter.key] === quickFilter.value ? 'all' : quickFilter.value
                  )}
                >
                  <span className="filter-icon">{quickFilter.icon}</span>
                  {quickFilter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Filters Grid */}
          <div className="filters-grid">
            
            {/* Search */}
            <div className="filter-group">
              <label>🔎 Search Student</label>
              <input
                type="text"
                placeholder="Name, ID, or parent name..."
                value={filters.searchText || ''}
                onChange={(e) => updateFilter('searchText', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Enrollment Status */}
            <div className="filter-group">
              <label>📋 Enrollment Status</label>
              <select
                value={filters.enrollmentStatus || 'all'}
                onChange={(e) => updateFilter('enrollmentStatus', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="GRADUATED">Graduated</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="filter-group">
              <label>💳 Payment Status</label>
              <select
                value={filters.paymentStatus || 'all'}
                onChange={(e) => updateFilter('paymentStatus', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="outstanding">Has Outstanding</option>
                <option value="no_payment">No Payments</option>
              </select>
            </div>

            {/* School Class */}
            <div className="filter-group">
              <label>🎓 School Class</label>
              <select
                value={filters.schoolClass || 'all'}
                onChange={(e) => updateFilter('schoolClass', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Classes</option>
                <option value="PRESCHOOL">Preschool</option>
                <option value="KINDERGARTEN">Kindergarten</option>
                <option value="PRIMARY">Primary School</option>
                <option value="MIDDLE">Middle School</option>
                <option value="HIGH">High School</option>
              </select>
            </div>

            {/* Gender */}
            <div className="filter-group">
              <label>👥 Gender</label>
              <select
                value={filters.gender || 'all'}
                onChange={(e) => updateFilter('gender', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Enrollment Month */}
            <div className="filter-group">
              <label>📅 Enrollment Month</label>
              <select
                value={filters.enrollmentMonth || 'all'}
                onChange={(e) => updateFilter('enrollmentMonth', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Months</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
              </select>
            </div>

            {/* Age Range */}
            <div className="filter-group">
              <label>🎂 Age Range</label>
              <select
                value={filters.ageRange || 'all'}
                onChange={(e) => updateFilter('ageRange', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ages</option>
                <option value="3-5">3-5 years</option>
                <option value="6-8">6-8 years</option>
                <option value="9-11">9-11 years</option>
                <option value="12-14">12-14 years</option>
                <option value="15-18">15-18 years</option>
              </select>
            </div>

            {/* Academic Year */}
            <div className="filter-group">
              <label>📚 Academic Year</label>
              <select
                value={filters.enrollmentYear || 'all'}
                onChange={(e) => updateFilter('enrollmentYear', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>

          </div>

          {/* Advanced Filters Toggle */}
          <div className="advanced-filters-section">
            <details>
              <summary>🔧 Advanced Filters</summary>
              <div className="advanced-filters-grid">
                
                <div className="filter-group">
                  <label>🆔 Student Type</label>
                  <select
                    value={filters.isNewStudent || 'all'}
                    onChange={(e) => updateFilter('isNewStudent', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Students</option>
                    <option value="yes">New Students</option>
                    <option value="no">Returning Students</option>
                    <option value="transfer">Transfer Students</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>🚌 Transportation</label>
                  <select
                    value={filters.usesTransport || 'all'}
                    onChange={(e) => updateFilter('usesTransport', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Students</option>
                    <option value="yes">Uses Transport</option>
                    <option value="no">No Transport</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>⭐ Special Needs</label>
                  <select
                    value={filters.hasSpecialNeeds || 'all'}
                    onChange={(e) => updateFilter('hasSpecialNeeds', e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Students</option>
                    <option value="yes">Has Special Needs</option>
                    <option value="no">No Special Needs</option>
                  </select>
                </div>

              </div>
            </details>
          </div>

          {/* Filter Actions */}
          <div className="filter-actions">
            <div className="filter-summary">
              {statistics && (
                <span className="results-summary">
                  📊 Showing {statistics.filtered} of {statistics.total} students
                  {statistics.filtered !== statistics.total && (
                    <span className="filtered-indicator">
                      ({statistics.total - statistics.filtered} filtered out)
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="action-buttons">
              <button
                className="clear-filters-btn"
                onClick={clearAllFilters}
                disabled={activeFilters === 0}
              >
                🗑️ Clear All Filters
              </button>
              <button
                className="collapse-btn"
                onClick={() => setIsCollapsed(true)}
              >
                📁 Collapse Filters
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdvancedStudentFilters;
