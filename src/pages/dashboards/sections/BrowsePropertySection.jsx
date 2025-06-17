import React, { useState, useEffect, useCallback } from 'react';
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
  Collapse,
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
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import { useOutletContext, useNavigate } from 'react-router-dom';
import * as roomService from '../../../services/roomService';
import * as bookingService from '../../../services/bookingService';
import { styled, useTheme } from '@mui/material/styles';
import PropertyDetails from '../../../components/property/PropertyDetails';
import useMediaQuery from '@mui/material/useMediaQuery';

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

const StyledPaginationPaper = styled(Paper)(({ theme, drawerOpen }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  marginLeft: drawerOpen ? 240 : 65, // Drawer width when expanded/collapsed
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  borderRadius: 0,
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  zIndex: theme.zIndex.drawer - 1,
}));

const BrowsePropertySection = () => {
  const { theme, drawerOpen } = useOutletContext();
  const navigate = useNavigate();
  const MUItheme = useTheme();
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    maxPrice: '',
    minSize: '',
    availability: 'available',
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
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const isMobileOrTablet = useMediaQuery(MUItheme.breakpoints.down('md'));
  const [infinitePage, setInfinitePage] = useState(0);
  const [infiniteRooms, setInfiniteRooms] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch all rooms for search/filter
  const fetchAllRooms = useCallback(async () => {
    try {
      console.log('Fetching all rooms...');
      setLoading(true);
      const response = await roomService.fetchAllRooms(0, 1000); // Fetch all rooms
      console.log('All rooms response:', response);
      
      if (!response || !response.content) {
        throw new Error('Invalid response format from server');
      }
      
      const formattedRooms = response.content.map(room => ({
        ...room,
        price: parseFloat(room.price) || 0,
        size: parseFloat(room.size) || 0,
      }));
      
      setAllRooms(formattedRooms);
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      setAllRooms([]);
      setSnackbarState({
        open: true,
        message: error.message || 'Failed to fetch all rooms for filtering',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    console.log('Initial load effect triggered');
    fetchAllRooms();
  }, [fetchAllRooms]);

  // Handle search and filter
  useEffect(() => {
    if (!Array.isArray(allRooms)) {
      setFilteredRooms([]);
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

    // Update pagination based on filtered results
    setPagination(prev => ({
      ...prev,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.pageSize),
      currentPage: 0 // Reset to first page when filter changes
    }));

    // Get current page of filtered results
    const startIndex = 0;
    const endIndex = pagination.pageSize;
    setFilteredRooms(filtered.slice(startIndex, endIndex));
  }, [allRooms, searchTerm, filters, pagination.pageSize]);

  // Update filtered rooms when page changes
  useEffect(() => {
    if (!Array.isArray(allRooms)) return;

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

    const startIndex = pagination.currentPage * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    setFilteredRooms(filtered.slice(startIndex, endIndex));
  }, [pagination.currentPage, allRooms, searchTerm, filters]);

  // Infinite scroll effect for mobile/tablet
  useEffect(() => {
    if (!isMobileOrTablet) return;
    // Reset on filter/search change
    setInfinitePage(0);
    setInfiniteRooms([]);
    setHasMore(true);
  }, [searchTerm, filters, allRooms, isMobileOrTablet]);

  useEffect(() => {
    if (!isMobileOrTablet) return;
    // Filtered rooms
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
    const pageSize = pagination.pageSize;
    const startIndex = infinitePage * pageSize;
    const endIndex = startIndex + pageSize;
    const nextRooms = filtered.slice(startIndex, endIndex);
    setInfiniteRooms((prev) => infinitePage === 0 ? nextRooms : [...prev, ...nextRooms]);
    setHasMore(endIndex < filtered.length);
  }, [infinitePage, allRooms, searchTerm, filters, isMobileOrTablet, pagination.pageSize]);

  // Infinite scroll handler
  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setInfinitePage((prev) => prev + 1);
    }
  };

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
      setSnackbarState({ open: true, message: "Please fill all booking details.", severity: 'warning' });
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
      setSnackbarState({ open: true, message: "Booking request sent successfully!", severity: 'success' });
      handleCloseBookingDialog();
      // Potentially refresh rooms or update status
    } catch (err) {
      setSnackbarState({ open: true, message: err.message || "Failed to send booking request.", severity: 'error' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage - 1
    }));
  };

  const handlePropertyClick = (room) => {
    navigate(`/seeker/dashboard/property/${room.id}`);
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

  // Add empty state component
  const EmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No Properties Found
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {error ? 'Error loading properties. Please try again later.' : 'No properties are available at the moment.'}
      </Typography>
    </Box>
  );

  // Add loading state component
  const LoadingState = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}
    >
      <CircularProgress />
    </Box>
  );

  // Update the main render section to use these components
  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }
    if (error || (!loading && (!filteredRooms || filteredRooms.length === 0))) {
      return <EmptyState />;
    }
    if (isMobileOrTablet) {
    return (
      <Grid container spacing={3}>
          {infiniteRooms.map((room) => {
            // Get up to 2 active amenities
            const activeAmenities = room.amenities ? Object.entries(room.amenities).filter(([_, v]) => v).slice(0, 2) : [];
            return (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={room.id}>
            <StyledCard 
              onClick={() => handlePropertyClick(room)}
                  sx={{
                    cursor: 'pointer',
                    maxHeight: 480,
                    minHeight: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 3,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px) scale(1.02)',
                    },
                  }}
            >
                  <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={room.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${room.images[0]}` : undefined}
                  alt={room.title}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                        transition: 'transform 0.3s',
                  }}
                />
                    <Box
                    sx={{
                      position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.55) 100%)',
                    }}
                  />
                    <Chip
                      label={room.available ? 'Available' : 'Not Available'}
                      size="small"
                  sx={{
                    position: 'absolute',
                        top: 10,
                        left: 10,
                        bgcolor: room.available ? 'success.light' : 'error.light',
                        color: room.available ? 'success.dark' : 'error.dark',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        px: 1.2,
                        borderRadius: 1.5,
                        zIndex: 2,
                  }}
                />
              </Box>
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1.2 }}>
                <Typography 
                      variant="subtitle1"
                  sx={{ 
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1.08rem',
                        mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                  }}
                >
                  {room.title}
                </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 19 }} />
                      <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
                      ${room.price.toLocaleString()}
                    </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /month
                    </Typography>
                  </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 17 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {room.city}
                    </Typography>
                  </Stack>
                    {room.address && (
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {room.address}
                    </Typography>
                    )}
                    {activeAmenities.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        {activeAmenities.map(([amenity]) => (
                          <Box key={amenity} sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.default', borderRadius: 1, px: 0.9, py: 0.4 }}>
                            {renderAmenityIcon(amenity)}
                            <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                              {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                            </Typography>
                          </Box>
                        ))}
                  </Stack>
                    )}
                  </CardContent>
                  <Box sx={{ p: 2.5, pt: 0, mt: 'auto' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleOpenBookingDialog(room)}
                      disabled={!room.available}
                            sx={{
                        borderRadius: 2,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        fontSize: '0.95rem',
                        '&:hover': {
                          boxShadow: 'none',
                          transform: 'translateY(-2px)',
                          transition: 'transform 0.2s ease-in-out',
                        },
                      }}
                    >
                      {room.available ? 'View Details & Book' : 'Not Available'}
                    </Button>
                  </Box>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
      );
    }
    // Desktop: use paginated filteredRooms
    return (
      <Grid container spacing={3}>
        {filteredRooms.map((room) => {
          // Get up to 2 active amenities
          const activeAmenities = room.amenities ? Object.entries(room.amenities).filter(([_, v]) => v).slice(0, 2) : [];
          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={room.id}>
              <StyledCard 
                onClick={() => handlePropertyClick(room)}
                sx={{
                  cursor: 'pointer',
                  maxHeight: 480,
                  minHeight: 420,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 3,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px) scale(1.02)',
                  },
                }}
              >
                <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={room.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${room.images[0]}` : undefined}
                    alt={room.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: '16px 16px 0 0',
                      transition: 'transform 0.3s',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.55) 100%)',
                    }}
                  />
                  <Chip
                    label={room.available ? 'Available' : 'Not Available'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      bgcolor: room.available ? 'success.light' : 'error.light',
                      color: room.available ? 'success.dark' : 'error.dark',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      px: 1.2,
                      borderRadius: 1.5,
                      zIndex: 2,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1.2 }}>
                  <Typography 
                    variant="subtitle1"
                    sx={{ 
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '1.08rem',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                            }}
                  >
                    {room.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 19 }} />
                    <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
                      ${room.price.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      /month
                    </Typography>
                    </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 17 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {room.city}
                    </Typography>
                  </Stack>
                  {room.address && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {room.address}
                    </Typography>
                  )}
                  {activeAmenities.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {activeAmenities.map(([amenity]) => (
                        <Box key={amenity} sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.default', borderRadius: 1, px: 0.9, py: 0.4 }}>
                          {renderAmenityIcon(amenity)}
                          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                            {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                          </Typography>
                        </Box>
                      ))}
                </Stack>
                  )}
              </CardContent>
                <Box sx={{ p: 2.5, pt: 0, mt: 'auto' }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleOpenBookingDialog(room)}
                  disabled={!room.available}
                  sx={{
                    borderRadius: 2,
                      py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                      fontSize: '0.95rem',
                    '&:hover': {
                      boxShadow: 'none',
                      transform: 'translateY(-2px)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                >
                  {room.available ? 'View Details & Book' : 'Not Available'}
                </Button>
              </Box>
            </StyledCard>
          </Grid>
          );
        })}
      </Grid>
    );
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
    <Container maxWidth={false} sx={{ py: 2, px: 0 }}>
      <Box
        sx={{
          overflowY: { xs: 'auto', sm: 'auto', md: 'visible' },
          maxHeight: {
            xs: 'calc(100vh - 56px)',
            sm: 'calc(100vh - 64px)',
            md: 'none',
          },
        }}
        onScroll={isMobileOrTablet ? handleScroll : undefined}
      >
      {/* Search and Filter Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 0,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: theme => alpha(theme.palette.divider, 0.1),
          borderBottom: 'none',
          boxShadow: 'none',
          borderRadius: '16px 16px 0 0',
        }}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <TextField
            placeholder="Search by title, city, or address..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: theme => alpha(theme.palette.background.default, 0.8),
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.background.default, 1),
                }
              }
            }}
            sx={{ 
              flex: 2,
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          />
          <TextField
            label="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              sx: { borderRadius: 2 }
            }}
            sx={{ 
              flex: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          />
          <TextField
            label="Min Size (sqft)"
            type="number"
            value={filters.minSize}
            onChange={(e) => handleFilterChange('minSize', e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
            sx={{ 
              flex: 1,
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          />
          <FormControl sx={{ flex: 1, minWidth: 0, width: { xs: '100%', md: 'auto' } }}>
            <Select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2, height: '56px' }}
            >
              <MenuItem value="all">All Properties</MenuItem>
              <MenuItem value="available">Available Only</MenuItem>
              <MenuItem value="unavailable">Unavailable Only</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => {
              setFilters({
                maxPrice: '',
                minSize: '',
                availability: 'all'
              });
              setSearchTerm('');
            }}
            sx={{
              height: '56px',
              borderRadius: 2,
              borderColor: theme => alpha(theme.palette.divider, 0.2),
              px: 3,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <RestartAltIcon />
          </Button>
        </Stack>
      </Paper>

      {/* Properties Grid Section */}
      <Paper
        elevation={0}
        sx={{
          minHeight: 300,
          borderRadius: '0 0 16px 16px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: theme => alpha(theme.palette.divider, 0.1),
          boxShadow: theme => `0 0 20px ${alpha(theme.palette.primary.main, 0.08)}`,
          pb: 7 // Add padding at bottom for fixed pagination
        }}
      >
        <CustomScrollbar>
          <Box sx={{ p: 3 }}>
            {renderContent()}
          </Box>
        </CustomScrollbar>
      </Paper>

      {/* Pagination only for desktop */}
      {!isMobileOrTablet && !loading && filteredRooms.length > 0 && (
        <StyledPaginationPaper drawerOpen={drawerOpen} elevation={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage + 1}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPagination-ul': {
                justifyContent: 'center',
              },
              '& .MuiPaginationItem-root': {
                borderRadius: 1,
              },
            }}
          />
        </StyledPaginationPaper>
      )}

      {/* Property Details Modal */}
      {selectedRoom && (
        <PropertyDetails
          open={isPropertyDetailsModalOpen}
          onClose={handleClosePropertyDetailsModal}
          room={selectedRoom}
          onBook={() => handleOpenBookingDialogFromDetails(selectedRoom)}
        />
      )}

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={handleCloseBookingDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme => `0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" fontWeight={600}>
            Book Property
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select your preferred dates for booking
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseBookingDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: theme => alpha(theme.palette.divider, 0.2)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            variant="contained"
            disabled={bookingLoading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
          >
            {bookingLoading ? 'Booking...' : 'Book Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            width: '100%',
            boxShadow: theme => `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
      </Box>
    </Container>
  );
};

export default BrowsePropertySection; 