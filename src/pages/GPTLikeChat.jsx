import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Textarea,
  Text,
  Spinner,
  IconButton,
  SimpleGrid,
  Alert,
  ButtonGroup,
  AbsoluteCenter,
  Grid,
  GridItem,
  Flex,
  Spacer,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Collapse,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import axios from "axios";
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaChartBar,
  FaDatabase,
  FaBrain,
  FaExclamationTriangle,
} from "react-icons/fa";

// Import Enhanced AI Chart Component
import ProperChartComponent from "../components/ProperChartComponent";

// ChatInput Component - Minimal floating design with Chakra theming
const ChatInput = ({
  inputRef,
  inputValue,
  setInputValue,
  handleSubmit,
  isLoading,
  messages,
}) => (
  <Box
    position="fixed"
    bottom={6}
    left="calc(50% - 160px)"
    transform="translateX(-50%)"
    w="90%"
    maxW="600px"
    zIndex={10}
  >
    <Box
      bg="white"
      borderRadius="full"
      border="1px solid"
      borderColor="gray.200"
      shadow="lg"
      _hover={{
        shadow: "xl",
        borderColor: "blue.300",
      }}
      transition="all 0.3s ease"
    >
      <form onSubmit={handleSubmit}>
        <HStack spacing={0} p={1} align="center">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about your school finances..."
            disabled={isLoading}
            resize="none"
            minH="36px"
            maxH="100px"
            borderRadius="full"
            border="none"
            fontSize="sm"
            px={4}
            py={2}
            lineHeight="1.4"
            display="flex"
            alignItems="center"
            _focus={{
              outline: "none",
            }}
            _placeholder={{
              color: "gray.400",
              lineHeight: "1.4",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <IconButton
            type="submit"
            aria-label="Send message"
            colorScheme="gray"
            size="sm"
            borderRadius="full"
            w="36px"
            h="36px"
            disabled={!inputValue.trim() || isLoading}
            bg="gray.800"
            color="white"
            _hover={{
              bg: "gray.700",
              transform: "scale(1.05)",
              shadow: "md",
            }}
            _disabled={{
              bg: "gray.300",
              color: "gray.500",
            }}
            transition="all 0.2s ease"
          >
            {isLoading ? (
              <Spinner size="sm" color="white" thickness="2px" speed="0.8s" />
            ) : (
              <FaPaperPlane />
            )}
          </IconButton>
        </HStack>
      </form>
    </Box>
  </Box>
);

const GPTLikeChat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Debug environment variables
  useEffect(() => {
    console.log("🔍 Environment Variables Debug:");
    console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);
    console.log("REACT_APP_MCP_URL:", process.env.REACT_APP_MCP_URL);
    console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);
  }, []);

  // Color scheme for beautiful UI
  const bgGradient = "linear(to-br, gray.50, blue.50)";
  const textColor = "gray.800";

  const TypingAnimation = () => (
    <VStack spacing={2} align="start">
      <HStack spacing={2}>
        <Box
          w="32px"
          h="32px"
          borderRadius="full"
          bg="blue.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          animation="pulse 2s infinite"
          sx={{
            "@keyframes pulse": {
              "0%, 100%": {
                opacity: 1,
                transform: "scale(1)",
              },
              "50%": {
                opacity: 0.7,
                transform: "scale(1.05)",
              },
            },
          }}
        >
          <FaRobot size={16} />
        </Box>
        <VStack align="start" spacing={1}>
          <Text fontSize="xs" color="gray.500" fontWeight="500">
            AI Assistant is thinking
          </Text>
          <HStack spacing={1}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                w="6px"
                h="6px"
                bg="blue.400"
                borderRadius="full"
                animation={`bounce 1.4s infinite ${i * 0.2}s`}
                sx={{
                  "@keyframes bounce": {
                    "0%, 60%, 100%": {
                      transform: "translateY(0)",
                      opacity: 0.4,
                    },
                    "30%": {
                      transform: "translateY(-8px)",
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  );

  // Enhanced animated thinking indicator
  const AnimatedThinkingIndicator = () => (
    <VStack spacing={3} align="start">
      <HStack spacing={3}>
        <Box
          w="36px"
          h="36px"
          borderRadius="full"
          bgGradient="linear(to-r, blue.400, purple.500)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          animation="spin 3s linear infinite"
          sx={{
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        >
          <FaBrain size={18} />
        </Box>
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color="gray.600" fontWeight="600">
            AI is processing your request
          </Text>
          <HStack spacing={1}>
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation={`bounce 1.2s infinite ${i * 0.15}s`}
                sx={{
                  "@keyframes bounce": {
                    "0%, 40%, 100%": {
                      transform: "scale(0.8) translateY(0)",
                      opacity: 0.5,
                    },
                    "20%": {
                      transform: "scale(1.2) translateY(-10px)",
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  );

  // Function to render formatted text with markdown-like styling
  const renderFormattedText = (text) => {
    if (!text) return "";

    let formattedText = text.replace(/\\n/g, "\n");
    const lines = formattedText.split("\n");

    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={`br-${lineIndex}`} />;
      }

      // Handle emoji headers
      const emojiHeaderPattern = /^([📊💰🚨📈🔍⚡]+)\s*([A-Z\s]+):/;
      const emojiMatch = line.match(emojiHeaderPattern);

      if (emojiMatch) {
        return (
          <div
            key={lineIndex}
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#2D3748",
              marginTop: "16px",
              marginBottom: "8px",
              borderBottom: "2px solid #E2E8F0",
              paddingBottom: "4px",
            }}
          >
            <span style={{ marginRight: "8px" }}>{emojiMatch[1]}</span>
            <span>{emojiMatch[2]}:</span>
          </div>
        );
      }

      // Handle bullet points
      if (line.trim().startsWith("•")) {
        return (
          <div
            key={lineIndex}
            style={{
              marginLeft: "20px",
              marginBottom: "4px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <span
              style={{
                color: "#4299E1",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              •
            </span>
            <span>{line.trim().substring(1).trim()}</span>
          </div>
        );
      }

      // Handle sub-bullet points
      if (line.trim().startsWith("- ")) {
        return (
          <div
            key={lineIndex}
            style={{
              marginLeft: "40px",
              marginBottom: "4px",
              fontSize: "13px",
              lineHeight: "1.4",
              color: "#4A5568",
            }}
          >
            <span
              style={{
                color: "#718096",
                fontWeight: "bold",
                marginRight: "6px",
              }}
            >
              -
            </span>
            <span>{line.trim().substring(2)}</span>
          </div>
        );
      }

      // Process **bold** text
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.slice(2, -2);
          return (
            <strong
              key={`${lineIndex}-${partIndex}`}
              style={{ fontWeight: "700", color: "#1A202C" }}
            >
              {boldText}
            </strong>
          );
        }
        return part;
      });

      return (
        <div
          key={lineIndex}
          style={{
            marginBottom: "6px",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#2D3748",
          }}
        >
          {formattedParts}
        </div>
      );
    });
  };

  // CSV Download functionality
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "string" && value.includes(",")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download smart data using MCP server endpoint
  const downloadSmartData = async (userQuery, dataType = "auto") => {
    try {
      setIsLoading(true);

      // Using the MCP server API endpoint: /ai/export/smart
      const response = await axios.post(
        `${process.env.REACT_APP_MCP_URL}/ai/export/smart`,
        {
          query: userQuery,
          data_type: dataType,
          format: "csv",
        },
        { responseType: "blob" }
      );

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "");
      const filename = `gsp_${dataType}_export_${timestamp}.csv`;

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      const successMessage = {
        id: Date.now(),
        type: "ai",
        content: `✅ **Data export successful!**\n\nFile: ${filename}\nType: ${dataType.replace("_", " ").toUpperCase()}\n📁 Check your Downloads folder`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);

      console.log("Export successful!", `Downloaded ${filename}`);
    } catch (error) {
      console.error("Smart Export Error:", error);
      const errorMessage = {
        id: Date.now(),
        type: "error",
        content: `❌ **Export Failed**\n\nError: ${error.response?.data?.message || error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      console.log(
        "Export failed",
        error.response?.data?.message || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Smart Download Button Component
  const SmartDownloadButton = ({ message }) => {
    const messageContent = message.content?.toLowerCase() || "";
    const lastUserMessage =
      messages.length > 0 ? messages[messages.length - 2]?.content || "" : "";

    const shouldShowExport =
      messageContent.includes("📊") ||
      messageContent.includes("💰") ||
      messageContent.includes("students") ||
      messageContent.length > 300 ||
      message.aiResponse?.data?.length > 0;

    if (!shouldShowExport) return null;

    return (
      <Box
        mt={3}
        p={3}
        bg="blue.50"
        borderRadius="xl"
        border="2px solid"
        borderColor="blue.200"
      >
        <HStack spacing={3} justify="center">
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => downloadSmartData(lastUserMessage, "general_data")}
            isLoading={isLoading}
            borderRadius="xl"
            shadow="md"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
          >
            <HStack spacing={2}>
              <Box
                w="16px"
                h="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                📥
              </Box>
              <Text>Download Data</Text>
            </HStack>
          </Button>
          <Text fontSize="sm" color="blue.700" fontWeight="500">
            Export as CSV file
          </Text>
        </HStack>
      </Box>
    );
  };

  // Enhanced Data Visualization Component
  const EnhancedDataVisualization = ({ aiResponse, userQuestion }) => {
    if (!aiResponse?.data && !aiResponse?.chart_config) {
      return null;
    }

    const { data, visualization_type, answer, format_decision } = aiResponse;
    const formatType =
      format_decision?.format_type || visualization_type || "table";

    switch (formatType) {
      case "simple_answer":
        return (
          <Box
            mt={4}
            p={6}
            bg="green.50"
            borderRadius="xl"
            textAlign="center"
            border="2px solid"
            borderColor="green.200"
          >
            <Text fontSize="3xl" fontWeight="bold" color="green.700" mb={3}>
              {answer}
            </Text>
            {data && data.length > 0 && (
              <Text fontSize="md" color="green.600" fontWeight="500">
                Based on {data.length} record{data.length !== 1 ? "s" : ""}
              </Text>
            )}
          </Box>
        );

      case "chart":
        const chartData = data?.slice(0, 20) || [];
        return (
          <Box
            mt={4}
            p={6}
            bg="blue.50"
            borderRadius="xl"
            border="2px solid"
            borderColor="blue.200"
          >
            <HStack justify="space-between" mb={6}>
              <VStack align="start" spacing={1}>
                <Text fontWeight="700" color="blue.800" fontSize="xl">
                  📊 Data Visualization
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Interactive chart with {chartData.length} data points
                </Text>
              </VStack>
              <Button
                size="md"
                leftIcon="💾"
                colorScheme="blue"
                variant="solid"
                onClick={() =>
                  downloadCSV(
                    chartData,
                    `chart_data_${new Date().toISOString().split("T")[0]}.csv`
                  )
                }
                borderRadius="xl"
                shadow="md"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                Export Data
              </Button>
            </HStack>

            <ProperChartComponent
              data={chartData}
              question={userQuestion}
              aiResponse={aiResponse}
            />

            {answer && (
              <Box
                mt={4}
                p={4}
                bg="white"
                borderRadius="xl"
                fontSize="md"
                border="1px solid"
                borderColor="blue.200"
              >
                <Text fontWeight="600" color="blue.700" mb={3} fontSize="lg">
                  📈 Analysis Summary:
                </Text>
                <Box>{renderFormattedText(answer)}</Box>
              </Box>
            )}
          </Box>
        );

      case "table":
      case "data_table":
        const tableData = data || [];
        return (
          <Box
            mt={4}
            p={6}
            bg="green.50"
            borderRadius="xl"
            border="2px solid"
            borderColor="green.200"
          >
            <HStack justify="space-between" mb={4}>
              <VStack align="start" spacing={1}>
                <Text fontWeight="700" color="green.700" fontSize="xl">
                  📋 Data Records
                </Text>
                <Text fontSize="md" color="green.600" fontWeight="500">
                  {tableData.length} records found
                </Text>
              </VStack>
              <Button
                size="md"
                leftIcon="💾"
                colorScheme="green"
                variant="solid"
                onClick={() =>
                  downloadCSV(
                    tableData,
                    `data_export_${new Date().toISOString().split("T")[0]}.csv`
                  )
                }
                borderRadius="xl"
                shadow="md"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                Export Table
              </Button>
            </HStack>

            {tableData.length > 0 && (
              <Box
                overflowX="auto"
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor="green.200"
              >
                <Box as="table" width="100%">
                  <Box as="thead" bg="green.600">
                    <Box as="tr">
                      {Object.keys(tableData[0] || {})
                        .slice(0, 5)
                        .map((header) => (
                          <Box
                            as="th"
                            key={header}
                            fontSize="sm"
                            py={4}
                            px={6}
                            color="white"
                            fontWeight="bold"
                            textTransform="uppercase"
                            textAlign="left"
                          >
                            {header.replace(/_/g, " ")}
                          </Box>
                        ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {tableData.slice(0, 10).map((row, index) => (
                      <Box as="tr" key={index} _hover={{ bg: "green.50" }}>
                        {Object.values(row)
                          .slice(0, 5)
                          .map((value, cellIndex) => (
                            <Box
                              as="td"
                              key={cellIndex}
                              fontSize="sm"
                              py={4}
                              px={6}
                              color="gray.700"
                            >
                              {value?.toString() || "N/A"}
                            </Box>
                          ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {tableData.length > 10 && (
              <Alert status="info" borderRadius="lg" mt={4}>
                <Text fontSize="sm" fontWeight="500">
                  Showing first 10 of {tableData.length} records • Download CSV
                  for complete dataset
                </Text>
              </Alert>
            )}
          </Box>
        );

      case "multi_analysis":
        return (
          <Box
            mt={4}
            p={6}
            bg="purple.50"
            borderRadius="xl"
            border="2px solid"
            borderColor="purple.200"
          >
            <Text fontWeight="700" color="purple.800" fontSize="xl" mb={4}>
              🔍 Comprehensive Analysis
            </Text>
            <Box>{renderFormattedText(answer)}</Box>
            {data && data.length > 0 && (
              <Button
                mt={4}
                leftIcon="💾"
                colorScheme="purple"
                onClick={() =>
                  downloadCSV(
                    data,
                    `analysis_${new Date().toISOString().split("T")[0]}.csv`
                  )
                }
              >
                Export Analysis
              </Button>
            )}
          </Box>
        );

      default:
        return (
          <Box mt={4} p={4} bg="gray.50" borderRadius="xl">
            <Text fontSize="sm" fontFamily="mono" color="gray.600">
              {JSON.stringify(data, null, 2)}
            </Text>
          </Box>
        );
    }
  };

  // Professional message component inspired by Claude/GPT
  const MessageBubble = ({ message, index }) => {
    const isUser = message.type === "user";
    const isError = message.type === "error";

    return (
      <Box mb={8}>
        <HStack
          justify={isUser ? "flex-end" : "flex-start"}
          spacing={3}
          align="flex-start"
          w="full"
        >
          {!isUser && (
            <Box
              w="32px"
              h="32px"
              borderRadius="md"
              bg={isError ? "red.50" : "gray.50"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="16px"
              flexShrink={0}
              border="1px solid"
              borderColor={isError ? "red.200" : "gray.200"}
            >
              {isError ? (
                <FaExclamationTriangle color="#e53e3e" />
              ) : (
                <FaRobot color="#4a5568" />
              )}
            </Box>
          )}

          <Box maxW="95%" minW="300px">
            {/* Professional message bubble */}
            <Box
              bg={isUser ? "gray.100" : isError ? "red.50" : "white"}
              color={isError ? "red.800" : "gray.800"}
              borderRadius="lg"
              border="1px solid"
              borderColor={
                isUser ? "gray.200" : isError ? "red.200" : "gray.200"
              }
              p={4}
              shadow="sm"
              _hover={{
                shadow: "md",
              }}
              transition="all 0.2s ease"
            >
              {/* Message content */}
              <Box
                fontSize="sm"
                lineHeight="1.6"
                color="gray.800"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {renderFormattedText(message.content)}
              </Box>

              {/* Enhanced Data Visualization for AI responses */}
              {!isUser && !isError && message.aiResponse && (
                <EnhancedDataVisualization
                  aiResponse={message.aiResponse}
                  userQuestion={message.content}
                />
              )}
            </Box>

            {/* Timestamp */}
            <Text
              fontSize="xs"
              color="gray.500"
              mt={2}
              ml={isUser ? "auto" : "0"}
              textAlign={isUser ? "right" : "left"}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Box>

          {isUser && (
            <Box
              w="32px"
              h="32px"
              borderRadius="md"
              bg="gray.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="16px"
              flexShrink={0}
              border="1px solid"
              borderColor="gray.200"
            >
              <FaUser color="#4a5568" />
            </Box>
          )}
        </HStack>
      </Box>
    );
  };

  // Simple header
  const ChatHeader = () => (
    <Box bg="white" p={3} borderBottom="1px solid" borderColor="gray.200">
      <HStack spacing={3}>
        <Box
          w="32px"
          h="32px"
          bg="blue.100"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
        >
          �
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontSize="lg" fontWeight="600" color="gray.800">
            AI Assistant
          </Text>
          <Text fontSize="sm" color="gray.500">
            Ready to help with your questions
          </Text>
        </VStack>
      </HStack>
    </Box>
  );

  // Welcome screen - step 5: add feature highlight cards
  const WelcomeScreen = () => (
    <VStack spacing={12} py={16} textAlign="center">
      <VStack spacing={6}>
        <Box
          w="80px"
          h="80px"
          bg="purple.500"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          shadow="xl"
          border="4px solid"
          borderColor="purple.200"
          fontSize="40px"
        >
          🧠
        </Box>

        <Text
          fontSize="4xl"
          fontWeight="bold"
          bgGradient="linear(to-r, blue.500, purple.500, pink.500)"
          bgClip="text"
        >
          Welcome to GSP Finance AI
        </Text>

        <Text fontSize="xl" color="gray.600" maxW="4xl" lineHeight="1.6">
          Your intelligent assistant for school management, financial analysis,
          and data insights. Ask natural questions and get instant, accurate
          answers with beautiful visualizations.
        </Text>

        <HStack spacing={6} fontSize="md" color="gray.500" fontWeight="500">
          <HStack spacing={2}>
            <Box fontSize="16px">🗄️</Box>
            <Text>MongoDB</Text>
          </HStack>
          <HStack spacing={2}>
            <Box fontSize="16px">📊</Box>
            <Text>Analytics</Text>
          </HStack>
          <HStack spacing={2}>
            <Box fontSize="16px">🧠</Box>
            <Text>Vector AI</Text>
          </HStack>
        </HStack>
      </VStack>

      {/* Feature Cards */}
      <Grid
        templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
        gap={8}
        w="full"
        maxW="6xl"
      >
        <Box
          bg="white"
          shadow="lg"
          borderRadius="xl"
          border="2px solid"
          borderColor="blue.200"
          p={8}
          cursor="default"
        >
          <VStack spacing={4}>
            <Box
              w="50px"
              h="50px"
              bg="blue.100"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="24px"
              color="blue.500"
            >
              📊
            </Box>
            <Text fontWeight="700" fontSize="lg" color="blue.700">
              Smart Analytics
            </Text>
            <Text fontSize="md" color="gray.600" lineHeight="1.6">
              AI-powered data analysis with interactive visualizations and
              export capabilities
            </Text>
          </VStack>
        </Box>

        <Box
          bg="white"
          shadow="lg"
          borderRadius="xl"
          border="2px solid"
          borderColor="green.200"
          p={8}
          cursor="default"
        >
          <VStack spacing={4}>
            <Box
              w="50px"
              h="50px"
              bg="green.100"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="24px"
              color="green.500"
            >
              🗄️
            </Box>
            <Text fontWeight="700" fontSize="lg" color="green.700">
              Live Data
            </Text>
            <Text fontSize="md" color="gray.600" lineHeight="1.6">
              Real-time access to student records, payments, and financial data
            </Text>
          </VStack>
        </Box>

        <Box
          bg="white"
          shadow="lg"
          borderRadius="xl"
          border="2px solid"
          borderColor="purple.200"
          p={8}
          cursor="default"
        >
          <VStack spacing={4}>
            <Box
              w="50px"
              h="50px"
              bg="purple.100"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="24px"
              color="purple.500"
            >
              🧠
            </Box>
            <Text fontWeight="700" fontSize="lg" color="purple.700">
              Vector Intelligence
            </Text>
            <Text fontSize="md" color="gray.600" lineHeight="1.6">
              Advanced semantic understanding for natural language queries
            </Text>
          </VStack>
        </Box>
      </Grid>
    </VStack>
  );

  // Professional Questions Sidebar with Grid Layout
  const QuestionsSidebar = () => (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header with gradient */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        borderRadius="lg"
        p={4}
        mb={4}
        shadow="md"
      >
        <HStack spacing={3}>
          <Box
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="whiteAlpha.200"
            borderRadius="full"
            color="white"
            fontSize="16px"
          >
            🚀
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="700" color="white">
              Quick Questions
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              Select to ask instantly
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Scrollable content */}
      <Box
        flex="1"
        overflowY="auto"
        pr={2}
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
          },
        }}
      >
        <VStack spacing={4} align="stretch">
          {[
            {
              category: "📊 Analytics",
              icon: "📈",
              questions: [
                "September payment details?",
                "Monthly financial breakdown",
                "Payment completion rate?",
                "Revenue analytics dashboard",
              ],
              color: "blue",
              gradient: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
            },
            {
              category: "👥 Students",
              icon: "🎓",
              questions: [
                "How many students enrolled?",
                "Outstanding balances overview",
                "Transport fee status?",
                "Student payment history",
              ],
              color: "green",
              gradient: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
            },
            {
              category: "💰 Finance",
              icon: "💎",
              questions: [
                "Monthly financial summary",
                "Payment statistics report",
                "Revenue trends analysis",
                "Outstanding amounts total",
              ],
              color: "purple",
              gradient: "linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)",
            },
            {
              category: "📋 Reports",
              icon: "📊",
              questions: [
                "Generate monthly report",
                "Export payment data",
                "Class-wise fee collection",
                "Defaulters list report",
              ],
              color: "orange",
              gradient: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
            },
          ].map((category, categoryIndex) => (
            <Box
              key={categoryIndex}
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              shadow="sm"
              _hover={{
                shadow: "md",
                transform: "translateY(-2px)",
                borderColor: `${category.color}.300`,
              }}
              transition="all 0.3s ease"
            >
              {/* Category header with gradient */}
              <Box bg={category.gradient} p={3}>
                <HStack spacing={3}>
                  <Box
                    w="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="whiteAlpha.200"
                    borderRadius="full"
                    fontSize="12px"
                  >
                    {category.icon}
                  </Box>
                  <Text
                    fontWeight="700"
                    color="white"
                    fontSize="sm"
                    letterSpacing="wide"
                  >
                    {category.category}
                  </Text>
                </HStack>
              </Box>

              {/* Questions list */}
              <Box p={3}>
                <VStack spacing={2} align="stretch">
                  {category.questions.map((question, qIndex) => (
                    <Button
                      key={qIndex}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      color="gray.700"
                      _hover={{
                        bg: `${category.color}.50`,
                        color: `${category.color}.700`,
                        transform: "translateX(4px)",
                      }}
                      borderRadius="lg"
                      onClick={() => {
                        setInputValue(question);
                        inputRef.current?.focus();
                      }}
                      fontSize="xs"
                      h="auto"
                      py={3}
                      px={3}
                      textAlign="left"
                      whiteSpace="normal"
                      fontWeight="500"
                      transition="all 0.2s ease"
                    >
                      <HStack spacing={3} w="full">
                        <Box
                          fontSize="10px"
                          color={`${category.color}.500`}
                          opacity={0.8}
                        >
                          ⭐
                        </Box>
                        <Text fontSize="xs" lineHeight="1.4">
                          {question}
                        </Text>
                      </HStack>
                    </Button>
                  ))}
                </VStack>
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* AI Tips footer */}
      <Box mt={4}>
        <Box
          bg="linear-gradient(135deg, #4fd1c7 0%, #06b6d4 100%)"
          borderRadius="xl"
          p={4}
          shadow="sm"
        >
          <VStack spacing={2} align="start">
            <HStack spacing={2}>
              <Box
                w="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="whiteAlpha.200"
                borderRadius="full"
                color="white"
                fontSize="10px"
              >
                💡
              </Box>
              <Text fontSize="sm" fontWeight="700" color="white">
                AI Tips
              </Text>
            </HStack>
            <Text fontSize="xs" color="whiteAlpha.900" lineHeight="1.4">
              Ask specific questions for better results. Try "Show me September
              payments for Grade 10 students" or "What's the total revenue this
              month?"
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced submit handler with MCP server endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setTypingIndicator(true);

    console.log("Message sent");

    try {
      // Using the MCP server API endpoint: /ai/chat
      const response = await axios.post(
        `${process.env.REACT_APP_MCP_URL}/ai/chat`,
        {
          message: userMessage.content,
          session_id: `session_${Date.now()}`,
        }
      );

      // Simulate typing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.response || "Query processed successfully",
        timestamp: new Date(),
        aiResponse: response.data,
        rawResults: response.data.data,
        count: response.data.data?.length,
        collection: response.data.collection,
        suggestions: response.data.suggestions || null,
        questionAnalysis: response.data.question_analysis || null,
        responseTime: response.data.response_time,
        toolsUsed: response.data.tools_used || [],
      };

      setMessages((prev) => [...prev, aiMessage]);

      console.log("AI Response received");
    } catch (error) {
      console.error("AI Chat Error:", error);

      let errorContent = "Failed to process query";
      if (error.response?.status === 404) {
        errorContent =
          "❌ **MCP Server Not Available**\n\nThe MCP AI server is not running or not accessible. Please check:\n• MCP server is running on port 8080\n• REACT_APP_MCP_URL is correctly set\n• CORS is properly configured";
      } else if (error.response?.status === 500) {
        errorContent = `❌ **Server Error**\n\nMCP server error: ${error.response?.data?.message || error.message}`;
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.code === "ERR_NETWORK"
      ) {
        errorContent =
          "❌ **Network Error**\n\nCannot connect to MCP server. Please check:\n• MCP server is running on localhost:8080\n• Network connectivity\n• Firewall settings";
      } else {
        errorContent = `❌ **Connection Error**\n\n${error.response?.data?.message || error.message}`;
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: errorContent,
        timestamp: new Date(),
        errorDetails: error.response?.data,
      };
      setMessages((prev) => [...prev, errorMessage]);

      console.log("Error occurred", "Failed to get AI response");
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  // Main render
  return (
    <Box
      h="100vh"
      bg="gray.50"
      display="flex"
      flexDirection="column"
      position="relative"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {/* Main Content Area */}
      <Flex flex="1" overflow="hidden">
        {/* Chat Area */}
        <VStack flex="1" spacing={0} h="100%" pb={20}>
          {/* Messages Container */}
          <Box
            flex="1"
            overflowY="auto"
            w="full"
            px={8}
            py={8}
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.2)",
              },
            }}
          >
            {messages.length === 0 ? (
              <VStack spacing={12} py={16} textAlign="center">
                <VStack spacing={6}>
                  <Box
                    w="80px"
                    h="80px"
                    bg="white"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="gray.700"
                    shadow="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    fontSize="32px"
                  >
                    <FaRobot color="#4a5568" />
                  </Box>

                  <Text
                    fontSize="4xl"
                    fontWeight="600"
                    color="gray.800"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    GSP Finance AI
                  </Text>

                  <Text
                    fontSize="lg"
                    color="gray.600"
                    maxW="4xl"
                    lineHeight="1.6"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    Your intelligent assistant for school management, financial
                    analysis, and data insights. Ask natural questions and get
                    instant, accurate answers with professional visualizations.
                  </Text>

                  {/* Powered by section moved here */}
                  <HStack
                    spacing={6}
                    fontSize="md"
                    color="gray.500"
                    fontWeight="500"
                  >
                    <HStack spacing={2}>
                      <Box fontSize="16px">🗄️</Box>
                      <Text>MongoDB</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box fontSize="16px">📊</Box>
                      <Text>Analytics</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box fontSize="16px">🧠</Box>
                      <Text>Vector AI</Text>
                    </HStack>
                  </HStack>
                </VStack>

                {/* Feature Cards */}
                <Grid
                  templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
                  gap={8}
                  w="full"
                  maxW="6xl"
                >
                  <Box
                    bg="white"
                    shadow="sm"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    p={6}
                    cursor="default"
                    _hover={{
                      shadow: "md",
                      borderColor: "gray.300",
                    }}
                    transition="all 0.2s ease"
                  >
                    <VStack spacing={4}>
                      <Box
                        w="48px"
                        h="48px"
                        bg="gray.50"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="20px"
                        color="gray.700"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <FaChartBar color="#4a5568" />
                      </Box>
                      <Text
                        fontWeight="600"
                        fontSize="lg"
                        color="gray.800"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Smart Analytics
                      </Text>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.6"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        AI-powered data analysis with interactive visualizations
                        and export capabilities
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    bg="white"
                    shadow="sm"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    p={6}
                    cursor="default"
                    _hover={{
                      shadow: "md",
                      borderColor: "gray.300",
                    }}
                    transition="all 0.2s ease"
                  >
                    <VStack spacing={4}>
                      <Box
                        w="48px"
                        h="48px"
                        bg="gray.50"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="20px"
                        color="gray.700"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <FaDatabase color="#4a5568" />
                      </Box>
                      <Text
                        fontWeight="600"
                        fontSize="lg"
                        color="gray.800"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Live Data
                      </Text>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.6"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Real-time access to student records, payments, and
                        financial data
                      </Text>
                    </VStack>
                  </Box>

                  <Box
                    bg="white"
                    shadow="sm"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    p={6}
                    cursor="default"
                    _hover={{
                      shadow: "md",
                      borderColor: "gray.300",
                    }}
                    transition="all 0.2s ease"
                  >
                    <VStack spacing={4}>
                      <Box
                        w="48px"
                        h="48px"
                        bg="gray.50"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="20px"
                        color="gray.700"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <FaBrain color="#4a5568" />
                      </Box>
                      <Text
                        fontWeight="600"
                        fontSize="lg"
                        color="gray.800"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Vector Intelligence
                      </Text>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        lineHeight="1.6"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Advanced semantic understanding for natural language
                        queries
                      </Text>
                    </VStack>
                  </Box>
                </Grid>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch" w="full" maxW="6xl" mx="auto">
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {typingIndicator && <AnimatedThinkingIndicator />}
                <div ref={messagesEndRef} />
              </VStack>
            )}
          </Box>
        </VStack>

        {/* Questions Sidebar */}
        <Box
          w="320px"
          h="100%"
          bg="white"
          borderLeft="1px solid"
          borderColor="gray.100"
          p={6}
          overflowY="auto"
          shadow="sm"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.1)",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.2)",
            },
          }}
        >
          <QuestionsSidebar />
        </Box>
      </Flex>

      {/* Floating Input */}
      <ChatInput
        inputRef={inputRef}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        messages={messages}
      />
    </Box>
  );
};

export default GPTLikeChat;
