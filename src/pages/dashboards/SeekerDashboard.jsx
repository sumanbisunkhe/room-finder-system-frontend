// src/pages/dashboards/SeekerDashboard.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// MUI v6 core imports
import {
  Box,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  CssBaseline,
  Container,
  Divider,
  Avatar,
  InputAdornment,
  ListItemButton,
  CircularProgress,
  Switch,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Card,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  ImageList,
  ImageListItem,
  Grid,
} from '@mui/material';

import {
  MoreVert as MoreVertIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  BackupTable as BackupIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';

import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LockIcon from '@mui/icons-material/Lock';
import PasswordIcon from '@mui/icons-material/Password';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';
// import ImageList from '@mui/material/ImageList';
// import ImageListItem from '@mui/material/ImageListItem';

import ChatIcon from '@mui/icons-material/Chat';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DoneIcon from '@mui/icons-material/Done';
import DomainIcon from '@mui/icons-material/Domain';

import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CancelIcon from '@mui/icons-material/Cancel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EventIcon from '@mui/icons-material/Event';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';



// MUI styles imports
import { createTheme, ThemeProvider, useTheme, styled, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Recharts imports
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  BarChart,
  Bar
} from 'recharts';


import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import * as userService from '../../services/userService';
import * as roomService from '../../services/roomService';
import * as bookingService from '../../services/bookingService';


import {
  sendMessage,
  markAsRead,
  deleteMessage,
  getRoomMessages,
  getConversation,
  getUnreadMessages,
  getDirectConversations
} from '../../services/messageService';






const transitionStyles = `
  .fade-enter {
    opacity: 0;
    transform: translateY(20px);
  }

  .fade-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 300ms, transform 300ms;
  }

  .fade-exit {
    opacity: 1;
    transform: translateY(0);
  }

  .fade-exit-active {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 300ms, transform 300ms;
  }
`;

// Inject the styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = transitionStyles;
document.head.appendChild(styleSheet);

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useRef(null);
  const stompClientRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('seekerThemeMode');
    return savedMode || 'light';
  });
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [selectedContactProperty, setSelectedContactProperty] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState(null);

  const [activeSection, setActiveSection] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedPropertyImages, setSelectedPropertyImages] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: '',
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: '',

  }

  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const swiperRef = useRef(null);

  // Booking related state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: '',
    specialRequests: ''
  });
  const [bookings, setBookings] = useState([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [propertyStats, setPropertyStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    unavailableProperties: 0,
    propertyTypeDistribution: {},
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
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


  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3,
  };
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: ['"Manrope", sans-serif', '"Space Grotesk", sans-serif'].join(','),
          h1: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2
          },
          h2: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.3
          },
          h3: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: 1.4
          },
          h4: {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            lineHeight: 1.4
          },
          body1: {
            fontFamily: '"Manrope", sans-serif',
            lineHeight: 1.75,
            fontSize: '1rem'
          },
          body2: {
            fontFamily: '"Manrope", sans-serif',
            lineHeight: 1.6,
            fontSize: '0.875rem'
          }
        },
        palette: {
          mode: mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode,
          primary: {
            main: mode === 'dark' ? '#3B82F6' : '#2563EB',
            light: mode === 'dark' ? '#60A5FA' : '#3B82F6',
            dark: mode === 'dark' ? '#1D4ED8' : '#1E40AF',
            contrastText: '#FFFFFF'
          },
          secondary: {
            main: mode === 'dark' ? '#FACC15' : '#EAB308',
            light: mode === 'dark' ? '#FDE047' : '#FACC15',
            dark: mode === 'dark' ? '#CA8A04' : '#A16207',
            contrastText: mode === 'dark' ? '#0F172A' : '#000000'
          },
          background: {
            default: mode === 'dark' ? '#0B1120' : '#FFFFFF',
            paper: mode === 'dark' ? '#1E293B' : '#F8FAFC',
            accent: mode === 'dark' ? '#2D3748' : '#EDF2F7'
          },
          text: {
            primary: mode === 'dark' ? '#F8FAFC' : '#1A202C',
            secondary: mode === 'dark' ? '#CBD5E1' : '#4A5568'
          },
          divider: mode === 'dark' ? '#2D3748' : '#E2E8F0',
          action: {
            hover: mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.04)',
            selected: mode === 'dark' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.08)',
            disabled: mode === 'dark' ? 'rgba(203, 213, 225, 0.3)' : 'rgba(74, 85, 104, 0.26)',
            focus: mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)'
          }
        },
        shape: {
          borderRadius: 16
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'dark'
                    ? '0 8px 24px rgba(59, 130, 246, 0.25)'
                    : '0 8px 24px rgba(37, 99, 235, 0.15)'
                },
                '&:active': {
                  transform: 'translateY(1px)'
                }
              },
              contained: {
                boxShadow: 'none',
                backgroundImage: mode === 'dark'
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                  : 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                '&:hover': {
                  backgroundImage: mode === 'dark'
                    ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                }
              },
              outlined: {
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  backgroundColor: mode === 'dark'
                    ? 'rgba(59, 130, 246, 0.08)'
                    : 'rgba(37, 99, 235, 0.04)'
                }
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '20px',
                boxShadow: mode === 'dark'
                  ? '0 4px 24px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px rgba(148, 163, 184, 0.08)',
                border: `1px solid ${mode === 'dark' ? '#2D3748' : '#E2E8F0'}`,
                backgroundImage: 'none',
                '&:hover': {
                  boxShadow: mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(148, 163, 184, 0.12)'
                }
              },
              elevation1: {
                boxShadow: mode === 'dark'
                  ? '0 2px 16px rgba(0, 0, 0, 0.25)'
                  : '0 2px 16px rgba(148, 163, 184, 0.06)'
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'dark'
                    ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                    : '0 12px 32px rgba(148, 163, 184, 0.12)'
                }
              }
            }
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                    borderWidth: '2px'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                    borderWidth: '2px',
                    boxShadow: mode === 'dark'
                      ? '0 0 0 4px rgba(59, 130, 246, 0.1)'
                      : '0 0 0 4px rgba(37, 99, 235, 0.1)'
                  }
                }
              }
            }
          }
        }
      }),
    [mode, prefersDarkMode]
  );

  const generateCityColors = (properties) => {
    const cities = [...new Set(properties.map(p => p.city))];
    const colors = [
      '#4F46E5', '#8B5CF6', '#10B981', '#EF4444',
      '#3B82F6', '#F59E0B', '#6366F1'
    ];

    return cities.reduce((acc, city, index) => {
      acc[city] = colors[index % colors.length];
      return acc;
    }, {});
  };
  const cityColors = useMemo(
    () => generateCityColors(properties),
    [properties]
  );

  const chartData = useMemo(() => {
    const processData = () => {
      const cityDistribution = properties.reduce((acc, property) => {
        acc[property.city] = (acc[property.city] || 0) + 1;
        return acc;
      }, {});

      const availabilityData = [
        { name: 'Available', value: propertyStats.availableProperties },
        { name: 'Occupied', value: propertyStats.unavailableProperties },
      ];

      const priceRanges = {
        '0-5k': 0, '5k-10k': 0, '10k-15k': 0,
        '15k-20k': 0, '20k-30k': 0, '30k+': 0
      };

      properties.forEach(({ price }) => {
        if (price <= 5000) priceRanges['0-5k']++;
        else if (price <= 10000) priceRanges['5k-10k']++;
        else if (price <= 15000) priceRanges['10k-15k']++;
        else if (price <= 20000) priceRanges['15k-20k']++;
        else if (price <= 30000) priceRanges['20k-30k']++;
        else priceRanges['30k+']++;
      });

      const today = new Date();
      const activityData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));

        // Get properties posted on this date
        const dailyProperties = properties.filter(property => {
          const propDate = new Date(property.postedDate);
          return (
            propDate.getFullYear() === date.getFullYear() &&
            propDate.getMonth() === date.getMonth() &&
            propDate.getDate() === date.getDate()
          );
        });

        // Calculate average price for the day
        const avgPrice = dailyProperties.length > 0
          ? dailyProperties.reduce((sum, p) => sum + p.price, 0) / dailyProperties.length
          : 0;

        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          newListings: dailyProperties.length,
          avgPrice: Math.round(avgPrice)
        };
      });

      return { cityDistribution, availabilityData, priceRanges, activityData };
    };

    return processData();
  }, [properties, propertyStats.availableProperties, propertyStats.unavailableProperties]);

  const CustomTooltip = ({ active, payload, label }) => {
    const theme = useTheme(); // Now properly imported
    return active && payload ? (
      <Paper sx={{
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[3]
      }}>
        <Typography variant="body2">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{ color: entry.color }}
          >
            {`${entry.name}: ${entry.value}`}
          </Typography>
        ))}
      </Paper>
    ) : null;
  };

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };




  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesContainerRef = useRef(null);



  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);

      const response = await userService.getCurrentUser();
      if (!response.success || !response.data) {
        throw new Error("Invalid user data format");
      }

      const userData = response.data; // Extract the actual user object
      console.log("Extracted User Data:", userData);
      if (!userData.id && userData._id) {
        userData.id = userData._id;
      }

      setCurrentUser(userData);
      setProfileForm({
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        role: userData.role || 'ADMIN'
      });
    } catch (err) {
      console.error("Fetch Current User Error:", err.message);
      setError(err.message);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchAndProcessProperties = useCallback(async () => {

    if (!currentUser?.id) {
      console.error('Cannot fetch properties without user ID');
      return;
    }
    try {
      setLoading(true);
      const fetchedProperties = await roomService.fetchAllRooms();

      const processedProperties = fetchedProperties.map((property) => ({
        id: property.id,
        landlordId: property.landlordId,
        title: property.title,
        description: property.description,
        price: property.price,
        address: property.address,
        city: property.city,
        size: property.size,
        postedDate: property.postedDate,
        available: property.available,
        images: property.images || [],
        // Convert amenity values from strings to booleans
        amenities: property.amenities
          ? Object.fromEntries(
            Object.entries(property.amenities).map(([key, value]) => [
              key,
              value === "true",
            ])
          )
          : {},
      }));

      // Calculate statistics based on actual availability data
      const stats = {
        totalProperties: processedProperties.length,
        availableProperties: processedProperties.filter(p => p.available).length,
        unavailableProperties: processedProperties.filter(p => !p.available).length,
        propertyTypeDistribution: processedProperties.reduce((acc, property) => {
          // Assuming property.type exists. Otherwise, remove or update this section.
          acc[property.type] = (acc[property.type] || 0) + 1;
          return acc;
        }, {}),
      };

      setProperties(processedProperties);
      setFilteredProperties(processedProperties);
      setPropertyStats(stats);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch properties';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Messages
  // Fetch conversations list with last messages and unread counts
  const fetchConversations = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingMessages(true);
      const conversationsData = await getDirectConversations();
      console.log('Raw conversations data from API:', conversationsData);

      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (convo) => {
          try {
            const otherUserId = convo.otherUserId;
            const otherUserResponse = await userService.getUserById(otherUserId);

            console.log('Other User Response :', otherUserResponse)

            // Access the nested data property from the API response
            const otherUserData = otherUserResponse.data;

            return {
              userId: otherUserId,
              otherUser: {
                id: otherUserData.id,
                name: otherUserData.fullName || otherUserData.username || 'Unknown User',
                avatar: otherUserData.avatar,
              },
              lastMessage: convo.lastMessage?.content || 'No messages yet',
              lastMessageAt: convo.lastMessage?.sentAt || '',
              unreadCount: convo.unreadCount,
            };
          } catch (error) {
            console.error('Error processing conversation:', error);
            return {
              userId: 'invalid',
              otherUser: {
                id: 'invalid',
                name: 'Unknown User',
                avatar: ''
              },
              lastMessage: 'Error loading conversation',
              lastMessageAt: '',
              unreadCount: 0
            };
          }
        })
      );

      console.log('Processed conversations:', conversationsWithDetails); // Debug

      // Filter out any null entries and sort
      const sorted = conversationsWithDetails
        .filter(conv => conv !== null)
        .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      setConversations(sorted);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load conversations: ' + error.message,
        severity: 'error',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUser?.id]);

  const fetchMessages = useCallback(async (userId) => {
    try {
      setLoadingMessages(true);
      const messages = await getConversation(userId);

      // Sort messages by date in ascending order (oldest first)
      const sortedMessages = messages.slice().sort((a, b) =>
        new Date(a.sentAt) - new Date(b.sentAt)
      );

      // Identify unread messages (received by current user)
      const unreadMessages = messages.filter(msg =>
        msg.receiverId === currentUser.id && !msg.isRead
      );

      if (unreadMessages.length > 0) {
        // Mark messages as read on the backend
        await Promise.all(unreadMessages.map(msg => markAsRead(msg.id)));

        // Update local messages state to mark them as read
        sortedMessages.forEach(msg => {
          if (msg.receiverId === currentUser.id && !msg.isRead) {
            msg.isRead = true;
          }
        });
      }

      setSelectedConversation(prev => ({
        ...prev,
        userId,
        messages: sortedMessages,
        otherUser: conversations.find(c => c.userId === userId)?.otherUser
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load messages';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [conversations, currentUser.id]);


  // Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const tempId = Date.now();
    const tempMessage = {
      tempId,
      content: newMessage,
      senderId: currentUser.id,
      receiverId: selectedConversation.userId,
      sentAt: new Date().toISOString(),
      isRead: false,
      status: 'sending'
    };

    // Optimistic update
    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage]
    }));
    setNewMessage('');

    try {
      const sent = sendMessageViaWebSocket({
        ...tempMessage,
        receiverId: selectedConversation.userId
      });

      if (!sent) {
        throw new Error('WebSocket connection not established');
      }
    } catch (error) {
      setSelectedConversation(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.tempId === tempId ? { ...msg, status: 'error' } : msg
        )
      }));
    }
  };


  // Add this filtering function
  const filteredConversations = useMemo(() => {
    if (!messageSearchTerm) return conversations;

    const searchLower = messageSearchTerm.toLowerCase();
    return conversations.filter(conv => {
      return (
        conv.otherUser.name.toLowerCase().includes(searchLower) ||
        conv.lastMessage.toLowerCase().includes(searchLower)
      );
    });
  }, [conversations, messageSearchTerm]);


  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);



  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/properties')) {
      setActiveSection('properties');
    } else if (path.includes('/bookings')) {
      setActiveSection('bookings');
    } else if (path.includes('/system-settings')) {
      setActiveSection('settings');
    } else if (path.includes('/profile-information')) {
      setActiveSection('profile');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchAndProcessProperties();
  }, [fetchAndProcessProperties]);


  useEffect(() => {
    if (currentUser?.id) {
      fetchConversations();
    }
  }, [currentUser?.id, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  useEffect(() => {
    const filtered = properties.filter((property) => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPrice = filters.maxPrice ? property.price <= parseFloat(filters.maxPrice) : true;
      const matchesSize = filters.minSize ? property.size >= parseFloat(filters.minSize) : true;

      // Fix the property.available reference
      const matchesAvailability = filters.availability === 'all' ? true :
        filters.availability === 'available' ? property.available : !property.available;

      return matchesSearch && matchesPrice && matchesSize && matchesAvailability;
    });

    setFilteredProperties(filtered);
  }, [properties, searchTerm, filters]);

  // useEffect(() => {
  //   if (currentUser?.id) {
  //     socket.current = io(import.meta.env.VITE_API_URL, {
  //       auth: {
  //         token: localStorage.getItem('token')
  //       }
  //     });

  //     const handleNewMessage = (newMessage) => {
  //       // Update conversations list
  //       setConversations(prev => updateConversations(prev, newMessage));

  //       // Update active conversation if applicable
  //       setSelectedConversation(prevConv => {
  //         if (!prevConv) return prevConv;

  //         const isPartOfConversation =
  //           prevConv.userId === newMessage.senderId ||
  //           prevConv.userId === newMessage.receiverId;

  //         if (isPartOfConversation) {
  //           // Replace temporary messages with server-generated ones
  //           const updatedMessages = prevConv.messages
  //             .filter(msg => msg.id !== newMessage.tempId) // Remove temp message
  //             .concat(newMessage) // Add server message
  //             .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

  //           return { ...prevConv, messages: updatedMessages };
  //         }
  //         return prevConv;
  //       });
  //     };

  //     socket.current.on('newMessage', handleNewMessage);

  //     return () => {
  //       socket.current?.off('newMessage', handleNewMessage);
  //       socket.current?.disconnect();
  //     };
  //   }
  // }, [currentUser?.id]);

  useEffect(() => {
    // const fetchBookings = async () => {
    //   if (currentUser?.id) {
    //     try {
    //       const bookings = await bookingService.getBookingsBySeeker(currentUser.id);
    //       setBookings(bookings);
    //     } catch (error) {
    //       setSnackbar({ open: true, message: 'Failed to load bookings', severity: 'error' });
    //     }
    //   }
    // };

    const fetchBookings = async () => {
      if (currentUser?.id) {
        try {
          const bookings = await bookingService.getBookingsBySeeker(currentUser.id);
          // Fetch room details for each booking
          const bookingsWithRooms = await Promise.all(
            bookings.map(async (booking) => {
              try {
                const room = await roomService.getRoomById(booking.roomId);
                return { ...booking, room };
              } catch (error) {
                console.error('Error fetching room details:', error);
                return booking; // Return booking without room details if fetch fails
              }
            })
          );
          setBookings(bookingsWithRooms);
        } catch (error) {
          setSnackbar({ open: true, message: 'Failed to load bookings', severity: 'error' });
        }
      }
    };
    fetchBookings();
  }, [currentUser?.id]);

  //book click handler
  const handleBookClick = (property) => {
    if (!currentUser || currentUser.role !== 'SEEKER') {
      navigate('/login');
      return;
    }

    // Initialize form with property's roomId
    setSelectedBooking({ roomId: property.id });
    setBookingForm({
      startDate: '',
      endDate: '',
      specialRequests: ''
    });
    setShowBookingDialog(true);
  };




  const handleContactLandlord = async (property) => {
    try {
      await userService.sendMessage({
        receiverId: property.landlordId,
        content: contactMessage
      });
      setSnackbar({ open: true, message: 'Message sent to landlord', severity: 'success' });
      setContactDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to send message',
        severity: 'error'
      });
    }
  };
  const handlePhoneClick = (property) => {
    if (!property.landlord?.phoneNumber) {
      setSnackbar({
        open: true,
        message: 'Landlord phone number not available',
        severity: 'warning'
      });
      return;
    }
    setSelectedLandlord(property.landlord);
    setPhoneDialogOpen(true);
  };

  const handleCallLandlord = () => {
    window.location.href = `tel:${selectedLandlord.phoneNumber}`;
  };
  // Update booking lookup
  const getPropertyBooking = (roomId) => {
    return bookings.find(b => b.roomId === roomId);  // Changed from property.id
  };

  // booking creation
  const handleCreateBooking = async () => {
    try {
      const bookingRequest = {
        roomId: selectedBooking.roomId,  // Changed from propertyId
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        comments: bookingForm.specialRequests  // Map to backend's 'comments'
      };

      const response = await bookingService.createBooking(bookingRequest);
      setBookings([...bookings, response]);
      setShowBookingDialog(false);
      setSnackbar({ open: true, message: 'Booking request sent successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to create booking', severity: 'error' });
    }
  };

  const handleUpdateBooking = async () => {
    try {
      const updatedBooking = await bookingService.updateBooking(
        selectedBooking.id,
        {
          roomId: selectedBooking.roomId,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
          comments: bookingForm.specialRequests
        }
      );
      setBookings(bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      setShowBookingDialog(false);
      setSnackbar({ open: true, message: 'Booking updated successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to update booking', severity: 'error' });
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancelBooking(selectedBooking.id);
      setBookings(bookings.filter(b => b.id !== selectedBooking.id));
      setIsCancelDialogOpen(false);
      setSnackbar({ open: true, message: 'Booking cancelled successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to cancel booking', severity: 'error' });
    }
  };

  // Update status chip to match backend enum values
  const BookingStatusChip = ({ status }) => {
    const statusColors = {
      PENDING: { bg: '#ffd700', color: '#000' },
      APPROVED: { bg: '#4CAF50', color: '#fff' },
      REJECTED: { bg: '#f44336', color: '#fff' },
      CANCELLED: { bg: '#9e9e9e', color: '#fff' }
    };

    return (
      <Chip
        label={status}
        sx={{
          backgroundColor: statusColors[status]?.bg || '#ccc',
          color: statusColors[status]?.color || '#000',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const updateConversations = (prevConversations, newMessage) => {
    return prevConversations.map(conv => {
      if (conv.userId === newMessage.senderId ||
        conv.userId === newMessage.receiverId) {
        return {
          ...conv,
          lastMessage: newMessage.content,
          lastMessageAt: newMessage.sentAt,
          unreadCount: conv.userId === newMessage.senderId &&
            newMessage.receiverId === currentUser.id ?
            conv.unreadCount + 1 : conv.unreadCount
        };
      }
      return conv;
    }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  };


  const handleCreateProperty = async () => {
    // Parse numeric values
    const price = Number(propertyForm.price);
    const size = Number(propertyForm.size);

    // Frontend validation
    if (!propertyForm.title ||
      isNaN(price) || price <= 0 ||
      isNaN(size) || size <= 0 ||
      !propertyForm.address ||
      !propertyForm.city
    ) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields with valid values',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);

      // Extract File objects from the images array
      const imageFiles = propertyForm.images.map(img => img.file);

      const newProperty = {
        title: propertyForm.title,
        description: propertyForm.description,
        price: propertyForm.price,
        address: propertyForm.address,
        city: propertyForm.city,
        size: propertyForm.size,
        images: imageFiles,
        amenities: propertyForm.amenities,
        available: propertyForm.available,
      };

      await roomService.createRoom(newProperty, currentUser.id);
      await fetchAndProcessProperties();

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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create property';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProperty = async () => {
    if (!selectedProperty) {
      setSnackbar({
        open: true,
        message: 'No property selected for update',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);

      // // Filter out existing images (strings) and extract new Files
      // const newImageFiles = propertyForm.images
      //   .filter(img => typeof img !== 'string')
      //   .map(img => img.file);

      const updateData = {
        title: propertyForm.title,
        description: propertyForm.description,
        price: propertyForm.price,
        address: propertyForm.address,
        city: propertyForm.city,
        size: propertyForm.size,
        images: propertyForm.images,
        amenities: propertyForm.amenities,
        available: propertyForm.available,
      };

      await roomService.updateRoom(selectedProperty.id, updateData, currentUser.id);
      await fetchAndProcessProperties();

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
        images: [],  // Reset images array
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
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update property';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAction = async (propertyId, action) => {
    if (!propertyId) {
      setSnackbar({
        open: true,
        message: 'Invalid property ID',
        severity: 'error',
      });
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm('Are you sure you want to delete this property? This action cannot be undone.');
      if (!confirmed) return;
    }

    try {
      setLoading(true);

      let response;
      let successMessage;

      switch (action) {
        case 'deactivate':
          response = await roomService.toggleAvailability(propertyId, currentUser.id);
          successMessage = 'Property is now unavailable for booking.';
          break;
        case 'activate':
          response = await roomService.toggleAvailability(propertyId, currentUser.id);
          successMessage = 'Property is now available for booking.';
          break;
        case 'delete':
          response = await roomService.deleteRoom(propertyId, currentUser.id);
          successMessage = 'Property deleted successfully';
          break;
        default:
          throw new Error('Invalid action');
      }

      await fetchAndProcessProperties();

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success',
      });

    } catch (error) {
      const errorMessage = error.message || `Failed to ${action} property`;

      if (error.response?.status === 404) {
        setSnackbar({
          open: true,
          message: 'Property not found',
          severity: 'error',
        });
      } else if (error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to perform this action',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await userService.updateUserProfile(currentUser.id, profileForm);
      await fetchCurrentUser();
      setIsEditModalOpen(false);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to update profile",
        severity: "error"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };




  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('seekerThemeMode', newMode);
      return newMode;
    });
  };

  const menuItems = [
    { section: 'properties', icon: <HomeIcon />, label: 'Browse Property' },
    { section: 'bookings', icon: <EventIcon />, label: 'Bookings' },
    { section: 'analytics', icon: <DashboardIcon />, label: 'Property Analytics' },
    // { section: 'messages', icon: <ChatIcon />, label: 'Messages' },
    { section: 'settings', icon: <SettingsIcon />, label: 'System Settings' },
    { section: 'profile', icon: <AccountCircleIcon />, label: 'Profile Information' }
  ];

  const activeSectionTitles = {
    properties: 'Browse Property',
    bookings: 'Bookings',
    analytics: 'Property Analytics',
    messages: 'Messages',
    settings: 'System Settings',
    profile: 'Profile Information',
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
  }));

  const TypeBadge = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    textTransform: 'capitalize',
    borderRadius: '6px',
    '&.APARTMENT': { backgroundColor: alpha('#3B82F6', 0.1), color: '#3B82F6' },
    '&.HOUSE': { backgroundColor: alpha('#10B981', 0.1), color: '#10B981' },
    '&.CONDO': { backgroundColor: alpha('#8B5CF6', 0.1), color: '#8B5CF6' },
  }));

  const getNewPropertiesCountByDate = (properties, targetDate) => {
    return properties.filter(property => {
      const propDate = new Date(property.createdAt);
      return (
        propDate.getFullYear() === targetDate.getFullYear() &&
        propDate.getMonth() === targetDate.getMonth() &&
        propDate.getDate() === targetDate.getDate()
      );
    }).length;
  };

  const activityData = useMemo(() => {
    const dates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const newPropertiesCount = getNewPropertiesCountByDate(properties, date);
      const availablePropertiesCount = Math.floor(
        propertyStats.availableProperties * (0.85 + (Math.sin(i / 2) * 0.15))
      );

      dates.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        'Available Properties': availablePropertiesCount,
        'New Properties': newPropertiesCount
      });
    }
    return dates;
  }, [properties, propertyStats.availableProperties]);

  const StatCard = ({ title, value, icon, color }) => (
    <Paper sx={{
      p: 3,
      background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
      color: 'white',
      height: '100%',
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: alpha('#fff', 0.1),
          p: 1.5,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 32 } })}
        </Box>
      </Stack>
    </Paper>
  );

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Paper>
      </Container>
    );
  }


  const renderViewProperty = () => (
    <Container maxWidth="xl" sx={{ pt: 2 }}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            background: (theme) =>
              `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 1)}, ${alpha(theme.palette.background.paper, 1)})`,
            backdropFilter: 'blur(24px)',
            borderRadius: '2px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.05)}`,
            // position: 'sticky',
            // top: { xs: '100px', md: 0 },
            zIndex: 1200,
            mx: { md: 3 },
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: (theme) => `0 12px 48px ${alpha(theme.palette.primary.main, 0.1)}`
            }
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Search Field */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{
                        color: 'text.secondary',
                        transition: 'color 0.3s ease'
                      }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light'
                      }
                    },
                    '&.Mui-focused': {
                      bgcolor: 'background.default',
                      boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                    }
                  }
                }}
              />
            </Grid>

            {/* Price Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Max Price"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOnIcon sx={{
                        color: 'text.secondary',
                        fontSize: '1.1rem',
                        transition: 'color 0.3s ease'
                      }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      '-webkit-appearance': 'none'
                    }
                  }
                }}
              />
            </Grid>

            {/* Size Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Min Size"
                value={filters.minSize}
                onChange={(e) => setFilters({ ...filters, minSize: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}>
                        ft²
                      </Box>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      '-webkit-appearance': 'none'
                    }
                  }
                }}
              />
            </Grid>

            {/* Availability Filter */}
            <Grid item xs={12} sm={12} md={4}>
              <FormControl fullWidth>
                <Select
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Availability' }}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.5
                    }
                  }}
                >
                  <MenuItem value="all">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AllInclusiveIcon fontSize="small" />
                      All Properties
                    </Box>
                  </MenuItem>
                  <MenuItem value="available">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                      Available Only
                    </Box>
                  </MenuItem>
                  <MenuItem value="unavailable">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LockIcon fontSize="small" color="action" />
                      Unavailable
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>


        {/* Desktop View */}
        {/* Property Cards Grid */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>

          <Grid container spacing={4} sx={{ py: 4 }}>
            {filteredProperties.map((property) => {
              const existingBooking = getPropertyBooking(property.id);

              return (
                <Grid item xs={12} sm={6} md={4} key={property.id}>
                  <Paper sx={{
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}>
                    {/* Image Section */}
                    <Box sx={{
                      height: 280,
                      position: 'relative',
                      bgcolor: 'background.default',
                      overflow: 'hidden'
                    }}>
                      <Swiper
                        modules={[Pagination]}
                        pagination={{
                          clickable: true,
                          renderBullet: (index, className) => `
                  <span class="${className}" 
                    style="
                      background: ${theme.palette.primary.main};
                      width: 10px;
                      height: 10px;
                      margin: 0 4px;
                      opacity: 0.5;
                      transition: opacity 0.3s ease;
                    ">
                  </span>
                `
                        }}
                        style={{
                          '--swiper-navigation-color': theme.palette.common.white,
                          '--swiper-pagination-color': theme.palette.primary.main,
                          height: '100%'
                        }}
                      >
                        {property.images?.map((image, index) => (
                          <SwiperSlide
                            key={index}
                            onClick={() => {
                              setSelectedPropertyImages(property.images);
                              setCurrentImageIndex(index);
                              setIsImageModalOpen(true);
                            }}
                          >
                            <img
                              src={`${import.meta.env.VITE_API_URL}/uploads/${image}`}
                              alt={property.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>

                      {/* Top Badges */}
                      <Box sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        right: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        zIndex: 2
                      }}>
                        <Chip
                          label={property.available ? 'Available' : 'Occupied'}
                          size="small"
                          sx={{
                            bgcolor: property.available ? 'success.main' : 'error.main',
                            color: 'common.white',
                            fontWeight: 700,
                            px: 1,
                            height: 28
                          }}
                        />
                        <Chip
                          icon={<SquareFootIcon />}
                          label={`${property.size} sqft`}
                          size="small"
                          sx={{
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            fontWeight: 600,
                            px: 1.5,
                            height: 28
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Content Section */}
                    <Box sx={{
                      p: 3,
                      bgcolor: 'background.paper',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Title & Location */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{
                          fontWeight: 800,
                          lineHeight: 1.3,
                          mb: 1,
                          color: 'text.primary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: 18
                        }}>
                          {property.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationCityIcon fontSize="small" color="primary" />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            {property.city}, {property.address}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Price & Details */}
                      <Box sx={{
                        mt: 'auto',
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`
                      }}>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Typography variant="h5" color="primary" sx={{ fontWeight: 800, fontSize: 14 }}>
                            Rs. {property.price.toLocaleString()}
                            <Typography component="span" variant="body2" color="text.secondary">
                              /month
                            </Typography>
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handlePhoneClick(property)}
                              sx={{
                                bgcolor: 'primary.light',
                                '&:hover': { bgcolor: 'primary.main' }
                              }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedContactProperty(property)
                                setContactDialogOpen(true)
                              }}
                              sx={{
                                bgcolor: 'secondary.light',
                                '&:hover': { bgcolor: 'secondary.main' }
                              }}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Amenities */}
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          mb: 2,

                        }}>
                          {Object.entries(property.amenities || {})
                            .filter(([_, value]) => value)
                            .map(([amenity]) => (
                              <Chip
                                key={amenity}
                                label={amenity}
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  bgcolor: 'action.hover',
                                  fontWeight: 500,
                                  fontSize: 12,
                                  textTransform: 'capitalize'
                                }}
                              />
                            ))}
                        </Box>

                        {/* Action Button */}
                        <Button
  fullWidth
  variant={existingBooking && existingBooking.status !== 'CANCELLED' ? "outlined" : "contained"}
  startIcon={existingBooking && existingBooking.status !== 'CANCELLED' ? <EditNoteIcon /> : <EventAvailableIcon />}
  onClick={() => {
    existingBooking && existingBooking.status !== 'CANCELLED'
      ? setSelectedBooking(existingBooking)
      : handleBookClick(property)
    setShowBookingDialog(true)
  }}
  disabled={!property.available || (existingBooking && existingBooking.status !== 'CANCELLED')}
  sx={{
    height: 48,
    borderRadius: 2,
    fontWeight: 700,
    ...(existingBooking && existingBooking.status !== 'CANCELLED' && {
      borderWidth: 2,
      '&:hover': { borderWidth: 2 }
    })
  }}
>
  {existingBooking && existingBooking.status !== 'CANCELLED' ? 'Manage Booking' : 'Book Now'}
</Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
        {/* Mobile View */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Grid container spacing={2}>
            {filteredProperties.map((property) => (
              <Grid item xs={12} key={property.id}>
                <Paper sx={{
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}>
                  {/* Image Gallery */}
                  <Box sx={{
                    height: 180,
                    bgcolor: 'background.default',
                    position: 'relative'
                  }}>
                    {property.images?.[0] ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/${property.images[0]}`}
                        alt={property.title}
                        style={{
                          width: '100%',
                          height: 180,
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
                  </Box>

                  {/* Property Details */}
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {property.title}
                        </Typography>
                        <Chip
                          label={property.available ? 'Available' : 'Occupied'}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: property.available
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.error.main, 0.1),
                            color: property.available
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                          }}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                        <Typography variant="body2">
                          Rs. {property.price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          {property.size} sq.ft
                        </Typography>
                      </Stack>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {property.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {property.city}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {Object.entries(property.amenities || {})
                          .filter(([_, value]) => value)
                          .map(([amenity]) => (
                            <Chip
                              key={amenity}
                              label={amenity}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                m: 0.2
                              }}
                            />
                          ))}
                      </Stack>




                      <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Posted on: {new Date(property.postedDate).toLocaleDateString()}
                        </Typography>
                        {/* Mobile View Actions */}
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                          mt: 1
                        }}>
                          {!getPropertyBooking(property.id) && (
                            /* Book Property */
                            <IconButton
                              color="primary"
                              onClick={() => handleBookClick(property)}
                              disabled={!property.available}
                            >
                              <EventAvailableIcon />
                            </IconButton>
                          )}

                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedContactProperty(property);
                              setContactDialogOpen(true);
                            }}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => handlePhoneClick(property)}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>

                          {getPropertyBooking(property.id) && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBooking(getPropertyBooking(property.id));
                                setBookingForm({
                                  startDate: selectedBooking.startDate,
                                  endDate: selectedBooking.endDate,
                                  specialRequests: selectedBooking.specialRequests
                                });
                                setShowBookingDialog(true);
                              }}
                            >
                              <EditNoteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );

  const renderBookings = () => (
    <Container maxWidth="xl" sx={{ pt: 2 }}>
      <Stack spacing={3}>
        {/* Desktop View */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Monthly Price</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Booking Cost</TableCell>
                    <TableCell align='center' >Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => {
                    const startDate = new Date(booking.startDate);
                    const endDate = new Date(booking.endDate);
                    const months = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));
                    const monthlyPrice = booking.room?.price || 0;
                    const totalPrice = months * monthlyPrice;
                    const bookingCost = monthlyPrice * 1.05;
                    const property = properties.find(p => p.id === booking.roomId);

                    return (
                      <StyledTableRow key={booking.id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              variant="rounded"
                              src={property?.images?.[0] ?
                                `${import.meta.env.VITE_API_URL}/uploads/${property.images[0]}` :
                                undefined}
                              sx={{ width: 56, height: 56 }}
                            >
                              {!property?.images?.length && <HomeIcon />}
                            </Avatar>
                            <Typography variant="subtitle1">
                              {property?.title || 'Unknown Property'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                        </TableCell>
                        <TableCell>
                          <BookingStatusChip status={booking.status} />
                        </TableCell>
                        <TableCell>
                          {booking.room?.price ?
                            `Rs. ${monthlyPrice.toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {booking.room?.price ?
                            `Rs. ${totalPrice.toLocaleString()} (${months} month${months > 1 ? 's' : ''})` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {booking.room?.price ? (
                            <>
                              Rs. {bookingCost.toLocaleString()}
                              <Typography variant="caption" display="block" color="text.secondary">
                                (1 month advance + 5% commission)
                              </Typography>
                            </>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="column" >
                            <Button
                              variant="text"
                              size="medium"
                              startIcon={<EditCalendarIcon />}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setBookingForm({
                                  startDate: booking.startDate.split('T')[0],
                                  endDate: booking.endDate.split('T')[0],
                                  specialRequests: booking.comments
                                });
                                setShowBookingDialog(true);
                              }}
                              disabled={booking.status !== 'PENDING'}
                            >

                            </Button>
                            <Button
                              variant="text"
                              color="error"
                              size="medium"
                              startIcon={<CancelIcon />}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsCancelDialogOpen(true);
                              }}
                              disabled={!['PENDING', 'APPROVED'].includes(booking.status)}
                            >

                            </Button>
                          </Stack>
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* Mobile View */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Grid container spacing={2}>
            {bookings.map((booking) => {
              const startDate = new Date(booking.startDate);
              const endDate = new Date(booking.endDate);
              const months = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));
              const monthlyPrice = booking.room?.price || 0;
              const totalPrice = months * monthlyPrice;
              const bookingCost = monthlyPrice * 1.05;
              const property = properties.find(p => p.id === booking.roomId);

              return (
                <Grid item xs={12} key={booking.id}>
                  <Paper sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}>
                    <Box sx={{
                      height: 180,
                      bgcolor: 'background.default',
                      position: 'relative'
                    }}>
                      {property?.images?.[0] ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/${property.images[0]}`}
                          alt={property.title}
                          style={{
                            width: '100%',
                            height: 180,
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
                    </Box>

                    <Box sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {property?.title || 'Unknown Property'}
                          </Typography>
                          <BookingStatusChip status={booking.status} />
                        </Stack>

                        <Typography variant="body2">
                          {`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                        </Typography>

                        <Typography variant="body2">
                          Monthly Price: {booking.room?.price ?
                            `Rs. ${monthlyPrice.toLocaleString()}` : 'N/A'}
                        </Typography>

                        <Typography variant="body2">
                          Total Price: {booking.room?.price ?
                            `Rs. ${totalPrice.toLocaleString()} (${months} month${months > 1 ? 's' : ''})` : 'N/A'}
                        </Typography>

                        <Typography variant="body2">
                          Booking Cost: {booking.room?.price ?
                            `Rs. ${bookingCost.toLocaleString()}` : 'N/A'}
                          <Typography variant="caption" display="block" color="text.secondary">
                            (Includes 1 month advance + 5% commission)
                          </Typography>
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<EditCalendarIcon />}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setBookingForm({
                                startDate: booking.startDate.split('T')[0],
                                endDate: booking.endDate.split('T')[0],
                                specialRequests: booking.comments
                              });
                              setShowBookingDialog(true);
                            }}
                            disabled={booking.status !== 'PENDING'}
                          >

                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsCancelDialogOpen(true);
                            }}
                            disabled={!['PENDING', 'APPROVED'].includes(booking.status)}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No bookings found
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/dashboard/seeker/browse-property')}
            >
              Browse Properties
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              💰 Price Breakdown
            </Typography>
            <List sx={{ pl: 2 }}>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Typography variant="body2">📅</Typography>
                </ListItemIcon>
                <ListItemText primary="Monthly Price" secondary="Base rental rate per month" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Typography variant="body2">🧮</Typography>
                </ListItemIcon>
                <ListItemText
                  primary="Total Price"
                  secondary="Calculated as Monthly Price × Number of months (rounded up)"
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Typography variant="body2">💵</Typography>
                </ListItemIcon>
                <ListItemText
                  primary="Booking Cost"
                  secondary="Includes 1 month's rent (advance) + 5% service fee"
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Typography variant="body2">🔻</Typography>
                </ListItemIcon>
                <ListItemText
                  primary="Advance Deduction"
                  secondary="Advance amount is deducted from the total price"
                />
              </ListItem>
            </List>
          </Paper>

        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)}>
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCancelDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelBooking}
            >
              Confirm Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
  const renderPropertyAnalytics = () => (
    <Container maxWidth="xl" sx={{ py: 3 }}>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={propertyStats.totalProperties}
            icon={<DomainIcon />}
            color="#4F46E5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available"
            value={propertyStats.availableProperties}
            icon={<CheckCircleIcon />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupied"
            value={propertyStats.unavailableProperties}
            icon={<BlockIcon />}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Price"
            value={Math.round(properties.reduce((sum, p) => sum + p.price, 0) / (properties.length || 1))}
            icon={<AssessmentIcon />}
            color="#8B5CF6"
          />
        </Grid>

        {/* City Distribution */}
        <Grid item xs={12} md={12}>
          <Paper sx={{
            p: 3,
            height: 400,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${theme.palette.background.paper})`
          }}>
            <Typography variant="h6" gutterBottom sx={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <LocationCityIcon color="primary" />
              Distribution by City
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={Object.entries(chartData.cityDistribution).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={renderPieLabel}
                  labelLine={false}
                >
                  {Object.keys(chartData.cityDistribution).map((city) => (
                    <Cell
                      key={city}
                      fill={cityColors[city] || theme.palette.primary.main}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ paddingLeft: 24 }}
                  formatter={(value) => <Typography variant="caption">{value}</Typography>}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Price Distribution */}
        <Grid item xs={12} md={12}>
          <Paper sx={{
            p: 3,
            height: 550,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'relative'
          }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              {/* Header */}
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.primary'
                }}>
                  <MonetizationOnIcon fontSize="medium" color="primary" />
                  Price Distribution Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 5 }}>
                  Distribution of properties across different price ranges (in Rs)
                </Typography>
              </Box>

              {/* Chart Container */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(chartData.priceRanges).map(([name, value]) => ({
                      range: name.replace(/(\d+k)/g, ' $1').replace('+', '+'),
                      count: value
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                  >
                    {/* Grid & Axes */}
                    <CartesianGrid
                      stroke={theme.palette.divider}
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="range"
                      angle={-45}
                      textAnchor="end"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12
                      }}
                      tickMargin={10}
                      interval={0}
                    />

                    <YAxis
                      tickFormatter={(value) => new Intl.NumberFormat('en-IN').format(value)}
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12
                      }}
                      label={{
                        value: 'Number of Properties',
                        angle: -90,
                        position: 'left', // Changed from 'insideLeft'
                        offset: 10, // Increased from -15
                        fill: theme.palette.text.primary,
                        style: {
                          fontSize: 13,
                          textAnchor: 'middle', // Ensure proper vertical centering
                          dominantBaseline: 'central' // Better vertical alignment
                        }
                      }}
                    />

                    {/* Interactive Tooltip */}
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        fill: theme.palette.action.selected,
                        stroke: theme.palette.divider,
                        strokeWidth: 1
                      }}
                    />

                    {/* Bars with Data Labels */}
                    <Bar
                      dataKey="count"
                      name="Properties"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    >
                      {Object.entries(chartData.priceRanges).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          style={{ transition: 'all 0.2s ease' }}
                        />
                      ))}

                      {/* Data Labels */}
                      <LabelList
                        dataKey="count"
                        position="top"
                        formatter={(value) => new Intl.NumberFormat('en-IN').format(value)}
                        style={{
                          fill: theme.palette.text.primary,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      />
                    </Bar>


                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Legend Footer */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1,
                bgcolor: 'action.hover',
                borderRadius: 2,
                textAlign: 'left'
              }}>
                <Typography variant="caption" sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      color: 'primary.main',
                      '& svg': {
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <InfoIcon />
                  </Box>
                  Each bar represents price range distribution
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Total Properties: {new Intl.NumberFormat('en-IN').format(properties.length)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12}>
          <Paper sx={{
            p: 3,
            height: 500,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
            border: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 120,
              height: 120,
              background: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '50%'
            }
          }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {/* Header */}
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.primary'
                }}>
                  <ShowChartIcon fontSize="medium" color="primary" />
                  Weekly Activity Trends
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  New property listings and average prices over the last 7 days
                </Typography>
              </Box>

              {/* Chart */}
              <Box sx={{ flex: 1, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.activityData}>
                    <defs>
                      <linearGradient id="newListings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="avgPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke={theme.palette.divider}
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12
                      }}
                      tickLine={{ stroke: theme.palette.divider }}
                    />

                    <YAxis
                      yAxisId="left"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12
                      }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{
                        fill: theme.palette.text.secondary,
                        fontSize: 12
                      }}
                      tickFormatter={(value) => `Rs ${value.toLocaleString('en-IN')}`}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload) {
                          return (
                            <Paper sx={{
                              p: 1.5,
                              border: `1px solid ${theme.palette.divider}`,
                              bgcolor: 'background.paper',
                              boxShadow: theme.shadows[3]
                            }}>
                              <Typography variant="body2" fontWeight={500} mb={1}>
                                {payload[0]?.payload.date}
                              </Typography>
                              <Stack spacing={0.5}>
                                {payload.map((entry, index) => (
                                  <Box key={index} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}>
                                    <Box sx={{
                                      width: 10,
                                      height: 10,
                                      bgcolor: entry.color,
                                      borderRadius: '2px'
                                    }} />
                                    <Typography variant="caption">
                                      {entry.name}:{' '}
                                      {entry.dataKey === 'avgPrice'
                                        ? `Rs ${entry.value.toLocaleString('en-IN')}`
                                        : entry.value.toLocaleString()}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </Paper>
                          );
                        }
                        return null;
                      }}
                    />

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="newListings"
                      name="New Listings"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      fill="url(#newListings)"
                      fillOpacity={1}
                    />

                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgPrice"
                      name="Average Price"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      fill="url(#avgPrice)"
                      fillOpacity={1}
                    />

                    <Legend
                      verticalAlign="top"
                      height={40}
                      formatter={(value) => (
                        <Typography variant="caption" sx={{ color: 'text.primary' }}>
                          {value}
                        </Typography>
                      )}
                      wrapperStyle={{
                        paddingBottom: 10,
                        paddingTop: 5
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>

              {/* Summary Footer */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1,
                bgcolor: 'action.hover',
                borderRadius: 2
              }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: '2px',
                      mr: 1
                    }}
                  />
                  {`New Listings: ${chartData.activityData.reduce((sum, day) => sum + day.newListings, 0).toLocaleString()}`}
                </Typography>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: theme.palette.secondary.main,
                      borderRadius: '2px',
                      mr: 1
                    }}
                  />
                  {`Avg Price: Rs ${(
                    chartData.activityData.reduce((sum, day) => sum + (day.newListings * day.avgPrice), 0) /
                    (chartData.activityData.reduce((sum, day) => sum + day.newListings, 0) || 1)
                  ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  const renderMessages = () => (
    <Container maxWidth={false} sx={{
      py: { xs: 1, md: 2 },
      px: { xs: 1, md: 2 },
      height: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
      maxWidth: '100%',
    }}>
      <Grid container spacing={2} sx={{
        height: '100%',
        flexWrap: { xs: 'nowrap', md: 'nowrap' },
        overflow: 'hidden',



      }}>
        {/* Conversations List - Fixed width */}
        <Grid item xs={12} md={3} lg={3} xl={2} sx={{
          height: '100%',
          display: { xs: selectedConversation ? 'none' : 'block', md: 'block' },
          overflow: 'hidden',
          width: { md: '250px' },
          flexShrink: 0,
          flexGrow: 0
        }}>
          <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, md: '16px' },
            border: { md: `1px solid ${theme.palette.divider}` },
            boxShadow: { md: theme.shadows[3] },
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}>
            {/* Search Header */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search conversations..."
                value={messageSearchTerm}
                onChange={(e) => setMessageSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  sx: { borderRadius: '12px', bgcolor: 'background.paper' }
                }}
              />
            </Box>

            {/* Conversations List */}
            <List sx={{
              flex: 1,
              overflow: 'auto',
              p: 0,
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '4px'
              }
            }}>
              {filteredConversations.map((conv) => {
                const messageDate = new Date(conv.lastMessageAt);
                // Format date as "Feb 21, 2025"
                const formattedDate = messageDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                // Format time as "12:30 PM"
                const formattedTime = messageDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });

                // Get day of week
                const dayOfWeek = messageDate.toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <ListItemButton
                    key={conv.userId}
                    selected={selectedConversation?.userId === conv.userId}
                    onClick={() => fetchMessages(conv.userId)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <Avatar
                      src={conv.otherUser.avatar}
                      sx={{
                        mr: 2,
                        width: 44,
                        height: 44,
                        bgcolor: alpha(theme.palette.primary.main, 0.7),
                        fontSize: '1.1rem',
                        flexShrink: 0
                      }}
                    >
                      {conv.otherUser?.name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{
                      flex: '1 1 auto',
                      overflow: 'hidden',
                      minWidth: 0 // Important for proper text truncation
                    }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          width: '100%'
                        }}
                      >
                        {conv.otherUser?.name || 'Unknown User'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {conv.lastMessage}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        mt: 0.5
                      }}>
                        {formattedDate}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      ml: 1,
                      minWidth: '30px',
                      flexShrink: 0
                    }}>
                      {conv.unreadCount > 0 && (
                        <Chip
                          label={conv.unreadCount}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            minWidth: '20px',
                            py: 0
                          }}
                        />
                      )}
                    </Box>
                  </ListItemButton>
                )
              }
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Window - Takes remaining space */}
        <Grid item xs sx={{
          height: '100%',
          display: { xs: selectedConversation ? 'block' : 'none', md: 'block' },
          pl: { md: '0!important' },
          overflow: 'hidden',
          flex: '1 1 auto',
          width: { md: '650px' },
          position: 'relative'
        }}>
          <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, md: '16px' },
            border: { md: `1px solid ${theme.palette.divider}` },
            boxShadow: { md: theme.shadows[3] },
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.default'
                }}>
                  <IconButton
                    onClick={() => setSelectedConversation(null)}
                    sx={{
                      display: { md: 'none' },
                      mr: 1,
                      color: 'text.primary'
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <Avatar
                    src={selectedConversation.otherUser.avatar}
                    sx={{
                      mr: 2,
                      width: 44,
                      height: 44,
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }

                    }}
                  >
                    {selectedConversation.otherUser.name}
                  </Typography>
                </Box>

                {/* Messages Container */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    textAlign: 'left',
                    p: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0.7)}, ${alpha(theme.palette.background.default, 0.4)})`,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: '4px',
                    },
                  }}
                >
                  {selectedConversation.messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser.id;
                    const messageDate = new Date(message.sentAt);
                    const formattedDate = messageDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const formattedTime = messageDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <React.Fragment key={message.id || message.tempId}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            mb: 2,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: { xs: '85%', sm: '80%', md: '75%' },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1.5,
                                borderRadius: '16px',
                                borderTopRightRadius: isCurrentUser ? '4px' : '16px',
                                borderTopLeftRadius: isCurrentUser ? '16px' : '4px',
                                bgcolor: isCurrentUser ? theme.palette.primary.main : 'background.paper',
                                color: isCurrentUser ? 'white' : 'text.primary',
                                position: 'relative',
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  wordBreak: 'break-word',
                                  lineHeight: 1.4,
                                  fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' }
                                }}
                              >
                                {message.content}
                              </Typography>
                            </Paper>

                            {/* Read/Unread Icon Indicator for messages sent by current user */}
                            {isCurrentUser && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                {message.status === 'sending' ? (
                                  <CircularProgress size={12} />
                                ) : message.status === 'error' ? (
                                  <Typography variant="caption" color="error">
                                    Failed
                                  </Typography>
                                ) : message.isRead ? (
                                  <DoneAllIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                                ) : (
                                  <DoneIcon fontSize="small" sx={{ color: '#C0C0C0' }} />
                                )}
                              </Box>
                            )}

                            {/* Timestamp */}
                            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', mr: 1 }}>
                                {formattedDate}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                {formattedTime}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </React.Fragment>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box sx={{
                  p: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 2
                }}>
                  <Grid container spacing={1.5} alignItems="flex-end">
                    <Grid item xs>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        multiline
                        maxRows={4}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                            bgcolor: 'background.default',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'background.default'
                            },
                            '& .MuiOutlinedInput-input': {
                              py: 1.5,
                              px: 2
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs="auto">
                      <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        sx={{
                          minWidth: '80px',
                          height: '48px',
                          borderRadius: '24px',
                          bgcolor: 'primary.main',
                          boxShadow: theme.shadows[2],
                          '&:hover': {
                            bgcolor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]

                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.background.default, 0.5),
                textAlign: 'center',
                p: 3
              }}>
                <Box sx={{
                  maxWidth: 400,
                  px: 3,
                  py: 5,
                  borderRadius: '16px',
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(8px)'
                }}>
                  <ChatIcon sx={{
                    fontSize: 72,
                    color: alpha(theme.palette.primary.main, 0.6),
                    mb: 3
                  }} />
                  <Typography variant="h6" sx={{
                    color: 'text.primary',
                    mb: 2,
                    fontWeight: 600
                  }}>
                    {conversations.length > 0
                      ? "Select a conversation to start chatting"
                      : "No conversations yet"}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'text.secondary',
                    fontSize: '0.95rem'
                  }}>
                    {conversations.length > 0
                      ? "Your existing conversations will appear here"
                      : "Start a new conversation from your property listings"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );


  const renderSystemSettings = () => {
    const handleExportData = async () => {
      try {
        await userService.exportRoomsToCSV();
        setSnackbar({
          open: true,
          message: 'Data exported successfully',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to export data',
          severity: 'error',
        });
      }
    };

    const handleImportData = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        await userService.importRoomsFromCSV(file);
        await fetchAndProcessProperties();
        setSnackbar({
          open: true,
          message: 'Data imported successfully',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to import data',
          severity: 'error',
        });
      }
    };

    const handlePasswordChange = async () => {
      try {
        await userService.changePassword(currentUser.id, currentPassword, newPassword);
        setSnackbar({
          open: true,
          message: 'Password updated successfully',
          severity: 'success'
        });
        setSecurityDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to update password',
          severity: 'error'
        });
      }
    };

    const handleDeleteAccount = async () => {
      const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
      if (!confirmed) return;

      try {
        await userService.deleteUser(currentUser.id);
        setSnackbar({
          open: true,
          message: 'Account deleted successfully',
          severity: 'success'
        });
        handleLogout();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to delete account',
          severity: 'error'
        });
      }
    };

    const handleNotificationChange = async (type, value) => {
      try {
        // Update the backend
        await userService.updateOwnProfile(currentUser.id, {
          [type]: value
        });

        // Refresh user data
        const updatedUser = await userService.getCurrentUser();
        setCurrentUser(updatedUser);

        setSnackbar({
          open: true,
          message: 'Notification preferences updated',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to update preferences',
          severity: 'error'
        });
      }
    };
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Theme Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: { xs: 2, md: 3 },
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px'
            }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <LightModeIcon color="primary" />
                  Theme Preferences
                </Typography>

                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography>Dark Mode</Typography>
                  <Switch
                    checked={mode === 'dark'}
                    onChange={toggleColorMode}
                    color="primary"
                  />
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: { xs: 2, md: 3 },
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px'
            }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <NotificationsActiveIcon color="primary" />
                  Notification Settings
                </Typography>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentUser?.emailNotifications || false}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentUser?.pushNotifications || false}
                        onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Push Notifications"
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  />
                </FormGroup>
              </Stack>
            </Paper>
          </Grid>

          {/* Data Management */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: { xs: 2, md: 3 },
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px'
            }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <BackupIcon color="primary" />
                  Data Management
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AssessmentIcon />}
                  onClick={handleExportData}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderRadius: '12px'
                  }}
                >
                  Export Property Data (CSV)
                </Button>

                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="import-data"
                  type="file"
                  onChange={handleImportData}
                />
                <label htmlFor="import-data">
                  <Button
                    variant="outlined"
                    fullWidth
                    component="span"
                    startIcon={<BackupIcon />}
                    sx={{
                      justifyContent: 'flex-start',
                      py: 1.5,
                      borderRadius: '12px'
                    }}
                  >
                    Import Property Data (CSV)
                  </Button>
                </label>
              </Stack>
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{
              p: { xs: 2, md: 3 },
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px'
            }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}>
                  <LockIcon color="primary" />
                  Security Settings
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PasswordIcon />}
                  onClick={() => setSecurityDialogOpen(true)}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderRadius: '12px'
                  }}
                >
                  Change Password
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<DeleteIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    borderRadius: '12px'
                  }}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Security Dialog */}
        <Dialog open={securityDialogOpen} onClose={() => setSecurityDialogOpen(false)}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockIcon color="primary" />
            Change Password
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSecurityDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword}
            >
              Update Password
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };

  const renderProfile = () => {
    return (
      <Container maxWidth={{ xs: "xl", md: "lg" }} sx={{ py: { xs: 8, md: 0 } }}>
        <Stack spacing={4}>
          {/* Header Card */}
          <Card
            sx={{
              position: 'relative',
              overflow: 'hidden',
              p: 4,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            {/* In Profile Section - Remove property reference */}
            <Avatar
              sx={{
                width: 120,
                height: 120,
                border: '4px solid lightgray ',
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '3rem',
                mx: 'auto',
                mb: 2,
              }}
            >
              {currentUser?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" >
              {currentUser?.fullName || currentUser?.username}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 2 }}>
              {currentUser?.role}
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditModalOpen(true)}
              sx={{
                bgcolor: 'white',
                color: 'tertiary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Edit Profile
            </Button>
          </Card>

          {/* Info Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Username
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>{currentUser?.username}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BadgeIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>
                        {currentUser?.fullName || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Email
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>{currentUser?.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary" textAlign={'left'}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" textAlign={'left'}>
                        {currentUser?.phoneNumber || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>

        {/* Edit Profile Dialog */}
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit Profile
            <IconButton
              onClick={() => setIsEditModalOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Username"
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, username: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Password"
                value={profileForm.password}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, password: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Full Name"
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, fullName: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={profileForm.phoneNumber}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: '12px',
              boxShadow: theme.shadows[3],
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', m: 0, p: 0 }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sx={{
            width: 280,
            flexShrink: 0,
            zIndex: (theme) => theme.zIndex.appBar + 1,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              borderRadius: 0,
            },
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <RouterLink to="/dashboard/seeker/browse-property" component={RouterLink} sx={{ display: 'inline-block' }}>
              <img
                src="/src/assets/RR.png"
                alt="RoomRadar Logo"
                style={{
                  maxWidth: '200px',
                  height: 'auto'
                }}
              />
            </RouterLink >
          </Box>
          <Divider />
          <List sx={{ p: 2 }}>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.section}
                selected={activeSection === item.section}
                onClick={() => {
                  setActiveSection(item.section);
                  navigate(`/dashboard/seeker/${item.path}`);

                  switch (item.section) {
                    case 'properties':
                      navigate('/dashboard/seeker/browse-property');
                      break;
                    case 'bookings':
                      navigate('/dashboard/seeker/bookings');
                      break;
                    case 'analytics':
                      navigate('/dashboard/seeker/property-analytics');
                      break;
                    case 'messages':
                      navigate('/dashboard/seeker/messages');
                      break;
                    case 'settings':
                      navigate('/dashboard/seeker/system-settings');
                      break;
                    case 'profile':
                      navigate('/dashboard/seeker/profile-information');
                      break;
                    default:
                      break;
                  }
                }}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}15`,
                    '&:hover': { bgcolor: `${theme.palette.primary.main}20` },
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: activeSection === item.section ? theme.palette.primary.main : 'text.secondary'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: activeSection === item.section ? 'text.primary' : 'text.secondary'
                  }}
                />
              </ListItemButton>
            ))}
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            // flexGrow: 1,
            // width: { sm: `calc(100% - ${isMobile ? 0 : 280}px)` },
            // height: '100vh',
            // bgcolor: 'background.default',
            // minHeight: '100vh',
            // overflow: 'auto',
            // overflowAnchor: 'none',

            // flexGrow: 1,
            // width: { sm: `calc(100% - ${isMobile ? 0 : 280}px)`, },
            // bgcolor: 'background.default',
            // minHeight: '100vh',
            // overflow: 'auto'


            // flexGrow: 1,
            // width: { xs: '100%', sm: `calc(100% - 280px)` },
            // minHeight: '100vh',
            // bgcolor: 'background.default',
            // position: 'relative',
            // left: { xs: 0, sm: 0 },
            // p: 0,
            // m: 0,
            // overflow: 'hidden'

          }}
        >
          {/* Navigation Bar - Only show on mobile */}
          {isMobile && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                bgcolor: 'background.default',
                borderBottom: `1px solid ${theme.palette.divider}`,
                px: 3,
                py: 2,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RouterLink to="/dashboard/seeker/property-management" component={RouterLink} sx={{ display: 'inline-block' }}>
                    <img
                      src="/src/assets/RR.png"
                      alt="RoomRadar Logo"
                      style={{
                        maxWidth: '200px',
                        height: 'auto'
                      }}
                    />
                  </RouterLink>
                </Box>

                {/* Right section - Theme toggle and Menu */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    onClick={toggleColorMode}
                    sx={{
                      bgcolor: 'background.paper',
                      p: 1,
                      boxShadow: theme.shadows[1],
                      '&:hover': { transform: 'rotate(180deg)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {mode === 'dark' ? (
                      <LightModeIcon color="primary" />
                    ) : (
                      <DarkModeIcon color="primary" />
                    )}
                  </IconButton>

                  <IconButton
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    sx={{
                      bgcolor: 'background.paper',
                      p: 1,
                      boxShadow: theme.shadows[1],
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          )}
          <Typography variant="h5" component="h1" fontWeight={700} margin={1}>
            {activeSectionTitles[activeSection]}
          </Typography>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeSection}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              style={{ padding: 16 }}
            >
              {activeSection === 'properties' && renderViewProperty()}
              {activeSection === 'bookings' && renderBookings()}
              {activeSection === 'analytics' && renderPropertyAnalytics()}
              {activeSection === 'messages' && renderMessages()}
              {activeSection === 'settings' && renderSystemSettings()}
              {activeSection === 'profile' && renderProfile()}

            </motion.div>
          </AnimatePresence>
        </Box>

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: '12px',
              boxShadow: theme.shadows[3],
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog
          open={isPropertyModalOpen}
          onClose={() => setIsPropertyModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          <DialogTitle sx={{
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 2,
          }}>
            <Typography variant="h5" fontWeight={600}>
              {selectedProperty ? 'Edit Property' : 'Create New Property'}
            </Typography>
            <IconButton
              onClick={() => setIsPropertyModalOpen(false)}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Title */}
              <Grid item xs={12} md={6}>
                {/* Title Field */}
                <TextField
                  fullWidth
                  label="Title *"
                  variant="outlined"
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                  required
                  error={!propertyForm.title}
                  helperText={!propertyForm.title && "Title is required"}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                />
              </Grid>

              {/* Price */}
              <Grid item xs={12} md={6}>
                {/* Price Field */}
                <TextField
                  fullWidth
                  label="Price *"
                  type="number"
                  variant="outlined"
                  value={propertyForm.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setPropertyForm({ ...propertyForm, price: value });
                    }
                  }}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: "0.01" }}
                  error={!propertyForm.price || isNaN(parseFloat(propertyForm.price))}
                  helperText={(!propertyForm.price || isNaN(parseFloat(propertyForm.price))) && "Valid price required"}
                />
              </Grid>

              {/* Size */}
              <Grid item xs={12} md={6}>
                {/* Size Field */}
                <TextField
                  fullWidth
                  label="Size *"
                  type="number"
                  variant="outlined"
                  value={propertyForm.size}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setPropertyForm({ ...propertyForm, size: value });
                    }
                  }}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sq.ft</InputAdornment>,
                  }}
                  inputProps={{ min: 0 }}
                  error={!propertyForm.size || isNaN(parseInt(propertyForm.size, 10))}
                  helperText={(!propertyForm.size || isNaN(parseInt(propertyForm.size, 10))) && "Valid size required"}
                />

              </Grid>

              {/* Address */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address *"
                  variant="outlined"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  required
                  error={!propertyForm.address}
                  helperText={!propertyForm.address && "Address is required"}
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City *"
                  variant="outlined"
                  value={propertyForm.city}
                  onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                  required
                  error={!propertyForm.city}
                  helperText={!propertyForm.city && "City is required"}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="property-images"
                    type="file"
                    multiple
                    // In the image input onChange handler:
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const maxTotalSize = 20 * 1024 * 1024; // 20MB
                      const maxImages = 5;

                      // Calculate current size from NEW images only
                      const currentSize = propertyForm.images
                        .filter(img => typeof img !== 'string') // Filter out existing images
                        .reduce((sum, img) => sum + img.file.size, 0);

                      let validImages = [];
                      let errorMessage = "";

                      files.forEach(file => {
                        if (propertyForm.images.length + validImages.length >= maxImages) {
                          errorMessage = `Maximum ${maxImages} images allowed`;
                        } else if (currentSize + file.size > maxTotalSize) {
                          errorMessage = `Total size exceeds 20MB`;
                        } else {
                          validImages.push({
                            preview: URL.createObjectURL(file),
                            file: file
                          });
                        }
                      });

                      if (errorMessage) {
                        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
                      }

                      setPropertyForm(prev => ({
                        ...prev,
                        images: [...prev.images, ...validImages]
                      }));
                    }}
                  />
                  <label htmlFor="property-images">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<BackupIcon />}
                      fullWidth
                    >
                      Upload Images
                    </Button>
                  </label>
                  <Typography variant="caption" color="textSecondary">
                    Max 5 images (JPEG, PNG), total max 20MB
                  </Typography>

                  {/* Image Previews */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {propertyForm.images.map((image, index) => {
                      const isString = typeof image === 'string';
                      const src = isString ?
                        `${import.meta.env.VITE_API_URL}/uploads/${image}` :
                        URL.createObjectURL(image.file);
                      return (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <img
                            src={src}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: 100,
                              height: 100,
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.7)'
                              }
                            }}
                            onClick={() => {
                              const updatedImages = [...propertyForm.images];
                              updatedImages.splice(index, 1);
                              setPropertyForm({ ...propertyForm, images: updatedImages });
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                </FormControl>
              </Grid>


              {/* Amenities Checkboxes */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Amenities *
                </Typography>
                <FormGroup row>
                  {['wifi', 'parking', 'ac', 'heating', 'tv', 'kitchen'].map((amenity) => (
                    <FormControlLabel
                      key={amenity}
                      control={
                        <Checkbox
                          checked={propertyForm.amenities?.[amenity] || false}
                          onChange={(e) => setPropertyForm({
                            ...propertyForm,
                            amenities: {
                              ...propertyForm.amenities,
                              [amenity]: e.target.checked
                            }
                          })}
                          color="primary"
                        />
                      }
                      label={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    />
                  ))}
                </FormGroup>
              </Grid>



              {/* Availability Radio Buttons */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>
                    Availability *
                  </Typography>
                  <RadioGroup
                    row
                    value={propertyForm.available ? 'available' : 'unavailable'}
                    onChange={(e) => setPropertyForm({
                      ...propertyForm,
                      available: e.target.value === 'available'
                    })}
                  >
                    <FormControlLabel
                      value="available"
                      control={<Radio color="primary" />}
                      label="Available for Booking"
                    />
                    <FormControlLabel
                      value="unavailable"
                      control={<Radio color="primary" />}
                      label="Currently Unavailable"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}>
            <Button
              onClick={() => setIsPropertyModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={selectedProperty ? handleUpdateProperty : handleCreateProperty}
              disabled={loading}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: '12px',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : selectedProperty ? (
                'Update Property'
              ) : (
                'Create Property'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          fullScreen
          open={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <IconButton
            onClick={() => setIsImageModalOpen(false)}
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              color: 'white',
              zIndex: 2,
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}>
            <Swiper
              modules={[Navigation, Pagination, Keyboard, Mousewheel]}
              initialSlide={currentImageIndex}
              onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{ clickable: true, dynamicBullets: true, }}
              keyboard
              mousewheel
              spaceBetween={50}
              slidesPerView={1}
              style={{
                width: '100%',
                height: '100%',
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': '#fff',
                '--swiper-pagination-bottom': '24px',
                '--swiper-pagination-bullet-size': '0px',
                '--swiper-pagination-bullet-horizontal-gap': '6px',
              }}
            >
              {selectedPropertyImages.map((image, index) => {
                const imageUrl = typeof image === 'string'
                  ? `${import.meta.env.VITE_API_URL}/uploads/${image}`
                  : URL.createObjectURL(image.file);

                return (
                  <SwiperSlide key={index}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100vh',
                      position: 'relative',
                    }}>
                      <img
                        src={imageUrl}
                        alt={`Property image ${index + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '90vh',
                          objectFit: 'contain',
                          cursor: 'zoom-in',
                          transform: zoomedIndex === index ? 'scale(2)' : 'scale(1)',
                          transition: 'transform 0.3s ease',
                        }}
                        onClick={() => setZoomedIndex(zoomedIndex === index ? null : index)}
                      />
                    </Box>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <IconButton
              className="swiper-button-prev"
              sx={{
                position: 'fixed',
                left: 16,
                top: '50%',
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>

            <IconButton
              className="swiper-button-next"
              sx={{
                position: 'fixed',
                right: 16,
                top: '50%',
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>

            {/* Dots Indicator */}
            {selectedPropertyImages.length > 1 && (
              <Box sx={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
              }}>
                {selectedPropertyImages.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: currentImageIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Dialog>

        {/* Booking */}
        <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)}>
          <DialogTitle>
            {selectedBooking?.id ? 'Update Booking' : 'New Booking'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={bookingForm.startDate}
                onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                fullWidth
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />

              <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={bookingForm.endDate}
                onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                fullWidth
                inputProps={{ min: bookingForm.startDate || new Date().toISOString().split('T')[0] }}
              />

              {/* Changed label from "Special Requests" to "Comments" */}
              <TextField
                label="Comments"
                multiline
                rows={3}
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBookingDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={selectedBooking?.id ? handleUpdateBooking : handleCreateBooking}
            >
              {selectedBooking?.id ? 'Update Booking' : 'Create Booking'}
            </Button>
          </DialogActions>
        </Dialog>


        {/* Email */}
        <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)}>
          <DialogTitle>Contact Landlord</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Message"
              multiline
              rows={4}
              fullWidth
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => handleContactLandlord(selectedContactProperty)}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Phone Dialog */}
        <Dialog open={phoneDialogOpen} onClose={() => setPhoneDialogOpen(false)}>
          <DialogTitle>
            Landlord Contact: {selectedLandlord?.fullName}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 2 }}>
              <Typography variant="h6">
                <PhoneIcon sx={{ mr: 1 }} />
                {selectedLandlord?.phoneNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Local time: {new Date().toLocaleTimeString()}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPhoneDialogOpen(false)}>Close</Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PhoneIcon />}
              onClick={handleCallLandlord}
            >
              Call Now
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
};

export default SeekerDashboard;
