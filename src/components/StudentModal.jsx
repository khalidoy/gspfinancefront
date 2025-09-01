import React, { useState, useEffect } from "react";
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogTitle,
  Button,
  Input,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  Textarea,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Separator,
  SimpleGrid,
  Avatar,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  NumberInputRoot,
  NumberInputInput,
  NumberInputDecrementTrigger,
  NumberInputIncrementTrigger,
  FieldRoot,
  FieldLabel,
  FieldErrorText,
  Switch,
  SwitchControl,
  SwitchLabel,
  SwitchThumb,
} from "@chakra-ui/react";
import {
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaMoneyBillWave,
  FaTrash,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

function StudentModal({
  isOpen,
  onClose,
  student,
  onStudentChange,
  onSave,
  onDelete,
  isSaving,
  isNew,
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("info");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && isNew) {
      setActiveTab("info");
      setErrors({});
    }
  }, [isOpen, isNew]);

  const validateForm = () => {
    const newErrors = {};

    if (!student?.full_name?.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!student?.student_number?.trim()) {
      newErrors.student_number = "Student number is required";
    }

    if (!student?.classe?.trim()) {
      newErrors.classe = "Class is required";
    }

    if (student?.email && !/\S+@\S+\.\S+/.test(student.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const handleInputChange = (field, value) => {
    onStudentChange({
      ...student,
      [field]: value,
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "graduated":
        return "blue";
      default:
        return "gray";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
    })
      .format(amount || 0)
      .replace("MAD", "DH");
  };

  if (!isOpen) return null;

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="6xl"
    >
      <DialogBackdrop />
      <DialogContent maxW="6xl" maxH="90vh">
        <DialogHeader>
          <DialogTitle>
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={student?.full_name || "New Student"}
                bg="blue.500"
                color="white"
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">
                  {isNew ? "New Student" : student?.full_name}
                </Text>
                {!isNew && (
                  <HStack>
                    <Text fontSize="sm" color="gray.600">
                      {student?.student_number}
                    </Text>
                    <Badge colorScheme={getStatusColor(student?.status)}>
                      {student?.status || "active"}
                    </Badge>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <TabsRoot value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="info">
                <HStack>
                  <FaUser />
                  <Text>Personal Info</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="academic">
                <HStack>
                  <FaGraduationCap />
                  <Text>Academic Info</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="financial">
                <HStack>
                  <FaMoneyBillWave />
                  <Text>Financial Info</Text>
                </HStack>
              </TabsTrigger>
              <TabsTrigger value="contact">
                <HStack>
                  <FaPhone />
                  <Text>Contact Info</Text>
                </HStack>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Field invalid={!!errors.full_name}>
                    <FieldLabel>Full Name *</FieldLabel>
                    <Input
                      value={student?.full_name || ""}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      placeholder="Enter full name"
                    />
                    {errors.full_name && (
                      <FieldErrorText>{errors.full_name}</FieldErrorText>
                    )}
                  </Field>

                  <Field invalid={!!errors.student_number}>
                    <FieldLabel>Student Number *</FieldLabel>
                    <Input
                      value={student?.student_number || ""}
                      onChange={(e) =>
                        handleInputChange("student_number", e.target.value)
                      }
                      placeholder="Enter student number"
                    />
                    {errors.student_number && (
                      <FieldErrorText>{errors.student_number}</FieldErrorText>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>CIN</FieldLabel>
                    <Input
                      value={student?.cin || ""}
                      onChange={(e) => handleInputChange("cin", e.target.value)}
                      placeholder="Enter CIN"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Birth Date</FieldLabel>
                    <Input
                      type="date"
                      value={student?.date_naissance || ""}
                      onChange={(e) =>
                        handleInputChange("date_naissance", e.target.value)
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Address</FieldLabel>
                    <Textarea
                      value={student?.adresse || ""}
                      onChange={(e) =>
                        handleInputChange("adresse", e.target.value)
                      }
                      placeholder="Enter address"
                      rows={3}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <SelectRoot
                      value={[student?.status || "active"]}
                      onValueChange={(details) =>
                        handleInputChange("status", details.value[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem item="active" value="active">
                          Active
                        </SelectItem>
                        <SelectItem item="inactive" value="inactive">
                          Inactive
                        </SelectItem>
                        <SelectItem item="graduated" value="graduated">
                          Graduated
                        </SelectItem>
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                </SimpleGrid>
              </VStack>
            </TabsContent>

            <TabsContent value="academic">
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Field invalid={!!errors.classe}>
                    <FieldLabel>Class *</FieldLabel>
                    <SelectRoot
                      value={[student?.classe || ""]}
                      onValueChange={(details) =>
                        handleInputChange("classe", details.value[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem item="1BAC" value="1BAC">
                          1BAC
                        </SelectItem>
                        <SelectItem item="2BAC" value="2BAC">
                          2BAC
                        </SelectItem>
                        <SelectItem item="TC" value="TC">
                          TC
                        </SelectItem>
                      </SelectContent>
                    </SelectRoot>
                    {errors.classe && (
                      <FieldErrorText>{errors.classe}</FieldErrorText>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>Level</FieldLabel>
                    <SelectRoot
                      value={[student?.niveau || ""]}
                      onValueChange={(details) =>
                        handleInputChange("niveau", details.value[0])
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem item="Debutant" value="Debutant">
                          Beginner
                        </SelectItem>
                        <SelectItem item="Intermediaire" value="Intermediaire">
                          Intermediate
                        </SelectItem>
                        <SelectItem item="Avance" value="Avance">
                          Advanced
                        </SelectItem>
                      </SelectContent>
                    </SelectRoot>
                  </Field>

                  <Field>
                    <FieldLabel>Branch</FieldLabel>
                    <Input
                      value={student?.filiere || ""}
                      onChange={(e) =>
                        handleInputChange("filiere", e.target.value)
                      }
                      placeholder="Enter branch"
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Enrollment Date</FieldLabel>
                    <Input
                      type="date"
                      value={student?.date_inscription || ""}
                      onChange={(e) =>
                        handleInputChange("date_inscription", e.target.value)
                      }
                    />
                  </Field>
                </SimpleGrid>

                <Separator />

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Transport Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field>
                      <FieldLabel>Use Transport</FieldLabel>
                      <Switch
                        checked={student?.transport || false}
                        onCheckedChange={(checked) =>
                          handleInputChange("transport", checked)
                        }
                      >
                        <SwitchControl>
                          <SwitchThumb />
                        </SwitchControl>
                        <SwitchLabel>
                          {student?.transport ? "Yes" : "No"}
                        </SwitchLabel>
                      </Switch>
                    </Field>

                    {student?.transport && (
                      <Field>
                        <FieldLabel>Transport Fee</FieldLabel>
                        <NumberInputRoot
                          value={student?.frais_transport || 0}
                          onValueChange={(details) =>
                            handleInputChange("frais_transport", details.value)
                          }
                          min={0}
                        >
                          <NumberInputInput />
                          <NumberInputIncrementTrigger />
                          <NumberInputDecrementTrigger />
                        </NumberInputRoot>
                      </Field>
                    )}
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabsContent>

            <TabsContent value="financial">
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Field>
                    <FieldLabel>Monthly Fee</FieldLabel>
                    <NumberInputRoot
                      value={student?.frais_mensuel || 0}
                      onValueChange={(details) =>
                        handleInputChange("frais_mensuel", details.value)
                      }
                      min={0}
                    >
                      <NumberInputInput />
                      <NumberInputIncrementTrigger />
                      <NumberInputDecrementTrigger />
                    </NumberInputRoot>
                  </Field>

                  <Field>
                    <FieldLabel>Registration Fee</FieldLabel>
                    <NumberInputRoot
                      value={student?.frais_inscription || 0}
                      onValueChange={(details) =>
                        handleInputChange("frais_inscription", details.value)
                      }
                      min={0}
                    >
                      <NumberInputInput />
                      <NumberInputIncrementTrigger />
                      <NumberInputDecrementTrigger />
                    </NumberInputRoot>
                  </Field>

                  <Field>
                    <FieldLabel>Discount (%)</FieldLabel>
                    <NumberInputRoot
                      value={student?.reduction || 0}
                      onValueChange={(details) =>
                        handleInputChange("reduction", details.value)
                      }
                      min={0}
                      max={100}
                    >
                      <NumberInputInput />
                      <NumberInputIncrementTrigger />
                      <NumberInputDecrementTrigger />
                    </NumberInputRoot>
                  </Field>

                  <Field>
                    <FieldLabel>Balance</FieldLabel>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={student?.solde < 0 ? "red.500" : "green.500"}
                    >
                      {formatCurrency(student?.solde)}
                    </Text>
                  </Field>
                </SimpleGrid>

                <Separator />

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Payment Summary
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box
                      p={4}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Total Paid
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.500">
                        {formatCurrency(student?.total_paye || 0)}
                      </Text>
                    </Box>
                    <Box
                      p={4}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Total Due
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.500">
                        {formatCurrency(student?.total_du || 0)}
                      </Text>
                    </Box>
                    <Box
                      p={4}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.600">
                        Remaining Balance
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={student?.solde < 0 ? "red.500" : "green.500"}
                      >
                        {formatCurrency(student?.solde || 0)}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabsContent>

            <TabsContent value="contact">
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      value={student?.telephone || ""}
                      onChange={(e) =>
                        handleInputChange("telephone", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </Field>

                  <Field invalid={!!errors.email}>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      value={student?.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <FieldErrorText>{errors.email}</FieldErrorText>
                    )}
                  </Field>
                </SimpleGrid>

                <Separator />

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Parent Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Field>
                      <FieldLabel>Parent Name</FieldLabel>
                      <Input
                        value={student?.nom_parent || ""}
                        onChange={(e) =>
                          handleInputChange("nom_parent", e.target.value)
                        }
                        placeholder="Enter parent name"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Parent Phone</FieldLabel>
                      <Input
                        value={student?.telephone_parent || ""}
                        onChange={(e) =>
                          handleInputChange("telephone_parent", e.target.value)
                        }
                        placeholder="Enter parent phone"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Parent Email</FieldLabel>
                      <Input
                        type="email"
                        value={student?.email_parent || ""}
                        onChange={(e) =>
                          handleInputChange("email_parent", e.target.value)
                        }
                        placeholder="Enter parent email"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Emergency Contact</FieldLabel>
                      <Input
                        value={student?.contact_urgence || ""}
                        onChange={(e) =>
                          handleInputChange("contact_urgence", e.target.value)
                        }
                        placeholder="Enter emergency contact"
                      />
                    </Field>
                  </SimpleGrid>
                </Box>
              </VStack>
            </TabsContent>
          </TabsRoot>
        </DialogBody>

        <DialogFooter>
          <HStack spacing={3}>
            {!isNew && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={onDelete}
                size="md"
              >
                <FaTrash /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={onClose} size="md" mr="auto">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              loading={isSaving}
              size="md"
            >
              Save
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export default StudentModal;
