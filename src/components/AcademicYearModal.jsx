import React, { useState } from "react";
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
  FieldHelperText,
  Input,
  Textarea,
  VStack,
  HStack,
  Switch,
  Alert,
  AlertIndicator,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaGraduationCap,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

function AcademicYearModal({ isOpen, onClose, onSave }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    year_name: "",
    display_name: "",
    start_date: "",
    end_date: "",
    description: "",
    is_current_year: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.year_name.trim()) {
      newErrors.year_name = t("year_name_required");
    }

    if (!formData.start_date) {
      newErrors.start_date = t("start_date_required");
    }

    if (!formData.end_date) {
      newErrors.end_date = t("end_date_required");
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = t("end_date_must_be_after_start_date");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        display_name:
          formData.display_name || `Academic Year ${formData.year_name}`,
      };

      await onSave(payload);
      handleClose();
    } catch (error) {
      console.error("Error saving academic year:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      year_name: "",
      display_name: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current_year: false,
    });
    setErrors({});
    onClose();
  };

  // Generate suggested year name based on start date
  const handleStartDateChange = (date) => {
    handleInputChange("start_date", date);

    if (date && !formData.year_name) {
      const startYear = new Date(date).getFullYear();
      const endYear = startYear + 1;
      handleInputChange("year_name", `${startYear}-${endYear}`);
      handleInputChange(
        "display_name",
        `Academic Year ${startYear}-${endYear}`
      );
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && handleClose()}
      size="lg"
      centered
    >
      <DialogBackdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <DialogContent bg="white" mx={4} maxW="2xl">
        <DialogHeader>
          <HStack gap={3}>
            <Box p={2} bg="teal.100" borderRadius="md">
              <Icon color="teal.600">
                <FaGraduationCap />
              </Icon>
            </Box>
            <Text fontSize="lg" fontWeight="semibold">
              {t("create_new_academic_year")}
            </Text>
          </HStack>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap={5} align="stretch">
            {/* Year Name */}
            <Field invalid={!!errors.year_name} required>
              <FieldLabel>{t("year_name")}</FieldLabel>
              <Input
                placeholder="2024-2025"
                value={formData.year_name}
                onChange={(e) => handleInputChange("year_name", e.target.value)}
                borderColor="gray.200"
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px teal.500",
                }}
              />
              {errors.year_name && (
                <FieldErrorText color="red.500">
                  {errors.year_name}
                </FieldErrorText>
              )}
            </Field>

            {/* Display Name */}
            <Field>
              <FieldLabel>{t("display_name")}</FieldLabel>
              <Input
                placeholder="Academic Year 2024-2025"
                value={formData.display_name}
                onChange={(e) =>
                  handleInputChange("display_name", e.target.value)
                }
                borderColor="gray.200"
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px teal.500",
                }}
              />
              <FieldHelperText fontSize="xs" color="gray.500">
                {t("display_name_optional")}
              </FieldHelperText>
            </Field>

            {/* Date Range */}
            <HStack gap={4} align="start">
              <Field invalid={!!errors.start_date} required flex={1}>
                <FieldLabel>{t("start_date")}</FieldLabel>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px teal.500",
                  }}
                />
                {errors.start_date && (
                  <FieldErrorText color="red.500">
                    {errors.start_date}
                  </FieldErrorText>
                )}
              </Field>

              <Field invalid={!!errors.end_date} required flex={1}>
                <FieldLabel>{t("end_date")}</FieldLabel>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    handleInputChange("end_date", e.target.value)
                  }
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px teal.500",
                  }}
                />
                {errors.end_date && (
                  <FieldErrorText color="red.500">
                    {errors.end_date}
                  </FieldErrorText>
                )}
              </Field>
            </HStack>

            {/* Description */}
            <Field>
              <FieldLabel>{t("description")}</FieldLabel>
              <Textarea
                placeholder={t("academic_year_description_placeholder")}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                borderColor="gray.200"
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px teal.500",
                }}
                rows={3}
              />
            </Field>

            {/* Current Year Toggle */}
            <Field>
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <Text fontWeight="medium">{t("set_as_current_year")}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {t("current_year_description")}
                  </Text>
                </VStack>
                <Switch
                  checked={formData.is_current_year}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_current_year", checked)
                  }
                  colorPalette="teal"
                  size="lg"
                />
              </HStack>
            </Field>

            {/* Warning for setting as current */}
            {formData.is_current_year && (
              <Alert status="warning" borderRadius="md">
                <AlertIndicator>
                  <Icon color="orange.500">
                    <FaExclamationTriangle />
                  </Icon>
                </AlertIndicator>
                <Text fontSize="sm">{t("current_year_warning")}</Text>
              </Alert>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack gap={3}>
            <Button variant="ghost" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button
              colorPalette="teal"
              onClick={handleSave}
              loading={isLoading}
              loadingText={t("creating")}
            >
              <Icon>
                <FaCalendarAlt />
              </Icon>
              {t("create_academic_year")}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export default AcademicYearModal;
