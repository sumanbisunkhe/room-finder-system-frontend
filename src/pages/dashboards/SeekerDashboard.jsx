import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import LogoutIcon from '@mui/icons-material/Logout';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from '../../contexts/SnackbarContext';

import SeekerLayout from '../../components/layout/SeekerLayout';
import * as userService from '../../services/userService';
import * as bookingService from '../../services/bookingService';

const getTheme = (mode, colorScheme, borderRadius) => {
  const colorSchemes = {
    blue: {
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',
        light: mode === 'dark' ? '#90caf9' : '#42a5f5',
        dark: mode === 'dark' ? '#64b5f6' : '#1565c0',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#dc004e',
        light: mode === 'dark' ? '#f48fb1' : '#ff4081',
        dark: mode === 'dark' ? '#c2185b' : '#c51162',
      },
    },
    green: {
      primary: {
        main: mode === 'dark' ? '#81c784' : '#2e7d32',
        light: mode === 'dark' ? '#81c784' : '#4caf50',
        dark: mode === 'dark' ? '#66bb6a' : '#1b5e20',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#c2185b',
        light: mode === 'dark' ? '#f48fb1' : '#e91e63',
        dark: mode === 'dark' ? '#c2185b' : '#880e4f',
      },
    },
    purple: {
      primary: {
        main: mode === 'dark' ? '#ba68c8' : '#9c27b0',
        light: mode === 'dark' ? '#ba68c8' : '#ba68c8',
        dark: mode === 'dark' ? '#ab47bc' : '#7b1fa2',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#c2185b',
        light: mode === 'dark' ? '#f48fb1' : '#e91e63',
        dark: mode === 'dark' ? '#c2185b' : '#880e4f',
      },
    },
    orange: {
      primary: {
        main: mode === 'dark' ? '#ffb74d' : '#ed6c02',
        light: mode === 'dark' ? '#ffb74d' : '#ff9800',
        dark: mode === 'dark' ? '#ffa726' : '#e65100',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#c2185b',
        light: mode === 'dark' ? '#f48fb1' : '#e91e63',
        dark: mode === 'dark' ? '#c2185b' : '#880e4f',
      },
    },
  };

  const borderRadiusValues = {
    small: 4,
    medium: 8,
    large: 12,
  };

  const selectedScheme = colorSchemes[colorScheme] || colorSchemes.blue;
  const selectedRadius = borderRadiusValues[borderRadius] || borderRadiusValues.medium;

  return createTheme({
    palette: {
      mode,
      ...selectedScheme,
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        accent: mode === 'dark' ? '#2d3748' : '#edf2f7'
      },
      text: {
        primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        disabled: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        focus: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
      }
    },
    shape: {
      borderRadius: selectedRadius
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: selectedRadius,
            padding: '8px 16px',
            fontWeight: 500,
            fontSize: '0.875rem'
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 2px 8px rgba(255, 255, 255, 0.15)'
                : '0 2px 8px rgba(0, 0, 0, 0.15)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: selectedRadius,
            backgroundImage: 'none',
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: selectedRadius,
            backgroundImage: 'none',
            boxShadow: mode === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: mode === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.2)'
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'
          }
        }
      }
    }
  });
};

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSnackbar } = useSnackbar();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Theme state
  const [themePreference, setThemePreference] = useState(() => {
    const savedMode = localStorage.getItem('seekerThemeMode');
    return savedMode || 'light';
  });

  const [colorScheme, setColorScheme] = useState(() => {
    const savedScheme = localStorage.getItem('seekerColorScheme');
    return savedScheme || 'blue';
  });

  const [borderRadius, setBorderRadius] = useState(() => {
    const savedRadius = localStorage.getItem('seekerBorderRadius');
    return savedRadius || 'medium';
  });

  // Determine actual theme mode based on preference
  const mode = useMemo(() => {
    return themePreference === 'dark' ? 'dark' : 'light';
  }, [themePreference]);

  // Create theme based on mode, color scheme, and border radius
  const theme = useMemo(() => 
    getTheme(mode, colorScheme, borderRadius), 
    [mode, colorScheme, borderRadius]
  );

  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: '',
  });

  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      
      if (!response || !response.data) {
        throw new Error("Invalid user data format");
      }

      const userData = response.data;
      if (!userData.id && userData._id) {
        userData.id = userData._id;
      }

      // Verify the user is a seeker
      if (userData.role !== 'SEEKER') {
        throw new Error("Unauthorized: User is not a seeker");
      }

      setCurrentUser(userData);
    } catch (err) {
      console.error("Fetch Current User Error:", err.message);
      setError(err.message);
      // Clear any invalid tokens
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchAndProcessBookings = useCallback(async () => {
    if (!currentUser?.id) {
      console.error('Cannot fetch bookings without user ID');
      return;
    }
    try {
      setLoading(true);
      const response = await bookingService.getBookingsBySeeker(currentUser.id);

      // Ensure response and response.content exist before mapping
      const content = response?.content || [];

      const processedBookings = content.map((booking) => ({
        id: booking.id,
        roomId: booking.roomId,
        seekerId: booking.seekerId,
        landlordId: booking.landlordId,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }));

      const stats = {
        totalBookings: response?.totalElements || 0,
        activeBookings: processedBookings.filter(
          (booking) => booking.status === 'ACTIVE'
        ).length,
        completedBookings: processedBookings.filter(
          (booking) => booking.status === 'COMPLETED'
        ).length,
        cancelledBookings: processedBookings.filter(
          (booking) => booking.status === 'CANCELLED'
        ).length,
      };

      setBookings(processedBookings);
      setBookingStats(stats);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch bookings';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchAndProcessBookings();
    }
  }, [currentUser, fetchAndProcessBookings]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await userService.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      setSnackbarState({
        open: true,
        message: 'Failed to logout. Please try again.',
        severity: 'error'
      });
    } finally {
      setLogoutDialogOpen(false);
    }
  };

  const handleThemeChange = (newMode) => {
    setThemePreference(newMode);
    localStorage.setItem('seekerThemeMode', newMode);
  };

  const handleColorSchemeChange = (newScheme) => {
    setColorScheme(newScheme);
    localStorage.setItem('seekerColorScheme', newScheme);
  };

  const handleBorderRadiusChange = (newRadius) => {
    setBorderRadius(newRadius);
    localStorage.setItem('seekerBorderRadius', newRadius);
  };

  return (
    <ThemeProvider theme={theme}>
      <SeekerLayout
        theme={theme}
        mode={mode}
        colorScheme={colorScheme}
        borderRadius={borderRadius}
        onThemeChange={handleThemeChange}
        onColorSchemeChange={handleColorSchemeChange}
        onBorderRadiusChange={handleBorderRadiusChange}
        handleLogout={handleLogoutClick}
      >
        <Outlet context={{ 
          theme, 
          mode: themePreference,
          colorScheme,
          borderRadius,
          onThemeChange: handleThemeChange,
          onColorSchemeChange: handleColorSchemeChange,
          onBorderRadiusChange: handleBorderRadiusChange
        }} />
      </SeekerLayout>

      {/* Snackbar */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarState({ ...snackbarState, open: false })}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: { xs: '90%', sm: '360px' },
            maxWidth: '400px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <LogoutIcon
                sx={{
                  fontSize: 24,
                  color: 'error.main'
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              Confirm Logout
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Are you sure you want to logout? You will need to login again to access your account.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Button
            onClick={handleLogoutCancel}
            variant="text"
            sx={{
              flex: 1,
              py: 1,
              textTransform: 'none',
              fontSize: '0.9rem',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            sx={{
              flex: 1,
              py: 1,
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: 'error.dark'
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default SeekerDashboard;