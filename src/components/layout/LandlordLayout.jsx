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
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, alpha } from '@mui/material/styles';

const LandlordLayout = ({ children, theme, mode, toggleColorMode, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const menuItems = [
    { 
      section: 'properties',
      path: '/dashboard/landlord/property-management',
      icon: <HomeIcon />, 
      label: 'Property Management'
    },
    { 
      section: 'analytics',
      path: '/dashboard/landlord/property-analytics',
      icon: <DashboardIcon />, 
      label: 'Property Analytics'
    },
    { 
      section: 'settings',
      path: '/dashboard/landlord/system-settings',
      icon: <SettingsIcon />, 
      label: 'System Settings'
    },
    { 
      section: 'profile',
      path: '/dashboard/landlord/profile-information',
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
    setDrawerOpen(!drawerOpen);
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

  const handleMobileMenuItemClick = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const activeSectionTitles = {
    properties: 'Property Management',
    analytics: 'Property Analytics',
    settings: 'System Settings',
    profile: 'Profile Information',
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', m: 0, p: 0, overflow: 'hidden' }}>
        {/* Desktop Drawer - Hide on mobile/tablet */}
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerOpen ? 280 : 72,
              overflow: 'hidden',
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              bgcolor: 'background.paper',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 0,
            },
          }}
        >
          {/* Logo */}
          <Box sx={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2,
            minHeight: 64
          }}>
            <RouterLink to="/dashboard/landlord/property-management" style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center'
              }}>
              <img
                src="/src/assets/RR.png"
                alt="RoomRadar Logo"
                style={{
                    maxWidth: drawerOpen ? '150px' : '40px',
                    height: 'auto',
                    transition: 'all 0.3s ease'
                }}
              />
              </Box>
            </RouterLink>
          </Box>

          <Divider />

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
                  onClick={() => navigate(item.path)}
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
                    color: activeSection === item.section ? 'primary.main' : 'text.secondary'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        opacity: drawerOpen ? 1 : 0,
                        '& .MuiTypography-root': {
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              ))}

              <Divider sx={{ my: 1 }} />

              {/* Theme toggle and notifications */}
              <ListItemButton
                onClick={toggleColorMode}
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
                }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }
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
                }}>
                  <Badge badgeContent={4} color="error">
                    <NotificationsOutlinedIcon />
                  </Badge>
                </ListItemIcon>
                {drawerOpen && (
                  <ListItemText 
                    primary="Notifications"
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: 600,
                        fontSize: '0.875rem'
                  }
                }}
                  />
                )}
              </ListItemButton>
            </List>

            {/* Bottom buttons */}
            <Box sx={{ p: 1.5 }}>
              <ListItemButton
                onClick={handleDrawerToggle}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '8px',
                  mb: 1,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit'
                }}>
                  {drawerOpen ? <ChevronLeftOutlinedIcon /> : <ChevronRightOutlinedIcon />}
                </ListItemIcon>
                {drawerOpen && (
                <ListItemText
                    primary="Collapse"
                    sx={{ 
                      '& .MuiTypography-root': {
                    fontWeight: 600,
                        fontSize: '0.875rem'
                      }
                  }}
                />
                )}
              </ListItemButton>

            <ListItemButton
              onClick={handleLogout}
              sx={{
                  minHeight: 48,
                  px: 2.5,
                  borderRadius: '8px',
                  color: 'error.main',
                  justifyContent: drawerOpen ? 'initial' : 'center',
                '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit'
                }}>
                  <LogoutOutlinedIcon />
              </ListItemIcon>
                {drawerOpen && (
              <ListItemText
                primary="Logout"
                    sx={{ 
                      '& .MuiTypography-root': {
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }
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
            width: { lg: `calc(100% - ${drawerOpen ? 280 : 72}px)` },
            ml: { lg: `${drawerOpen ? 280 : 72}px` },
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
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              width: '100%',
              m: 0,
              borderRadius: 0,
              '& .MuiToolbar-root': {
                borderRadius: 0
              }
            }}
          >
            <Toolbar 
              disableGutters
              sx={{
                minHeight: '64px !important',
                px: { xs: 2, lg: 3 },
                gap: 1,
                justifyContent: 'space-between',
                width: '100%',
                m: 0,
                borderRadius: 0
              }}
            >
              {/* Logo - Show on mobile/tablet */}
              <Box
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  alignItems: 'center',
                }}
              >
                <RouterLink to="/dashboard/landlord/property-management" style={{ textDecoration: 'none' }}>
                    <img
                      src="/src/assets/RR.png"
                      alt="RoomRadar Logo"
                      style={{
                      height: '40px',
                      width: 'auto',
                      }}
                    />
                  </RouterLink>
                </Box>

              {/* Title - Show on all screens */}
              <Typography 
                variant="h6" 
                color="textPrimary" 
                noWrap 
                sx={{ 
                  fontSize: '1rem',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {activeSectionTitles[activeSection]}
              </Typography>

              {/* Mobile Menu Button */}
                  <IconButton
                color="inherit"
                aria-label="open menu"
                onClick={handleMobileMenuOpen}
                disableRipple
                    sx={{
                  display: { xs: 'flex', lg: 'none' },
                  ml: 1,
                  color: 'primary.main',
                  position: 'relative',
                      p: 1,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    '& .menu-icon': {
                      transform: 'rotate(180deg)',
                    }
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-visible': {
                    outline: 'none',
                  },
                  '&:active': {
                    backgroundColor: 'transparent',
                  }
                    }}
                  >
                <Box
                  className="menu-icon"
                  sx={{
                    position: 'relative',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& span': {
                      display: 'block',
                      width: '100%',
                      height: 1.5,
                      bgcolor: 'currentColor',
                      borderRadius: 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&:hover': {
                      '& span:nth-of-type(1)': {
                        transform: 'translateY(6px) rotate(45deg)',
                      },
                      '& span:nth-of-type(2)': {
                        opacity: 0,
                        transform: 'scaleX(0)',
                      },
                      '& span:nth-of-type(3)': {
                        transform: 'translateY(-6px) rotate(-45deg)',
                      }
                    }
                  }}
                >
                  <span />
                  <span />
                  <span />
                </Box>
                  </IconButton>

              {/* Mobile Menu */}
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    width: 280,
                    maxWidth: '100%',
                    mt: 1,
                    '& .MuiList-root': {
                      py: 1
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.section}
                    onClick={() => handleMobileMenuItemClick(item.path)}
                    selected={activeSection === item.section}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      mx: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: `${theme.palette.primary.main}15`,
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: activeSection === item.section ? 'primary.main' : 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </MenuItem>
                ))}

                <Divider sx={{ my: 1 }} />

                {/* Theme Toggle */}
                <MenuItem
                  onClick={toggleColorMode}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon>
                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </ListItemIcon>
                  <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
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
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LandlordLayout; 