import { AxiosResponse } from 'axios'
import ApiGateway from 'src/data/api'
import { IParamPaging } from 'src/data/api/common/IPagination'
import { urls } from 'src/data/api/resource'
import { IListUsers } from 'src/data/models/IListUsers'

/**
 * Always store token in session storage for faster retrieve
 * @type {{token: string}}
 */

export const getListUserRepo = async (params: IParamPaging): Promise<AxiosResponse<IListUsers>> => {
  const resource = urls.getListUser
  return ApiGateway.execute({
    method: 'GET',
    resource,
    queryParams: params,
  }).then(async response => {
    return response
  })
}
