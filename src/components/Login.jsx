// src/components/Login.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";

const loginSchema = yup.object().shape({
  identifier: yup.string().required("Please enter your username or email"),
  password: yup.string().required("Password is required"),
});

const Login = ({ onSubmit, loading, errors, serverError }) => {
  const {
    register,
    handleSubmit,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  return (
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
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;