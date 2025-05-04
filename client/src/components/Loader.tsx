import React from 'react';
import styled from 'styled-components';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface LoaderProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  text = 'Loading...', 
  size = 'medium', 
  fullScreen = false 
}) => {
  const theme = useTheme();
  
  const getSize = () => {
    switch(size) {
      case 'small': return { tree: 30, container: 60, fontSize: 14 };
      case 'large': return { tree: 70, container: 140, fontSize: 18 };
      default: return { tree: 50, container: 100, fontSize: 16 };
    }
  };
  
  const { tree, container, fontSize } = getSize();
  
  return (
    <StyledWrapper 
      $fullScreen={fullScreen}
      $color={theme.palette.primary.main}
      $colorLight={theme.palette.primary.light}
      $colorDark={theme.palette.primary.dark}
      $textColor={theme.palette.text.secondary}
    >
      <Box className="loader-container" sx={{ width: container, height: container }}>
        <div className="tree" style={{ width: tree, height: tree }}>
          <div className="branch" style={{"--x": 0} as any}>
            <span style={{"--i": 0} as any} />
            <span style={{"--i": 1} as any} />
            <span style={{"--i": 2} as any} />
            <span style={{"--i": 3} as any} />
          </div>
          <div className="branch" style={{"--x": 1} as any}>
            <span style={{"--i": 0} as any} />
            <span style={{"--i": 1} as any} />
            <span style={{"--i": 2} as any} />
            <span style={{"--i": 3} as any} />
          </div>
          <div className="branch" style={{"--x": 2} as any}>
            <span style={{"--i": 0} as any} />
            <span style={{"--i": 1} as any} />
            <span style={{"--i": 2} as any} />
            <span style={{"--i": 3} as any} />
          </div>
          <div className="branch" style={{"--x": 3} as any}>
            <span style={{"--i": 0} as any} />
            <span style={{"--i": 1} as any} />
            <span style={{"--i": 2} as any} />
            <span style={{"--i": 3} as any} />
          </div>
          <div className="stem">
            <span style={{"--i": 0} as any} />
            <span style={{"--i": 1} as any} />
            <span style={{"--i": 2} as any} />
            <span style={{"--i": 3} as any} />
          </div>
          <span className="shadow" />
        </div>
      </Box>
      
      {text && (
        <Typography 
          variant="body1" 
          className="loader-text"
          sx={{ 
            mt: 2, 
            fontSize: fontSize,
            fontWeight: 500
          }}
        >
          {text}
        </Typography>
      )}
      
      {/* Fallback circular progress in case the animation doesn't load properly */}
      <CircularProgress 
        className="fallback" 
        size={tree} 
        thickness={4}
      />
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  $fullScreen: boolean;
  $color: string;
  $colorLight: string;
  $colorDark: string;
  $textColor: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${props => props.$fullScreen ? '100vh' : 'auto'};
  
  .loader-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .fallback {
    position: absolute;
    opacity: 0;
    animation: fadeIn 2s ease 2s forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .loader-text {
    color: ${props => props.$textColor};
    text-align: center;
  }

  .tree {
    position: relative;
    transform-style: preserve-3d;
    transform: rotateX(-20deg) rotateY(0deg);
    animation: treeAnimate 2s linear infinite;
  }

  @keyframes treeAnimate {
    0% {
      transform: rotateX(-20deg) rotateY(0deg);
    }
    100% {
      transform: rotateX(-20deg) rotateY(360deg);
    }
  }

  .tree div {
    position: absolute;
    top: -50px;
    left: 0;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateY(calc(25px * var(--x))) translateZ(0px);
  }

  .tree div.branch span {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, ${props => props.$color}, ${props => props.$colorLight});
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    border-bottom: 5px solid rgba(0, 0, 0, 0.1);
    transform-origin: bottom;
    transform: rotateY(calc(90deg * var(--i))) rotateX(30deg) translateZ(28.5px);
  }

  .tree div.stem span {
    position: absolute;
    top: 110px;
    left: calc(50% - 7.5px);
    width: 15px;
    height: 50%;
    background: linear-gradient(90deg, #8B4513, ${props => props.$colorDark});
    border-bottom: 5px solid rgba(0, 0, 0, 0.1);
    transform-origin: bottom;
    transform: rotateY(calc(90deg * var(--i))) translateZ(7.5px);
  }

  .shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    filter: blur(20px);
    transform-style: preserve-3d;
    transform: rotateX(90deg) translateZ(-65px) scale(0.8);
  }
`;

export default Loader; 