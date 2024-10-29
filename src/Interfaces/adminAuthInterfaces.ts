
import { ReactNode } from "react";

export interface AdminAuthContextProps {
  admintoken: string | null;
  isAdminAuthenticated: boolean;
  Adminlogin: (newToken: string, newData: any) => void;
  Adminlogout: () => void;
  admindata: any | null;
}

export interface AdminAuthProviderProps {
  children: ReactNode;
}

