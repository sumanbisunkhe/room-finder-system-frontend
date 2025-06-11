import React, { useState, useEffect, lazy, Suspense, startTransition } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Menu,
  MenuItem,
  alpha,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  KeyboardArrowDown as ArrowIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Refresh as RefreshIcon,
  AccountCircle,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Storage as StorageIcon,
  PersonOutline as PersonOutlineIcon,
  GpsFixed as ScopeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import * as userService from '../../services/userService';

// Lazy load components
const UserManagement = lazy(() => import('./sections/UserManagement'));
const UserAnalytics = lazy(() => import('./sections/UserAnalytics'));
const SystemSettings = lazy(() => import('./sections/SystemSettings'));
const CSVOperations = lazy(() => import('./sections/CSVOperations'));
const ProfileSection = lazy(() => import('./sections/ProfileSection'));

// Color scheme configurations
const colorSchemes = {
  blue: {
    light: {
      primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
      secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' }
    },
    dark: {
      primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5' },
      secondary: { main: '#ce93d8', light: '#f3e5f5', dark: '#ab47bc' }
    }
  },
  purple: {
    light: {
      primary: { main: '#7e57c2', light: '#9575cd', dark: '#5e35b1' },
      secondary: { main: '#ec407a', light: '#f06292', dark: '#d81b60' }
    },
    dark: {
      primary: { main: '#b39ddb', light: '#ede7f6', dark: '#7e57c2' },
      secondary: { main: '#f48fb1', light: '#fce4ec', dark: '#ec407a' }
    }
  },
  green: {
    light: {
      primary: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
      secondary: { main: '#d32f2f', light: '#ef5350', dark: '#c62828' }
    },
    dark: {
      primary: { main: '#81c784', light: '#e8f5e9', dark: '#4caf50' },
      secondary: { main: '#ef5350', light: '#ffebee', dark: '#d32f2f' }
    }
  },
  orange: {
    light: {
      primary: { main: '#ed6c02', light: '#ff9800', dark: '#e65100' },
      secondary: { main: '#0288d1', light: '#03a9f4', dark: '#01579b' }
    },
    dark: {
      primary: { main: '#ffb74d', light: '#fff3e0', dark: '#ff9800' },
      secondary: { main: '#4fc3f7', light: '#e1f5fe', dark: '#03a9f4' }
    }
  }
};

// Border radius configurations
const borderRadiusConfig = {
  small: {
    default: 0,
    button: 0,
    card: 0,
    tooltip: 0
  },
  medium: {
    default: 0,
    button: 0,
    card: 0,
    tooltip: 0
  },
  large: {
    default: 0,
    button: 0,
    card: 0,
    tooltip: 0
  }
};

