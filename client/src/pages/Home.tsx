import React, { useEffect, useRef, useState } from 'react';
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
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import PlantButton from '../components/PlantButton';

// Add type declaration for the dotlottie-player element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        background?: string;
        speed?: string;
        loop?: boolean;
        autoplay?: boolean;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionGrid = motion(Grid);

// Create a continuous cycle animation component
const LottieAnimation: React.FC = () => {
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  
  // Set up the Lottie player script
  useEffect(() => {
    if (!document.querySelector('script[src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"]')) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      script.type = "module";
      document.head.appendChild(script);
      
      script.onload = () => {
        addLottiePlayer(containerRef1.current);
        addLottiePlayer(containerRef2.current);
      };
      
      return () => {
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      };
    } else {
      addLottiePlayer(containerRef1.current);
      addLottiePlayer(containerRef2.current);
    }
  }, []);
  
  const addLottiePlayer = (container: HTMLDivElement | null) => {
    if (container) {
      container.innerHTML = '';
      const player = document.createElement('dotlottie-player');
      player.setAttribute('src', 'https://lottie.host/d4569193-4cff-4ace-8077-eb5fb839f13b/iByK0J7SHr.lottie');
      player.setAttribute('background', 'transparent');
      player.setAttribute('speed', '1');
      player.setAttribute('loop', '');
      player.setAttribute('autoplay', '');
      player.style.width = '100%';
      player.style.height = '100%';
      container.appendChild(player);
    }
  };

  // Animation cycle with two elements for continuous motion
  useEffect(() => {
    const animationDuration = 12; // Reduced from 20 to 12 for faster animation
    
    // Start first animation cycle
    const cycle1 = async () => {
      controls1.start({
        x: ['calc(-100% - 400px)', 'calc(100vw + 400px)'],
        transition: {
          duration: animationDuration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop'
        }
      });
    };
    
    // Start second animation cycle with offset
    const cycle2 = async () => {
      // Start the second animation at the halfway point
      controls2.start({
        x: ['calc(-100% - 400px)', 'calc(100vw + 400px)'],
        transition: {
          duration: animationDuration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
          delay: animationDuration / 2 // Start halfway through the first cycle
        }
      });
    };
    
    cycle1();
    cycle2();
    
    return () => {
      controls1.stop();
      controls2.stop();
    };
  }, [controls1, controls2]);
  
  return (
    <>
      <MotionBox
        animate={controls1}
        initial={{ x: 'calc(-100% - 400px)' }}
        style={{ 
          position: 'absolute',
          width: '400px',
          height: '100%',
          left: 0
        }}
      >
        <div ref={containerRef1} style={{ width: '100%', height: '100%' }} />
      </MotionBox>
      
      <MotionBox
        animate={controls2}
        initial={{ x: 'calc(-100% - 400px)' }}
        style={{ 
          position: 'absolute',
          width: '400px',
          height: '100%',
          left: 0
        }}
      >
        <div ref={containerRef2} style={{ width: '100%', height: '100%' }} />
      </MotionBox>
    </>
  );
};

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
    <Container maxWidth={false} disableGutters sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <MotionBox
        sx={{
          height: { xs: 'auto', md: '80vh' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 6,
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 2, md: 10 },
          mb: { xs: -8, md: -12 }
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Cycling Animation - Moved to top of the hero section */}
        <Box 
          sx={{
            position: 'absolute',
            width: '100%',
            height: { xs: '150px', md: '200px' },
            left: 0,
            right: 0,
            top: '10%', // Changed from bottom to top
            zIndex: 10,
            overflow: 'visible'
          }}
        >
          <LottieAnimation />
        </Box>

        <Box sx={{ 
          flex: 1, 
          pr: { md: 6 }, 
          mb: { xs: 4, md: 0 },
          zIndex: 1,
          mt: { xs: '150px', md: '100px' } // Added margin top to push content below animation
        }}>
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
            {user ? (
              <>
                <PlantButton
                  component={Link}
                  to="/planner"
                  size="large"
                  startIcon={<ExploreIcon />}
                >
                  New Route
                </PlantButton>
                <PlantButton
                  component={Link}
                  to="/saved-routes"
                  variant="outlined"
                  size="large"
                  startIcon={<SaveIcon />}
                >
                  My Routes
                </PlantButton>
              </>
            ) : (
              <>
                <PlantButton
                  component={Link}
                  to="/planner"
                  size="large"
                  startIcon={<ExploreIcon />}
                >
                  Plan Your Route
                </PlantButton>
                <PlantButton
                  component={Link}
                  to="/register"
                  size="large"
                  sx={{ fontWeight: 'bold' }}
                >
                  Sign Up For Free
                </PlantButton>
              </>
            )}
          </Box>
        </Box>
      </MotionBox>

      {/* Features Section */}
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom
          sx={{ mb: 2, color: theme.palette.primary.dark }}
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
          <Grid item xs={12} md={2} lg={3}>
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
        <PlantButton
          component={Link}
          to={user ? "/planner" : "/login"}
          size="large"
          variant="secondary"
        >
          {user ? "Start Planning" : "Login to Get Started"}
        </PlantButton>
      </MotionBox>
    </Container>
  );
};

export default Home; 