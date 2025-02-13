// src\pages\dashboards\AdminDashboard.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Container,
  Divider,
  Avatar,
  InputAdornment,
  ListItemButton,
  styled,
  alpha,
  CircularProgress,
  Switch,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Card,

} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  People as UsersIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  BackupTable as BackupIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  Domain as DomainIcon,
  Schedule as ScheduleIcon,
  AccountCircleOutlined,
  AccountCircle,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import PublishIcon from '@mui/icons-material/Publish';


import * as userService from '../../services/userService';
import Grid2 from '@mui/material/Unstable_Grid2';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Area, AreaChart
} from 'recharts';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { csCZ } from '@mui/material/locale';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // All state declarations moved to the top level
  const [mode, setMode] = useState('light');
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    userRoleDistribution: {},
    genderDistribution: {},
    ageGroups: {},
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: '',
  });

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'SEEKER',
    status: 'active',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    emailFrom: 'noreply@roomradar.com',
    enableSSL: true,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    backupTime: '00:00',
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'RoomRadar',
    supportEmail: 'support@roomradar.com',
    supportPhone: '+1234567890',
    defaultLanguage: 'en',
    timezone: 'UTC',
  });

  // Theme creation moved outside of conditional rendering
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: ['"Inter", sans-serif', '"Space Grotesk", sans-serif'].join(','),
          h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
          h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
          h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
          h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
        },
        palette: {
          mode: mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode,
          primary: {
            main: mode === 'dark' ? '#7C4DFF' : '#6366F1',
          },
          secondary: {
            main: mode === 'dark' ? '#22D3EE' : '#3B82F6',
          },
          background: {
            default: mode === 'dark' ? '#0F172A' : '#F8FAFC',
            paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '16px',
                boxShadow: mode === 'dark'
                  ? '0px 4px 6px rgba(0, 0, 0, 0.25)'
                  : '0px 4px 6px rgba(0, 0, 0, 0.05)',
                border: `1px solid ${mode === 'dark' ? '#2E3A4D' : '#E2E8F0'}`,
              },
            },
          },
        },
      }),
    [mode, prefersDarkMode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching current user...");

      const response = await userService.getCurrentUser();
      console.log("Full User Response:", response);

      if (!response.success || !response.data) {
        throw new Error("Invalid user data format");
      }

      const userData = response.data; // Extract the actual user object
      console.log("Extracted User Data:", userData);

      setCurrentUser(userData);
      setProfileForm({
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        role: userData.role || 'ADMIN'
      });
    } catch (err) {
      console.error("Fetch Current User Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);



  const fetchAndProcessUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.fetchUsers();
      const processedUsers = fetchedUsers.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      const stats = {
        totalUsers: processedUsers.length,
        activeUsers: processedUsers.filter((user) => user.isActive).length,
        inactiveUsers: processedUsers.filter((user) => !user.isActive).length,
        userRoleDistribution: processedUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {})
      };

      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
      setUserStats(stats);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Users CSV
  const handleExportUsersCSV = async () => {
    try {
      setLoading(true);
      await userService.exportUsersToCSV();
      setSnackbar({ open: true, message: 'Users exported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to export users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportUsersCSV = async (file) => {
    setLoading(true);
    try {
      await userService.importUsersFromCSV(file);
      // Only proceed if no error was thrown
      await fetchAndProcessUsers();
      setSnackbar({
        open: true,
        message: 'Users imported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.log('Caught error in handleImportUsersCSV:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to import users',
        severity: 'error'
      });
      // Return early to prevent any further processing
      return;
    } finally {
      setLoading(false);
    }
  };


  // Rooms CSV
  const handleExportRoomsCSV = async () => {
    try {
      setLoading(true);
      await userService.exportRoomsToCSV();
      setSnackbar({ open: true, message: 'Rooms exported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to export rooms', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportRoomsCSV = async (file) => {
    try {
      setLoading(true);
      await userService.importRoomsFromCSV(file);
      setSnackbar({ open: true, message: 'Rooms imported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to import rooms', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Messages CSV
  const handleExportMessagesCSV = async () => {
    try {
      setLoading(true);
      await userService.exportMessagesToCSV();
      setSnackbar({ open: true, message: 'Messages exported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to export messages', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportMessagesCSV = async (file) => {
    try {
      setLoading(true);
      await userService.importMessagesFromCSV(file);
      setSnackbar({ open: true, message: 'Messages imported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to import messages', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Bookings CSV
  const handleExportBookingsCSV = async () => {
    try {
      setLoading(true);
      await userService.exportBookingsToCSV();
      setSnackbar({ open: true, message: 'Bookings exported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to export bookings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportBookingsCSV = async (file) => {
    try {
      setLoading(true);
      await userService.importBookingsFromCSV(file);
      setSnackbar({ open: true, message: 'Bookings imported successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to import bookings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchAndProcessUsers();
  }, [fetchAndProcessUsers]);

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      result = result.filter((user) => {
        const username = user?.username?.toLowerCase() || '';
        const email = user?.email?.toLowerCase() || '';
        const firstName = user?.firstName?.toLowerCase() || '';
        const lastName = user?.lastName?.toLowerCase() || '';
        const searchTermLower = searchTerm.toLowerCase();
        return (
          username.includes(searchTermLower) ||
          email.includes(searchTermLower) ||
          firstName.includes(searchTermLower) ||
          lastName.includes(searchTermLower)
        );
      });
    }
    if (userFilter !== 'all') {
      result = result.filter((user) => user?.role === userFilter);
    }
    setFilteredUsers(result);
  }, [searchTerm, userFilter, users]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('user-management')) {
      setActiveSection('users');
    } else if (path.includes('user-analytics')) {
      setActiveSection('analytics');
    } else if (path.includes('system-settings')) {
      setActiveSection('settings');
    }
    else if (path.includes('profile-information')) {
      setActiveSection('profile');
    }
    else if (path.includes('csv-operations')) {
      setActiveSection('csv');
    }

  }, [location.pathname]);

  // Read URL params on mount and when URL changes
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    setSearchTerm(search);
    setUserFilter(filter);
  }, [searchParams]);

  // Update URL params when search or filter changes
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (userFilter !== 'all') params.filter = userFilter;
    setSearchParams(params);
  }, [searchTerm, userFilter, setSearchParams]);

  const getNewUsersCountByDate = (users, date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= startOfDay && createdAt <= endOfDay;
    }).length;
  };

  const handleUserAction = async (userId, action) => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: 'Invalid user ID',
        severity: 'error',
      });
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
      if (!confirmed) return;
    }

    try {
      setLoading(true);

      let response;
      let successMessage;

      switch (action) {
        case 'deactivate':
          response = await userService.deactivateUser(userId);
          successMessage = 'User deactivated successfully';
          break;
        case 'activate':
          response = await userService.activateUser(userId);
          successMessage = 'User activated successfully';
          break;
        case 'delete':
          response = await userService.deleteUser(userId);
          successMessage = 'User deleted successfully';
          break;
        default:
          throw new Error('Invalid action');
      }

      await fetchAndProcessUsers();

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success',
      });

    } catch (error) {
      const errorMessage = error.message || `Failed to ${action} user`;

      if (error.response?.status === 404) {
        setSnackbar({
          open: true,
          message: 'User not found',
          severity: 'error',
        });
      } else if (error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to perform this action',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      setSnackbar({
        open: true,
        message: 'No user selected for update',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        fullName: userForm.fullName,
        phoneNumber: userForm.phoneNumber,
        role: userForm.role,
        active: userForm.status === 'active'
      };

      await userService.updateUserProfile(selectedUser.id, updateData);
      await fetchAndProcessUsers();

      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success',
      });

      setIsUserModalOpen(false);
      setSelectedUser(null);
      setUserForm({
        username: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        role: 'SEEKER',
        status: 'active',
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await userService.updateUserProfile(currentUser.id, profileForm);
      await fetchCurrentUser();
      setIsEditModalOpen(false);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to update profile",
        severity: "error"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const menuItems = [
    { section: 'users', icon: <UsersIcon />, label: 'User Management' },
    { section: 'analytics', icon: <DashboardIcon />, label: 'User Analytics' },
    { section: 'settings', icon: <SettingsIcon />, label: 'System Settings' },
    { section: 'csv', icon: <BackupIcon />, label: 'CSV Operations' },
    { section: 'profile', icon: <AccountCircle />, label: 'Profile Information' }

  ];

  const activeSectionTitles = {
    users: 'User Management',
    analytics: 'User Analytics',
    settings: 'System Settings',
    csv: 'CSV Operations',
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  }));

  const RoleBadge = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    textTransform: 'capitalize',
    borderRadius: '6px',
    '&.SEEKER': { backgroundColor: alpha('#3B82F6', 0.1), color: '#3B82F6' },
    '&.LANDLORD': { backgroundColor: alpha('#10B981', 0.1), color: '#10B981' },
    '&.ADMIN': { backgroundColor: alpha('#8B5CF6', 0.1), color: '#8B5CF6' },
  }));

  const activityData = useMemo(() => {
    const dates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const newUsersCount = getNewUsersCountByDate(users, date);
      const activeUsersCount = Math.floor(
        userStats.activeUsers * (0.85 + (Math.sin(i / 2) * 0.15))
      );

      dates.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        'Active Users': activeUsersCount,
        'New Users': newUsersCount
      });
    }
    return dates;
  }, [users, userStats.activeUsers]);

  const StatCard = ({ title, value, icon, color }) => (
    <Paper sx={{
      p: 3,
      background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
      color: 'white',
      height: '100%',
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: alpha('#fff', 0.1),
          p: 1.5,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 32 } })}
        </Box>
      </Stack>
    </Paper>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Paper>
      </Container>
    );
  }

  const renderProfile = () => {
    return (
      // <Container maxWidth="lg" sx={{ py: 4 }}>
      <Container maxWidth={{ xs: "xl", md: "lg" }} sx={{ py: { xs: 8, md: 0 } }}>
        <Stack spacing={4}>
          {/* Header Card */}
          <Card
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: 4,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                border: '4px solid lightgray ',
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '3rem',
                mx: 'auto',
                mb: 2,
              }}
            >
              {currentUser?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" >
              {currentUser?.fullName || currentUser?.username}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
              {currentUser?.role}
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Edit Profile
            </Button>
          </Card>

          {/* Info Cards */}
          <Grid2 container spacing={3}>
            <Grid2 item xs={12} md={12}>
              <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Username
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>{currentUser?.username}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BadgeIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>
                        {currentUser?.fullName || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid2>

            <Grid2 item xs={12} md={12}>
              <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Email
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>{currentUser?.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>
                        {currentUser?.phoneNumber || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid2>
          </Grid2>
        </Stack>

        {/* Edit Profile Dialog */}
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit Profile
            <IconButton
              onClick={() => setIsEditModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Username"
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, username: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Password"
                value={profileForm.password}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, password: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, fullName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={profileForm.phoneNumber}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                }
              />
              <TextField
                fullWidth
                disabled
                label="Role"
                value={profileForm.role}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, role: e.target.value })
                }
              />

            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: '12px',
              boxShadow: theme.shadows[3],
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  };


  const renderUserManagement = () => (
    <Container maxWidth="xl" sx={{ pt: 2 }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            background: (theme) =>
              `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(
                theme.palette.background.paper,
                0.95
              )})`,
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            position: { xs: 'sticky', md: 'static' },
            top: { xs: '64px', md: 0 },
            zIndex: 2,
          }}
        >
          <Grid2 container spacing={2} alignItems="center">
            {/* Search Users - Takes 1/2 space on mobile */}
            <Grid2 xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users..."
                value={searchTerm}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    },
                  },
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid2>

            {/* Filter User - Takes 1/4 space on mobile */}
            <Grid2 xs={6} sm={3} md="auto">
              <Select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                fullWidth
                sx={{
                  minWidth: '120px',
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="SEEKER">Seekers</MenuItem>
                <MenuItem value="LANDLORD">Landlords</MenuItem>
                <MenuItem value="ADMIN">Admins</MenuItem>
              </Select>
            </Grid2>

            {/* Add User - Takes 1/4 space on mobile */}
            <Grid2 xs={6} sm={3} md="auto">
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setIsUserModalOpen(true)}
                sx={{
                  borderRadius: '12px',
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  },
                }}
              >
                Add
              </Button>
            </Grid2>
          </Grid2>
        </Paper>


        {/* Desktop View */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',

          }}>
            <TableContainer sx={{ maxHeight: '70vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="28%">User Info</TableCell>
                    <TableCell width="25%">Contact Details</TableCell>
                    <TableCell width="12%">Role</TableCell>
                    <TableCell width="10%">Status</TableCell>
                    <TableCell width="15%">Registration</TableCell>
                    <TableCell width="10%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <StyledTableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          {/* <Avatar sx={{
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '0.875rem'
                        }}>
                          {user.username[0].toUpperCase()}
                        </Avatar> */}
                          <Box>
                            <Typography variant="subtitle2" noWrap>{user.username}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                              {user.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {user.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {user.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RoleBadge
                          label={user.role}
                          className={user.role}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            fontWeight: 600,
                            backgroundColor: user.isActive
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.error.main, 0.1),
                            color: user.isActive
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block" noWrap>
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Updated: {new Date(user.updatedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserForm({
                                username: user.username,
                                email: user.email,
                                fullName: user.fullName,
                                phoneNumber: user.phoneNumber,
                                role: user.role,
                                status: user.isActive ? 'active' : 'inactive',
                              });
                              setIsUserModalOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                          >
                            {user.isActive ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Mobile View - Enhanced Cards */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack spacing={2}>
            {filteredUsers.map((user) => (
              <Paper
                key={user.id}
                elevation={0}
                sx={{
                  p: 0,
                  overflow: 'hidden',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },

                }}
              >
                {/* User Card Header */}
                <Box sx={{
                  p: 2,
                  background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                          color: 'primary.main',
                        }}
                      >
                        {user.username[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: user.isActive
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.error.main, 0.1),
                          color: user.isActive
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Stack>
                </Box>

                {/* User Card Content */}
                <Box sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Grid2 container spacing={2}>
                      <Grid2 item xs={12}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <RoleBadge
                            label={user.role}
                            className={user.role}
                            size="small"
                          />
                        </Stack>
                      </Grid2>
                      <Grid2 item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Contact Information
                          </Typography>
                          <Box sx={{ pl: 1 }}>
                            <Typography variant="body2">
                              {user.email}
                            </Typography>
                            <Typography variant="body2">
                              {user.phoneNumber}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid2>
                      <Grid2 item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Full Name
                          </Typography>
                          <Typography variant="body2" sx={{ pl: 1 }}>
                            {user.fullName}
                          </Typography>
                        </Stack>
                      </Grid2>
                    </Grid2>

                    <Divider />

                    {/* Action Buttons */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserForm({
                              username: user.username,
                              email: user.email,
                              fullName: user.fullName,
                              phoneNumber: user.phoneNumber,
                              role: user.role,
                              status: user.isActive ? 'active' : 'inactive',
                            });
                            setIsUserModalOpen(true);
                          }}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                          sx={{
                            bgcolor: (theme) => alpha(
                              user.isActive ? theme.palette.error.main : theme.palette.success.main,
                              0.1
                            ),
                            '&:hover': {
                              bgcolor: (theme) => alpha(
                                user.isActive ? theme.palette.error.main : theme.palette.success.main,
                                0.2
                              ),
                            },
                          }}
                        >
                          {user.isActive ? (
                            <BlockIcon fontSize="small" color="error" />
                          ) : (
                            <CheckCircleIcon fontSize="small" color="success" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleUserAction(user.id, 'delete')}
                          sx={{
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );

  const renderUserAnalytics = () => {
    // Constants and utility functions
    const ROLE_COLORS = {
      SEEKER: '#6366F1',
      LANDLORD: '#10B981',
      ADMIN: '#8B5CF6'
    };

    const STATS_CONFIG = [
      { title: 'Total Users', value: userStats.totalUsers, color: '#6366F1', icon: <PeopleIcon /> },
      { title: 'Active Users', value: userStats.activeUsers, color: '#10B981', icon: <PeopleIcon /> },
      { title: 'Inactive Users', value: userStats.inactiveUsers, color: '#EF4444', icon: <PeopleIcon /> }
    ];

    const roleData = Object.entries(userStats.userRoleDistribution).map(([role, count]) => ({
      name: role,
      value: count
    }));

    // Custom tooltip component for charts
    const CustomTooltip = ({ active, payload, label }) => {
      if (!active || !payload || !payload.length) return null;
      return (
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            boxShadow: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="caption"
              display="block"
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    };

    // Chart configurations
    const chartConfigs = {
      areaChart: {
        gradients: (
          <defs>
            <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="newUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
        )
      }
    };

    return (
      <Container maxWidth="x1" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={{ xs: 2, md: 3 }}>
          {/* Stats Cards Section */}
          <Grid2 container spacing={{ xs: 2, md: 3 }}>
            {STATS_CONFIG.map((stat, index) => (
              <Grid2 key={index} item xs={12} sm={6} md={4}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
                    color: 'white',
                    borderRadius: '16px',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={500} gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{
                      bgcolor: alpha('#fff', 0.1),
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      {React.cloneElement(stat.icon, { sx: { fontSize: 32 } })}
                    </Box>
                  </Stack>
                </Paper>
              </Grid2>
            ))}
          </Grid2>

          {/* Charts Section */}
          <Grid2 container spacing={{ xs: 2, md: 3 }} direction="column">
            {/* Role Distribution Chart */}
            <Grid2 >
              <Paper
                sx={{
                  p: 3,
                  height: { xs: '400px', md: '500px' },
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',

                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Role Distribution
                </Typography>
                <Box sx={{ width: '100%', height: 'calc(100% - 40px)' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={ROLE_COLORS[entry.name]}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: ROLE_COLORS[value] }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid2>

            {/* Activity Overview Chart */}
            <Grid2 >
              <Paper
                sx={{
                  p: 3,
                  height: { xs: '400px', md: '500px' },
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',

                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Activity Overview
                </Typography>
                <Box sx={{ width: '100%', height: 'calc(100% - 40px)' }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={activityData}
                      margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                      {chartConfigs.areaChart.gradients}
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickMargin={10}
                        stroke="text.secondary"
                      />
                      <YAxis
                        fontSize={12}
                        tickMargin={10}
                        stroke="text.secondary"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Active Users"
                        stroke="#6366F1"
                        fill="url(#activeUsers)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="New Users"
                        stroke="#10B981"
                        fill="url(#newUsers)"
                        strokeWidth={2}
                      />
                      <Legend verticalAlign="top" height={36} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid2>
          </Grid2>
        </Stack>
      </Container>
    );
  };

  const renderSystemSettings = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* General Settings */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DomainIcon color="primary" />
                <span>General Settings</span>
              </Stack>
            </Typography>
            <Grid2 container spacing={3}>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Support Email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Support Phone"
                  value={generalSettings.supportPhone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Language</InputLabel>
                  <Select
                    value={generalSettings.defaultLanguage}
                    label="Default Language"
                    onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>
          </Stack>
        </Paper>

        {/* Security Settings */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SecurityIcon color="primary" />
                <span>Security Settings</span>
              </Stack>
            </Typography>
            <Grid2 container spacing={3}>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Password Length"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Session Timeout (minutes)"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Login Attempts"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.requireSpecialChar}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialChar: e.target.checked })}
                      />
                    }
                    label="Require Special Characters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.requireNumber}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, requireNumber: e.target.checked })}
                      />
                    }
                    label="Require Numbers"
                  />
                </FormGroup>
              </Grid2>
            </Grid2>
          </Stack>
        </Paper>

        {/* Email Settings */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon color="primary" />
                <span>Email Configuration</span>
              </Stack>
            </Typography>
            <Grid2 container spacing={3}>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Server"
                  value={emailSettings.smtpServer}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpServer: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Email Address"
                  value={emailSettings.emailFrom}
                  onChange={(e) => setEmailSettings({ ...emailSettings, emailFrom: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailSettings.enableSSL}
                      onChange={(e) => setEmailSettings({ ...emailSettings, enableSSL: e.target.checked })}
                    />
                  }
                  label="Enable SSL/TLS"
                />
              </Grid2>
            </Grid2>
          </Stack>
        </Paper>

        {/* Backup & Maintenance */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <BackupIcon color="primary" />
                <span>Backup & Maintenance</span>
              </Stack>
            </Typography>
            <Grid2 container spacing={3}>
              <Grid2 item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={backupSettings.backupFrequency}
                    label="Backup Frequency"
                    onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Retention Period (days)"
                  value={backupSettings.retentionDays}
                  onChange={(e) => setBackupSettings({ ...backupSettings, retentionDays: parseInt(e.target.value) })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Backup Time"
                  value={backupSettings.backupTime}
                  onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={backupSettings.autoBackup}
                      onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                    />
                  }
                  label="Enable Automatic Backups"
                />
              </Grid2>
              <Grid2 item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={() => {
                    setSnackbar({
                      open: true,
                      message: 'Manual backup initiated',
                      severity: 'info',
                    });
                  }}
                >
                  Run Manual Backup
                </Button>
              </Grid2>
            </Grid2>
          </Stack>
        </Paper>

        {/* Theme Settings */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LightModeIcon color="primary" />
                <span>Theme Settings</span>
              </Stack>
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>Color Mode</Typography>
              <Button
                variant="contained"
                onClick={toggleColorMode}
                startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                }}
              >
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Save Settings Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setSnackbar({
                open: true,
                message: 'Settings saved successfully',
                severity: 'success',
              });
            }}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              px: 4,
              py: 1.5,
            }}
          >
            Save All Settings
          </Button>
        </Box>
      </Stack>
    </Container>
  );

  const CSVCard = ({ title, onExport, onImport, icon }) => {
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const handleImportClick = () => {
      inputRef.current.click();
    };

    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          await handleImportUsersCSV(file);
        } catch (error) {
          console.error('File import error:', error);
        }
      }
    };

    const handleExportClick = async () => {
      try {
        setLoading(true);
        await onExport();
        setSnackbar({
          open: true,
          message: `${title} exported successfully`,
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || `Failed to export ${title.toLowerCase()}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Grid2 item xs={12} sm={6} md={4}>
        <Paper sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}>
          <Box sx={{ mb: 2, color: 'primary.main' }}>
            {React.cloneElement(icon, { sx: { fontSize: 40 } })}
          </Box>
          <Typography variant="h6" gutterBottom>{title}</Typography>

          <input
            type="file"
            ref={inputRef}
            style={{ display: 'none' }}
            accept=".csv"
            onChange={handleFileChange}
          />

          <Stack spacing={2} width="100%">
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportClick}
              disabled={loading}
              startIcon={<SystemUpdateAltIcon />}
            >
              {loading ? <CircularProgress size={24} /> : 'Export CSV'}
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleImportClick}
              disabled={loading}
              startIcon={<PublishIcon />}
            >
              Import CSV
            </Button>
          </Stack>
        </Paper>
      </Grid2>
    );
  };

  const renderCSV = () => (
    <Container
      maxWidth="x1" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={4}>
        <Box textAlign="center">
          {/* <Typography variant="h3" fontWeight={700} sx={{
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CSV Management
          </Typography> */}
          <Typography variant="body1" color="text.secondary">
            Import and export application data in CSV format
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : (
          <Grid2 container spacing={3}
            gap={{ md: 3 }}
            justifyContent={{ md: 'center' }}

          >
            <CSVCard
              title="Users"
              icon={<PeopleIcon />}
              onExport={handleExportUsersCSV}
              onImport={handleImportUsersCSV}
            />
            <CSVCard
              title="Rooms"
              icon={<HomeIcon />}
              onExport={handleExportRoomsCSV}
              onImport={handleImportRoomsCSV}
            />
            <CSVCard
              title="Messages"
              icon={<EmailIcon />}
              onExport={handleExportMessagesCSV}
              onImport={handleImportMessagesCSV}
            />
            <CSVCard
              title="Bookings"
              icon={<AssignmentIcon />}
              onExport={handleExportBookingsCSV}
              onImport={handleImportBookingsCSV}
            />
          </Grid2>
        )}

        <Typography variant="caption" color="text.secondary" textAlign="center">
          Supported formats: CSV files with UTF-8 encoding. Maximum file size: 10MB
        </Typography>
      </Stack>
    </Container>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', m: 0, p: 0 }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sx={{
            width: 280,
            flexShrink: 0,
            zIndex: (theme) => theme.zIndex.appBar + 1,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              borderRadius: 0,
            },
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <img
              src="/src/assets/RR.png"
              alt="RoomRadar Logo"
              style={{

                maxWidth: '200px',  // Adjust this value based on your needs
                height: 'auto'
              }}
            />
          </Box>
          <Divider />
          <List sx={{ p: 2 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.section}
                selected={activeSection === item.section}
                onClick={() => {
                  setActiveSection(item.section);
                  switch (item.section) {
                    case 'profile':
                      navigate('/dashboard/admin/profile-information');
                      break;
                    case 'users':
                      navigate('/dashboard/admin/user-management');
                      break;
                    case 'analytics':
                      navigate('/dashboard/admin/user-analytics');
                      break;
                    case 'settings':
                      navigate('/dashboard/admin/system-settings');
                      break;
                    case 'csv':
                      navigate('/dashboard/admin/csv-operations');
                      break;
                    default:
                      break;
                  }
                }}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}15`,
                    '&:hover': { bgcolor: `${theme.palette.primary.main}20` },
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: activeSection === item.section ? theme.palette.primary.main : 'text.secondary'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: activeSection === item.section ? 'text.primary' : 'text.secondary'
                  }}
                />
              </ListItemButton>
            ))}
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            // flexGrow: 1,
            // width: { sm: `calc(100% - ${isMobile ? 0 : 280}px)` },
            // height: '100vh',
            // bgcolor: 'background.default', // This ensures the background color matches the theme
            // minHeight: '100vh',

            // overflow: 'auto' ,
            // overflowAnchor: 'none',
          }}
        >
          {/* Navigation Bar - Only show on mobile */}
          {isMobile && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                bgcolor: 'background.default',
                borderBottom: `1px solid ${theme.palette.divider}`,
                px: 3,
                py: 2,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src="/src/assets/RR.png"
                    alt="RoomRadar Logo"
                    style={{
                      height: '40px',
                      width: 'auto'
                    }}
                  />
                </Box>

                {/* Right section - Theme toggle and Menu */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    onClick={toggleColorMode}
                    sx={{
                      bgcolor: 'background.paper',
                      p: 1,
                      boxShadow: theme.shadows[1],
                      '&:hover': { transform: 'rotate(180deg)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {mode === 'dark' ? (
                      <LightModeIcon color="primary" />
                    ) : (
                      <DarkModeIcon color="primary" />
                    )}
                  </IconButton>

                  <IconButton
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    sx={{
                      bgcolor: 'background.paper',
                      p: 1,
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          )}
          <Typography variant="h5" component="h1" fontWeight={700} margin={1}>
            {activeSectionTitles[activeSection]}
          </Typography>
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'users' && renderUserManagement()}
          {activeSection === 'analytics' && renderUserAnalytics()}
          {activeSection === 'settings' && renderSystemSettings()}
          {activeSection === 'csv' && renderCSV()}
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: '12px',
              boxShadow: theme.shadows[3],
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog
          open={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          <DialogTitle sx={{
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 2,
          }}>
            <Typography variant="h5" fontWeight={600}>
              {selectedUser ? 'Edit Role' : 'Create New User'}
            </Typography>
            <IconButton
              onClick={() => setIsUserModalOpen(false)}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Grid2 container spacing={3} sx={{ mt: 1 }}>
              {/* <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  disabled
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  disabled
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  disabled
                />

              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  disabled
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  value={userForm.phoneNumber}
                  onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                  disabled
                />
              </Grid2> */}
              <Grid2 item xs={12} md={6}>
                <Select
                  fullWidth
                  label="Role"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <MenuItem value="SEEKER">Seeker</MenuItem>
                  <MenuItem value="LANDLORD">Landlord</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </Grid2>
            </Grid2>
          </DialogContent>
          <DialogActions sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}>
            <Button
              onClick={() => setIsUserModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateUser}
              disabled={loading}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                borderRadius: '12px',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                selectedUser ? 'Update Role' : 'Create User'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;