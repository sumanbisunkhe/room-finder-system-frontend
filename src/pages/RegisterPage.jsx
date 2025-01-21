import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterPage.css";

const registerSchema = yup.object().shape({
    username: yup.string().required("Username is required").min(3).max(50),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    fullName: yup.string().required("Full name is required").max(100),
    phoneNumber: yup
        .string()
        .matches(/^\+?[0-9]{10,15}$/, "Enter a valid phone number")
        .required("Phone number is required"),
    role: yup.string().required("Role is required"),
});

const RegisterPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        setServerError(null);
        try {
            await axios.post("http://localhost:8080/api/users/register", data);
            navigate("/login");
        } catch (error) {
            setServerError(error.response?.data?.message || "Error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <img src="\src\assets\RFS.svg" alt="Logo" className="logo" />
                <h2>Register</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-row">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Username</label>
                                <input {...register("username")} />
                                <p className="error">{errors.username?.message}</p>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" {...register("email")} />
                                <p className="error">{errors.email?.message}</p>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" {...register("password")} />
                                <p className="error">{errors.password?.message}</p>
                            </div>
                        </div>
                        <div className="form-column">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input {...register("fullName")} />
                                <p className="error">{errors.fullName?.message}</p>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input {...register("phoneNumber")} />
                                <p className="error">{errors.phoneNumber?.message}</p>
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select {...register("role")}>
                                    <option value="">Select Role</option>
                                    <option value="SEEKER">Seeker</option>
                                    <option value="LANDLORD">Landlord</option>
                                </select>
                                <p className="error">{errors.role?.message}</p>
                            </div>
                        </div>
                    </div>
                    {serverError && <p className="error server-error">{serverError}</p>}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
