import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChangeLog, ChangeLogEvent } from '../../types';
import { formatDateTimeDisplay } from '../../utils';
import { Column } from '../types';
import DataTable from './DataTable';

const T_PATH = 'components.common.changeLogs';

export interface ChangeLogsProps {
  changeLogs: ChangeLog[];
}

const ChangeLogs = ({ changeLogs }: ChangeLogsProps): React.ReactElement => {
  const { t } = useTranslation();
  const eventLabels = {
    [ChangeLogEvent.CREATED]: t('changelogEvent.created'),
    [ChangeLogEvent.CHANGED]: t('changelogEvent.changed'),
  };
  const columns: Column<ChangeLog>[] = [
    {
      name: t(`${T_PATH}.createdAt`),
      field: 'createdAt',
      selector: ({ createdAt }) => formatDateTimeDisplay(createdAt),
    },
    {
      name: t(`${T_PATH}.event`),
      field: 'event',
      selector: ({ event }) => (event ? eventLabels[event] : '-'),
    },
    {
      name: t(`${T_PATH}.description`),
      field: 'description',
      selector: ({ description }) => description || '-',
    },
    {
      name: t(`${T_PATH}.createdBy`),
      field: 'createdBy',
      selector: ({ createdBy }) => createdBy || '-',
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
