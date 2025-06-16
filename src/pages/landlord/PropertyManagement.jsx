import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Container,
  Stack,
  Paper,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  alpha,
  Dialog,
  DialogContent,
  DialogActions,
  TablePagination,
  Pagination,
  PaginationItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PropertyModal from '../../components/modals/PropertyModal';
import ImageModal from '../../components/modals/ImageModal';
import PropertyDetails from '../../components/property/PropertyDetails';
import * as roomService from '../../services/roomService';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

// Add custom scrollbar styling
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

const PropertyManagement = () => {
  const { theme, currentUser, setSnackbar } = useOutletContext();
  const [allProperties, setAllProperties] = useState([]); // Store all properties
  const [properties, setProperties] = useState([]); // Store current page properties
  const [filteredProperties, setFilteredProperties] = useState([]); // Store filtered properties for current page
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState([]);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    propertyId: null,
    action: null
  });
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    size: '',
    images: [],
    amenities: {
      wifi: false,
      parking: false,
      ac: false,
      heating: false,
      tv: false,
      kitchen: false
    },
    available: true,
  });
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

  // Fetch all properties for search/filter
  const fetchAllProperties = async () => {
    try {
      const response = await roomService.fetchRoomsByLandlord(currentUser.id, 0, 1000); // Fetch all properties
      if (!response || !response.content) {
        throw new Error('Invalid response format from server');
      }
      setAllProperties(response.content);
    } catch (error) {
      console.error('Error fetching all properties:', error);
      setAllProperties([]);
    }
  };

  // Fetch paginated properties for display
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await roomService.fetchRoomsByLandlord(currentUser.id, pagination.currentPage, pagination.pageSize);
      
      if (!response || !response.content) {
        throw new Error('Invalid response format from server');
      }

      setProperties(response.content);
      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch properties',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (currentUser?.id) {
      fetchAllProperties();
      fetchProperties();
    }
  }, [currentUser]);

  // Handle search and filter
  useEffect(() => {
    if (!Array.isArray(allProperties)) {
      setFilteredProperties([]);
      return;
    }

    const filtered = allProperties.filter((property) => {
      const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = filters.maxPrice ? property.price <= parseFloat(filters.maxPrice) : true;
      const matchesSize = filters.minSize ? property.size >= parseFloat(filters.minSize) : true;
      const matchesAvailability = filters.availability === 'all' ? true :
        filters.availability === 'available' ? property.available : !property.available;

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
    setFilteredProperties(filtered.slice(startIndex, endIndex));
  }, [allProperties, searchTerm, filters]);

  // Update filtered properties when page changes
  useEffect(() => {
    if (!Array.isArray(allProperties)) return;

    const filtered = allProperties.filter((property) => {
      const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = filters.maxPrice ? property.price <= parseFloat(filters.maxPrice) : true;
      const matchesSize = filters.minSize ? property.size >= parseFloat(filters.minSize) : true;
      const matchesAvailability = filters.availability === 'all' ? true :
        filters.availability === 'available' ? property.available : !property.available;

      return matchesSearch && matchesPrice && matchesSize && matchesAvailability;
    });

    const startIndex = pagination.currentPage * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    setFilteredProperties(filtered.slice(startIndex, endIndex));
  }, [pagination.currentPage, allProperties, searchTerm, filters]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage - 1
    }));
  };

  // Add periodic refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (currentUser?.id && !isPropertyModalOpen) {
        fetchAllProperties();
        fetchProperties();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [currentUser, isPropertyModalOpen]);

  const handleCreateProperty = async () => {
    try {
      setLoading(true);
      const newProperty = await roomService.createRoom(propertyForm, currentUser.id);
      
      // Refresh both all properties and current page
      await fetchAllProperties();
      await fetchProperties();
      
      setSnackbar({
        open: true,
        message: 'Property created successfully',
        severity: 'success',
      });
      setIsPropertyModalOpen(false);
      setPropertyForm({
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        size: '',
        images: [],
        amenities: {
          wifi: false,
          parking: false,
          ac: false,
          heating: false,
          tv: false,
          kitchen: false
        },
        available: true,
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create property',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProperty = async () => {
    try {
      setLoading(true);
      const updatedProperty = await roomService.updateRoom(selectedProperty.id, propertyForm, currentUser.id);
      // Update local state immediately
      setProperties(prevProperties => 
        prevProperties.map(prop => 
          prop.id === updatedProperty.id ? updatedProperty : prop
        )
      );
      setFilteredProperties(prevFiltered => 
        prevFiltered.map(prop => 
          prop.id === updatedProperty.id ? updatedProperty : prop
        )
      );
      if (selectedProperty) {
        setSelectedProperty(updatedProperty);
      }
      setSnackbar({
        open: true,
        message: 'Property updated successfully',
        severity: 'success',
      });
      setIsPropertyModalOpen(false);
      setPropertyForm({
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        size: '',
        images: [],
        amenities: {
          wifi: false,
          parking: false,
          ac: false,
          heating: false,
          tv: false,
          kitchen: false
        },
        available: true,
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update property',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      propertyId: null,
      action: null
    });
  };

  const handleConfirmDialogConfirm = async () => {
    try {
      setLoading(true);
      if (confirmDialog.action === 'delete') {
        await roomService.deleteRoom(confirmDialog.propertyId, currentUser.id);
        
        // Refresh both all properties and current page
        await fetchAllProperties();
        await fetchProperties();
        
        if (selectedProperty?.id === confirmDialog.propertyId) {
          setSelectedProperty(null);
        }
        setSnackbar({
          open: true,
          message: 'Property deleted successfully',
          severity: 'success',
        });
      } else {
        const updatedProperty = await roomService.toggleAvailability(confirmDialog.propertyId, currentUser.id);
        
        // Refresh both all properties and current page
        await fetchAllProperties();
        await fetchProperties();
        
        if (selectedProperty?.id === confirmDialog.propertyId) {
          setSelectedProperty(prev => ({ ...prev, available: !prev.available }));
        }
        
        setSnackbar({
          open: true,
          message: confirmDialog.action === 'deactivate' 
            ? 'Property is now unavailable' 
            : 'Property is now available',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${confirmDialog.action} property`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      handleConfirmDialogClose();
    }
  };

  const handlePropertyAction = async (propertyId, action) => {
    let title = '';
    let message = '';

    switch (action) {
      case 'delete':
        title = 'Delete Property';
        message = 'Are you sure you want to delete this property? This action cannot be undone.';
        break;
      case 'deactivate':
        title = 'Deactivate Property';
        message = 'Are you sure you want to make this property unavailable? It will no longer be visible to seekers.';
        break;
      case 'activate':
        title = 'Activate Property';
        message = 'Are you sure you want to make this property available? It will be visible to seekers.';
        break;
      default:
        return;
    }

    setConfirmDialog({
      open: true,
      title,
      message,
      propertyId,
      action
    });
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{
        py: 3,
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CustomScrollbar
        sx={{
          flex: 1,
          mb: { xs: 8, md: 7 }
        }}
      >
        <Stack spacing={0}>
          {!selectedProperty && (
            <Paper sx={{
              p: 2,
              borderRadius: '0px',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {/* Mobile View - Stacked Layout */}
              <Stack 
                spacing={2} 
                sx={{ 
                  display: { xs: 'flex', md: 'none' }
                }}
              >
                {/* Search Field - First Row */}
                <TextField
                  fullWidth
                  placeholder="Search by title, city or address..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.paper' }
                  }}
                  size="small"
                />

                {/* Price and Size Filters - Second Row */}
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{ width: '100%' }}
                >
                  <TextField
                    placeholder="Max Price"
                    type="number"
                    variant="outlined"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                    }}
                    size="small"
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                  <TextField
                    placeholder="Min Size"
                    type="number"
                    variant="outlined"
                    value={filters.minSize}
                    onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
                    }}
                    size="small"
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                </Stack>

                {/* Status and Add Button - Third Row */}
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{ width: '100%' }}
                >
                  <FormControl 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper'
                      }
                    }}
                  >
                    <Select
                      value={filters.availability}
                      onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                      displayEmpty
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="unavailable">Occupied</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsPropertyModalOpen(true)}
                    sx={{
                      flex: 1,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Add 
                  </Button>
                </Stack>
              </Stack>

              {/* Desktop View - Single Row Layout */}
              <Stack 
                direction="row" 
                spacing={2}
                alignItems="center"
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  width: '100%' // Ensure the stack itself takes full width
                }}
              >
                <TextField
                  // fullWidth // Use fullWidth instead of fixed width
                  fullWidth
                  placeholder="Search by title, city or address..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.paper' }
                  }}
                  size="small"
                  // Removed sx={{ width: '30%' }}
                />
                
                <TextField
                  flex={1} // Use flex:1 to distribute space evenly
                  placeholder="Max Price"
                  type="number"
                  variant="outlined"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                  }}
                  size="small"
                  sx={{
                     width: '20%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper'
                    }
                  }}
                />
                
                <TextField
                  flex={1} // Use flex:1 to distribute space evenly
                  placeholder="Min Size"
                  type="number"
                  variant="outlined"
                  value={filters.minSize}
                  onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
                  }}
                  size="small"
                  sx={{ 
                     width: '15%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper'
                    }
                  }}
                />
                
                <FormControl 
                  flex={1} // Use flex:1 to distribute space evenly
                  variant="outlined" 
                  size="small"
                  sx={{ 
                     width: '18%',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper'
                    }
                  }}
                >
                  <Select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="unavailable">Occupied</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsPropertyModalOpen(true)}
                  sx={{
                    width: '15%', // Keep the Add Property button at a fixed width
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Add 
                </Button>
              </Stack>
            </Paper>
          )}

          {selectedProperty ? (
            <PropertyDetails
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
              onEdit={(property) => {
                setPropertyForm({
                  ...property,
                  images: property.images || [],
                  status: property.available ? 'available' : 'unavailable'
                });
                setIsPropertyModalOpen(true);
              }}
              onStatusChange={handlePropertyAction}
              theme={theme}
            />
          ) : (
            <>
              {/* Property List - Desktop */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Paper sx={{
                  borderRadius: '0px',
                  borderTop: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  width: '100%' // Ensure the paper takes full width
                }}>
                  <CustomScrollbar>
                    <TableContainer>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Property Info</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Amenities</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredProperties.map((property) => (
                            <StyledTableRow 
                              key={property.id}
                              onClick={() => setSelectedProperty(property)}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                }
                              }}
                            >
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar
                                    variant="rounded"
                                    src={property.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${property.images[0]}` : undefined}
                                    sx={{
                                      width: 56,
                                      height: 56,
                                      bgcolor: 'background.default',
                                      borderRadius: '12px',
                                    }}
                                  >
                                    {!property.images?.length && <HomeIcon />}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2" noWrap>
                                      {property.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {property.city}
                                    </Typography>
                                    <br />
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      Posted on: {new Date(property.postedDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                    <Typography variant="body2">
                                  Rs. {property.price.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                    <Typography variant="body2">
                                  {property.size} sq.ft
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack spacing={0.75}>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {Object.entries(property.amenities || {})
                                      .filter(([_, value]) => value)
                                      .slice(0, 3)
                                      .map(([key, _]) => (
                                        <Chip
                                          key={key}
                                          label={key.charAt(0).toUpperCase() + key.slice(1)}
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: theme.palette.primary.main,
                                            fontWeight: 500,
                                            '& .MuiChip-label': {
                                              px: 1
                                            }
                                          }}
                                        />
                                    ))}
                                  </Stack>
                                  {Object.entries(property.amenities || {}).filter(([_, value]) => value).length > 3 && (
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        fontStyle: 'italic'
                                      }}
                                    >
                                      +{Object.entries(property.amenities || {}).filter(([_, value]) => value).length - 3} more
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={property.available ? 'Available' : 'Occupied'}
                                  size="small"
                                  sx={{
                                    height: 24,
                                        fontSize: '0.75rem',
                                    fontWeight: 600,
                                        bgcolor: property.available
                                      ? alpha(theme.palette.success.main, 0.1)
                                      : alpha(theme.palette.error.main, 0.1),
                                    color: property.available
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap>
                                  {property.address}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {property.city}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProperty(property);
                                      setPropertyForm({
                                        ...property,
                                        images: property.images || [],
                                        status: property.available ? 'available' : 'unavailable'
                                      });
                                      setIsPropertyModalOpen(true);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePropertyAction(property.id, property.available ? 'deactivate' : 'activate');
                                        }}
                                  >
                                    {property.available ? (
                                      <BlockIcon fontSize="small" />
                                    ) : (
                                      <CheckCircleIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePropertyAction(property.id, 'delete');
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CustomScrollbar>
                </Paper>
              </Box>

              {/* Mobile View */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Grid container spacing={2}>
                  {filteredProperties.map((property) => (
                    <Grid item xs={12} sm={6} key={property.id}>
                      <Paper 
                        sx={{
                          height: '100%',
                          borderRadius: '0px',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                        onClick={() => setSelectedProperty(property)}
                      >
                        <Box sx={{
                            height: 200,
                            bgcolor: 'background.default',
                            position: 'relative'
                        }}>
                          {property.images?.[0] ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}/uploads/${property.images[0]}`}
                              alt={property.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProperty(property);
                              }}
                            />
                          ) : (
                            <Box 
                              sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProperty(property);
                              }}
                            >
                              <HomeIcon sx={{ fontSize: 48 }} />
                            </Box>
                          )}
                              <Chip
                                label={property.available ? 'Available' : 'Occupied'}
                                size="small"
                                sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: property.available
                                  ? alpha(theme.palette.success.main, 0.9)
                                  : alpha(theme.palette.error.main, 0.9),
                                color: '#fff'
                              }}
                            />
                          </Box>

                          <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Stack spacing={2}>
                              <Typography variant="subtitle1" fontWeight={600} noWrap>
                                {property.title}
                              </Typography>

                              <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                                <Typography variant="body2" color="primary.main" fontWeight={500}>
                                Rs. {property.price.toLocaleString()}
                              </Typography>
                              <Typography variant="body2">
                                {property.size} sq.ft
                              </Typography>
                            </Stack>

                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {property.address}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {property.city}
                              </Typography>
                            </Box>

                              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 'auto' }}>
                                {Object.entries(property.amenities || {}).map(([key, value]) => (
                                  value && (
                                  <Chip
                                      key={key}
                                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.75rem',
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      color: theme.palette.primary.main,
                                        mb: 0.5
                                    }}
                                  />
                                  )
                                ))}
                              </Stack>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                Posted: {new Date(property.postedDate).toLocaleDateString()}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProperty(property);
                                    setPropertyForm({
                                      ...property,
                                      images: property.images || [],
                                      status: property.available ? 'available' : 'unavailable'
                                    });
                                    setIsPropertyModalOpen(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePropertyAction(property.id, property.available ? 'deactivate' : 'activate');
                                  }}
                                >
                                  {property.available ? (
                                    <BlockIcon fontSize="small" />
                                  ) : (
                                    <CheckCircleIcon fontSize="small" />
                                  )}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePropertyAction(property.id, 'delete');
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                          </Stack>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                  {filteredProperties.length === 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Stack spacing={1} alignItems="center">
                          <Typography variant="h6" color="text.secondary">
                            No properties found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchTerm || filters.maxPrice || filters.minSize || filters.availability !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Add your first property to get started'}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </>
          )}
        </Stack>
      </CustomScrollbar>

      {/* Fixed Pagination - Both Desktop and Mobile */}
      {!selectedProperty && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: { xs: 0, sm: '240px' },
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
      )}

      {/* Modals */}
      <PropertyModal
        open={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          if (!selectedProperty) {
            setPropertyForm({
              title: '',
              description: '',
              price: '',
              address: '',
              city: '',
              size: '',
              images: [],
              amenities: {
                wifi: false,
                parking: false,
                ac: false,
                heating: false,
                tv: false,
                kitchen: false
              },
              available: true
            });
          }
        }}
        propertyForm={propertyForm}
        setPropertyForm={setPropertyForm}
        handleSubmit={selectedProperty ? handleUpdateProperty : handleCreateProperty}
        selectedProperty={selectedProperty}
        theme={theme}
        loading={loading}
        setSnackbar={setSnackbar}
      />

      <ImageModal
        open={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedPropertyImages([]);
        }}
        images={selectedPropertyImages}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleConfirmDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: { xs: '90%', sm: '360px' },
            maxWidth: '400px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(
                  confirmDialog.action === 'delete' 
                    ? theme.palette.error.main 
                    : theme.palette.primary.main,
                  0.08
                ),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              {confirmDialog.action === 'delete' ? (
                <DeleteIcon
                  sx={{
                    fontSize: 24,
                    color: 'error.main'
                  }}
                />
              ) : confirmDialog.action === 'deactivate' ? (
                <BlockIcon
                  sx={{
                    fontSize: 24,
                    color: 'primary.main'
                  }}
                />
              ) : (
                <CheckCircleIcon
                  sx={{
                    fontSize: 24,
                    color: 'primary.main'
                  }}
                />
              )}
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              {confirmDialog.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {confirmDialog.message}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Button
            onClick={handleConfirmDialogClose}
            variant="text"
            sx={{
              flex: 1,
              py: 1,
              textTransform: 'none',
              fontSize: '0.9rem',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDialogConfirm}
            variant="contained"
            color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
            sx={{
              flex: 1,
              py: 1,
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: (theme) => confirmDialog.action === 'delete'
                  ? theme.palette.error.dark
                  : theme.palette.primary.dark
              }
            }}
          >
            {confirmDialog.action === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyManagement; 