import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  CheckboxRoot,
  CheckboxControl,
  CheckboxLabel,
  IconButton,
  Container,
  Center,
  Icon,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Configure axios with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
});

function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember_me: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (!formData.username.trim() || !formData.password) {
        setError("Please enter both username and password");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/login", formData);

      if (response.data && response.data.user) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("isAuthenticated", "true");

        // Call success callback
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" h="100vh">
      <Center h="100%">
        <Box
          w="100%"
          maxW="400px"
          bg="white"
          shadow="xl"
          borderRadius="lg"
          p={8}
        >
          <VStack gap={6}>
            <Heading size="lg" color="blue.600" textAlign="center">
              {t("login.title", "GSP Finance")}
            </Heading>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              {t("login.subtitle", "Sign in to your account")}
            </Text>

            <Box w="100%">
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
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

                  <Box w="100%">
                    <Input
                      name="username"
                      placeholder={t("login.username", "Username or Email")}
                      value={formData.username}
                      onChange={handleChange}
                      size="lg"
                    />
                  </Box>

                  <Box w="100%" position="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("login.password", "Password")}
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
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      >
                        <Icon>{showPassword ? <FaEyeSlash /> : <FaEye />}</Icon>
                      </IconButton>
                    </Box>
                  </Box>

                  <Flex w="100%" justify="space-between" align="center">
                    <CheckboxRoot
                      checked={formData.remember_me}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          remember_me: checked,
                        }))
                      }
                      size="sm"
                    >
                      <CheckboxControl />
                      <CheckboxLabel>
                        {t("login.remember", "Remember me")}
                      </CheckboxLabel>
                    </CheckboxRoot>
                  </Flex>

                  <Button
                    type="submit"
                    colorPalette="blue"
                    size="lg"
                    w="100%"
                    loading={loading}
                    loadingText={t("login.signingIn", "Signing in...")}
                  >
                    {t("login.signin", "Sign In")}
                  </Button>

                  {/* Register Link */}
                  <Box textAlign="center" w="100%">
                    <Text fontSize="sm" color="gray.600">
                      {t("login.noAccount", "Don't have an account?")}{" "}
                      <ChakraLink
                        as={Link}
                        to="/register"
                        color="blue.600"
                        fontWeight="medium"
                        _hover={{
                          color: "blue.700",
                          textDecoration: "underline",
                        }}
                      >
                        <Icon mr={1}>
                          <FaUserPlus />
                        </Icon>
                        {t("login.register", "Register here")}
                      </ChakraLink>
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {t(
                        "login.registerNote",
                        "Registration requires admin approval"
                      )}
                    </Text>
                  </Box>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
}

export default Login;
