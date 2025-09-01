import React, { useState, useEffect } from "react";

const StudentStatsComponent = ({
  academicYearId,
  selectedClassId = null,
  filters = {
    searchQuery: "",
    selectedGender: "",
    selectedStudentType: "",
    selectedUnpaidMonth: "",
    statisticFilter: null,
  },
  onStatisticClick,
  // NEW: client-side datasets from Home for local computation
  allStudents = [],
  filteredStudents = [],
}) => {
  const [stats, setStats] = useState({
    leftStudents: 0,
    newStudents: 0,
    registeredStudents: 0,
    notRegisteredStudents: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Always use local computation - NEVER use backend API for consistency
    // Use filteredStudents if available, otherwise use allStudents
    const dataSource =
      filteredStudents && filteredStudents.length > 0
        ? filteredStudents
        : allStudents;

    if (dataSource && dataSource.length > 0) {
      const leftStatuses = [
        "WITHDRAWN",
        "SUSPENDED",
        "GRADUATED",
        "TRANSFERRED",
      ];
      const dataset = selectedClassId
        ? dataSource.filter((s) => s.school_class?.id === selectedClassId)
        : dataSource;

      let left = 0,
        newly = 0,
        registered = 0,
        notRegistered = 0;
      dataset.forEach((s) => {
        const isLeft = leftStatuses.includes(s.enrollment_status);
        if (isLeft) left++;
        if (s.is_new_student && !isLeft) newly++;

        // SIMPLE RULE: registered = student who paid insurance (actual insurance > 0)
        const insurancePaid = (s.financial?.actual?.annual_insurance || 0) > 0;
        if (insurancePaid) {
          registered++;
        } else {
          notRegistered++;
        }
      });

      setStats({
        leftStudents: left,
        newStudents: newly,
        registeredStudents: registered,
        notRegisteredStudents: notRegistered,
        totalStudents: dataset.length,
      });
      setLoading(false);
      setError("");
      return;
    }

    // If no data available, show zeros instead of using inconsistent backend API
    setStats({
      leftStudents: 0,
      newStudents: 0,
      registeredStudents: 0,
      notRegisteredStudents: 0,
      totalStudents: 0,
    });
    setLoading(false);
    setError("");
  }, [filteredStudents, allStudents, selectedClassId, academicYearId]);

  if (!academicYearId) {
    return null;
  }

  const StatCard = ({ title, count, color, icon, description, filterType }) => {
    const isActive = filters.statisticFilter === filterType;

    return (
      <div
        style={{
          backgroundColor: isActive ? "#f0f9ff" : "#ffffff",
          border: `2px solid ${isActive ? "#3b82f6" : color}`,
          borderRadius: "12px",
          padding: "20px",
          minWidth: "180px",
          boxShadow: isActive
            ? "0 4px 12px rgba(59,130,246,0.25)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => {
          // Toggle filter: if already active, clear it; otherwise set it
          const newFilter = isActive ? null : filterType;
          onStatisticClick && onStatisticClick(newFilter);
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }
        }}
      >
        {isActive && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ✓
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: color,
              color: "white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              marginRight: "12px",
            }}
          >
            {icon}
          </div>
          <div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: color,
                lineHeight: "1",
              }}
            >
              {loading ? "..." : count.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
                marginTop: "4px",
              }}
            >
              {title}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#718096",
            lineHeight: "1.4",
          }}
        >
          {description}
        </div>
      </div>
    );
  };

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
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#2d3748",
            margin: "0 0 8px 0",
            display: "flex",
            alignItems: "center",
          }}
        >
          📊 Student Statistics
          {(selectedClassId ||
            filters.searchQuery ||
            filters.selectedUnpaidMonth ||
            filters.selectedGender ||
            filters.selectedStudentType) && (
            <span
              style={{
                fontSize: "14px",
                color: "#3182ce",
                marginLeft: "12px",
                backgroundColor: "#ebf8ff",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid #bee3f8",
              }}
            >
              Filtered View
            </span>
          )}
        </h3>
        <p style={{ fontSize: "14px", color: "#718096", margin: "0" }}>
          Real-time student counts by enrollment status and registration
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fed7d7",
            color: "#c53030",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
            border: "1px solid #feb2b2",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        <StatCard
          title="Left Students"
          count={stats.leftStudents}
          color="#e53e3e"
          icon="🚪"
          description="Students who withdrew or left the school"
          filterType="left"
        />

        <StatCard
          title="New Students"
          count={stats.newStudents}
          color="#38a169"
          icon="🆕"
          description="First-time enrolled students this year"
          filterType="new"
        />

        <StatCard
          title="Registered"
          count={stats.registeredStudents}
          color="#3182ce"
          icon="✅"
          description="Students who paid insurance fee"
          filterType="registered"
        />

        <StatCard
          title="Not Registered"
          count={stats.notRegisteredStudents}
          color="#d69e2e"
          icon="❌"
          description="Students with insurance fee = 0 DH"
          filterType="notRegistered"
        />

        <StatCard
          title="Total Students"
          count={stats.totalStudents}
          color="#805ad5"
          icon="👥"
          description="All students in current selection"
          filterType="total"
        />
      </div>

      {/* Additional Information */}
      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#edf2f7",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            fontSize: "14px",
            color: "#4a5568",
          }}
        >
          <div>
            <strong style={{ color: "#2d3748" }}>Registration Rate:</strong>
            <span
              style={{ marginLeft: "8px", fontWeight: "600", color: "#3182ce" }}
            >
              {stats.totalStudents > 0
                ? `${Math.round(
                    (stats.registeredStudents / stats.totalStudents) * 100
                  )}%`
                : "0%"}
            </span>
          </div>
          <div>
            <strong style={{ color: "#2d3748" }}>Retention Rate:</strong>
            <span
              style={{ marginLeft: "8px", fontWeight: "600", color: "#38a169" }}
            >
              {stats.totalStudents > 0
                ? `${Math.round(
                    ((stats.totalStudents - stats.leftStudents) /
                      stats.totalStudents) *
                      100
                  )}%`
                : "0%"}
            </span>
          </div>
          <div>
            <strong style={{ color: "#2d3748" }}>New Student Rate:</strong>
            <span
              style={{ marginLeft: "8px", fontWeight: "600", color: "#805ad5" }}
            >
              {stats.totalStudents > 0
                ? `${Math.round(
                    (stats.newStudents / stats.totalStudents) * 100
                  )}%`
                : "0%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStatsComponent;
