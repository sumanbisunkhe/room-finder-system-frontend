import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Pagination,
  alpha,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Cancel as CancelIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
  Comment as CommentIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { 
  getBookingsBySeeker, 
  getBookingsBySeekerAndStatus, 
  cancelBooking, 
  deleteBooking,
  updateBooking
} from '../../../services/bookingService';
import { getRoomById } from '../../../services/roomService';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';

const StyledPaginationPaper = styled(Paper)(({ theme, drawerOpen }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  marginLeft: drawerOpen ? 240 : 65,
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  borderRadius: 0,
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  zIndex: theme.zIndex.drawer - 1,
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`
    : `linear-gradient(${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
  backdropFilter: 'blur(8px)',
  boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: theme.spacing(1.5)
  }
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  [theme.breakpoints.down('md')]: {
    height: `calc(100vh - ${theme.spacing(8)})` // Adjust height for mobile/tablet
  },
  [theme.breakpoints.up('md')]: {
    overflow: 'hidden'
  }
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05),
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2),
      borderRadius: '4px',
      '&:hover': {
        background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.3) : alpha(theme.palette.common.black, 0.3),
      }
    }
  },
  [theme.breakpoints.up('md')]: {
    flex: 1,
    paddingBottom: theme.spacing(8),
    overflowY: 'auto',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.05),
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2),
      borderRadius: '4px',
      '&:hover': {
        background: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.3) : alpha(theme.palette.common.black, 0.3),
      }
    }
  }
}));

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const ActionButton = ({ icon: Icon, title, onClick, color = "primary", loading = false, disabled = false }) => (
  <Tooltip title={title}>
    <span>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled || loading}
        sx={{
          color: theme => loading ? 'text.disabled' : theme.palette[color].main,
          bgcolor: theme => alpha(theme.palette[color].main, 0.04),
          border: theme => `1px solid ${alpha(theme.palette[color].main, 0.24)}`,
          '&:hover': {
            bgcolor: theme => alpha(theme.palette[color].main, 0.12),
            border: theme => `1px solid ${theme.palette[color].main}`,
          },
          '&:disabled': {
            bgcolor: theme => alpha(theme.palette.action.disabled, 0.12),
            border: theme => `1px solid ${alpha(theme.palette.action.disabled, 0.24)}`,
          },
          transition: theme => theme.transitions.create(['background-color', 'border-color', 'transform']),
          '&:active': {
            transform: 'scale(0.96)'
          }
        }}
      >
        {loading ? <CircularProgress size={20} color={color} /> : <Icon fontSize="small" />}
      </IconButton>
    </span>
  </Tooltip>
);

