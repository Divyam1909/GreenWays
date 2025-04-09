import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
              textAlign: 'center',
              py: 8,
            }}
          >
            <ErrorOutlineIcon 
              color="error" 
              sx={{ fontSize: 80, mb: 4 }} 
            />
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
              We're sorry, but there was an error processing your request. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            <Box sx={{ '& > *': { mx: 1 } }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outlined"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </Box>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <Box 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  width: '100%',
                  overflow: 'auto',
                  textAlign: 'left'
                }}
              >
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'error.main' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 