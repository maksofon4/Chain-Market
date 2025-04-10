import React, { ReactNode, useEffect, useState, createContext } from "react";
import { Navigate } from "react-router-dom";
import Header from "./mainPage/Header/header";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const SessionContext = createContext(null);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | undefined>();

  useEffect(() => {
    fetch(`/api/session-info`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsAuth(data.userId !== null);
        setUser(data);
      })

      .catch(() => {
        setIsAuth(false);
        setUser(undefined);
      });
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? (
    <SessionContext.Provider value={user}>
      <Header />
      {children}
    </SessionContext.Provider>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
