import React, { useState, useEffect, lazy, Suspense } from 'react';
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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import * as userService from '../../services/userService';
import Logo from '../../assets/RR.png';

// Lazy load components
const UserManagement = lazy(() => import('./sections/UserManagement'));
const UserAnalytics = lazy(() => import('./sections/UserAnalytics'));
const SystemSettings = lazy(() => import('./sections/SystemSettings'));
const CSVOperations = lazy(() => import('./sections/CSVOperations'));
const ProfileSection = lazy(() => import('./sections/ProfileSection'));

// Create theme based on mode
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1976d2' : '#90caf9',
    },
    secondary: {
      main: mode === 'light' ? '#dc004e' : '#f48fb1',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 500 },
    h2: { fontWeight: 500 },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('adminThemeMode');
    return savedMode || 'light';
  });
  const [state, setState] = useState({
    activeSection: 'users',
    loading: false,
    error: null,
    snackbar: {
      open: false,
      message: '',
      severity: 'success',
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

  // Theme
  const customTheme = React.useMemo(() => getTheme(mode), [mode]);

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

  const handleLogout = async () => {
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
    }
  };

  const handleThemeToggle = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('adminThemeMode', newMode);
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
          <Suspense fallback={<CircularProgress />}>
            <SystemSettings />
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
          onClose={handleDrawerToggle}
            sx={{
            width: uiState.drawerOpen ? 240 : 65,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: uiState.drawerOpen ? 240 : 65,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              boxShadow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowX: 'hidden',
              transition: theme.transitions.create(['width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              position: 'relative',
                },
              }}
            >
          {/* Expand button - visible only when collapsed */}
          {!uiState.drawerOpen && !isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'fixed',
                left: 52,
                top: 20,
                width: 24,
                height: 24,
                borderRadius: '8px',
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: theme.zIndex.drawer + 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem',
                  color: 'text.secondary',
                  transform: 'rotate(-90deg)',
                  transition: theme.transitions.create(['transform'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                transition: theme.transitions.create(['left', 'box-shadow'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                })
              }}
            >
              <ArrowIcon />
            </IconButton>
          )}
          <Box 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              minHeight: 64,
              position: 'relative',
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Room Finder Logo"
              sx={{ 
                height: 40,
                opacity: uiState.drawerOpen ? 1 : 0,
                transition: theme.transitions.create(['opacity'], {
                  duration: theme.transitions.duration.enteringScreen,
                }),
                objectFit: 'contain'
              }}
            />
            {/* Collapse button with consistent style */}
            {uiState.drawerOpen && (
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '8px',
                  backgroundColor: 'background.paper',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: 1,
                  borderColor: 'divider',
                  p: 0,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.2rem',
                    color: 'text.secondary',
                    transform: 'rotate(90deg)',
                    transition: theme.transitions.create(['transform'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                  }
                }}
              >
                <ArrowIcon />
              </IconButton>
            )}
          </Box>
          <Divider />
          {/* Main menu items */}
          <List sx={{ flex: 1 }}>
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
                    '&.Mui-selected': {
                    bgcolor: alpha(customTheme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(customTheme.palette.primary.main, 0.15),
                    },
                    },
                  }}
                >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0,
                    mr: uiState.drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                    {item.icon}
                  </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        opacity: uiState.drawerOpen ? 1 : 0,
                    transition: theme.transitions.create(['opacity'], {
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: state.activeSection === item.section ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                />
              </ListItemButton>
            ))}
            </List>
          {/* Logout section at bottom */}
          <Divider />
          <List>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                py: 1.5,
                  minHeight: 48,
                justifyContent: uiState.drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  color: 'error.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
                }}
              >
              <ListItemIcon 
                sx={{ 
                  minWidth: 0,
                  mr: uiState.drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main'
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                    sx={{ 
                  opacity: uiState.drawerOpen ? 1 : 0,
                  transition: theme.transitions.create(['opacity'], {
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                }}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
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
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
                {menuItems.find(item => item.section === state.activeSection)?.label}
              </Typography>
              <IconButton onClick={handleThemeToggle} sx={{ mr: 1 }}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
              <IconButton onClick={handleUserMenuClick}>
                <AccountCircle />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Main Section Content */}
          <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'auto', p: state.activeSection === 'users' ? 0 : 3 }}>
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
          <MenuItem onClick={handleLogout}>
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
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard; 