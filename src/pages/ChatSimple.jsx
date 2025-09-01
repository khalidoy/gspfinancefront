import React, { useState, useEffect, useRef } from "react";
import { Box, VStack, HStack, Button, Textarea } from "@chakra-ui/react";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";

const ChatSimple = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sample questions categorized by functionality
  const sampleQuestions = {
    "Student Analytics": [
      "How many students are in each class?",
      "Show me all active students in Grade 5",
      "Which students enrolled this year?",
      "List students who haven't provided contact information",
    ],
    "Financial Analytics": [
      "What is our total revenue this month?",
      "Show me students who haven't paid September fees",
      "Calculate average payment amount by payment type",
      "Show monthly revenue trends for this academic year",
    ],
    "Class Management": [
      "Which classes are over capacity?",
      "Show class utilization rates",
      "How many students are in primary vs secondary education?",
      "Which classes have the most new students?",
    ],
    "Advanced Analytics": [
      "Show me the top 5 classes by total tuition collected",
      "Which students have the highest outstanding balances?",
      "Calculate the average class size by education level",
      "Show payment collection efficiency by month",
    ],
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check system health on component mount
  useEffect(() => {
    checkSystemHealth();
    loadExamples();
  }, []);

  const checkSystemHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await axios.get("/copilot/health");
      setSystemHealth(response.data);
    } catch (error) {
      console.error("Health check failed:", error);
      setSystemHealth({ status: "error", error: error.message });
    } finally {
      setHealthLoading(false);
    }
  };

  const loadExamples = async () => {
    // Removed examples loading for simplicity
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

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
      const response = await axios.post("/copilot/query", {
        question: userMessage.content,
        execute: true,
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.success
          ? response.data.explanation ||
            response.data.response ||
            `Successfully executed query and found ${response.data.count || 0} results`
          : response.data.error || "Query execution failed",
        timestamp: new Date(),
        query: response.data.generated_query,
        results: response.data.results,
        count: response.data.count,
        collection: response.data.collection,
        processing_time: response.data.processing_time,
        success: response.data.success,
        error: response.data.error,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content:
          error.response?.data?.error ||
          error.message ||
          "Failed to process query",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSampleQuestion = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const downloadResults = (results, filename) => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "query_results.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const viewResults = (results, title) => {
    // Simplified results viewing - just log for now
    console.log("Results:", { results, title });
  };

  const renderSystemStatus = () => {
    if (healthLoading) {
      return (
        <HStack spacing={2}>
          <Spinner size="xs" />
          <span style={{ fontSize: "14px", color: "#6B7280" }}>
            Checking AI status...
          </span>
        </HStack>
      );
    }

    const isHealthy =
      systemHealth?.status === "healthy" && systemHealth?.api_configured;

    return (
      <HStack spacing={2}>
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg={isHealthy ? "green.500" : "red.500"}
        />
        <span
          style={{ fontSize: "14px", color: isHealthy ? "#059669" : "#DC2626" }}
        >
          {isHealthy ? "AI Ready" : "AI Unavailable"}
        </span>
      </HStack>
    );
  };

  const MessageBubble = ({ message }) => {
    if (message.type === "user") {
      return (
        <HStack spacing={4} align="start" justify="flex-end">
          <Box bg="blue.500" color="white" maxW="70%" p={4} borderRadius="lg">
            <div style={{ fontSize: "14px", whiteSpace: "pre-wrap" }}>
              {message.content}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "8px" }}>
              {moment(message.timestamp).format("HH:mm")}
            </div>
          </Box>
          <Avatar size="sm" bg="blue.500" icon={<FaUser />} />
        </HStack>
      );
    }

    if (message.type === "error") {
      return (
        <HStack spacing={4} align="start">
          <Avatar size="sm" bg="red.500" icon={<FaExclamationTriangle />} />
          <Alert status="error" title={message.content} />
        </HStack>
      );
    }

    // AI Message
    return (
      <HStack spacing={4} align="start">
        <Avatar size="sm" bg="green.500" icon={<FaRobot />} />
        <VStack align="start" spacing={3} flex={1}>
          <Box bg="gray.50" p={4} borderRadius="lg" w="full">
            <HStack justify="space-between" mb={2}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#2563EB",
                }}
              >
                AI Assistant
              </span>
              <HStack spacing={1}>
                {message.processing_time && (
                  <Badge variant="outline" size="sm">
                    <FaClock size="10" />
                    <span style={{ marginLeft: "4px" }}>
                      {message.processing_time}s
                    </span>
                  </Badge>
                )}
              </HStack>
            </HStack>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {moment(message.timestamp).format("MMM DD, YYYY HH:mm")}
            </div>
          </Box>

          <div
            style={{
              fontSize: "14px",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {message.content}
          </div>

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
                        viewResults(
                          message.results,
                          `Query Results (${message.count} items)`
                        )
                      }
                    >
                      View
                    </Button>
                    <Button
                      size="xs"
                      leftIcon={<FaDownload />}
                      onClick={() =>
                        downloadResults(
                          message.results,
                          `results_${Date.now()}.json`
                        )
                      }
                    >
                      Download
                    </Button>
                  </>
                )}
              </HStack>
            </Alert>
          )}

          {/* Query Details */}
          {message.query && (
            <Box w="full">
              <details>
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Generated MongoDB Query
                </summary>
                <Box mt={2} p={3} bg="gray.100" borderRadius="md">
                  <Code display="block" whiteSpace="pre-wrap" fontSize="sm">
                    {JSON.stringify(message.query, null, 2)}
                  </Code>
                  <HStack mt={2}>
                    <Button
                      size="xs"
                      leftIcon={<FaCopy />}
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(message.query, null, 2),
                          message.id
                        )
                      }
                    >
                      {copiedMessageId === message.id
                        ? "Copied!"
                        : "Copy Query"}
                    </Button>
                  </HStack>
                </Box>
              </details>
            </Box>
          )}
        </VStack>
      </HStack>
    );
  };

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={6} h="calc(100vh - 120px)">
          {/* Header */}
          <Box w="full" bg="white" p={6} borderRadius="lg" shadow="sm">
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <Avatar
                  size="lg"
                  bg="blue.500"
                  icon={<FaRobot fontSize="2rem" />}
                />
                <VStack align="start" spacing={1}>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#1F2937",
                    }}
                  >
                    GSP Finance AI Assistant
                  </h1>
                  <div style={{ color: "#6B7280", fontSize: "16px" }}>
                    Intelligent financial analytics powered by GPT-4o
                  </div>
                </VStack>
              </HStack>

              <VStack align="end" spacing={2}>
                {renderSystemStatus()}
                <HStack spacing={2}>
                  <IconButton
                    size="sm"
                    variant="outline"
                    icon={<FaTrash />}
                    onClick={clearChat}
                    disabled={messages.length === 0}
                    colorScheme="red"
                    title="Clear conversation"
                  />
                  <IconButton
                    size="sm"
                    variant="outline"
                    icon={<FaSync />}
                    onClick={checkSystemHealth}
                    loading={healthLoading}
                    title="Refresh AI status"
                  />
                </HStack>
              </VStack>
            </HStack>
          </Box>

          {/* Main Chat Area */}
          <Box flex={1} w="full" position="relative">
            <Box h="full" bg="white" borderRadius="lg" shadow="sm">
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
                          <h2 style={{ fontSize: "24px", color: "#374151" }}>
                            Welcome to GSP Finance AI
                          </h2>
                          <div
                            style={{
                              color: "#6B7280",
                              fontSize: "18px",
                              maxWidth: "400px",
                            }}
                          >
                            Ask me anything about your students, payments,
                            classes, or financial data. I can generate and
                            execute MongoDB queries to give you insights.
                          </div>
                        </VStack>

                        {/* Sample Questions */}
                        <VStack spacing={6} w="full">
                          <h3 style={{ fontSize: "18px", color: "#374151" }}>
                            Try these sample questions:
                          </h3>

                          <Grid
                            templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                            gap={6}
                            w="full"
                          >
                            {Object.entries(sampleQuestions).map(
                              ([category, questions]) => (
                                <GridItem key={category}>
                                  <Box
                                    bg="white"
                                    p={4}
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    h="full"
                                  >
                                    <HStack spacing={2} mb={3}>
                                      <Box color="blue.500" boxSize={4}>
                                        {category.includes("Financial") ? (
                                          <FaChartBar />
                                        ) : category.includes("Student") ? (
                                          <FaUser />
                                        ) : category.includes("Class") ? (
                                          <FaDatabase />
                                        ) : (
                                          <FaLightbulb />
                                        )}
                                      </Box>
                                      <h4
                                        style={{
                                          fontSize: "16px",
                                          color: "#374151",
                                        }}
                                      >
                                        {category}
                                      </h4>
                                    </HStack>
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
                                            <div style={{ fontSize: "12px" }}>
                                              {question}
                                            </div>
                                          </Button>
                                        ))}
                                    </VStack>
                                  </Box>
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
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      {isLoading && (
                        <HStack spacing={4} align="start">
                          <Avatar size="sm" bg="blue.500" icon={<FaRobot />} />
                          <HStack spacing={2}>
                            <Spinner size="sm" />
                            <span
                              style={{ fontSize: "14px", color: "#6B7280" }}
                            >
                              Analyzing your question and generating MongoDB
                              query...
                            </span>
                          </HStack>
                        </HStack>
                      )}
                      <div ref={messagesEndRef} />
                    </VStack>
                  )}
                </Box>

                {/* Input Area */}
                <Box p={4} borderTop="1px solid" borderColor="gray.200">
                  <HStack spacing={3}>
                    <Textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about students, payments, classes, or any financial data..."
                      resize="none"
                      minH="20px"
                      disabled={isLoading}
                    />
                    <Button
                      leftIcon={<FaPaperPlane />}
                      onClick={sendMessage}
                      isLoading={isLoading}
                      disabled={!inputValue.trim()}
                      colorScheme="blue"
                      size="lg"
                    >
                      Send
                    </Button>
                  </HStack>
                </Box>
              </Flex>
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChatSimple;
