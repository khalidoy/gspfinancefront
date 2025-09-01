import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Box, Spinner, Center, VStack, Text } from "@chakra-ui/react";
import Login from "./components/Login_simple";
import Register from "./components/Register_simple";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home_simple";

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
    // After registration, you might want to redirect or show a success message
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
            path="/register"
            element={
              <ProtectedRoute requireRole="ADMIN">
                <Register onRegisterSuccess={handleRegisterSuccess} />
              </ProtectedRoute>
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
