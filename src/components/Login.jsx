import React, { useState, useContext } from "react";
import {
  Box,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Card,
  CardBody,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  Link as ChakraLink,
  CloseButton,
} from "@chakra-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../contexts/AuthContext";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || "/";

  // Check for success message from registration
  const successMessage = location.state?.message;
  const messageType = location.state?.type || "danger";
  const [showSuccessMessage, setShowSuccessMessage] = useState(
    !!successMessage
  );

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.200");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError(t("username_password_required"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await login(username, password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || t("login_failed"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t("login_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent py={12}>
      <Box w="100%">
        <Card bg={cardBg} shadow="lg" borderRadius="lg" p={8}>
          <CardBody>
            <VStack spacing={6}>
              <Box textAlign="center">
                <Heading size="lg" mb={2}>
                  {t("login")}
                </Heading>
                <Text color={textColor}>{t("login_subtitle")}</Text>
              </Box>

              {showSuccessMessage && (
                <Alert
                  status={messageType === "danger" ? "error" : "success"}
                  borderRadius="md"
                >
                  <AlertIcon />
                  <AlertDescription flex="1">{successMessage}</AlertDescription>
                  <CloseButton
                    onClick={() => {
                      setShowSuccessMessage(false);
                      navigate(location.pathname, { replace: true });
                    }}
                  />
                </Alert>
              )}

              {(error || authError) && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error || authError}</AlertDescription>
                </Alert>
              )}

              <Box as="form" onSubmit={handleLogin} w="100%">
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>{t("username")}</FormLabel>
                    <Input
                      type="text"
                      placeholder={t("enter_username")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      isDisabled={loading}
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>{t("password")}</FormLabel>
                    <Input
                      type="password"
                      placeholder={t("enter_password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      isDisabled={loading}
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    size="lg"
                    isLoading={loading}
                    loadingText={`${t("logging_in")}...`}
                    spinner={<Spinner size="sm" />}
                  >
                    {t("login")}
                  </Button>
                </VStack>
              </Box>

              <Flex justify="center" mt={4}>
                <Text color={textColor}>
                  {t("dont_have_account")}{" "}
                  <ChakraLink
                    as={Link}
                    to="/register"
                    color="blue.500"
                    fontWeight="medium"
                  >
                    {t("register")}
                  </ChakraLink>
                </Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;
