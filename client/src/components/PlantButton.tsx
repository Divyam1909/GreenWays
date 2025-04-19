import React from 'react';
import styled from 'styled-components';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useAppTheme } from '../utils/ThemeContext';

interface PlantButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outlined";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  component?: React.ElementType;
  to?: string;
  startIcon?: React.ReactNode;
  [x: string]: any; // Allow any other props
}

interface LeafIconProps {
  className?: string;
}

const LeafIcon: React.FC<LeafIconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path className="fil-leaf-1" d="M50 10C60 20 80 30 85 40C90 50 70 60 60 55C50 50 45 30 50 10Z" />
  </svg>
);

const LeafIcon2: React.FC<LeafIconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path className="fil-leaf-2" d="M60 15C80 25 90 45 80 65C70 85 40 75 30 60C20 45 30 25 60 15Z" />
  </svg>
);

const LeafIcon3: React.FC<LeafIconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path className="fil-leaf-3" d="M40 20C20 40 10 70 30 80C50 90 70 60 60 40C50 20 40 20 40 20Z" />
  </svg>
);

const LeafIcon4: React.FC<LeafIconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path className="fil-leaf-4" d="M70 30C90 40 90 70 70 80C50 90 30 70 40 50C50 30 70 30 70 30Z" />
  </svg>
);

const LeafIcon5: React.FC<LeafIconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path className="fil-leaf-5" d="M50 20C70 30 80 60 60 80C40 100 20 80 30 50C40 20 50 20 50 20Z" />
  </svg>
);

