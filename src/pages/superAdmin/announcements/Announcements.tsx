import { gql, useQuery } from '@apollo/client';
import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import DataTable from '../../../components/common/DataTable';
import { Column } from '../../../components/types';
import { useOrderByParam, usePageParam } from '../../../hooks/searchParam';
import { Announcement, AnnouncementsQueryData, OrderBy } from '../../../types';
import { formatDateTimeDisplayWithoutSeconds } from '../../../utils';
import styles from './Announcements.module.scss';

const T_PATH = 'pages.superAdmin.announcements';

const ANNOUNCEMENTS_QUERY = gql`
  query GetAnnouncements($pageInput: PageInput!, $orderBy: OrderByInput) {
    announcements(pageInput: $pageInput, orderBy: $orderBy) {
      objects {
        id
        subjectFi
        subjectSv
        subjectEn
        createdAt
        createdBy
        parkingZones {
          name
        }
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

const Announcements = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { pageParam, setPageParam } = usePageParam();
  const { orderByParam, setOrderBy } = useOrderByParam();
  const variables = {
    pageInput: { page: pageParam },
    orderBy: orderByParam,
  };

  const { loading, data, refetch } = useQuery<AnnouncementsQueryData>(
    ANNOUNCEMENTS_QUERY,
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

  const columns: Column<Announcement>[] = [
    {
      name: t(`${T_PATH}.subject`),
      field: 'subject',
      selector: announcement => {
        switch (i18n.language) {
          case 'fi':
            return announcement.subjectFi;
          case 'sv':
            return announcement.subjectSv;
          case 'en':
            return announcement.subjectEn;
          default:
            return announcement.subjectFi;
        }
      },
      sortable: false,
    },
    {
      name: t(`${T_PATH}.zones`),
      field: 'zones',
      selector: ({ parkingZones }) =>
        parkingZones
          .flatMap(parkingZone => parkingZone.name)
          .sort()
          .join(', '),
      sortable: false,
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
      selector: ({ createdAt }) =>
        formatDateTimeDisplayWithoutSeconds(createdAt),
      sortable: true,
    },
  ];

  return (
    <div>
      <div className={styles.toolbar}>
        <h2 className="heading-l">{t(`${T_PATH}.title`)}</h2>
        <Button
          style={{ marginLeft: 'auto' }}
          onClick={() => navigate('/admin/announcements/create')}>
          {t(`${T_PATH}.createNewAnnouncement`)}
        </Button>
      </div>
      <DataTable
        columns={columns}
        loading={loading}
        orderBy={orderByParam}
        data={data?.announcements.objects}
        rowIdSelector={announcement => announcement.id}
        onOrderBy={handleOrderBy}
        onPage={handlePage}
        onRowClick={announcement => navigate(announcement.id)}
        pageInfo={data?.announcements.pageInfo}
      />
    </div>
  );
};

export default makePrivate(Announcements);
