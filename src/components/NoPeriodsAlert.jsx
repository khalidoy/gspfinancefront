import React from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const NoPeriodsAlert = ({ handleOpenNewSchoolYearModal }) => {
  const { t } = useTranslation();
  return (
    <Alert status="warning" borderRadius="md" textAlign="center" p={6}>
      <AlertIcon />
      <VStack spacing={3}>
        <AlertTitle fontSize="lg">
          {t("no_school_year_periods_found_title")}
        </AlertTitle>
        <AlertDescription>{t("please_add_first_school_year")}</AlertDescription>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleOpenNewSchoolYearModal}
        >
          {t("add_school_year_now")}
        </Button>
      </VStack>
    </Alert>
  );
};

export default NoPeriodsAlert;
