import { useState, useCallback } from 'react';
import { isDbConnectionError } from './apiErrorHandler';

export interface UseApiErrorOptions {
  onError?: (error: any) => void;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseApiErrorResult {
  error: any;
  isLoading: boolean;
  retries: number;
  handleError: (error: any) => void;
  handleRetry: () => void;
  handleDismiss: () => void;
  resetError: () => void;
}

/**
 * Custom hook for handling API errors with advanced features
 */
export const useApiError = (options: UseApiErrorOptions = {}): UseApiErrorResult => {
  const {
    onError,
    onRetry,
    onDismiss,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1500
  } = options;

  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [retries, setRetries] = useState<number>(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clear any existing retry timeout
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  }, [retryTimeout]);

  // Handle error and initiate auto-retry if configured
  const handleError = useCallback((err: any) => {
    clearRetryTimeout();
    setError(err);
    
    // Call optional onError callback
    if (onError) {
      onError(err);
    }

    // Only auto-retry for specific types of errors, like connection issues
    if (autoRetry && retries < maxRetries && isDbConnectionError(err)) {
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setRetries((prev) => prev + 1);
        if (onRetry) {
          onRetry();
        }
        setIsLoading(false);
      }, retryDelay);
      
      setRetryTimeout(timeout as unknown as NodeJS.Timeout);
    }
  }, [autoRetry, clearRetryTimeout, maxRetries, onError, onRetry, retries, retryDelay]);

  // Manually retry the operation
  const handleRetry = useCallback(() => {
    clearRetryTimeout();
    setIsLoading(true);
    setRetries((prev) => prev + 1);
    
    if (onRetry) {
      // Small delay to show loading state
      setTimeout(() => {
        onRetry();
        setIsLoading(false);
      }, 300);
    } else {
      setIsLoading(false);
    }
  }, [clearRetryTimeout, onRetry]);

  // Dismiss the error
  const handleDismiss = useCallback(() => {
    clearRetryTimeout();
    setError(null);
    setRetries(0);
    
    if (onDismiss) {
      onDismiss();
    }
  }, [clearRetryTimeout, onDismiss]);

  // Reset error state
  const resetError = useCallback(() => {
    clearRetryTimeout();
    setError(null);
    setRetries(0);
    setIsLoading(false);
  }, [clearRetryTimeout]);

  return {
    error,
    isLoading,
    retries,
    handleError,
    handleRetry,
    handleDismiss,
    resetError
  };
};

export default useApiError; 