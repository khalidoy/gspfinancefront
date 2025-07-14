import React from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Slide,
  Flex,
  Spacer,
  Badge,
} from "@chakra-ui/react";
import { FaUserEdit, FaUserMinus, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const BatchActionsMenu = ({
  selectedStudentIds,
  isSaving,
  handleOpenAffectClassModal,
  handleMarkSelectedLeft,
  handleDeleteSelected,
}) => {
  const { t } = useTranslation();
  const isVisible = selectedStudentIds.size > 0;

  return (
    <Slide direction="bottom" in={isVisible} style={{ zIndex: 1000 }}>
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        p={4}
        boxShadow="0 -4px 12px rgba(0, 0, 0, 0.15)"
      >
        <Flex align="center" maxW="container.xl" mx="auto">
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
              {selectedStudentIds.size} {t("selected")}
            </Badge>
            <Text fontSize="sm" color="gray.600">
              {t("batch_actions")}
            </Text>
          </HStack>

          <Spacer />

          <HStack spacing={3}>
            <Button
              leftIcon={<FaUserEdit />}
              colorScheme="blue"
              size="sm"
              onClick={handleOpenAffectClassModal}
              isDisabled={isSaving}
            >
              {t("affect_to_class")}
            </Button>
            <Button
              leftIcon={<FaUserMinus />}
              colorScheme="orange"
              size="sm"
              onClick={handleMarkSelectedLeft}
              isDisabled={isSaving}
            >
              {t("mark_as_left")}
            </Button>
            <Button
              leftIcon={<FaTrash />}
              colorScheme="red"
              size="sm"
              onClick={handleDeleteSelected}
              isDisabled={isSaving}
            >
              {t("delete_selected")}
            </Button>
          </HStack>
        </Flex>{" "}
      </Box>
    </Slide>
  );
};

export default BatchActionsMenu;
