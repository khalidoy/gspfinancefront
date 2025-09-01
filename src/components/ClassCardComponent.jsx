// Refactored simplified ClassCardComponent that expects parent-provided class buckets.
import React, { useState, useEffect } from "react";

const ClassCardComponent = ({
  academicYearId,
  onClassSelect,
  selectedClassId,
  filters = {},
  classesData = null, // [{id,name,section_name,student_count}]
}) => {
  const [sections, setSections] = useState([]);

  const filterType = filters.filterType || filters.statisticFilter || null;
  const hasActiveFilters =
    !!filterType ||
    !!(filters.searchQuery && filters.searchQuery.trim()) ||
    !!filters.selectedGender ||
    !!filters.selectedStudentType ||
    !!filters.selectedUnpaidMonth;

  useEffect(() => {
    if (!classesData) {
      setSections([]);
      return;
    }
    const grouped = classesData.reduce((acc, cls) => {
      const key = cls.section_name || "Unassigned";
      if (!acc[key]) acc[key] = [];
      acc[key].push(cls);
      return acc;
    }, {});
    const sectionsArr = Object.entries(grouped).map(([sectionName, list]) => ({
      id: sectionName,
      name: sectionName,
      classes: list.map((c) => ({
        id: c.id,
        class_name: c.name || c.class_name,
        filteredCount: c.student_count,
        financial_stats: c.financial_stats, // Pass through financial stats
      })),
      total_students: list.reduce((s, c) => s + (c.student_count || 0), 0),
      // Aggregate financial stats for the section
      total_agreed: list.reduce(
        (s, c) => s + (c.financial_stats?.total_agreed || 0),
        0
      ),
      total_paid: list.reduce(
        (s, c) => s + (c.financial_stats?.total_paid || 0),
        0
      ),
    }));
    setSections(sectionsArr);
  }, [classesData]);

  const colorMap = {
    new: "#38a169",
    left: "#e53e3e",
    registered: "#3182ce",
    notRegistered: "#d69e2e",
    default: "#805ad5",
  };
  const iconMap = {
    new: "🆕",
    left: "🚪",
    registered: "✅",
    notRegistered: "❌",
    default: "🏫",
  };
  const labelMap = {
    new: "New Students",
    left: "Left Students",
    registered: "Registered Students",
    notRegistered: "Not Registered Students",
    default: "All Students",
  };
  const filterColor = colorMap[filterType] || colorMap.default;
  const filterIcon = iconMap[filterType] || iconMap.default;
  const filterLabel = labelMap[filterType] || labelMap.default;

  if (!academicYearId) {
    return (
      <div style={containerStyle}>Select an academic year to view classes</div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={titleStyle}>
          {filterIcon} Classes{" "}
          {filterType && (
            <span
              style={{
                fontSize: 12,
                color: filterColor,
                background: filterColor + "20",
                padding: "4px 8px",
                borderRadius: 6,
                border: `1px solid ${filterColor}40`,
              }}
            >
              {filterLabel}
            </span>
          )}
        </h3>
        <p style={subtitleStyle}>
          {filterType
            ? `Classes with ${filterLabel.toLowerCase()}`
            : "Select a class to view its students"}
        </p>
      </div>
      {sections.length === 0 ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📚</div>
          <div style={{ fontWeight: 500 }}>
            {filterType
              ? `No classes found with ${filterLabel.toLowerCase()}`
              : "No classes found"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {sections.map((section) => (
            <div key={section.id}>
              <div style={sectionHeaderStyle}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18 }}>📚 {section.name}</h4>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    {section.total_students} students • {section.classes.length}{" "}
                    classes
                  </div>
                </div>
              </div>
              <div style={classesGridWrapper}>
                <div style={classesGrid}>
                  {section.classes.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => onClassSelect(cls.id)}
                      style={{
                        ...classCardStyle,
                        border:
                          selectedClassId === cls.id
                            ? "2px solid #3182ce"
                            : "1px solid #e2e8f0",
                        boxShadow:
                          selectedClassId === cls.id
                            ? "0 4px 12px rgba(49,130,206,.25)"
                            : "0 1px 3px rgba(0,0,0,.1)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "#3182ce",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {cls.filteredCount || 0}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        {cls.class_name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#4a5568",
                          marginBottom: 8,
                        }}
                      >
                        {hasActiveFilters ? "Filtered" : "Total"} students
                      </div>

                      {/* Financial Info */}
                      {cls.financial_stats && (
                        <div
                          style={{
                            background: "#f7fafc",
                            padding: 8,
                            borderRadius: 6,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ color: "#4a5568" }}>
                              Collection Rate:
                            </span>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  cls.financial_stats.collection_rate >= 80
                                    ? "#38a169"
                                    : cls.financial_stats.collection_rate >= 50
                                    ? "#d69e2e"
                                    : "#e53e3e",
                              }}
                            >
                              {cls.financial_stats.collection_rate}%
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 11,
                              marginBottom: 2,
                            }}
                          >
                            <span style={{ color: "#4a5568" }}>Agreed:</span>
                            <span style={{ fontWeight: 600, color: "#4a5568" }}>
                              {cls.financial_stats.total_agreed.toLocaleString()}{" "}
                              DH
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 11,
                              marginBottom: 2,
                            }}
                          >
                            <span style={{ color: "#4a5568" }}>Paid:</span>
                            <span style={{ fontWeight: 600, color: "#38a169" }}>
                              {cls.financial_stats.total_paid.toLocaleString()}{" "}
                              DH
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ color: "#4a5568" }}>
                              Outstanding:
                            </span>
                            <span style={{ fontWeight: 600, color: "#e53e3e" }}>
                              {(
                                cls.financial_stats.total_agreed -
                                cls.financial_stats.total_paid
                              ).toLocaleString()}{" "}
                              DH
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedClassId === cls.id && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: "#3182ce",
                            fontWeight: 600,
                          }}
                        >
                          Selected
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

// Styles (kept minimal inline objects)
const wrapperStyle = {
  background: "#f7fafc",
  padding: 24,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  marginBottom: 24,
};
const containerStyle = {
  background: "#f7fafc",
  padding: 24,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  textAlign: "center",
  color: "#4a5568",
};
const titleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: "700",
  color: "#2d3748",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const subtitleStyle = { margin: "4px 0 0 0", fontSize: 13, color: "#718096" };
const emptyStyle = {
  textAlign: "center",
  padding: "40px 0",
  color: "#718096",
  background: "#fff",
  border: "1px dashed #cbd5e0",
  borderRadius: 12,
};
const sectionHeaderStyle = {
  background: "#2d3748",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: "10px 10px 0 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const classesGridWrapper = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderTop: "none",
  borderRadius: "0 0 10px 10px",
  padding: 16,
};
const classesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
  gap: 16,
};
const classCardStyle = {
  position: "relative",
  background: "#ffffff",
  borderRadius: 12,
  padding: 16,
  cursor: "pointer",
  transition: "all .15s ease",
};

export default ClassCardComponent;
