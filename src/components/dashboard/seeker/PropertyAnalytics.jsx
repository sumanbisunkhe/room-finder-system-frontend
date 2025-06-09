import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import StatCard from './common/StatCard';
import HomeIcon from '@mui/icons-material/Home';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LocationCityIcon from '@mui/icons-material/LocationCity';

const PropertyAnalytics = ({ properties }) => {
  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState([]);
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    if (properties) {
      processData();
      setLoading(false);
    }
  }, [properties]);

  const processData = () => {
    // Process city data
    const cityStats = properties.reduce((acc, property) => {
      const city = property.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const cityChartData = Object.entries(cityStats).map(([city, count]) => ({
      name: city,
      value: count
    }));

    setCityData(cityChartData);

    // Process price data
    const priceStats = properties.reduce((acc, property) => {
      const price = property.price || 0;
      const month = new Date(property.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + price;
      return acc;
    }, {});

    const priceChartData = Object.entries(priceStats).map(([month, total]) => ({
      month,
      total
    }));

    setPriceData(priceChartData);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  const totalProperties = properties.length;
  const averagePrice = properties.reduce((acc, prop) => acc + (prop.price || 0), 0) / totalProperties;
  const uniqueCities = new Set(properties.map(prop => prop.city)).size;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Property Analytics
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={totalProperties}
            icon={HomeIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Price"
            value={`$${averagePrice.toFixed(2)}`}
            icon={MonetizationOnIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Price Trend"
            value={priceData.length > 0 ? 
              `${((priceData[priceData.length - 1].total / priceData[0].total - 1) * 100).toFixed(1)}%` 
              : '0%'}
            icon={ShowChartIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cities"
            value={uniqueCities}
            icon={LocationCityIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Properties by City
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Price Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={priceData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyAnalytics; 