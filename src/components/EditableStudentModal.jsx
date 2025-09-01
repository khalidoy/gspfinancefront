import React, { useState, useEffect } from "react";

const EditableStudentModal = ({
  isOpen,
  onClose,
  studentId,
  studentData,
  loading,
  onStudentUpdated,
}) => {
  // Form state - matching AddStudentModalPlain structure
  const [formData, setFormData] = useState({
    // Basic Information
    student_id: "",
    full_name: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "",

    // Academic Information
    academic_year_id: "",
    section_id: "", // Add section selection
    school_class_id: "",
    enrollment_status: "",
    enrollment_date: "",

    // Contact Information
    contact_info: {
      home_address: "",
      city: "",
      father_name: "",
      father_phone: "",
      father_email: "",
      mother_name: "",
      mother_phone: "",
      mother_email: "",
    },

    // Financial Information
    agreed_amounts: {
      tuition: 0,
      transport: 0,
      insurance: 0,
      registration: 0,
    },

    // Status flags
    is_new_student: false,
    is_transfer_student: false,

    // Additional fields for edit
    notes: "",
    emergency_contact: "",
    medical_info: "",
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Options state
  const [sections, setSections] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Initialize form data when student data changes
  useEffect(() => {
    console.log("EditableStudentModal useEffect:", {
      studentData: !!studentData,
      isOpen,
    });
    if (studentData && isOpen) {
      console.log("Setting form data with:", studentData);
      setFormData({
        student_id: studentData.student_id || "",
        full_name: studentData.full_name || "",
        first_name: studentData.first_name || "",
        last_name: studentData.last_name || "",
        date_of_birth: studentData.date_of_birth || "",
        gender: studentData.gender || "",
        nationality: studentData.nationality || "",
        academic_year_id: studentData.academic_year_id || "",
        section_id: studentData.section_id || "", // Add section_id from student data
        school_class_id: studentData.school_class_id || "",
        enrollment_status: studentData.enrollment_status || "",
        enrollment_date: studentData.enrollment_date || "",
        contact_info: {
          father_name: studentData.contact_info?.father_name || "",
          mother_name: studentData.contact_info?.mother_name || "",
          father_phone: studentData.contact_info?.father_phone || "",
          mother_phone: studentData.contact_info?.mother_phone || "",
          father_email: studentData.contact_info?.father_email || "",
          mother_email: studentData.contact_info?.mother_email || "",
          home_address: studentData.contact_info?.home_address || "",
          city: studentData.contact_info?.city || "",
        },
        agreed_amounts: {
          tuition: studentData.agreed_amounts?.tuition || 0,
          transport: studentData.agreed_amounts?.transport || 0,
          insurance: studentData.agreed_amounts?.insurance || 0,
          registration: studentData.agreed_amounts?.registration || 0,
        },
        is_new_student: studentData.is_new_student || false,
        is_transfer_student: studentData.is_transfer_student || false,
        notes: studentData.notes || studentData.observations || "",
        emergency_contact: studentData.emergency_contact || "",
        medical_info: studentData.medical_info || "",
      });
    }
  }, [studentData, isOpen]);

  // Debug logging
  useEffect(() => {
    console.log("EditableStudentModal state change:", {
      isOpen,
      loading,
      hasStudentData: !!studentData,
    });
  }, [isOpen, loading, studentData]);

  // Load sections when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSections();
    }
  }, [isOpen]);

  // Load classes when section is selected
  useEffect(() => {
    if (formData.section_id) {
      fetchClassesForSection(formData.section_id);
    } else {
      setSchoolClasses([]);
    }
  }, [formData.section_id]);

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/sections/api/sections?active_only=true&sort_by=display_order`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSections(data.data || []);
      } else {
        console.error("Failed to fetch sections");
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchClassesForSection = async (sectionId) => {
    setLoadingClasses(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/sections/api/sections/${sectionId}/classes`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSchoolClasses(data.data?.classes || []);
      } else {
        console.error("Failed to fetch classes");
        setSchoolClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setSchoolClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSectionChange = (sectionId) => {
    // Update form data with section and optionally auto-populate fees
    setFormData((prev) => ({
      ...prev,
      section_id: sectionId,
      school_class_id: "", // Reset class selection
      // Note: In edit mode, we don't auto-populate fees to avoid overwriting existing data
      // User can manually update fees if needed
    }));
  };

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
      setFormData((prev) => {
        const newData = {
          ...prev,
          [field]: value,
        };

        // Auto-calculate enrollment_month when enrollment_date changes
        if (field === "enrollment_date" && value) {
          const enrollmentDate = new Date(value);
          if (!isNaN(enrollmentDate.getTime())) {
            newData.enrollment_month = enrollmentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
          }
        }

        return newData;
      });
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = [];

    // Required fields validation
    if (!formData.full_name.trim()) errors.push("Full Name is required");
    if (!formData.first_name.trim()) errors.push("First Name is required");
    if (!formData.last_name.trim()) errors.push("Last Name is required");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.contact_info.father_email &&
      !emailRegex.test(formData.contact_info.father_email)
    ) {
      errors.push("Father's email format is invalid");
    }
    if (
      formData.contact_info.mother_email &&
      !emailRegex.test(formData.contact_info.mother_email)
    ) {
      errors.push("Mother's email format is invalid");
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[0-9\s\-()]{8,}$/;
    if (
      formData.contact_info.father_phone &&
      !phoneRegex.test(formData.contact_info.father_phone)
    ) {
      errors.push("Father's phone format is invalid");
    }
    if (
      formData.contact_info.mother_phone &&
      !phoneRegex.test(formData.contact_info.mother_phone)
    ) {
      errors.push("Mother's phone format is invalid");
    }

    // Financial validation
    if (formData.agreed_amounts.tuition < 0)
      errors.push("Tuition amount cannot be negative");
    if (formData.agreed_amounts.transport < 0)
      errors.push("Transport amount cannot be negative");
    if (formData.agreed_amounts.insurance < 0)
      errors.push("Insurance amount cannot be negative");
    if (formData.agreed_amounts.registration < 0)
      errors.push("Registration amount cannot be negative");

    return errors;
  };

  const handleSave = async () => {
    // Validate form first
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSaveError("Validation errors: " + validationErrors.join(", "));
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/home/api/student-detail/${studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSaveSuccess(true);
        if (onStudentUpdated) {
          onStudentUpdated(data);
        }
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || "Failed to update student");
      }
    } catch (err) {
      console.error("Error saving student:", err);
      setSaveError("Failed to update student details");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveStudent = async () => {
    setRemovingStudent(true);
    setSaveError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/students/api/${studentId}/remove`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            withdrawal_reason: "Student marked as left",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSaveSuccess(true);
        if (onStudentUpdated) {
          onStudentUpdated(data);
        }
        setTimeout(() => {
          setShowRemoveConfirm(false);
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || "Failed to remove student");
        setShowRemoveConfirm(false);
      }
    } catch (err) {
      console.error("Error removing student:", err);
      setSaveError("Failed to remove student");
      setShowRemoveConfirm(false);
    } finally {
      setRemovingStudent(false);
    }
  };

  const handleDeleteStudent = async () => {
    setDeletingStudent(true);
    setSaveError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/students/api/${studentId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setShowDeleteConfirm(false);
          onClose();
          // Refresh the parent component
          if (onStudentUpdated) {
            onStudentUpdated({ deleted: true });
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || "Failed to delete student");
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      setSaveError("Failed to delete student");
      setShowDeleteConfirm(false);
    } finally {
      setDeletingStudent(false);
    }
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "95%",
          maxWidth: "800px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#2D3748",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              ✏️ Edit Student Details
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#718096",
                fontSize: "14px",
              }}
            >
              {loading
                ? "Loading student information..."
                : `Update comprehensive information for ${
                    formData.full_name || "student"
                  }`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#718096",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #E2E8F0",
                borderTop: "4px solid #3182CE",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            />
            <p style={{ color: "#718096", margin: 0 }}>
              Loading student details...
            </p>
          </div>
        ) : !studentData ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
              color: "#E53E3E",
            }}
          >
            Failed to load student details
          </div>
        ) : (
          <>
            {/* Success/Error Messages */}
            {saveSuccess && (
              <div
                style={{
                  backgroundColor: "#F0FFF4",
                  border: "1px solid #9AE6B4",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "16px",
                  color: "#276749",
                }}
              >
                ✅ Student details updated successfully!
              </div>
            )}

            {saveError && (
              <div
                style={{
                  backgroundColor: "#FED7D7",
                  border: "1px solid #FEB2B2",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "16px",
                  color: "#C53030",
                }}
              >
                ❌ {saveError}
              </div>
            )}

            {/* Form Fields */}
            <div style={{ marginBottom: "20px" }}>
              {/* Basic Information Section */}
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2D3748",
                }}
              >
                📝 Basic Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Student ID (Read-only)
                  </label>
                  <input
                    type="text"
                    value={formData.student_id}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      backgroundColor: "#F7FAFC",
                      color: "#4A5568",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    placeholder="Enter full name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    placeholder="First name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    placeholder="Last name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                    placeholder="Moroccan"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Academic Information Section */}
              <h3
                style={{
                  margin: "20px 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2D3748",
                }}
              >
                🎓 Academic Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Section *
                  </label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      backgroundColor: loadingSections ? "#F7FAFC" : "white",
                    }}
                    disabled={loadingSections}
                  >
                    <option value="">
                      {loadingSections
                        ? "Loading sections..."
                        : "Select a section"}
                    </option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.section_name} ({section.section_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Class
                  </label>
                  <select
                    value={formData.school_class_id}
                    onChange={(e) =>
                      handleInputChange("school_class_id", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      backgroundColor:
                        loadingClasses || !formData.section_id
                          ? "#F7FAFC"
                          : "white",
                    }}
                    disabled={loadingClasses || !formData.section_id}
                  >
                    <option value="">
                      {!formData.section_id
                        ? "Select section first"
                        : loadingClasses
                        ? "Loading classes..."
                        : "Select a class"}
                    </option>
                    {schoolClasses.map((schoolClass) => (
                      <option key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.class_name} (Capacity:{" "}
                        {schoolClass.current_enrollment}/
                        {schoolClass.max_students})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Enrollment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.enrollment_date}
                    onChange={(e) =>
                      handleInputChange("enrollment_date", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Enrollment Status
                  </label>
                  <select
                    value={formData.enrollment_status}
                    onChange={(e) =>
                      handleInputChange("enrollment_status", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="TRANSFERRED">Transferred</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    New Student
                  </label>
                  <select
                    value={formData.is_new_student ? "yes" : "no"}
                    onChange={(e) =>
                      handleInputChange(
                        "is_new_student",
                        e.target.value === "yes"
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Transfer Student
                  </label>
                  <select
                    value={formData.is_transfer_student ? "yes" : "no"}
                    onChange={(e) =>
                      handleInputChange(
                        "is_transfer_student",
                        e.target.value === "yes"
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Contact Information Section */}
              <h3
                style={{
                  margin: "20px 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2D3748",
                }}
              >
                📞 Contact Information
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Home Address
                </label>
                <textarea
                  value={formData.contact_info.home_address}
                  onChange={(e) =>
                    handleInputChange(
                      "contact_info.home_address",
                      e.target.value
                    )
                  }
                  placeholder="Complete home address"
                  rows="2"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.contact_info.city}
                    onChange={(e) =>
                      handleInputChange("contact_info.city", e.target.value)
                    }
                    placeholder="City"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.contact_info.father_name}
                    onChange={(e) =>
                      handleInputChange(
                        "contact_info.father_name",
                        e.target.value
                      )
                    }
                    placeholder="Father's full name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Father's Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_info.father_phone}
                    onChange={(e) =>
                      handleInputChange(
                        "contact_info.father_phone",
                        e.target.value
                      )
                    }
                    placeholder="+212 6XX XXX XXX"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Father's Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_info.father_email}
                    onChange={(e) =>
                      handleInputChange(
                        "contact_info.father_email",
                        e.target.value
                      )
                    }
                    placeholder="father@example.com"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={formData.contact_info.mother_name}
                    onChange={(e) =>
                      handleInputChange(
                        "contact_info.mother_name",
                        e.target.value
                      )
                    }
                    placeholder="Mother's full name"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Mother's Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_info.mother_phone}
                    onChange={(e) =>
                      handleInputChange(
                        "contact_info.mother_phone",
                        e.target.value
                      )
                    }
                    placeholder="+212 6XX XXX XXX"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Mother's Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_info.mother_email}
                    onChange={(e) =>
                      handleInputChange(
                        "contact_info.mother_email",
                        e.target.value
                      )
                    }
                    placeholder="mother@example.com"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Financial Information Section */}
              <h3
                style={{
                  margin: "20px 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2D3748",
                }}
              >
                💰 Financial Information (Monthly Agreed Amounts)
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Tuition (DH/month)
                  </label>
                  <input
                    type="number"
                    value={formData.agreed_amounts.tuition}
                    onChange={(e) =>
                      handleInputChange(
                        "agreed_amounts.tuition",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="50000"
                    placeholder="1000"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Transport (DH/month)
                  </label>
                  <input
                    type="number"
                    value={formData.agreed_amounts.transport}
                    onChange={(e) =>
                      handleInputChange(
                        "agreed_amounts.transport",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="10000"
                    placeholder="200"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Insurance (DH/year)
                  </label>
                  <input
                    type="number"
                    value={formData.agreed_amounts.insurance}
                    onChange={(e) =>
                      handleInputChange(
                        "agreed_amounts.insurance",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="5000"
                    placeholder="100"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Registration (DH/year)
                  </label>
                  <input
                    type="number"
                    value={formData.agreed_amounts.registration}
                    onChange={(e) =>
                      handleInputChange(
                        "agreed_amounts.registration",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min="0"
                    max="10000"
                    placeholder="500"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Additional Information Section */}
              <h3
                style={{
                  margin: "20px 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2D3748",
                }}
              >
                ℹ️ Additional Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) =>
                      handleInputChange("emergency_contact", e.target.value)
                    }
                    placeholder="Emergency contact information"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Medical Information
                  </label>
                  <input
                    type="text"
                    value={formData.medical_info}
                    onChange={(e) =>
                      handleInputChange("medical_info", e.target.value)
                    }
                    placeholder="Medical information or allergies"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about the student..."
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Total Monthly Amount Display */}
              <div
                style={{
                  backgroundColor: "#F0FFF4",
                  border: "1px solid #9AE6B4",
                  borderRadius: "6px",
                  padding: "16px",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#276749",
                    marginBottom: "4px",
                  }}
                >
                  Total Monthly Amount
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#276749",
                  }}
                >
                  {(
                    formData.agreed_amounts.tuition +
                    formData.agreed_amounts.transport
                  ).toLocaleString()}{" "}
                  DH
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#68D391",
                    marginTop: "4px",
                  }}
                >
                  (Tuition + Transport monthly fees)
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginTop: "20px",
            borderTop: "1px solid #E2E8F0",
            paddingTop: "16px",
          }}
        >
          {/* Left side - Danger actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              disabled={saving || removingStudent || deletingStudent}
              style={{
                padding: "8px 16px",
                border: "1px solid #F56565",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#E53E3E",
                fontSize: "13px",
                cursor:
                  saving || removingStudent || deletingStudent
                    ? "not-allowed"
                    : "pointer",
                opacity: saving || removingStudent || deletingStudent ? 0.6 : 1,
              }}
            >
              🚪 Remove Student
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || removingStudent || deletingStudent}
              style={{
                padding: "8px 16px",
                border: "1px solid #C53030",
                borderRadius: "6px",
                backgroundColor: "#FED7D7",
                color: "#C53030",
                fontSize: "13px",
                cursor:
                  saving || removingStudent || deletingStudent
                    ? "not-allowed"
                    : "pointer",
                opacity: saving || removingStudent || deletingStudent ? 0.6 : 1,
              }}
            >
              🗑️ Delete Permanently
            </button>
          </div>

          {/* Right side - Save actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onClose}
              disabled={saving || removingStudent || deletingStudent}
              style={{
                padding: "10px 20px",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#4A5568",
                fontSize: "14px",
                cursor:
                  saving || removingStudent || deletingStudent
                    ? "not-allowed"
                    : "pointer",
                opacity: saving || removingStudent || deletingStudent ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                saving ||
                loading ||
                !studentData ||
                !formData.full_name ||
                removingStudent ||
                deletingStudent
              }
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                backgroundColor:
                  saving ||
                  loading ||
                  !studentData ||
                  !formData.full_name ||
                  removingStudent ||
                  deletingStudent
                    ? "#CBD5E0"
                    : "#3182CE",
                color: "white",
                fontSize: "14px",
                cursor:
                  saving ||
                  loading ||
                  !studentData ||
                  !formData.full_name ||
                  removingStudent ||
                  deletingStudent
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Remove Student Confirmation Modal */}
        {showRemoveConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                width: "90%",
                maxWidth: "450px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  color: "#E53E3E",
                  fontSize: "18px",
                }}
              >
                🚪 Remove Student
              </h3>
              <p
                style={{
                  margin: "0 0 16px 0",
                  color: "#4A5568",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to mark{" "}
                <strong>{formData.full_name}</strong> as "left"? This will
                change their enrollment status to "WITHDRAWN" but keep all their
                data and payment history intact.
              </p>
              <p
                style={{
                  margin: "0 0 20px 0",
                  color: "#718096",
                  fontSize: "13px",
                }}
              >
                This action can be reversed by changing the enrollment status
                back to "ACTIVE".
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  disabled={removingStudent}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#4A5568",
                    fontSize: "14px",
                    cursor: removingStudent ? "not-allowed" : "pointer",
                    opacity: removingStudent ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveStudent}
                  disabled={removingStudent}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: removingStudent ? "#CBD5E0" : "#E53E3E",
                    color: "white",
                    fontSize: "14px",
                    cursor: removingStudent ? "not-allowed" : "pointer",
                  }}
                >
                  {removingStudent ? "Removing..." : "Yes, Remove Student"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Student Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                width: "90%",
                maxWidth: "450px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                border: "2px solid #F56565",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  color: "#C53030",
                  fontSize: "18px",
                }}
              >
                🗑️ Permanently Delete Student
              </h3>
              <p
                style={{
                  margin: "0 0 16px 0",
                  color: "#4A5568",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to{" "}
                <strong style={{ color: "#C53030" }}>permanently delete</strong>{" "}
                <strong>{formData.full_name}</strong> from the database?
              </p>
              <div
                style={{
                  backgroundColor: "#FED7D7",
                  border: "1px solid #FEB2B2",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    color: "#C53030",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  ⚠️ WARNING: This action is irreversible!
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "#C53030",
                    fontSize: "12px",
                  }}
                >
                  All student data, payment history, and records will be
                  permanently deleted and cannot be recovered.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingStudent}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#4A5568",
                    fontSize: "14px",
                    cursor: deletingStudent ? "not-allowed" : "pointer",
                    opacity: deletingStudent ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStudent}
                  disabled={deletingStudent}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: deletingStudent ? "#CBD5E0" : "#C53030",
                    color: "white",
                    fontSize: "14px",
                    cursor: deletingStudent ? "not-allowed" : "pointer",
                  }}
                >
                  {deletingStudent ? "Deleting..." : "Yes, Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for spinner animation */}
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

export default EditableStudentModal;
