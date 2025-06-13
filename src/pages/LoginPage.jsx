import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  CssBaseline,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { AccountCircle, Lock, PersonAdd, Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { loginUser } from "../services/authService";

const loginSchema = yup.object().shape({
  identifier: yup.string().required("Please enter your username or email"),
  password: yup.string().required("Password is required"),
});

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for registration success on component mount
  useEffect(() => {
    if (location.state && location.state.registeredSuccessfully) {
      setRegistrationSuccess(true);
      const timer = setTimeout(() => {
        setRegistrationSuccess(false);
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const handleRegisterNavigation = () => {
    navigate("/register");
  };

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onLoginSubmit = async (data) => {
    try {
      const { token, role } = await loginUser(data.identifier, data.password);

      if (!token) {
        throw new Error('Authentication failed');
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      switch (role) {
        case "SEEKER":
          navigate("/dashboard/seeker");
          break;
        case "LANDLORD":
          navigate("/landlord/dashboard");
          break;
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        default:
          throw new Error("Invalid user role");
      }
    } catch (error) {
      setServerError(error.message || "Login failed");
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            width: '100%',
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src="/src/assets/RR.png"
              alt="Logo"
              style={{ height: "50px", objectFit: "contain" }}
            />
          </Box>
          <Typography component="h1" variant="h5" sx={{ textAlign: "center", fontFamily: "Courier", mt: 3, mb: 3 }}>
            Login
          </Typography>

          {registrationSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Please log in with your new account.
            </Alert>
          )}

          {serverError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Username or Email"
              {...loginRegister("identifier")}
              error={!!loginErrors.identifier}
              helperText={loginErrors.identifier?.message}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              {...loginRegister("password")}
              error={!!loginErrors.password}
              helperText={loginErrors.password?.message}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{
                        '&:focus': {
                          outline: 'none',
                        },
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                textAlign: "center",
              }}
            >
              Don't have an account?{" "}
              <Typography
                component="span"
                sx={{
                  mt: 2,
                  color: "primary.main",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={handleRegisterNavigation}
              >
                Register
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
