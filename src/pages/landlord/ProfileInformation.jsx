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
  Container,
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
import * as userService from '../../services/userService';
import { useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
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
    flex: '1',
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    borderRadius: '8px',
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
  minWidth: '0',
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
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`
      : `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
    backdropFilter: 'blur(8px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
}));

const ImageViewerContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  background: alpha(theme.palette.background.paper, 0.8),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(8px)',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: "'Outfit', sans-serif",
  letterSpacing: '0.3px',
}));

const ProfileInformation = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isTablet = useMediaQuery(theme.breakpoints.up('sm'));
  const { currentUser, setSnackbar } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const [crop, setCrop] = useState({ 
    unit: 'px', 
    width: 100, 
    height: 100, 
    x: 0, 
    y: 0,
    aspect: 1 
  });
  const [tempImage, setTempImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
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
      setError('Failed to load user data. Please try again later.');
      setSnackbar({ open: true, message: 'Failed to load user data', severity: 'error' });
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

    const croppedImage = canvas.toDataURL('image/jpeg');
    setAvatarPreview(croppedImage);
    setAvatarFile(croppedImage);
    setShowCropDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updateData = {
        ...formData,
        avatar: avatarFile
      };

      const response = await userService.updateUserProfile(currentUser.id, updateData);
      
      if (response.success) {
        await fetchUserData();
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      } else {
        if (response.data) {
          const firstError = Object.values(response.data)[0];
          setSnackbar({
            open: true,
            message: firstError,
            severity: 'error'
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || 'Failed to update profile',
            severity: 'error'
          });
        }
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || ''
      });
      setAvatarPreview(user.avatar);
      setAvatarFile(null);
    }
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

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        mt: { xs: '56px', sm: '64px' },
        minHeight: 'calc(100vh - 64px)',
        px: { xs: 0.5, sm: 1, md: 1.5 },
        ml: { lg: '240px' },
        transition: 'margin 0.2s ease-in-out',
        height: '100%',
        overflow: 'auto'
      }}
    >
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            mx: { xs: 1, sm: 1.5, md: 2 },
            mt: { xs: 1, sm: 1.5, md: 2 }
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      <Box sx={{ 
        p: { xs: 1, sm: 1.5, md: 2 },
        pt: { xs: 2, sm: 2.5, md: 3 },
        pb: { xs: 4, sm: 4, md: 4 },
        height: '100%',
        overflow: 'visible'
      }}>
        <Grid 
          container 
          spacing={{ xs: 1, sm: 1.5, md: 2 }} 
          sx={{
            pl: { xs: 0.5, sm: 1, md: 1.5 },
            height: '100%'
          }}>
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{
              p: { xs: '8px !important', sm: '12px !important' },
              order: { xs: 1, md: 1 },
            }}
          >
            <Card 
              elevation={0}
            sx={{
                height: '100%',
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: { xs: 1, sm: 2 },
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: { xs: '80px', sm: '100px' },
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  borderTopLeftRadius: { xs: '8px', sm: '16px' },
                  borderTopRightRadius: { xs: '8px', sm: '16px' },
                  zIndex: 0,
              },
            }}
          >
              <CardContent sx={{ 
                p: { xs: 2, sm: 3, md: 4 }, 
                textAlign: 'center' 
              }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview || '/images/admin.png'}
                    onClick={handleAvatarClick}
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      margin: '0 auto',
                      border: `4px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[3],
                      bgcolor: theme.palette.primary.main,
                      cursor: 'pointer',
                      '& img': {
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        marginTop: avatarPreview ? '0px' : '15px'
                      }
                    }}
                  >
                    {!avatarPreview && !user?.avatar && <AccountCircleIcon sx={{ fontSize: { xs: 50, sm: 60 } }} />}
                  </Avatar>
                </Box>
                <StyledTypography 
                  variant="h5" 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 }, 
                    mb: 1, 
                    fontWeight: 600,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {user?.fullName || 'User Name'}
                </StyledTypography>
                <Chip
                  label={user?.role?.toUpperCase()}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '16px',
                    px: 2,
                    height: { xs: 24, sm: 28 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                />
                <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 2, sm: 3 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 },
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                  }}>
                    <PersonIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Username
                    </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {user?.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 },
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                  }}>
                    <EmailIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1.5, sm: 2 },
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1],
                  }}>
                    <PhoneIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {user?.phoneNumber || 'Not set'}
                      </Typography>
                  </Box>
                </Box>
                </Stack>
                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                <Stack spacing={1} direction="row" justifyContent="center" sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: { xs: 14, sm: 16 } }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Joined: {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>•</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: { xs: 14, sm: 16 } }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Updated: {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy') : 'N/A'}
                    </Typography>
                </Box>
              </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              p: { xs: '8px !important', sm: '12px !important' },
              order: { xs: 2, md: 2 },
            }}
          >
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: 1, sm: 2 },
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ 
                p: { xs: 1.5, sm: 2, md: 3 },
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                backdropFilter: 'blur(8px)',
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
                  width: { xs: '100%', sm: 'auto' },
                }}>
                  <Box
                    sx={{
                      width: { xs: 32, sm: 36, md: 40 },
                      height: { xs: 32, sm: 36, md: 40 },
                      borderRadius: { xs: '8px', sm: '12px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      flexShrink: 0,
                    }}
                  >
                    <EditIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                  </Box>
                  <Box sx={{ flex: { xs: 1, sm: 'none' } }}>
                    <StyledTypography 
                      variant="h5" 
                      color="primary" 
                      fontWeight={600} 
                      sx={{ 
                        lineHeight: 1.2,
                        fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                      }}
                    >
                      Profile Information
                    </StyledTypography>
                    <StyledTypography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      {isEditing ? 'Edit your personal information below' : 'View your personal information'}
                    </StyledTypography>
                  </Box>
                </Box>
                <Stack 
                  direction="row" 
                  spacing={{ xs: 1, sm: 2 }}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    ml: { xs: 0, sm: 'auto' },
                  }}
                >
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleReset();
                          setIsEditing(false);
                        }}
                        disabled={saving}
                        startIcon={<CancelIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />}
                        fullWidth={!isDesktop}
                        size="small"
                        sx={{ 
                          minWidth: { xs: 0, sm: 80, md: 90 },
                          flex: { xs: 1, sm: 'none' },
                          borderRadius: { xs: '6px', sm: '8px' },
                          borderColor: theme => alpha(theme.palette.primary.main, 0.5),
                          height: { xs: '28px', sm: '32px' },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          px: { xs: 1, sm: 1.5 },
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: theme => alpha(theme.palette.primary.main, 0.04),
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={(e) => {
                          handleSubmit(e);
                          setIsEditing(false);
                        }}
                        disabled={saving}
                        startIcon={saving ? 
                          <CircularProgress size={16} /> : 
                          <SaveIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
                        }
                        fullWidth={!isDesktop}
                        size="small"
                        sx={{ 
                          minWidth: { xs: 0, sm: 100, md: 110 },
                          flex: { xs: 1, sm: 'none' },
                          borderRadius: { xs: '6px', sm: '8px' },
                          height: { xs: '28px', sm: '32px' },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          px: { xs: 1, sm: 1.5 },
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          }
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />}
                      onClick={() => setIsEditing(true)}
                      fullWidth={!isDesktop}
                      size="small"
                      sx={{ 
                        minWidth: { xs: 0, sm: 90, md: 100 },
                        flex: { xs: 1, sm: 'none' },
                        borderRadius: { xs: '6px', sm: '8px' },
                        height: { xs: '28px', sm: '32px' },
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        px: { xs: 1, sm: 1.5 },
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Stack>
              </Box>
              <Box sx={{ 
                p: { xs: 1.5, sm: 2, md: 3 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
              }}>
                <form onSubmit={handleSubmit} style={{ height: '100%' }}>
                  <Stack spacing={{ xs: 2, sm: 3, md: 4 }}>
                    {/* Basic Information Section */}
                  <Box>
                      <StyledTypography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          mb: { xs: 1.5, sm: 2, md: 3 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                          '&::before': {
                            content: '""',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }
                        }}
                      >
                        Basic Information
                      </StyledTypography>
                      <Stack spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Username"
                          value={formData.username}
                          onChange={handleChange('username')}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <PersonIcon color="action" sx={{ mr: 1, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: { xs: '8px', sm: '12px' },
                              bgcolor: theme => alpha(theme.palette.action.hover, 0.04),
                              height: { xs: '40px', sm: '44px', md: '48px' },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                            '& .MuiOutlinedInput-input': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                          }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          label="Role"
                          value={formData.role}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <BadgeIcon color="action" sx={{ mr: 1, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: { xs: '8px', sm: '12px' },
                              bgcolor: theme => alpha(theme.palette.action.hover, 0.04),
                              height: { xs: '40px', sm: '44px', md: '48px' },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                            '& .MuiOutlinedInput-input': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                          }}
                        />
                      </Stack>
                  </Box>
                    {/* Contact Information Section */}
                    <Box>
                      <StyledTypography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          mb: { xs: 1.5, sm: 2, md: 3 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                          '&::before': {
                            content: '""',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }
                        }}
                      >
                        Contact Information
                      </StyledTypography>
                      <Stack spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Email"
                          value={formData.email}
                          onChange={handleChange('email')}
                          type="email"
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: (
                              <EmailIcon color="action" sx={{ mr: 1, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: { xs: '8px', sm: '12px' },
                              bgcolor: theme => isEditing ? 'transparent' : alpha(theme.palette.action.hover, 0.04),
                              transition: 'all 0.2s',
                              height: { xs: '40px', sm: '44px', md: '48px' },
                              '&:hover': {
                                bgcolor: theme => isEditing ? alpha(theme.palette.action.hover, 0.04) : null,
                              },
                              '&.Mui-focused': {
                                bgcolor: 'transparent',
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                            '& .MuiOutlinedInput-input': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                          }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          label="Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleChange('phoneNumber')}
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: (
                              <PhoneIcon color="action" sx={{ mr: 1, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: { xs: '8px', sm: '12px' },
                              bgcolor: theme => isEditing ? 'transparent' : alpha(theme.palette.action.hover, 0.04),
                              transition: 'all 0.2s',
                              height: { xs: '40px', sm: '44px', md: '48px' },
                              '&:hover': {
                                bgcolor: theme => isEditing ? alpha(theme.palette.action.hover, 0.04) : null,
                              },
                              '&.Mui-focused': {
                                bgcolor: 'transparent',
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                            '& .MuiOutlinedInput-input': {
                              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '1rem' },
                            },
                          }}
                        />
                      </Stack>
                </Box>
              </Stack>
                </form>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {/* Crop Dialog */}
      <StyledDialog
        open={showCropDialog}
        onClose={() => setShowCropDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            Crop Profile Picture
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: { xs: 1, sm: 2 } }}>
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={handleCropComplete}
              aspect={1}
            >
              <img
                ref={setImageRef}
                src={tempImage}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxWidth: '100%' }}
              />
            </ReactCrop>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowCropDialog(false)}
            sx={{
              borderRadius: { xs: '8px', sm: '12px' },
              px: { xs: 2, sm: 3 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (imageRef && crop.width && crop.height) {
                getCroppedImage(imageRef, crop);
              }
            }}
            sx={{
              borderRadius: { xs: '8px', sm: '12px' },
              px: { xs: 2, sm: 3 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            }}
          >
            Crop
          </Button>
        </DialogActions>
      </StyledDialog>
    </Container>
  );
};

export default ProfileInformation; 