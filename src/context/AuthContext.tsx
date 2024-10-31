import { createContext, useContext, useEffect, useState } from "react";
import {
  AuthContextType,
  AuthProviderProps,
} from "../Interfaces/authInterface";
import { Axios } from "../axios";

const Authcontext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  userdata: null,
  login: () => {},
  logout: () => {},
  setUserdata: () => {},
  config: {
    headers: {
      Authorization: "",
    },
  },
});

export const Authprovider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [userdata, setUserdata] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("user_data") || "{}");
    if (storedData.userToken && storedData.user) {
      setIsAuthenticated(true);
      setToken(storedData.userToken);
      setUserdata(storedData.user);
      Axios.defaults.headers.common["Authorization"] = storedData.userToken;
    }
  }, []);

  const login = (newToken: string, newData: any) => {
    localStorage.setItem(
      "user_data",
      JSON.stringify({ userToken: newToken, user: newData })
    );
    setToken(newToken);
    setUserdata(newData);
    setIsAuthenticated(true);
    Axios.defaults.headers.common["Authorization"] = newToken;
  };

  const logout = () => {
    localStorage.removeItem("user_data");
    setToken(null);
    setUserdata(null);
    setIsAuthenticated(false);
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return (
    <Authcontext.Provider
      value={{
        token,
        isAuthenticated,
        userdata,
        login,
        logout,
        config,
        setUserdata,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(Authcontext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an Authprovider");
  }

  return context;
};
