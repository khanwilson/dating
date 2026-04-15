import { IPagination } from "../api/common/IPagination"

export interface IListUsers {
  data: IUser[]
  pagination: IPagination
}

export interface IUser {
  _id: string
  email?: string
  device_id: string
  created_at: string
}