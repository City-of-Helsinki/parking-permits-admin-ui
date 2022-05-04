import React from 'react';
import { useTranslation } from 'react-i18next';
import { LowEmissionCriterion, OrderBy, PageInfo } from '../../../types';
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
      name: t(`${T_PATH}.powerType`),
      field: 'powerType',
      selector: criterion => criterion.powerType,
      orderFields: ['power_type'],
    },
    {
      name: t(`${T_PATH}.nedcMaxEmissionLimit`),
      field: 'nedcMaxEmissionLimit',
      selector: criterion => criterion.nedcMaxEmissionLimit,
      orderFields: ['nedc_max_emission_limit'],
    },
    {
      name: t(`${T_PATH}.wltpMaxEmissionLimit`),
      field: 'wltpMaxEmissionLimit',
      selector: criterion => criterion.wltpMaxEmissionLimit,
      orderFields: ['wltp_max_emission_limit'],
    },
    {
      name: t(`${T_PATH}.euroMinClassLimit`),
      field: 'euroMinClassLimit',
      selector: criterion => criterion.euroMinClassLimit,
      orderFields: ['euro_min_class_limit'],
    },
    {
      name: t(`${T_PATH}.startDate`),
      field: 'startDate',
      selector: criterion => criterion.startDate,
      orderFields: ['start_date'],
    },
    {
      name: t(`${T_PATH}.endDate`),
      field: 'endDate',
      selector: criterion => criterion.endDate,
      orderFields: ['end_date'],
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
