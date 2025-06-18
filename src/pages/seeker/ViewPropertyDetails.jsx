import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useSnackbar } from '../../contexts/SnackbarContext';
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
  MobileStepper,
  Card,
  CardContent,
  useTheme,
  Modal,
  TextField,
  CircularProgress,
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
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import * as roomService from '../../services/roomService';
import * as bookingService from '../../services/bookingService';
import { decodeToken } from '../../utils/jwtUtils';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const ViewPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const context = useOutletContext();
  const setSnackbar = context?.setSnackbar;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    comments: '',
  });
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const data = await roomService.getRoomById(id);
        setProperty(data);
      } catch (error) {
        setSnackbar?.({
          open: true,
          message: 'Failed to load property details',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPropertyDetails();
  }, [id, setSnackbar]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleOpenBookingModal = () => {
    setOpenBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setOpenBookingModal(false);
    setDateError('');
    setBookingData({
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      comments: '',
    });
  };

  const handleValidationErrors = (data) => {
    // Reset any previous date error
    setDateError('');

    // For date-related errors, set the form error state
    if (data.startDate || data.endDate) {
      setDateError(data.startDate || data.endDate);
    }

    // Return the first error message from the data object
    return Object.values(data)[0];
  };

  const handleBookProperty = async () => {
    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('Please login to book a property', 'error');
        return;
      }

      const user = decodeToken(token);
      const seekerId = user?.id || user?.userId || user?.sub;
      
      if (!seekerId) {
        showSnackbar('Unable to identify user. Please try logging in again', 'error');
        return;
      }

      // Format dates in YYYY-MM-DD format in the local timezone
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const bookingRequest = {
        roomId: property.id,
        startDate: formatDate(bookingData.startDate),
        endDate: formatDate(bookingData.endDate),
        comments: bookingData.comments.trim(),
      };
      
      const response = await bookingService.createBooking(bookingRequest);

      if (response.success) {
        showSnackbar('Your booking request has been sent successfully!', 'success');
        handleCloseBookingModal();
      } else {
        // For validation errors, show the specific error message
        const errorMessage = response.data ? Object.values(response.data)[0] : response.message;
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create booking. Please try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!property) return null;

  const maxSteps = property?.images?.length || 0;
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
          m: { xs: 1.5, sm: 2, md: 3 },
          ml: { xs: 3, sm: 4, md: 5 },
          mr: { xs: 3, sm: 4, md: 5 },
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
            onClick={() => navigate(-1)}
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
        <Grid item xs={12} md={7} sx={{ mr: { xs: 3, sm: 3, md: 0 } }}>
          <Box sx={{ ml: { xs: 3, sm: 4, md: 5 } }}>
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
                  <>
                    <AutoPlaySwipeableViews
                      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                      index={activeStep}
                      onChangeIndex={handleStepChange}
                      enableMouseEvents
                      interval={6000}
                      style={{ maxHeight: '400px' }}
                    >
                      {property.images.map((image, index) => (
                        <div key={index}>
                          {Math.abs(activeStep - index) <= 2 ? (
                            <Box
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
                          ) : null}
                        </div>
                      ))}
                    </AutoPlaySwipeableViews>
                    <MobileStepper
                      steps={maxSteps}
                      position="static"
                      activeStep={activeStep}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        height: { xs: '40px', sm: '50px' },
                        '& .MuiButton-root': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          minWidth: { xs: '64px', sm: '80px' }
                        }
                      }}
                      nextButton={
                        <Button
                          size="small"
                          onClick={handleNext}
                          disabled={activeStep === maxSteps - 1}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:disabled': {
                              color: alpha(theme.palette.primary.main, 0.3),
                            },
                          }}
                        >
                          Next
                          {theme.direction === 'rtl' ? (
                            <KeyboardArrowLeftIcon />
                          ) : (
                            <KeyboardArrowRightIcon />
                          )}
                        </Button>
                      }
                      backButton={
                        <Button
                          size="small"
                          onClick={handleBack}
                          disabled={activeStep === 0}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:disabled': {
                              color: alpha(theme.palette.primary.main, 0.3),
                            },
                          }}
                        >
                          {theme.direction === 'rtl' ? (
                            <KeyboardArrowRightIcon />
                          ) : (
                            <KeyboardArrowLeftIcon />
                          )}
                          Back
                        </Button>
                      }
                    />
                  </>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      paddingTop: '40%',
                      position: 'relative',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HomeIcon sx={{ fontSize: 64, color: alpha(theme.palette.primary.main, 0.2) }} />
                    </Box>
                  </Box>
                )}
              </Paper>
            </Stack>
          </Box>
        </Grid>

        {/* Right Column - All Details */}
        <Grid item xs={12} md={5} sx={{ pr: { xs: 3, sm: 4, md: 5 }, ml: { xs: 3, sm: 3, md: 0 } }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {/* Key Details Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: theme.palette.primary.main,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Property Details
              </Typography>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <MoneyIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        Price
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        Rs. {property.price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <SquareFootIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        Size
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {property.size} sq.ft
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <CalendarIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      >
                        Posted Date
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {new Date(property.postedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Description Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: theme.palette.primary.main,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Description
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                  maxHeight: { xs: '60px', sm: '80px' },
                  overflow: 'auto',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.primary.main, 0.05),
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: '2px',
                  },
                }}
              >
                {property.description || 'No description provided.'}
              </Typography>
            </Paper>

            {/* Amenities Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: theme.palette.primary.main,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Amenities
              </Typography>
              <Box
                sx={{
                  maxHeight: '85px',
                  overflow: 'auto',
                  px: 0.5,
                  py: 0.5,
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '2px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: '2px',
                  },
                }}
              >
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  sx={{
                    gap: '6px',
                  }}
                >
                  {activeAmenities.length > 0 ? (
                    activeAmenities.map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          px: 1.25,
                          borderRadius: '13px',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.primary.main,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.15)}`,
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, p: 1 }}>
                      No amenities listed.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.25, sm: 1.5, md: 2 },
                borderRadius: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
                mt: { xs: 1, sm: 1.5, md: 2 },
                mb: { xs: 2, sm: 2, md: 0 }
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 1.5 }}
              >
                {/* Booking Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ py: 1.5, borderRadius: '8px' }}
                  onClick={handleOpenBookingModal}
                  disabled={!property.available}
                >
                  {property.available ? 'Book This Property' : 'Property Not Available'}
                </Button>

                {/* Booking Modal */}
                <Modal
                  open={openBookingModal}
                  onClose={handleCloseBookingModal}
                  aria-labelledby="booking-modal-title"
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: { xs: '90%', sm: '450px' },
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: 24,
                      p: { xs: 2, sm: 3 },
                      maxHeight: '90vh',
                      overflowY: 'auto',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        Book Property
                      </Typography>
                      <IconButton
                        onClick={handleCloseBookingModal}
                        size="small"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: 'text.primary' },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Stack spacing={3}>
                        <DatePicker
                          label="Start Date"
                          value={bookingData.startDate}
                          onChange={(newValue) => {
                            setBookingData(prev => ({ ...prev, startDate: newValue }));
                          }}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        
                        <DatePicker
                          label="End Date"
                          value={bookingData.endDate}
                          onChange={(newValue) => {
                            setBookingData(prev => ({ ...prev, endDate: newValue }));
                          }}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />

                        <TextField
                          label="Comments"
                          multiline
                          rows={3}
                          value={bookingData.comments}
                          onChange={(e) => setBookingData(prev => ({ ...prev, comments: e.target.value }))}
                          placeholder="Add any special requests or notes..."
                          fullWidth
                        />

                        <Button
                          variant="contained"
                          onClick={handleBookProperty}
                          disabled={bookingLoading}
                          sx={{
                            py: 1.5,
                            mt: 2,
                            position: 'relative',
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: theme.palette.primary.dark,
                            },
                          }}
                        >
                          {bookingLoading ? (
                            <>
                              <CircularProgress
                                size={24}
                                sx={{
                                  color: theme.palette.primary.contrastText,
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  marginTop: '-12px',
                                  marginLeft: '-12px',
                                }}
                              />
                              <span style={{ visibility: 'hidden' }}>Confirm Booking</span>
                            </>
                          ) : (
                            'Confirm Booking'
                          )}
                        </Button>
                      </Stack>
                    </LocalizationProvider>
                  </Box>
                </Modal>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewPropertyDetails; 