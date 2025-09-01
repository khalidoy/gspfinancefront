import React, { useState, useEffect } from "react";

// Gender options
const GENDER_OPTIONS = [
  { value: "", label: "All Genders" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

// Student type options - replaced class filter with student status
const STUDENT_TYPE_OPTIONS = [
  { value: "", label: "All Students" },
  { value: "new", label: "New Students" },
  { value: "returning", label: "Returning Students" },
  { value: "transfer", label: "Transfer Students" },
  { value: "left", label: "Left Students" },
];

// Unpaid month options
const UNPAID_MONTH_OPTIONS = [
  { value: "", label: "All Months" },
  { value: "september", label: "September - Unpaid" },
  { value: "october", label: "October - Unpaid" },
  { value: "november", label: "November - Unpaid" },
  { value: "december", label: "December - Unpaid" },
  { value: "january", label: "January - Unpaid" },
  { value: "february", label: "February - Unpaid" },
  { value: "march", label: "March - Unpaid" },
  { value: "april", label: "April - Unpaid" },
  { value: "may", label: "May - Unpaid" },
  { value: "june", label: "June - Unpaid" },
  { value: "insurance", label: "Insurance - Unpaid" },
];

const ComprehensiveStudentFilters = ({
  // Search functionality
  searchTerm,
  onSearchChange,

  // Academic year filtering
  selectedAcademicYear,
  onAcademicYearChange,
  academicYears = [],
  loadingAcademicYears = false,

  // Class filtering
  selectedClass,
  onClassChange,
  classes = [],
  loadingClasses = false,

  // Additional filters
  selectedGender,
  onGenderChange,

  selectedStudentType,
  onStudentTypeChange,

  // Unpaid month filtering
  selectedUnpaidMonth,
  onUnpaidMonthChange,

  // Actions
  onClearFilters,
  onAddNewAcademicYear,
  onAddNewClass,

  // Statistics
  totalStudents = 0,
  filteredStudents = 0,
}) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Gender options
  const genderOptions = GENDER_OPTIONS;

  // Student type options
  const studentTypeOptions = STUDENT_TYPE_OPTIONS;

  // Update active filters when filter values change
  useEffect(() => {
    const filters = [];

    if (searchTerm) {
      filters.push({
        type: "search",
        label: `Search: "${searchTerm}"`,
        value: searchTerm,
      });
    }

    if (selectedAcademicYear) {
      const year = academicYears.find((y) => y.id === selectedAcademicYear);
      filters.push({
        type: "academic_year",
        label: `Year: ${year?.year_name || selectedAcademicYear}`,
        value: selectedAcademicYear,
      });
    }

    if (selectedUnpaidMonth) {
      const month = UNPAID_MONTH_OPTIONS.find(
        (m) => m.value === selectedUnpaidMonth
      );
      filters.push({
        type: "unpaidMonth",
        label: month?.label || `Unpaid Month: ${selectedUnpaidMonth}`,
        value: selectedUnpaidMonth,
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

    if (selectedGender) {
      const gender = genderOptions.find((g) => g.value === selectedGender);
      filters.push({
        type: "gender",
        label: gender?.label || `Gender: ${selectedGender}`,
        value: selectedGender,
      });
    }

    if (selectedStudentType) {
      const type = studentTypeOptions.find(
        (t) => t.value === selectedStudentType
      );
      filters.push({
        type: "student_type",
        label: type?.label || `Type: ${selectedStudentType}`,
        value: selectedStudentType,
      });
    }

    if (selectedUnpaidMonth) {
      const month = UNPAID_MONTH_OPTIONS.find(
        (m) => m.value === selectedUnpaidMonth
      );
      filters.push({
        type: "unpaid_month",
        label: month?.label || `Unpaid: ${selectedUnpaidMonth}`,
        value: selectedUnpaidMonth,
      });
    }

    setActiveFilters(filters);
  }, [
    searchTerm,
    selectedAcademicYear,
    selectedClass,
    selectedGender,
    selectedStudentType,
    selectedUnpaidMonth,
    academicYears,
    classes,
    genderOptions,
    studentTypeOptions,
  ]);

  const handleRemoveFilter = (filterType) => {
    switch (filterType) {
      case "search":
        onSearchChange("");
        break;
      case "academic_year":
        onAcademicYearChange("");
        break;
      case "unpaidMonth":
        onUnpaidMonthChange("");
        break;
      case "class":
        onClassChange("");
        break;
      case "gender":
        onGenderChange("");
        break;
      case "student_type":
        onStudentTypeChange("");
        break;
      case "unpaid_month":
        onUnpaidMonthChange("");
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    onSearchChange("");
    onAcademicYearChange("");
    onClassChange("");
    onGenderChange("");
    onStudentTypeChange("");
    onUnpaidMonthChange("");
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Main Filter Controls */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Filter Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#2D3748",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔍 Student Filters
          </h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                padding: "6px 12px",
                border: "1px solid #CBD5E0",
                borderRadius: "6px",
                backgroundColor: showAdvanced ? "#EDF2F7" : "white",
                color: "#4A5568",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ⚙️ Advanced
            </button>
            {activeFilters.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #FEB2B2",
                  borderRadius: "6px",
                  backgroundColor: "#FED7D7",
                  color: "#C53030",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ✖️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Basic Filters Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "16px",
            marginBottom: showAdvanced ? "16px" : "0",
          }}
        >
          {/* Search Input */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              🔍 Search Students
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3B82F6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9CA3AF",
                  fontSize: "14px",
                }}
              >
                🔍
              </span>
            </div>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              📅 Academic Year
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {loadingAcademicYears ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#6B7280",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #E5E7EB",
                      borderTop: "2px solid #3B82F6",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Loading...
                </div>
              ) : (
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => onAcademicYearChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">All Years</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year_name}
                      {year.is_current_year && " (Current)"}
                    </option>
                  ))}
                </select>
              )}
              {onAddNewAcademicYear && (
                <button
                  onClick={onAddNewAcademicYear}
                  title="Add New Academic Year"
                  style={{
                    padding: "10px",
                    border: "1px solid #10B981",
                    borderRadius: "6px",
                    backgroundColor: "#D1FAE5",
                    color: "#065F46",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ➕
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              � Unpaid Month
            </label>
            <select
              value={selectedUnpaidMonth}
              onChange={(e) => onUnpaidMonthChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                backgroundColor: "white",
              }}
            >
              {UNPAID_MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              🏫 Class
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {loadingClasses ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#6B7280",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #E5E7EB",
                      borderTop: "2px solid #3B82F6",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Loading...
                </div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => onClassChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">All Classes</option>
                  {classes.map((classObj) => (
                    <option key={classObj.id} value={classObj.id}>
                      {classObj.class_name}
                    </option>
                  ))}
                </select>
              )}
              {onAddNewClass && (
                <button
                  onClick={onAddNewClass}
                  title="Add New Class"
                  style={{
                    padding: "10px",
                    border: "1px solid #10B981",
                    borderRadius: "6px",
                    backgroundColor: "#D1FAE5",
                    color: "#065F46",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ➕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid #E5E7EB",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Gender Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  👥 Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => onGenderChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  {genderOptions.map((gender) => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Type Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  🎓 Student Type
                </label>
                <select
                  value={selectedStudentType}
                  onChange={(e) => onStudentTypeChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  {studentTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unpaid Month Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  � Unpaid Month
                </label>
                <select
                  value={selectedUnpaidMonth}
                  onChange={(e) => onUnpaidMonthChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  {UNPAID_MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#F0F9FF",
              border: "1px solid #BAE6FD",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#0369A1",
                }}
              >
                🎯 Active Filters:
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  onClick={() => handleRemoveFilter(filter.type)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#1D4ED8",
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#1D4ED8";
                  }}
                >
                  {filter.label}
                  <span style={{ fontSize: "10px" }}>✕</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter Statistics */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#64748B" }}>
            {activeFilters.length === 0
              ? "No filters applied - showing all students"
              : `Filters applied - showing filtered results`}
          </div>
          <div
            style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}
          >
            {filteredStudents} of {totalStudents} students
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ComprehensiveStudentFilters;
