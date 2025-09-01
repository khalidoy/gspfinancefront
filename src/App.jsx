import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Box, Spinner, Center, VStack, Text } from "@chakra-ui/react";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Classes from "./pages/Classes";
import Payments from "./pages/Payments";
import TestChakra from "./pages/TestChakra";
import ChatSimpleBasic from "./pages/ChatSimpleBasic";

// Helper functions for authentication
const isAuthenticated = () => {
  const authStatus = localStorage.getItem("isAuthenticated");
  const user = localStorage.getItem("user");
  return authStatus === "true" && user;
};

const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getCurrentUser();
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    setUser(null);
  };

  const handleRegisterSuccess = () => {
    console.log("User registered successfully");
  };

  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        {/* Show navbar only when user is authenticated */}
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Home user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <Classes user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/daily-accounting"
            element={
              <ProtectedRoute>
                <Box p={8}>
                  <Text fontSize="2xl" fontWeight="bold">
                    Daily Accounting
                  </Text>
                  <Text color="gray.600">Coming Soon...</Text>
                </Box>
              </ProtectedRoute>
            }
          />

          <Route
            path="/expenses/*"
            element={
              <ProtectedRoute>
                <Box p={8}>
                  <Text fontSize="2xl" fontWeight="bold">
                    Expenses
                  </Text>
                  <Text color="gray.600">Coming Soon...</Text>
                </Box>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/*"
            element={
              <ProtectedRoute>
                <Box p={8}>
                  <Text fontSize="2xl" fontWeight="bold">
                    Reports
                  </Text>
                  <Text color="gray.600">Coming Soon...</Text>
                </Box>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/*"
            element={
              <ProtectedRoute>
                <TestChakra user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatSimpleBasic user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Box p={8}>
                  <Text fontSize="2xl" fontWeight="bold">
                    Profile
                  </Text>
                  <Text color="gray.600">Coming Soon...</Text>
                </Box>
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                // If user is logged in, check if they're admin
                user.role === "ADMIN" ? (
                  <Register onRegisterSuccess={handleRegisterSuccess} />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                // If not logged in, show register with guest access message
                <Register
                  onRegisterSuccess={handleRegisterSuccess}
                  isGuestAccess={true}
                />
              )
            }
          />

          {/* Redirect all other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
