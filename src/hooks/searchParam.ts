import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderDirection } from '../components/types';
import { OrderBy } from '../types';

export const usePageParam = (): {
  pageParam: number;
  setPageParam: (newPage: number | string) => void;
} => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get('page');

  return {
    pageParam: pageParam ? parseInt(pageParam, 10) : 1,
    setPageParam: (newPage: number | string) => {
      searchParams.set('page', newPage.toString());
      setSearchParams(searchParams, { replace: true });
    },
  };
};

export const useOrderByParam = (): {
  orderByParam: OrderBy;
  orderFieldParam: string | null;
  orderDirectionParam: string | null;
  setOrderBy: (newOrderBy: OrderBy) => void;
} => {
  const [orderBy, setOrderBy] = useState<OrderBy>({
    orderDirection: OrderDirection.DESC,
    orderField: '',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const orderFieldParam = searchParams.get('orderField');
  const orderDirectionParam = searchParams.get('orderDirection');

  return {
    orderByParam: orderBy,
    orderFieldParam,
    orderDirectionParam,
    setOrderBy: (newOrderBy: OrderBy) => {
      searchParams.set('orderField', newOrderBy.orderField);
      searchParams.set('orderDirection', newOrderBy.orderDirection);
      setSearchParams(searchParams, { replace: true });
      setOrderBy({ ...orderBy, ...newOrderBy });
    },
  };
};
