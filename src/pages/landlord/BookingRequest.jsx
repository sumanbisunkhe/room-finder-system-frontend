import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  IconButton,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  alpha,
  Pagination,
  PaginationItem,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
  Fab,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  BookOnline as BookOnlineIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import * as bookingService from '../../services/bookingService';
import * as userService from '../../services/userService';
import * as roomService from '../../services/roomService';

// Custom styled components
const CustomScrollbar = styled('div')(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 120px)', // Adjusted to fit exactly 4 cards
  scrollbarWidth: 'thin',
  scrollbarColor: `${alpha(theme.palette.text.primary, 0.2)} transparent`,
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

// Mobile/Tablet Booking Card Component
const MobileBookingCard = React.forwardRef(({ booking, roomDetails, seekerDetails, theme, setConfirmDialog, setCommentsModal }, ref) => {
  return (
    <Paper
      ref={ref}
      elevation={2}
      sx={{
        p: 2,
        mx: { xs: 2, sm: 2, md: 0 }, // Add horizontal margin only on mobile and tablet
        mb: { xs: 2, sm: 2, md: 0 }, // Add bottom margin only on mobile and tablet
        borderRadius: { xs: 2, sm: 2, md: 1 }, // Larger border radius on mobile and tablet
        overflow: 'hidden',
        border: '1px solid',
        borderColor: theme => alpha(theme.palette.divider, 0.15), // Slightly more visible border
        boxShadow: { 
          xs: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          sm: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
          md: 'none'
        },
        bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        '&:hover': {
          bgcolor: theme => alpha(theme.palette.primary.main, 0.04),
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out',
        },
        transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '4px',
          height: '100%',
          backgroundColor: theme => 
            booking.status === 'APPROVED' ? theme.palette.success.main :
            booking.status === 'REJECTED' ? theme.palette.error.main :
            theme.palette.warning.main,
          borderTopLeftRadius: 1,
          borderBottomLeftRadius: 1
        }
      }}
    >
      {/* Status Chip - Top Right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Chip
          label={booking.status}
          size="small"
          color={
            booking.status === 'APPROVED' ? 'success' :
            booking.status === 'REJECTED' ? 'error' :
            'warning'
          }
          sx={{ 
            textTransform: 'capitalize',
            height: '24px',
            '& .MuiChip-label': {
              px: 1.5,
              fontSize: '0.8rem',
              fontWeight: 500
            }
          }}
        />
      </Box>

      {/* Property Image and Basic Info */}
      <Stack spacing={2} alignItems="center" sx={{ position: 'relative', height: '100%' }}>
        {/* Property Image */}
        <Avatar
          variant="rounded"
          src={roomDetails[booking.roomId]?.images?.[0] ? 
            `${import.meta.env.VITE_API_URL}/uploads/${roomDetails[booking.roomId].images[0]}` : 
            undefined}
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'background.default',
            borderRadius: '8px'
          }}
        >
          <HomeIcon sx={{ fontSize: '2.5rem' }} />
        </Avatar>

        {/* Property Info */}
        <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
          <Typography 
            variant="h6"
            align="center"
            sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem',
              color: 'text.primary'
            }}
          >
            {roomDetails[booking.roomId]?.title || 'Loading...'}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <LocationIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              align="center"
              sx={{ fontSize: '0.9rem' }}
            >
              {roomDetails[booking.roomId]?.address}, {roomDetails[booking.roomId]?.city || 'Loading...'}
            </Typography>
          </Stack>
          <Typography 
            variant="body1" 
            color="primary"
            align="center"
            sx={{ 
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Rs. {roomDetails[booking.roomId]?.price?.toLocaleString() || 'Loading...'} /month
          </Typography>
        </Stack>

        <Divider sx={{ width: '100%', my: 1 }} />

        {/* Seeker Info */}
        <Stack spacing={1} alignItems="center">
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Avatar 
              sx={{ 
                width: 45,
                height: 45,
                bgcolor: theme.palette.primary.light
              }}
            >
              <PersonIcon sx={{ fontSize: '1.75rem' }} />
            </Avatar>
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center" 
              sx={{ flex: 1 }}
            >
              <Stack spacing={0.25}>
                <Typography 
                  variant="subtitle1"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '1rem'
                  }}
                >
                  {seekerDetails[booking.seekerId]?.fullName || 'Loading...'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  @{seekerDetails[booking.seekerId]?.username?.split('@')[0] || 'Loading...'}
                </Typography>
              </Stack>
              <Tooltip title="View comment" arrow placement="top">
                <IconButton
                  size="small"
                  color="primary"
                  sx={{
                    p: 0.5,
                    ml: 'auto',
                    '&:hover': {
                      bgcolor: 'transparent'
                    }
                  }}
                  onClick={() => {
                    setCommentsModal({
                      open: true,
                      comments: booking.comments || 'No comments provided'
                    });
                  }}
                >
                  <span 
                    className="material-symbols-outlined" 
                    style={{ 
                      fontSize: '1.2rem',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      transform: 'rotate(90deg)',
                      fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24"
                    }}
                  >
                    comic_bubble
                  </span>
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        {/* Booking Dates */}
        <Stack spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center"
            divider={
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  height: '0.8rem',
                  my: 'auto'
                }}
              />
            }
            sx={{ 
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Typography 
              variant="body2"
              sx={{ 
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontStyle: 'italic',
                whiteSpace: 'nowrap'
              }}
            >
              Requested: {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontStyle: 'italic',
                whiteSpace: 'nowrap'
              }}
            >
              From: {new Date(booking.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontStyle: 'italic',
                whiteSpace: 'nowrap'
              }}
            >
              To: {new Date(booking.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
          </Stack>
        </Stack>

        {/* Action Buttons */}
        {booking.status === 'PENDING' && (
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              width: '100%',
              mt: 'auto',
              pt: 2,
              justifyContent: 'space-between'
            }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              size="small"
              sx={{ 
                px: 2,
                py: 0.75,
                fontSize: '0.85rem'
              }}
              onClick={() => setConfirmDialog({
                open: true,
                title: 'Approve Booking',
                message: 'Are you sure you want to approve this booking request?',
                bookingId: booking.id,
                action: 'approve'
              })}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              size="small"
              sx={{ 
                px: 2,
                py: 0.75,
                fontSize: '0.85rem'
              }}
              onClick={() => setConfirmDialog({
                open: true,
                title: 'Reject Booking',
                message: 'Are you sure you want to reject this booking request?',
                bookingId: booking.id,
                action: 'reject'
              })}
            >
              Reject
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
});

MobileBookingCard.displayName = 'MobileBookingCard';

const LoadingIndicator = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    width: '100%', 
    py: 2 
  }}>
    <CircularProgress size={24} />
  </Box>
);