// Create theme based on mode, color scheme, and border radius
const getTheme = (mode, colorScheme = 'blue', borderRadius = 'medium') => {
  const radiusConfig = {
    small: {
      default: 8,
      button: 8,
      card: 12,
      tooltip: 4
    },
    medium: {
      default: 12,
      button: 12,
      card: 16,
      tooltip: 8
    },
    large: {
      default: 16,
      button: 16,
      card: 24,
      tooltip: 12
    }
  }[borderRadius] || borderRadiusConfig.medium;
  
  return createTheme({
    palette: {
      mode,
      ...(colorSchemes[colorScheme]?.[mode] || colorSchemes.blue[mode]),
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
      },
    },
    shape: {
      borderRadius: radiusConfig.default
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radiusConfig.button,
            textTransform: 'none',
            fontWeight: 500,
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: radiusConfig.button,
              '&:focus-within': {
                outline: 'none',
                boxShadow: 'none'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? '#1976d2' : '#1976d2',
                borderWidth: '1px'
              }
            }
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
              backgroundColor: 'transparent'
            },
            '&.Mui-selected': {
              '&:focus': {
                outline: 'none',
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
              }
            }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radiusConfig.card
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: radiusConfig.card,
            backgroundImage: 'none'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radiusConfig.card
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: radiusConfig.tooltip
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radiusConfig.button,
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: radiusConfig.default
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0
          }
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }
        }
      }
    }
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // State
  const [themePreference, setThemePreference] = useState(() => {
    const savedMode = localStorage.getItem('adminThemeMode');
    return savedMode || 'system';
  });

  const [colorScheme, setColorScheme] = useState(() => {
    const savedScheme = localStorage.getItem('adminColorScheme');
    return savedScheme || 'blue';
  });

  const [borderRadius, setBorderRadius] = useState(() => {
    const savedRadius = localStorage.getItem('adminBorderRadius');
    return savedRadius || 'medium';
  });

  const [state, setState] = useState({
    activeSection: 'users',
    loading: true,
    error: null,
    snackbar: {
      open: false,
      message: '',
      severity: 'info',
    },
    users: [],
    currentUser: null,
    paginationData: {
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 8
    },
    searchTerm: '',
    userFilter: 'all'
  });
  const [uiState, setUiState] = useState({
    drawerOpen: !isMobile,
    userMenuAnchor: null,
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Determine actual theme mode based on preference
  const mode = React.useMemo(() => {
    if (themePreference === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, prefersDarkMode]);

  // Create theme based on mode, color scheme, and border radius
  const customTheme = React.useMemo(() => 
    getTheme(mode, colorScheme, borderRadius), 
    [mode, colorScheme, borderRadius]
  );

  // Menu items
  const menuItems = [
    { 
      section: 'users', 
      icon: <PeopleIcon />, 
      label: 'User Management',
      path: '/dashboard/admin/user-management',
    },
    { 
      section: 'analytics', 
      icon: <AnalyticsIcon />, 
      label: 'User Analytics',
      path: '/dashboard/admin/user-analytics',
    },
    { 
      section: 'settings', 
      icon: <AdminPanelSettingsIcon />, 
      label: 'System Settings',
      path: '/dashboard/admin/system-settings',
    },
    { 
      section: 'csv', 
      icon: <StorageIcon />, 
      label: 'CSV Operations',
      path: '/dashboard/admin/csv-operations',
    },
    { 
      section: 'profile', 
      icon: <PersonOutlineIcon />, 
      label: 'Profile Information',
      path: '/dashboard/admin/profile-information',
    }
  ];

  // Effects
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('user-management')) {
      setState(prev => ({ ...prev, activeSection: 'users' }));
    } else if (path.includes('user-analytics')) {
      setState(prev => ({ ...prev, activeSection: 'analytics' }));
    } else if (path.includes('system-settings')) {
      setState(prev => ({ ...prev, activeSection: 'settings' }));
    } else if (path.includes('csv-operations')) {
      setState(prev => ({ ...prev, activeSection: 'csv' }));
    } else if (path.includes('profile-information')) {
      setState(prev => ({ ...prev, activeSection: 'profile' }));
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await userService.getCurrentUser();
          if (response && response.data) {
            setState(prev => ({
              ...prev,
            currentUser: response.data,
            loading: false,
            }));
          }
        } catch (error) {
        console.error('Error fetching current user:', error);
          setState(prev => ({
            ...prev,
          loading: false,
          error: 'Failed to fetch user data',
            snackbar: {
              open: true,
            message: 'Failed to fetch user data',
            severity: 'error',
          },
          }));
        }
    };

    fetchCurrentUser();
  }, []);

  // Handlers
  const handleDrawerToggle = () => {
    setUiState(prev => ({ ...prev, drawerOpen: !prev.drawerOpen }));
  };

  const handleMenuItemClick = (section, path) => {
    setState(prev => ({ ...prev, activeSection: section }));
    navigate(path);
    if (isMobile) {
      setUiState(prev => ({ ...prev, drawerOpen: false }));
    }
  };

  const handleUserMenuClick = (event) => {
    setUiState(prev => ({ ...prev, userMenuAnchor: event.currentTarget }));
  };

  const handleUserMenuClose = () => {
    setUiState(prev => ({ ...prev, userMenuAnchor: null }));
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await userService.logout();
      handleUserMenuClose();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setState(prev => ({
        ...prev,
        snackbar: {
          open: true,
          message: 'Failed to logout',
          severity: 'error',
        },
      }));
    } finally {
      setLogoutDialogOpen(false);
    }
  };

  const handleThemeChange = React.useCallback((newPreference) => {
    startTransition(() => {
      setThemePreference(newPreference);
      localStorage.setItem('adminThemeMode', newPreference);
    });
  }, []);

  const handleColorSchemeChange = React.useCallback((newScheme) => {
    startTransition(() => {
      setColorScheme(newScheme);
      localStorage.setItem('adminColorScheme', newScheme);
    });
  }, []);

  const handleBorderRadiusChange = React.useCallback((newRadius) => {
    startTransition(() => {
      setBorderRadius(newRadius);
      localStorage.setItem('adminBorderRadius', newRadius);
    });
  }, []);

  const handleThemeToggle = () => {
    const newPreference = themePreference === 'light' ? 'dark' : 'light';
    handleThemeChange(newPreference);
  };

  const handleSnackbarClose = () => {
      setState(prev => ({
        ...prev,
        snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  };

  // Add pagination handlers
  const handlePageChange = (event, newPage) => {
      setState(prev => ({
        ...prev,
      paginationData: {
        ...prev.paginationData,
        currentPage: newPage
        }
      }));
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
      setState(prev => ({
        ...prev,
      paginationData: {
        ...prev.paginationData,
        pageSize: newSize,
        currentPage: 0
        }
      }));
  };

  // Add search handler
  const handleSearchChange = (value) => {
      setState(prev => ({
        ...prev,
      searchTerm: value
    }));
  };

  // Add filter handler
  const handleFilterChange = (filter) => {
    setState(prev => ({
      ...prev,
      userFilter: filter
    }));
  };

  // Add user action handler
  const handleUserAction = async (userId, action) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      if (Array.isArray(userId)) {
        // If userId is an array, it means we're receiving updated user data
      setState(prev => ({
        ...prev,
          users: userId,
          loading: false
        }));
        return;
      }

      switch (action) {
        case 'delete':
          await userService.deleteUser(userId);
          break;
        case 'activate':
          await userService.activateUser(userId);
          break;
        case 'deactivate':
          await userService.deactivateUser(userId);
          break;
        default:
          throw new Error('Invalid action');
      }

      setState(prev => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: `User ${action}d successfully`,
          severity: 'success'
        }
      }));
    } catch (error) {
      console.error(`Error performing user action ${action}:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        snackbar: {
          open: true,
          message: error.message || `Failed to ${action} user`,
          severity: 'error'
        }
      }));
    }
  };

  // Render section content
  const renderSection = () => {
    switch (state.activeSection) {
      case 'users':
        return (
          <Suspense fallback={<CircularProgress />}>
          <UserManagement 
            users={state.users}
            onSearch={handleSearchChange}
              onFilter={handleFilterChange}
            onUserAction={handleUserAction}
            paginationData={state.paginationData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
              isLoading={state.loading}
          />
          </Suspense>
        );
      case 'analytics':
    return (
          <Suspense fallback={<CircularProgress />}>
            <UserAnalytics />
          </Suspense>
        );
      case 'settings':
    return (
          <Suspense fallback={
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              width: '100%'
            }}>
              <CircularProgress />
            </Box>
          }>
            <Box sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              margin: 0,
              padding: 0
            }}>
              <SystemSettings
                theme={customTheme}
                mode={themePreference}
                colorScheme={colorScheme}
                borderRadius={borderRadius}
                onThemeChange={handleThemeChange}
                onColorSchemeChange={handleColorSchemeChange}
                onBorderRadiusChange={handleBorderRadiusChange}
                currentUser={state.currentUser}
                handleLogout={handleLogoutClick}
                setSnackbar={(message, severity) => {
                  setState(prev => ({
                    ...prev,
                    snackbar: {
                      open: true,
                      message,
                      severity,
                    },
                  }));
                }}
              />
            </Box>
          </Suspense>
        );
      case 'csv':
    return (
          <Suspense fallback={<CircularProgress />}>
            <CSVOperations />
          </Suspense>
        );
      case 'profile':
    return (
          <Suspense fallback={<CircularProgress />}>
            <ProfileSection />
          </Suspense>
        );
      default:
        return null;
      }
    };

    return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={uiState.drawerOpen}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            width: uiState.drawerOpen ? 240 : 65,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: uiState.drawerOpen ? 240 : 65,
              boxSizing: 'border-box',
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
              borderRight: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
              transition: theme => theme.transitions.create(['width', 'background'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              borderRadius: 0,
              '& .MuiListItemButton-root': {
                borderRadius: 0
              },
              '& .MuiMenuItem-root': {
                borderRadius: 0
              },
              '& .MuiButton-root': {
                borderRadius: 0
              }
            }
          }}
        >
          <Box 
            sx={{
              p: 2,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              minHeight: 64,
              position: 'relative',
              borderBottom: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
              background: theme => theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,249,250,0.5) 100%)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRadius: 0
            }}
          >
            <Link 
              to="/dashboard/admin/user-management"
              style={{ 
                textDecoration: 'none',
                display: 'block',
                width: '100%'
              }}
            >
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
                    fontSize: 32,
                    color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    animation: 'scope 3s infinite',
                    transition: 'transform 0.2s ease-in-out',
                    '@keyframes scope': {
                      '0%': { transform: 'rotate(0deg) scale(1)' },
                      '25%': { transform: 'rotate(90deg) scale(1.1)' },
                      '50%': { transform: 'rotate(180deg) scale(1)' },
                      '75%': { transform: 'rotate(270deg) scale(1.1)' },
                      '100%': { transform: 'rotate(360deg) scale(1)' },
                    },
                  }}
                />
                {uiState.drawerOpen && (
                  <Typography
                    variant="h6"
                    className="logo-text"
                    sx={{
                      fontFamily: "'Audiowide', cursive",
                      fontWeight: 400,
                      fontSize: '1.3rem',
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
                )}
              </Box>
            </Link>
            {/* Expand/Collapse Button */}
            {!uiState.drawerOpen ? (
              <IconButton
                onClick={handleDrawerToggle}
                disableRipple
                sx={{
                  position: 'fixed',
                  left: 63,
                  top: 20,
                  width: 24,
                  height: 24,
                  p: 0,
                  zIndex: theme => theme.zIndex.drawer + 2,
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    transform: 'scale(1.1)',
                    background: 'transparent'
                  },
                  '&:focus': {
                    outline: 'none'
                  },
                  '&.MuiIconButton-root': {
                    background: 'transparent'
                  },
                  '&:active': {
                    background: 'transparent'
                  }
                }}
              >
                <ArrowIcon sx={{ 
                  transform: 'rotate(-90deg)',
                  fontSize: '1.2rem',
                }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={handleDrawerToggle}
                disableRipple
                sx={{
                  width: 24,
                  height: 24,
                  p: 0,
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    transform: 'scale(1.1)',
                    background: 'transparent'
                  },
                  '&:focus': {
                    outline: 'none'
                  },
                  '&.MuiIconButton-root': {
                    background: 'transparent'
                  },
                  '&:active': {
                    background: 'transparent'
                  }
                }}
              >
                <ArrowIcon sx={{ 
                  transform: 'rotate(90deg)',
                  fontSize: '1.2rem',
                }} />
              </IconButton>
            )}
          </Box>
          <List sx={{ 
            flex: 1, 
            px: 1.5, 
            py: 2,
            overflowX: 'hidden',
            '& .MuiListItemButton-root': {
              mb: 0.5,
              borderRadius: 0,
              transition: theme => theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
                duration: '0.2s'
              }),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateX(4px)',
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.04)',
                boxShadow: 'none'
              },
              '&.Mui-selected': {
                backgroundColor: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.12)'
                    : alpha(theme.palette.primary.main, 0.12),
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                  transform: 'scale(1.1)',
                },
                '& .MuiTypography-root': {
                  fontWeight: 600,
                  color: 'primary.main',
                  letterSpacing: '0.3px',
                }
              }
            }
          }}>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.section}
                  selected={state.activeSection === item.section}
                onClick={() => handleMenuItemClick(item.section, item.path)}
                  sx={{
                  py: 1.5,
                    minHeight: 48,
                    justifyContent: uiState.drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  }}
                >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0,
                    mr: uiState.drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: state.activeSection === item.section ? 'primary.main' : 'text.secondary',
                    transition: theme => theme.transitions.create(['color', 'transform'], {
                      duration: '0.2s'
                    }),
                    fontSize: '1.2rem',
                  }}
                >
                    {item.icon}
                  </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        opacity: uiState.drawerOpen ? 1 : 0,
                    transition: theme => theme.transitions.create(['opacity', 'color'], {
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }}
                  primaryTypographyProps={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: state.activeSection === item.section ? 600 : 500,
                    color: state.activeSection === item.section ? 'primary.main' : 'text.primary',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.3px',
                  }}
                />
              </ListItemButton>
            ))}
            </List>
          <Divider sx={{ 
            borderColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.05)' 
              : 'rgba(0,0,0,0.08)',
            my: 1 
          }} />
          <List sx={{ 
            px: 1.5, 
            pb: 2,
            '& .MuiListItemButton-root': {
              borderRadius: 0,
              '&:hover': {
                backgroundColor: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.04)',
                boxShadow: 'none'
              }
            }
          }}>
              <ListItemButton
              onClick={handleLogoutClick}
                sx={{
                py: 1.5,
                  minHeight: 48,
                borderRadius: 0,
                  justifyContent: uiState.drawerOpen ? 'initial' : 'center',
                px: 2.5,
                color: 'error.main',
                transition: theme => theme.transitions.create(['background-color', 'transform', 'box-shadow'], {
                  duration: '0.2s'
                }),
                  '&:hover': {
                  transform: 'translateX(4px)',
                  backgroundColor: theme => alpha(theme.palette.error.main, 0.08),
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
                  '& .MuiListItemIcon-root': {
                    transform: 'scale(1.1)',
                  }
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 0,
                  mr: uiState.drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main',
                  transition: 'transform 0.2s',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                    sx={{ 
                  opacity: uiState.drawerOpen ? 1 : 0,
                  transition: theme => theme.transitions.create(['opacity'], {
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                }}
                primaryTypographyProps={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.3px',
                }}
              />
            </ListItemButton>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
          {/* Top Bar */}
          <AppBar
            position="static" 
            color="inherit" 
            elevation={0}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1, 
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  fontSize: '1.1rem'
                }}
              >
                {menuItems.find(item => item.section === state.activeSection)?.label}
              </Typography>
              <IconButton
                onClick={handleThemeToggle}
                disableRipple
                sx={{ 
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.background.paper,
                  boxShadow: theme => theme.palette.mode === 'dark' 
                    ? '0 2px 8px rgba(255,255,255,0.05)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : theme.palette.background.paper
                  },
                  '&:focus': {
                    outline: 'none'
                  },
                  '&.MuiIconButton-root': {
                    background: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : theme.palette.background.paper
                  }
                }}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Main Section Content */}
          <Box sx={{ 
            height: 'calc(100vh - 64px)', 
            overflow: 'auto', 
            p: 0,
            '& > *': {
              height: '100%'
            },
            '&::-webkit-scrollbar': {
              width: '8px',
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: '4px',
              '&:hover': {
                background: (theme) => alpha(theme.palette.primary.main, 0.2)
              }
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            }
          }}>
            {state.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : state.error ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">{state.error}</Alert>
              </Box>
            ) : (
              renderSection()
            )}
          </Box>
        </Box>

        {/* User Menu */}
              <Menu
          anchorEl={uiState.userMenuAnchor}
          open={Boolean(uiState.userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => {
            handleUserMenuClose();
            handleMenuItemClick('profile', '/dashboard/admin/profile-information');
          }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
                    </ListItemIcon>
            Profile
                  </MenuItem>
          <MenuItem onClick={() => {
            handleUserMenuClose();
            handleMenuItemClick('settings', '/dashboard/admin/system-settings');
          }}>
                  <ListItemIcon>
              <SettingsIcon fontSize="small" />
                  </ListItemIcon>
            Settings
                </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick}>
                  <ListItemIcon>
              <LogoutIcon fontSize="small" />
                  </ListItemIcon>
            Logout
                </MenuItem>
              </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={state.snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={state.snackbar.severity}
            sx={{ width: '100%' }}
          >
            {state.snackbar.message}
          </Alert>
        </Snackbar>

        {/* Logout Confirmation Dialog */}
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
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
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
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard; 