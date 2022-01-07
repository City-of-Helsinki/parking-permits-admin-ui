import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderBy, PageInfo, Product } from '../../../types';
import {
  formatDateDisplay,
  formatDateTimeDisplay,
  formatMonthlyPrice,
} from '../../../utils';
import DataTable from '../../common/DataTable';
import { Column } from '../../types';

const T_PATH = 'components.superAdmin.products.productsDataTable';

export interface ProductsDataTableProps {
  products: Product[];
  pageInfo?: PageInfo;
  loading: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
  onRowClick?: (product: Product) => void;
}

const ProductsDataTable = ({
  products,
  pageInfo,
  loading,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
}: ProductsDataTableProps): React.ReactElement => {
  const { t } = useTranslation();
  const columns: Column<Product>[] = [
    {
      name: t(`${T_PATH}.productType`),
      field: 'productType',
      selector: ({ type }) => t(`productType.${type.toLowerCase()}`),
      orderFields: ['type'],
    },
    {
      name: t(`${T_PATH}.zone`),
      field: 'zone',
      selector: ({ zone }) => zone,
      orderFields: ['zone__name'],
    },
    {
      name: t(`${T_PATH}.price`),
      field: 'price',
      selector: ({ unitPrice }) => formatMonthlyPrice(unitPrice),
      orderFields: ['unit_price'],
    },
    {
      name: t(`${T_PATH}.vat`),
      field: 'vat',
      selector: ({ vatPercentage }) => `${vatPercentage}%`,
      orderFields: ['vat'],
    },
    {
      name: t(`${T_PATH}.validPeriod`),
      field: 'validPeriod',
      selector: ({ startDate, endDate }) => {
        const formattedStartDate = formatDateDisplay(startDate);
        const formattedEndDate = formatDateDisplay(endDate);
        return `${formattedStartDate} - ${formattedEndDate}`;
      },
      orderFields: ['start_date'],
    },
    {
      name: t(`${T_PATH}.modifiedAt`),
      field: 'modifiedAt',
      selector: ({ modifiedAt }) => formatDateTimeDisplay(modifiedAt),
      orderFields: ['modified_at'],
    },
    {
      name: t(`${T_PATH}.modifiedBy`),
      field: 'modifiedBy',
      selector: ({ modifiedBy }) => modifiedBy || '-',
      orderFields: ['modified_by'],
    },
  ];

  return (
    <DataTable
      data={products}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(product: Product) => product.id}
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
    />
  );
};

export default ProductsDataTable;
