import React, { ReactNode, useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import Header from "../Header/header";
import { SessionContext } from "Components/GlobalData/GlobalData";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const sessionInfo = useContext(SessionContext);
  if (!sessionInfo.user.userId) {
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
