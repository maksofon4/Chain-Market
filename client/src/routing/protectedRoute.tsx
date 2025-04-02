import React, {createContext, ReactNode, useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import Header from "../mainPage/NavBar/NavBar.tsx";

const serverRoute = "http://localhost:3001";

// https://react.dev/reference/react/useContext

interface ProtectedRouteProps {
    children: ReactNode;
}

export const SessionContext = createContext(null);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
    const [user, setUser] = useState<any | undefined>()

    useEffect(() => {
        fetch(`/api/session-info`, {credentials: "include"})
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
            })

            .catch(() => setUser(undefined));
    }, []);

    if (!user) return <div>Loading...</div>;
    return user ? (
        <SessionContext.Provider value={user}>
            <Header/>
            {children}
        </SessionContext.Provider>
    ) : (
        <Navigate to="/login" replace/>
    );
};

export default ProtectedRoute;
