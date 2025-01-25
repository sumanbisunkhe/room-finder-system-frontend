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
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
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
  Tooltip
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
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';


import * as userService from '../../services/userService';

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    userRoleDistribution: {},
    genderDistribution: {},
    ageGroups: {}
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'seeker',
    status: 'active',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    age: ''
  });

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Orbitron", sans-serif',
        },
        palette: {
          mode: mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode,
          primary: {
            main: mode === 'dark' ? '#90caf9' : '#1976d2',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f4f4f4',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [mode, prefersDarkMode]
  );

  const toggleColorMode = () => {
    setMode(prevMode =>
      prevMode === 'light' ? 'dark' : 'light'
    );
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const fetchAndProcessUsers = useCallback(async () => {
    try {
        setLoading(true);

        const fetchedUsers = await userService.fetchUsers();

        const stats = {
            totalUsers: fetchedUsers.length,
            activeUsers: fetchedUsers.filter(user => user.isActive).length,
            inactiveUsers: fetchedUsers.filter(user => !user.isActive).length,
            userRoleDistribution: fetchedUsers.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {}),
        };

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        setUserStats(stats);
    } catch (err) {
        console.error('Complete Fetch Users Error:', err);
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        setError(err.message || 'Failed to fetch users');
        setSnackbar({
            open: true,
            message: err.message || 'Unable to fetch users',
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
      result = result.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userFilter !== 'all') {
      result = result.filter(user => user.role === userFilter);
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
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${action} user`,
        severity: 'error'
      });
    }
  };

  const handleUserFormSubmit = async () => {
    try {
      if (selectedUser) {
        // Update user logic
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        await userService.registerUser(userForm);
        fetchAndProcessUsers();
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
      }
      setIsUserModalOpen(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'User operation failed',
        severity: 'error'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderUserManagement = () => (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Search Users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            fullWidth
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="seeker">Seekers</MenuItem>
            <MenuItem value="landlord">Landlords</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
          </Select>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setSelectedUser(null);
              setUserForm({
                username: '',
                email: '',
                role: 'seeker',
                status: 'active',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                gender: '',
                age: ''
              });
              setIsUserModalOpen(true);
            }}
          >
            Add User
          </Button>
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        setSelectedUser(user);
                        setAnchorEl(e.currentTarget);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );

  const renderUserAnalytics = () => (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
        >
          <Paper sx={{ p: 2, width: '30%' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{userStats.totalUsers}</Typography>
          </Paper>
          <Paper sx={{ p: 2, width: '30%' }}>
            <Typography variant="h6">Active Users</Typography>
            <Typography variant="h4">{userStats.activeUsers}</Typography>
          </Paper>
          <Paper sx={{ p: 2, width: '30%' }}>
            <Typography variant="h6">Inactive Users</Typography>
            <Typography variant="h4">{userStats.inactiveUsers}</Typography>
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );

  const renderSystemSettings = () => (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Theme Settings</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Color Mode</Typography>
            <Button
              variant="contained"
              onClick={toggleColorMode}
              startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            >
              {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );

  const UserModal = () => (
    <Dialog
      open={isUserModalOpen}
      onClose={() => setIsUserModalOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedUser ? 'Edit User' : 'Add New User'}
        <IconButton
          onClick={() => setIsUserModalOpen(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* User form fields */}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleUserFormSubmit}
        >
          {selectedUser ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <AppBar
          position="fixed"
          sx={{
            zIndex: 1300,
            backgroundColor: theme.palette.background.default,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/dashboard/admin">
              <img
                src="\src\assets\RR.png"
                alt="RoomRadar Logo"
                style={{
                  height: '50px',
                  width: 'auto',
                  maxWidth: '200px',
                  cursor: 'pointer'
                }}
              />
            </Link>

            <IconButton
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  background: 'transparent'
                }
              }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <MoreVertIcon />
            </IconButton>
          </Toolbar>

          <Drawer
            variant="temporary"
            anchor="right"
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 250,
                backgroundColor: theme.palette.background.paper,
                borderLeft: `1px solid ${theme.palette.divider}`,
                boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ width: 300, p: 2 }}>
              <Stack spacing={2}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    textAlign: 'center',
                    color: theme.palette.text.primary
                  }}
                >
                  Dashboard Menu
                </Typography>

                <List>
                  {[
                    {
                      section: 'users',
                      icon: <UsersIcon />,
                      label: 'User Management'
                    },
                    {
                      section: 'analytics',
                      icon: <DashboardIcon />,
                      label: 'User Analytics'
                    },
                    {
                      section: 'settings',
                      icon: <SettingsIcon />,
                      label: 'System Settings'
                    }
                  ].map(({ section, icon, label }) => (
                    <ListItem
                      key={section}
                      button
                      selected={activeSection === section}
                      onClick={() => {
                        setActiveSection(section);
                        setIsSidebarOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.action.selected
                        }
                      }}
                    >
                      <ListItemIcon>{icon}</ListItemIcon>
                      <ListItemText primary={label} />
                    </ListItem>
                  ))}

                  <Divider sx={{ my: 1 }} />

                  <ListItem
                    button
                    onClick={toggleColorMode}
                    sx={{ borderRadius: 2 }}
                  >
                    <ListItemIcon>
                      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    />
                  </ListItem>

                  <ListItem
                    button
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 2,
                      color: theme.palette.error.main
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </List>
              </Stack>
            </Box>
          </Drawer>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
          }}
        >
          <Typography variant="h4" gutterBottom>
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'analytics' && 'User Analytics'}
            {activeSection === 'settings' && 'System Settings'}
          </Typography>

          {activeSection === 'users' && renderUserManagement()}
          {activeSection === 'analytics' && renderUserAnalytics()}
          {activeSection === 'settings' && renderSystemSettings()}
        </Box>

        <UserModal />
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;