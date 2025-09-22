import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Header from "../Header/header";
import { useAppSelector } from "hooks/redux";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, initialized } = useAppSelector(
    (state) => state.userReducer
  );

  if (!initialized || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
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
