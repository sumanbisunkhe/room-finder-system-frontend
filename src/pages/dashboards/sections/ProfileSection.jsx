import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { format } from 'date-fns';

const ProfileSection = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    role: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getCurrentUser();
      
      if (response.success && response.data) {
        const userData = response.data;
        setCurrentUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
          role: userData.role || ''
        });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again later.');
      showSnackbar('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await userService.updateUserProfile(currentUser.id, formData);
      await fetchUserData();
      showSnackbar('Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        fullName: currentUser.fullName || '',
        phoneNumber: currentUser.phoneNumber || '',
        role: currentUser.role || ''
      });
    }
  };

  if (loading && !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...(isDesktop && {
        overflow: 'hidden',
        position: 'relative',
      }),
      ...(!isDesktop && {
        overflow: 'auto',
      })
    }}>
      <Box sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            height: isDesktop ? '100%' : 'auto',
            m: 0,
            width: '100%',
          }}
        >
          <Grid 
            item 
            xs={12} 
            md={4} 
            sx={{ 
              height: isDesktop ? 'calc(100vh - 96px)' : 'auto',
              p: '12px !important',
            }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                overflow: isDesktop ? 'auto' : 'visible',
                p: 3,
              }}
            >
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: theme.shadows[3],
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: 80 }} />
                </Avatar>
                <Chip
                  label={currentUser?.role || 'Role'}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 600,
                  }}
                />
              </Box>
              
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
                {currentUser?.fullName || 'User Name'}
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="body2">{currentUser?.username}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="primary" />
                  <Typography variant="body2">{currentUser?.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="body2">{currentUser?.phoneNumber || 'No phone number'}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Joined: {format(new Date(currentUser?.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {format(new Date(currentUser?.updatedAt), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid 
            item 
            xs={12} 
            md={8} 
            sx={{ 
              height: isDesktop ? 'calc(100vh - 96px)' : 'auto',
              p: '12px !important',
            }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: isDesktop ? 'hidden' : 'visible',
              }}
            >
              <Box sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}>
                <EditIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Edit Profile Information
                </Typography>
              </Box>

              <Box sx={{ 
                p: 3,
                flexGrow: 1,
                overflow: isDesktop ? 'auto' : 'visible',
              }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Username"
                          value={formData.username}
                          onChange={handleChange('username')}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <PersonIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Role"
                          value={formData.role}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <BadgeIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          type="email"
                          InputProps={{
                            startAdornment: (
                              <EmailIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={formData.fullName}
                          onChange={handleChange('fullName')}
                          InputProps={{
                            startAdornment: (
                              <AccountCircleIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleChange('phoneNumber')}
                          InputProps={{
                            startAdornment: (
                              <PhoneIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </form>
              </Box>

              <Box sx={{ 
                p: 3,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                bgcolor: 'background.paper',
              }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                  onClick={handleSubmit}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfileSection; 