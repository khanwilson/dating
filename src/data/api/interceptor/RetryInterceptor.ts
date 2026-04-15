import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ResponseModel } from '../common'
import Interceptor from './Interceptor'

// type RefreshTokenCallback = (token: string, refreshToken?: string) => void

// let isRefreshing = false
// const isForceLogout = false
// let refreshSubscribers: RefreshTokenCallback[] = []

export class RetryInterceptor extends Interceptor {
  axiosInstance: AxiosInstance

  constructor(axiosInstance: AxiosInstance) {
    super()
    this.axiosInstance = axiosInstance
  }

  requestFulfilled = (config: InternalAxiosRequestConfig) => {
    return config
  };

  requestReject = async (error: any) => {
    return await Promise.reject(error)
  };

  responseFulfilled = (response: AxiosResponse) => {
    return response
  };

  responseReject = async (error: ResponseModel<any>) => {
    // if (error.config?.url == urls.refreshToken && error.response.status == 422 && !isForceLogout) {
    //   isForceLogout = true
    //   isRefreshing = false
    //   return;
    // }

    // const isExpiredToken = expired && dayjs().isAfter(dayjs(expired))

    // let status = 0
    // if (error.response != null && !isForceLogout && urls.logout !== error.config?.url) {
    //   status = error.response.status
    //   if (status == 403) {
    //     // force logout
    //     emitShowToast({ type: 'Info', toastMessage: getString('tokenTimeout') })
    //     onLogout('force')
    //     const originalRequest = error.config ?? {}
    //     if (!isRefreshing) {
    //       isRefreshing = true
    //       // call api refreshToken:
    //       refreshTokenRepo().then((response: AxiosResponse) => {
    //         isRefreshing = false;
    //         onRefreshed(response?.data!.access_token, response?.data!.refresh_token);
    //       }).catch((e) => {
    //         emitShowAppLoading(false)
    //       })
    //     }

    //     const retryOrigReq = new Promise((resolve, reject) => {
    //       const handler: RefreshTokenCallback = async (token, refreshToken) => {
    //         // replace the expired token and retry
    //         if ((originalRequest?.headers) == null) {
    //           originalRequest.headers = {}
    //         }
    //         originalRequest.headers.Authorization = `Bearer ${token}`
    //         setTokenUser({ token: token, refreshToken: refreshToken })

    //         resolve(this.axiosInstance.request(originalRequest))
    //       };
    //       subscribeTokenRefresh(handler)
    //     })
    //     return await retryOrigReq
    //   } else {
    //     return await Promise.reject(error)
    //   }
    // }

    return await Promise.reject(error)
  };
}

// const subscribeTokenRefresh = (cb: RefreshTokenCallback) => {
//   refreshSubscribers.push(cb)
// }

// const onRefreshed = (token: string, refreshToken?: string) => {
//   refreshSubscribers.map(cb => cb(token, refreshToken))
//   refreshSubscribers = []
// }
