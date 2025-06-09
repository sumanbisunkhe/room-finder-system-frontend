import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const Profile = ({ user, onUpdateProfile }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    bio: user.bio || ''
  });
  const [avatar, setAvatar] = useState(user.avatar || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      await onUpdateProfile({
        ...formData,
        avatar
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Avatar Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatar}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                {editing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'background.paper'
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>
              {!editing && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
                type="email"
              />
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
              />
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editing}
                fullWidth
                multiline
                rows={4}
              />

              {editing && (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || '',
                        bio: user.bio || ''
                      });
                      setAvatar(user.avatar || null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                  >
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile; 