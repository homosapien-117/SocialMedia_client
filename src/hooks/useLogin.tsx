import { useState } from "react";
import {Axios }from "../axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuth } from "../context/AuthContext";
import { LoginValues, UseLoginReturn } from "../Interfaces/userInterface";

const useLogin = (): UseLoginReturn => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateLogin = (values: LoginValues): boolean => {
    const { email, password } = values;
    const regex = /^[^\s,]+$/;

    if (!regex.test(email)) {
      setError("Email cannot contain spaces or commas.");
      return false;
    }

    if (!regex.test(password)) {
      setError("Password cannot contain spaces or commas.");
      return false;
    }

    setError(null);
    return true;
  };

  const LoginUser = async (values: LoginValues): Promise<void> => {
    if (!validateLogin(values)) {
      return;
    }
    try {
      setError(null);
      setLoading(true);

      const res = await Axios.post("/auth/login", values);
      const data = res.data;

      if (res.status === 200) {
        message.success(data.message);
        login(data.token, data.user);
        navigate("/home");
      } else {
        setError(data.message);
        message.error(data.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
      message.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (email: string) => {
    const regex = /^[^\s,]+$/;

    if (!regex.test(email)) {
      setError("Email cannot contain spaces or commas.");
      message.error("Email cannot contain spaces or commas.");
      return;
    }
    try {
      const response = await Axios.post("/auth/forgot-password", { email });
      message.success(response.data.message || "Recovery email sent");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      message.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { loading, error, LoginUser, sendResetEmail };
};

export default useLogin;
