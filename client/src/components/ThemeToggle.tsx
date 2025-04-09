import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { styled } from '@mui/material/styles';
import { useTheme } from '../utils/ThemeContext';

interface ThemeToggleProps {
  showTooltip?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ showTooltip = true }) => {
  const { mode, toggleTheme } = useTheme();
  
  const button = (
    <StyledIconButton 
      onClick={toggleTheme}
      color="inherit"
      aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      isDark={mode === 'dark'}
    >
      {mode === 'light' ? (
        <DarkModeIcon className="icon dark-icon" />
      ) : (
        <LightModeIcon className="icon light-icon" />
      )}
    </StyledIconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        {button}
      </Tooltip>
    );
  }
  
  return button;
};

interface StyledIconButtonProps {
  isDark: boolean;
}

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<StyledIconButtonProps>(({ theme, isDark }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '50%',
  transition: 'all 0.3s ease',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: isDark 
      ? 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)' 
      : 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    opacity: 0,
    transform: 'scale(0)',
    transition: 'all 0.3s ease',
  },
  
  '&:hover': {
    transform: 'scale(1.05)',
    background: isDark 
      ? 'rgba(255,255,255,0.08)' 
      : 'rgba(0,0,0,0.04)',
    
    '&::before': {
      opacity: 1,
      transform: 'scale(1)',
    },
    
    '.icon': {
      transform: 'rotate(12deg)',
    },
  },
  
  '.icon': {
    transition: 'transform 0.3s ease',
  },
  
  '.dark-icon': {
    color: theme.palette.primary.dark,
  },
  
  '.light-icon': {
    color: theme.palette.primary.light,
  },
}));

export default ThemeToggle; 