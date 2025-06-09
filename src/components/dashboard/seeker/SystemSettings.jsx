import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider
} from '@mui/material';
import {
  Backup as BackupIcon,
  GetApp as GetAppIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const SystemSettings = ({ onExport, onImport, onPasswordChange, onDeleteAccount, onNotificationChange }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  });

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await onPasswordChange({
        oldPassword,
        newPassword
      });
      setPasswordDialogOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleNotificationToggle = async (type) => {
    try {
      await onNotificationChange(type, !notificationSettings[type]);
      setNotificationSettings(prev => ({
        ...prev,
        [type]: !prev[type]
      }));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          onImport(data);
        } catch (error) {
          console.error('Error parsing import file:', error);
          alert('Invalid import file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        System Settings
      </Typography>

      <Stack spacing={3}>
        {/* Data Management */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Data Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<BackupIcon />}
              onClick={onExport}
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<GetAppIcon />}
            >
              Import Data
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImport}
              />
            </Button>
          </Stack>
        </Paper>

        {/* Security Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </Stack>
        </Paper>

        {/* Notification Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.email}
                  onChange={() => handleNotificationToggle('email')}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.push}
                  onChange={() => handleNotificationToggle('push')}
                />
              }
              label="Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.sms}
                  onChange={() => handleNotificationToggle('sms')}
                />
              }
              label="SMS Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.desktop}
                  onChange={() => handleNotificationToggle('desktop')}
                />
              }
              label="Desktop Notifications"
            />
          </FormGroup>
        </Paper>
      </Stack>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onDeleteAccount();
              setDeleteDialogOpen(false);
            }}
            variant="contained"
            color="error"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings; 