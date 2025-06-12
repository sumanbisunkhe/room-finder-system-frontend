import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Grid,
  Stack,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Collapse,
  Fade,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  MeetingRoom as RoomIcon,
  Message as MessageIcon,
  BookOnline as BookingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  FilePresent as FileIcon,
} from '@mui/icons-material';
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import StyledTypography from '../../../components/common/StyledTypography';

const CSVOperations = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState({
    users: false,
    rooms: false,
    messages: false,
    bookings: false
  });
  const [progress, setProgress] = useState({
    users: 0,
    rooms: 0,
    messages: 0,
    bookings: 0
  });
  const [openHelp, setOpenHelp] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({
    users: { total: 0, lastUpdate: null },
    rooms: { total: 0, lastUpdate: null },
    messages: { total: 0, lastUpdate: null },
    bookings: { total: 0, lastUpdate: null }
  });

  const sections = [
    {
      type: 'users',
      title: 'Users',
      icon: <PeopleIcon />,
      description: 'Export or import user data and information.',
      color: theme.palette.primary.main,
      format: [
        { field: 'username', required: true },
        { field: 'email', required: true },
        { field: 'fullName', required: true },
        { field: 'role', required: true },
        { field: 'phoneNumber', required: false },
      ]
    },
    {
      type: 'rooms',
      title: 'Rooms',
      icon: <RoomIcon />,
      description: 'Manage room listings, details and availability.',
      color: theme.palette.success.main,
      format: [
        { field: 'title', required: true },
        { field: 'description', required: true },
        { field: 'price', required: true },
        { field: 'location', required: true },
        { field: 'amenities', required: false },
      ]
    },
    {
      type: 'messages',
      title: 'Messages',
      icon: <MessageIcon />,
      description: 'Handle message history and communication records.',
      color: theme.palette.info.main,
      format: [
        { field: 'sender', required: true },
        { field: 'receiver', required: true },
        { field: 'content', required: true },
        { field: 'timestamp', required: true },
      ]
    },
    {
      type: 'bookings',
      title: 'Bookings',
      icon: <BookingIcon />,
      description: 'Process booking records and reservation data.',
      color: theme.palette.warning.main,
      format: [
        { field: 'roomId', required: true },
        { field: 'userId', required: true },
        { field: 'startDate', required: true },
        { field: 'endDate', required: true },
        { field: 'status', required: true },
      ]
    }
  ];

  const simulateProgress = (type) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setProgress(prev => ({ ...prev, [type]: progress }));
    }, 500);
    return interval;
  };

  const handleExport = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    const progressInterval = simulateProgress(type);
    
    try {
      let response;
      switch (type) {
        case 'users':
          response = await userService.exportUsersToCSV();
          break;
        case 'rooms':
          response = await userService.exportRoomsToCSV();
          break;
        case 'messages':
          response = await userService.exportMessagesToCSV();
          break;
        case 'bookings':
          response = await userService.exportBookingsToCSV();
          break;
        default:
          throw new Error('Invalid export type');
      }
      
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [type]: 100 }));
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`, 'success');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          lastUpdate: new Date().toISOString()
        }
      }));
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [type]: 0 }));
      console.error(`Export ${type} error:`, error);
      showSnackbar(error.message || `Failed to export ${type}`, 'error');
      setErrors(prev => ({ ...prev, [type]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
      setTimeout(() => {
        setProgress(prev => ({ ...prev, [type]: 0 }));
      }, 1000);
    }
  };

  const handleImport = async (type, file) => {
    if (!file) {
      showSnackbar('Please select a file to import', 'error');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showSnackbar('Please upload a CSV file', 'error');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showSnackbar('File size too large. Please upload a file smaller than 5MB', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    const progressInterval = simulateProgress(type);

    try {
      let response;
      switch (type) {
        case 'users':
          response = await userService.importUsersFromCSV(file);
          break;
        case 'rooms':
          response = await userService.importRoomsFromCSV(file);
          break;
        case 'messages':
          response = await userService.importMessagesToCSV(file);
          break;
        case 'bookings':
          response = await userService.importBookingsToCSV(file);
          break;
        default:
          throw new Error('Invalid import type');
      }

      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [type]: 100 }));
      showSnackbar(response.message || `${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully`, 'success');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          lastUpdate: new Date().toISOString(),
          total: (prev[type].total || 0) + 1
        }
      }));
      
      // Clear any existing errors
      setErrors(prev => ({ ...prev, [type]: null }));
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [type]: 0 }));
      console.error(`Import ${type} error:`, error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('format')) {
        errorMessage = 'Please check your CSV file format and try again';
      } else if (errorMessage.includes('duplicate')) {
        errorMessage = 'Duplicate entries found in the CSV file';
      } else if (errorMessage.includes('Server error')) {
        errorMessage = 'Server error occurred. Please try again later';
      }

      showSnackbar(errorMessage || `Failed to import ${type}`, 'error');
      setErrors(prev => ({ ...prev, [type]: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
      setTimeout(() => {
        setProgress(prev => ({ ...prev, [type]: 0 }));
      }, 1000);
    }
  };

  const renderCSVSection = ({ type, title, icon, description, color, format }) => (
    <Grid 
      key={type} 
      item 
      xs={12} 
      sm={6}
      sx={{ 
        display: 'flex',
      }}
    >
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%',
          display: 'flex', 
          flexDirection: 'column',
          border: 1,
          borderColor: errors[type] ? 'error.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          }
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: alpha(color, 0.05),
          }}
        >
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StyledTypography 
              variant="h6" 
              color="text.primary" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {title}
            </StyledTypography>
            <StyledTypography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {description}
            </StyledTypography>
          </Box>
          <Tooltip title="View format requirements" arrow>
            <IconButton 
              size="small" 
              onClick={() => {
                setSelectedType(type);
                setOpenHelp(true);
              }}
              sx={{ 
                color: 'action.active',
                ml: 1
              }}
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Error Message */}
        <Collapse in={Boolean(errors[type])}>
          <Alert 
            severity="error" 
            onClose={() => setErrors(prev => ({ ...prev, [type]: null }))}
            sx={{ 
              borderRadius: 0,
              '& .MuiAlert-message': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            {errors[type]}
          </Alert>
        </Collapse>

        {/* Progress Bar */}
        {progress[type] > 0 && (
          <LinearProgress 
            variant="determinate" 
            value={progress[type]} 
            sx={{ 
              height: 4,
              bgcolor: alpha(color, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: color,
              }
            }} 
          />
        )}

        {/* Content */}
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 1.5, sm: 2 }
        }}>
          {/* Stats */}
          <Box sx={{ mb: { xs: 1, sm: 2 } }}>
            <Stack 
              direction="row" 
              spacing={1}
              flexWrap="wrap"
              gap={1}
            >
              {stats[type].lastUpdate && (
                <Chip 
                  size="small"
                  icon={<RefreshIcon />}
                  label={`Last: ${new Date(stats[type].lastUpdate).toLocaleString()}`}
                  sx={{ 
                    bgcolor: alpha(color, 0.1), 
                    color: color,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
              )}
              {stats[type].total > 0 && (
                <Chip 
                  size="small"
                  icon={<FileIcon />}
                  label={`Total: ${stats[type].total}`}
                  sx={{ 
                    bgcolor: alpha(color, 0.1), 
                    color: color,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Button
            variant="contained"
            fullWidth
            startIcon={loading[type] ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
            onClick={() => handleExport(type)}
            disabled={loading[type]}
            sx={{
              bgcolor: color,
              '&:hover': {
                bgcolor: alpha(color, 0.8),
              },
              height: { xs: 40, sm: 48 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {loading[type] ? `Exporting ${title}...` : `Export ${title}`}
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            component="label"
            startIcon={loading[type] ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={loading[type]}
            sx={{
              borderColor: color,
              color: color,
              '&:hover': {
                borderColor: color,
                bgcolor: alpha(color, 0.05),
              },
              height: { xs: 40, sm: 48 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {loading[type] ? `Importing ${title}...` : `Import ${title}`}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => handleImport(type, e.target.files[0])}
              onClick={(e) => e.target.value = null}
            />
          </Button>
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      p: { xs: 1.5, sm: 2, md: 3 },
      fontFamily: '"Outfit", sans-serif',
    }}>
      
      
      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '1400px',
          mx: 'auto',
        }}
      >
        {/* CSV Operations Grid */}
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3 }}
          sx={{ 
            width: '100%',
            m: 0,
          }}
        >
          {sections.map(section => renderCSVSection(section))}
        </Grid>
      </Box>

      {/* Help Dialog */}
      <Dialog 
        open={openHelp} 
        onClose={() => setOpenHelp(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 2, sm: 3 },
            maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 48px)' }
          }
        }}
      >
        <DialogTitle>
          <StyledTypography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            CSV Format Requirements
          </StyledTypography>
          {selectedType && (
            <StyledTypography 
              variant="subtitle2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              For {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Data
            </StyledTypography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedType && (
            <>
              <StyledTypography 
                variant="body2" 
                paragraph
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Please ensure your CSV file follows these requirements:
              </StyledTypography>
              <List>
                {sections.find(s => s.type === selectedType)?.format.map((field, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {field.required ? <CheckCircleIcon color="success" /> : <InfoIcon color="action" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={field.field}
                      secondary={field.required ? 'Required' : 'Optional'}
                      primaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              <StyledTypography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Note: The first row of your CSV file should contain these column headers.
              </StyledTypography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenHelp(false)}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CSVOperations; 