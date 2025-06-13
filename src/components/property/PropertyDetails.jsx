import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  IconButton,
  Button,
  Divider,
  Avatar,
  alpha,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  SquareFoot as SquareFootIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  CalendarToday as CalendarIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const PropertyDetails = ({ property, onClose, onEdit, onStatusChange, theme }) => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = property?.images?.length || 0;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    beforeChange: (current, next) => setActiveStep(next),
    nextArrow: <KeyboardArrowRightIcon />,
    prevArrow: <KeyboardArrowLeftIcon />,
  };

  if (!property) return null;

  const activeAmenities = Object.entries(property.amenities || {})
    .filter(([_, value]) => value)
    .map(([key]) => key);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: alpha(theme.palette.background.default, 0.98),
        p: { xs: 1, sm: 2, md: 3 },
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.5, md: 2 },
          mb: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: { xs: 1, sm: 2 },
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Stack>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.primary.main,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Property Details
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              ID: {property.id}
            </Typography>
          </Stack>
        </Stack>
        <Chip
          label={property.available ? 'Available' : 'Occupied'}
          size="small"
          sx={{
            height: { xs: 24, sm: 28 },
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: 600,
            px: { xs: 1, sm: 2 },
            borderRadius: '14px',
            bgcolor: property.available
              ? alpha(theme.palette.success.main, 0.1)
              : alpha(theme.palette.error.main, 0.1),
            color: property.available
              ? theme.palette.success.main
              : theme.palette.error.main,
            border: '1px solid',
            borderColor: property.available
              ? alpha(theme.palette.success.main, 0.3)
              : alpha(theme.palette.error.main, 0.3),
          }}
        />
      </Paper>

      {/* Content Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Left Column - Images Only */}
        <Grid item xs={12} md={7}>
          <Stack spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {/* Title Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1, 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                {property.title}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: '0.9rem', sm: '1rem' } }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  {property.address}, {property.city}
                </Typography>
              </Stack>
            </Paper>

            {/* Image Slider Card */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                maxWidth: '100%',
                maxHeight: { xs: '250px', sm: '300px', md: '450px' },
                background: theme.palette.background.paper,
              }}
            >
              {property.images && property.images.length > 0 ? (
                <Box sx={{ position: 'relative' }}>
                  <Slider {...sliderSettings}>
                    {property.images.map((image, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          paddingTop: '45%',
                          width: '90%',
                          margin: '0 auto',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/${image}`}
                          alt={`Property ${index + 1}`}
                          loading="lazy"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    ))}
                  </Slider>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: { xs: '250px', sm: '300px', md: '450px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No images available
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Property Details Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <MoneyIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2">
                        Rs. {property.price.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SquareFootIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2">
                        {property.size} sq.ft
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarIcon sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="body2">
                        Posted: {new Date(property.postedDate).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            {/* Amenities Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Amenities
                </Typography>
                <Grid container spacing={1}>
                  {activeAmenities.map((amenity) => (
                    <Grid item key={amenity}>
                      <Chip
                        label={amenity}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column - Actions */}
        <Grid item xs={12} md={5}>
          <Stack spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {/* Action Buttons */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Edit Property
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={property.available ? <BlockIcon /> : <CheckCircleIcon />}
                  onClick={onStatusChange}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    color: property.available
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                    borderColor: property.available
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                    '&:hover': {
                      borderColor: property.available
                        ? theme.palette.error.main
                        : theme.palette.success.main,
                      bgcolor: property.available
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.success.main, 0.1),
                    },
                  }}
                >
                  {property.available ? 'Mark as Occupied' : 'Mark as Available'}
                </Button>
              </Stack>
            </Paper>

            {/* Description Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.description}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyDetails; 