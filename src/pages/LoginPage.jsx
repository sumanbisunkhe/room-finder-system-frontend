// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

const loginSchema = yup.object().shape({
  identifier: yup.string().required("Please enter your username or email"),
  password: yup.string().required("Password is required"),
});

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", data);
      localStorage.setItem("token", response.data.jwt);
      navigate("/dashboard");
    } catch (error) {
      setServerError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
      <img src="\src\assets\RFS.svg" alt="Logo" className="logo" />
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Username or Email</label>
            <input {...register("identifier")} />
            <p className="error">{errors.identifier?.message}</p>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register("password")} />
            <p className="error">{errors.password?.message}</p>
          </div>
          {serverError && <p className="error server-error">{serverError}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
