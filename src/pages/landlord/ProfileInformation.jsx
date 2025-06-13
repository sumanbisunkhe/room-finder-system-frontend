import React, { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Card,
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import * as userService from '../../services/userService';
import { useOutletContext } from 'react-router-dom';

const ProfileInformation = () => {
  const { theme, currentUser, setCurrentUser, setSnackbar } = useOutletContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  // Update profileForm when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        username: currentUser.username || '',
        email: currentUser.email || '',
        password: '',
        fullName: currentUser.fullName || '',
        phoneNumber: currentUser.phoneNumber || '',
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    try {
      await userService.updateUserProfile(currentUser.id, profileForm);
      const updatedUser = await userService.getCurrentUser();
      setCurrentUser(updatedUser);
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

  return (
    <Container maxWidth={{ xs: "xl", md: "lg" }} sx={{ py: { xs: 8, md: 0 } }}>
      <Stack spacing={4}>
        {/* Header Card */}
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: 4,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              border: '4px solid lightgray',
              backgroundColor: 'rgba(255,255,255,0.2)',
              fontSize: '3rem',
              mx: 'auto',
              mb: 2,
            }}
          >
            {currentUser?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h4" fontWeight="bold">
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
              color: 'tertiary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Edit Profile
          </Button>
        </Card>

        {/* Info Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
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
          </Grid>

          <Grid item xs={12} md={12}>
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
          </Grid>
        </Grid>
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
              type="password"
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProfile}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfileInformation; 