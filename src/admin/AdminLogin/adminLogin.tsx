import  { useState, ChangeEvent, FormEvent } from "react";
import "./adminLogin.css";
import useAdminLogin from "../../hooks/useAdminLogin";
import { FormValues } from "../../Interfaces/adminInterface";



const Form = () => {
  const {  LoginAdmin } = useAdminLogin();
  const [formValues, setFormValues] = useState<FormValues>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    console.log(name, value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    LoginAdmin(formValues);
    console.log(formValues);
  };

  return (
    <div className="adminlogin-container">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <h4>Email</h4>
          <input
            type="text"
            id="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            className="email"
            placeholder="email"
            required
          />
        </div>
        <div className="input-group">
          <h4>Password</h4>
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
        </div>
        <div className="login-btn">
          <button className="login-btn" type="submit">
            Login
          </button>
          <br />
        </div>
      </form>
    </div>
  );
};

const AdminLogin = () => {
  return (
    <>
      <Form />
    </>
  );
};

export default AdminLogin;
