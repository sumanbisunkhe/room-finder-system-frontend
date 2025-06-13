import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  RadioGroup,
  Radio,
  Stack,
  Chip,
  InputAdornment,
  alpha,
  Divider,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  BackupTable as BackupIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  AcUnit as AcIcon,
  Fireplace as HeatingIcon,
  Tv as TvIcon,
  Kitchen as KitchenIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CustomScrollbar = styled('div')(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  // Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: `${alpha(theme.palette.text.primary, 0.2)} transparent`,
  // Chrome, Safari, Edge
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.text.primary, 0.2),
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.3),
  },
}));

const amenityIcons = {
  wifi: WifiIcon,
  parking: ParkingIcon,
  ac: AcIcon,
  heating: HeatingIcon,
  tv: TvIcon,
  kitchen: KitchenIcon,
};

const PropertyModal = ({
  open,
  onClose,
  propertyForm,
  setPropertyForm,
  handleSubmit,
  selectedProperty,
  theme,
  loading,
  setSnackbar,
}) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxTotalSize = 20 * 1024 * 1024; // 20MB
    const maxImages = 5;

    // Calculate current size from NEW images only
    const currentSize = propertyForm.images
      .filter(img => typeof img !== 'string') // Filter out existing images
      .reduce((sum, img) => sum + img.file.size, 0);

    let validImages = [];
    let errorMessage = "";

    files.forEach(file => {
      if (propertyForm.images.length + validImages.length >= maxImages) {
        errorMessage = `Maximum ${maxImages} images allowed`;
      } else if (currentSize + file.size > maxTotalSize) {
        errorMessage = `Total size exceeds 20MB`;
      } else {
        validImages.push({
          preview: URL.createObjectURL(file),
          file: file
        });
      }
    });

    if (errorMessage) {
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }

    setPropertyForm(prev => ({
      ...prev,
      images: [...prev.images, ...validImages]
    }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...propertyForm.images];
    updatedImages.splice(index, 1);
    setPropertyForm({ ...propertyForm, images: updatedImages });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '16px',
          background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${theme.palette.background.paper})`,
          backdropFilter: 'blur(20px)',
          overflowX: 'hidden',
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginTop: '2px',
          },
          '& .MuiDialogContent-root': {
            overflowX: 'hidden',
          },
          '& .MuiGrid-root': {
            width: '100%',
            margin: 0,
          },
          '& .MuiGrid-item': {
            paddingTop: '16px',
            paddingLeft: '16px',
          },
        } 
      }}
    >
      <DialogTitle 
        sx={{
          p: 1.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            color="primary.main"
            sx={{ fontSize: '1rem' }}
          >
            {selectedProperty ? 'Edit Property' : 'Create New Property'}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent 
        sx={{ 
          p: 2,
          overflowX: 'hidden',
          '& > .MuiGrid-root': {
            width: '100%',
            margin: 0,
          }
        }}
      >
        <Grid 
          container 
          spacing={2}
          sx={{
            flexWrap: 'wrap',
            width: '100%',
            m: 0,
          }}
        >
          {/* Left Column */}
          <Grid 
            item 
            xs={12} 
            md={6}
            sx={{
              maxWidth: '100%',
            }}
          >
            {/* Basic Information Section */}
            <Paper 
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
                maxWidth: '100%',
              }}
            >
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                gutterBottom 
                color="primary.main"
                sx={{ fontSize: '0.813rem' }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    variant="outlined"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                    required
                    error={!propertyForm.title}
                    helperText={!propertyForm.title && "Title is required"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    variant="outlined"
                    value={propertyForm.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setPropertyForm({ ...propertyForm, price: value });
                      }
                    }}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                    }}
                    size="small"
                    error={!propertyForm.price}
                    helperText={!propertyForm.price && "Price is required"}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Size"
                    type="number"
                    variant="outlined"
                    value={propertyForm.size}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setPropertyForm({ ...propertyForm, size: value });
                      }
                    }}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
                    }}
                    size="small"
                    error={!propertyForm.size}
                    helperText={!propertyForm.size && "Size is required"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    value={propertyForm.address}
                    onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                    required
                    error={!propertyForm.address}
                    helperText={!propertyForm.address && "Address is required"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="City"
                    variant="outlined"
                    value={propertyForm.city}
                    onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                    required
                    error={!propertyForm.city}
                    helperText={!propertyForm.city && "City is required"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Description Section */}
            <Paper 
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
                maxWidth: '100%',
              }}
            >
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                gutterBottom 
                color="primary.main"
                sx={{ fontSize: '0.813rem' }}
              >
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Property Description"
                variant="outlined"
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                size="small"
              />
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid 
            item 
            xs={12} 
            md={6}
            sx={{
              maxWidth: '100%',
            }}
          >
            {/* Images Section */}
            <Paper 
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
                maxWidth: '100%',
              }}
            >
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                gutterBottom 
                color="primary.main"
                sx={{ fontSize: '0.813rem' }}
              >
                Images
              </Typography>
              <FormControl fullWidth>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="property-images"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
                <label htmlFor="property-images">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<BackupIcon sx={{ fontSize: '1rem' }} />}
                    fullWidth
                    size="small"
                    sx={{
                      borderStyle: 'dashed',
                      borderWidth: 1,
                      fontSize: '0.813rem',
                      '&:hover': {
                        borderStyle: 'dashed',
                        borderWidth: 1,
                      }
                    }}
                  >
                    Upload Images
                  </Button>
                </label>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 0.5, 
                    display: 'block',
                    fontSize: '0.75rem'
                  }}
                >
                  Max 5 images (JPEG, PNG), total max 20MB
                </Typography>

                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 1, 
                    flexWrap: 'wrap',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  {propertyForm.images.map((image, index) => {
                    const isString = typeof image === 'string';
                    const src = isString ?
                      `${import.meta.env.VITE_API_URL}/uploads/${image}` :
                      image.preview;
                    return (
                      <Box 
                        key={index} 
                        sx={{ 
                          position: 'relative',
                          '&:hover .delete-icon': {
                            opacity: 1,
                          }
                        }}
                      >
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                        <IconButton
                          size="small"
                          className="delete-icon"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            opacity: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            padding: '2px',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.8)',
                            },
                            transition: 'opacity 0.2s ease-in-out',
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </FormControl>
            </Paper>

            {/* Amenities Section */}
            <Paper 
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
                maxWidth: '100%',
              }}
            >
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                gutterBottom 
                color="primary.main"
                sx={{ fontSize: '0.813rem' }}
              >
                Amenities & Availability
              </Typography>
              <Box 
                sx={{ 
                  mb: 1.5,
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 0.5, 
                    flexWrap: 'wrap',
                    maxWidth: '100%',
                  }}
                >
                  {Object.entries(propertyForm.amenities).map(([amenity, checked]) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <Chip
                        key={amenity}
                        icon={<Icon sx={{ fontSize: '0.875rem' }} />}
                        label={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                        size="small"
                        onClick={() => setPropertyForm({
                          ...propertyForm,
                          amenities: {
                            ...propertyForm.amenities,
                            [amenity]: !checked
                          }
                        })}
                        sx={{
                          bgcolor: checked ? 'primary.main' : 'transparent',
                          color: checked ? 'white' : 'text.primary',
                          border: '1px solid',
                          borderColor: checked ? 'primary.main' : 'divider',
                          '&:hover': {
                            bgcolor: checked ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                          },
                          transition: 'all 0.2s ease-in-out',
                          height: 24,
                          '& .MuiChip-label': {
                            fontSize: '0.75rem',
                            padding: '0 8px',
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
              <FormControl component="fieldset" size="small">
                <RadioGroup
                  row
                  value={propertyForm.available ? 'available' : 'unavailable'}
                  onChange={(e) => setPropertyForm({
                    ...propertyForm,
                    available: e.target.value === 'available'
                  })}
                >
                  <FormControlLabel
                    value="available"
                    control={<Radio color="primary" size="small" />}
                    label={<Typography sx={{ fontSize: '0.813rem' }}>Available</Typography>}
                  />
                  <FormControlLabel
                    value="unavailable"
                    control={<Radio color="error" size="small" />}
                    label={<Typography sx={{ fontSize: '0.813rem' }}>Unavailable</Typography>}
                  />
                </RadioGroup>
              </FormControl>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{
        px: 2,
        py: 1.5,
        background: alpha(theme.palette.background.paper, 0.9),
      }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            fontSize: '0.813rem',
            '&:hover': {
              bgcolor: alpha(theme.palette.text.secondary, 0.1),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          size="small"
          sx={{
            px: 2,
            fontSize: '0.813rem',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: '6px',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {selectedProperty ? 'Update Property' : 'Create Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyModal; 