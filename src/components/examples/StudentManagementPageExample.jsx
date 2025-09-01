/**
 * Example usage of ComprehensiveStudentFilters component
 *
 * This shows how to integrate the filter component with your student management page
 */

import React, { useState, useEffect } from "react";
import ComprehensiveStudentFilters from "./ComprehensiveStudentFilters";

const StudentManagementPage = () => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE"); // Default to active students
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedStudentType, setSelectedStudentType] = useState("");

  // Data state
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Statistics
  const [totalStudents, setTotalStudents] = useState(0);
  const [filteredStudents, setFilteredStudents] = useState(0);

  // Load initial data
  useEffect(() => {
    loadAcademicYears();
    loadClasses();
    loadStudents();
  }, []);

  // Reload students when filters change
  useEffect(() => {
    loadStudents();
  }, [
    searchTerm,
    selectedAcademicYear,
    selectedStatus,
    selectedClass,
    selectedGender,
    selectedStudentType,
  ]);

  const loadAcademicYears = async () => {
    setLoadingAcademicYears(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/academic_years/api/academic-years`
      );
      if (response.ok) {
        const data = await response.json();
        setAcademicYears(data.academic_years || []);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/classes/api/classes`
      );
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (searchTerm) params.append("search", searchTerm);
      if (selectedAcademicYear)
        params.append("academic_year", selectedAcademicYear);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedClass) params.append("school_class", selectedClass);
      if (selectedGender) params.append("gender", selectedGender);

      // Handle student type filtering
      if (selectedStudentType === "new") {
        params.append("is_new_student", "true");
      } else if (selectedStudentType === "transfer") {
        params.append("is_transfer_student", "true");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/students/api?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setFilteredStudents(data.students?.length || 0);

        // If no filters applied, this represents total students
        if (
          !searchTerm &&
          !selectedAcademicYear &&
          selectedStatus === "ACTIVE" &&
          !selectedClass &&
          !selectedGender &&
          !selectedStudentType
        ) {
          setTotalStudents(data.students?.length || 0);
        }
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedAcademicYear("");
    setSelectedStatus("ACTIVE"); // Keep default active status
    setSelectedClass("");
    setSelectedGender("");
    setSelectedStudentType("");
  };

  const handleAddNewAcademicYear = () => {
    // Open academic year modal
    console.log("Open academic year modal");
  };

  const handleAddNewClass = () => {
    // Open class modal
    console.log("Open class modal");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Management</h1>

      {/* Comprehensive Filters */}
      <ComprehensiveStudentFilters
        // Search functionality
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        // Academic year filtering
        selectedAcademicYear={selectedAcademicYear}
        onAcademicYearChange={setSelectedAcademicYear}
        academicYears={academicYears}
        loadingAcademicYears={loadingAcademicYears}
        // Status filtering
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        // Class filtering
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classes={classes}
        loadingClasses={loadingClasses}
        // Additional filters
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        selectedStudentType={selectedStudentType}
        onStudentTypeChange={setSelectedStudentType}
        // Actions
        onClearFilters={handleClearFilters}
        onAddNewAcademicYear={handleAddNewAcademicYear}
        onAddNewClass={handleAddNewClass}
        // Statistics
        totalStudents={totalStudents}
        filteredStudents={filteredStudents}
      />

      {/* Loading indicator */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #E2E8F0",
              borderTop: "4px solid #3182CE",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <p>Loading students...</p>
        </div>
      )}

      {/* Students list/table would go here */}
      <div style={{ marginTop: "20px" }}>
        <h3>Students ({filteredStudents})</h3>
        {/* Your StudentTable component here */}
        <div
          style={{
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            color: "#6B7280",
          }}
        >
          Student table/grid component goes here...
          <br />
          Found {filteredStudents} students matching your filters
        </div>
      </div>

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

export default StudentManagementPage;
