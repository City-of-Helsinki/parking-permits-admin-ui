import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { makePrivate } from '../../../auth/utils';
import DataTable from '../../../components/common/DataTable';
import { Column } from '../../../components/types';
import { useOrderByParam, usePageParam } from '../../../hooks/searchParam';
import { Customer, CustomersQueryData, OrderBy } from '../../../types';

const T_PATH = 'pages.superAdmin.customers';

const CUSTOMERS_QUERY = gql`
  query GetCustomers($pageInput: PageInput!, $orderBy: OrderByInput) {
    customers(pageInput: $pageInput, orderBy: $orderBy) {
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
  const { t } = useTranslation();

  const { pageParam, setPageParam } = usePageParam();
  const { orderByParam, setOrderBy } = useOrderByParam();
  const variables = {
    pageInput: { page: pageParam },
    orderBy: orderByParam,
  };

  const { loading, data, refetch } = useQuery<CustomersQueryData>(
    CUSTOMERS_QUERY,
    {
      variables,
      fetchPolicy: 'no-cache',
    }
  );

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
      name: t(`${T_PATH}.name`),
      field: 'name',
      selector: ({ firstName, lastName }) => `${lastName}, ${firstName}`,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.email`),
      field: 'email',
      selector: ({ email }) => email,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.phoneNumber`),
      field: 'phoneNumber',
      selector: ({ phoneNumber }) => phoneNumber,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.nationalIdNumber`),
      field: 'nationalIdNumber',
      selector: ({ nationalIdNumber }) => nationalIdNumber,
      sortable: true,
    },
  ];

  return (
    <div>
      <h2 className="heading-l">{t(`${T_PATH}.title`)}</h2>
      <DataTable
        columns={columns}
        loading={loading}
        orderBy={orderByParam}
        data={data?.customers.objects}
        onOrderBy={handleOrderBy}
        onPage={handlePage}
        pageInfo={data?.customers.pageInfo}
        rowIdSelector={customer => customer.id}
      />
    </div>
  );
};

export default makePrivate(Customers);
