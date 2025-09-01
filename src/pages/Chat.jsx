import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Spinner,
  Badge,
  Flex,
  Card,
  Textarea,
  Grid,
  Center,
  Code,
  Table,
  createToaster,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { Alert } from "../components/ui/alert";
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaSync,
  FaCopy,
  FaDownload,
  FaEye,
  FaCode,
  FaChartBar,
  FaDatabase,
  FaLightbulb,
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaExpand,
  FaCompress,
  FaSearch,
} from "react-icons/fa";
import axios from "axios";
import moment from "moment";

const toaster = createToaster();

const Chat = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [expandedQueries, setExpandedQueries] = useState(new Set());

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hooks
  const {
    isOpen: isResultModalOpen,
    onOpen: onResultModalOpen,
    onClose: onResultModalClose,
  } = useDisclosure();
  const [selectedResult, setSelectedResult] = useState(null);

  // Sample questions categorized by functionality
  const sampleQuestions = {
    "Financial Analytics": [
      "What is our total revenue for this academic year?",
      "Show me students with outstanding balances",
      "Calculate our monthly payment collection trends",
      "Which classes have the highest collection rates?",
      "Show me students who haven't paid September fees",
      "What's our average payment amount by payment type?",
    ],
    "Student Analytics": [
      "How many students are enrolled in each class?",
      "Show me all new students this year",
      "Which students joined after October?",
      "How many students use school transport?",
      "Show me students with special needs",
      "Which classes are over capacity?",
    ],
    "Academic Management": [
      "Show me class distribution by education level",
      "Which academic year has the most students?",
      "Show me student enrollment trends by month",
      "What's the average class size?",
      "How many sections do we have?",
      "Show me the current academic year statistics",
    ],
    "Advanced Queries": [
      "Compare payment patterns between new and returning students",
      "Show me the correlation between class size and payment completion",
      "Analyze payment method preferences by class",
      "Which students have incomplete contact information?",
      "Show me expense vs revenue analysis for this year",
      "Calculate our profit margins by academic period",
    ],
  };

  // Check system health
  const checkSystemHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/copilot/health`
      );

      setSystemHealth(response.data);

      if (response.data.status === "healthy") {
        toaster.create({
          title: "AI System Ready",
          description: "OpenAI GPT-4o service is online",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error checking system health:", error);
      setSystemHealth({
        status: "error",
        service: "OpenAI GPT-4o MongoDB Query Service",
        error: error.message || "Failed to connect to AI service",
      });

      toaster.create({
        title: "AI System Error",
        description: "Unable to connect to AI service",
        status: "error",
        duration: 5000,
      });
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    const initializeApp = async () => {
      await checkSystemHealth();
      inputRef.current?.focus();
    };
    initializeApp();
  }, [checkSystemHealth]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Send message to AI
  const sendMessage = async () => {
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

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/copilot/query`,
        {
          question: userMessage.content,
          execute: true,
        }
      );

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: response.data.explanation,
          query: response.data.generated_query,
          collection: response.data.collection,
          results: response.data.results,
          count: response.data.count,
          model_used: response.data.model_used,
          processing_time: response.data.processing_time_seconds,
          timestamp: new Date(),
          success: true,
        };

        setMessages((prev) => [...prev, aiMessage]);

        toaster.create({
          title: "Query Executed Successfully",
          description: `Found ${response.data.count} results in ${response.data.processing_time_seconds || "N/A"}s`,
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error(response.data.error || "Failed to process query");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content:
          error.response?.data?.error ||
          error.message ||
          "Failed to process your request",
        timestamp: new Date(),
        success: false,
      };

      setMessages((prev) => [...prev, errorMessage]);

      toaster.create({
        title: "Query Failed",
        description: error.response?.data?.error || "Please try again",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);

      toaster.create({
        title: "Copied to clipboard",
        status: "success",
        duration: 2000,
      });

      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toaster.create({
        title: "Failed to copy",
        status: "error",
        duration: 2000,
      });
    }
  };

  // Use sample question
  const handleSampleQuestion = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setExpandedQueries(new Set());

    toaster.create({
      title: "Chat cleared",
      status: "info",
      duration: 2000,
    });
  };

  // Toggle query expansion
  const toggleQueryExpansion = (messageId) => {
    const newExpanded = new Set(expandedQueries);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedQueries(newExpanded);
  };

  // View results in modal
  const viewResultsModal = (results, title) => {
    setSelectedResult({ results, title });
    onResultModalOpen();
  };

  // Download results as JSON
  const downloadResults = (results, filename) => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename || "query_results"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format query for display
  const formatQuery = (query) => {
    try {
      return JSON.stringify(query, null, 2);
    } catch {
      return JSON.stringify(query);
    }
  };

  // Render system status indicator
  const renderSystemStatus = () => {
    if (healthLoading) {
      return (
        <HStack spacing={2}>
          <Spinner size="sm" />
          <span style={{ fontSize: "14px", color: "#6B7280" }}>
            Checking AI status...
          </span>
        </HStack>
      );
    }

    const isHealthy = systemHealth?.status === "healthy";

    return (
      <HStack spacing={2}>
        <Box
          w={3}
          h={3}
          borderRadius="full"
          bg={isHealthy ? "green.400" : "red.400"}
          animation={isHealthy ? "pulse 2s infinite" : "none"}
        />
        <Text fontSize="sm" color={isHealthy ? "green.600" : "red.600"}>
          AI {isHealthy ? "Online" : "Offline"}
        </Text>
        {systemHealth?.api_configured && (
          <Badge colorScheme="blue" variant="subtle" fontSize="xs">
            GPT-4o
          </Badge>
        )}
        <IconButton
          size="xs"
          variant="ghost"
          icon={<FaSync />}
          onClick={checkSystemHealth}
          title="Refresh status"
        />
      </HStack>
    );
  };

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

                <VStack align="end" spacing={2}>
                  {renderSystemStatus()}
                  <HStack spacing={2}>
                    <Tooltip label="Clear conversation">
                      <IconButton
                        size="sm"
                        variant="outline"
                        icon={<FaTrash />}
                        onClick={clearChat}
                        isDisabled={messages.length === 0}
                        colorScheme="red"
                      />
                    </Tooltip>
                    <Tooltip label="Refresh AI status">
                      <IconButton
                        size="sm"
                        variant="outline"
                        icon={<FaSync />}
                        onClick={checkSystemHealth}
                        isLoading={healthLoading}
                      />
                    </Tooltip>
                  </HStack>
                </VStack>
              </HStack>
            </CardHeader>
          </Card>

          {/* Main Chat Area */}
          <Box flex={1} w="full" position="relative">
            <Card h="full" variant="outline">
              <CardBody p={0} h="full">
                <Flex direction="column" h="full">
                  {/* Messages Area */}
                  <Box
                    flex={1}
                    overflowY="auto"
                    p={4}
                    css={{
                      "&::-webkit-scrollbar": { width: "4px" },
                      "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#cbd5e0",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    {messages.length === 0 ? (
                      <Center h="full">
                        <VStack spacing={8} maxW="4xl" mx="auto">
                          <VStack spacing={4} textAlign="center">
                            <Avatar
                              size="2xl"
                              bg="blue.500"
                              icon={<FaRobot fontSize="3rem" />}
                            />
                            <Heading size="lg" color="gray.700">
                              Welcome to GSP Finance AI
                            </Heading>
                            <Text color="gray.600" fontSize="lg" maxW="md">
                              Ask me anything about your students, payments,
                              classes, or financial data. I can generate and
                              execute MongoDB queries to give you insights.
                            </Text>
                          </VStack>

                          {/* Sample Questions */}
                          <VStack spacing={6} w="full">
                            <Heading size="md" color="gray.700">
                              Try these sample questions:
                            </Heading>

                            <Grid
                              templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                              gap={6}
                              w="full"
                            >
                              {Object.entries(sampleQuestions).map(
                                ([category, questions]) => (
                                  <GridItem key={category}>
                                    <Card variant="outline" h="full">
                                      <CardHeader pb={2}>
                                        <HStack spacing={2}>
                                          <Box color="blue.500" boxSize={4}>
                                            {category.includes("Financial") ? (
                                              <FaChartBar />
                                            ) : category.includes("Student") ? (
                                              <FaUser />
                                            ) : category.includes(
                                                "Academic"
                                              ) ? (
                                              <FaDatabase />
                                            ) : (
                                              <FaLightbulb />
                                            )}
                                          </Box>
                                          <Heading size="sm" color="gray.700">
                                            {category}
                                          </Heading>
                                        </HStack>
                                      </CardHeader>
                                      <CardBody pt={0}>
                                        <VStack spacing={2} align="stretch">
                                          {questions
                                            .slice(0, 3)
                                            .map((question, idx) => (
                                              <Button
                                                key={idx}
                                                size="sm"
                                                variant="ghost"
                                                leftIcon={<FaQuestionCircle />}
                                                onClick={() =>
                                                  handleSampleQuestion(question)
                                                }
                                                textAlign="left"
                                                justifyContent="flex-start"
                                                h="auto"
                                                py={2}
                                                px={3}
                                                whiteSpace="normal"
                                                wordWrap="break-word"
                                                _hover={{ bg: "blue.50" }}
                                              >
                                                <Text
                                                  fontSize="xs"
                                                  noOfLines={2}
                                                >
                                                  {question}
                                                </Text>
                                              </Button>
                                            ))}
                                        </VStack>
                                      </CardBody>
                                    </Card>
                                  </GridItem>
                                )
                              )}
                            </Grid>
                          </VStack>
                        </VStack>
                      </Center>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            onCopy={copyToClipboard}
                            onToggleQuery={toggleQueryExpansion}
                            onViewResults={viewResultsModal}
                            onDownloadResults={downloadResults}
                            isQueryExpanded={expandedQueries.has(message.id)}
                            copiedMessageId={copiedMessageId}
                            formatQuery={formatQuery}
                          />
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                          <HStack spacing={4} align="start">
                            <Avatar
                              size="md"
                              bg="blue.500"
                              icon={<FaRobot />}
                            />
                            <Card variant="outline" flex={1}>
                              <CardBody>
                                <VStack spacing={3} align="start">
                                  <HStack spacing={2}>
                                    <Spinner size="sm" />
                                    <Text fontSize="sm" color="gray.600">
                                      AI is processing your request...
                                    </Text>
                                  </HStack>
                                  <SkeletonText noOfLines={3} spacing="4" />
                                </VStack>
                              </CardBody>
                            </Card>
                          </HStack>
                        )}

                        <div ref={messagesEndRef} />
                      </VStack>
                    )}
                  </Box>

                  {/* Input Area */}
                  <Box p={4} borderTop="1px" borderColor="gray.200">
                    <HStack spacing={3}>
                      <Textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask me anything about your financial data..."
                        resize="none"
                        rows={1}
                        minH="40px"
                        maxH="120px"
                        isDisabled={isLoading}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px blue.500",
                        }}
                      />
                      <Button
                        colorScheme="blue"
                        leftIcon={<FaPaperPlane />}
                        onClick={sendMessage}
                        isLoading={isLoading}
                        isDisabled={!inputValue.trim()}
                        loadingText="Processing"
                        h="40px"
                        px={6}
                      >
                        Send
                      </Button>
                    </HStack>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </Container>

      {/* Results Dialog */}
      <DialogRoot
        open={isResultModalOpen}
        onOpenChange={(e) =>
          e.open ? onResultModalOpen() : onResultModalClose()
        }
        size="xl"
      >
        <DialogContent maxH="80vh">
          <DialogHeader>
            <HStack justify="space-between">
              <Text>{selectedResult?.title || "Query Results"}</Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FaDownload />}
                  onClick={() =>
                    downloadResults(selectedResult?.results, "query_results")
                  }
                >
                  Download JSON
                </Button>
              </HStack>
            </HStack>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody overflowY="auto">
            {selectedResult?.results && (
              <ResultsTable results={selectedResult.results} />
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

// Message Bubble Component
const MessageBubble = ({
  message,
  onCopy,
  onToggleQuery,
  onViewResults,
  onDownloadResults,
  isQueryExpanded,
  copiedMessageId,
  formatQuery,
}) => {
  if (message.type === "user") {
    return (
      <HStack spacing={4} align="start" justify="flex-end">
        <Card variant="solid" bg="blue.500" color="white" maxW="70%">
          <CardBody py={3} px={4}>
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {message.content}
            </Text>
            <Text fontSize="xs" opacity={0.8} mt={2}>
              {moment(message.timestamp).format("HH:mm")}
            </Text>
          </CardBody>
        </Card>
        <Avatar size="md" bg="blue.500" icon={<FaUser />} />
      </HStack>
    );
  }

  if (message.type === "error") {
    return (
      <HStack spacing={4} align="start">
        <Avatar size="md" bg="red.500" icon={<FaExclamationTriangle />} />
        <Alert status="error" title={message.content} />
      </HStack>
    );
  }

  // AI Message
  return (
    <HStack spacing={4} align="start">
      <Avatar size="md" bg="blue.500" icon={<FaRobot />} />
      <Card variant="outline" flex={1} maxW="85%">
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Message Header */}
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1} flex={1}>
                <HStack spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                    AI Assistant
                  </Text>
                  {message.model_used && (
                    <Badge variant="outline" colorScheme="blue" fontSize="xs">
                      {message.model_used}
                    </Badge>
                  )}
                  {message.processing_time && (
                    <Badge variant="outline" colorScheme="green" fontSize="xs">
                      <HStack spacing={1}>
                        <FaClock />
                        <Text>{message.processing_time}s</Text>
                      </HStack>
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {moment(message.timestamp).format("HH:mm:ss")}
                </Text>
              </VStack>

              <HStack spacing={1}>
                <Tooltip label="Copy response">
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={
                      copiedMessageId === message.id ? (
                        <FaCheckCircle />
                      ) : (
                        <FaCopy />
                      )
                    }
                    onClick={() => onCopy(message.content, message.id)}
                    colorScheme={
                      copiedMessageId === message.id ? "green" : "gray"
                    }
                  />
                </Tooltip>
                {message.query && (
                  <Tooltip label="Toggle query details">
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={isQueryExpanded ? <FaCompress /> : <FaExpand />}
                      onClick={() => onToggleQuery(message.id)}
                    />
                  </Tooltip>
                )}
              </HStack>
            </HStack>
            {/* Main Response */}
            <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
              {message.content}
            </Text>
            {/* Results Summary */}
            {message.results && message.count !== undefined && (
              <Alert
                status="success"
                title={`Found ${message.count} results from ${message.collection} collection`}
              >
                <HStack spacing={2}>
                  {message.count > 0 && (
                    <>
                      <Button
                        size="xs"
                        leftIcon={<FaEye />}
                        onClick={() =>
                          onViewResults(
                            message.results,
                            `Query Results (${message.count} items)`
                          )
                        }
                      >
                        View Results
                      </Button>
                      <Button
                        size="xs"
                        leftIcon={<FaDownload />}
                        onClick={() =>
                          onDownloadResults(message.results, "ai_query_results")
                        }
                      >
                        Download
                      </Button>
                    </>
                  )}
                </HStack>
              </Alert>
            )}{" "}
            {/* Query Details (Expandable) */}
            {message.query && (
              <Accordion allowToggle index={isQueryExpanded ? 0 : -1}>
                <AccordionItem border="none">
                  <AccordionItemTrigger
                    p={0}
                    onClick={() => onToggleQuery(message.id)}
                    _hover={{ bg: "transparent" }}
                  >
                    <HStack spacing={2} flex={1} textAlign="left">
                      <FaCode />
                      <Text fontSize="sm" fontWeight="medium">
                        MongoDB Query
                      </Text>
                    </HStack>
                  </AccordionItemTrigger>
                  <AccordionItemContent p={0} pt={3}>
                    <Box
                      bg="gray.900"
                      borderRadius="md"
                      p={3}
                      overflow="auto"
                      maxH="300px"
                    >
                      <Code
                        fontSize="xs"
                        color="green.300"
                        whiteSpace="pre-wrap"
                      >
                        {formatQuery(message.query)}
                      </Code>
                    </Box>
                    <HStack spacing={2} mt={2}>
                      <Button
                        size="xs"
                        leftIcon={<FaCopy />}
                        onClick={() =>
                          onCopy(
                            formatQuery(message.query),
                            `${message.id}_query`
                          )
                        }
                      >
                        Copy Query
                      </Button>
                      <Badge variant="outline" fontSize="xs">
                        Collection: {message.collection}
                      </Badge>
                    </HStack>
                  </AccordionItemContent>
                </AccordionItem>
              </Accordion>
            )}
          </VStack>
        </CardBody>
      </Card>
    </HStack>
  );
};

// Results Table Component
const ResultsTable = ({ results }) => {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <FaSearch size={48} color="gray.400" />
          <Text color="gray.500">No results to display</Text>
        </VStack>
      </Center>
    );
  }

  const headers = Object.keys(results[0]).filter((key) => key !== "_id");
  const displayResults = results.slice(0, 100); // Limit display for performance

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">
          Showing {displayResults.length} of {results.length} results
        </Text>
        {results.length > 100 && (
          <Badge colorScheme="orange" variant="outline">
            Limited to first 100 rows
          </Badge>
        )}
      </HStack>

      <Box maxH="400px" overflowY="auto">
        <Table size="sm" variant="simple">
          <TableHeader position="sticky" top={0} bg="white" zIndex={1}>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  fontSize="xs"
                  textTransform="capitalize"
                >
                  {header.replace(/_/g, " ")}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayResults.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header} fontSize="xs">
                    {typeof row[header] === "object" && row[header] !== null
                      ? JSON.stringify(row[header])
                      : String(row[header] || "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </VStack>
  );
};

export default Chat;
