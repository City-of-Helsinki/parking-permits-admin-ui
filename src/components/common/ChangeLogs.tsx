import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChangeLog, ChangeLogEvent, Order, Refund } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import { Column } from '../types';
import DataTable from './DataTable';

const T_PATH = 'components.common.changeLogs';

export interface ChangeLogsProps {
  changeLogs: ChangeLog[];
}

const ChangeLogs = ({ changeLogs }: ChangeLogsProps): React.ReactElement => {
  const { t } = useTranslation('', { keyPrefix: T_PATH });
  const eventLabels = {
    [ChangeLogEvent.CREATED]: t('changelogEvent.CREATED'),
    [ChangeLogEvent.CHANGED]: t('changelogEvent.CHANGED'),
  };

  const generateDescription = ({ key, context, relatedObject }: ChangeLog) => {
    const changes = context?.changes;
    return (
      <>
        {t(`descriptions.${key}`, { relatedObjectId: relatedObject?.id })}
        {changes &&
          Object.entries(changes).map(([fieldName, [oldValue, newValue]]) => {
            const label = t(`fieldNames.${fieldName}`);
            const value = `${oldValue} -> ${newValue}`;
            return (
              <div key={fieldName}>
                {label}: {value}
              </div>
            );
          })}
      </>
    );
  };

  const columns: Column<ChangeLog>[] = [
    {
      name: t('createdAt'),
      field: 'createdAt',
      selector: ({ createdAt }) => formatDateTimeDisplay(createdAt),
      sortable: false,
    },
    {
      name: t('event'),
      field: 'event',
      selector: ({ event }) => (event ? eventLabels[event] : '-'),
      sortable: false,
    },
    {
      name: t('description'),
      field: 'key',
      selector: generateDescription,
      sortable: false,
    },
    {
      name: t('validityPeriod'),
      field: 'validityPeriod',
      selector: ({ validityPeriod }) =>
        validityPeriod
          ? `${formatDateTimeDisplay(
              validityPeriod[0]
            )} - ${formatDateTimeDisplay(validityPeriod[1])}`
          : '',
      sortable: false,
    },
    {
      name: t('sum'),
      field: 'sum',
      selector: ({ relatedObject }) => {
        switch (relatedObject?.__typename) {
          case 'OrderNode':
            return (relatedObject as Order).totalPrice;
          case 'RefundNode':
            return (relatedObject as Refund).amount;
          default:
            return '';
        }
      },
      sortable: false,
    },
    {
      name: t('paymentType'),
      field: 'paymentType',
      selector: ({ relatedObject }) => {
        switch (relatedObject?.__typename) {
          case 'OrderNode':
            return t(`paymentTypes.${(relatedObject as Order).paymentType}`);
          case 'RefundNode':
            return (
              <Link to={`/refunds/${relatedObject.id}`}>
                {t('paymentTypes.REFUND')}
              </Link>
            );
          default:
            return '';
        }
      },
      sortable: false,
    },
    {
      name: t('createdBy'),
      field: 'createdBy',
      selector: ({ createdBy }) => createdBy || '-',
      sortable: false,
    },
  ];

  return (
    <DataTable
      data={changeLogs}
      columns={columns}
      rowIdSelector={(changeLog: ChangeLog) => changeLog.id}
    />
  );
};

export default ChangeLogs;
