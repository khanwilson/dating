// Extend Axios types to include metadata
import 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    localMetaData?: {
      requestAt: string;
      responseAt?: string;
      time?: number;
      method: string;
      url: string;
    };
    [key: string]: any;
  }
  export interface AxiosError {
    config?: InternalAxiosRequestConfig;
  }
}
