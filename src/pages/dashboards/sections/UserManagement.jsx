import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Typography,
  TablePagination,
  InputAdornment,
  Tooltip,
  Button,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  alpha,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  DialogContentText,
  Pagination,
  PaginationItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreHoriz as MoreHorizIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import * as userService from '../../../services/userService';
import _ from 'lodash';

// Add these functions before UserCard component
const getRoleStyles = (role) => {
  const styles = {
    ADMIN: {
      color: '#d32f2f',
      bg: alpha('#d32f2f', 0.1),
    },
    LANDLORD: {
      color: '#1976d2',
      bg: alpha('#1976d2', 0.1),
    },
    SEEKER: {
      color: '#0288d1',
      bg: alpha('#0288d1', 0.1),
    },
    LANDLORD: {
      color: '#1976d2',
      bg: alpha('#1976d2', 0.1),
    },
  };
  return styles[role] || { color: '#757575', bg: alpha('#757575', 0.1) };
};

const getStatusStyles = (isActive) => {
  return isActive
    ? { color: '#2e7d32', bg: alpha('#2e7d32', 0.1) }
    : { color: '#d32f2f', bg: alpha('#d32f2f', 0.1) };
};

const UserCard = ({ user, onActionClick }) => {
  const theme = useTheme();
  const roleStyles = getRoleStyles(user.role);
  const statusStyles = getStatusStyles(user.isActive);
  const [actionMenu, setActionMenu] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });

  const handleActionMenuOpen = (event) => {
    setActionMenu(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenu(null);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      action: null
    });
  };

  const handleConfirmDialogConfirm = async () => {
    try {
      await onActionClick(user.id, confirmDialog.action);

      // No need to set snackbar here as the parent component will handle it
    } catch (error) {
      // No need to set snackbar here as the parent component will handle it
    } finally {
      handleConfirmDialogClose();
      handleActionMenuClose();
    }
  };

  const handleAction = (action) => {
    let title = '';
    let message = '';

    switch (action) {
      case 'delete':
        title = 'Delete User';
        message = 'Are you sure you want to delete this user? This action cannot be undone.';
        break;
      case 'toggleStatus':
        title = user.isActive ? 'Deactivate User' : 'Activate User';
        message = user.isActive
          ? 'Are you sure you want to deactivate this user? They will no longer be able to access the system.'
          : 'Are you sure you want to activate this user? They will be able to access the system.';
        break;
      default:
        onActionClick(user.id, action);
        handleActionMenuClose();
        return;
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      action
    });
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            bgcolor: alpha('#000', 0.02),
          }
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack spacing={2}>
            {/* Header with Role and Actions */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Chip
                label={user.role}
                size="small"
                sx={{
                  height: 24,
                  bgcolor: roleStyles.bg,
                  color: roleStyles.color,
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <IconButton
                size="small"
                onClick={handleActionMenuOpen}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                  '&:focus': {
                    outline: 'none',
                  }
                }}
              >
                <MoreHorizIcon />
              </IconButton>
            </Stack>

            {/* User Info */}
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.phoneNumber || 'No phone number'}
              </Typography>
            </Stack>

            {/* Status */}
            <Chip
              label={user.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                height: 24,
                bgcolor: statusStyles.bg,
                color: statusStyles.color,
                fontWeight: 600,
                fontSize: '0.75rem',
                alignSelf: 'flex-start'
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu}
        open={Boolean(actionMenu)}
        onClose={handleActionMenuClose}
        onClick={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('toggleStatus')}>
          <ListItemIcon>
            {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{user.isActive ? 'Deactivate' : 'Activate'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ p: 3, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mb: 1
            }}
          >
            {confirmDialog.action === 'toggleStatus' ? (
              <CheckCircleIcon
                sx={{
                  fontSize: 24,
                  color: theme.palette.primary.main,
                  mb: 1
                }}
              />
            ) : (
              <DeleteIcon
                sx={{
                  fontSize: 24,
                  color: theme.palette.error.main,
                  mb: 1
                }}
              />
            )}
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              {confirmDialog.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {confirmDialog.message}
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
            onClick={handleConfirmDialogClose}
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
            onClick={handleConfirmDialogConfirm}
            variant="contained"
            color={confirmDialog.action === 'toggleStatus' ? 'primary' : 'error'}
            sx={{
              flex: 1,
              py: 1,
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: confirmDialog.action === 'toggleStatus'
                  ? theme.palette.primary.dark
                  : theme.palette.error.dark
              }
            }}
          >
            {confirmDialog.action === 'toggleStatus' ? 'Confirm' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Add stylish loading component
const StylishLoading = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.default, 0.8),
        zIndex: 9999,
      }}
    >
      <Fade in={true} timeout={500}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              animationDuration: '1.5s',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            Loading Users...
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

