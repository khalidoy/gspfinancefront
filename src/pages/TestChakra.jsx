import React from "react";

// Try importing just Box to test
import { Box } from "@chakra-ui/react";

const TestChakra = () => {
  console.log("Box type:", typeof Box);
  console.log("Box:", Box);

  return (
    <div>
      <h1>Testing Chakra UI Components</h1>
      <p>Check console for component types</p>
      <Box p={4} bg="blue.100">
        <div>This should be a blue box</div>
      </Box>
    </div>
  );
};

export default TestChakra;
