import React, { useState, useEffect } from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogCloseTrigger,
  Button,
  Field,
  FieldLabel,
  FieldErrorText,
  Input,
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
  NumberInputRoot,
  NumberInputInput,
  NumberInputIncrementTrigger,
  NumberInputDecrementTrigger,
  Textarea,
  Switch,
  VStack,
  HStack,
  Alert,
  AlertIndicator,
  Grid,
  GridItem,
  Text,
  Separator,
  Box,
  Icon,
} from "@chakra-ui/react";
import { createToaster } from "@chakra-ui/react";
import { FaSchool, FaGraduationCap, FaInfoCircle } from "react-icons/fa";
import axios from "axios";

const toaster = createToaster({
  placement: "top",
});

const EDUCATION_LEVELS = [
  ["KINDERGARTEN", "Kindergarten"],
  ["PRIMARY", "Primary School"],
  ["MIDDLE", "Middle School"],
  ["HIGH_SCHOOL", "High School"],
  ["COLLEGE_PREP", "College Prep"],
];

const ClassModal = ({
  isOpen,
  onClose,
  onClassCreated,
  editingClass = null,
}) => {
  const [formData, setFormData] = useState({
    class_name: "",
    class_code: "",
    education_level: "PRIMARY",
    grade_number: 1,
    max_students: 30,
    classroom_location: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing class changes
  useEffect(() => {
    if (isOpen) {
      if (editingClass) {
        setFormData({
          class_name: editingClass.class_name || "",
          class_code: editingClass.class_code || "",
          education_level: editingClass.education_level || "PRIMARY",
          grade_number: editingClass.grade_number || 1,
          max_students: editingClass.max_students || 30,
          classroom_location: editingClass.classroom_location || "",
          description: editingClass.description || "",
          is_active:
            editingClass.is_active !== undefined
              ? editingClass.is_active
              : true,
        });
      } else {
        setFormData({
          class_name: "",
          class_code: "",
          education_level: "PRIMARY",
          grade_number: 1,
          max_students: 30,
          classroom_location: "",
          description: "",
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, editingClass]);

  // Auto-generate class code when class name changes
  useEffect(() => {
    if (formData.class_name && !editingClass) {
      const generatedCode = formData.class_name
        .replace(/\s+/g, "")
        .replace(/Grade/gi, "G")
        .toUpperCase()
        .substring(0, 10);
      setFormData((prev) => ({ ...prev, class_code: generatedCode }));
    }
  }, [formData.class_name, editingClass]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.class_name.trim()) {
      newErrors.class_name = "Class name is required";
    }

    if (!formData.class_code.trim()) {
      newErrors.class_code = "Class code is required";
    }

    if (formData.max_students <= 0) {
      newErrors.max_students = "Max students must be greater than 0";
    }

    if (formData.grade_number <= 0) {
      newErrors.grade_number = "Grade number must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toaster.create({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = editingClass
        ? `http://localhost:5000/classes/classes/${editingClass.id}/edit`
        : "http://localhost:5000/classes/classes/new";

      const method = editingClass ? "PUT" : "POST";

      const response = await axios({
        method,
        url: apiUrl,
        data: formData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toaster.create({
          title: editingClass ? "Class Updated" : "Class Created",
          description: editingClass
            ? "Class has been successfully updated"
            : "New class has been successfully created",
          status: "success",
          duration: 3000,
        });

        onClassCreated && onClassCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error saving class:", error);

      let errorMessage = "An unexpected error occurred";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toaster.create({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEducationLevelDisplay = (level) => {
    const found = EDUCATION_LEVELS.find((item) => item[0] === level);
    return found ? found[1] : level;
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="xl"
    >
      <DialogBackdrop />
      <DialogContent maxW="800px">
        <DialogHeader>
          <HStack gap={3}>
            <Box p={2} bg="blue.100" borderRadius="md">
              <Icon color="blue.600">
                <FaSchool />
              </Icon>
            </Box>
            <Text fontSize="lg" fontWeight="semibold">
              {editingClass ? "Edit Class" : "Create New Class"}
            </Text>
          </HStack>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap={6} align="stretch">
            {/* Basic Information */}
            <VStack gap={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Basic Information
              </Text>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Field invalid={errors.class_name} required>
                    <FieldLabel>Class Name</FieldLabel>
                    <Input
                      value={formData.class_name}
                      onChange={(e) =>
                        handleInputChange("class_name", e.target.value)
                      }
                      placeholder="e.g., Grade 5A, Mathematics Advanced"
                    />
                    {errors.class_name && (
                      <FieldErrorText>{errors.class_name}</FieldErrorText>
                    )}
                  </Field>
                </GridItem>

                <GridItem>
                  <Field invalid={errors.class_code} required>
                    <FieldLabel>Class Code</FieldLabel>
                    <Input
                      value={formData.class_code}
                      onChange={(e) =>
                        handleInputChange("class_code", e.target.value)
                      }
                      placeholder="e.g., G5A, MATH_ADV"
                    />
                    {errors.class_code && (
                      <FieldErrorText>{errors.class_code}</FieldErrorText>
                    )}
                  </Field>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem>
                  <Field required>
                    <FieldLabel>Education Level</FieldLabel>
                    <SelectRoot
                      value={[formData.education_level]}
                      onValueChange={(e) =>
                        handleInputChange("education_level", e.value[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map(([value, label]) => (
                          <SelectItem key={value} item={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                </GridItem>

                <GridItem>
                  <Field invalid={errors.grade_number} required>
                    <FieldLabel>Grade Number</FieldLabel>
                    <NumberInputRoot
                      value={formData.grade_number.toString()}
                      onValueChange={(e) =>
                        handleInputChange(
                          "grade_number",
                          parseInt(e.value) || 1
                        )
                      }
                      min={1}
                      max={12}
                    >
                      <NumberInputInput />
                      <NumberInputIncrementTrigger />
                      <NumberInputDecrementTrigger />
                    </NumberInputRoot>
                    {errors.grade_number && (
                      <FieldErrorText>{errors.grade_number}</FieldErrorText>
                    )}
                  </Field>
                </GridItem>

                <GridItem>
                  <Field invalid={errors.max_students} required>
                    <FieldLabel>Max Students</FieldLabel>
                    <NumberInputRoot
                      value={formData.max_students.toString()}
                      onValueChange={(e) =>
                        handleInputChange(
                          "max_students",
                          parseInt(e.value) || 30
                        )
                      }
                      min={1}
                      max={100}
                    >
                      <NumberInputInput />
                      <NumberInputIncrementTrigger />
                      <NumberInputDecrementTrigger />
                    </NumberInputRoot>
                    {errors.max_students && (
                      <FieldErrorText>{errors.max_students}</FieldErrorText>
                    )}
                  </Field>
                </GridItem>
              </Grid>
            </VStack>

            <Separator />

            {/* Additional Information */}
            <VStack gap={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Additional Information
              </Text>

              <Field>
                <FieldLabel>Classroom Location</FieldLabel>
                <Input
                  value={formData.classroom_location}
                  onChange={(e) =>
                    handleInputChange("classroom_location", e.target.value)
                  }
                  placeholder="e.g., Building A, Room 201"
                />
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Additional notes about this class..."
                  rows={3}
                />
              </Field>

              <Field>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <FieldLabel mb={0}>Class Status</FieldLabel>
                    <Text fontSize="sm" color="gray.500">
                      {formData.is_active
                        ? "Active - accepting new students"
                        : "Inactive - not accepting students"}
                    </Text>
                  </VStack>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_active", checked)
                    }
                    colorPalette="blue"
                    size="lg"
                  />
                </HStack>
              </Field>
            </VStack>

            {/* Summary */}
            {formData.class_name && (
              <>
                <Separator />
                <Alert status="info">
                  <AlertIndicator>
                    <Icon color="blue.500">
                      <FaInfoCircle />
                    </Icon>
                  </AlertIndicator>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold">Class Summary:</Text>
                    <Text fontSize="sm">
                      {formData.class_name} ({formData.class_code}) -{" "}
                      {getEducationLevelDisplay(formData.education_level)} Grade{" "}
                      {formData.grade_number}
                    </Text>
                    <Text fontSize="sm">
                      Capacity: {formData.max_students} students
                      {formData.classroom_location &&
                        ` • Location: ${formData.classroom_location}`}
                    </Text>
                  </VStack>
                </Alert>
              </>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorPalette="blue"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText={editingClass ? "Updating..." : "Creating..."}
          >
            <Icon>
              <FaGraduationCap />
            </Icon>
            {editingClass ? "Update Class" : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default ClassModal;
