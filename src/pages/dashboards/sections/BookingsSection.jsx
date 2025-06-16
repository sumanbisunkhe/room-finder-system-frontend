import React from 'react';
import { Box, Typography } from '@mui/material';

const BookingsSection = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        My Bookings
      </Typography> */}
      <Typography variant="body1">
        This is the content for the My Bookings section.
      </Typography>
    </Box>
  );
};

export default BookingsSection; 