// ScrollToTop Component
const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  const scrollableContentRef = useRef(null);

  useEffect(() => {
    const scrollableContent = document.querySelector('.custom-scrollbar');
    if (!scrollableContent) return;

    scrollableContentRef.current = scrollableContent;
    
    const handleScroll = () => {
      const scrollTop = scrollableContent.scrollTop;
      setShow(scrollTop > 200);
    };

    scrollableContent.addEventListener('scroll', handleScroll);
    return () => {
      if (scrollableContent) {
        scrollableContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleClick = () => {
    if (scrollableContentRef.current) {
      scrollableContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Fab
      color="primary"
      size="small"
      aria-label="scroll back to top"
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: { xs: 24, sm: 32 },
        right: { xs: 24, sm: 32 },
        zIndex: 9999,
        display: show ? 'flex' : 'none',
        boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
      }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  );
};

// Add this component before the main BookingRequest component
const EmptyBookings = ({ filterStatus }) => {
  const theme = useTheme();
  
  const getMessage = () => {
    switch (filterStatus?.toUpperCase()) {
      case 'PENDING':
        return "You don't have any pending booking requests at the moment";
      case 'APPROVED':
        return "No approved bookings found";
      case 'REJECTED':
        return "No rejected bookings in the system";
      case 'ALL':
        return "You haven't received any booking requests yet";
      default:
        return "No booking requests found";
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: { xs: 2, sm: 2, md: 2 },
        bgcolor: theme => alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(10px)',
        mx: { xs: 2, sm: 2, md: 0 },
        mt: { xs: 2, sm: 2, md: 0 }
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Avatar
          sx={{
            width: 70,
            height: 70,
            bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            mb: 1
          }}
        >
          <BookOnlineIcon sx={{ fontSize: 35 }} />
        </Avatar>
        <Typography 
          variant="h6" 
          color="text.primary"
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.2rem' }
          }}
        >
          No Bookings Found
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            maxWidth: 400,
            mx: 'auto',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {getMessage()}
        </Typography>
      </Stack>
    </Paper>
  );
};

const BookingRequest = () => {
  const { theme: outletTheme, currentUser, setSnackbar } = useOutletContext();
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [bookings, setBookings] = useState([]);
  const [seekerDetails, setSeekerDetails] = useState({});
  const [roomDetails, setRoomDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 4,
    totalElements: 0,
    totalPages: 0,
    hasMore: true
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();
  const pollingInterval = useRef(null);
  const lastBookingsCount = useRef(0);
  const lastBookingsRef = useRef([]);

  // Add back the missing state declarations
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    bookingId: null,
    action: null
  });

  const [commentsModal, setCommentsModal] = useState({
    open: false,
    comments: ''
  });

  // Add initial fetch effect
  useEffect(() => {
    const initialFetch = async () => {
      try {
        const shouldAppend = isMobileOrTablet && pagination.currentPage > 0;
        await fetchBookings(shouldAppend);
      } catch (error) {
        console.error('Error in initial fetch:', error);
      }
    };
    initialFetch();
  }, [filterStatus]); // Re-fetch when filter changes

  // Enhanced polling mechanism
  useEffect(() => {
    const pollBookings = async () => {
      if (loading || isLoadingMore) return;

      try {
        const params = {
          page: 0,
          size: 50
        };

        let response;
        if (filterStatus === 'all') {
          response = await bookingService.getBookingsByLandlord(params);
        } else {
          response = await bookingService.getBookingsByLandlordAndStatus(filterStatus, params);
        }

        if (response && response.content) {
          const newBookings = response.content;
          const currentIds = new Set(lastBookingsRef.current.map(b => b.id));
          const hasNewBookings = newBookings.some(booking => !currentIds.has(booking.id));

          if (hasNewBookings) {
            setSnackbar({
              open: true,
              message: 'New booking request received!',
              severity: 'info',
              autoHideDuration: 6000
            });

            const shouldAppend = isMobileOrTablet && pagination.currentPage > 0;
            await fetchBookings(shouldAppend);
          }

          lastBookingsRef.current = newBookings;
          lastBookingsCount.current = newBookings.length;
        }
      } catch (error) {
        console.error('Error polling bookings:', error);
      }
    };

    pollingInterval.current = setInterval(pollBookings, 5000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [loading, isLoadingMore, filterStatus, setSnackbar]);

  // Add back the intersection observer callback
  const lastBookingElementRef = useCallback(node => {
    if (loading || !isMobileOrTablet) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore && !isLoadingMore) {
        setPagination(prev => ({
          ...prev,
          currentPage: prev.currentPage + 1
        }));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, pagination.hasMore, isLoadingMore, isMobileOrTablet]);

  // Fetch bookings
  const fetchBookings = useCallback(async (shouldAppend = false) => {
    try {
      if (!shouldAppend) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = {
        page: shouldAppend ? pagination.currentPage : pagination.currentPage,
        size: isMobileOrTablet ? 10 : pagination.pageSize
      };

      let response;
      if (filterStatus === 'all') {
        response = await bookingService.getBookingsByLandlord(params);
      } else {
        response = await bookingService.getBookingsByLandlordAndStatus(filterStatus, params);
      }

      if (response) {
        const newBookings = response.content;
        
        setBookings(prev => shouldAppend ? [...prev, ...newBookings] : newBookings);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          hasMore: !response.last
        }));

        // Fetch details for new bookings
        await Promise.all(newBookings.map(async (booking) => {
          if (!seekerDetails[booking.seekerId]) {
            await fetchSeekerDetails(booking.seekerId);
          }
          if (!roomDetails[booking.roomId]) {
            await fetchRoomDetails(booking.roomId);
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch bookings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [pagination.currentPage, pagination.pageSize, filterStatus, isMobileOrTablet, setSnackbar]);

  // Fetch room details
  const fetchRoomDetails = async (roomId) => {
    try {
      const response = await roomService.getRoomById(roomId);
      setRoomDetails(prev => ({
        ...prev,
        [roomId]: response
      }));
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  // Fetch seeker details
  const fetchSeekerDetails = async (seekerId) => {
    try {
      const response = await userService.getUserById(seekerId);
      if (response.success) {
        setSeekerDetails(prev => ({
          ...prev,
          [seekerId]: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching seeker details:', error);
    }
  };

  // Reset pagination when filter changes
  useEffect(() => {
    if (isMobileOrTablet) {
      setPagination(prev => ({
        ...prev,
        currentPage: 0,
        hasMore: true
      }));
      setBookings([]);
    }
  }, [filterStatus, isMobileOrTablet]);

  // Handle booking action (approve/reject)
  const handleBookingAction = async (bookingId, action) => {
    if (!bookingId) {
      setSnackbar({
        open: true,
        message: 'Invalid booking ID',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      if (action === 'approve') {
        // First approve the booking
        const approvedBooking = await bookingService.approveBooking(bookingId);
        
        // Update the room details in state to reflect the new availability
        if (approvedBooking && approvedBooking.roomId) {
          setRoomDetails(prev => ({
            ...prev,
            [approvedBooking.roomId]: {
              ...prev[approvedBooking.roomId],
              available: false
            }
          }));
        }

        setSnackbar({
          open: true,
          message: 'Booking approved successfully',
          severity: 'success'
        });
      } else if (action === 'reject') {
        await bookingService.rejectBooking(bookingId);
        setSnackbar({
          open: true,
          message: 'Booking rejected successfully',
          severity: 'success'
        });
      } else {
        throw new Error('Invalid action type');
      }

      // Refresh the bookings list after successful action
      await fetchBookings();
    } catch (error) {
      console.error('Error handling booking action:', error);
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${action} booking. Please try again.`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDialog({
        open: false,
        title: '',
        message: '',
        bookingId: null,
        action: null
      });
    }
  };
 
  // Handle filter change
  const handleFilterChange = (event, newStatus) => {
    // Don't allow deselecting all filters
    if (newStatus !== null) {
      setFilterStatus(newStatus);
      setPagination(prev => ({ ...prev, currentPage: 0 }));
    }
  };

  // Handle pagination change for desktop view
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage - 1 // Convert to 0-based index
    }));
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, pagination.currentPage]); // Add pagination.currentPage as dependency

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header - Only show on tablet and desktop */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Paper 
          elevation={0}
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
            borderRadius: 0
          }}
        >
          <Stack 
            direction={{ xs: 'row' }}
            spacing={{ xs: 1, sm: 2 }}
            alignItems="center"
            justifyContent="flex-end"
            sx={{
              minWidth: 0,
              '& > *': { minWidth: 0 }
            }}
          >
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 500,
                minWidth: 'max-content',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Filter by Status:
            </Typography>
            <ToggleButtonGroup
              value={filterStatus}
              exclusive
              onChange={handleFilterChange}
              aria-label="booking status filter"
              size="small"
              sx={{
                display: 'flex',
                gap: { xs: 0.5, sm: 1 },
                '& .MuiToggleButton-root': {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '20px !important',
                  px: { xs: 1, sm: 2 },
                  py: 0.5,
                  textTransform: 'capitalize',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 'fit-content', sm: 'auto' },
                  flex: { xs: '0 0 auto', sm: 'initial' },
                  whiteSpace: 'nowrap',
                  '&.Mui-selected': {
                    bgcolor: theme => theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme => theme.palette.primary.dark,
                    },
                  },
                  '&:hover': {
                    bgcolor: theme => alpha(theme.palette.primary.main, 0.04),
                  },
                },
              }}
            >
              <ToggleButton 
                value="PENDING" 
                aria-label="pending bookings"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: theme => `${theme.palette.warning.main} !important`,
                    '&:hover': {
                      bgcolor: theme => `${theme.palette.warning.dark} !important`,
                    },
                  },
                }}
              >
                Pending
              </ToggleButton>
              <ToggleButton 
                value="APPROVED" 
                aria-label="approved bookings"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: theme => `${theme.palette.success.main} !important`,
                    '&:hover': {
                      bgcolor: theme => `${theme.palette.success.dark} !important`,
                    },
                  },
                }}
              >
                Approved
              </ToggleButton>
              <ToggleButton 
                value="REJECTED" 
                aria-label="rejected bookings"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: theme => `${theme.palette.error.main} !important`,
                    '&:hover': {
                      bgcolor: theme => `${theme.palette.error.dark} !important`,
                    },
                  },
                }}
              >
                Rejected
              </ToggleButton>
              <ToggleButton 
                value="all" 
                aria-label="all bookings"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: theme => `${theme.palette.grey[700]} !important`,
                    '&:hover': {
                      bgcolor: theme => `${theme.palette.grey[800]} !important`,
                    },
                  },
                }}
              >
                All
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>
      </Box>

      {/* Bookings List with Mobile Filter */}
      <CustomScrollbar className="custom-scrollbar">
        <Stack 
          spacing={0}
          sx={{ 
            p: 0,
            height: '100%',
            ...(bookings.length === 0 && {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch'
            })
          }}
        >
          {/* Mobile Filter */}
          <Box 
            sx={{ 
              display: { xs: 'block', sm: 'block', md: 'none' },
              backgroundColor: theme => theme.palette.background.default,
              pb: 2
            }}
          >
            <Paper 
              elevation={0}
              sx={{
                p: 2,
                mx: 2,
                mt: 2,
                borderRadius: 2,
                bgcolor: theme => alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: theme => alpha(theme.palette.divider, 0.15),
                boxShadow: theme => `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
              }}
            >
              <Stack 
                direction="column"
                spacing={1.5}
                sx={{ width: '100%' }}
              >
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  Filter by Status:
                </Typography>
                <ToggleButtonGroup
                  value={filterStatus}
                  exclusive
                  onChange={handleFilterChange}
                  aria-label="booking status filter"
                  orientation="vertical"
                  size="small"
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      border: '1px solid !important',
                      borderColor: `${theme.palette.divider} !important`,
                      borderRadius: '12px !important',
                      '&:not(:first-of-type)': {
                        borderRadius: '12px !important',
                      },
                      '&:not(:last-of-type)': {
                        borderRadius: '12px !important',
                      },
                    },
                    '& .MuiToggleButton-root': {
                      flex: 1,
                      p: 1.5,
                      justifyContent: 'center',
                      textTransform: 'capitalize',
                      fontSize: '0.875rem',
                      '&.Mui-selected': {
                        bgcolor: theme => theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          bgcolor: theme => theme.palette.primary.dark,
                        },
                      },
                      '&:hover': {
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.04),
                      },
                    },
                  }}
                >
                  <ToggleButton 
                    value="all" 
                    aria-label="all bookings"
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: theme => `${theme.palette.grey[700]} !important`,
                        '&:hover': {
                          bgcolor: theme => `${theme.palette.grey[800]} !important`,
                        },
                      },
                    }}
                  >
                    All Bookings
                  </ToggleButton>
                  <ToggleButton 
                    value="PENDING" 
                    aria-label="pending bookings"
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: theme => `${theme.palette.warning.main} !important`,
                        '&:hover': {
                          bgcolor: theme => `${theme.palette.warning.dark} !important`,
                        },
                      },
                    }}
                  >
                    Pending
                  </ToggleButton>
                  <ToggleButton 
                    value="APPROVED" 
                    aria-label="approved bookings"
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: theme => `${theme.palette.success.main} !important`,
                        '&:hover': {
                          bgcolor: theme => `${theme.palette.success.dark} !important`,
                        },
                      },
                    }}
                  >
                    Approved
                  </ToggleButton>
                  <ToggleButton 
                    value="REJECTED" 
                    aria-label="rejected bookings"
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: theme => `${theme.palette.error.main} !important`,
                        '&:hover': {
                          bgcolor: theme => `${theme.palette.error.dark} !important`,
                        },
                      },
                    }}
                  >
                    Rejected
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Paper>
          </Box>

          {loading && !isLoadingMore ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flex: 1,
              minHeight: 400 // Add minimum height for better loading state appearance
            }}>
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <EmptyBookings filterStatus={filterStatus} />
          ) : (
            <>
              {/* Desktop View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {bookings.map((booking) => (
                  <Paper
                    key={booking.id}
                    sx={{
                      py: 1.75,
                      px: 2,
                      my: 0.7,
                      borderRadius: 0,
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      {/* Left Section: Property Image and Info */}
                      <Box sx={{ display: 'flex', gap: 2, flex: 2 }}>
                        <Avatar
                          variant="rounded"
                          src={roomDetails[booking.roomId]?.images?.[0] ? 
                            `${import.meta.env.VITE_API_URL}/uploads/${roomDetails[booking.roomId].images[0]}` : 
                            undefined}
                          sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'background.default',
                            borderRadius: '8px'
                          }}
                        >
                          <HomeIcon sx={{ fontSize: '2.5rem' }} />
                        </Avatar>
                        <Stack spacing={1}>
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              color: 'text.primary'
                            }}
                          >
                            {roomDetails[booking.roomId]?.title || 'Loading...'}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocationIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontSize: '0.9rem' }}
                            >
                              {roomDetails[booking.roomId]?.address}, {roomDetails[booking.roomId]?.city || 'Loading...'}
                            </Typography>
                          </Stack>
                          <Typography 
                            variant="body1" 
                            color="primary"
                            sx={{ 
                              fontSize: '1rem',
                              fontWeight: 500
                            }}
                          >
                            Rs. {roomDetails[booking.roomId]?.price?.toLocaleString() || 'Loading...'} /month
                          </Typography>
                        </Stack>
                      </Box>
                      
                      {/* Middle Section: Seeker Info */}
                      <Stack spacing={1} sx={{ flex: 1.5, justifyContent: 'center' }}>
                        <Stack spacing={1} alignItems="center">
                          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                            <Avatar 
                              sx={{ 
                                width: 40,
                                height: 40,
                                bgcolor: theme.palette.primary.light
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Stack 
                              direction="row" 
                              spacing={1} 
                              alignItems="center" 
                              sx={{ flex: 1 }}
                            >
                              <Stack spacing={0.25}>
                                <Typography 
                                  variant="subtitle1"
                                  sx={{ 
                                    fontWeight: 500,
                                    fontSize: '1rem'
                                  }}
                                >
                                  {seekerDetails[booking.seekerId]?.fullName || 'Loading...'}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  @{seekerDetails[booking.seekerId]?.username?.split('@')[0] || 'Loading...'}
                                </Typography>
                              </Stack>
                              <Tooltip title="View comment" arrow placement="top">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  sx={{
                                    p: 0.5,
                                    '&:hover': {
                                      bgcolor: 'transparent'
                                    }
                                  }}
                                  onClick={() => {
                                    setCommentsModal({
                                      open: true,
                                      comments: booking.comments || 'No comments provided'
                                    });
                                  }}
                                >
                                  <span 
                                    className="material-symbols-outlined" 
                                    style={{ 
                                      fontSize: '1.2rem',
                                      lineHeight: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      transform: 'rotate(90deg)',
                                      fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24"
                                    }}
                                  >
                                    comic_bubble
                                  </span>
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Stack>
                        <Stack spacing={0.5} alignItems="center">
                          <Stack 
                            direction="row" 
                            spacing={1} 
                            alignItems="center"
                            divider={
                              <Divider 
                                orientation="vertical" 
                                flexItem 
                                sx={{ 
                                  height: '0.8rem',
                                  my: 'auto'
                                }}
                              />
                            }
                          >
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Requested: {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              From: {new Date(booking.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              To: {new Date(booking.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      {/* Right Section: Status and Actions */}
                      <Stack spacing={2} alignItems="flex-end" sx={{ flex: 1, justifyContent: 'space-between' }}>
                        <Chip
                          label={booking.status}
                          size="small"
                          color={
                            booking.status === 'APPROVED' ? 'success' :
                            booking.status === 'REJECTED' ? 'error' :
                            'warning'
                          }
                          sx={{ 
                            textTransform: 'capitalize',
                            height: '24px',
                            '& .MuiChip-label': {
                              px: 1.5,
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }
                          }}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 'auto !important' }}>
                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                                sx={{ 
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  minHeight: 0
                                }}
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  title: 'Approve Booking',
                                  message: 'Are you sure you want to approve this booking request?',
                                  bookingId: booking.id,
                                  action: 'approve'
                                })}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon sx={{ fontSize: '1rem' }} />}
                                sx={{ 
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  minHeight: 0
                                }}
                                onClick={() => setConfirmDialog({
                                  open: true,
                                  title: 'Reject Booking',
                                  message: 'Are you sure you want to reject this booking request?',
                                  bookingId: booking.id,
                                  action: 'reject'
                                })}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Box>

              {/* Mobile/Tablet View */}
              <Box 
                sx={{ 
                  display: { xs: 'block', md: 'none' },
                  mt: { xs: 2, sm: 2, md: 0 },
                  '& > *:not(:last-child)': {
                    mb: 2
                  }
                }}
              >
                {bookings.map((booking, index) => (
                  <MobileBookingCard
                    key={booking.id}
                    ref={index === bookings.length - 1 ? lastBookingElementRef : null}
                    booking={booking}
                    roomDetails={roomDetails}
                    seekerDetails={seekerDetails}
                    theme={theme}
                    setConfirmDialog={setConfirmDialog}
                    setCommentsModal={setCommentsModal}
                  />
                ))}
                {isLoadingMore && <LoadingIndicator />}
              </Box>
            </>
          )}
        </Stack>
      </CustomScrollbar>

      {/* Pagination - Only show on desktop */}
      {!isMobileOrTablet && !loading && bookings.length > 0 && (
        <Paper
          sx={{
            position: 'sticky',
            bottom: 0,
            borderTop: 1,
            borderColor: 'divider',
            zIndex: 1,
            flexShrink: 0,
            borderRadius: 0
          }}
        >
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
            sx={{ py: 1.5}} 
          >
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage + 1}
              onChange={handlePageChange}
              shape="rounded"
              showFirstButton
              showLastButton
              size="medium" 
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  sx={{
                    mx: 0.5,
                    border: 'none',
                    bgcolor: 'transparent',
                    color: 'text.primary',
                    fontSize: '0.75rem', // 12px
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'transparent',
                    },
                  }}
                />
              )}
            />
          </Stack>
        </Paper>
      )}

      {/* Add ScrollToTop button for mobile/tablet */}
      {isMobileOrTablet && <ScrollToTop />}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleBookingAction(confirmDialog.bookingId, confirmDialog.action)}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Modal */}
      <Dialog
        open={commentsModal.open}
        onClose={() => setCommentsModal({ ...commentsModal, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <span 
              className="material-symbols-outlined" 
              style={{ 
                fontSize: '1.5rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                transform: 'rotate(0deg)',
                fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24"
              }}
            >
              comic_bubble
            </span>
            <Typography variant="h6">Booking Comments</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              py: 2,
              px: 1,
              bgcolor: theme => alpha(theme.palette.background.default, 0.6),
              borderRadius: 1,
              fontStyle: 'italic'
            }}
          >
            {commentsModal.comments}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCommentsModal({ ...commentsModal, open: false })}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingRequest; 