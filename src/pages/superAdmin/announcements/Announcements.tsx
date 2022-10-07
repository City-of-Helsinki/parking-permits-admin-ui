import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '../../../components/common/DataTable';
import { Column } from '../../../components/types';
import styles from './Announcements.module.scss';

const T_PATH = 'pages.superAdmin.announcements';

const Announcements = (): React.ReactElement => {
  const { t } = useTranslation();

  const columns: Column<string>[] = [
    {
      name: t(`${T_PATH}.subject`),
      field: 'subject',
      selector: ({ subject }) => subject,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.zones`),
      field: 'zones',
      selector: ({ zones }) => zones,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.sender`),
      field: 'createdBy',
      selector: ({ createdBy }) => createdBy,
      sortable: true,
    },
    {
      name: t(`${T_PATH}.sentAt`),
      field: 'createdAt',
      selector: ({ createdAt }) => createdAt,
      sortable: true,
    },
  ];

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className="heading-l">{t(`${T_PATH}.title`)}</h1>
        <Button style={{ marginLeft: 'auto' }}>
          {t(`${T_PATH}.createNewAnnouncement`)}
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={[]}
        rowIdSelector={announcement => announcement.id}
      />
    </div>
  );
};

export default Announcements;
