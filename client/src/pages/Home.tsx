import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper,
  useTheme
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import NatureIcon from '@mui/icons-material/Nature';
import SaveIcon from '@mui/icons-material/Save';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionGrid = motion(Grid);

const Home: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <MotionBox
        sx={{
          height: { xs: 'auto', md: '80vh' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 6
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ flex: 1, pr: { md: 6 }, mb: { xs: 4, md: 0 } }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 2,
              color: theme.palette.primary.main
            }}
          >
            {user ? `Welcome back, ${user.name || 'User'}!` : 'Travel Green, Live Green'}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary', 
              mb: 4,
              fontSize: { xs: '1rem', md: '1.3rem' } 
            }}
          >
            {user 
              ? 'Continue your journey towards sustainable travel. Check your saved routes or plan a new eco-friendly trip today.' 
              : 'Discover eco-friendly routes and reduce your carbon footprint with our intelligent green navigation solution.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/planner"
              variant="contained"
              size="large"
              color="primary"
              startIcon={<ExploreIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {user ? 'New Route' : 'Plan Your Route'}
            </Button>
            {user ? (
              <Button
                component={Link}
                to="/saved-routes"
                variant="outlined"
                size="large"
                color="primary"
                startIcon={<SaveIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                My Routes
              </Button>
            ) : (
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
                color="primary"
                sx={{ borderRadius: 2, px: 3 }}
              >
                Sign Up Free
              </Button>
            )}
          </Box>
        </Box>

        <Box 
          component="img"
          src="/assets/green-transport.jpg" 
          alt="Green Transportation"
          sx={{
            maxWidth: { xs: '100%', md: '50%' },
            height: 'auto',
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        />
      </MotionBox>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom
          sx={{ mb: 6, color: theme.palette.primary.dark }}
        >
          Eco-Friendly Navigation Made Easy
        </Typography>
        
        <MotionGrid
          container
          spacing={4}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid item xs={12} md={6} lg={3}>
            <MotionPaper
              variants={itemVariants}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <NatureIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Eco Impact Analysis
              </Typography>
              <Typography color="text.secondary">
                Real-time calculation of CO2 emissions for each route option, helping you make environmentally conscious choices.
              </Typography>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MotionPaper
              variants={itemVariants}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <CompareArrowsIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Multiple Transit Options
              </Typography>
              <Typography color="text.secondary">
                Compare different modes of transportation including walking, cycling, public transit, and driving.
              </Typography>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MotionPaper
              variants={itemVariants}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <ExploreIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Smart Recommendations
              </Typography>
              <Typography color="text.secondary">
                Get personalized suggestions to reduce your carbon footprint based on your travel patterns.
              </Typography>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MotionPaper
              variants={itemVariants}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <SaveIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Save Your Routes
              </Typography>
              <Typography color="text.secondary">
                Store your frequent routes and track your environmental impact over time.
              </Typography>
            </MotionPaper>
          </Grid>
        </MotionGrid>
      </Box>

      {/* Call to Action */}
      <MotionBox
        sx={{
          py: 8,
          textAlign: 'center',
          borderRadius: 4,
          backgroundColor: theme.palette.primary.light,
          color: 'white',
          mb: 8,
          px: 3
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Ready to Go Green?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
          Start planning your eco-friendly routes today and contribute to a healthier planet.
        </Typography>
        <Button
          component={Link}
          to="/planner"
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            backgroundColor: 'white',
            color: theme.palette.primary.dark,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              color: 'white'
            }
          }}
        >
          Get Started
        </Button>
      </MotionBox>
    </Container>
  );
};

export default Home; 