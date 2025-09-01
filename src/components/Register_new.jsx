import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Select,
  Checkbox,
  IconButton,
  Container,
  Center,
  HStack,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
});

// User roles available for registration
const USER_ROLES = [
  { value: "USER", label: "User" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Administrator" },
];

function Register({ onRegisterSuccess, onCancel }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    role: "USER",
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Prepare data for submission (exclude confirm_password)
      const submitData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        password: formData.password,
        role: formData.role,
        is_active: formData.is_active,
      };

      const response = await api.post("/register", submitData);

      if (response.data && response.data.message) {
        setSuccess(response.data.message);

        // Reset form
        setFormData({
          username: "",
          email: "",
          full_name: "",
          password: "",
          confirm_password: "",
          role: "USER",
          is_active: true,
        });

        // Call success callback after a short delay
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(response.data);
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Center>
        <Box
          w="100%"
          maxW="500px"
          bg="white"
          shadow="xl"
          borderRadius="lg"
          overflow="hidden"
        >
          <Box textAlign="center" p={6} pb={2}>
            <Heading size="lg" color="blue.600">
              {t("register.title", "Register New User")}
            </Heading>
            <Text fontSize="sm" color="gray.600" mt={2}>
              {t("register.subtitle", "Create a new user account")}
            </Text>
          </Box>

          <Box p={6} pt={4}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {error && (
                  <Box
                    bg="red.50"
                    border="1px"
                    borderColor="red.200"
                    borderRadius="md"
                    p={3}
                    w="100%"
                  >
                    <Text fontSize="sm" color="red.600">
                      {error}
                    </Text>
                  </Box>
                )}

                {success && (
                  <Box
                    bg="green.50"
                    border="1px"
                    borderColor="green.200"
                    borderRadius="md"
                    p={3}
                    w="100%"
                  >
                    <Text fontSize="sm" color="green.600">
                      {success}
                    </Text>
                  </Box>
                )}

                <Box w="100%">
                  <Input
                    name="username"
                    placeholder={t("register.username", "Username")}
                    value={formData.username}
                    onChange={handleChange}
                    isRequired
                  />
                </Box>

                <Box w="100%">
                  <Input
                    name="email"
                    type="email"
                    placeholder={t("register.email", "Email Address")}
                    value={formData.email}
                    onChange={handleChange}
                    isRequired
                  />
                </Box>

                <Box w="100%">
                  <Input
                    name="full_name"
                    placeholder={t("register.fullName", "Full Name")}
                    value={formData.full_name}
                    onChange={handleChange}
                    isRequired
                  />
                </Box>

                <Box w="100%">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    {t("register.role", "User Role")}
                  </Text>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box w="100%" position="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("register.password", "Password")}
                    value={formData.password}
                    onChange={handleChange}
                    isRequired
                    pr={10}
                  />
                  <Box
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={2}
                  >
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </Box>
                </Box>

                <Box w="100%" position="relative">
                  <Input
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t(
                      "register.confirmPassword",
                      "Confirm Password"
                    )}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    isRequired
                    pr={10}
                  />
                  <Box
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex={2}
                  >
                    <IconButton
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      variant="ghost"
                      size="sm"
                    />
                  </Box>
                </Box>

                <Box w="100%">
                  <Checkbox
                    name="is_active"
                    isChecked={formData.is_active}
                    onChange={handleChange}
                    colorScheme="blue"
                  >
                    {t(
                      "register.activeAccount",
                      "Activate account immediately"
                    )}
                  </Checkbox>
                </Box>

                <HStack w="100%" spacing={3}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    flex={1}
                    isLoading={loading}
                    loadingText={t("register.creating", "Creating...")}
                  >
                    {t("register.create", "Create User")}
                  </Button>

                  {onCancel && (
                    <Button
                      variant="outline"
                      size="lg"
                      flex={1}
                      onClick={onCancel}
                      isDisabled={loading}
                    >
                      {t("register.cancel", "Cancel")}
                    </Button>
                  )}
                </HStack>
              </VStack>
            </form>
          </Box>
        </Box>
      </Center>
    </Container>
  );
}

export default Register;
