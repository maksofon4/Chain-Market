import React, { ReactNode, useEffect } from "react";
import { useAppDispatch } from "hooks/redux";
import { fetchUser } from "store/reducers/userReducer/ActionCreator";

interface GlobalDataProps {
  children: ReactNode;
}

const GlobalData: React.FC<GlobalDataProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, []);

  return <>{children}</>;
};

export default GlobalData;
