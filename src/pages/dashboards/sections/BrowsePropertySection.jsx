import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  alpha,
  Pagination,
  PaginationItem,
  Container,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  SquareFoot as SquareFootIcon,
  Wifi as WifiIcon,
  LocalParking as LocalParkingIcon,
  AcUnit as AcUnitIcon,
  Whatshot as HeatingIcon,
  Tv as TvIcon,
  Kitchen as KitchenIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import * as roomService from '../../../services/roomService';
import * as bookingService from '../../../services/bookingService';
import { styled, useTheme } from '@mui/material/styles';
import PropertyDetails from '../../../components/property/PropertyDetails';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
  },
  '& .MuiCardMedia-root': {
    height: 200,
    transition: 'transform 0.3s ease-in-out',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

const CustomScrollbar = styled('div')(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
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

const BrowsePropertySection = () => {
  const { currentUser, setSnackbar, theme } = useOutletContext();
  const MUItheme = useTheme();
  const [allRooms, setAllRooms] = useState([]);
  const [displayableRooms, setDisplayableRooms] = useState([]); // Rooms after search/filter, before pagination
  const [paginatedRoomsForDisplay, setPaginatedRoomsForDisplay] = useState([]); // Rooms after pagination slice, for rendering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    maxPrice: '',
    minSize: '',
    availability: 'all',
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0
  });
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isPropertyDetailsModalOpen, setIsPropertyDetailsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Ref to track if search/filters have changed to reset page, and to prevent initial reset
  const isInitialFilterOrSearch = useRef(true);
  const prevSearchTerm = useRef('');
  const prevFilters = useRef({});

  // Fetch all rooms for search/filter (only once on component mount or currentUser change)
  const fetchAllRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roomService.fetchAllRooms(0, 1000); // Fetch all rooms to enable client-side filtering
      if (!response || !response.content) {
        throw new Error('Invalid response format from server');
      }
      setAllRooms(response.content);
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      setAllRooms([]);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch all rooms for filtering',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [setSnackbar]);

  // Initial load: fetch all rooms
  useEffect(() => {
    if (currentUser?.id) {
      fetchAllRooms();
    }
  }, [currentUser, fetchAllRooms]);

  // Effect to filter rooms based on search and filters
  useEffect(() => {
    if (!Array.isArray(allRooms)) {
      setDisplayableRooms([]);
      setPagination(prev => ({ ...prev, totalElements: 0, totalPages: 0, currentPage: 0 }));
      return;
    }

    const filtered = allRooms.filter((room) => {
      const matchesSearch = room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = filters.maxPrice ? room.price <= parseFloat(filters.maxPrice) : true;
      const matchesSize = filters.minSize ? room.size >= parseFloat(filters.minSize) : true;
      const matchesAvailability = filters.availability === 'all' ? true :
        filters.availability === 'available' ? room.available : !room.available;

      return matchesSearch && matchesPrice && matchesSize && matchesAvailability;
    });

    // Check if search term or filters have actually changed (deep comparison for filters object)
    const hasSearchTermChanged = searchTerm !== prevSearchTerm.current;
    const hasFiltersChanged = JSON.stringify(filters) !== JSON.stringify(prevFilters.current);

    // Update pagination total elements and pages, and reset currentPage if filters/search changed
    setPagination(prev => {
      const newTotalElements = filtered.length;
      const newTotalPages = Math.ceil(newTotalElements / prev.pageSize);
      let newCurrentPage = prev.currentPage;

      if ((hasSearchTermChanged || hasFiltersChanged) && !isInitialFilterOrSearch.current) {
        newCurrentPage = 0; // Reset to first page
      }
      // On initial load, don't reset currentPage based on empty search/filters
      if (isInitialFilterOrSearch.current) {
        isInitialFilterOrSearch.current = false; // Mark initial load as complete after first run
      }

      return {
        ...prev,
        totalElements: newTotalElements,
        totalPages: newTotalPages,
        currentPage: newCurrentPage
      };
    });

    // Update displayableRooms (the full filtered list before pagination)
    setDisplayableRooms(filtered);

    // Update refs for next comparison
    prevSearchTerm.current = searchTerm;
    prevFilters.current = filters;

  }, [allRooms, searchTerm, filters]); // Dependencies for filtering

  // Effect to apply pagination slice to displayableRooms for rendering
  useEffect(() => {
    // Only slice if displayableRooms is an array
    if (!Array.isArray(displayableRooms)) {
      setPaginatedRoomsForDisplay([]);
      return;
    }

    const startIndex = pagination.currentPage * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    setPaginatedRoomsForDisplay(displayableRooms.slice(startIndex, endIndex));

  }, [displayableRooms, pagination.currentPage, pagination.pageSize]);

  const handleOpenBookingDialog = (room) => {
    setSelectedRoom(room);
    setIsPropertyDetailsModalOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false);
    setStartDate('');
    setEndDate('');
  };

  const handleOpenBookingDialogFromDetails = (room) => {
    setSelectedRoom(room);
    setIsPropertyDetailsModalOpen(false);
    setBookingDialogOpen(true);
  };

  const handleClosePropertyDetailsModal = () => {
    setIsPropertyDetailsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleBooking = async () => {
    if (!selectedRoom || !startDate || !endDate || !currentUser?.id) {
      setSnackbar({ open: true, message: "Please fill all booking details.", severity: 'warning' });
      return;
    }

    setBookingLoading(true);
    try {
      const bookingRequest = {
        roomId: selectedRoom.id,
        seekerId: currentUser.id,
        startDate: startDate,
        endDate: endDate,
        totalPrice: selectedRoom.price, // This might need adjustment based on dates
      };
      await bookingService.createBooking(bookingRequest);
      setSnackbar({ open: true, message: "Booking request sent successfully!", severity: 'success' });
      handleCloseBookingDialog();
      // Potentially refresh rooms or update status
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Failed to send booking request.", severity: 'error' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage - 1 // Pagination component is 1-indexed, our state is 0-indexed
    }));
  };

  const renderAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <WifiIcon fontSize="small" />;
      case 'parking': return <LocalParkingIcon fontSize="small" />;
      case 'ac': return <AcUnitIcon fontSize="small" />;
      case 'heating': return <HeatingIcon fontSize="small" />;
      case 'tv': return <TvIcon fontSize="small" />;
      case 'kitchen': return <KitchenIcon fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Stack spacing={0}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 0, m: 0, mb: 0 }}>
          <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
            <TextField
              label="Search Properties"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Toggle Filters">
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>

            {showFilters && (
              <>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <Select
                    name="availability"
                    value={filters.availability}
                    onChange={handleFilterChange}
                    displayEmpty
                  >
                    <MenuItem value="all">All Availability</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="unavailable">Unavailable</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Max Price"
                  name="maxPrice"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: 120 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                <TextField
                  label="Min Size"
                  name="minSize"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={filters.minSize}
                  onChange={handleFilterChange}
                  sx={{ maxWidth: 120 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sqft</InputAdornment>,
                  }}
                />
              </>
            )}
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 0, m: 0, mt: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
           
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedRoomsForDisplay.length} of {pagination.totalElements} properties
            </Typography>
          </Stack>

          <CustomScrollbar sx={{ maxHeight: '70vh' }}>
            <Grid container spacing={3}>
              {paginatedRoomsForDisplay.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <HomeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No properties found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search criteria or filters
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                paginatedRoomsForDisplay.map((room) => (
                  <Grid item key={room.id} xs={12} sm={6} md={4} sx={{
                    [MUItheme.breakpoints.up('lg')]: {
                      width: '20%',
                      maxWidth: '20%',
                      flexBasis: '20%',
                    },
                  }}>
                    <StyledCard>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={room.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${room.images[0]}` : undefined}
                          alt={room.title}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                          }}
                        />
                        {!room.available && (
                          <Chip
                            label="Not Available"
                            color="error"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="h6" component="div" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          {room.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                          <AttachMoneyIcon fontSize="small" color="primary" />
                          <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600 }}>
                            ${room.price} / month
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {room.address}, {room.city}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                          <SquareFootIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {room.size} sqft
                          </Typography>
                        </Stack>
                        {room.amenities && Object.values(room.amenities).some(Boolean) && (
                          <Stack direction="row" flexWrap="wrap" spacing={1}>
                            {Object.entries(room.amenities).map(([amenity, value]) =>
                              value && (
                                <StyledChip
                                  key={amenity}
                                  icon={renderAmenityIcon(amenity)}
                                  label={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                                  size="small"
                                />
                              )
                            )}
                          </Stack>
                        )}
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleOpenBookingDialog(room)}
                          disabled={!room.available}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          {room.available ? 'View Details & Book' : 'Not Available'}
                        </Button>
                      </Box>
                    </StyledCard>
                  </Grid>
                ))
              )}
            </Grid>
          </CustomScrollbar>
        </Paper>
      </Stack>

      {/* Fixed Pagination - Copied from PropertyManagement.jsx */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, sm: '240px' }, // Adjust left based on sidebar width
          right: 0,
          zIndex: 1000,
          borderRadius: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'left 0.3s ease'
        }}
      >
        <Box sx={{
          py: { xs: 1.5, md: 0.75 },
          px: { xs: 1, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 52, md: 44 },
          maxWidth: 'xl',
          mx: 'auto'
        }}>
          <Box sx={{ position: 'absolute', right: { xs: 2, sm: 4 } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.75rem',
                py: 0.5,
                px: 1,
                display: { xs: 'none', md: 'block' }
              }}
            >
              Total {pagination.totalElements} properties
            </Typography>
          </Box>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage + 1}
            onChange={handlePageChange}
            shape="rounded"
            renderItem={(item) => {
              if (item.type === 'previous' || item.type === 'next') {
                return (
                  <PaginationItem
                    {...item}
                    sx={{
                      bgcolor: 'transparent',
                      border: 'none',
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                        bgcolor: 'transparent',
                      },
                    }}
                  />
                );
              }
              return (
                <PaginationItem
                  {...item}
                  sx={{
                    mx: 0.5,
                    border: 'none',
                    bgcolor: 'transparent',
                    color: 'text.primary',
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
              );
            }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 1.2,
              '& .MuiPaginationItem-root': {
                mx: 0.5,
                minWidth: 32,
                height: 32
              }
            }}
          />
        </Box>
      </Paper>

      <PropertyDetails
        open={isPropertyDetailsModalOpen}
        onClose={handleClosePropertyDetailsModal}
        property={selectedRoom}
        onBookNow={handleOpenBookingDialogFromDetails}
        theme={MUItheme}
      />

      <Dialog open={bookingDialogOpen} onClose={handleCloseBookingDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: MUItheme.palette.primary.main, color: MUItheme.palette.primary.contrastText, pb: 1, pt: 2 }}>
          Book {selectedRoom?.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Fill in your booking details below. Your request will be sent to the landlord for approval.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid>
          </Grid>
          {selectedRoom?.price && startDate && endDate && (
            <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
              Estimated Price: ${selectedRoom.price} / month
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseBookingDialog} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={bookingLoading || !startDate || !endDate} variant="contained" color="primary">
            {bookingLoading ? <CircularProgress size={20} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrowsePropertySection; 