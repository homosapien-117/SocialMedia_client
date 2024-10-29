import React, { createContext, useContext, useEffect, useState } from "react";
import { AdminAuthContextProps, AdminAuthProviderProps } from "../Interfaces/adminAuthInterfaces"


const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);



export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admintoken, setAdmintoken] = useState<string | null>(null);
  const [admindata, setAdmindata] = useState<any | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);  
  const storedData = JSON.parse(localStorage.getItem("admin_data") || "null");

  useEffect(() => {
    if (storedData) {
      const { adminToken, user } = storedData;
      setAdmintoken(adminToken);
      setAdmindata(user);
      setIsAdminAuthenticated(true);
    }
  }, []);

  const Adminlogin = (newToken: string, newData: any) => {
    localStorage.setItem(
      "admin_data",
      JSON.stringify({ adminToken: newToken, user: newData })
    );
    setAdmintoken(newToken);
    setAdmindata(newData);
    setIsAdminAuthenticated(true);
  };

  const Adminlogout = () => {
    localStorage.removeItem("admin_data");
    setAdmintoken(null);
    setAdmindata(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admintoken, admindata, isAdminAuthenticated, Adminlogin, Adminlogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextProps => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
