import React, { ReactNode, useEffect, useState, createContext } from "react";

interface GlobalDataProps {
  children: ReactNode;
}

export const SessionContext = createContext(null);

const GlobalData: React.FC<GlobalDataProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionInfoReq = await fetch(`/api/session-info`, {
          credentials: "include",
        });
        const sessionInfo = await sessionInfoReq.json();
        if (sessionInfoReq) {
          setUser(sessionInfo);
          setIsAuth(true);
        }
      } catch (e) {
        setIsAuth(false);
        setUser(undefined);
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  if (isAuth) {
    return (
      <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
    );
  }
};

export default GlobalData;
