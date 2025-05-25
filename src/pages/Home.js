import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to InstaLab
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="textSecondary">
          Connect with skilled labourers and get services at your Doorstep :)
        </Typography>
      </Box>
    </Container>
  );
}

export default Home; 