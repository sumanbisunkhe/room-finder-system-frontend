import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  CssBaseline,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  AccountCircle,
  Email,
  Lock,
  Person,
  Phone,
  AssignmentInd,
  Visibility,
  VisibilityOff,
  GpsFixed as ScopeIcon
} from "@mui/icons-material";
import { alpha } from '@mui/material/styles';

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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      await axios.post("http://localhost:8080/api/users/register", data);
      navigate("/login", { state: { registeredSuccessfully: true } });
    } catch (error) {
      setServerError(error.response?.data?.message || "Error occurred during registration");
    } finally {
      setLoading(false);
    }
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
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            width: '100%',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <Box display="flex" justifyContent="center" mb={4}>
            <Box
              sx={{
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                justifyContent: 'center',
                width: '100%',
                '&:hover': {
                  '& .logo-icon': {
                    transform: 'scale(1.1)',
                  },
                  '& .logo-text': {
                    opacity: 0.8
                  }
                }
              }}
            >
              <ScopeIcon 
                className="logo-icon"
                sx={{
                  fontSize: 48,
                  color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  animation: 'scope 3s infinite',
                  transition: 'transform 0.2s ease-in-out',
                  '@keyframes scope': {
                    '0%': { transform: 'rotate(0deg) scale(1)' },
                    '25%': { transform: 'rotate(90deg) scale(1.1)' },
                    '50%': { transform: 'rotate(180deg) scale(1)' },
                    '75%': { transform: 'rotate(270deg) scale(1.1)' },
                    '100%': { transform: 'rotate(360deg) scale(1)' },
                  }
                }}
              />
              <Typography
                variant="h4"
                className="logo-text"
                sx={{
                  fontFamily: "'Audiowide', cursive",
                  fontWeight: 400,
                  fontSize: '2rem',
                  background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                RoomRadar
              </Typography>
            </Box>
          </Box>

          <Typography component="h1" variant="h5" sx={{ textAlign: "center", fontFamily: "'Outfit', sans-serif" }}>
            Register
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3, width: "100%" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Username"
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      label="Email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
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
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        {...field}
                        label="Role"
                        align="left"
                        startAdornment={
                          <InputAdornment position="start">
                            <AssignmentInd />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="SEEKER">Looking for a Place to Rent</MenuItem>
                        <MenuItem value="LANDLORD">List My Property</MenuItem>
                      </Select>
                      {errors.role && (
                        <Typography color="error" variant="caption">
                          {errors.role.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                textAlign: "center",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                }}
              >
                <Typography
                  component="span"
                  sx={{
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
                >
                  Login
                </Typography>
              </Link>
            </Typography>

          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
