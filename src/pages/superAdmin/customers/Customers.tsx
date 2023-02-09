import { gql, useLazyQuery } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { makePrivate } from '../../../auth/utils';
import DataTable from '../../../components/common/DataTable';
import Divider from '../../../components/common/Divider';
import CustomersSearch from '../../../components/superAdmin/customers/CustomersSearch';
import { Column } from '../../../components/types';
import { useOrderByParam, usePageParam } from '../../../hooks/searchParam';
import {
  Customer,
  CustomerSearchParams,
  CustomersQueryData,
  OrderBy,
} from '../../../types';

const T_PATH = 'pages.superAdmin.customers';

const CUSTOMERS_QUERY = gql`
  query GetCustomers(
    $pageInput: PageInput!
    $orderBy: OrderByInput
    $searchParams: CustomerSearchParamsInput
  ) {
    customers(
      pageInput: $pageInput
      orderBy: $orderBy
      searchParams: $searchParams
    ) {
      objects {
        id
        firstName
        lastName
        nationalIdNumber
        email
        phoneNumber
      }
      pageInfo {
        numPages
        page
        next
        prev
        startIndex
        endIndex
        count
      }
    }
  }
`;

const Customers = (): React.ReactElement => {
  const { t } = useTranslation('', { keyPrefix: T_PATH });
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchParams = {
    name: searchParams.get('name') || '',
    nationalIdNumber: searchParams.get('nationalIdNumber') || '',
  };

  const { pageParam, setPageParam } = usePageParam();
  const { orderByParam: orderBy, setOrderBy } = useOrderByParam();
  const variables = {
    searchParams: initialSearchParams,
    pageInput: { page: pageParam },
    orderBy,
  };

  const [getCustomers, { loading, data, refetch }] =
    useLazyQuery<CustomersQueryData>(CUSTOMERS_QUERY, {
      variables,
      fetchPolicy: 'no-cache',
    });

  const handleSearch = (newSearchParams: CustomerSearchParams) => {
    setSearchParams(
      new URLSearchParams({
        ...newSearchParams,
        ...orderBy,
        page: '1',
      }),
      { replace: true }
    );

    getCustomers({
      variables: {
        searchParams: newSearchParams,
        pageInput: { page: 1 },
        orderBy,
      },
    });
  };

  const handlePage = (newPage: number) => {
    setPageParam(newPage);

    refetch({
      pageInput: { page: newPage },
    });
  };

  const handleOrderBy = (newOrderBy: OrderBy) => {
    setOrderBy(newOrderBy);

    refetch({
      orderBy: newOrderBy,
    });
  };

  const columns: Column<Customer>[] = [
    {
      name: t('name'),
      field: 'name',
      selector: ({ firstName, lastName }) => `${lastName}, ${firstName}`,
      sortable: true,
    },
    {
      name: t('email'),
      field: 'email',
      selector: ({ email }) => email,
      sortable: true,
    },
    {
      name: t('phoneNumber'),
      field: 'phoneNumber',
      selector: ({ phoneNumber }) => phoneNumber,
      sortable: true,
    },
    {
      name: t('nationalIdNumber'),
      field: 'nationalIdNumber',
      selector: ({ nationalIdNumber }) => nationalIdNumber,
      sortable: true,
    },
  ];

  return (
    <div>
      <h2 className="heading-l">{t('title')}</h2>
      <CustomersSearch
        onSearch={handleSearch}
        searchParams={initialSearchParams}
      />
      <Divider />
      <DataTable
        columns={columns}
        loading={loading}
        orderBy={orderBy}
        data={data?.customers.objects}
        onOrderBy={handleOrderBy}
        onPage={handlePage}
        pageInfo={data?.customers.pageInfo}
        rowIdSelector={customer => customer.id}
        onRowClick={customer => navigate(customer.id)}
      />
    </div>
  );
};

export default makePrivate(Customers);
