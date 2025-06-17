import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Stack,
  Divider,
  CssBaseline,
  useMediaQuery,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutOutlinedIcon,
  ChevronLeft as ChevronLeftOutlinedIcon,
  ChevronRight as ChevronRightOutlinedIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  KeyboardArrowDown as ArrowIcon,
  GpsFixed as ScopeIcon,
  ViewSidebar as LeftPanelIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, alpha } from '@mui/material/styles';

const SeekerLayout = ({ 
  children, 
  theme, 
  mode, 
  colorScheme,
  borderRadius,
  onThemeChange,
  onColorSchemeChange,
  onBorderRadiusChange,
  handleLogout 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(() => {
    const savedState = localStorage.getItem('seekerDrawerOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const menuItems = [
    { 
      section: 'browse',
      path: '/seeker/dashboard/browse-property',
      icon: <SearchIcon />, 
      label: 'Browse Properties'
    },
    { 
      section: 'bookings',
      path: '/seeker/dashboard/bookings',
      icon: <FavoriteIcon />, 
      label: 'My Bookings'
    },
    { 
      section: 'settings',
      path: '/seeker/dashboard/system-settings',
      icon: <SettingsIcon />, 
      label: 'System Settings'
    },
    { 
      section: 'profile',
      path: '/seeker/dashboard/profile-information',
      icon: <AccountCircleIcon />, 
      label: 'Profile Information'
    }
  ];

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('browse-property')) return 'browse';
    if (path.includes('bookings')) return 'bookings';
    if (path.includes('system-settings')) return 'settings';
    if (path.includes('profile-information')) return 'profile';
    return 'browse';
  };

  const activeSection = getActiveSection();

  const handleDrawerToggle = () => {
    const newState = !drawerOpen;
    setDrawerOpen(newState);
    localStorage.setItem('seekerDrawerOpen', JSON.stringify(newState));
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const activeSectionTitles = {
    browse: 'Browse Properties',
    bookings: 'My Bookings',
    settings: 'System Settings',
    profile: 'Profile Information',
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', m: 0, p: 0, overflow: 'hidden' }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: 240,
              overflow: 'hidden',
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
              borderRight: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: 0,
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {/* Logo */}
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
            <RouterLink 
              to="/seeker/dashboard/browse-property"
              style={{ 
                textDecoration: 'none',
                display: 'block',
                flexGrow: 1
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
                    }
                  }}
                />
                {drawerOpen && (
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
            </RouterLink>
            <IconButton
              onClick={() => setMobileOpen(false)}
              sx={{
                width: 32,
                height: 32,
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                '&:hover': {
                  color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                  background: 'transparent',
                  transform: 'scale(1.1)',
                },
                '&:focus': {
                  outline: 'none'
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeftOutlinedIcon />
            </IconButton>
          </Box>

          {/* Mobile Drawer Content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100% - 64px)',
            overflow: 'hidden'
          }}>
            <List sx={{ 
              p: 1.5,
              flex: 1,
              overflow: 'auto'
            }}>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.section}
                  onClick={() => handleNavigation(item.path)}
                  selected={activeSection === item.section}
                  sx={{
                    py: 1.5,
                    minHeight: 48,
                    px: 2.5,
                    borderRadius: '8px',
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: theme => `${theme.palette.primary.main}15`,
                    },
                    '&:hover': {
                      bgcolor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.04)',
                      '& .MuiListItemIcon-root': {
                        transform: 'scale(1.1)',
                      }
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 0,
                      mr: 2,
                      color: activeSection === item.section ? 'primary.main' : 'text.secondary',
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
                    primaryTypographyProps={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: activeSection === item.section ? 600 : 500,
                      color: activeSection === item.section ? 'primary.main' : 'text.primary',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}
                  />
                </ListItemButton>
              ))}
            </List>

            {/* Logout Button */}
            <Box sx={{ p: 1.5 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.04)',
                    '& .MuiListItemIcon-root': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0,
                    mr: 2,
                    color: 'error.main',
                    transition: theme => theme.transitions.create(['color', 'transform'], {
                      duration: '0.2s'
                    }),
                    fontSize: '1.2rem',
                  }}
                >
                  <LogoutOutlinedIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout"
                  primaryTypographyProps={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'error.main',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.3px',
                  }}
                />
              </ListItemButton>
            </Box>
          </Box>
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerOpen ? 240 : 65,
              overflow: 'hidden',
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
              borderRight: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: 0,
            },
          }}
        >
          {/* Logo */}
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
            <RouterLink 
              to="/seeker/dashboard/browse-property"
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
                    }
                  }}
                />
                {drawerOpen && (
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
            </RouterLink>
            {!drawerOpen ? (
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

          {/* Drawer Content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100% - 64px)',
            overflow: 'hidden'
          }}>
            <List sx={{ 
              p: 1.5,
              flex: 1,
              overflow: 'auto'
            }}>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.section}
                  selected={activeSection === item.section}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    borderRadius: '8px',
                    mb: 0.5,
                    justifyContent: drawerOpen ? 'initial' : 'center',
                    '&.Mui-selected': {
                      bgcolor: `${theme.palette.primary.main}15`,
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: activeSection === item.section ? 'primary.main' : 'text.secondary',
                    transition: theme => theme.transitions.create(['color', 'transform'], {
                      duration: '0.2s'
                    }),
                    fontSize: '1.2rem',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        opacity: drawerOpen ? 1 : 0,
                        transition: theme => theme.transitions.create(['opacity', 'color'], {
                          duration: theme.transitions.duration.enteringScreen,
                        }),
                      }}
                      primaryTypographyProps={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.9rem',
                        fontWeight: activeSection === item.section ? 600 : 500,
                        color: activeSection === item.section ? 'primary.main' : 'text.primary',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.3px',
                      }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>

            {/* Logout Button */}
            <Box sx={{ p: 1.5 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '8px',
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  '&:hover': {
                    bgcolor: theme => theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.04)',
                    '& .MuiListItemIcon-root': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0,
                    mr: drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: 'error.main',
                    transition: theme => theme.transitions.create(['color', 'transform'], {
                      duration: '0.2s'
                    }),
                    fontSize: '1.2rem',
                  }}
                >
                  <LogoutOutlinedIcon />
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary="Logout"
                    sx={{ 
                      opacity: drawerOpen ? 1 : 0,
                      transition: theme => theme.transitions.create(['opacity'], {
                        duration: theme.transitions.duration.enteringScreen,
                      }),
                    }}
                    primaryTypographyProps={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'error.main',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}
                  />
                )}
              </ListItemButton>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { lg: `calc(100% - ${drawerOpen ? 240 : 65}px)` },
            ml: { lg: `${drawerOpen ? 240 : 65}px` },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            p: 0,
            m: 0,
            '& > *': {
              m: '0 !important',
              p: '0 !important'
            }
          }}
        >
          {/* Mobile/Tablet AppBar */}
          <AppBar
            position="static" 
            color="inherit" 
            elevation={0}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              borderRadius: 0
            }}
          >
            <Toolbar sx={{ position: 'relative' }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  if (isMobile) {
                    setMobileOpen(!mobileOpen);
                  } else {
                    handleDrawerToggle();
                  }
                }}
                sx={{ mr: 2, display: { lg: 'none' } }}
              >
                <LeftPanelIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1, 
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  fontSize: '1.1rem',
                  textAlign: { xs: 'center', md: 'left' },
                  position: { xs: 'absolute', md: 'static' },
                  left: { xs: '50%', md: 'auto' },
                  transform: { xs: 'translateX(-50%)', md: 'none' },
                  width: { xs: 'auto', md: 'auto' }
                }}
              >
                {activeSectionTitles[activeSection]}
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SeekerLayout; 