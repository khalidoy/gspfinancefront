import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  useDisclosure,
  HStack,
  VStack,
  Badge,
} from "@chakra-ui/react";
import {
  FaBars as HamburgerIcon,
  FaTimes as CloseIcon,
  FaChevronDown as ChevronDownIcon,
  FaChevronRight as ChevronRightIcon,
} from "react-icons/fa";
import {
  FaHome,
  FaUsers,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaRobot,
  FaBell,
  FaGlobe,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

// Navigation data
const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: FaHome,
  },
  {
    label: "Students",
    href: "/students",
    icon: FaUsers,
    children: [
      {
        label: "All Students",
        subLabel: "View and manage all students",
        href: "/students",
      },
      {
        label: "Add Student",
        subLabel: "Register a new student",
        href: "/add-student",
      },
      {
        label: "Student Analytics",
        subLabel: "View student reports and statistics",
        href: "/student-analytics",
      },
    ],
  },
  {
    label: "Classes",
    href: "/classes",
    icon: FaChalkboardTeacher,
    children: [
      {
        label: "All Classes",
        subLabel: "View and manage classes",
        href: "/classes",
      },
      {
        label: "Add Class",
        subLabel: "Create a new class",
        href: "/add-class",
      },
      {
        label: "Class Schedule",
        subLabel: "Manage class schedules",
        href: "/schedule",
      },
    ],
  },
  {
    label: "Payments",
    href: "/payments",
    icon: FaMoneyBillWave,
    children: [
      {
        label: "All Payments",
        subLabel: "View payment history",
        href: "/payments",
      },
      {
        label: "Pending Payments",
        subLabel: "View outstanding payments",
        href: "/pending-payments",
      },
      {
        label: "Payment Analytics",
        subLabel: "Financial reports and insights",
        href: "/payment-analytics",
      },
    ],
  },
  {
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: FaRobot,
    children: [
      {
        label: "Chat Assistant",
        subLabel: "Interactive AI chat for help",
        href: "/ai-assistant",
      },
      {
        label: "Analytics AI",
        subLabel: "AI-powered analytics and insights",
        href: "/ai-analytics",
      },
      {
        label: "Report Generator",
        subLabel: "Generate reports with AI",
        href: "/ai-reports",
      },
    ],
  },
];

const DesktopNav = () => {
  const linkColor = "white";
  const linkHoverColor = "cyan.200";

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Button
            as={Link}
            to={navItem.href ?? '#'}
            variant="ghost"
            color={linkColor}
            _hover={{
              color: linkHoverColor,
              bg: "rgba(255,255,255,0.1)",
            }}
            fontWeight={500}
            size="sm"
          >
            {navItem.label}
          </Button>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Box
      as={Link}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: "gray.50" }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'cyan.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'} color="gray.500">
            {subLabel}
          </Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <ChevronRightIcon style={{ color: '#38B2AC', width: '20px', height: '20px' }} />
        </Flex>
      </Stack>
    </Box>
  );
};

const MobileNav = () => {
  return (
    <Stack bg="white" p={4} display={{ md: 'none' }} shadow="lg">
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, icon }) => {
  const { isOpen, onToggle } = useDisclosure();

  const renderIcon = (IconComponent) => {
    if (!IconComponent) return null;
    return <IconComponent color="#38B2AC" />;
  };

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as={Link}
        to={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
        }}
      >
        <HStack spacing={3}>
          {/* {renderIcon(icon)} */}
          <Text fontWeight={600} color="gray.700">
            {label}
          </Text>
          {children && (
            <ChevronDownIcon
              style={{
                transition: 'all .25s ease-in-out',
                transform: isOpen ? 'rotate(180deg)' : '',
                width: '24px',
                height: '24px',
                color: '#A0AEC0'
              }}
            />
          )}
        </HStack>
      </Box>

      {isOpen && (
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor="gray.200"
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Box as={Link} key={child.label} py={2} to={child.href}>
                <Text fontSize="sm" color="gray.600">
                  {child.label}
                </Text>
              </Box>
            ))}
        </Stack>
      )}
    </Stack>
  );
};

function Navbar({ user, onLogout }) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <Box>
      <Flex
        bg="linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"
        color="white"
        minH={'70px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor="cyan.700"
        align={'center'}
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        position="sticky"
        top={0}
        zIndex={1000}
      >
        {/* Mobile menu button */}
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant={'ghost'}
            color="white"
            aria-label={'Toggle Navigation'}
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
          />
        </Flex>

        {/* Logo and Brand */}
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
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
            <VStack align="start" spacing={0} display={{ base: 'none', md: 'flex' }}>
              <Text color="white" fontSize="xl" fontWeight="bold">
                GSP Finance
              </Text>
              <Text color="cyan.200" fontSize="sm">
                {t("school_management_system")}
              </Text>
            </VStack>
          </HStack>

          {/* Desktop Navigation */}
          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        {/* Right side actions */}
        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={4}
        >
          {/* Notifications */}
          <IconButton
            variant="ghost"
            color="white"
            size="sm"
            icon={<FaBell />}
            borderRadius="lg"
            position="relative"
            _hover={{
              bg: "rgba(255,255,255,0.2)",
              transform: "scale(1.05)",
            }}
            transition="all 0.2s"
          >
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
          </IconButton>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            color="white"
            size="sm"
            leftIcon={<FaGlobe />}
            borderRadius="lg"
            _hover={{
              bg: "rgba(255,255,255,0.2)",
              transform: "translateY(-1px)",
            }}
            transition="all 0.2s"
            onClick={() => changeLanguage(i18n.language === "en" ? "ar" : "en")}
          >
            {i18n.language.toUpperCase()}
          </Button>

          {/* User Menu */}
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
            onClick={handleLogout}
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
                <FaUserCircle color="#38B2AC" />
              </Box>
              <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                <Text fontSize="sm" fontWeight="medium" lineHeight="1">
                  {user?.full_name?.split(" ")[0] ||
                    user?.username ||
                    t("user")}
                </Text>
                <Text fontSize="xs" color="cyan.200" lineHeight="1">
                  {user?.role || "User"}
                </Text>
              </VStack>
              <FaSignOutAlt />
            </HStack>
          </Button>
        </Stack>
      </Flex>

      {/* Mobile Navigation */}
      {isOpen && <MobileNav />}
    </Box>
  );
}

export default Navbar;
