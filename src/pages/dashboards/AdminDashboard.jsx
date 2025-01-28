// src\pages\dashboards\AdminDashboard.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CheckCircle as CheckCircleIcon

} from '@mui/icons-material';
import * as userService from '../../services/userService';
import Grid2 from '@mui/material/Unstable_Grid2';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Area, AreaChart
} from 'recharts';


const AdminDashboard = () => {
  const [mode, setMode] = useState('light');
  const [activeSection, setActiveSection] = useState('users');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
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
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    role: 'SEEKER',
    status: 'active',
  });
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

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

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'deactivate':
          await userService.deactivateUser(userId);
          break;
        case 'activate':
          await userService.activateUser(userId);
          break;
        case 'delete':
          await userService.deleteUser(userId);
          break;
      }
      fetchAndProcessUsers();
      setSnackbar({
        open: true,
        message: `User ${action} successfully`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${action} user`,
        severity: 'error',
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

  const menuItems = [
    { section: 'users', icon: <UsersIcon />, label: 'User Management' },
    { section: 'analytics', icon: <DashboardIcon />, label: 'User Analytics' },
    { section: 'settings', icon: <SettingsIcon />, label: 'System Settings' },
  ];

  const activeSectionTitles = {
    users: 'User Management',
    analytics: 'User Analytics',
    settings: 'System Settings',
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
  // Prepare data for line chart (using the last 7 days)
  const activityData = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short' });
      dates.push({
        name: formattedDate,
        'Active Users': Math.floor(userStats.activeUsers * (0.7 + Math.random() * 0.3)), // Simulated data
        'New Users': Math.floor(userStats.totalUsers * 0.05 * Math.random()) // Simulated data
      });
    }
    return dates;
  }, [userStats.activeUsers, userStats.totalUsers]);

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

  const renderUserManagement = () => (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
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
              sx: { borderRadius: '12px' }
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            fullWidth
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            sx={{ borderRadius: '12px' }}
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="SEEKER">Seekers</MenuItem>
            <MenuItem value="LANDLORD">Landlords</MenuItem>
            <MenuItem value="ADMIN">Admins</MenuItem>
          </Select>

          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              height: '56px',
              borderRadius: '12px',
            }}
            onClick={() => setIsUserModalOpen(true)}
          >
            Add User
          </Button>
        </Stack>

        <Paper sx={{
          overflow: 'hidden',
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap', // Prevent text wrapping
            py: 2, // Add vertical padding
          },
          '& .MuiTableCell-head': {
            backgroundColor: (theme) => theme.palette.background.paper,
            fontWeight: 600,
          },
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
      </Stack>
    </Container>
  );

 const renderUserAnalytics = () => {
  const ROLE_COLORS = {
    SEEKER: '#6366F1',
    LANDLORD: '#10B981',
    ADMIN: '#8B5CF6'
  };

  const roleData = Object.entries(userStats.userRoleDistribution).map(([role, count]) => ({
    name: role,
    value: count
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: (theme) => theme.shadows[3] }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="caption" sx={{ color: entry.color, display: 'block' }}>
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 80px)', // Account for header height
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Stats Row - 20% height */}
      <Grid2 
        container 
        spacing={2} 
        sx={{ height: '20%', minHeight: '120px' }}
      >
        <Grid2 item xs={12} md={4} height="100%">
          <StatCard
            title="Total Users"
            value={userStats.totalUsers}
            icon={<PeopleIcon />}
            color="#6366F1"
          />
        </Grid2>
        <Grid2 item xs={12} md={4} height="100%">
          <StatCard
            title="Active Users"
            value={userStats.activeUsers}
            icon={<PeopleIcon />}
            color="#10B981"
          />
        </Grid2>
        <Grid2 item xs={12} md={4} height="100%">
          <StatCard
            title="Inactive Users"
            value={userStats.inactiveUsers}
            icon={<PeopleIcon />}
            color="#EF4444"
          />
        </Grid2>
      </Grid2>

      {/* Charts Row - 80% height */}
      <Grid2 
        container 
        spacing={2} 
        sx={{ height: '80%', minHeight: '400px' }}
      >
        {/* Role Distribution Chart */}
        <Grid2 item xs={12} md={6} height="100%">
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Role Distribution
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}> {/* Ensure chart doesn't overflow */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ROLE_COLORS[entry.name]}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={({ payload }) => (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 3,
                        mt: 'auto' 
                      }}>
                        {payload.map((entry) => (
                          <Box
                            key={entry.value}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: entry.color
                              }}
                            />
                            <Typography variant="caption" fontWeight={500}>
                              {entry.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid2>

        {/* Activity Chart */}
        <Grid2 item xs={12} md={6} height="100%">
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Activity Overview
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}> {/* Ensure chart doesn't overflow */}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="newUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name"
                    stroke={theme.palette.text.secondary}
                    fontSize={11}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    fontSize={11}
                    tickMargin={8}
                  />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Active Users"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#activeUsers)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="New Users"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#newUsers)"
                    strokeWidth={2}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    content={({ payload }) => (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 3,
                        mb: 1
                      }}>
                        {payload.map((entry) => (
                          <Box
                            key={entry.value}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: entry.color
                              }}
                            />
                            <Typography variant="caption" fontWeight={500}>
                              {entry.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>
    </Box>
  );
};
  const renderSystemSettings = () => (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Theme Settings
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
        </Paper>
      </Stack>
    </Container>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', m: 0, p: 0 }}>
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              // background: `linear-gradient(195deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
            },
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              RoomRadar
            </Typography>
          </Box>
          <Divider />
          <List sx={{ p: 2 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.section}
                selected={activeSection === item.section}
                onClick={() => setActiveSection(item.section)}
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
          </List>
          <Divider sx={{ my: 1 }} />
          <List sx={{ p: 2 }}>
            {/* <ListItemButton
              onClick={toggleColorMode}
              sx={{ borderRadius: '12px' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText
                primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton> */}
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
            flexGrow: 1,
            width: { sm: `calc(100% - 280px)` },
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {/* <Box sx={{
            width: '100%',
            maxWidth: '1200px',
            height: '100',
            margin: '0 auto',
            // backgroundColor: 'red',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            borderRadius: '16px',
            // boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
          > */}

          <Box sx={{
            margin: '0 auto',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 0 }}
            >
              <Typography variant="h4" component="h1" fontWeight={700}>
                {activeSectionTitles[activeSection]}
              </Typography>
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  position: 'fixed',
                  top: 16,
                  right: 16,
                  bgcolor: 'background.paper',
                  p: 1.5,
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
            </Stack>

            {activeSection === 'users' && renderUserManagement()}
            {activeSection === 'analytics' && renderUserAnalytics()}
            {activeSection === 'settings' && renderSystemSettings()}
          </Box>
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
              {selectedUser ? 'Edit User' : 'Create New User'}
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
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  value={userForm.phoneNumber}
                  onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                />
              </Grid2>
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
              <Grid2 item xs={12} md={6}>
                <Select
                  fullWidth
                  label="Status"
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                borderRadius: '12px',
              }}
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;