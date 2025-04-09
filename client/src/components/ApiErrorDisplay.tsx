import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ApiErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  fullPage?: boolean;
  showDetails?: boolean;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  fullPage = false,
  showDetails = false
}) => {
  const [showMore, setShowMore] = React.useState(showDetails);

  // Extract relevant error information
  const errorMessage = error?.message || 'An unknown error occurred';
  const errorStatus = error?.status || 'Error';
  const errorDetails = error?.details || JSON.stringify(error, null, 2);
  
  if (fullPage) {
    return (
      <FullPageError>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {errorStatus === 503 ? 'Server Connection Error' : 'Something went wrong'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {errorMessage}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {onRetry && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </Box>
        
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={() => setShowMore(!showMore)}
              sx={{ mb: 1 }}
            >
              {showMore ? 'Hide Details' : 'Show Details'}
            </Button>
            
            <Collapse in={showMore}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  maxHeight: 200,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {errorDetails}
              </Paper>
            </Collapse>
          </Box>
        )}
      </FullPageError>
    );
  }

  return (
    <StyledAlert 
      severity="error" 
      action={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onRetry && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={onRetry}
              sx={{ mr: 1 }}
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <IconButton
              color="inherit"
              size="small"
              onClick={onDismiss}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
      }
    >
      <AlertTitle>{errorStatus === 503 ? 'Connection Error' : 'Error'}</AlertTitle>
      {errorMessage}
      
      {process.env.NODE_ENV === 'development' && (
        <>
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={() => setShowMore(!showMore)}
            sx={{ mt: 1, p: 0, minWidth: 'auto' }}
          >
            {showMore ? 'Hide Details' : 'Show Details'}
          </Button>
          
          <Collapse in={showMore}>
            <Box
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: 1,
                maxHeight: 150,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {errorDetails}
            </Box>
          </Collapse>
        </>
      )}
    </StyledAlert>
  );
};

const FullPageError = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  minHeight: '60vh',
  maxWidth: '100%',
  textAlign: 'center'
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiAlert-message': {
    width: '100%'
  }
}));

export default ApiErrorDisplay; 