import React from 'react';
import SeekerLayout from '../../components/layout/SeekerLayout';
import { Typography } from '@mui/material';

const SeekerDashboard = () => {
  return (
    <SeekerLayout>
      <Typography variant="h4" component="h1" gutterBottom>
        Seeker Dashboard
      </Typography>
      {/* Add your dashboard content here */}
    </SeekerLayout>
  );
};

export default SeekerDashboard; 