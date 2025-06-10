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
  Card,
  CardContent,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Crop as CropIcon,
  PhotoLibrary as ViewPhotoIcon,
  AddAPhoto as AddPhotoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`
      : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.1)})`,
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& .MuiTypography-root': {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(3),
  minHeight: '400px',
  maxHeight: '70vh',
  overflow: 'hidden',
  '& .ReactCrop': {
    flex: 1,
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    borderRadius: 8,
    overflow: 'hidden',
    '& .ReactCrop__crop-selection': {
      borderRadius: '50%',
      border: `2px solid ${theme.palette.primary.main}`,
      boxShadow: `0 0 0 9999px ${alpha(theme.palette.common.black, 0.7)}`,
    },
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2),
}));

const CropContainer = styled(Box)(({ theme }) => ({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  minWidth: 0,
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  '& .ReactCrop': {
    maxWidth: '100%',
    maxHeight: '100%',
    '& img': {
      maxWidth: '100%',
      maxHeight: '60vh',
      objectFit: 'contain',
    }
  }
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  width: '250px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const CropPreview = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  overflow: 'hidden',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  margin: '0 auto',
  position: 'relative',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
}));

const PreviewInfo = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  '& .MuiTypography-root': {
    marginBottom: theme.spacing(1),
  },
}));

const ImagePreviewBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const StyledImageDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
}));

const ImageViewerContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  backgroundColor: alpha(theme.palette.common.black, 0.9),
  '& img': {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
  },
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  '& .MuiIconButton-root': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.2),
    },
  },
}));

