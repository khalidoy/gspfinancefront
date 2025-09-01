import React from "react";
import {
  Box,
  Container,
  HStack,
  VStack,
  Text,
  Button,
  Icon,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Flex,
  useBreakpointValue,
  Badge,
  Separator,
} from "@chakra-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFileInvoice,
  FaChartLine,
  FaDollarSign,
  FaGlobe,
  FaUsers,
  FaGraduationCap,
  FaCreditCard,
  FaRobot,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaBell,
  FaCog,
  FaSearch,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Navbar({ user, onLogout }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const navItems = [
    {
      label: t("home"),
      icon: FaHome,
      path: "/",
      badge: null,
    },
    {
      label: t("students"),
      icon: FaUsers,
      path: "/students",
      badge: "320",
    },
    {
      label: t("classes"),
      icon: FaGraduationCap,
      path: "/classes",
      badge: "16",
    },
    {
      label: t("payments"),
      icon: FaCreditCard,
      path: "/payments",
      badge: "New",
    },
    {
      label: t("daily_accounting"),
      icon: FaFileInvoice,
      path: "/daily-accounting",
      badge: null,
    },
  ];

  const expensesItems = [
    {
      label: t("daily_expenses"),
      path: "/expenses/daily",
    },
    {
      label: t("monthly_expenses"),
      path: "/expenses/monthly",
    },
  ];

  const reportsItems = [
    {
      label: t("daily_accounting_report"),
      path: "/reports/daily-accounting",
    },
    {
      label: t("payments_report"),
      path: "/reports/payments",
    },
    {
      label: t("normal_payments"),
      path: "/reports/normal-payments",
    },
    {
      label: t("credit_report"),
      path: "/reports/credit",
    },
    {
      label: t("transport_report"),
      path: "/reports/transport",
    },
  ];

  const aiItems = [
    {
      label: t("ai_chat"),
      path: "/chat",
    },
    {
      label: t("ai_assistant"),
      path: "/ai/assistant",
    },
    {
      label: t("ai_reports"),
      path: "/ai/reports",
    },
    {
      label: t("ai_analytics"),
      path: "/ai/analytics",
    },
  ];

  if (isMobile) {
    return (
      <Box
        bg="linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"
        borderBottom="1px"
        borderColor="cyan.700"
        py={3}
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
      >
        <Container maxW="7xl">
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Box
                h="45px"
                w="45px"
                bg="white"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
              >
                <Text color="cyan.600" fontSize="lg" fontWeight="bold">
                  GSP
                </Text>
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="white" fontSize="md" fontWeight="bold">
                  GSP Finance
                </Text>
                <Text color="cyan.200" fontSize="xs">
                  {t("school_management")}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              {/* Quick Action Button */}
              <Button
                variant="ghost"
                color="white"
                size="sm"
                borderRadius="lg"
                _hover={{ bg: "cyan.500" }}
              >
                <Icon as={FaBell} />
              </Button>

              {/* Mobile Menu */}
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button
                    variant="ghost"
                    color="white"
                    size="sm"
                    borderRadius="lg"
                    _hover={{ bg: "cyan.500" }}
                  >
                    <Icon as={FaBars} />
                  </Button>
                </MenuTrigger>
                <MenuContent minW="280px" borderRadius="xl" boxShadow="xl">
                  {/* User Info Header */}
                  <Box p={4} bg="cyan.50" borderTopRadius="xl">
                    <HStack spacing={3}>
                      <Box
                        h="40px"
                        w="40px"
                        bg="cyan.500"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FaUserCircle} color="white" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="semibold">
                          {user?.full_name || user?.username || t("user")}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {user?.role || "User"}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <Separator />

                  {/* Navigation Items */}
                  {navItems.map((item) => (
                    <MenuItem key={item.path} asChild>
                      <Link to={item.path}>
                        <HStack spacing={3} w="full">
                          <Icon as={item.icon} color="cyan.600" />
                          <Text flex={1}>{item.label}</Text>
                          {item.badge && (
                            <Badge
                              colorScheme={
                                item.badge === "New" ? "green" : "cyan"
                              }
                              variant="solid"
                              borderRadius="full"
                              fontSize="xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </HStack>
                      </Link>
                    </MenuItem>
                  ))}

                  <Separator />

                  <MenuItem onClick={handleLogout}>
                    <HStack spacing={3}>
                      <Icon as={FaSignOutAlt} color="red.500" />
                      <Text color="red.500">{t("logout")}</Text>
                    </HStack>
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            </HStack>
          </HStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      bg="linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"
      borderBottom="1px"
      borderColor="cyan.700"
      py={3}
      boxShadow="0 4px 12px rgba(0,0,0,0.15)"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="7xl">
        <Flex justify="space-between" align="center">
          {/* Logo and Brand */}
          <HStack spacing={4}>
            <Box
              h="55px"
              w="55px"
              bg="white"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 12px rgba(0,0,0,0.1)"
              transition="transform 0.2s"
              _hover={{ transform: "scale(1.05)" }}
            >
              <Text color="cyan.600" fontSize="xl" fontWeight="bold">
                GSP
              </Text>
            </Box>
            <VStack align="start" spacing={0}>
              <Text color="white" fontSize="xl" fontWeight="bold">
                GSP Finance
              </Text>
              <Text color="cyan.200" fontSize="sm">
                {t("school_management_system")}
              </Text>
            </VStack>
          </HStack>

          {/* Navigation Items */}
          <HStack spacing={1}>
            {/* Main Navigation */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  as={Link}
                  to={item.path}
                  variant="ghost"
                  color="white"
                  size="sm"
                  leftIcon={<Icon as={item.icon} />}
                  bg={isActive ? "rgba(255,255,255,0.2)" : "transparent"}
                  borderRadius="lg"
                  px={4}
                  py={2}
                  position="relative"
                  _hover={{
                    bg: "rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  _active={{
                    bg: "rgba(255,255,255,0.3)",
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {item.label}
                  {item.badge && (
                    <Badge
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      colorScheme={item.badge === "New" ? "green" : "orange"}
                      variant="solid"
                      borderRadius="full"
                      fontSize="xs"
                      minW="20px"
                      h="20px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}

            {/* Expenses Dropdown */}
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  size="sm"
                  leftIcon={<Icon as={FaDollarSign} />}
                  borderRadius="lg"
                  _hover={{
                    bg: "rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {t("expenses")}
                </Button>
              </MenuTrigger>
              <MenuContent borderRadius="xl" boxShadow="xl" minW="200px">
                {expensesItems.map((item) => (
                  <MenuItem key={item.path} asChild borderRadius="lg">
                    <Link to={item.path}>
                      <HStack spacing={3}>
                        <Icon as={FaDollarSign} color="green.500" size="sm" />
                        <Text>{item.label}</Text>
                      </HStack>
                    </Link>
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>

            {/* Reports Dropdown */}
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  size="sm"
                  leftIcon={<Icon as={FaChartLine} />}
                  borderRadius="lg"
                  _hover={{
                    bg: "rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {t("reports")}
                </Button>
              </MenuTrigger>
              <MenuContent borderRadius="xl" boxShadow="xl" minW="220px">
                {reportsItems.map((item) => (
                  <MenuItem key={item.path} asChild borderRadius="lg">
                    <Link to={item.path}>
                      <HStack spacing={3}>
                        <Icon as={FaChartLine} color="blue.500" size="sm" />
                        <Text>{item.label}</Text>
                      </HStack>
                    </Link>
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>

            {/* AI Features Dropdown */}
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  size="sm"
                  leftIcon={<Icon as={FaRobot} />}
                  borderRadius="lg"
                  _hover={{
                    bg: "rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {t("ai_features")}
                </Button>
              </MenuTrigger>
              <MenuContent borderRadius="xl" boxShadow="xl" minW="200px">
                {aiItems.map((item) => (
                  <MenuItem key={item.path} asChild borderRadius="lg">
                    <Link to={item.path}>
                      <HStack spacing={3}>
                        <Icon as={FaRobot} color="purple.500" size="sm" />
                        <Text>{item.label}</Text>
                      </HStack>
                    </Link>
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>

            {/* Quick Actions */}
            <HStack spacing={2} ml={4}>
              {/* Notifications */}
              <Button
                variant="ghost"
                color="white"
                size="sm"
                borderRadius="lg"
                position="relative"
                _hover={{
                  bg: "rgba(255,255,255,0.2)",
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
              >
                <Icon as={FaBell} />
                <Badge
                  position="absolute"
                  top="0"
                  right="0"
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  fontSize="xs"
                  minW="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  3
                </Badge>
              </Button>

              {/* Search */}
              <Button
                variant="ghost"
                color="white"
                size="sm"
                borderRadius="lg"
                _hover={{
                  bg: "rgba(255,255,255,0.2)",
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
              >
                <Icon as={FaSearch} />
              </Button>
            </HStack>

            {/* Language Switcher */}
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  size="sm"
                  leftIcon={<Icon as={FaGlobe} />}
                  borderRadius="lg"
                  _hover={{
                    bg: "rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                  }}
                  transition="all 0.2s"
                >
                  {i18n.language.toUpperCase()}
                </Button>
              </MenuTrigger>
              <MenuContent borderRadius="xl" boxShadow="xl">
                <MenuItem
                  onClick={() => changeLanguage("en")}
                  borderRadius="lg"
                >
                  <HStack spacing={3}>
                    <Text fontSize="lg">🇺🇸</Text>
                    <Text>English</Text>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={() => changeLanguage("ar")}
                  borderRadius="lg"
                >
                  <HStack spacing={3}>
                    <Text fontSize="lg">🇲🇦</Text>
                    <Text>العربية</Text>
                  </HStack>
                </MenuItem>
                <MenuItem
                  onClick={() => changeLanguage("fr")}
                  borderRadius="lg"
                >
                  <HStack spacing={3}>
                    <Text fontSize="lg">🇫🇷</Text>
                    <Text>Français</Text>
                  </HStack>
                </MenuItem>
              </MenuContent>
            </MenuRoot>

            {/* User Menu */}
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  variant="ghost"
                  color="white"
                  size="sm"
                  borderRadius="lg"
                  bg="rgba(255,255,255,0.1)"
                  border="1px solid rgba(255,255,255,0.2)"
                  _hover={{
                    bg: "rgba(255,255,255,0.2)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  transition="all 0.2s"
                  px={3}
                >
                  <HStack spacing={2}>
                    <Box
                      h="32px"
                      w="32px"
                      bg="white"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaUserCircle} color="cyan.600" />
                    </Box>
                    <VStack spacing={0} align="start">
                      <Text fontSize="sm" fontWeight="medium" lineHeight="1">
                        {user?.full_name?.split(" ")[0] ||
                          user?.username ||
                          t("user")}
                      </Text>
                      <Text fontSize="xs" color="cyan.200" lineHeight="1">
                        {user?.role || "User"}
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              </MenuTrigger>
              <MenuContent borderRadius="xl" boxShadow="xl" minW="250px">
                {/* User Info Header */}
                <Box p={4} bg="cyan.50" borderTopRadius="xl">
                  <HStack spacing={3}>
                    <Box
                      h="50px"
                      w="50px"
                      bg="cyan.500"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaUserCircle} color="white" size="lg" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="md" fontWeight="semibold">
                        {user?.full_name || user?.username}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {user?.role || "User"}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {user?.email || "No email"}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Separator />

                <MenuItem asChild borderRadius="lg">
                  <Link to="/profile">
                    <HStack spacing={3}>
                      <Icon as={FaUserCircle} color="blue.500" />
                      <Text>{t("profile")}</Text>
                    </HStack>
                  </Link>
                </MenuItem>

                <MenuItem borderRadius="lg">
                  <HStack spacing={3}>
                    <Icon as={FaCog} color="gray.500" />
                    <Text>Settings</Text>
                  </HStack>
                </MenuItem>

                {user?.role === "ADMIN" && (
                  <>
                    <Separator />
                    <MenuItem asChild borderRadius="lg">
                      <Link to="/register">
                        <HStack spacing={3}>
                          <Icon as={FaUsers} color="green.500" />
                          <Text>{t("add_user")}</Text>
                          <Badge
                            colorScheme="green"
                            variant="solid"
                            borderRadius="full"
                            fontSize="xs"
                          >
                            Admin
                          </Badge>
                        </HStack>
                      </Link>
                    </MenuItem>
                  </>
                )}

                <Separator />

                <MenuItem
                  onClick={handleLogout}
                  borderRadius="lg"
                  color="red.500"
                >
                  <HStack spacing={3}>
                    <Icon as={FaSignOutAlt} />
                    <Text>{t("logout")}</Text>
                  </HStack>
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;
