import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSignup from "../../hooks/usesignup";
import useLogin from "../../hooks/useLogin";
import "./login.css";
import Swal from "sweetalert2";

const Login = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [ForgetPassword, setForgetPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { error: signUpError, registerUser } = useSignup();
  const {
    loading: loginLoading,
    error: loginError,
    LoginUser,
    sendResetEmail,
  } = useLogin();
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  useEffect(() => {
    if (location.pathname === "/signup") {
      setIsSignIn(false);
    } else if (location.pathname === "/forgot-password") {
      setIsSignIn(true);
      setForgetPassword(true);
    } else {
      setIsSignIn(true);
      setForgetPassword(false);
    }
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("verified") === "true") {
      Swal.fire({
        text: "A Verification Successfull",
        timer: 3000,
        icon: "success",
        showConfirmButton: true,
      });
    }
  }, [location.pathname, location.search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (ForgetPassword) {
      try {
        await sendResetEmail(formValues.email);
      } catch (error: any) {
        alert(error.message);
      }
    } else if (isSignIn) {
      try {
        await LoginUser(formValues);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      if (formValues.password !== formValues.confirmpassword) {
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "Password Missmatch!",
        });
        return;
      }
      try {
        await registerUser(formValues);
        setFormValues({
          username: "",
          email: "",
          password: "",
          confirmpassword: "",
        });
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleSignUp = () => {
    setIsSignIn(false);
    navigate("/signup");
  };

  const handleSignIn = () => {
    setIsSignIn(true);
    navigate("/");
  };

  const handleforgot = () => {
    setForgetPassword(true);
    navigate("/forgot-password");
  };

  const handleSignInForget = () => {
    setForgetPassword(false);
    navigate("/");
  };

  return (
    <div className={`container ${isSignIn ? "" : "active"}`} id="container">
      {isSignIn ? (
        !ForgetPassword ? (
          <div className="form-container sign-in">
            <form onSubmit={handleSubmit}>
              <h1>Sign In</h1>
              {loginError && <p className="error-message">{loginError}</p>}
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                required
              />
              <a onClick={handleforgot}>Forget Your Password?</a>
              <button type="submit" disabled={loginLoading}>
                {loginLoading ? "Logging In..." : "Login"}
              </button>
            </form>
          </div>
        ) : (
          <div className="form-container sign-in">
            <form onSubmit={handleSubmit}>
              <h1>Forgot Password</h1>
              {loginError && <p className="error-message">{loginError}</p>}
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                required
              />
              <a onClick={handleSignInForget}>Back to Login</a>
              <button type="submit">Send Mail</button>
            </form>
          </div>
        )
      ) : (
        <div className="form-container sign-up">
          <form onSubmit={handleSubmit}>
            <h1>Create Account</h1>
            <input
              type="text"
              id="username"
              name="username"
              value={formValues.username}
              onChange={handleChange}
              className="username"
              placeholder="Username"
              required
            />
            <input
              type="email"
              id="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              className="email"
              placeholder="Email"
              required
            />
            <input
              type="password"
              id="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              className="password"
              placeholder="Password"
              required
            />
            <input
              type="password"
              id="confirmpassword"
              name="confirmpassword"
              value={formValues.confirmpassword}
              onChange={handleChange}
              className="confirmpassword"
              placeholder="Confirm Password"
              required
            />
            <button type="submit" disabled={loginLoading ?? undefined}>
              {loginLoading ? "Logging In..." : "Login"}
            </button>

            {signUpError && <p className="error-message">{signUpError}</p>}
          </form>
        </div>
      )}

      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all site features</p>
            <button
              className={`hidden ${isSignIn ? "" : "active"}`}
              id="login"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right" >
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details to use all site features</p>
            <button
              className={`hidden ${isSignIn ? "active" : ""}`}
              id="register"
              onClick={handleSignUp}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
