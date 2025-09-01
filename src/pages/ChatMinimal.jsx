import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { FaRobot, FaUser } from "react-icons/fa";

const ChatMinimal = () => {
  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={6} h="calc(100vh - 120px)">
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
                      GSP Finance AI Assistant
                    </Heading>
                    <Text color="gray.600" fontSize="md">
                      Intelligent financial analytics powered by GPT-4o
                    </Text>
                  </VStack>
                </HStack>
              </HStack>
            </CardHeader>
          </Card>

          {/* Simple content */}
          <Box flex={1} w="full" position="relative">
            <Card h="full" variant="outline">
              <CardBody p={4}>
                <Text>Chat content will go here...</Text>
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChatMinimal;
