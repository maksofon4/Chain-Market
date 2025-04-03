import React, { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "./mainPage/NavBar/NavBar";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/session-info`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsAuth(data.userId !== null);
      })

      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? (
    <>
      <Header />
      {children}
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
