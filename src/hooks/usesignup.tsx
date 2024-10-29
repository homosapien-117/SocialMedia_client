import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
import { message } from "antd";
import {Axios} from "../axios";
import { useNavigate } from "react-router-dom";
import { SignupValues, UseSignupReturn } from "../Interfaces/userInterface";
import Swal from "sweetalert2";

const useSignup = (): UseSignupReturn => {
  // const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const registerUser = async (values: SignupValues): Promise<void> => {
    const { username, email, password, confirmpassword } = values;
    const regex = /^[^\s,]+$/;

    if (password !== confirmpassword) {
      setError("Passwords are not the same");
      return;
    }
    if (!regex.test(username)) {
      setError("Username cannot contain spaces or commas.");
      return;
    }

    if (!regex.test(email)) {
      setError("Email cannot contain spaces or commas.");
      return;
    }

    if (!regex.test(password)) {
      setError("Password cannot contain spaces or commas.");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const res = await Axios.post("/auth/signup", values);
      const data = res.data;

      if (res.status === 201) {
        message.success(data.message);
        Swal.fire({
          text: "A Verification mail has been sent to the registered email address.",
          timer: 3000,
          icon: "success",
          showConfirmButton: true,
        });
        navigate("/login");
      } else if (res.status === 400) {
        setError(data.message);
      } else {
        message.error("Registration Failed");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, registerUser };
};

export default useSignup;
