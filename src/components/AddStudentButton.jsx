import React from "react";
import { Button, Flex } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const AddStudentButton = ({ onClick, disabled }) => {
  const { t } = useTranslation();
  return (
    <Flex justify="center" mb={4}>
      <Button
        colorScheme="green"
        size="lg"
        onClick={onClick}
        isDisabled={disabled}
        borderRadius="full"
        px={6}
        py={3}
        boxShadow="0 2px 12px rgba(44, 62, 80, 0.10)"
        leftIcon={<FaPlus />}
        fontSize="1.15rem"
        fontWeight={600}
      >
        {t("add_new_student")}
      </Button>
    </Flex>
  );
};

export default AddStudentButton;
