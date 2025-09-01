import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  IconButton,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { FaRobot, FaUser, FaTrash, FaSync } from "react-icons/fa";

const ChatTest = () => {
  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={6}>
          {/* Header */}
          <Card w="full" variant="outline">
            <CardHeader pb={3}>
              <HStack justify="space-between" align="center">
                <HStack spacing={4}>
                  <Avatar
                    size="lg"
                    bg="blue.500"
                    icon={<FaRobot fontSize="2rem" />}
                  />
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color="gray.800">
                      GSP Finance AI Assistant - Test
                    </Heading>
                    <Text color="gray.600" fontSize="md">
                      Testing basic components
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={2}>
                  <IconButton size="sm" variant="outline" icon={<FaTrash />} />
                  <IconButton size="sm" variant="outline" icon={<FaSync />} />
                </HStack>
              </HStack>
            </CardHeader>
          </Card>

          <Card w="full" variant="outline">
            <CardBody>
              <Text>Basic test working!</Text>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChatTest;
