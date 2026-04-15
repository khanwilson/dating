import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useApiLogStore } from '../debug/useApiLogStore';
import { devMode } from '../resource';
import Interceptor from './Interceptor';

interface LocalMetaData {
  requestAt: string;
  responseAt?: string;
  time?: number; // in seconds
  method: string;
  url: string;
}

export default class MetadataInterceptor extends Interceptor {
  /**
   * Add request timestamp to config metadata
   * @param {InternalAxiosRequestConfig} config
   * @return {InternalAxiosRequestConfig}
   */
  requestFulfilled = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const requestAt = new Date().toISOString();

    // Add metadata to config
    const localMetaData: LocalMetaData = {
      requestAt,
      method: config.method?.toUpperCase() || 'UNKNOWN',
      url: `${config.baseURL}${config.url}` || 'UNKNOWN'
    };

    // Store metadata in config for later use
    config.localMetaData = {
      ...localMetaData
    };

    return config;
  };

  requestReject = async (error: any) => {
    console.error('❌ Request Error:', error);
    return await Promise.reject(error);
  };

  responseFulfilled = (response: AxiosResponse): AxiosResponse => {
    const responseAt = new Date().toISOString();

    if (response?.config?.localMetaData) {
      const localMetaData = response?.config?.localMetaData;
      const requestAtTime = new Date(localMetaData.requestAt).getTime();
      const responseAtTime = new Date(responseAt).getTime();
      const time = Math.round((responseAtTime - requestAtTime) / 1000 * 100) / 100; // Convert to seconds with 2 decimal places

      // Update metadata
      response.config.localMetaData.responseAt = responseAt;
      response.config.localMetaData.time = time;

      if (!devMode.value) return response; // Only log in dev mode
      // Add to log store
      useApiLogStore.getState().addLog({
        method: localMetaData.method,
        url: localMetaData.url,
        requestAt: localMetaData.requestAt,
        responseAt,
        time,
        status: response.status,
        success: true,
        requestData: response?.config?.data,
        responseData: response.data
      });
    }

    return response;
  };

  responseReject = async (error: AxiosError<any, any>): Promise<any> => {
    const responseAt = new Date().toISOString();

    if (error?.config?.localMetaData) {
      const localMetaData = error?.config?.localMetaData;
      const requestAtTime = new Date(localMetaData.requestAt).getTime();
      const responseAtTime = new Date(responseAt).getTime();
      const time = Math.round((responseAtTime - requestAtTime) / 1000 * 100) / 100; // Convert to seconds with 2 decimal places

      // Update metadata
      error.config.localMetaData.responseAt = responseAt;
      error.config.localMetaData.time = time;

      if (!devMode.value) await Promise.reject(error); // Only log in dev mode
      // Add to log store
      useApiLogStore.getState().addLog({
        method: localMetaData.method,
        url: localMetaData.url,
        requestAt: localMetaData.requestAt,
        responseAt,
        time,
        status: error.response?.status || 'NETWORK_ERROR',
        success: false,
        requestData: error?.config?.data,
        responseData: error.response?.data,
        errorMessage: error.message
      });
    }

    return await Promise.reject(error);
  };
}
