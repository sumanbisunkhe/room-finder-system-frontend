import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  CalendarViewMonth as MonthIcon,
  CalendarViewDay as DayIcon,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import * as userService from '../../../services/userService';
import { useSnackbar } from '../../../contexts/SnackbarContext';

const StatCard = ({ title, value, icon, color, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: alpha(color, 0.1),
            '& .MuiLinearProgress-bar': {
              bgcolor: color
            }
          }}
        />
      )}
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem'
              }
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: { xs: 0.75, sm: 1 },
              borderRadius: 1.5,
              bgcolor: alpha(color, 0.1),
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: {
                  xs: '1rem',
                  sm: '1.25rem'
                }
              }
            })}
          </Box>
        </Stack>
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            fontSize: {
              xs: '1.25rem',
              sm: '1.5rem'
            }
          }}
        >
          {loading ? '-' : value}
        </Typography>
      </Stack>
    </Paper>
  );
};

const UserAnalytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSnackbar } = useSnackbar();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalAdmins: 0,
    totalLandlords: 0,
    totalSeekers: 0
  });
  const [loading, setLoading] = useState(false);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [interval, setInterval] = useState('daily');

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch user statistics
      const response = await userService.getUserStatistics();
      setStats(response);

      // Fetch growth trends data
      const trendsResponse = await userService.getGrowthTrends(interval);
      if (trendsResponse && Array.isArray(trendsResponse)) {
        setUserGrowthData(trendsResponse);
      } else {
        console.error('Invalid growth trends data format:', trendsResponse);
        setUserGrowthData([]);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      showSnackbar(error.message || 'Failed to fetch analytics data', 'error');
      setUserGrowthData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [interval]); // Refetch when interval changes

  const handleRefresh = () => {
    fetchStats();
  };

  const handleIntervalChange = (event, newInterval) => {
    if (newInterval !== null) {
      setInterval(newInterval);
    }
  };

  // Transform role distribution data for the pie chart
  const roleData = [
    { name: 'Admins', value: stats.totalAdmins },
    { name: 'Landlords', value: stats.totalLandlords },
    { name: 'Seekers', value: stats.totalSeekers }
  ];

  // Color palette for charts
  const COLORS = {
    'Admins': '#4F46E5',    // Deep Indigo - represents authority and trust
    'Landlords': '#059669',  // Emerald Green - represents property and growth
    'Seekers': '#EA580C'     // Burnt Orange - represents search and energy
  };

  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (!userGrowthData || userGrowthData.length < 2) return 0;
    const oldestCount = userGrowthData[0].userCount;
    const newestCount = userGrowthData[userGrowthData.length - 1].userCount;
    if (oldestCount === 0) return 100;
    return ((newestCount - oldestCount) / oldestCount * 100).toFixed(1);
  };

  // Calculate average users per period
  const calculateAverageUsers = () => {
    if (!userGrowthData || userGrowthData.length === 0) return 0;
    const totalUsers = userGrowthData.reduce((sum, period) => sum + period.userCount, 0);
    return Math.round(totalUsers / userGrowthData.length);
  };

  // Get total users from the latest period
  const getTotalUsers = () => {
    if (!userGrowthData || userGrowthData.length === 0) return 0;
    return stats.totalUsers || userGrowthData[userGrowthData.length - 1].userCount;
  };

  return (
    <Box 
      component="section"
      sx={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
        p: { xs: 1, sm: 2, md: 3 },
        gap: { xs: 1, sm: 2, md: 3 },
        minHeight: 0
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 2 },
          flexShrink: 0,
          mb: { xs: 1, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flex: 1 }}>
          <ToggleButtonGroup
            value={interval}
            exclusive
            onChange={handleIntervalChange}
            size="small"
            sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
          >
            <ToggleButton value="daily">
              <DayIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Daily</Typography>
            </ToggleButton>
            <ToggleButton value="monthly">
              <MonthIcon sx={{ mr: 1 }} />
              <Typography variant="body2">Monthly</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ flexShrink: 0 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Inactive Users"
            value={stats.inactiveUsers}
            icon={<BlockIcon />}
            color={theme.palette.error.main}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ flex: 1, minHeight: 0, mb: { xs: 3, sm: 4, md: 0 } }}>
        {/* Role Distribution Chart */}
        <Grid item xs={12} md={6} sx={{ height: { xs: 280, sm: 320, md: '100%' } }}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%',
              p: { xs: 1, sm: 2, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, sm: 2 },
              minHeight: 0
            }}
          >
            <Typography variant="h6" fontWeight={500}>
              Role Distribution
            </Typography>
            <Box sx={{ 
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? "50%" : "60%"}
                    outerRadius={isMobile ? "70%" : "80%"}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    labelStyle={{ 
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: 12,
                      marginBottom: 8
                    }}
                    itemStyle={{ 
                      fontSize: 12,
                      fontWeight: 500
                    }}
                    formatter={(value, name) => [`${value} Users`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    iconSize={8}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ 
                        color: '#6B7280', 
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* User Growth Trends Chart */}
        <Grid item xs={12} md={6} sx={{ height: { xs: 320, sm: 360, md: '100%' }, mb: { xs: 2, sm: 3, md: 0 } }}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '100%',
              minHeight: { xs: 320, sm: 360, md: 0 },
              p: { xs: 1, sm: 2, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 1, sm: 2 },
              minHeight: 0
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                variant="h6" 
                fontWeight={500}
                sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.25rem' } }}
              >
                User Growth Trends
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Latest: <b>{getTotalUsers()}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Avg: <b>{calculateAverageUsers()}</b>
                </Typography>
                <Box
                  sx={{
                    bgcolor: calculateGrowthRate() >= 0 ? '#10B981' : '#EF4444',
                    color: 'white',
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 1,
                    fontSize: { xs: 12, sm: 13 },
                    fontWeight: 600,
                    ml: 1,
                    mt: { xs: 0.5, sm: 0 }
                  }}
                >
                  {calculateGrowthRate() >= 0 ? '+' : ''}{calculateGrowthRate()}%
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userGrowthData}
                  margin={{
                    top: 30,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#E5E7EB" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="periodLabel" 
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                    tickMargin={16}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                    tickMargin={16}
                  />
                  <ReferenceLine y={calculateAverageUsers()} stroke="#10B981" strokeDasharray="6 3" label={{ value: 'Avg', position: 'right', fill: '#10B981', fontSize: 11, fontWeight: 600 }} />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    labelStyle={{ 
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: 12,
                      marginBottom: 8
                    }}
                    itemStyle={{ 
                      color: '#6366F1',
                      fontSize: 12,
                      fontWeight: 500
                    }}
                    formatter={(value) => [`${value} Users`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="userCount"
                    stroke="#6366F1"
                    fill="url(#colorGradient)"
                    strokeWidth={2}
                    dot={{
                      fill: '#6366F1',
                      stroke: 'white',
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      fill: 'white',
                      stroke: '#6366F1',
                      strokeWidth: 2,
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserAnalytics; 