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
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../contexts/AuthContext";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, error: authError } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.200");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Form validation
    if (!username.trim() || !password || !confirmPassword) {
      setError(t("all_fields_required"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await register(username, password);

      if (result.success) {
        // Registration successful, redirect to login
        navigate("/login", {
          state: {
            message: t("registration_successful_please_login"),
            type: "success",
          },
        });
      } else {
        setError(result.error || t("registration_failed"));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(t("registration_failed"));
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
                  {t("register")}
                </Heading>
                <Text color={textColor}>{t("create_new_account")}</Text>
              </Box>

              {(error || authError) && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error || authError}</AlertDescription>
                </Alert>
              )}

              <Box as="form" onSubmit={handleRegister} w="100%">
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

                  <FormControl isRequired>
                    <FormLabel>{t("confirm_password")}</FormLabel>
                    <Input
                      type="password"
                      placeholder={t("confirm_your_password")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    loadingText={`${t("registering")}...`}
                    spinner={<Spinner size="sm" />}
                  >
                    {t("register")}
                  </Button>
                </VStack>
              </Box>

              <Flex justify="center" mt={4}>
                <Text color={textColor}>
                  {t("already_have_account")}{" "}
                  <ChakraLink
                    as={Link}
                    to="/login"
                    color="blue.500"
                    fontWeight="medium"
                  >
                    {t("login")}
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

export default Register;