const ProfileSection = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    role: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [crop, setCrop] = useState({ unit: 'px', width: 100, height: 100, x: 0, y: 0 });
  const [tempImage, setTempImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

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
        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        }
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

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setImageDimensions({ width, height });
    
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    
    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x,
      y
    });
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageDimensions({ width: 0, height: 0 });
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (crop, percentCrop) => {
    if (imageRef && crop.width && crop.height) {
      getCroppedImage(imageRef, crop);
    }
  };

  const getCroppedImage = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingQuality = 'high';
    ctx.imageSmoothingEnabled = true;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
          }
          setAvatarFile(blob);
          setAvatarPreview(URL.createObjectURL(blob));
        }
      },
      'image/jpeg',
      1
    );
  };

  const handleSaveCrop = () => {
    if (imageRef && crop.width && crop.height) {
      getCroppedImage(imageRef, crop);
    }
    setShowCropDialog(false);
    setTempImage(null);
  };

  const handleCancelCrop = () => {
    setShowCropDialog(false);
    setTempImage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      // TODO: Implement avatar upload logic here
      await userService.updateUserProfile(currentUser.id, formData);
      await fetchUserData();
      showSnackbar('Profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showSnackbar(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
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
      setAvatarPreview(currentUser.avatar);
      setAvatarFile(null);
    }
  };

  const getCroppedPreview = () => {
    if (!imageRef || !crop.width || !crop.height) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    
    canvas.width = 120; // Match preview size
    canvas.height = 120;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleAvatarClick = (event) => {
    setAvatarMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAvatarMenuAnchor(null);
  };

  const handleViewImage = () => {
    setShowImageViewer(true);
    handleMenuClose();
  };

  const handleUploadClick = () => {
    handleMenuClose();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleAvatarChange(e);
    input.click();
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleImageViewerClose = () => {
    setShowImageViewer(false);
    setImageZoom(1);
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
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                overflow: isDesktop ? 'auto' : 'visible',
                position: 'relative',
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview || '/images/admin.png'}
                    onClick={handleAvatarClick}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      border: `4px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[3],
                      bgcolor: theme.palette.primary.main,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      '& img': {
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        marginTop: avatarPreview ? '0px' : '15px'
                      }
                    }}
                  >
                    {!avatarPreview && !currentUser?.avatar && <AccountCircleIcon sx={{ fontSize: 60 }} />}
                  </Avatar>
                </Box>
                
                {/* Avatar Menu */}
                <Menu
                  anchorEl={avatarMenuAnchor}
                  open={Boolean(avatarMenuAnchor)}
                  onClose={handleMenuClose}
                  TransitionComponent={Fade}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      borderRadius: 2,
                      minWidth: 180,
                    }
                  }}
                >
                  <MenuItem onClick={handleViewImage} disabled={!avatarPreview && !currentUser?.avatar}>
                    <ListItemIcon>
                      <ViewPhotoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Photo</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleUploadClick}>
                    <ListItemIcon>
                      <AddPhotoIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Upload Photo</ListItemText>
                  </MenuItem>
                </Menu>

                {/* Image Viewer Dialog */}
                <StyledImageDialog
                  open={showImageViewer}
                  onClose={handleImageViewerClose}
                  maxWidth={false}
                >
                  <ImageViewerContent>
                    <img
                      src={avatarPreview || currentUser?.avatar}
                      alt="Profile"
                      style={{
                        transform: `scale(${imageZoom})`,
                        transition: 'transform 0.3s',
                      }}
                    />
                    <ZoomControls>
                      <IconButton onClick={handleZoomOut} size="small">
                        <ZoomOutIcon />
                      </IconButton>
                      <IconButton onClick={handleZoomIn} size="small">
                        <ZoomInIcon />
                      </IconButton>
                    </ZoomControls>
                  </ImageViewerContent>
                </StyledImageDialog>
                
                <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  {currentUser?.fullName || 'User Name'}
                </Typography>
                
                <Chip
                  label={currentUser?.role?.toUpperCase()}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '16px',
                    px: 2,
                  }}
                />

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                  }}>
                    <PersonIcon color="primary" />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {currentUser?.username}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                  }}>
                    <EmailIcon color="primary" />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {currentUser?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                  }}>
                    <PhoneIcon color="primary" />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {currentUser?.phoneNumber || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1} direction="row" justifyContent="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Joined: {format(new Date(currentUser?.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">•</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Updated: {format(new Date(currentUser?.updatedAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
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
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: isDesktop ? 'hidden' : 'visible',
              }}
            >
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}>
                <EditIcon color="primary" />
                <Typography variant="h5" color="primary" fontWeight={600}>
                  Edit Profile Information
                </Typography>
              </Box>

              <Box sx={{ 
                p: 4,
                flexGrow: 1,
                overflow: isDesktop ? 'auto' : 'visible',
              }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
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
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
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
                  disabled={saving}
                  startIcon={<CancelIcon />}
                  sx={{ 
                    minWidth: 120,
                    borderRadius: 2,
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={saving}
                  onClick={handleSubmit}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ 
                    minWidth: 120,
                    borderRadius: 2,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <StyledDialog
        open={showCropDialog}
        maxWidth="md"
        fullWidth
        onClose={handleCancelCrop}
      >
        <StyledDialogTitle>
          <CropIcon color="primary" />
          <Typography>Crop Profile Picture</Typography>
        </StyledDialogTitle>
        <StyledDialogContent>
          {tempImage && (
            <>
              <CropContainer>
                <ReactCrop
                  crop={crop}
                  onChange={(c) => {
                    // Ensure crop stays within image boundaries
                    if (imageRef) {
                      const newCrop = {
                        ...c,
                        x: Math.max(0, Math.min(c.x, imageRef.width - c.width)),
                        y: Math.max(0, Math.min(c.y, imageRef.height - c.height)),
                        width: Math.min(c.width, imageRef.width - c.x),
                        height: Math.min(c.height, imageRef.height - c.y)
                      };
                      setCrop(newCrop);
                    }
                  }}
                  onComplete={handleCropComplete}
                  aspect={1}
                  circularCrop
                  minWidth={100}
                  keepSelection
                  ruleOfThirds
                >
                  <img
                    ref={ref => {
                      setImageRef(ref);
                      if (ref && !crop.width) {
                        const size = Math.min(ref.width, ref.height);
                        const x = (ref.width - size) / 2;
                        const y = (ref.height - size) / 2;
                        setCrop({
                          unit: 'px',
                          width: size,
                          height: size,
                          x,
                          y
                        });
                      }
                    }}
                    src={tempImage}
                    style={{
                      maxHeight: '60vh',
                      width: 'auto',
                      height: 'auto'
                    }}
                    alt="Crop preview"
                  />
                </ReactCrop>
                {imageRef && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Image size: {imageRef.width} x {imageRef.height} pixels
                  </Typography>
                )}
              </CropContainer>
              
              <PreviewContainer>
                <PreviewInfo>
                  <Typography variant="h6" fontWeight={600}>
                    Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is how your profile picture will look
                  </Typography>
                </PreviewInfo>
                
                <CropPreview>
                  <img
                    src={getCroppedPreview()}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    }}
                  />
                </CropPreview>

                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary" align="center" display="block" gutterBottom>
                    Recommended size: 200x200 pixels
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Drag the crop area to adjust
                  </Typography>
                </Box>
              </PreviewContainer>
            </>
          )}
        </StyledDialogContent>
        <StyledDialogActions>
          <Button
            onClick={handleCancelCrop}
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCrop}
            variant="contained"
            color="primary"
            startIcon={<CropIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: 2,
              '&:hover': {
                background: theme => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              },
            }}
          >
            Apply Crop
          </Button>
        </StyledDialogActions>
      </StyledDialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default ProfileSection; 