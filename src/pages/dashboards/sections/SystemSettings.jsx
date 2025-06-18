import React, { useState, useEffect, startTransition } from 'react';
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
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { useOutletContext } from 'react-router-dom';
import StyledTypography from '../../../components/common/StyledTypography';

const SystemSettings = () => {
  const { theme, mode, colorScheme, borderRadius, onThemeChange, onColorSchemeChange, onBorderRadiusChange, currentUser, handleLogout, setSnackbar } = useOutletContext();
  const { showSnackbar } = useSnackbar();
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

  // Update theme settings when props change
  useEffect(() => {
    if (mode && colorScheme && borderRadius) {
      setThemeSettings(prev => ({
        ...prev,
        mode,
        colorScheme,
        borderRadius,
      }));
    }
  }, [mode, colorScheme, borderRadius]);

  const handleThemeChange = (newMode) => {
    if (typeof onThemeChange === 'function') {
      startTransition(() => {
        setThemeSettings(prev => ({
          ...prev,
          mode: newMode
        }));
        onThemeChange(newMode);
      });
    }
  };

  const handleColorSchemeChange = (newScheme) => {
    if (typeof onColorSchemeChange === 'function') {
      startTransition(() => {
        setThemeSettings(prev => ({
          ...prev,
          colorScheme: newScheme
        }));
        onColorSchemeChange(newScheme);
      });
    }
  };

  const handleBorderRadiusChange = (newRadius) => {
    if (typeof onBorderRadiusChange === 'function') {
      startTransition(() => {
        setThemeSettings(prev => ({
          ...prev,
          borderRadius: newRadius
        }));
        onBorderRadiusChange(newRadius);
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser || !currentUser.id) {
        throw new Error('User data not available');
      }

      await userService.changePassword(
        currentUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      showSnackbar('Password changed successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      showSnackbar(error.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Color scheme options with their display names and preview colors
  const colorSchemeOptions = [
    { value: 'blue', label: 'Ocean Blue', primary: '#1976d2', secondary: '#9c27b0' },
    { value: 'purple', label: 'Royal Purple', primary: '#7e57c2', secondary: '#ec407a' },
    { value: 'green', label: 'Forest Green', primary: '#2e7d32', secondary: '#d32f2f' },
    { value: 'orange', label: 'Sunset Orange', primary: '#ed6c02', secondary: '#0288d1' },
  ];

  // Border radius options with preview values
  const borderRadiusOptions = [
    { value: 'small', label: 'Small', preview: 4 },
    { value: 'medium', label: 'Medium', preview: 8 },
    { value: 'large', label: 'Large', preview: 12 },
  ];

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

            <Stack spacing={4}>
              {/* Theme Mode */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                  Theme Mode
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    p: 0.5,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      variant={themeSettings.mode === 'light' ? 'contained' : 'text'}
                      onClick={() => handleThemeChange('light')}
                      startIcon={<LightModeIcon />}
                      fullWidth
                      sx={{
                        py: 1,
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Light
                    </Button>
                    <Button
                      variant={themeSettings.mode === 'dark' ? 'contained' : 'text'}
                      onClick={() => handleThemeChange('dark')}
                      startIcon={<DarkModeIcon />}
                      fullWidth
                      sx={{
                        py: 1,
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={themeSettings.mode === 'system' ? 'contained' : 'text'}
                      onClick={() => handleThemeChange('system')}
                      startIcon={<AutoAwesomeIcon />}
                      fullWidth
                      sx={{
                        py: 1,
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      System
                    </Button>
                  </Stack>
                </Box>
              </Box>

              {/* Color Scheme */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                  Color Scheme
                </Typography>
                <Box 
                  sx={{ 
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Grid container spacing={2}>
                    {colorSchemeOptions.map((scheme) => (
                      <Grid item xs={12} sm={6} key={scheme.value}>
                        <Paper
                          onClick={() => handleColorSchemeChange(scheme.value)}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: themeSettings.colorScheme === scheme.value ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-1px)',
                              boxShadow: 1
                            },
                            '&:focus': {
                              outline: 'none',
                            },
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
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
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
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
              <Box 
                sx={{ 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <form onSubmit={handlePasswordChange}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      required
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                              disabled={loading}
                              sx={{
                                '&:focus': {
                                  outline: 'none',
                                  boxShadow: 'none'
                                }
                              }}
                            >
                              {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          '&:focus-within': {
                            outline: 'none',
                            boxShadow: 'none'
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            boxShadow: 'none'
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      disabled={loading}
                      helperText="Password must be at least 8 characters long"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                              disabled={loading}
                              sx={{
                                '&:focus': {
                                  outline: 'none',
                                  boxShadow: 'none'
                                }
                              }}
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          '&:focus-within': {
                            outline: 'none',
                            boxShadow: 'none'
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            boxShadow: 'none'
                          }
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || !currentUser}
                      startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
                      sx={{
                        py: 1,
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  </Stack>
                </form>
              </Box>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  py: 1,
                  '&:focus': {
                    outline: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                Delete Account
              </Button>
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
                  onClick={() => {/* Handle backup */}}
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
                    onChange={(e) => {/* Handle restore */}}
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon color="error" />
          <Typography variant="h6">Delete Account</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color="error" sx={{ mt: 2 }}>
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Handle delete account
              setDeleteDialogOpen(false);
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings; 