import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  Switch
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

import Bookings from '../../components/dashboard/seeker/Bookings';
import PropertyAnalytics from '../../components/dashboard/seeker/PropertyAnalytics';
import Messages from '../../components/dashboard/seeker/Messages';
import SystemSettings from '../../components/dashboard/seeker/SystemSettings';
import Profile from '../../components/dashboard/seeker/Profile';

import * as userService from '../../services/userService';
import * as roomService from '../../services/roomService';

const drawerWidth = 280;

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('seekerThemeMode');
    return savedMode || 'light';
  });
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeSection, setActiveSection] = useState('bookings');
  const [properties, setProperties] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchProperties();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userService.getCurrentUser();
      setUser(response.data);
          } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await roomService.getProperties();
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('seekerThemeMode', newMode);
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await userService.updateProfile(profileData);
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const menuItems = [
    { text: 'Bookings', icon: HomeIcon, section: 'bookings' },
    { text: 'Analytics', icon: DashboardIcon, section: 'analytics' },
    { text: 'Messages', icon: MessageIcon, section: 'messages' },
    { text: 'Settings', icon: SettingsIcon, section: 'settings' },
    { text: 'Profile', icon: PersonIcon, section: 'profile' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'bookings':
        return <Bookings />;
      case 'analytics':
        return <PropertyAnalytics properties={properties} />;
      case 'messages':
        return <Messages />;
      case 'settings':
      return (
          <SystemSettings
            onExport={async () => {
              const data = await userService.exportData();
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'user-data.json';
              a.click();
            }}
            onImport={async (data) => {
              await userService.importData(data);
              fetchUserData();
              fetchProperties();
            }}
            onPasswordChange={async (passwordData) => {
              await userService.changePassword(passwordData);
            }}
            onDeleteAccount={async () => {
              await userService.deleteAccount();
              navigate('/login');
            }}
            onNotificationChange={async (type, value) => {
              await userService.updateNotificationSettings({ [type]: value });
            }}
          />
        );
      case 'profile':
        return user && <Profile user={user} onUpdateProfile={handleUpdateProfile} />;
      default:
        return <Bookings />;
    }
  };

  if (!user) {
    return null;
  }

                          return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
                    sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
                  <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
                  </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.section === activeSection)?.text || 'Dashboard'}
                  </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
                  <Switch
                    checked={mode === 'dark'}
                    onChange={toggleColorMode}
              icon={<LightModeIcon />}
              checkedIcon={<DarkModeIcon />}
            />
            <Avatar src={user.avatar}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
                </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
        <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
          sx={{
          width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
            width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Room Finder
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
          </Box>
          <Divider />
        <List>
          {menuItems.map(({ text, icon: Icon, section }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                selected={activeSection === section}
                onClick={() => setActiveSection(section)}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
          </List>
        </Drawer>

      {/* Main Content */}
        <Box
          component="main"
          sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: 8
        }}
      >
        {renderContent()}
                </Box>
                        </Box>
  );
};

export default SeekerDashboard;