import React from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaClock, FaUserCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const UserInfoCard = ({
  currentUser,
  formattedDate,
  formattedTime,
  cardOrder,
}) => {
  const { t } = useTranslation();

  const cardBg = useColorModeValue("#f7f8fa", "gray.700");
  const itemBg = useColorModeValue("white", "gray.600");
  const iconColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("gray.800", "white");

  const getCardContent = (cardType) => {
    const iconMap = {
      greeting: FaUserCircle,
      date: FaCalendarAlt,
      time: FaClock,
    };

    return (
      <Flex
        key={cardType}
        align="center"
        bg={itemBg}
        borderRadius="14px"
        boxShadow="0 2px 8px 0 rgba(0,0,0,0.04)"
        py={3}
        px={6}
        minW="140px"
        border="2px solid transparent"
        mr={2}
      >
        <Icon
          as={iconMap[cardType]}
          color={iconColor}
          fontSize="2xl"
          mr={3}
          filter="drop-shadow(1px 1px 0 #e0e7ef)"
        />
        <Text
          fontFamily="'Permanent Marker', cursive"
          fontSize="lg"
          color={textColor}
          letterSpacing="0.5px"
        >
          {cardType === "greeting" ? (
            <>
              {t("hello")},{" "}
              <Text
                as="span"
                fontFamily="'Fira Mono', monospace"
                fontWeight="bold"
                color={textColor}
                letterSpacing="1px"
                textShadow="1px 1px 0 #f1f5f9"
              >
                {currentUser?.username || currentUser?.name || t("user")}!
              </Text>
            </>
          ) : cardType === "date" ? (
            formattedDate
          ) : (
            formattedTime
          )}
        </Text>
      </Flex>
    );
  };

  return (
    <>
      {/* Google Fonts for sketchy/cool look */}
      <link
        href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Fira+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <Box
        bg={cardBg}
        borderRadius="22px"
        boxShadow="0 6px 32px 0 rgba(0,0,0,0.07), 0 1.5px 0 #23272f0d"
        p={8}
        my={8}
        mx="auto"
        maxW="650px"
        fontFamily="'Fira Mono', monospace"
        border="2px solid #e5e7eb"
      >
        <HStack spacing={6} justify="flex-start" wrap="wrap">
          {cardOrder.map(getCardContent)}
        </HStack>
      </Box>
    </>
  );
};

export default UserInfoCard;
