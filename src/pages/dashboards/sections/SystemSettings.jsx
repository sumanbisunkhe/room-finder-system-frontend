import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';

const SystemSettings = () => {
  const { showSnackbar } = useSnackbar();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        console.log('Current user data:', userData); // Debug log
        if (!userData || !userData.data || !userData.data.id) {
          throw new Error('Invalid user data received');
        }
        setCurrentUser(userData.data);
      } catch (err) {
        console.error('Error fetching user:', err); // Debug log
        showSnackbar('Failed to fetch user data', 'error');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCurrentUser();
  }, [showSnackbar]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUser || !currentUser.id) {
        throw new Error('User data not available');
      }

      console.log('Attempting password change for user ID:', currentUser.id); // Debug log

      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Please fill in all password fields');
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      await userService.changePassword(
        currentUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      showSnackbar('Password changed successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      console.error('Password change error:', err); // Debug log
      showSnackbar(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          height: '100%',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          }
        }}
      >
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{
            width: '100%',
            m: 0,
            p: { xs: 0, sm: 1 },
            minHeight: { xs: 'auto', md: '70vh' }
          }}
        >
          {/* Password Change */}
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                width: '100%',
                maxWidth: 420,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                border: 1,
                borderColor: 'divider',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <form onSubmit={handlePasswordChange}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                            >
                              {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                            >
                              {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !currentUser}
                      sx={{ mt: 1 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SystemSettings; 