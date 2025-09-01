import React, { useState, useEffect } from "react";

const AddStudentModalPlain = ({
  isOpen,
  onClose,
  onStudentAdded,
  academicYearId,
}) => {
  // Function to generate student ID
  const generateStudentId = () => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `STU${currentYear}${randomNum}`;
  };

  const [formData, setFormData] = useState({
    // Basic Information
    student_id: "",
    full_name: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "MALE",
    nationality: "Moroccan",

    // Academic Information
    academic_year_id: academicYearId || "",
    section_id: "", // Add section selection
    school_class_id: "",
    enrollment_status: "ACTIVE",
    enrollment_date: new Date().toISOString().split("T")[0],

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

    // Financial Information - will be auto-populated from section defaults
    agreed_amounts: {
      tuition: 0, // Will be set from section default
      transport: 0, // Will be set from section default
      insurance: 0, // Will be set from section default
      registration: 0, // Will be set from section default
    },

    // Status flags
    is_new_student: true,
    is_transfer_student: false,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Options state
  const [sections, setSections] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

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
      setFormData((prev) => ({ ...prev, school_class_id: "" }));
    }
  }, [formData.section_id]);

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/sections/api/sections?active_only=true&sort_by=display_order`
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
        `${process.env.REACT_APP_BACKEND_URL}/sections/api/sections/${sectionId}/classes`
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
    // Find the selected section
    const selectedSection = sections.find((s) => s.id === sectionId);

    // Update form data with section and auto-populate fees
    setFormData((prev) => ({
      ...prev,
      section_id: sectionId,
      school_class_id: "", // Reset class selection
      agreed_amounts: selectedSection
        ? {
            tuition: selectedSection.default_fees.tuition || 0,
            transport: selectedSection.default_fees.transport || 0,
            insurance: selectedSection.default_fees.insurance || 0,
            registration: selectedSection.default_fees.registration || 0,
          }
        : prev.agreed_amounts,
    }));
  };

  // Auto-generate student ID when modal opens
  useEffect(() => {
    if (isOpen && !formData.student_id) {
      setFormData((prev) => ({
        ...prev,
        student_id: generateStudentId(),
      }));
    }
  }, [isOpen, formData.student_id]);

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
    if (!formData.section_id) errors.push("Section selection is required");

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

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/students/api/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSaveSuccess(true);
        if (onStudentAdded) {
          onStudentAdded(data);
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || "Failed to create student");
      }
    } catch (err) {
      setSaveError("Failed to create student");
    } finally {
      setSaving(false);
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
              ➕ Add New Student
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#718096",
                fontSize: "14px",
              }}
            >
              Create a comprehensive student record with all essential
              information
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
            ✅ Student created successfully!
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
                Student ID (Auto-generated)
              </label>
              <input
                type="text"
                value={formData.student_id}
                readOnly
                placeholder="Auto-generated ID"
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
                onChange={(e) => handleInputChange("full_name", e.target.value)}
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
                onChange={(e) => handleInputChange("last_name", e.target.value)}
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
                onChange={(e) => handleInputChange("gender", e.target.value)}
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
                  {loadingSections ? "Loading sections..." : "Select a section"}
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
                    {schoolClass.current_enrollment}/{schoolClass.max_students})
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
                <option value="WITHDRAWN">Withdrawn</option>
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
                  handleInputChange("is_new_student", e.target.value === "yes")
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
                handleInputChange("contact_info.home_address", e.target.value)
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
                  handleInputChange("contact_info.father_name", e.target.value)
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
                  handleInputChange("contact_info.father_phone", e.target.value)
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
                  handleInputChange("contact_info.father_email", e.target.value)
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
                  handleInputChange("contact_info.mother_name", e.target.value)
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
                  handleInputChange("contact_info.mother_phone", e.target.value)
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
                  handleInputChange("contact_info.mother_email", e.target.value)
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
            💰 Financial Information
            {formData.section_id && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#38A169",
                  fontWeight: "normal",
                }}
              >
                (Auto-populated from section defaults)
              </span>
            )}
          </h3>

          {!formData.section_id && (
            <div
              style={{
                backgroundColor: "#FFF5B4",
                border: "1px solid #F6E05E",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "16px",
                color: "#975A16",
              }}
            >
              ℹ️ Select a section above to automatically populate default fees
              for that section
            </div>
          )}

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
                placeholder="Auto-filled from section"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: formData.section_id ? "#F0FFF4" : "white",
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
                placeholder="Auto-filled from section"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: formData.section_id ? "#F0FFF4" : "white",
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
                placeholder="Auto-filled from section"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: formData.section_id ? "#F0FFF4" : "white",
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
                placeholder="Auto-filled from section"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  backgroundColor: formData.section_id ? "#F0FFF4" : "white",
                }}
              />
            </div>
          </div>

          {/* Transportation Section */}
          <h3
            style={{
              margin: "20px 0 16px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#2D3748",
            }}
          >
            🚌 Transportation
          </h3>

          {/* Total Monthly Amount Display */}
          <div
            style={{
              backgroundColor: formData.section_id ? "#F0FFF4" : "#F7FAFC",
              border: `1px solid ${
                formData.section_id ? "#9AE6B4" : "#E2E8F0"
              }`,
              borderRadius: "6px",
              padding: "16px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: formData.section_id ? "#276749" : "#4A5568",
                marginBottom: "4px",
              }}
            >
              {formData.section_id
                ? `Total Fees - ${
                    sections.find((s) => s.id === formData.section_id)
                      ?.section_name || "Selected Section"
                  }`
                : "Total Fees (Select section to auto-calculate)"}
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: formData.section_id ? "#276749" : "#4A5568",
              }}
            >
              Monthly:{" "}
              {(
                formData.agreed_amounts.tuition +
                formData.agreed_amounts.transport
              ).toLocaleString()}{" "}
              DH
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: formData.section_id ? "#276749" : "#4A5568",
                marginTop: "2px",
              }}
            >
              Annual:{" "}
              {(
                formData.agreed_amounts.insurance +
                formData.agreed_amounts.registration
              ).toLocaleString()}{" "}
              DH
            </div>
            <div
              style={{
                fontSize: "12px",
                color: formData.section_id ? "#68D391" : "#718096",
                marginTop: "4px",
              }}
            >
              {formData.section_id
                ? "Fees automatically populated from section defaults (can be modified)"
                : "Select a section to see default fees"}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: "10px 20px",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              backgroundColor: "white",
              color: "#4A5568",
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.full_name || !formData.section_id}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor:
                saving || !formData.full_name || !formData.section_id
                  ? "#CBD5E0"
                  : "#38A169",
              color: "white",
              fontSize: "14px",
              cursor:
                saving || !formData.full_name || !formData.section_id
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving ? "Creating..." : "Create Student"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModalPlain;
