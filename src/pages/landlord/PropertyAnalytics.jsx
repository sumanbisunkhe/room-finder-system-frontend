import React, { useMemo } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
  createTheme,
} from '@mui/material';
import {
  Domain as DomainIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Assessment as AssessmentIcon,
  LocationCity as LocationCityIcon,
  MonetizationOn as MonetizationOnIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts';
import { useOutletContext } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: '16px',
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 20px ${alpha(color, 0.15)}`
        }
      }}
    >
      <Stack spacing={isMobile ? 1 : 2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              bgcolor: alpha(color, 0.12),
              p: { xs: 1, sm: 1.25, md: 1.5 },
              borderRadius: '12px',
              display: 'flex',
              color: color
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: { xs: 20, sm: 22, md: 24 } } })}
          </Box>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: trend >= 0 ? 'success.main' : 'error.main',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              <TrendingUpIcon 
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  transform: trend >= 0 ? 'none' : 'rotate(180deg)'
                }}
              />
              {Math.abs(trend)}%
            </Box>
          )}
        </Stack>
        
        <Box>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            color={color} 
            sx={{ 
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            fontWeight={500}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    return (
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          bgcolor: alpha('#fff', 0.9),
          borderRadius: '12px',
          boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
        <Stack spacing={0.5}>
          {payload.map((entry, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: entry.color
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {entry.name}:
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {entry.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    );
  }
  return null;
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
      style={{ fontWeight: 600, fontSize: 12 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PropertyAnalytics = () => {
  const { theme, properties, propertyStats } = useOutletContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

        const dailyProperties = properties.filter(property => {
          const propDate = new Date(property.postedDate);
          return (
            propDate.getFullYear() === date.getFullYear() &&
            propDate.getMonth() === date.getMonth() &&
            propDate.getDate() === date.getDate()
          );
        });

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

  // Calculate trends (mock data - replace with real calculations)
  const trends = {
    total: 15,
    available: 8,
    occupied: -5,
    avgPrice: 12
  };

  const mode = theme.palette.mode;

  const customTheme = useMemo(
    () => createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#90caf9' : '#1976d2',
        },
        secondary: {
          main: mode === 'dark' ? '#f48fb1' : '#dc004e',
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#f5f5f5',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 500 },
        h2: { fontWeight: 500 },
        h3: { fontWeight: 500 },
        h4: { fontWeight: 500 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
            },
          },
        },
      },
    }),
    [mode]
  );

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.3),
          },
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
          borderRadius: '4px',
        },
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{ 
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          ml: { xs: 'auto', lg: '24px' },
          mr: { xs: 'auto', lg: '24px' },
          width: { xs: '100%', lg: 'calc(100% - 48px)' },
          maxWidth: { xs: '1400px', lg: 'none' },
          transition: 'all 0.2s ease-in-out',
          height: '100%',
          position: 'relative',
          pb: { xs: 4, sm: 5, md: 6 },
        }}
      >
        {/* Summary Cards */}
        <Grid 
          container 
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Properties"
              value={propertyStats.totalProperties}
              icon={<DomainIcon />}
              color="#4F46E5"
              trend={trends.total}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Available"
              value={propertyStats.availableProperties}
              icon={<CheckCircleIcon />}
              color="#10B981"
              trend={trends.available}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Occupied"
              value={propertyStats.unavailableProperties}
              icon={<BlockIcon />}
              color="#EF4444"
              trend={trends.occupied}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Price"
              value={`Rs.${Math.round(properties.reduce((sum, p) => sum + p.price, 0) / (properties.length || 1)).toLocaleString()}`}
              icon={<AssessmentIcon />}
              color="#8B5CF6"
              trend={trends.avgPrice}
            />
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* City Distribution */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0}
              sx={{
                pt: 2,
                px: 2.5,
                pb: 1.5,
                height: '100%',
                minHeight: { xs: 300, sm: 320, md: 350 },
                maxHeight: { xs: 'none', md: 'none' },
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1
              }}
            >
              <Stack spacing={1.5} height="100%">
                <Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      mb: 0.5
                    }}
                  >
                    <LocationCityIcon color="primary" sx={{ fontSize: '1.25rem' }} />
                    City Distribution
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}
                  >
                    Distribution of properties across different cities
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minHeight: { xs: 180, sm: 200 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(chartData.cityDistribution).map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40 : 60}
                        outerRadius={isMobile ? 70 : 100}
                        paddingAngle={2}
                        label={renderPieLabel}
                        labelLine={false}
                        activeShape={{
                          stroke: 'none',
                          outline: 'none'
                        }}
                        style={{
                          outline: 'none'
                        }}
                      >
                        {Object.keys(chartData.cityDistribution).map((city) => (
                          <Cell
                            key={city}
                            fill={cityColors[city] || theme.palette.primary.main}
                            style={{ outline: 'none' }}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'none' }}
                      />
                      <Legend
                        layout={isMobile ? "horizontal" : "vertical"}
                        verticalAlign={isMobile ? "bottom" : "middle"}
                        align={isMobile ? "center" : "right"}
                        wrapperStyle={{ 
                          paddingLeft: isMobile ? 0 : 24,
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          marginTop: isMobile ? '1rem' : 0
                        }}
                        onClick={null}
                        onMouseEnter={null}
                        onMouseLeave={null}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Price Distribution */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0}
              sx={{
                pt: 2,
                px: 2.5,
                pb: 1.5,
                height: '100%',
                minHeight: { xs: 300, sm: 320, md: 350 },
                maxHeight: { xs: 'none', md: 'none' },
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1
              }}
            >
              <Stack spacing={1.5} height="100%">
                <Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      mb: 0.5
                    }}
                  >
                    <MonetizationOnIcon color="primary" sx={{ fontSize: '1.25rem' }} />
                    Price Distribution
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}
                  >
                    Distribution of properties across different price ranges (in Rs.)
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minHeight: { xs: 180, sm: 200 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(chartData.priceRanges).map(([name, value]) => ({
                        range: name.replace(/(\d+k)/g, ' $1').replace('+', '+'),
                        count: value
                      }))}
                      margin={{ 
                        top: 20, 
                        right: isMobile ? 10 : 30, 
                        left: isMobile ? 10 : 20, 
                        bottom: isMobile ? 80 : 60 
                      }}
                    >
                      <CartesianGrid
                        stroke={theme.palette.divider}
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="range"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: isMobile ? 10 : 12
                        }}
                        tickMargin={20}
                      />
                      <YAxis
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: isMobile ? 10 : 12
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={isMobile ? 30 : 50}
                      >
                        {Object.entries(chartData.priceRanges).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`${theme.palette.primary.main}${Math.round((index + 1) * (80 / Object.keys(chartData.priceRanges).length)).toString(16)}`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Activity Timeline */}
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{
                p: 3,
                height: { xs: 400, sm: 450, md: 500 },
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                mb: { xs: 2, sm: 3 },
                zIndex: 1,
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 200,
                  height: 200,
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }
              }}
            >
              <Stack spacing={3} height="100%">
                <Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      fontSize: { xs: '1.125rem', sm: '1.25rem' }
                    }}
                  >
                    <AssessmentIcon color="primary" />
                    Weekly Activity Trends
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    New property listings and average prices over the last 7 days
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={chartData.activityData}
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 10 : 30, 
                        left: isMobile ? -20 : 0, 
                        bottom: 0 
                      }}
                    >
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
                          fontSize: isMobile ? 10 : 12
                        }}
                      />

                      <YAxis
                        yAxisId="left"
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: isMobile ? 10 : 12
                        }}
                      />

                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: isMobile ? 10 : 12
                        }}
                        tickFormatter={(value) => `Rs.${value.toLocaleString()}`}
                      />

                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />

                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="newListings"
                        name="New Listings"
                        stroke={theme.palette.primary.main}
                        fillOpacity={1}
                        fill="url(#newListings)"
                      />

                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgPrice"
                        name="Average Price"
                        stroke={theme.palette.secondary.main}
                        fillOpacity={1}
                        fill="url(#avgPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PropertyAnalytics; 