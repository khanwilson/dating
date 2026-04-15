import { useCallback, useState } from 'react';
import { PromiseHandler } from 'src/data/api/common/takeLastest';
import { IListUsers } from 'src/data/models/IListUsers';
import { getListUserRepo } from 'src/data/repositories/user/getListUserRepo';

interface IOptions {
  withoutLoading?: boolean,
  onSuccess?: (data?: any) => void,
  onFailed?: (error?: any) => void,
}

interface IParamApi {
}

const limit = 20
// =====
export const useGetListUsers = () => {
  const [data, setData] = useState<IListUsers[]>()
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1)

  const fetch = useCallback(async (options?: IOptions) => {
    !options?.withoutLoading && setIsLoading(true)
    try {
      const response = await handlerFirst.takeLatest(getListUserRepo({ page: 1, limit }))
      setPage(1)
      setData(response?.data)
      options?.onSuccess?.(response?.data)
    } catch (error: any) {
      if (!!error) {
        setError(error?.message)
        options?.onFailed?.(error?.message)
      }
    } finally {
      !options?.withoutLoading && setIsLoading(false)
    }
  }, [])

  const fetchMore = useCallback(async (params?: IParamApi, options?: IOptions) => {
    !options?.withoutLoading && setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await handlerMore.takeLatest(getListUserRepo({ page: nextPage, limit }))
      setPage(nextPage)
      setData((prev) => [...(prev || []), ...response?.data])
      options?.onSuccess?.(response?.data)
    } catch (error: any) {
      if (!!error) {
        setError(error?.message)
        options?.onFailed?.(error?.message)
      }
    } finally {
      !options?.withoutLoading && setIsLoadingMore(false)
    }
  }, [page])

  return {
    fetch,
    data,
    isLoading,
    isLoadingMore,
    fetchMore,
    error,
  }
}

// =====
const handlerFirst = new PromiseHandler<any[]>();
const handlerMore = new PromiseHandler<any[]>();

