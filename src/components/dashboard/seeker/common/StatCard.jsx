import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar
} from '@mui/material';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderRadius: 2,
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-2px)',
        transition: 'transform 0.2s ease-in-out',
      },
    }}
  >
    <Avatar
      sx={{
        bgcolor: `${color}.light`,
        color: `${color}.main`,
        width: 56,
        height: 56,
      }}
    >
      <Icon />
    </Avatar>
    <Box>
      <Typography color="textSecondary" variant="body2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {value}
      </Typography>
    </Box>
  </Paper>
);

export default StatCard; 