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
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';
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

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontFamily: '"Outfit", sans-serif',
}));

const ProfileSection = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isTablet = useMediaQuery(theme.breakpoints.up('sm'));
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: 400 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 'sm', mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box 
      component="main"
      sx={{ 
        flex: 1,
        py: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 2, sm: 2.5, md: 3 },
        maxWidth: '100%',
        overflow: { xs: 'auto', md: 'auto' },
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container 
        maxWidth={false}
        disableGutters
        sx={{ 
          height: { xs: 'auto', md: '100%' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: '100vh', md: 'auto' },
          flex: { xs: 'none', md: 1 },
          px: { xs: 0, sm: 0, md: 0 },
          mx: 0,
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 2.5, sm: 3, md: 1 }}
          sx={{ 
            flexGrow: { xs: 0, md: 1 },
            alignItems: { xs: 'stretch', md: 'stretch' },
            width: '100%',
            m: 0,
            pb: { xs: 2, sm: 3, md: 0 },
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <Grid 
            item 
            xs={12} 
            md={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: 'auto', md: '100%' },
              height: { xs: 'auto', md: '100%' },
            }}
          >
            <Card 
              elevation={0}
              sx={{ 
                flex: { xs: 'none', md: 1 },
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: { xs: 2, sm: 3 },
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                position: 'relative',
                maxWidth: { xs: '100%', sm: '440px', md: 'none' },
                mx: { xs: 'auto', md: 0 },
                overflow: 'hidden',
                m: { xs: 1, sm: 1.5, md: 1.5 },
                height: { xs: 'auto', md: '100%' },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100px',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  borderTopLeftRadius: 'inherit',
                  borderTopRightRadius: 'inherit',
                  zIndex: 0,
                },
              }}
            >
              <CardContent 
                sx={{ 
                  p: { xs: 2.5, sm: 3, md: 4 },
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 2.5, sm: 3 },
                  height: '100%',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: { xs: 1, sm: 1.5 } }}>
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
                      transition: 'transform 0.2s ease-in-out',
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
                    {!avatarPreview && !currentUser?.avatar && <AccountCircleIcon sx={{ fontSize: { xs: 50, sm: 60 } }} />}
                  </Avatar>
                </Box>
                
                <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                  <StyledTypography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      mb: 1 
                    }}
                  >
                  {currentUser?.fullName || 'User Name'}
                </StyledTypography>
                
                <Chip
                  label={currentUser?.role?.toUpperCase()}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '16px',
                    px: 2,
                      height: { xs: 28, sm: 32 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  />
                  </Box>

                <Stack 
                  spacing={{ xs: 1.5, sm: 2 }} 
                  sx={{ 
                    width: '100%',
                    mb: { xs: 2, sm: 2.5 }
                  }}
                >
                  {[
                    { icon: PersonIcon, label: 'Username', value: currentUser?.username },
                    { icon: EmailIcon, label: 'Email', value: currentUser?.email },
                    { icon: PhoneIcon, label: 'Phone', value: currentUser?.phoneNumber || 'Not set' }
                  ].map((item, index) => (
                    <Box 
                      key={item.label}
                      sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.background.default, 0.9),
                        }
                      }}
                    >
                      <item.icon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {item.label}
                      </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          sx={{ 
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.value}
                      </Typography>
                    </Box>
                  </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                <Stack 
                  spacing={1} 
                  direction="row" 
                  justifyContent="center"
                  sx={{
                    mt: 'auto',
                    flexWrap: 'wrap',
                    gap: { xs: 1, sm: 2 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon 
                      fontSize="small" 
                      color="action" 
                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Joined: {format(new Date(currentUser?.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">•</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon 
                      fontSize="small" 
                      color="action"
                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
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
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: 'auto', md: '100%' },
              height: { xs: 'auto', md: '100%' },
            }}
          >
            <Card 
              elevation={0}
              sx={{ 
                flex: { xs: 'none', md: 1 },
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: 2, sm: 3 },
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
                m: { xs: 1, sm: 1.5, md: 1.5 },
                height: { xs: 'auto', md: '100%' },
              }}
            >
              <Box sx={{ 
                p: { xs: 2, sm: 3 },
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 2 },
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                backdropFilter: 'blur(8px)',
              }}>
                <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                  width: { xs: '100%', sm: 'auto' },
                }}>
                  <Box
                    sx={{
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      flexShrink: 0,
                    }}
                  >
                    <EditIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                  <Box sx={{ flex: { xs: 1, sm: 'none' } }}>
                    <StyledTypography 
                      variant="h5" 
                      color="primary" 
                      fontWeight={600} 
                      sx={{ 
                        lineHeight: 1.2,
                        fontSize: { xs: '1.125rem', sm: '1.25rem' },
                      }}
                    >
                      Profile Information
                    </StyledTypography>
                    <StyledTypography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {isEditing ? 'Edit your personal information below' : 'View your personal information'}
                    </StyledTypography>
                  </Box>
                </Box>
                <Stack 
                  direction="row" 
                  spacing={2}
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
                        startIcon={<CancelIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />}
                        fullWidth={!isDesktop}
                        size={isDesktop ? 'medium' : 'small'}
                        sx={{ 
                          minWidth: { xs: 0, sm: 90, md: 100 },
                          flex: { xs: 1, sm: 'none' },
                          borderRadius: '12px',
                          borderColor: theme => alpha(theme.palette.primary.main, 0.5),
                          height: { xs: '32px', sm: '36px', md: '40px' },
                          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
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
                          <CircularProgress size={isDesktop ? 20 : 16} /> : 
                          <SaveIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />
                        }
                        fullWidth={!isDesktop}
                        size={isDesktop ? 'medium' : 'small'}
                        sx={{ 
                          minWidth: { xs: 0, sm: 120, md: 140 },
                          flex: { xs: 1, sm: 'none' },
                          borderRadius: '12px',
                          height: { xs: '32px', sm: '36px', md: '40px' },
                          fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                      startIcon={<EditIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' } }} />}
                      onClick={() => setIsEditing(true)}
                      fullWidth={!isDesktop}
                      size={isDesktop ? 'medium' : 'small'}
                      sx={{ 
                        minWidth: { xs: 0, sm: 110, md: 120 },
                        flex: { xs: 1, sm: 'none' },
                        borderRadius: '12px',
                        height: { xs: '32px', sm: '36px', md: '40px' },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                        background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                p: { xs: 2, sm: 3 },
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <form onSubmit={handleSubmit} style={{ height: '100%' }}>
                  <Stack spacing={{ xs: 3, sm: 4 }}>
                    {/* Basic Information Section */}
                    <Box>
                      <StyledTypography 
                        variant="subtitle2" 
                        color="text.secondary"
                        sx={{ 
                          mb: { xs: 2, sm: 3 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
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
                      <Stack spacing={{ xs: 2, sm: 3 }}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Username"
                          value={formData.username}
                          onChange={handleChange('username')}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <PersonIcon color="action" sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              bgcolor: theme => alpha(theme.palette.action.hover, 0.04),
                              height: { xs: '42px', sm: '48px' },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            },
                            '& .MuiOutlinedInput-input': {
                              fontSize: { xs: '0.875rem', sm: '1rem' },
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
                              <BadgeIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              bgcolor: theme => alpha(theme.palette.action.hover, 0.04),
                              height: '48px',
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
                          mb: { xs: 2, sm: 3 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
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
                      <Stack spacing={{ xs: 2, sm: 3 }}>
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
                              <EmailIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              bgcolor: theme => isEditing ? 'transparent' : alpha(theme.palette.action.hover, 0.04),
                              transition: 'all 0.2s',
                              height: '48px',
                              '&:hover': {
                                bgcolor: theme => isEditing ? alpha(theme.palette.action.hover, 0.04) : null,
                              },
                              '&.Mui-focused': {
                                bgcolor: 'transparent',
                              }
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
                              <PhoneIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              bgcolor: theme => isEditing ? 'transparent' : alpha(theme.palette.action.hover, 0.04),
                              transition: 'all 0.2s',
                              height: '48px',
                              '&:hover': {
                                bgcolor: theme => isEditing ? alpha(theme.palette.action.hover, 0.04) : null,
                              },
                              '&.Mui-focused': {
                                bgcolor: 'transparent',
                              }
                            },
                          }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          label="Full Name"
                          value={formData.fullName}
                          onChange={handleChange('fullName')}
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: (
                              <AccountCircleIcon color="action" sx={{ mr: 1 }} />
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                              bgcolor: theme => isEditing ? 'transparent' : alpha(theme.palette.action.hover, 0.04),
                              transition: 'all 0.2s',
                              height: '48px',
                              '&:hover': {
                                bgcolor: theme => isEditing ? alpha(theme.palette.action.hover, 0.04) : null,
                              },
                              '&.Mui-focused': {
                                bgcolor: 'transparent',
                              }
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
      </Container>

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