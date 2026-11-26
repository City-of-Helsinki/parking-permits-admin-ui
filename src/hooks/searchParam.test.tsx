import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router';
import { OrderDirection } from '../components/types';
import { OrderBy } from '../types';
import { useOrderByParam, usePageParam } from './searchParam';

const createRouterWrapper = (initialEntry: string) => {
  const RouterWrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  RouterWrapper.displayName = 'RouterWrapper';
  return RouterWrapper;
};

describe('usePageParam', () => {
  it.each([
    { initialEntry: '/', expectedPage: 1 },
    { initialEntry: '/?page=7', expectedPage: 7 },
  ])(
    'reads the page number from $initialEntry',
    ({ initialEntry, expectedPage }) => {
      const { result } = renderHook(() => usePageParam(), {
        wrapper: createRouterWrapper(initialEntry),
      });

      expect(result.current.pageParam).toBe(expectedPage);
    }
  );

  it('updates the page query while preserving other parameters and replacing history', () => {
    const { result } = renderHook(
      () => {
        const page = usePageParam();
        const { search } = useLocation();
        const navigationType = useNavigationType();
        return { ...page, search, navigationType };
      },
      { wrapper: createRouterWrapper('/?filter=active&page=2') }
    );

    act(() => result.current.setPageParam(3));
    expect(result.current.pageParam).toBe(3);
    expect(result.current.search).toBe('?filter=active&page=3');
    expect(result.current.navigationType).toBe('REPLACE');

    act(() => result.current.setPageParam('4'));
    expect(result.current.pageParam).toBe(4);
    expect(result.current.search).toBe('?filter=active&page=4');
  });
});

describe('useOrderByParam', () => {
  it('returns default ordering and current URL ordering parameters', () => {
    const { result } = renderHook(
      () => {
        const ordering = useOrderByParam();
        const { search } = useLocation();
        return { ...ordering, search };
      },
      {
        wrapper: createRouterWrapper(
          '/?orderField=createdAt&orderDirection=ASC'
        ),
      }
    );

    expect(result.current.orderByParam).toEqual({
      orderDirection: OrderDirection.DESC,
      orderField: '',
    });
    expect(result.current.orderFieldParam).toBe('createdAt');
    expect(result.current.orderDirectionParam).toBe('ASC');
  });

  it('updates order state and query parameters while preserving others', () => {
    const { result } = renderHook(
      () => {
        const ordering = useOrderByParam();
        const { search } = useLocation();
        const navigationType = useNavigationType();
        return { ...ordering, search, navigationType };
      },
      { wrapper: createRouterWrapper('/?filter=active&page=2') }
    );
    const nextOrder: OrderBy = {
      orderField: 'createdAt',
      orderDirection: OrderDirection.ASC,
    };

    act(() => result.current.setOrderBy(nextOrder));
    expect(result.current.orderByParam).toEqual(nextOrder);

    expect(result.current.orderFieldParam).toBe('createdAt');
    expect(result.current.orderDirectionParam).toBe(OrderDirection.ASC);
    expect(result.current.search).toBe(
      '?filter=active&page=2&orderField=createdAt&orderDirection=ASC'
    );
    expect(result.current.navigationType).toBe('REPLACE');
  });
});
