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
} from '@mui/material';
import {
  Close as CloseIcon,
  BackupTable as BackupIcon,
} from '@mui/icons-material';

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
          '& .MuiDialogContent-root': {
            borderRadius: '16px'
          }
        } 
      }}
    >
      <DialogTitle sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 2,
      }}>
        <Typography variant="h5" fontWeight={600}>
          {selectedProperty ? 'Edit Property' : 'Create New Property'}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Title */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title *"
              variant="outlined"
              value={propertyForm.title}
              onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
              required
              error={!propertyForm.title}
              helperText={!propertyForm.title && "Title is required"}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              value={propertyForm.description}
              onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price *"
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
              inputProps={{ min: 0, step: "0.01" }}
              error={!propertyForm.price || isNaN(parseFloat(propertyForm.price))}
              helperText={(!propertyForm.price || isNaN(parseFloat(propertyForm.price))) && "Valid price required"}
            />
          </Grid>

          {/* Size */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Size *"
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
              inputProps={{ min: 0 }}
              error={!propertyForm.size || isNaN(parseInt(propertyForm.size, 10))}
              helperText={(!propertyForm.size || isNaN(parseInt(propertyForm.size, 10))) && "Valid size required"}
            />
          </Grid>

          {/* Address */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address *"
              variant="outlined"
              value={propertyForm.address}
              onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
              required
              error={!propertyForm.address}
              helperText={!propertyForm.address && "Address is required"}
            />
          </Grid>

          {/* City */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City *"
              variant="outlined"
              value={propertyForm.city}
              onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
              required
              error={!propertyForm.city}
              helperText={!propertyForm.city && "City is required"}
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
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
                  startIcon={<BackupIcon />}
                  fullWidth
                >
                  Upload Images
                </Button>
              </label>
              <Typography variant="caption" color="textSecondary">
                Max 5 images (JPEG, PNG), total max 20MB
              </Typography>

              {/* Image Previews */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                {propertyForm.images.map((image, index) => {
                  const isString = typeof image === 'string';
                  const src = isString ?
                    `${import.meta.env.VITE_API_URL}/uploads/${image}` :
                    URL.createObjectURL(image.file);
                  return (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)'
                          }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </FormControl>
          </Grid>

          {/* Amenities */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Amenities *
            </Typography>
            <FormGroup row>
              {['wifi', 'parking', 'ac', 'heating', 'tv', 'kitchen'].map((amenity) => (
                <FormControlLabel
                  key={amenity}
                  control={
                    <Checkbox
                      checked={propertyForm.amenities?.[amenity] || false}
                      onChange={(e) => setPropertyForm({
                        ...propertyForm,
                        amenities: {
                          ...propertyForm.amenities,
                          [amenity]: e.target.checked
                        }
                      })}
                      color="primary"
                    />
                  }
                  label={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                />
              ))}
            </FormGroup>
          </Grid>

          {/* Availability */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Availability *
              </Typography>
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
                  control={<Radio color="primary" />}
                  label="Available for Booking"
                />
                <FormControlLabel
                  value="unavailable"
                  control={<Radio color="primary" />}
                  label="Currently Unavailable"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Button
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: '12px',
          }}
        >
          {selectedProperty ? 'Update Property' : 'Create Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyModal; 