// Base API Response Types - shared across all modules
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  // Server responded with error status
  if (error.response) {
    return new ApiError(
      error.response.data?.message || error.message || 'An error occurred',
      error.response.status,
      error.response.data
    );
  }
  // Request was made but no response received
  if (error.request) {
    return new ApiError('No response from server', 0);
  }
  // Something else happened
  return new ApiError(error.message || 'An unexpected error occurred');
};
