import React, { useState, useEffect } from "react";
import { Dialog, Button, Text, Input, Box } from "@chakra-ui/react";

const StudentDetailDrawerV3 = ({
  isOpen,
  onClose,
  student,
  isLoading: isLoadingStudent,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    group: "",
    joined_month: 1,
    agreed_monthly_payment: "",
    transport_agreed: "",
    insurance_agreed: "",
    observations: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Default months for academic year
  const months = [
    { key: "september", displayName: "September", monthNum: 9, order: 1 },
    { key: "october", displayName: "October", monthNum: 10, order: 2 },
    { key: "november", displayName: "November", monthNum: 11, order: 3 },
    { key: "december", displayName: "December", monthNum: 12, order: 4 },
    { key: "january", displayName: "January", monthNum: 1, order: 5 },
    { key: "february", displayName: "February", monthNum: 2, order: 6 },
    { key: "march", displayName: "March", monthNum: 3, order: 7 },
    { key: "april", displayName: "April", monthNum: 4, order: 8 },
    { key: "may", displayName: "May", monthNum: 5, order: 9 },
    { key: "june", displayName: "June", monthNum: 6, order: 10 },
  ];

  useEffect(() => {
    if (student) {
      console.log("=== StudentDetailDrawerV3 - Student data received ===");
      console.log("Full student object:", student);
      console.log("student.full_name:", student.full_name);
      console.log("student.class_name:", student.class_name);
      console.log("student.group:", student.group);
      console.log("student.enrollment_month:", student.enrollment_month);
      console.log("student.observations:", student.observations);
      console.log("student.agreed_amounts:", student.agreed_amounts);
      console.log(
        "student.agreed_amounts?.tuition:",
        student.agreed_amounts?.tuition
      );
      console.log(
        "student.agreed_amounts?.transport:",
        student.agreed_amounts?.transport
      );
      console.log("student.contact_info:", student.contact_info);

      setFormData({
        name: student.full_name || student.name || "",
        class: student.class_name || student.class || student.grade || "",
        group: student.group || "",
        joined_month: student.enrollment_month || student.joined_month || 1,
        agreed_monthly_payment: student.agreed_amounts?.tuition || "",
        transport_agreed: student.agreed_amounts?.transport || "",
        insurance_agreed: student.agreed_amounts?.insurance || "",
        observations: student.observations || student.notes || "",
      });
    } else {
      // Reset form for new student
      setFormData({
        name: "",
        class: "",
        group: "",
        joined_month: 1,
        agreed_monthly_payment: "",
        transport_agreed: "",
        insurance_agreed: "",
        observations: "",
      });
    }
  }, [student]);

  const handleSave = async () => {
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }

    if (!formData.class.trim()) {
      newErrors.class = "Class is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      // Clean up empty numeric fields - leave empty if user didn't enter anything
      const cleanedData = {
        full_name: formData.name.trim(),
        class_name: formData.class.trim(),
        group: formData.group.trim(),
        joined_month: formData.joined_month,
        agreed_amounts: {
          tuition:
            formData.agreed_monthly_payment === ""
              ? 0
              : Number(formData.agreed_monthly_payment),
          transport:
            formData.transport_agreed === ""
              ? 0
              : Number(formData.transport_agreed),
          insurance:
            formData.insurance_agreed === ""
              ? 0
              : Number(formData.insurance_agreed),
        },
        notes: formData.observations.trim(),
      };

      let response;
      if (student && student.id) {
        // Update existing student
        response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/home/api/student-detail/${student.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cleanedData),
          }
        );
      } else {
        // Create new student
        const newStudentData = {
          ...cleanedData,
          student_id: `ST${Date.now()}`, // Generate temporary ID
          first_name: formData.name.trim().split(" ")[0],
          last_name:
            formData.name.trim().split(" ").slice(1).join(" ") ||
            formData.name.trim().split(" ")[0],
          enrollment_status: "ACTIVE",
          enrollment_date: new Date().toISOString(),
          is_new_student: true,
        };

        response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/students/api/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newStudentData),
          }
        );
      }

      if (response.ok) {
        const result = await response.json();

        // Create updated student object with form data for immediate UI update
        const updatedStudent = {
          ...student, // Keep existing data
          id: student?.id || result.student?.id,
          full_name: formData.name.trim(),
          joined_month: formData.joined_month,
          // Include other relevant fields that might have changed
          ...result.student, // Backend response data
        };

        onSave(updatedStudent);

        // Small delay to show the completed state before closing
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        console.error("Failed to save student");
      }
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="90vw" maxH="90vh" overflow="auto">
          <Dialog.Header>
            <Dialog.Title>
              <Text fontSize="lg" fontWeight="bold">
                {student ? "Edit Student Details" : "Add New Student"}
              </Text>
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.CloseTrigger />

          <Dialog.Body>
            <Box p={4}>
              {isLoadingStudent ? (
                <Box textAlign="center" py={8}>
                  <Text>Loading student details...</Text>
                </Box>
              ) : student ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "32px",
                  }}
                >
                  {/* Student Information Section */}
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      mb={4}
                      color="blue.600"
                    >
                      Student Information
                    </Text>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          mb={2}
                          color={errors.name ? "red.500" : "inherit"}
                        >
                          Student Name *
                        </Text>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="Enter student name"
                          bg="white"
                          borderColor={errors.name ? "red.500" : "gray.200"}
                          _focus={{
                            borderColor: errors.name ? "red.500" : "blue.500",
                          }}
                        />
                        {errors.name && (
                          <Text fontSize="xs" color="red.500" mt={1}>
                            {errors.name}
                          </Text>
                        )}
                      </div>
                      <div>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          mb={2}
                          color={errors.class ? "red.500" : "inherit"}
                        >
                          Class *
                        </Text>
                        <Input
                          value={formData.class}
                          onChange={(e) =>
                            handleInputChange("class", e.target.value)
                          }
                          placeholder="Enter class"
                          bg="white"
                          borderColor={errors.class ? "red.500" : "gray.200"}
                          _focus={{
                            borderColor: errors.class ? "red.500" : "blue.500",
                          }}
                        />
                        {errors.class && (
                          <Text fontSize="xs" color="red.500" mt={1}>
                            {errors.class}
                          </Text>
                        )}
                      </div>
                      <div>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Group
                        </Text>
                        <Input
                          value={formData.group}
                          onChange={(e) =>
                            handleInputChange("group", e.target.value)
                          }
                          placeholder="Enter group"
                          bg="white"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Joined In
                      </Text>
                      <select
                        value={formData.joined_month}
                        onChange={(e) =>
                          handleInputChange(
                            "joined_month",
                            Number(e.target.value)
                          )
                        }
                        style={{
                          width: "200px",
                          padding: "8px 12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          fontSize: "14px",
                          backgroundColor: "white",
                        }}
                      >
                        {months.map((month) => (
                          <option key={month.key} value={month.monthNum}>
                            {month.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Box>

                  {/* Agreed Amounts Section */}
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="green.50"
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      mb={4}
                      color="green.600"
                    >
                      Agreed Amounts
                    </Text>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Agreed Monthly Payment
                        </Text>
                        <Input
                          type="number"
                          value={formData.agreed_monthly_payment}
                          onChange={(e) =>
                            handleInputChange(
                              "agreed_monthly_payment",
                              e.target.value
                            )
                          }
                          placeholder="Enter amount (leave empty if 0)"
                          bg="white"
                        />
                      </div>
                      <div>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Transport Agreed
                        </Text>
                        <Input
                          type="number"
                          value={formData.transport_agreed}
                          onChange={(e) =>
                            handleInputChange(
                              "transport_agreed",
                              e.target.value
                            )
                          }
                          placeholder="Enter amount (leave empty if 0)"
                          bg="white"
                        />
                      </div>
                      <div>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Insurance Agreed
                        </Text>
                        <Input
                          type="number"
                          value={formData.insurance_agreed}
                          onChange={(e) =>
                            handleInputChange(
                              "insurance_agreed",
                              e.target.value
                            )
                          }
                          placeholder="Enter amount (leave empty if 0)"
                          bg="white"
                        />
                      </div>
                    </div>
                  </Box>

                  {/* Observations Section */}
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="yellow.50"
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      mb={3}
                      color="orange.600"
                    >
                      Observations
                    </Text>
                    <textarea
                      value={formData.observations}
                      onChange={(e) =>
                        handleInputChange("observations", e.target.value)
                      }
                      placeholder="Enter any observations or notes..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        backgroundColor: "white",
                      }}
                    />
                  </Box>
                </div>
              ) : (
                <Box textAlign="center" py={8}>
                  <Text>No student data available</Text>
                </Box>
              )}
            </Box>
          </Dialog.Body>

          <Dialog.Footer>
            <Box display="flex" justifyContent="center" width="100%">
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                loadingText="Saving..."
                colorScheme="blue"
                size="lg"
                px={8}
              >
                Save Changes
              </Button>
            </Box>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default StudentDetailDrawerV3;
