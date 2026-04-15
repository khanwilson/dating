import axios, { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import ZustandPersist from 'src/zustand/persist'
import { ResponseModel } from './common'
import { parseFormData, parseFormDataAddress } from './common/parseFunctions'
import AuthenticationInterceptor from './interceptor/AuthenticationInterceptor'
import DefaultInterceptor from './interceptor/DefaultAppInterceptor'
import MetadataInterceptor from './interceptor/MetadataInterceptor'
import { RetryInterceptor } from './interceptor/RetryInterceptor'
import { baseUrl } from './resource'

export type HTTPMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE' | 'POSTFORM'

interface IConfigRequest {
  method: HTTPMethod
  resource: string
  isFormDataType?: boolean
  isFormDataAddress?: boolean
  body?: any
  params?: any
  queryParams?: any
  timeout?: number
  baseURL?: string
}
class ApiGateway {
  _instanceAxios = axios.create()
  configTimeout = 30 * 1000
  requestConfig!: AxiosRequestConfig

  constructor() {
    this._addDefaultInterceptors()
    this._addInterceptors()
  }

  private readonly _addDefaultInterceptors = () => {
    // Add metadata interceptor first to track timing
    const metadataInterceptor = new MetadataInterceptor()
    this._instanceAxios.interceptors.request.use(
      metadataInterceptor.requestFulfilled,
      metadataInterceptor.requestReject
    );
    this._instanceAxios.interceptors.response.use(
      metadataInterceptor.responseFulfilled,
      metadataInterceptor.responseReject
    );

    // Add token
    const authenticationInterceptor = new AuthenticationInterceptor(this._instanceAxios)
    this._instanceAxios.interceptors.request.use(authenticationInterceptor.requestFulfilled)

    // Format data
    const defaultInterceptor = new DefaultInterceptor(this._instanceAxios)
    this._instanceAxios.interceptors.request.use(
      defaultInterceptor.requestFulfilled,
      defaultInterceptor.requestReject
    );
    this._instanceAxios.interceptors.response.use(
      defaultInterceptor.responseFulfilled,
      defaultInterceptor.responseReject
    );

    // Retry interceptor
    const retryInterceptor = new RetryInterceptor(this._instanceAxios)
    this._instanceAxios.interceptors.response.use(
      retryInterceptor.responseFulfilled,
      retryInterceptor.responseReject
    );
  }

  private readonly _addInterceptors = () => {
    // some expand interceptors default can be add here!
  }

  execute = (config: IConfigRequest) => {
    const { method, resource, body, isFormDataType, params, queryParams, timeout, baseURL, isFormDataAddress } = config
    const Token = ZustandPersist?.getState()?.Token;
    const Localization = ZustandPersist?.getState()?.Localization;

    let data = body
    if (isFormDataType) { data = isFormDataAddress ? parseFormDataAddress(body) : parseFormData(body) }
    if (method === 'GET') { data = undefined }
    const headers = {
      'Accept': 'application/json',
      'Content-Type': isFormDataType ? 'multipart/form-data' : 'application/json', // Content-Type = 'application/json' == null
    }
    // @ts-ignore
    if (Localization) headers['language-code'] = Localization
    // @ts-ignore
    headers['device-id'] = '1234567890'
    // @ts-ignore
    if (Token?.token) headers['token'] = Token?.token
    const urlQueryParams = resource + `?${qs.stringify(queryParams, { skipNulls: true })}`

    const configRequest: AxiosRequestConfig<any> = {
      baseURL: baseURL || baseUrl.value,
      timeout: timeout || this.configTimeout,
      headers,
      url: queryParams ? urlQueryParams : resource,
      method,
      params,
      paramsSerializer: {
        encode: (params: any) => qs.stringify(params, {
          skipNulls: true,
          arrayFormat: 'brackets'
        })
      },
      data
    }


    switch (method) {
      case 'DELETE':
        return this._instanceAxios.delete(configRequest.url!, configRequest)
      case 'GET':
        return this._instanceAxios.get(configRequest.url!, configRequest)
      case 'PATCH':
        return this._instanceAxios.patch(configRequest.url!, configRequest?.data, configRequest)
      case 'POST':
        return this._instanceAxios.post(configRequest.url!, configRequest?.data, configRequest)
      case 'PUT':
        return this._instanceAxios.put(configRequest.url!, configRequest?.data, configRequest)
      case 'POSTFORM':
        return this._instanceAxios.postForm(configRequest.url!, configRequest?.data, configRequest)

      default:
        return Promise.reject(ResponseModel.createError(501, '501', 'Method Not Implemented', 'Not Implemented', configRequest, configRequest, undefined))
    }
  };
}

export default new ApiGateway()
