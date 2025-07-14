import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Spinner, Flex } from "@chakra-ui/react";

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log("ProtectedRoute render:", {
    currentUser,
    loading,
    path: location.pathname,
  });
  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh" mt="80px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Use Fragment to prevent additional DOM nesting
  return <>{children}</>;
}

export default ProtectedRoute;
