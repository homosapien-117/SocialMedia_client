import { useState } from "react";
import { message } from "antd";
import {Axios} from "../axios";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {  LoginValues, AdminLoginResponse } from "../Interfaces/adminInterface";


const useAdminLogin = () => {
  const { Adminlogin } = useAdminAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const LoginAdmin = async (values: LoginValues) => {
    try {
      setError(null);
      setLoading(true);

      const res = await Axios.post<AdminLoginResponse>("/auth/adminlogin", values);
      console.log(res);
      const data = res.data;

      if (res.status === 200) {
        message.success(data.message);
        Adminlogin(data.token, data.user);
        navigate("/dashbord");
      } else if (res.status === 404) {
        setError(data.message);
      } else {
        message.error("Login Failed");
      }
    } catch (error) {
      message.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, LoginAdmin };
};

export default useAdminLogin;
