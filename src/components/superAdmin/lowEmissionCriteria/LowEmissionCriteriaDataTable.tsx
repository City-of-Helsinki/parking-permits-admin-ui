import React from 'react';
import { useTranslation } from 'react-i18next';
import { LowEmissionCriterion, OrderBy, PageInfo } from '../../../types';
import { formatDateDisplay } from '../../../utils';
import DataTable from '../../common/DataTable';
import { Column } from '../../types';

const T_PATH =
  'components.superAdmin.lowEmissionCriteria.lowEmissionCriteriaDataTable';

export interface LowEmissionCriteriaDataTableProps {
  criteria: LowEmissionCriterion[];
  pageInfo?: PageInfo;
  loading: boolean;
  orderBy?: OrderBy;
  onPage?: (page: number) => void;
  onOrderBy: (orderBy: OrderBy) => void;
  onRowClick?: (criterion: LowEmissionCriterion) => void;
  onExport?: () => void;
}

const LowEmissionCriteriaDataTable = ({
  criteria,
  pageInfo,
  loading,
  orderBy,
  onPage,
  onOrderBy,
  onRowClick,
  onExport,
}: LowEmissionCriteriaDataTableProps): React.ReactElement => {
  const { t } = useTranslation();
  const columns: Column<LowEmissionCriterion>[] = [
    {
      name: t(`${T_PATH}.euroMinClassLimit`),
      field: 'euroMinClassLimit',
      selector: criterion => criterion.euroMinClassLimit,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.nedcMaxEmissionLimit`),
      field: 'nedcMaxEmissionLimit',
      selector: criterion => criterion.nedcMaxEmissionLimit,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.wltpMaxEmissionLimit`),
      field: 'wltpMaxEmissionLimit',
      selector: criterion => criterion.wltpMaxEmissionLimit,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.validPeriod`),
      field: 'validPeriod',
      selector: ({ startDate, endDate }) =>
        `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`,
      sortable: true,
    },
  ];

  return (
    <DataTable
      data={criteria}
      loading={loading}
      pageInfo={pageInfo}
      columns={columns}
      orderBy={orderBy}
      rowIdSelector={(criterion: LowEmissionCriterion) =>
        criterion.id as string
      }
      onPage={onPage}
      onOrderBy={onOrderBy}
      onRowClick={onRowClick}
      onExport={onExport}
    />
  );
};

export default LowEmissionCriteriaDataTable;
