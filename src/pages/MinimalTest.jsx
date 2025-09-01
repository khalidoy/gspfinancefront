import React from "react";
import { Box } from "@chakra-ui/react";
import { Alert } from "../components/ui/alert";

const MinimalTest = () => {
  return (
    <Box p={4}>
      <Alert title="Test Alert" status="info">
        This is testing the v3 Alert component
      </Alert>
      <p>Regular HTML paragraph</p>
    </Box>
  );
};

export default MinimalTest;
