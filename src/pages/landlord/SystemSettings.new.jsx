import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Switch,
  Divider,
  useTheme,
  alpha,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Info as InfoIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as userService from '../../services/userService';
import { useOutletContext } from 'react-router-dom';

const SystemSettings = () => {
  const { theme, mode, colorScheme, borderRadius, onThemeChange, onColorSchemeChange, onBorderRadiusChange, currentUser, handleLogout, setSnackbar } = useOutletContext();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    systemNotifications: true,
  });
  const [themeSettings, setThemeSettings] = useState({
    mode: mode || 'system',
    colorScheme: colorScheme || 'blue',
    borderRadius: borderRadius || 'medium',
  });

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setSnackbar({
        open: true,
        message: 'Please fill in all password fields',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(currentUser.id, passwordData.currentPassword, passwordData.newPassword);
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success',
      });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to change password',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteUser(currentUser.id);
      handleLogout();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete account',
        severity: 'error',
      });
    }
  };

  const handleNotificationChange = async (type, value) => {
    try {
      await userService.updateOwnProfile(currentUser.id, { [type]: value });
      setNotificationSettings(prev => ({ ...prev, [type]: value }));
      setSnackbar({
        open: true,
        message: 'Notification settings updated',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update notification settings',
        severity: 'error',
      });
    }
  };

  const handleThemeChange = (newMode) => {
    setThemeSettings(prev => ({ ...prev, mode: newMode }));
    onThemeChange(newMode);
  };

  const handleColorSchemeChange = (newScheme) => {
    setThemeSettings(prev => ({ ...prev, colorScheme: newScheme }));
    onColorSchemeChange(newScheme);
  };

  const handleBorderRadiusChange = (newRadius) => {
    setThemeSettings(prev => ({ ...prev, borderRadius: newRadius }));
    onBorderRadiusChange(newRadius);
  };

  const handleExportData = async () => {
    try {
      await userService.exportRoomsToCSV();
      setSnackbar({
        open: true,
        message: 'Data exported successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to export data',
        severity: 'error',
      });
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await userService.importRoomsFromCSV(file);
      setSnackbar({
        open: true,
        message: 'Data imported successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to import data',
        severity: 'error',
      });
    }
  };

  const SettingsCard = ({ icon, title, description, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {React.cloneElement(icon, { 
                color: 'primary',
                sx: { fontSize: 28 }
              })}
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Box>
            </Box>
            {children}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'auto', 
      bgcolor: 'background.default',
      position: 'relative',
      top: 0,
      left: 0,
      right: 0,
      margin: 0,
      padding: 0,
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
      <Stack spacing={0}>
        {/* Theme Settings */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <PaletteIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>Theme Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Customize the appearance of your dashboard
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={3}>
              {/* Theme Mode */}
              <Box>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                  Theme Mode
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { value: 'light', icon: <LightModeIcon />, label: 'Light' },
                    { value: 'dark', icon: <DarkModeIcon />, label: 'Dark' },
                    { value: 'system', icon: <AutoAwesomeIcon />, label: 'System' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={themeSettings.mode === option.value ? 'contained' : 'outlined'}
                      onClick={() => handleThemeChange(option.value)}
                      startIcon={option.icon}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Color Scheme */}
              <Box>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                  Color Scheme
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { value: 'blue', primary: '#1976d2', secondary: '#42a5f5', label: 'Blue' },
                    { value: 'green', primary: '#2e7d32', secondary: '#4caf50', label: 'Green' },
                    { value: 'purple', primary: '#9c27b0', secondary: '#ba68c8', label: 'Purple' },
                    { value: 'orange', primary: '#ed6c02', secondary: '#ff9800', label: 'Orange' },
                  ].map((scheme) => (
                    <Grid item xs={3} key={scheme.value}>
                      <Paper
                        onClick={() => handleColorSchemeChange(scheme.value)}
                        sx={{
                          p: 1.5,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: themeSettings.colorScheme === scheme.value ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                          }
                        }}
                      >
                        <Stack spacing={1} alignItems="center">
                          <Stack direction="row" spacing={1}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: scheme.primary,
                              }}
                            />
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: scheme.secondary,
                              }}
                            />
                          </Stack>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {scheme.label}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Border Radius */}
              <Box>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                  Border Radius
                </Typography>
                <Stack direction="row" spacing={1}>
                  {[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={themeSettings.borderRadius === option.value ? 'contained' : 'outlined'}
                      onClick={() => handleBorderRadiusChange(option.value)}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Security Settings */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <SecurityIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>Security Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your account security preferences
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={3}>
              {/* Change Password */}
              <Box>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                  Change Password
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    type={showCurrentPassword ? 'text' : 'password'}
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    type={showNewPassword ? 'text' : 'password'}
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handlePasswordChange}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
                    sx={{
                      py: 1.5,
                      '&:focus': {
                        outline: 'none',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    Update Password
                  </Button>
                </Stack>
              </Box>

              {/* Delete Account */}
              <Box>
                <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                  Delete Account
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    py: 1.5,
                    '&:focus': {
                      outline: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Delete Account
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Notification Settings */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <NotificationsIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>Notification Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your notification preferences
                </Typography>
              </Box>
            </Stack>

            <Box 
              sx={{ 
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <Stack divider={<Divider />}>
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      p: 2,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2" fontWeight={500}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                      <Switch
                        checked={value}
                        onChange={(e) => handleNotificationChange(key, e.target.checked)}
                        color="success"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            '&:hover': {
                              backgroundColor: 'transparent'
                            }
                          },
                          '&:focus': {
                            outline: 'none',
                            boxShadow: 'none'
                          }
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Backup & Restore */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <BackupIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>Backup & Restore</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your system data
                </Typography>
              </Box>
            </Stack>

            <Box 
              sx={{ 
                bgcolor: 'background.default',
                borderRadius: 1,
                p: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BackupIcon />}
                  onClick={handleExportData}
                  sx={{
                    py: 1.5,
                    '&:focus': {
                      outline: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Backup System Data
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component="label"
                  startIcon={<RestoreIcon />}
                  sx={{
                    py: 1.5,
                    '&:focus': {
                      outline: 'none',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Restore from Backup
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportData}
                  />
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Stack>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 1,
            '& .MuiDialogActions-root button': {
              '&:focus': {
                outline: 'none',
                boxShadow: 'none'
              }
            }
          },
        }}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings; 