import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ResponseModel } from '../common';
import Interceptor from './Interceptor';

export default class DefaultInterceptor extends Interceptor {
  axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    super()
    this.axiosInstance = axiosInstance
  }

  /**
     * @param {InternalAxiosRequestConfig} config
     * @param {IResource} resourceType
     * @return {InternalAxiosRequestConfig}
     */
  requestFulfilled = (config: InternalAxiosRequestConfig) => {
    return config
  };

  requestReject = async (error: any) => {
    return await Promise.reject(error)
  };

  responseFulfilled = (response: AxiosResponse) => {
    // Get metadata from MetadataInterceptor
    const metadata = response?.config?.localMetaData;

    console.info('responseRaw: ', response);

    return ResponseModel.createSuccess(response, metadata)
  };

  responseReject = async (error: AxiosError<any, any>) => {
    // Get metadata from MetadataInterceptor
    const metadata = error?.config?.localMetaData;

    let status = 0
    let statusText = ''
    let message = ''
    let rawError
    try {
      if (error.response != null) {
        status = error.response.status
        console.info('DefaultInterceptorReject: ', error.response.status, error.response)

        const errorData = error.response.data
        const errors: any[] | undefined = error.response.data?.errors
        // if ((errors != null) && errors.length > 0) {
        //     message = errors[0].message
        //     rawError = errors
        // } else {
        const { statusCode, message: _message, code: _code } = errorData || {}
        // server was received message, but response smt
        status = !(status >= 200 && status < 300) ? status : statusCode
        statusText = _code
        message = _message || error?.response?.data?.errors?.[0]?.detail
        rawError = errorData ?? errors
        // }
      } else {
        console.error('DefaultInterceptorReject rawErr: ', error)

        // smt went wrong
        status = 500
        message = error?.message
      }
    } catch (error: any) {
      console.error('smt went wrong: ', error)
      // smt went wrong
      status = 500
      message = 'Something went wrong'
    }

    return await Promise.reject(ResponseModel.createError(status, statusText, message, rawError, error?.request, error?.config, error?.response, metadata))
  };
}
