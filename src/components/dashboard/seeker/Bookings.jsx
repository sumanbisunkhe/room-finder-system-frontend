import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import * as bookingService from '../../../services/bookingService';

const BookingStatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status)}
      icon={
        status.toLowerCase() === 'confirmed' ? <CheckCircleIcon /> :
        status.toLowerCase() === 'cancelled' ? <BlockIcon /> :
        null
      }
    />
  );
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async () => {
    try {
      await bookingService.updateBooking(selectedBooking.id, {
        // Add necessary update fields here
        status: 'updated'
      });
      setEditDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancelBooking(selectedBooking.id);
      setCancelDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const renderBookingCard = (booking) => (
    <Paper
      key={booking.id}
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            {booking.property.name}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {booking.property.address}
          </Typography>
          <BookingStatusChip status={booking.status} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Typography variant="body1">
              Check-in: {new Date(booking.checkInDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">
              Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            {booking.status === 'PENDING' && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setCancelDialogOpen(true);
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Bookings
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            You don't have any bookings yet.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {bookings.map(renderBookingCard)}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          {/* Add edit form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateBooking} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep</Button>
          <Button onClick={handleCancelBooking} variant="contained" color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings; 