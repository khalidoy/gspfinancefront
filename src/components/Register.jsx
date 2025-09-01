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
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
});

function Register({ onRegisterSuccess, isGuestAccess = false }) {
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

  const roles = [
    { value: "USER", label: "User" },
    { value: "ADMIN", label: "Administrator" },
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (
        !formData.username.trim() ||
        !formData.email.trim() ||
        !formData.full_name.trim() ||
        !formData.password
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirm_password) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/register", formData);

      if (response.data && response.data.message) {
        setSuccess("User registered successfully!");
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

        // Call success callback
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
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
    <Container maxW="container.md" h="100vh">
      <Center h="100%">
        <Box
          w="100%"
          maxW="500px"
          bg="white"
          shadow="xl"
          borderRadius="lg"
          p={8}
        >
          <VStack spacing={6}>
            <Heading size="lg" color="blue.600" textAlign="center">
              {t("register.title", "Register New User")}
            </Heading>

            {/* Guest Access Warning */}
            {isGuestAccess && (
              <Box
                bg="orange.50"
                border="1px"
                borderColor="orange.200"
                borderRadius="md"
                p={4}
                w="100%"
              >
                <VStack spacing={3}>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color="orange.700"
                    textAlign="center"
                  >
                    {t(
                      "register.guestAccessTitle",
                      "Registration Temporarily Unavailable"
                    )}
                  </Text>
                  <Text fontSize="sm" color="orange.600" textAlign="center">
                    {t(
                      "register.guestAccessMessage",
                      "New user registration requires administrator approval. Please contact your system administrator to create a new account."
                    )}
                  </Text>
                  <Box>
                    <Button
                      as="a"
                      href="#/login"
                      colorScheme="blue"
                      size="sm"
                      variant="outline"
                    >
                      {t("register.backToLogin", "Back to Login")}
                    </Button>
                  </Box>
                </VStack>
              </Box>
            )}

            {/* Only show registration form if not guest access */}
            {!isGuestAccess && (
              <>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {t("register.subtitle", "Create a new user account")}
                </Text>

                <Box w="100%">
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
                          size="lg"
                        />
                      </Box>

                      <Box w="100%">
                        <Input
                          name="email"
                          type="email"
                          placeholder={t("register.email", "Email")}
                          value={formData.email}
                          onChange={handleChange}
                          size="lg"
                        />
                      </Box>

                      <Box w="100%">
                        <Input
                          name="full_name"
                          placeholder={t("register.fullName", "Full Name")}
                          value={formData.full_name}
                          onChange={handleChange}
                          size="lg"
                        />
                      </Box>

                      <Box w="100%">
                        <Select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          size="lg"
                        >
                          {roles.map((role) => (
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
                          size="lg"
                          pr={12}
                        />
                        <Box
                          position="absolute"
                          right={3}
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
                          size="lg"
                          pr={12}
                        />
                        <Box
                          position="absolute"
                          right={3}
                          top="50%"
                          transform="translateY(-50%)"
                          zIndex={2}
                        >
                          <IconButton
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            icon={
                              showConfirmPassword ? <FaEyeSlash /> : <FaEye />
                            }
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
                        >
                          {t("register.active", "Active User")}
                        </Checkbox>
                      </Box>

                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        w="100%"
                        isLoading={loading}
                        loadingText={t(
                          "register.creating",
                          "Creating account..."
                        )}
                      >
                        {t("register.create", "Create Account")}
                      </Button>
                    </VStack>
                  </form>
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Center>
    </Container>
  );
}

export default Register;
