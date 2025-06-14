import React, { useState, useEffect } from 'react';
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

const PropertyManagement = ({ theme, currentUser, setSnackbar }) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const fetchedProperties = await roomService.fetchRoomsByLandlord(currentUser.id);
      
      // Ensure fetchedProperties is an array
      if (!Array.isArray(fetchedProperties)) {
        throw new Error('Invalid response format: expected an array of properties');
      }
      
      setProperties(fetchedProperties);
      setFilteredProperties(fetchedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      setFilteredProperties([]);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch properties',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchProperties();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!Array.isArray(properties)) {
      setFilteredProperties([]);
      return;
    }

    const filtered = properties.filter((property) => {
      const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = filters.maxPrice ? property.price <= parseFloat(filters.maxPrice) : true;
      const matchesSize = filters.minSize ? property.size >= parseFloat(filters.minSize) : true;
      const matchesAvailability = filters.availability === 'all' ? true :
        filters.availability === 'available' ? property.available : !property.available;

      return matchesSearch && matchesPrice && matchesSize && matchesAvailability;
    });

    setFilteredProperties(filtered);
  }, [properties, searchTerm, filters]);

  const handleCreateProperty = async () => {
    try {
      setLoading(true);
      await roomService.createRoom(propertyForm, currentUser.id);
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
      await roomService.updateRoom(selectedProperty.id, propertyForm, currentUser.id);
      await fetchProperties();
      setSnackbar({
        open: true,
        message: 'Property updated successfully',
        severity: 'success',
      });
      setIsPropertyModalOpen(false);
      setSelectedProperty(null);
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
        setSnackbar({
          open: true,
          message: 'Property deleted successfully',
          severity: 'success',
        });
      } else {
        await roomService.toggleAvailability(confirmDialog.propertyId, currentUser.id);
      setSnackbar({
        open: true,
          message: confirmDialog.action === 'deactivate' 
            ? 'Property is now unavailable' 
            : 'Property is now available',
        severity: 'success',
      });
      }
      await fetchProperties();
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProperties = filteredProperties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container 
      maxWidth="xl" 
          sx={{
        py: 3,
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Main scrollable container */}
      <CustomScrollbar
        sx={{
          flex: 1,
          mb: { xs: 8, md: 7 } // Space for pagination
        }}
      >
        {/* Content wrapper */}
        <Stack spacing={2}>
          {/* Search and Filters */}
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
                  Add Property
                </Button>
              </Stack>
            </Stack>

            {/* Desktop View - Single Row Layout */}
            <Stack 
              direction="row" 
              spacing={2}
              alignItems="center"
              sx={{ 
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <TextField
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
                sx={{ width: '30%' }}
              />
              
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
                  width: '15%',
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
                  width: '15%',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper'
                  }
                }}
              />
              
              <FormControl 
                variant="outlined" 
                size="small"
                sx={{ 
                  width: '20%',
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
                  width: '20%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Add Property
              </Button>
            </Stack>
        </Paper>

          {/* Property List - Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider'
          }}>
              <CustomScrollbar>
                <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="25%">Property Info</TableCell>
                    <TableCell width="12%">Price</TableCell>
                    <TableCell width="10%">Size</TableCell>
                    <TableCell width="18%">Amenities</TableCell>
                    <TableCell width="10%">Status</TableCell>
                    <TableCell width="15%">Location</TableCell>
                    <TableCell width="10%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                      {paginatedProperties.map((property) => (
                        <StyledTableRow key={property.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            variant="rounded"
                            src={property.images?.[0] ? `${import.meta.env.VITE_API_URL}/uploads/${property.images[0]}` : undefined}
                            onClick={() => {
                              setSelectedPropertyImages(property.images);
                              setIsImageModalOpen(true);
                            }}
                              sx={{
                                width: 56,
                                height: 56,
                                bgcolor: 'background.default',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'transform 0.2s ease'
                              }
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
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
                            onClick={() => {
                              setSelectedProperty(property);
                              setPropertyForm({
                                ...property,
                                images: property.images || [],
                                status: property.available ? 'available' : 'unavailable',
                              });
                              setIsPropertyModalOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                                onClick={() => handlePropertyAction(property.id, property.available ? 'deactivate' : 'activate')}
                          >
                            {property.available ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handlePropertyAction(property.id, 'delete')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                      {paginatedProperties.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
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
                          </TableCell>
                        </TableRow>
                      )}
                </TableBody>
              </Table>
            </TableContainer>
            </CustomScrollbar>
          </Paper>
        </Box>

        {/* Mobile View */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Grid container spacing={2}>
              {paginatedProperties.map((property) => (
                <Grid item xs={12} sm={6} key={property.id}>
                <Paper sx={{
                    height: '100%',
                    borderRadius: '0px',
                  border: '1px solid',
                  borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
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
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedPropertyImages(property.images);
                          setIsImageModalOpen(true);
                        }}
                      />
                    ) : (
                      <Box sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary'
                      }}>
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
                            onClick={() => {
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
                            onClick={() => handlePropertyAction(property.id, property.available ? 'deactivate' : 'activate')}
                          >
                            {property.available ? (
                              <BlockIcon fontSize="small" />
                            ) : (
                              <CheckCircleIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handlePropertyAction(property.id, 'delete')}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            ))}
              {paginatedProperties.length === 0 && (
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
      </Stack>
      </CustomScrollbar>

      {/* Fixed Pagination - Both Desktop and Mobile */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{
            py: { xs: 1.5, md: 0.75 },
            px: { xs: 1, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: { xs: 52, md: 44 }
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Total {filteredProperties.length} properties
            </Typography>
            <TablePagination
              component="div"
              count={filteredProperties.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                ml: { xs: 0, sm: 'auto' },
                border: 0,
                '& .MuiTablePagination-select': {
                  borderRadius: 1,
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: 'text.secondary',
                },
                '& .MuiTablePagination-toolbar': {
                  minHeight: { xs: 40, md: 36 },
                  px: { xs: 0, sm: 2 },
                  '& .MuiTablePagination-displayedRows': {
                    mb: 0
                  },
                  '& .MuiTablePagination-selectLabel': {
                    mb: 0
                  }
                }
              }}
            />
          </Box>
        </Container>
      </Paper>

      {/* Modals */}
      <PropertyModal
        open={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setSelectedProperty(null);
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