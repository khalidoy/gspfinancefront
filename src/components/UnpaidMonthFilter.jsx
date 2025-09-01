import React from "react";

// Displays unpaid student counts per month and lets user select a month to filter.
// Props:
//  months: array of month keys (e.g., ['september', ... , 'june', 'insurance'])
//  students: full (already globally filtered by stats if any) student list
//  selectedMonth: currently selected unpaid month filter
//  onSelect(monthKey|null): callback when user chooses a month (toggle off if same)
//  isUnpaidForMonth(student, monthKey): predicate supplied by parent (authoritative)
const monthLabel = (m) => {
  if (m === "insurance") return "Insurance";
  return m.charAt(0).toUpperCase() + m.slice(1);
};

const UnpaidMonthFilter = ({
  months = [],
  students = [],
  selectedMonth,
  onSelect,
  isUnpaidForMonth,
}) => {
  const data = months.map((m) => {
    let count = 0;
    students.forEach((s) => {
      if (isUnpaidForMonth(s, m)) count++;
    });
    return { key: m, label: monthLabel(m), count };
  });

  return (
    <div
      style={{
        background: "#ffffff",
        padding: 16,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        marginBottom: 24,
      }}
    >
      <h4
        style={{
          margin: "0 0 12px 0",
          fontSize: 16,
          fontWeight: 700,
          color: "#2d3748",
        }}
      >
        Unpaid Months
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {data.map((m) => {
          const active = selectedMonth === m.key;
          return (
            <div
              key={m.key}
              onClick={() => onSelect(active ? null : m.key)}
              style={{
                cursor: "pointer",
                minWidth: 90,
                padding: "10px 12px",
                borderRadius: 10,
                border: active ? "2px solid #3182ce" : "1px solid #cbd5e0",
                background: active ? "#ebf8ff" : "#f7fafc",
                position: "relative",
                transition: "all .15s ease",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4a5568",
                  marginBottom: 4,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: active ? "#2b6cb0" : "#2d3748",
                }}
              >
                {m.count}
              </div>
              <div style={{ fontSize: 10, color: "#718096", marginTop: 2 }}>
                unpaid
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "#718096" }}>
        Unpaid definition: student has PAID 0 for that month (tuition +
        transport combined). Insurance unpaid if insurance payment is 0. Agreed
        amounts are ignored.
      </div>
    </div>
  );
};

export default UnpaidMonthFilter;
