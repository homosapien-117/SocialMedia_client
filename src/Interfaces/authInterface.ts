
import { ReactNode } from "react";

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  userdata: any | null;
  login: (newToken: string, newData: any) => void;
  logout: () => void;
  setUserdata: (data: any) => void;
  config: {
    headers: {
      Authorization: string;
    };
  };
}

export interface AuthProviderProps {
  children: ReactNode;
}