const UserManagement = ({
  users: initialUsers,
  onSearch,
  onFilter,
  onUserAction,
  paginationData: initialPaginationData,
  onPageChange: onPageChangeParent,
  onPageSizeChange: onPageSizeChangeParent,
  isLoading: isLoadingProp
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = isMobile || isTablet;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState(initialUsers || []);
  const [isLoading, setIsLoading] = useState(isLoadingProp || false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 8,
    totalElements: 0,
    totalPages: 0
  });
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'SEEKER',
    status: 'active'
  });
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    role: '',
    status: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    userId: null,
    action: null
  });

  // Update pagination when parent data changes
  useEffect(() => {
    if (initialPaginationData) {
      setPagination(prev => ({
        ...prev,
        ...initialPaginationData
      }));
    }
  }, [initialPaginationData]);

  // Update filtered users when parent users change
  useEffect(() => {
    if (initialUsers) {
      setFilteredUsers(initialUsers);
    }
  }, [initialUsers]);

  // Update loading state when parent loading changes
  useEffect(() => {
    setIsLoading(isLoadingProp);
  }, [isLoadingProp]);

  // Load users based on current filter, status filter, and pagination
  useEffect(() => {
    const loadFilteredUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await userService.fetchUsers({
          page: pagination.currentPage,
          size: pagination.pageSize,
          role: filterValue !== 'all' ? filterValue : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });

        if (response) {
          const mappedUsers = (response.content || []).map(user => ({
            ...user,
            isActive: user.active !== false
          }));

          setFilteredUsers(mappedUsers);
          setPagination(prev => ({
            ...prev,
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0
          }));

          if (typeof onUserAction === 'function') {
            onUserAction(mappedUsers);
          }
        }
      } catch (error) {
        console.error('Error loading filtered users:', error);
        setError(error.message || 'Error loading users');
        setSnackbar({
          open: true,
          message: error.message || 'Error loading users',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFilteredUsers();
  }, [filterValue, statusFilter, pagination.currentPage, pagination.pageSize]);

  // Update the handlePageChange function
  const handlePageChange = async (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    if (onPageChangeParent) {
      onPageChangeParent(event, newPage);
    }
  };

  // Update the handlePageSizeChange function
  const handlePageSizeChange = async (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 0
    }));
    if (onPageSizeChangeParent) {
      onPageSizeChangeParent(event);
    }
  };

  const handleSearchChange = async (e) => {
    if (!e || !e.target) return;
    const value = e.target.value || '';
    setSearchTerm(value);

    // Reset pagination to first page when searching
    setPagination(prev => ({
      ...prev,
      currentPage: 0
    }));

    try {
      if (value.trim()) {
        // Use searchUsers with current filters
        const response = await userService.searchUsers(value, {
          page: 0,
          size: pagination.pageSize,
          role: filterValue !== 'all' ? filterValue : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });

        if (response) {
          const mappedUsers = (response.content || []).map(user => ({
            ...user,
            isActive: user.active !== false
          }));

          setFilteredUsers(mappedUsers);
          setPagination(prev => ({
            ...prev,
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0
          }));

          if (typeof onUserAction === 'function') {
            onUserAction(mappedUsers);
          }
        }
      } else {
        // If search is cleared, reload with current filters
        const response = await userService.fetchUsers({
          page: 0,
          size: pagination.pageSize,
          role: filterValue !== 'all' ? filterValue : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });

        if (response) {
          const mappedUsers = (response.content || []).map(user => ({
            ...user,
            isActive: user.active !== false
          }));

          setFilteredUsers(mappedUsers);
          setPagination(prev => ({
            ...prev,
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0
          }));

          if (typeof onUserAction === 'function') {
            onUserAction(mappedUsers);
          }
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError(error.message || 'Error searching users');
      setSnackbar({
        open: true,
        message: error.message || 'Error searching users',
        severity: 'error'
      });
    }
  };

  const handleStatusFilterChange = (e) => {
    if (!e || !e.target) return;
    const value = e.target.value || 'all';
    setStatusFilter(value);
    // Reset pagination when changing filter
    setPagination(prev => ({
      ...prev,
      currentPage: 0
    }));
    // Refresh with both filters
    userService.fetchUsers({
      page: 0,
      size: pagination.pageSize,
      role: filterValue !== 'all' ? filterValue : undefined,
      status: value !== 'all' ? value : undefined
    }).then(response => {
      if (response && response.content) {
        const updatedUsers = response.content.map(user => ({
          ...user,
          isActive: user.active !== false
        }));
        setFilteredUsers(updatedUsers);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        }));
        if (typeof onUserAction === 'function') {
          onUserAction(updatedUsers);
        }
      }
    }).catch(error => {
      console.error('Error applying filters:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: error.message || 'Error applying filters',
        severity: 'error'
      });
    });
  };

  const handleFilterChange = (e) => {
    if (!e || !e.target) return;
    const value = e.target.value || 'all';
    setFilterValue(value);
    // Reset pagination when changing filter
    setPagination(prev => ({
      ...prev,
      currentPage: 0
    }));
    // Refresh with both filters
    userService.fetchUsers({
      page: 0,
      size: pagination.pageSize,
      role: value !== 'all' ? value : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }).then(response => {
      if (response && response.content) {
        const updatedUsers = response.content.map(user => ({
          ...user,
          isActive: user.active !== false
        }));
        setFilteredUsers(updatedUsers);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        }));
        if (typeof onUserAction === 'function') {
          onUserAction(updatedUsers);
        }
      }
    }).catch(error => {
      console.error('Error applying filters:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: error.message || 'Error applying filters',
        severity: 'error'
      });
    });
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      setSearchTerm('');

      const response = await userService.fetchUsers({
        page: 0,
        size: pagination.pageSize,
        role: filterValue !== 'all' ? filterValue : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      if (response && response.content) {
        // Ensure isActive is properly set for each user
        const updatedUsers = response.content.map(user => ({
          ...user,
          isActive: user.active !== false // Convert to boolean, default to true if not specified
        }));

        setFilteredUsers(updatedUsers);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        }));

        if (typeof onUserAction === 'function') {
          onUserAction(updatedUsers);
        }
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to refresh data',
        severity: 'error'
      });
    }
  };

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleAddUserClose = () => {
    setIsAddUserModalOpen(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      role: 'SEEKER',
      status: 'active'
    });
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUserSubmit = async () => {
    try {
      setError(null);

      // Prepare the user data for registration
      const userData = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        active: newUser.status === 'active'
      };

      // Call the registerUser function from userService
      const response = await userService.registerUser(userData);

      if (response && response.success) {
        setSnackbar({
          open: true,
          message: 'User added successfully',
          severity: 'success'
        });
        handleAddUserClose();

        // Fetch the updated user list
        await handleRefresh();
      } else {
        throw new Error(response?.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add user',
        severity: 'error'
      });
    }
  };

  const handleActionMenuOpen = (event, user) => {
    setActionMenu(event.currentTarget);
    setSelectedUser(user);
  };

  const handleActionMenuClose = () => {
    setActionMenu(null);
    setSelectedUser(null);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      userId: null,
      action: null
    });
  };

  const handleConfirmDialogConfirm = async () => {
    await handleAction(confirmDialog.userId, confirmDialog.action);
    handleConfirmDialogClose();
  };

  const handleAction = async (userId, action) => {
    try {
      let successMessage;

      switch (action) {
        case 'edit':
          // Find the user to edit
          const userToEdit = filteredUsers.find(u => u.id === userId);
          if (!userToEdit) {
            throw new Error('User not found');
          }

          // Set the edit user data
          setEditUser({
            username: userToEdit.username,
            email: userToEdit.email,
            fullName: userToEdit.fullName,
            phoneNumber: userToEdit.phoneNumber || '',
            role: userToEdit.role,
            status: userToEdit.isActive ? 'active' : 'inactive'
          });

          // Set the selected user and open the edit modal
          setSelectedUser(userToEdit);
          setIsEditUserModalOpen(true);
          return;
        case 'delete':
          await userService.deleteUser(userId);
          successMessage = 'User deleted successfully';
          break;
        case 'toggleStatus':
          // Get the current user's status
          const user = filteredUsers.find(u => u.id === userId);
          if (!user) {
            throw new Error('User not found');
          }

          // Toggle between activate and deactivate based on current status
          if (user.isActive) {
            await userService.deactivateUser(userId);
            successMessage = 'User deactivated successfully';
          } else {
            await userService.activateUser(userId);
            successMessage = 'User activated successfully';
          }
          break;
        default:
          throw new Error('Invalid action');
      }

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success',
      });

      // Refresh the user list
      await handleRefresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to perform action',
        severity: 'error',
      });
    }
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUserClose = () => {
    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditUserSubmit = async () => {
    try {
      if (!selectedUser) {
        throw new Error('No user selected for editing');
      }

      // Prepare the update data
      const updateData = {
        username: editUser.username,
        email: editUser.email,
        fullName: editUser.fullName,
        phoneNumber: editUser.phoneNumber,
        role: editUser.role,
        active: editUser.status === 'active'
      };

      // Call the updateUserProfile function
      await userService.updateUserProfile(selectedUser.id, updateData);

      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success',
      });

      // Close the edit dialog
      handleEditUserClose();

      // Refresh the user list
      await handleRefresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update user',
        severity: 'error',
      });
    }
  };

  // Add type checking for user data in the table rendering
  const renderUserRow = (user) => {
    if (!user || typeof user !== 'object') return null;

    const roleStyles = getRoleStyles(user.role);
    const statusStyles = getStatusStyles(user.isActive);

    return (
      <TableRow
        key={user.id}
        hover
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          height: { xs: 'auto', sm: 48 },
          '&:hover': {
            bgcolor: alpha('#000', 0.02),
          }
        }}
      >
        <TableCell
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            wordBreak: 'break-word'
          }}
        >
          {String(user.username || '')}
        </TableCell>
        <TableCell sx={{ wordBreak: 'break-word' }}>{String(user.email || '')}</TableCell>
        <TableCell
          sx={{
            display: { xs: 'none', sm: 'table-cell' },
            wordBreak: 'break-word'
          }}
        >
          {String(user.fullName || '')}
        </TableCell>
        <TableCell>
          <Chip
            label={String(user.role || '')}
            size="small"
            sx={{
              height: 24,
              maxWidth: '100%',
              bgcolor: roleStyles.bg,
              color: roleStyles.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-label': {
                px: 1.5,
                py: 0.5,
                whiteSpace: 'normal'
              }
            }}
          />
        </TableCell>
        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
          <Chip
            label={String(user.isActive ? 'Active' : 'Inactive')}
            size="small"
            sx={{
              height: 24,
              bgcolor: statusStyles.bg,
              color: statusStyles.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-label': {
                px: 1.5,
                py: 0.5
              }
            }}
          />
        </TableCell>
        <TableCell align="right">
          {isMobile ? (
            <IconButton
              size="small"
              onClick={(e) => handleActionMenuOpen(e, user)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          ) : (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="flex-end"
            >
              <Tooltip title="Edit" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleAction(user.id, 'edit')}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha('#1976d2', 0.1),
                      color: '#1976d2'
                    },
                    '&:focus': {
                      outline: 'none',
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'} arrow>
                <IconButton
                  size="small"
                  onClick={() => setConfirmDialog({
                    open: true,
                    title: user.isActive ? 'Deactivate User' : 'Activate User',
                    message: user.isActive
                      ? 'Are you sure you want to deactivate this user?'
                      : 'Are you sure you want to activate this user?',
                    userId: user.id,
                    action: 'toggleStatus'
                  })}
                  sx={{
                    color: user.isActive ? 'error.main' : 'success.main',
                    '&:hover': {
                      bgcolor: user.isActive
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.success.main, 0.1)
                    }
                  }}
                >
                  {user.isActive ? (
                    <BlockIcon fontSize="small" />
                  ) : (
                    <CheckCircleIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <IconButton
                  size="small"
                  onClick={() => setConfirmDialog({
                    open: true,
                    title: 'Delete User',
                    message: 'Are you sure you want to delete this user? This action cannot be undone.',
                    userId: user.id,
                    action: 'delete'
                  })}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha('#d32f2f', 0.1),
                      color: '#d32f2f'
                    },
                    '&:focus': {
                      outline: 'none',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box 
      component="section"
      sx={{ 
        position: 'relative', 
        height: '100%', 
        width: '100%',
        m: '0 !important',
        p: '0 !important',
        maxWidth: '100%',
        boxSizing: 'border-box',
        '& > *': {
          m: '0 !important',
          p: '0 !important',
          maxWidth: '100%'
        }
      }}
    >
      {isLoading && <StylishLoading />}
      <Box sx={{
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default',
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? 'none' : 'auto',
        m: '0 !important',
        p: '0 !important',
        boxSizing: 'border-box'
      }}>
        {/* Filters and Search Bar */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: 'center', 
          gap: 2,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          {/* Search Bar */}
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ 
              flex: isSmallScreen ? 1 : 'auto',
              width: isSmallScreen ? '100%' : '300px'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Role Filter */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 120,
              flex: isSmallScreen ? 1 : 'initial',
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <InputLabel>Role Filter</InputLabel>
            <Select
              value={filterValue}
              label="Role Filter"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="SEEKER">Seekers</MenuItem>
              <MenuItem value="LANDLORD">Landlords</MenuItem>
              <MenuItem value="ADMIN">Admins</MenuItem>
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 120,
              flex: isSmallScreen ? 1 : 'initial',
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* Add User Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
            sx={{ 
              ml: 'auto',
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            Add User
          </Button>
        </Box>

        {/* Error State */}
        {error && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4
          }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Content: Table or Grid */}
        {!error && (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: isSmallScreen ? 'auto' : 'hidden',
              bgcolor: 'background.paper',
              py: isSmallScreen ? 2 : 0,
              px: 0,
              height: '100%',
              width: '100%',
              maxHeight: 'calc(100vh - 200px)',
              m: 0
            }}
          >
            {isSmallScreen ? (
              <Grid
                container
                spacing={2}
                sx={{
                  width: '100%',
                  m: 0
                }}
              >
                {filteredUsers.map((user) => (
                  <Grid item xs={12} sm={6} key={user.id}>
                    <UserCard
                      user={user}
                      onActionClick={handleAction}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 0,
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  m: 0,
                  p: 0,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.2),
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.3)
                    }
                  },
                  '&::-webkit-scrollbar-corner': {
                    backgroundColor: 'transparent'
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: (theme) => `${alpha(theme.palette.text.primary, 0.2)} transparent`
                }}
              >
                <Table
                  size="small"
                  sx={{
                    width: '100%',
                    tableLayout: 'fixed',
                    m: 0,
                    '& .MuiTableCell-root': {
                      px: 1,
                      py: 1.5,
                      fontSize: '0.875rem',
                      borderColor: 'divider',
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                >
                  <TableHead
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      bgcolor: 'background.paper',
                      '& th': {
                        bgcolor: 'background.paper',
                        borderBottom: '2px solid',
                        borderColor: 'divider'
                      }
                    }}
                  >
                    <TableRow sx={{ bgcolor: alpha('#000', 0.02) }}>
                      <TableCell width={isMobile ? "30%" : "15%"}>Username</TableCell>
                      <TableCell width={isMobile ? "40%" : "25%"}>Email</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} width="20%">Full Name</TableCell>
                      <TableCell width={isMobile ? "20%" : "12%"}>Role</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} width="12%">Status</TableCell>
                      <TableCell width={isMobile ? "10%" : "16%"} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(filteredUsers) ? filteredUsers.map(renderUserRow) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Table Pagination */}
        <Box
          sx={{
            mt: 'auto',
            py: 2,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage + 1}
            onChange={(event, page) => handlePageChange(event, page - 1)}
            shape="rounded"
            renderItem={(item) => {
              if (item.type === 'previous' || item.type === 'next') {
                return (
                  <PaginationItem
                    {...item}
                    sx={{
                      bgcolor: 'transparent',
                      border: 'none',
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                        bgcolor: 'transparent',
                      },
                    }}
                  />
                );
              }
              return (
                <PaginationItem
                  {...item}
                  sx={{
                    mx: 0.5,
                    border: 'none',
                    bgcolor: 'transparent',
                    color: 'text.primary',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'transparent',
                    },
                  }}
                />
              );
            }}
          />
        </Box>

        {/* Add User Dialog */}
        <Dialog
          open={isAddUserModalOpen}
          onClose={handleAddUserClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Username"
                name="username"
                value={newUser.username}
                onChange={handleNewUserChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                required
                fullWidth
              />
              <TextField
                label="Full Name"
                name="fullName"
                value={newUser.fullName}
                onChange={handleNewUserChange}
                required
                fullWidth
              />
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={newUser.phoneNumber}
                onChange={handleNewUserChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  label="Role"
                >
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="SEEKER">Seeker</MenuItem>
                  <MenuItem value="LANDLORD">LandLord</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newUser.status}
                  onChange={handleNewUserChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddUserClose}>Cancel</Button>
            <Button
              onClick={handleAddUserSubmit}
              variant="contained"
            >
              Add User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={isEditUserModalOpen}
          onClose={handleEditUserClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Username"
                name="username"
                value={editUser.username}
                onChange={handleEditUserChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={editUser.email}
                onChange={handleEditUserChange}
                required
                fullWidth
              />
              <TextField
                label="Full Name"
                name="fullName"
                value={editUser.fullName}
                onChange={handleEditUserChange}
                required
                fullWidth
              />
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={editUser.phoneNumber}
                onChange={handleEditUserChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={editUser.role}
                  onChange={handleEditUserChange}
                  label="Role"
                >
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="SEEKER">Seeker</MenuItem>
                  <MenuItem value="LANDLORD">LandLord</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editUser.status}
                  onChange={handleEditUserChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditUserClose}>Cancel</Button>
            <Button
              onClick={handleEditUserSubmit}
              variant="contained"
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleConfirmDialogClose}
          PaperProps={{
            sx: {
              borderRadius: 1,
              minWidth: { xs: '90%', sm: '360px' },
              maxWidth: '400px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            }
          }}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          disableEnforceFocus
        >
          <DialogContent
            sx={{
              p: 3,
              textAlign: 'center'
            }}
          >
            <Box
              id="confirm-dialog-description"
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
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1
                }}
              >
                {confirmDialog.action === 'toggleStatus' ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 24,
                      color: theme.palette.primary.main
                    }}
                  />
                ) : (
                  <DeleteIcon
                    sx={{
                      fontSize: 24,
                      color: theme.palette.error.main
                    }}
                  />
                )}
              </Box>
              <Typography
                id="confirm-dialog-title"
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 0.5
                }}
              >
                {confirmDialog.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {confirmDialog.message}
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
              onClick={handleConfirmDialogClose}
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
              onClick={handleConfirmDialogConfirm}
              variant="contained"
              color={confirmDialog.action === 'toggleStatus' ? 'primary' : 'error'}
              sx={{
                flex: 1,
                py: 1,
                textTransform: 'none',
                fontSize: '0.9rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                  bgcolor: confirmDialog.action === 'toggleStatus'
                    ? theme.palette.primary.dark
                    : theme.palette.error.dark
                }
              }}
            >
              {confirmDialog.action === 'toggleStatus' ? 'Confirm' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              bottom: 24,
              right: 24,
            }
          }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              boxShadow: theme.shadows[3],
              '& .MuiAlert-message': {
                fontSize: '0.9rem',
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UserManagement; 