const BookingCard = ({ booking, onActions }) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLoading = booking.id === onActions.cancellingBookingId || booking.id === onActions.deletingBookingId;

  return (
    <Card 
      elevation={1} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: isXsScreen ? 'column' : 'row',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          width: isXsScreen ? '100%' : 200,
          minWidth: isXsScreen ? '100%' : 200
        }}
      >
        <Avatar
          src={booking.room?.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${booking.room.images[0]}` : undefined}
          variant="square"
          sx={{ 
            width: '100%',
            height: isXsScreen ? 200 : '100%',
            bgcolor: 'grey.200',
            borderRadius: 0,
            '& img': {
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }
          }}
        />
        <Chip 
          label={booking.status} 
          color={getStatusColor(booking.status)}
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16,
            fontWeight: 500
          }}
        />
      </Box>

      <CardContent sx={{ 
        flex: 1, 
        p: theme.spacing(2),
        '&:last-child': { pb: theme.spacing(2) }
      }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack spacing={1}>
            <Typography 
              variant={isXsScreen ? 'h6' : 'subtitle1'} 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.main',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {booking.room?.title}
            </Typography>
            
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ fontWeight: 500 }}>{booking.room?.type}</span>
                {booking.room?.price && (
                  <>
                    <span>•</span>
                    <span>${booking.room.price}/month</span>
                  </>
                )}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <LocationIcon fontSize="small" />
                {booking.room?.city && `${booking.room.city}, `}{booking.room?.address}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1} sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarIcon color="action" fontSize="small" />
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {format(new Date(booking.startDate), 'MMM dd, yyyy')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
              </Typography>
            </Stack>
            
            {booking.comments && (
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <CommentIcon color="action" fontSize="small" sx={{ mt: 0.5 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {booking.comments}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Stack 
            direction="row" 
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ mt: 'auto' }}
          >
            <ActionButton
              icon={EditIcon}
              title="Edit Booking"
              onClick={() => onActions.handleUpdateBooking(booking)}
              disabled={booking.status !== 'PENDING'}
            />
            <ActionButton
              icon={CancelIcon}
              title="Cancel Booking"
              color="error"
              onClick={() => onActions.handleCancelBooking(booking)}
              loading={booking.id === onActions.cancellingBookingId}
              disabled={booking.status !== 'PENDING'}
            />
            <ActionButton
              icon={DeleteIcon}
              title="Delete Booking"
              color="error"
              onClick={() => onActions.handleDeleteBooking(booking)}
              loading={booking.id === onActions.deletingBookingId}
              disabled={!['REJECTED', 'CANCELLED'].includes(booking.status)}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const LoadingIndicator = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

const BookingStatusFilter = ({ value, onChange }) => {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 1.5, sm: 2 },
        border: 1, 
        borderColor: 'divider',
        borderRadius: 0,
        position: { xs: 'static', md: 'sticky' },
        top: { xs: 'auto', md: 0 },
        zIndex: { xs: 'auto', md: theme.zIndex.appBar - 1 },
        backgroundColor: theme.palette.background.paper,
        pb: 2.8,
        mx: { xs: 1.5, sm: 2, md: 0 }
      }}
    >
      <Stack spacing={1}>
        <Typography 
          variant="subtitle2" 
          color="text.secondary"
          sx={{ px: { xs: 0.5, sm: 0 } }}
        >
          Filter by Status
        </Typography>
        <Stack spacing={1} sx={{ pb: 0.7 }}>
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={onChange}
            aria-label="booking status filter"
            size="small"
            sx={{
              display: { xs: 'none', md: 'flex' },
              '& .MuiToggleButton-root': {
                flex: 1,
                borderRadius: '4px !important',
                border: `1px solid ${theme.palette.divider} !important`,
                '&.Mui-selected': {
                  borderColor: `${theme.palette.primary.main} !important`
                }
              }
            }}
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="PENDING">Pending</ToggleButton>
            <ToggleButton value="APPROVED">Approved</ToggleButton>
            <ToggleButton value="REJECTED">Rejected</ToggleButton>
            <ToggleButton value="CANCELLED">Cancelled</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1 }}>
            <ToggleButton
              value="ALL"
              selected={value === "ALL"}
              onChange={() => onChange(null, "ALL")}
              sx={{
                width: '100%',
                borderRadius: '4px !important',
                border: `1px solid ${theme.palette.divider} !important`,
                '&.Mui-selected': {
                  borderColor: `${theme.palette.primary.main} !important`
                }
              }}
            >
              All
            </ToggleButton>

            <Stack direction="row" spacing={1}>
              <ToggleButton
                value="PENDING"
                selected={value === "PENDING"}
                onChange={() => onChange(null, "PENDING")}
                sx={{
                  flex: 1,
                  borderRadius: '4px !important',
                  border: `1px solid ${theme.palette.divider} !important`,
                  '&.Mui-selected': {
                    borderColor: `${theme.palette.primary.main} !important`
                  }
                }}
              >
                Pending
              </ToggleButton>
              <ToggleButton
                value="APPROVED"
                selected={value === "APPROVED"}
                onChange={() => onChange(null, "APPROVED")}
                sx={{
                  flex: 1,
                  borderRadius: '4px !important',
                  border: `1px solid ${theme.palette.divider} !important`,
                  '&.Mui-selected': {
                    borderColor: `${theme.palette.primary.main} !important`
                  }
                }}
              >
                Approved
              </ToggleButton>
            </Stack>

            <Stack direction="row" spacing={1}>
              <ToggleButton
                value="REJECTED"
                selected={value === "REJECTED"}
                onChange={() => onChange(null, "REJECTED")}
                sx={{
                  flex: 1,
                  borderRadius: '4px !important',
                  border: `1px solid ${theme.palette.divider} !important`,
                  '&.Mui-selected': {
                    borderColor: `${theme.palette.primary.main} !important`
                  }
                }}
              >
                Rejected
              </ToggleButton>
              <ToggleButton
                value="CANCELLED"
                selected={value === "CANCELLED"}
                onChange={() => onChange(null, "CANCELLED")}
                sx={{
                  flex: 1,
                  borderRadius: '4px !important',
                  border: `1px solid ${theme.palette.divider} !important`,
                  '&.Mui-selected': {
                    borderColor: `${theme.palette.primary.main} !important`
                  }
                }}
              >
                Cancelled
              </ToggleButton>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

const getEmptyStateMessage = (status) => {
  switch (status) {
    case 'PENDING':
      return "You don't have any pending booking requests.";
    case 'APPROVED':
      return "You don't have any approved bookings.";
    case 'REJECTED':
      return "You don't have any rejected bookings.";
    case 'CANCELLED':
      return "You don't have any cancelled bookings.";
    default:
      return "You haven't made any bookings yet.";
  }
};

const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  const scrollableContentRef = useRef(null);

  useEffect(() => {
    const scrollableContent = document.querySelector('.scrollable-content');
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
        display: show ? 'flex' : 'none'
      }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  );
};

const EditBookingDialog = ({ open, onClose, booking, onUpdate }) => {
  const [startDate, setStartDate] = useState(booking ? new Date(booking.startDate) : null);
  const [endDate, setEndDate] = useState(booking ? new Date(booking.endDate) : null);
  const [comments, setComments] = useState(booking?.comments || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (booking) {
      setStartDate(new Date(booking.startDate));
      setEndDate(new Date(booking.endDate));
      setComments(booking.comments || '');
    }
  }, [booking]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (!booking?.roomId) {
      setError('Invalid booking data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedBooking = {
        roomId: booking.roomId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        comments: comments.trim()
      };

      await onUpdate(booking.id, updatedBooking);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Booking</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disablePast
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
              disablePast
              minDate={startDate || new Date()}
            />
          </LocalizationProvider>

          <TextField
            label="Comments"
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, loading, confirmButtonText, confirmButtonColor = "error" }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        No, Keep
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained" 
        color={confirmButtonColor}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : confirmButtonText}
      </Button>
    </DialogActions>
  </Dialog>
);

const BookingsSection = () => {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { drawerOpen } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: isMobileOrTablet ? 10 : 4,
    totalElements: 0,
    totalPages: 0,
    hasMore: true
  });
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const loadingRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollableContentRef = useRef(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToAction, setBookingToAction] = useState(null);

  const fetchBookings = async (page = 0, shouldAppend = false) => {
    try {
      if (!shouldAppend) {
        setLoading(true);
      }
      setError(null);

      const response = await (statusFilter === 'ALL' 
        ? getBookingsBySeeker({ page, size: pagination.pageSize })
        : getBookingsBySeekerAndStatus(statusFilter, { page, size: pagination.pageSize })
      );
      
      const { 
        content,
        totalElements,
        totalPages,
        size,
        number,
        last
      } = response;

      // Fetch room details for each booking
      const bookingsWithRooms = await Promise.all(
        content.map(async (booking) => {
          try {
            const roomResponse = await getRoomById(booking.roomId);
            if (!roomResponse) {
              throw new Error('Room not found');
            }
            return {
              ...booking,
              room: roomResponse
            };
          } catch (err) {
            console.error(`Error fetching room ${booking.roomId}:`, err);
            return {
              ...booking,
              room: {
                title: 'Room Not Found',
                address: 'Room details unavailable',
                images: [],
                type: 'Unknown',
                price: 'N/A'
              }
            };
          }
        })
      );

      setPagination(prev => ({
        ...prev,
        totalElements,
        totalPages,
        pageSize: size,
        currentPage: number,
        hasMore: !last
      }));

      setBookings(prev => shouldAppend ? [...prev, ...bookingsWithRooms] : bookingsWithRooms);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'An error occurred while fetching bookings');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer setup
  const observer = useRef();
  const lastBookingElementRef = useCallback((node) => {
    if (loading || !isMobileOrTablet) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore && !isLoadingMore) {
        setIsLoadingMore(true);
        fetchBookings(pagination.currentPage + 1, true);
      }
    }, { threshold: 0.5 });

    if (node) observer.current.observe(node);
  }, [loading, pagination.hasMore, pagination.currentPage, isMobileOrTablet, isLoadingMore]);

  useEffect(() => {
    fetchBookings(0, false);
  }, [isMobileOrTablet, statusFilter]); // Refetch when view changes or filter changes

  useEffect(() => {
    if (!isMobileOrTablet) return;

    const scrollableContent = scrollableContentRef.current;
    if (!scrollableContent) return;

    const handleScroll = () => {
      const scrollTop = scrollableContent.scrollTop;
      setShowScrollTop(scrollTop > 200);
    };

    scrollableContent.addEventListener('scroll', handleScroll);
    return () => {
      if (scrollableContent) {
        scrollableContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileOrTablet]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage - 1
    }));
    fetchBookings(newPage - 1);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingBookingId(bookingId);
      await cancelBooking(bookingId);
      await fetchBookings();
      setCancelDialogOpen(false);
      setBookingToAction(null);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      setDeletingBookingId(bookingId);
      await deleteBooking(bookingId);
      await fetchBookings();
      setDeleteDialogOpen(false);
      setBookingToAction(null);
    } catch (err) {
      setError(err.message || 'Failed to delete booking');
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleUpdateBooking = async (bookingId, updatedData) => {
    try {
      await updateBooking(bookingId, updatedData);
      await fetchBookings();
      setEditDialogOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      throw new Error(err.message || 'Failed to update booking');
    }
  };

  const handleEditClick = (booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  const handleStatusFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setStatusFilter(newValue);
      setPagination(prev => ({
        ...prev,
        currentPage: 0
      }));
    }
  };

  const handleCancelClick = (booking) => {
    setBookingToAction(booking);
    setCancelDialogOpen(true);
  };

  const handleDeleteClick = (booking) => {
    setBookingToAction(booking);
    setDeleteDialogOpen(true);
  };

  if (loading && !bookings.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <BookingStatusFilter 
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
        <Alert severity="info">
          {getEmptyStateMessage(statusFilter)}
        </Alert>
      </Box>
    );
  }

  return (
    <ScrollableContainer>
      <ScrollableContent className="scrollable-content">
        <Box sx={{ p: 0 }}>
          <Container 
            maxWidth="xl" 
            disableGutters
            sx={{
              px: { xs: '0 !important', md: 2 }
            }}
          >
            <BookingStatusFilter 
              value={statusFilter}
              onChange={handleStatusFilterChange}
            />
            {isMobileOrTablet ? (
              <Grid 
                container 
                spacing={{ xs: 2, sm: 2, md: 3 }} 
                columns={{ xs: 1, sm: 8, md: 12 }}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: theme => ({
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                  }),
                  pt: 2,
                  px: { xs: 1.5, sm: 2 },
                  mx: 0,
                  width: '100%'
                }}
              >
                {bookings.map((booking, index) => (
                  <Grid 
                    item 
                    xs={1} 
                    sm={4} 
                    md={6} 
                    key={booking.id}
                    ref={index === bookings.length - 1 ? lastBookingElementRef : null}
                  >
                    <BookingCard 
                      booking={booking} 
                      onActions={{ 
                        handleCancelBooking: handleCancelClick,
                        handleDeleteBooking: handleDeleteClick,
                        handleUpdateBooking: handleEditClick,
                        cancellingBookingId,
                        deletingBookingId
                      }} 
                    />
                  </Grid>
                ))}
                {isLoadingMore && <LoadingIndicator />}
              </Grid>
            ) : (
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: theme => ({
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                  }),
                  overflowX: 'auto'
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Comments</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} sx={{ '& > td': { py: 2 } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={booking.room?.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${booking.room.images[0]}` : undefined}
                              alt={booking.room?.title}
                              variant="square"
                              sx={{ 
                                width: 76, 
                                height: 76,
                                bgcolor: 'grey.200',
                                borderRadius: 0,
                                boxShadow: 1,
                                '& img': {
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%'
                                }
                              }}
                            />
                            <Stack spacing={0.75}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                {booking.room?.title}
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontWeight: 500 }}>{booking.room?.type}</span>
                                {booking.room?.price && (
                                  <>
                                    <span>•</span>
                                    <span>${booking.room.price}/month</span>
                                  </>
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {booking.room?.city && (
                                  <>
                                    {booking.room.city}
                                    <span>•</span>
                                  </>
                                )}
                                {booking.room?.address}
      </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={booking.status} 
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {booking.comments || 'No comments'}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                            <ActionButton
                              icon={EditIcon}
                              title="Edit Booking"
                              onClick={() => handleEditClick(booking)}
                              disabled={booking.status !== 'PENDING'}
                            />
                            <ActionButton
                              icon={CancelIcon}
                              title="Cancel Booking"
                              color="error"
                              onClick={() => handleCancelClick(booking)}
                              loading={cancellingBookingId === booking.id}
                              disabled={booking.status !== 'PENDING'}
                            />
                            <ActionButton
                              icon={DeleteIcon}
                              title="Delete Booking"
                              color="error"
                              onClick={() => handleDeleteClick(booking)}
                              loading={deletingBookingId === booking.id}
                              disabled={!['REJECTED', 'CANCELLED'].includes(booking.status)}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Container>
    </Box>
      </ScrollableContent>

      {!isMobileOrTablet && (
        <StyledPaginationPaper drawerOpen={drawerOpen}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage + 1}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            size="medium"
          />
        </StyledPaginationPaper>
      )}

      {isMobileOrTablet && <ScrollToTop />}

      <EditBookingDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onUpdate={handleUpdateBooking}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setBookingToAction(null);
        }}
        onConfirm={() => handleCancelBooking(bookingToAction?.id)}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        loading={cancellingBookingId === bookingToAction?.id}
        confirmButtonText="Yes, Cancel Booking"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setBookingToAction(null);
        }}
        onConfirm={() => handleDeleteBooking(bookingToAction?.id)}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        loading={deletingBookingId === bookingToAction?.id}
        confirmButtonText="Yes, Delete Booking"
      />
    </ScrollableContainer>
  );
};

export default BookingsSection; 