const PlantButton: React.FC<PlantButtonProps> = ({ 
  children = "Plant based", 
  onClick, 
  type = "button",
  disabled = false,
  className,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  component,
  startIcon,
  to,
  ...rest
}) => {
  const muiTheme = useMuiTheme();
  const { mode } = useAppTheme();
  
  const getColors = () => {
    switch(variant) {
      case "secondary":
        return {
          bg: muiTheme.palette.primary.dark,
          text: '#fff',
          hover: muiTheme.palette.primary.main,
          border: 'none',
          leafColors: {
            leaf1: "#98ee99",
            leaf2: "#81c784",
            leaf3: "#81c784",
            leaf4: "#98ee99",
            leaf5: "#81c784"
          }
        };
      case "outlined":
        return {
          bg: muiTheme.palette.primary.dark,
          text: '#fff',
          border: 'none',
          hover: muiTheme.palette.primary.main,
          leafColors: {
            leaf1: "#7B9B3A",
            leaf2: "#556729",
            leaf3: "#556729",
            leaf4: "#7B9B3A",
            leaf5: "#556729"
          }
        };
      default:
        return {
          bg: muiTheme.palette.primary.dark,
          text: '#fff',
          border: 'none',
          hover: muiTheme.palette.primary.main,
          leafColors: {
            leaf1: "#98ee99",
            leaf2: "#81c784",
            leaf3: "#81c784",
            leaf4: "#98ee99",
            leaf5: "#81c784"
          }
        };
    }
  };
  
  const getSizing = () => {
    switch(size) {
      case "small": return { padding: "8px 24px", fontSize: "14px" };
      case "large": return { padding: "16px 40px", fontSize: "18px" };
      default: return { padding: "12px 32px", fontSize: "16px" };
    }
  };
  
  const colors = getColors();
  const sizing = getSizing();
  
  // Use the component prop if provided, otherwise use a button
  const Component = component || 'button';
  
  return (
    <StyledWrapper 
      className={className ? `plant-button-wrapper ${className}` : 'plant-button-wrapper'}
      colors={colors}
      sizing={sizing}
      fullWidth={fullWidth}
      isDark={mode === 'dark'}
    >
      <Component 
        type={component ? undefined : type} 
        onClick={onClick} 
        disabled={disabled}
        className={variant}
        to={to}
        {...rest}
      >
        {startIcon && <span className="start-icon">{startIcon}</span>}
        {children}
        <LeafIcon className="icon-1" />
        <LeafIcon2 className="icon-2" />
        <LeafIcon3 className="icon-3" />
        <LeafIcon4 className="icon-4" />
        <LeafIcon5 className="icon-5" />
      </Component>
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  colors: any;
  sizing: any;
  fullWidth: boolean;
  isDark: boolean;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  display: ${props => props.fullWidth ? 'block' : 'inline-block'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  position: relative;
  isolation: isolate; /* Create a new stacking context */
  
  .start-icon {
    margin-right: 8px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  button, a {
    position: relative;
    padding: ${props => props.sizing.padding};
    background: ${props => props.colors.bg};
    font-size: ${props => props.sizing.fontSize};
    font-weight: 600;
    color: ${props => props.colors.text};
    border: ${props => props.colors.border || 'none'};
    border-radius: 8px;
    box-shadow: ${props => props.isDark ? 'none' : '0 2px 5px rgba(0,0,0,0.1)'};
    transition: all .3s ease-in-out;
    cursor: pointer;
    width: ${props => props.fullWidth ? '100%' : 'auto'};
    overflow: visible;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    z-index: 1;
    
    &:hover {
      background: ${props => props.colors.hover};
      border-radius: 8px 8px 24px 24px;
      box-shadow: ${props => props.isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)'};
      transform: translateY(-3px);
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
      
      &:hover {
        border-radius: 8px;
        background: ${props => props.colors.bg};
      }
    }
  }

  .icon-1, .icon-2, .icon-3, .icon-4, .icon-5 {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 0px;
    height: auto;
    transition: all .5s ease-in-out;
    pointer-events: none;
    z-index: 20; /* Higher than anything else */
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  }
  
  button:not(:disabled):hover .icon-1, 
  a:not(:disabled):hover .icon-1 {
    top: -250%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 50px;
    height: auto;
    animation: inIcon1 1s ease .15s forwards;
  }

  @keyframes inIcon1 {
    0% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
    25% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(5deg);
    }
    50% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(1deg);
    }
    65% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(3deg);
    }
    100% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
  }

  button:not(:disabled):hover .icon-2,
  a:not(:disabled):hover .icon-2 {
    position: absolute;
    top: -200%;
    left: 90%;
    transform: translate(-50%, 0);
    width: 75px;
    height: auto;
    animation: inIcon2 1s ease .15s forwards;
  }

  @keyframes inIcon2 {
    0% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
    35% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(10deg);
    }
    50% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(4deg);
    }
    80% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(5deg);
    }
    100% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
  }

  button:not(:disabled):hover .icon-3,
  a:not(:disabled):hover .icon-3 {
    position: absolute;
    top: -130%;
    left: 20%;
    transform: translate(-50%, 0);
    width: 60px;
    height: auto;
    animation: inIcon3 1s ease .15s forwards;
  }

  @keyframes inIcon3 {
    0% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
    35% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(-2deg);
    }
    100% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
  }

  button:not(:disabled):hover .icon-4,
  a:not(:disabled):hover .icon-4 {
    position: absolute;
    top: -300%;
    left: 10%;
    transform: translate(-50%, 0);
    width: 85px;
    height: auto;
    animation: inIcon4 1s ease .15s forwards;
  }

  @keyframes inIcon4 {
    0% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
    40% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(-3deg);
    }
    100% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
  }

  button:not(:disabled):hover .icon-5,
  a:not(:disabled):hover .icon-5 {
    position: absolute;
    top: -350%;
    left: 90%;
    transform: translate(-50%, 0);
    width: 85px;
    height: auto;
    animation: inIcon5 1s ease .15s forwards;
  }

  @keyframes inIcon5 {
    0% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
    35% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(-3deg);
    }
    100% {
      transform-origin: 0 100%;
      transform: translate(-50%, 0) rotate(0deg);
    }
  }

  .fil-leaf-1 {
    fill: ${props => props.colors.leafColors.leaf1};
  }

  .fil-leaf-2 {
    fill: ${props => props.colors.leafColors.leaf2};
  }

  .fil-leaf-3 {
    fill: ${props => props.colors.leafColors.leaf3};
  }
  
  .fil-leaf-4 {
    fill: ${props => props.colors.leafColors.leaf4};
  }
  
  .fil-leaf-5 {
    fill: ${props => props.colors.leafColors.leaf5};
  }
`;

export default PlantButton;