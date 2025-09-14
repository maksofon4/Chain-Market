import React, {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useCallback,
} from "react";

interface GlobalDataProps {
  children: ReactNode;
}

interface SessionContextType {
  user: any;
  refreshUser: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

const GlobalData: React.FC<GlobalDataProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | undefined>();

  const fetchData = useCallback(async () => {
    try {
      const sessionInfoReq = await fetch(`/api/auth`, {
        credentials: "include",
      });
      const sessionInfo = await sessionInfoReq.json();

      sessionInfo.userId ? setIsAuth(true) : setIsAuth(false);

      setUser(sessionInfo);
    } catch (e) {
      setIsAuth(false);
      setUser(undefined);
      console.error("Error fetching data:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isAuth === null) return <div>Loading...</div>;

  return (
    <SessionContext.Provider value={{ user, refreshUser: fetchData }}>
      {children}
    </SessionContext.Provider>
  );
};

export default GlobalData;
