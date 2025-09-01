// Backup of original ClassCardComponent
import React, { useState, useEffect } from "react";
import axios from "axios";

const ClassCardComponent = ({
  academicYearId,
  onClassSelect,
  selectedClassId,
  filterType = "", // "", "new", "left", "registered", "notRegistered"
  searchQuery = "",
  selectedStatus = "",
  selectedGender = "",
  selectedStudentType = "",
}) => {
  const [classData, setClassData] = useState([]);
  const [sectionsWithClasses, setSectionsWithClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClassData = async () => {
      if (!academicYearId) return;

      setLoading(true);
      setError("");

      try {
        // Fetch sections with classes
        let sectionsUrl = `${process.env.REACT_APP_BACKEND_URL}/sections/api/sections-with-classes?academic_year_id=${academicYearId}`;
        const sectionsResponse = await axios.get(sectionsUrl);

        if (sectionsResponse.data && sectionsResponse.data.sections) {
          // Process each section and its classes
          const sectionsWithProcessedClasses = await Promise.all(
            sectionsResponse.data.sections.map(async (section) => {
              // Process all classes in this section
              const classesWithStats = await Promise.all(
                section.classes.map(async (classItem) => {
                  try {
                    let statsUrl = `${process.env.REACT_APP_BACKEND_URL}/students/api/student-stats?academic_year_id=${academicYearId}&class_id=${classItem.id}`;

                    // Add additional filters
                    if (searchQuery.trim()) {
                      statsUrl += `&search_query=${encodeURIComponent(
                        searchQuery.trim()
                      )}`;
                    }
                    if (selectedStatus && selectedStatus !== "ALL") {
                      statsUrl += `&status=${selectedStatus}`;
                    }
                    if (selectedGender && selectedGender !== "") {
                      statsUrl += `&gender=${selectedGender}`;
                    }
                    if (selectedStudentType && selectedStudentType !== "") {
                      statsUrl += `&student_type=${selectedStudentType}`;
                    }

                    const statsResponse = await axios.get(statsUrl);
                    const stats = statsResponse.data;

                    // Also fetch financial summary for this class
                    let financialData = null;
                    try {
                      let dashboardUrl = `${process.env.REACT_APP_BACKEND_URL}/home/api/dashboard-data?academic_year_id=${academicYearId}&class_id=${classItem.id}`;
                      const dashboardResponse = await axios.get(dashboardUrl);
                      financialData = dashboardResponse.data?.summary || null;
                    } catch (financialErr) {
                      console.error(
                        `Error fetching financial data for class ${classItem.id}:`,
                        financialErr
                      );
                      financialData = null;
                    }

                    let filteredCount = 0;
                    if (filterType) {
                      // Specific statistic filter applied
                      switch (filterType) {
                        case "new":
                          filteredCount = stats.newStudents || 0;
                          break;
                        case "left":
                          filteredCount = stats.leftStudents || 0;
                          break;
                        case "registered":
                          filteredCount = stats.registeredStudents || 0;
                          break;
                        case "notRegistered":
                          filteredCount = stats.notRegisteredStudents || 0;
                          break;
                        default:
                          filteredCount = stats.totalStudents || 0;
                          break;
                      }
                    } else {
                      // No specific filter, but apply other filters (search, status, etc.)
                      filteredCount = stats.totalStudents || 0;
                    }

                    return {
                      ...classItem,
                      filteredCount,
                      totalStats: stats,
                      financialData,
                    };
                  } catch (err) {
                    console.error(
                      `Error fetching stats for class ${classItem.id}:`,
                      err
                    );
                    return {
                      ...classItem,
                      filteredCount: classItem.student_count || 0,
                      totalStats: null,
                      financialData: null,
                    };
                  }
                })
              );

              // Only filter out classes with 0 students if we have any active filters
              const hasActiveFilters =
                filterType ||
                searchQuery.trim() ||
                (selectedStatus &&
                  selectedStatus !== "ALL" &&
                  selectedStatus !== "ACTIVE") ||
                selectedGender ||
                selectedStudentType;

              const filteredClasses = hasActiveFilters
                ? classesWithStats.filter(
                    (classItem) => classItem.filteredCount > 0
                  )
                : classesWithStats;

              // Calculate section totals
              const sectionTotalStudents = filteredClasses.reduce(
                (sum, cls) => sum + (cls.filteredCount || 0),
                0
              );

              return {
                ...section,
                classes: filteredClasses,
                total_students: sectionTotalStudents,
              };
            })
          );

          // Filter out sections with no classes (if filters are applied)
          const sectionsWithClasses = sectionsWithProcessedClasses.filter(
            (section) => section.classes.length > 0
          );

          setSectionsWithClasses(sectionsWithClasses);

          // Also maintain the flat list for backward compatibility
          const allClasses = sectionsWithClasses.flatMap(
            (section) => section.classes
          );
          setClassData(allClasses);
        }
      } catch (err) {
        console.error("Error fetching class data:", err);
        setError("Failed to fetch class data");
        setSectionsWithClasses([]);
        setClassData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [
    academicYearId,
    filterType,
    searchQuery,
    selectedStatus,
    selectedGender,
    selectedStudentType,
  ]);

  const getFilterLabel = (type) => {
    switch (type) {
      case "new":
        return "New Students";
      case "left":
        return "Left Students";
      case "registered":
        return "Registered Students";
      case "notRegistered":
        return "Not Registered Students";
      default:
        return "All Students";
    }
  };

  const getFilterColor = (type) => {
    switch (type) {
      case "new":
        return "#38a169";
      case "left":
        return "#e53e3e";
      case "registered":
        return "#3182ce";
      case "notRegistered":
        return "#d69e2e";
      default:
        return "#805ad5";
    }
  };

  const getFilterIcon = (type) => {
    switch (type) {
      case "new":
        return "🆕";
      case "left":
        return "🚪";
      case "registered":
        return "✅";
      case "notRegistered":
        return "❌";
      default:
        return "🏫";
    }
  };

  if (!academicYearId) {
    return (
      <div
        style={{
          backgroundColor: "#f7fafc",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#718096", margin: 0 }}>
          Please select an academic year to view classes
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#f7fafc",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "32px",
            height: "32px",
            border: "3px solid #e2e8f0",
            borderTop: "3px solid #3182ce",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "16px",
          }}
        />
        <p style={{ color: "#718096", margin: 0 }}>Loading classes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#fed7d7",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid #feb2b2",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#c53030", margin: 0 }}>⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f7fafc",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginBottom: "24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#2d3748",
            margin: "0 0 8px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {getFilterIcon(filterType)} Classes{" "}
          {filterType && (
            <span
              style={{
                fontSize: "14px",
                color: getFilterColor(filterType),
                backgroundColor: `${getFilterColor(filterType)}20`,
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${getFilterColor(filterType)}40`,
              }}
            >
              {getFilterLabel(filterType)}
            </span>
          )}
        </h3>
        <p style={{ fontSize: "14px", color: "#718096", margin: "0" }}>
          {filterType
            ? `Classes with ${getFilterLabel(filterType).toLowerCase()}`
            : "Select a class to view its students"}
        </p>
      </div>

      {/* Class Cards Grid - Organized by Sections */}
      {sectionsWithClasses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#718096",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
          <p
            style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "500" }}
          >
            {filterType
              ? `No classes found with ${getFilterLabel(
                  filterType
                ).toLowerCase()}`
              : "No classes found"}
          </p>
          <p style={{ margin: 0, fontSize: "14px" }}>
            {filterType
              ? "Try adjusting your filters or check a different academic year"
              : searchQuery ||
                  selectedStatus !== "ACTIVE" ||
                  selectedGender ||
                  selectedStudentType
                ? "Try adjusting your current filters to see more classes"
                : "Classes will appear here when they are created for this academic year"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {sectionsWithClasses.map((section) => (
            <div key={section.id} style={{ marginBottom: "24px" }}>
              {/* Section Header */}
              <div
                style={{
                  backgroundColor: "#2d3748",
                  color: "white",
                  padding: "16px 20px",
                  borderRadius: "12px 12px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    📚 {section.section_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>
                    {section.description || `${section.section_type} Education`}
                    {section.grade_range_start !== undefined &&
                      section.grade_range_end !== undefined && (
                        <span>
                          {" "}
                          • Grades {section.grade_range_start}-
                          {section.grade_range_end}
                        </span>
                      )}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {section.total_students}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {section.classes.length} Classes
                  </div>
                </div>
              </div>

              {/* Classes Grid for this Section */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {section.classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      onClick={() => onClassSelect(classItem.id)}
                      style={{
                        backgroundColor: "#ffffff",
                        border:
                          selectedClassId === classItem.id
                            ? "2px solid #3182ce"
                            : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "20px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow:
                          selectedClassId === classItem.id
                            ? "0 4px 12px rgba(49, 130, 206, 0.15)"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedClassId !== classItem.id) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.15)";
                          e.currentTarget.style.borderColor = "#cbd5e0";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedClassId !== classItem.id) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.1)";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }
                      }}
                    >
                      {/* Class Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#2d3748",
                              margin: "0 0 4px 0",
                            }}
                          >
                            {classItem.class_name}
                          </h4>
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#718096",
                              margin: 0,
                            }}
                          >
                            {filterType
                              ? "Filtered Students"
                              : "Total Students"}
                            {classItem.class_teacher && (
                              <span> • {classItem.class_teacher}</span>
                            )}
                          </p>
                        </div>
                        <div
                          style={{
                            backgroundColor: getFilterColor(filterType) + "20",
                            color: getFilterColor(filterType),
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          {filterType
                            ? classItem.filteredCount
                            : classItem.student_count}
                        </div>
                      </div>

                      {/* Student Count Details */}
                      {filterType && classItem.totalStats && (
                        <div
                          style={{
                            backgroundColor: "#f7fafc",
                            padding: "12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#4a5568",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "8px",
                            }}
                          >
                            <div>New: {classItem.totalStats.newStudents}</div>
                            <div>Left: {classItem.totalStats.leftStudents}</div>
                            <div>
                              Registered:{" "}
                              {classItem.totalStats.registeredStudents}
                            </div>
                            <div>
                              Not Reg.:{" "}
                              {classItem.totalStats.notRegisteredStudents}
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: "8px",
                              paddingTop: "8px",
                              borderTop: "1px solid #e2e8f0",
                              fontWeight: "500",
                            }}
                          >
                            Total: {classItem.totalStats.totalStudents}
                          </div>
                        </div>
                      )}

                      {/* Financial Information */}
                      {classItem.financialData && (
                        <div
                          style={{
                            backgroundColor: "#f0fff4",
                            padding: "12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#2d5a27",
                            border: "1px solid #9ae6b4",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
                              fontWeight: "600",
                              color: "#2d5a27",
                            }}
                          >
                            <span>💰 Financial Summary</span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "6px",
                              marginBottom: "8px",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: "500" }}>Agreed:</span>
                              <br />
                              {classItem.financialData.total_agreed?.toLocaleString() ||
                                0}{" "}
                              DH
                            </div>
                            <div>
                              <span style={{ fontWeight: "500" }}>Paid:</span>
                              <br />
                              {classItem.financialData.total_paid?.toLocaleString() ||
                                0}{" "}
                              DH
                            </div>
                          </div>
                          <div
                            style={{
                              paddingTop: "8px",
                              borderTop: "1px solid #9ae6b4",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: "500" }}>
                                Outstanding:
                              </span>
                              <br />
                              {classItem.financialData.outstanding_balance?.toLocaleString() ||
                                0}{" "}
                              DH
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontWeight: "500" }}>
                                Collection Rate:
                              </span>
                              <br />
                              <span
                                style={{
                                  fontWeight: "700",
                                  color:
                                    (classItem.financialData.collection_rate ||
                                      0) >= 80
                                      ? "#38a169"
                                      : (classItem.financialData
                                            .collection_rate || 0) >= 60
                                        ? "#d69e2e"
                                        : "#e53e3e",
                                }}
                              >
                                {classItem.financialData.collection_rate?.toFixed(
                                  1
                                ) || 0}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {selectedClassId === classItem.id && (
                        <div
                          style={{
                            marginTop: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#3182ce",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              backgroundColor: "#3182ce",
                              borderRadius: "50%",
                            }}
                          />
                          Currently Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassCardComponent;
