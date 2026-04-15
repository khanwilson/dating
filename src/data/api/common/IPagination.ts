export interface IParamPaging {
  page: number,
  limit: number,
}

export interface IMeta {
  include: any,
  custom: any,
  pagination: IPagination
}

export interface IPagination {
  page: number,
  limit: number,
  total: number,
  totalPages: number
}
