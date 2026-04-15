import { IMeta } from './IPagination'

// model & interface for redux

export type IDictionary<T> = Record<string, T>

export interface IActionCallBacks {
    onSuccess?: (data?: any) => void
    onFailed?: (error?: string) => void

    [key: string]: any
}

export interface IActionParams<T> {
    request?: T
    sectionId?: string | number
    isAppend?: boolean
    canLoadMore?: boolean | IDictionary<boolean>

    [key: string]: any
}

export interface IAction<T> {
    type: string
    payload?: T
    params?: IActionParams<any>
    error?: any
    callBacks?: IActionCallBacks

    [key: string]: any
}

export class ResponseModel<T> {
  status: number
  statusText: string
  data: T
  isError: boolean
  request?: any
  headers: any
  config: any
  message?: string
  rawError?: any
  response?: any
  meta?: IMeta
  metadata?: {
    requestAt?: string
    responseAt?: string
    time?: number
    method?: string
    url?: string
  }

  constructor(
    status: number,
    statusText: string,
    data: T,
    isError = false
  ) {
    this.status = status
    this.statusText = statusText
    this.data = data
    this.isError = isError
  }

  static createSuccess(res: any, metadata?: any): ResponseModel<any> {
    const response = new ResponseModel(200, '200', undefined)
    response.status = res.status
    response.statusText = res.statusText
    response.data = res.data
    response.isError = false
    response.request = res.request
    response.headers = res.headers
    response.config = res.config
    response.metadata = metadata
    return response
  }

  static createError(
    status: number,
    statusText: string,
    message?: string,
    rawError?: any,
    request?: any,
    config?: any,
    responseError?: any,
    metadata?: any,
  ): ResponseModel<any> {
    const response = new ResponseModel(0, '', undefined)
    response.status = status
    response.statusText = statusText
    response.isError = true
    response.message = message
    response.rawError = rawError
    response.request = request
    response.config = config
    response.response = responseError
    response.metadata = metadata
    return response
  }
}
// model & interface for
