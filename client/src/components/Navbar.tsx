import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Box,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NatureIcon from '@mui/icons-material/Nature';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import RouteIcon from '@mui/icons-material/Route';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import styled from 'styled-components';
import { useAuth } from '../utils/AuthContext';
import Loader from './Loader';
import PlantButton from './PlantButton';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@mui/material/styles';
import logoImage from '../greenways.png';

const StyledAppBar = styled(AppBar)<{ $darkmode: string }>`
  background-color: ${props => props.$darkmode === 'true' ? 'rgba(27, 94, 32, 0.95)' : 'rgba(46, 125, 50, 0.95)'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  height: 90px;
  padding: 8px 0;
  
  &:hover {
    transform: scale(1.02);
  }
  
  img {
    height: 88px;
    width: auto;
    object-fit: contain;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  margin: 0 10px;
  position: relative;
  overflow: visible;
  display: block;

  &:hover {
    color: #98ee99;
  }
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const ButtonsContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout, loading, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const goToProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const goToHome = () => {
    navigate('/');
  };

  // Drawer items that change based on authentication status
  const drawerItems = (
    <List>
      <ListItem component={Link} to="/" onClick={handleDrawerToggle}>
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem component={Link} to="/planner" onClick={handleDrawerToggle}>
        <ListItemText primary="Route Planner" />
      </ListItem>
      {isAuthenticated ? (
        <>
          <ListItem component={Link} to="/saved-routes" onClick={handleDrawerToggle}>
            <ListItemText primary="Saved Routes" />
          </ListItem>
          <ListItem component={Link} to="/profile" onClick={handleDrawerToggle}>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem onClick={() => { logout(); handleDrawerToggle(); navigate('/'); }}>
            <ListItemText primary="Logout" />
          </ListItem>
          <Divider />
          <ListItem>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <ListItemText primary="Dark Mode" />
              <ThemeToggle showTooltip={false} />
            </Box>
          </ListItem>
        </>
      ) : (
        <>
          <ListItem component={Link} to="/login" onClick={handleDrawerToggle}>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem component={Link} to="/register" onClick={handleDrawerToggle}>
            <ListItemText primary="Register" />
          </ListItem>
          <Divider />
          <ListItem>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <ListItemText primary="Dark Mode" />
              <ThemeToggle showTooltip={false} />
            </Box>
          </ListItem>
        </>
      )}
    </List>
  );

  if (loading) {
    return (
      <StyledAppBar position="sticky" $darkmode={theme.palette.mode === 'dark' ? 'true' : 'false'}>
        <Container maxWidth="xl">
          <Toolbar sx={{ p: isSmall ? '8px 0' : '8px' }}>
            <LogoContainer onClick={goToHome}>
              <img src={logoImage} alt="GreenWays Logo" />
            </LogoContainer>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center' }}>
              <Loader size="small" text="" />
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>
    );
  }

  return (
    <>
      <StyledAppBar position="sticky" $darkmode={theme.palette.mode === 'dark' ? 'true' : 'false'}>
        <Container maxWidth="xl">
          <Toolbar sx={{ p: isSmall ? '8px 0' : '8px' }}>
            <LogoContainer onClick={goToHome}>
              <img src={logoImage} alt="GreenWays Logo" />
            </LogoContainer>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {isMobile ? (
              <ButtonsContainer>
                <ThemeToggle />
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </ButtonsContainer>
            ) : (
              <ButtonsContainer>
                <Button color="inherit" component={StyledLink} to="/">
                  Home
                </Button>
                <Button color="inherit" component={StyledLink} to="/planner">
                  Route Planner
                </Button>
                
                {isAuthenticated ? (
                  <>
                    <Button color="inherit" component={StyledLink} to="/saved-routes">
                      Saved Routes
                    </Button>
                    <ThemeToggle />
                    <Box sx={{ ml: 1 }}>
                      <UserAvatar 
                        onClick={handleProfileMenuOpen}
                        src={user?.profilePicture} 
                        alt={user?.name}
                      >
                        {user?.name?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                      </UserAvatar>
                    </Box>
                  </>
                ) : (
                  <>
                    <ThemeToggle />
                    <StyledLink to="/login">
                      <PlantButton size="small">
                        Login
                      </PlantButton>
                    </StyledLink>
                    <StyledLink to="/register">
                      <PlantButton size="small">
                        Register
                      </PlantButton>
                    </StyledLink>
                  </>
                )}
              </ButtonsContainer>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: '8px',
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={goToProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem component={Link} to="/saved-routes" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <RouteIcon fontSize="small" />
          </ListItemIcon>
          My Routes
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            minWidth: 250,
            borderRadius: '0px 0px 0px 16px',
            background: theme.palette.background.default,
          }
        }}
      >
        {drawerItems}
      </Drawer>
    </>
  );
};

export default Navbar; 