import React, { useState, useEffect, useRef } from "react";
import { Box, VStack, HStack, Button, Textarea } from "@chakra-ui/react";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";
import axios from "axios";

const ChatSimpleBasic = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to format and display results data
  const formatResults = (results, question) => {
    if (!results || results.length === 0) return null;

    const lowerQuestion = question.toLowerCase();

    // Handle total count questions (total students, total revenue, etc.)
    if (
      lowerQuestion.includes("total") ||
      lowerQuestion.includes("number of") ||
      (lowerQuestion.includes("how many") &&
        !lowerQuestion.includes("each") &&
        !lowerQuestion.includes("per"))
    ) {
      const result = results[0];
      if (result) {
        const count =
          result.total_students ||
          result.new_students_count ||
          result.total ||
          result.count ||
          Object.values(result).find((v) => typeof v === "number") ||
          0;
        const label = lowerQuestion.includes("student")
          ? lowerQuestion.includes("new")
            ? "New Students"
            : "Total Students"
          : lowerQuestion.includes("revenue")
            ? "Total Revenue"
            : lowerQuestion.includes("payment")
              ? "Total Payments"
              : "Total Count";

        return (
          <Box mt={3} p={4} bg="blue.50" borderRadius="md" textAlign="center">
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1E40AF",
                marginBottom: "8px",
              }}
            >
              {typeof count === "number" ? count.toLocaleString() : count}
            </div>
            <div style={{ fontWeight: "600", color: "#1E40AF" }}>{label}</div>
          </Box>
        );
      }
    }

    // Handle "how many students in each class" questions
    if (
      lowerQuestion.includes("how many students") &&
      (lowerQuestion.includes("class") || lowerQuestion.includes("each"))
    ) {
      return (
        <Box mt={3} p={3} bg="blue.50" borderRadius="md">
          <div
            style={{ fontWeight: "600", marginBottom: "8px", color: "#1E40AF" }}
          >
            📊 Students per Class:
          </div>
          {results.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                borderBottom:
                  index < results.length - 1 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <span>{item.class_name || item._id || "Unknown Class"}</span>
              <strong>{item.student_count || item.count || 0} students</strong>
            </div>
          ))}
        </Box>
      );
    }

    // Handle revenue/payment questions (not totals)
    if (
      (lowerQuestion.includes("revenue") ||
        lowerQuestion.includes("payment")) &&
      !lowerQuestion.includes("total")
    ) {
      return (
        <Box mt={3} p={3} bg="green.50" borderRadius="md">
          <div
            style={{ fontWeight: "600", marginBottom: "8px", color: "#059669" }}
          >
            💰 Financial Data:
          </div>
          {results.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                borderBottom:
                  index < results.length - 1 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <span>{item.month || item._id || "Period"}</span>
              <strong>${item.total_revenue || item.amount || 0}</strong>
            </div>
          ))}
        </Box>
      );
    }

    // Handle student lists (show me students who...)
    if (
      lowerQuestion.includes("show") &&
      lowerQuestion.includes("student") &&
      !lowerQuestion.includes("how many") &&
      !lowerQuestion.includes("number of")
    ) {
      return (
        <Box mt={3} p={3} bg="purple.50" borderRadius="md">
          <div
            style={{ fontWeight: "600", marginBottom: "8px", color: "#7C3AED" }}
          >
            👥 Student List ({results.length} students):
          </div>
          {results.slice(0, 10).map((item, index) => {
            // Use correct field names from models_new.py
            const firstName = item.first_name || "";
            const lastName = item.last_name || "";
            const fullName =
              item.full_name ||
              `${firstName} ${lastName}`.trim() ||
              "Unknown Student";
            const studentId = item.student_id || item._id || "N/A";
            const className =
              item.school_class?.class_name || item.class_name || "";

            return (
              <div
                key={index}
                style={{
                  padding: "6px 0",
                  borderBottom:
                    index < Math.min(results.length, 10) - 1
                      ? "1px solid #E5E7EB"
                      : "none",
                }}
              >
                <div style={{ fontWeight: "500", fontSize: "14px" }}>
                  {fullName}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    marginTop: "2px",
                  }}
                >
                  {className && `Class: ${className} • `}ID: {studentId}
                </div>
              </div>
            );
          })}
          {results.length > 10 && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#6B7280",
                fontStyle: "italic",
              }}
            >
              ... and {results.length - 10} more students
            </div>
          )}
        </Box>
      );
    }

    // Generic data display for other queries
    return (
      <Box mt={3} p={3} bg="gray.50" borderRadius="md">
        <div
          style={{ fontWeight: "600", marginBottom: "8px", color: "#374151" }}
        >
          📋 Query Results:
        </div>
        {results.slice(0, 5).map((item, index) => (
          <Box key={index} p={2} bg="white" borderRadius="sm" mb={2}>
            <pre
              style={{ fontSize: "12px", whiteSpace: "pre-wrap", margin: 0 }}
            >
              {JSON.stringify(item, null, 2)}
            </pre>
          </Box>
        ))}
        {results.length > 5 && (
          <div style={{ fontSize: "12px", color: "#6B7280" }}>
            ... and {results.length - 5} more results
          </div>
        )}
      </Box>
    );
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/copilot/query`,
        {
          question: userMessage.content,
          execute: true,
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.success
          ? response.data.explanation ||
            `Successfully found ${response.data.count || 0} results`
          : response.data.error || "Query execution failed",
        timestamp: new Date(),
        results: response.data.results,
        count: response.data.count,
        collection: response.data.collection,
        rawResults: response.data.results, // Store raw results for data display
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: error.response?.data?.error || "Failed to process query",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} maxW="4xl" mx="auto">
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Simple Chat Test
        </h1>

        <Box
          w="full"
          bg="white"
          p={4}
          borderRadius="lg"
          minH="400px"
          maxH="600px"
          overflowY="auto"
        >
          <VStack spacing={4} align="stretch">
            {messages.length === 0 ? (
              <Box textAlign="center" py={8}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
                <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                  GSP Finance AI Assistant
                </h2>
                <p style={{ color: "#666" }}>
                  Ask me about your students, payments, classes, or financial
                  data!
                </p>
              </Box>
            ) : (
              messages.map((message) => (
                <HStack
                  key={message.id}
                  justify={message.type === "user" ? "flex-end" : "flex-start"}
                  align="start"
                  spacing={3}
                >
                  {message.type !== "user" && (
                    <Box
                      bg={message.type === "error" ? "red.500" : "green.500"}
                      color="white"
                      borderRadius="full"
                      w={8}
                      h={8}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                    >
                      {message.type === "error" ? "⚠️" : <FaRobot />}
                    </Box>
                  )}

                  <Box
                    p={3}
                    bg={
                      message.type === "user"
                        ? "blue.500"
                        : message.type === "error"
                          ? "red.50"
                          : "gray.50"
                    }
                    color={message.type === "user" ? "white" : "black"}
                    borderRadius="lg"
                    maxW="75%"
                    position="relative"
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        marginBottom: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {message.type === "user"
                        ? "You"
                        : message.type === "error"
                          ? "Error"
                          : "AI Assistant"}
                    </div>
                    <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
                      {message.content}
                    </p>

                    {/* Show actual data results for AI messages */}
                    {message.type === "ai" &&
                      message.rawResults &&
                      message.rawResults.length > 0 &&
                      formatResults(
                        message.rawResults,
                        messages.find(
                          (m) => m.type === "user" && m.id < message.id
                        )?.content || ""
                      )}

                    {/* Show results summary for AI messages */}
                    {message.type === "ai" && message.count !== undefined && (
                      <Box
                        mt={2}
                        p={2}
                        bg="green.100"
                        borderRadius="md"
                        fontSize="sm"
                        color="green.800"
                      >
                        📊 Found {message.count} results from{" "}
                        {message.collection} collection
                      </Box>
                    )}

                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.8,
                        marginTop: "8px",
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </Box>

                  {message.type === "user" && (
                    <Box
                      bg="blue.500"
                      color="white"
                      borderRadius="full"
                      w={8}
                      h={8}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="sm"
                    >
                      <FaUser />
                    </Box>
                  )}
                </HStack>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <HStack justify="flex-start" align="start" spacing={3}>
                <Box
                  bg="blue.500"
                  color="white"
                  borderRadius="full"
                  w={8}
                  h={8}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                >
                  <FaRobot />
                </Box>
                <Box p={3} bg="gray.50" borderRadius="lg" maxW="75%">
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "4px",
                      fontSize: "14px",
                    }}
                  >
                    AI Assistant
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    🤔 Analyzing your question and generating MongoDB query...
                  </div>
                </Box>
              </HStack>
            )}

            {/* Scroll target */}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* Sample Questions */}
        {messages.length === 0 && (
          <Box w="full" bg="white" p={4} borderRadius="lg">
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Try these sample questions:
            </h3>
            <VStack spacing={2}>
              {[
                "How many students are in each class?",
                "Show me students who haven't paid September fees",
                "What is our total revenue this month?",
                "Which classes are over capacity?",
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  w="full"
                  onClick={() => {
                    setInputValue(question);
                    inputRef.current?.focus();
                  }}
                  textAlign="left"
                  justifyContent="flex-start"
                  fontSize="14px"
                >
                  💡 {question}
                </Button>
              ))}
            </VStack>
          </Box>
        )}

        <Box w="full">
          <form onSubmit={handleSubmit}>
            <VStack spacing={3}>
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about students, payments, classes, or any financial data..."
                disabled={isLoading}
                resize="none"
                minH="60px"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <HStack w="full" justify="space-between">
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Press Enter to send, Shift+Enter for new line
                </div>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  disabled={!inputValue.trim()}
                  leftIcon={<FaPaperPlane />}
                >
                  Send Message
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Box>
  );
};

export default ChatSimpleBasic;
