import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {Axios} from "../../axios";
import "./resetpassword.css";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") {
      setPassword(value);
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await Axios.post(`/auth/reset-password/${token}`, { password, confirmPassword });
      navigate("/");
    } catch (err) {
      setError("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="password"
          placeholder="New Password"
          name="password"
          value={password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
