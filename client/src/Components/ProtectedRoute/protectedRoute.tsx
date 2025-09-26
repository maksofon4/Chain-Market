import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Header from "../Header/header";

import { useFetchUserQuery } from "services/userService";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data, isLoading } = useFetchUserQuery();

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default ProtectedRoute;
