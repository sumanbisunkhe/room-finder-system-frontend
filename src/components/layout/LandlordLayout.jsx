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
  Dashboard as DashboardIcon,
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

const LandlordLayout = ({ 
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
    const savedState = localStorage.getItem('landlordDrawerOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const menuItems = [
    { 
      section: 'properties',
      path: '/landlord/dashboard/property-management',
      icon: <HomeIcon />, 
      label: 'Manage Properties'
    },
    { 
      section: 'analytics',
      path: '/landlord/dashboard/property-analytics',
      icon: <DashboardIcon />, 
      label: 'Property Analytics'
    },
    { 
      section: 'settings',
      path: '/landlord/dashboard/system-settings',
      icon: <SettingsIcon />, 
      label: 'System Settings'
    },
    { 
      section: 'profile',
      path: '/landlord/dashboard/profile-information',
      icon: <AccountCircleIcon />, 
      label: 'Profile Information'
    }
  ];

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('property-management')) return 'properties';
    if (path.includes('property-analytics')) return 'analytics';
    if (path.includes('system-settings')) return 'settings';
    if (path.includes('profile-information')) return 'profile';
    return 'properties';
  };

  const activeSection = getActiveSection();

  const handleDrawerToggle = () => {
    const newState = !drawerOpen;
    setDrawerOpen(newState);
    localStorage.setItem('landlordDrawerOpen', JSON.stringify(newState));
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
    properties: 'Manage Properties',
    analytics: 'Property Analytics',
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <RouterLink 
                to="/landlord/dashboard/property-management"
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
          </Box>

          <Divider sx={{ 
            borderColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.05)' 
              : 'rgba(0,0,0,0.08)',
            my: 1 
          }} />

          {/* Mobile Drawer Content */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100% - 64px)',
            overflow: 'hidden'
          }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1.5, py: 2 }}>
              <List>
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

              <Divider sx={{ 
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.08)',
                my: 1 
              }} />

              {/* Theme toggle and logout */}
              <List sx={{ px: 1.5, pb: 2 }}>
                <ListItemButton
                  onClick={() => {
                    if (mode === 'dark') {
                      onThemeChange('light');
                    } else if (mode === 'light') {
                      onThemeChange('system');
                    } else {
                      onThemeChange('dark');
                    }
                  }}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    borderRadius: '8px',
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: 2,
                    transition: theme => theme.transitions.create(['color', 'transform'], {
                      duration: '0.2s'
                    }),
                    fontSize: '1.2rem',
                  }}>
                    {mode === 'dark' ? <LightModeIcon /> : mode === 'light' ? <DarkModeIcon /> : <AutoAwesomeIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={mode === 'dark' ? 'Light Mode' : mode === 'light' ? 'Dark Mode' : 'System Mode'}
                    primaryTypographyProps={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}
                  />
                </ListItemButton>

                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    borderRadius: '8px',
                    mb: 0.5,
                    color: 'error.main',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      backgroundColor: theme => alpha(theme.palette.error.main, 0.08),
                      '& .MuiListItemIcon-root': {
                        transform: 'scale(1.1)',
                      }
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: 2,
                    color: 'inherit',
                    transition: 'transform 0.2s',
                  }}>
                    <LogoutOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logout"
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
            </Box>
          </Box>
        </Drawer>

        {/* Desktop Drawer - Hide on mobile/tablet */}
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
              to="/landlord/dashboard/property-management"
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
            {/* Expand/Collapse Button */}
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

          <Divider sx={{ 
            borderColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.05)' 
              : 'rgba(0,0,0,0.08)',
            my: 1 
          }} />

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

              <Divider sx={{ 
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.08)',
                my: 1 
              }} />

              {/* Theme toggle and notifications */}
              <ListItemButton
                onClick={() => {
                  if (mode === 'dark') {
                    onThemeChange('light');
                  } else if (mode === 'light') {
                    onThemeChange('system');
                  } else {
                    onThemeChange('dark');
                  }
                }}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '8px',
                  mb: 0.5,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  transition: theme => theme.transitions.create(['color', 'transform'], {
                    duration: '0.2s'
                  }),
                  fontSize: '1.2rem',
                }}>
                  {mode === 'dark' ? <LightModeIcon /> : mode === 'light' ? <DarkModeIcon /> : <AutoAwesomeIcon />}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary={mode === 'dark' ? 'Light Mode' : mode === 'light' ? 'Dark Mode' : 'System Mode'}
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
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}
                  />
                )}
              </ListItemButton>

              <ListItemButton
                onClick={handleNotificationsOpen}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '8px',
                  mb: 0.5,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  transition: theme => theme.transitions.create(['color', 'transform'], {
                    duration: '0.2s'
                  }),
                  fontSize: '1.2rem',
                }}>
                  <Badge badgeContent={4} color="error">
                    <NotificationsOutlinedIcon />
                  </Badge>
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary="Notifications"
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
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                }}
                  />
                )}
              </ListItemButton>
            </List>

            {/* Bottom buttons */}
            <Box sx={{ p: 1.5 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  minHeight: 48,
                  borderRadius: '8px',
                  color: 'error.main',
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
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
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                }}>
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
            sx={{ borderBottom: 1, borderColor: 'divider' }}
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
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                  onClick={() => {
                    if (mode === 'dark') {
                      onThemeChange('light');
                    } else if (mode === 'light') {
                      onThemeChange('system');
                    } else {
                      onThemeChange('dark');
                    }
                  }}
                disableRipple
                    sx={{
                    width: 40,
                    height: 40,
                    color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    '&:hover': {
                      color: theme => theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                      background: 'transparent'
                    },
                    '&:focus': {
                      outline: 'none'
                    }
                  }}
                >
                  {mode === 'dark' ? <DarkModeIcon /> : mode === 'light' ? <LightModeIcon /> : <AutoAwesomeIcon />}
                </IconButton>
                </Box>
            </Toolbar>
          </AppBar>

              {/* Mobile Menu */}
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                PaperProps={{
              elevation: 0,
                  sx: {
                    width: 280,
                    maxWidth: '100%',
                mt: 1.5,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    '& .MuiList-root': {
                      py: 1
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.section}
                    onClick={() => handleNavigation(item.path)}
                    selected={activeSection === item.section}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                    bgcolor: theme => `${theme.palette.primary.main}15`,
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: activeSection === item.section ? 'primary.main' : 'text.secondary' }}>
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
                  </MenuItem>
                ))}

                <Divider sx={{ my: 1 }} />

                {/* Theme Toggle */}
                <MenuItem
                  onClick={() => {
                    if (mode === 'dark') {
                      onThemeChange('light');
                    } else if (mode === 'light') {
                      onThemeChange('system');
                    } else {
                      onThemeChange('dark');
                    }
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon>
                    {mode === 'dark' ? <LightModeIcon /> : mode === 'light' ? <DarkModeIcon /> : <AutoAwesomeIcon />}
                  </ListItemIcon>
              <ListItemText 
                primary={mode === 'dark' ? 'Light Mode' : mode === 'light' ? 'Dark Mode' : 'System Mode'}
                primaryTypographyProps={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                }}
              />
                </MenuItem>

                {/* Logout */}
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    color: 'error.main',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <LogoutOutlinedIcon />
                  </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                }}
              />
                </MenuItem>
              </Menu>

          {/* Page Content */}
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LandlordLayout; 