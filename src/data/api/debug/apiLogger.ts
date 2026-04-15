// API Logger exports for easy import
export { ApiLogEdgeSwipe } from './ApiLogEdgeSwipe';
export { ApiLoggerProvider, hocApiLogger } from './ApiLoggerProvider';
export { ModalApiLogs } from './ModalApiLogs';
export { useApiLogStore } from './useApiLogStore';
export type { ApiLogEntry } from './useApiLogStore';

// Configuration for different environments
export const ApiLogConfig = {
  // Enable in development by default
  development: {
    enabled: true,
    maxLogs: 100,
    showFloatingButton: true,
  },
  // Enable in staging for testing
  staging: {
    enabled: true,
    maxLogs: 50,
    showFloatingButton: true,
  },
  // Disable in production by default, but can be enabled via backdoor
  production: {
    enabled: false, // Can be toggled via secret gesture
    maxLogs: 50,
    showFloatingButton: true, // Hidden by default, shown via secret gesture
  },
};

// Helper to get config based on environment
export const getApiLogConfig = () => {
  if (__DEV__) {
    return ApiLogConfig.development;
  }
  
  // You can add logic here to detect staging vs production
  // For example, check a build config or environment variable
  return ApiLogConfig.production;
};
