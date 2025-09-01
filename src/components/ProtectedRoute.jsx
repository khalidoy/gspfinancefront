import React from "react";
import { Navigate } from "react-router-dom";
import { Spinner, Center, VStack, Text } from "@chakra-ui/react";

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const authStatus = localStorage.getItem("isAuthenticated");
  const user = localStorage.getItem("user");
  return authStatus === "true" && user;
};

// Helper function to get current user
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

function ProtectedRoute({ children, requireRole = null }) {
  const authenticated = isAuthenticated();
  const user = getCurrentUser();

  // Show loading while checking authentication
  if (authenticated === null) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!authenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requireRole && user.role !== requireRole) {
    // For now, just redirect to home. You could create an "Access Denied" page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role
  return children;
}

export default ProtectedRoute;
