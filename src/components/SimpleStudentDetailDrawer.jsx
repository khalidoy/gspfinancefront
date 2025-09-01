import React, { useState, useEffect } from "react";
import axios from "axios";

// Custom CSS for spinner animation
const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTop: "4px solid #3182ce",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

const SimpleStudentDetailDrawer = ({
  isOpen,
  onClose,
  studentId,
  studentData,
  loading,
  onStudentUpdated,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    enrollment_status: "ACTIVE",
    transport_fees: 0,
    lunch_fees: 0,
    class_id: "",
    contact_info: {
      phone: "",
      email: "",
      address: "",
    },
  });

  const [saving, setSaving] = useState(false);

  // Reset form when modal opens/closes or studentData changes
  useEffect(() => {
    if (isOpen && studentData) {
      setFormData({
        first_name: studentData.first_name || "",
        last_name: studentData.last_name || "",
        enrollment_status: studentData.enrollment_status || "ACTIVE",
        transport_fees: studentData.transport_fees || 0,
        lunch_fees: studentData.lunch_fees || 0,
        class_id: studentData.class_id || "",
        contact_info: {
          phone: studentData.contact_info?.phone || "",
          email: studentData.contact_info?.email || "",
          address: studentData.contact_info?.address || "",
        },
      });
    }
  }, [isOpen, studentData]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/home/api/student-detail/${studentId}`,
        formData
      );
      console.log("Student updated successfully:", response.data);
      if (onStudentUpdated) {
        onStudentUpdated(response.data);
      }
      onClose();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Error updating student. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${amount} DH`;
  };

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "GRADUATED", label: "Graduated" },
    { value: "TRANSFERRED", label: "Transferred" },
  ];

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3182ce",
    color: "white",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "#3182ce",
    border: "1px solid #3182ce",
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxHeight: "90vh",
          overflowY: "auto",
          maxWidth: "800px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                {loading ? "Loading Student..." : "Student Details"}
              </h2>
              {!loading && studentData && (
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#718096",
                  }}
                >
                  ID: {studentData.student_id} | Status:{" "}
                  {formData.enrollment_status}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px 0",
              }}
            >
              <div style={spinnerStyle}></div>
              <p style={{ marginTop: "12px", color: "#718096" }}>
                Loading student information...
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Personal Information */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f7fafc",
                  }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}
                  >
                    Personal Information
                  </h3>
                </div>
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) =>
                          handleInputChange("first_name", e.target.value)
                        }
                        placeholder="Enter first name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) =>
                          handleInputChange("last_name", e.target.value)
                        }
                        placeholder="Enter last name"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      Enrollment Status
                    </label>
                    <select
                      value={formData.enrollment_status}
                      onChange={(e) =>
                        handleInputChange("enrollment_status", e.target.value)
                      }
                      style={inputStyle}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f7fafc",
                  }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}
                  >
                    Contact Information
                  </h3>
                </div>
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_info.phone}
                        onChange={(e) =>
                          handleInputChange(
                            "contact_info.phone",
                            e.target.value
                          )
                        }
                        placeholder="Enter phone number"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.contact_info.email}
                        onChange={(e) =>
                          handleInputChange(
                            "contact_info.email",
                            e.target.value
                          )
                        }
                        placeholder="Enter email address"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Address
                      </label>
                      <textarea
                        value={formData.contact_info.address}
                        onChange={(e) =>
                          handleInputChange(
                            "contact_info.address",
                            e.target.value
                          )
                        }
                        placeholder="Enter address"
                        rows={3}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Structure */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#f7fafc",
                  }}
                >
                  <h3
                    style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}
                  >
                    Fee Structure
                  </h3>
                </div>
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Transport Fees (DH)
                      </label>
                      <input
                        type="number"
                        value={formData.transport_fees}
                        onChange={(e) =>
                          handleInputChange("transport_fees", e.target.value)
                        }
                        placeholder="0"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        Lunch Fees (DH)
                      </label>
                      <input
                        type="number"
                        value={formData.lunch_fees}
                        onChange={(e) =>
                          handleInputChange("lunch_fees", e.target.value)
                        }
                        placeholder="0"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f0fff4",
                      borderRadius: "6px",
                      border: "1px solid #9ae6b4",
                    }}
                  >
                    <p
                      style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}
                    >
                      Total Monthly Fees:{" "}
                      {formatCurrency(
                        Number(formData.transport_fees) +
                          Number(formData.lunch_fees)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0" }}>
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <button onClick={onClose} style={secondaryButtonStyle}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!studentData || loading || saving}
              style={{
                ...primaryButtonStyle,
                opacity: !studentData || loading || saving ? 0.5 : 1,
                cursor:
                  !studentData || loading || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleStudentDetailDrawer;
