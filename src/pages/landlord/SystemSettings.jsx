import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  alpha,
  Tooltip,
  IconButton,
  Zoom,
  useTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  BackupTable as BackupIcon,
  Assessment as AssessmentIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  Password as PasswordIcon,
  NotificationsActive as NotificationsActiveIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as userService from '../../services/userService';

const SystemSettings = ({ theme, mode, toggleColorMode, currentUser, handleLogout, setSnackbar }) => {
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const muiTheme = useTheme();

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

  const handlePasswordChange = async () => {
    try {
      await userService.changePassword(currentUser.id, currentPassword, newPassword);
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
      setSecurityDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update password',
        severity: 'error'
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await userService.deleteUser(currentUser.id);
      setSnackbar({
        open: true,
        message: 'Account deleted successfully',
        severity: 'success'
      });
      handleLogout();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete account',
        severity: 'error'
      });
    }
  };

  const handleNotificationChange = async (type, value) => {
    try {
      await userService.updateOwnProfile(currentUser.id, {
        [type]: value
      });
      setSnackbar({
        open: true,
        message: 'Notification preferences updated',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update preferences',
        severity: 'error'
      });
    }
  };

  const SettingsCard = ({ icon, title, children, info }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          backdropFilter: 'blur(8px)',
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {React.cloneElement(icon, { color: 'primary', sx: { fontSize: 28 } })}
              {title}
            </Typography>
            {info && (
              <Tooltip title={info} placement="top" TransitionComponent={Zoom}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {children}
        </Stack>
      </Paper>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LightModeIcon color="primary" />
                <Typography variant="h6" fontWeight={500}>
                  Theme Preferences
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2, py: 1.5 }}
                >
                  <Typography variant="body1">
                    Dark Mode
                  </Typography>
                  <Switch
                    checked={mode === 'dark'}
                    onChange={toggleColorMode}
                    color="primary"
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<NotificationsActiveIcon />}
            title="Notification Settings"
            info="Manage your notification preferences"
          >
            <Stack spacing={2}>
              {[
                { type: 'emailNotifications', label: 'Email Notifications' },
                { type: 'pushNotifications', label: 'Push Notifications' },
              ].map((setting) => (
                <Box
                  key={setting.type}
                  sx={{
                    p: 2.5,
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: 'background.paper',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {setting.label}
                    </Typography>
                    <Switch
                      checked={currentUser?.[setting.type] || false}
                      onChange={(e) => handleNotificationChange(setting.type, e.target.checked)}
                      color="primary"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<BackupIcon />}
            title="Data Management"
            info="Export and import your property data"
          >
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AssessmentIcon />}
                onClick={handleExportData}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  borderWidth: '2px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderWidth: '2px',
                  },
                }}
              >
                Export Property Data (CSV)
              </Button>

              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="import-data"
                type="file"
                onChange={handleImportData}
              />
              <label htmlFor="import-data">
                <Button
                  variant="outlined"
                  fullWidth
                  component="span"
                  startIcon={<BackupIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    borderWidth: '2px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '&:hover': {
                      borderWidth: '2px',
                    },
                  }}
                >
                  Import Property Data (CSV)
                </Button>
              </label>
            </Stack>
          </SettingsCard>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <SettingsCard
            icon={<LockIcon />}
            title="Security Settings"
            info="Manage your account security"
          >
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PasswordIcon />}
                onClick={() => setSecurityDialogOpen(true)}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  borderWidth: '2px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderWidth: '2px',
                  },
                }}
              >
                Change Password
              </Button>

              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  borderWidth: '2px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    borderWidth: '2px',
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                Delete Account
              </Button>
            </Stack>
          </SettingsCard>
        </Grid>
      </Grid>

      {/* Security Dialog */}
      <Dialog
        open={securityDialogOpen}
        onClose={() => setSecurityDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            backdropFilter: 'blur(8px)',
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          pb: 1,
        }}>
          <LockIcon color="primary" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2, minWidth: { sm: 400 } }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setSecurityDialogOpen(false)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SystemSettings; 