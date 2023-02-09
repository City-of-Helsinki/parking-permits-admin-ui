import { gql, useQuery } from '@apollo/client';
import { Button, Card, LoadingSpinner } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { makePrivate } from '../../../auth/utils';
import { Announcement } from '../../../types';
import styles from './ViewAnnouncement.module.scss';

const T_PATH = 'pages.superAdmin.announcement';

const ANNOUNCEMENTS_QUERY = gql`
  query GetAnnouncement($announcementId: ID!) {
    announcement(announcementId: $announcementId) {
      id
      subjectFi
      subjectSv
      subjectEn
      contentFi
      contentSv
      contentEn
      createdAt
      createdBy
      parkingZones {
        name
      }
    }
  }
`;

const AnnouncementCard = ({
  subject,
  content,
}: {
  subject: string;
  content: string;
}): React.ReactElement => (
  <Card>
    <p className="heading-xs">{subject}</p>
    {content.match(/[^\r\n]+/g)?.map((line, idx) => (
      // eslint-disable-next-line react/no-array-index-key
      <p key={idx}>{line}</p>
    ))}
  </Card>
);

const ViewAnnouncement = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: announcementId } = useParams();
  const variables = { announcementId };
  const { loading, data } = useQuery<{ announcement: Announcement }>(
    ANNOUNCEMENTS_QUERY,
    {
      variables,
      fetchPolicy: 'no-cache',
    }
  );
  return (
    <div className={styles.container}>
      {loading && <LoadingSpinner style={{ margin: 'auto' }} />}
      {!loading && data?.announcement && (
        <>
          <div className={styles.row}>
            <div className={styles.col}>
              <p className="text-medium">{t(`${T_PATH}.zone`)}</p>
              <p>
                {data.announcement.parkingZones
                  ?.flatMap(parkingZone => parkingZone.name)
                  .sort()
                  .join(', ')}
              </p>
            </div>
            <div className={styles.col}>
              <p className="text-medium">{t(`${T_PATH}.sender`)}</p>
              <p>{data.announcement.createdBy}</p>
            </div>
            <div className={styles.col}>
              <p className="text-medium">{t(`${T_PATH}.sentAt`)}</p>
              <p>{data.announcement.createdAt}</p>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className="heading-s">
                {t(`${T_PATH}.announcementInFinnish`)}
              </h2>
              <AnnouncementCard
                subject={data.announcement.subjectFi}
                content={data.announcement.contentFi}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className="heading-s">
                {t(`${T_PATH}.announcementInSwedish`)}
              </h2>
              <AnnouncementCard
                subject={data.announcement.subjectSv}
                content={data.announcement.contentSv}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <h2 className="heading-s">
                {t(`${T_PATH}.announcementInEnglish`)}
              </h2>
              <AnnouncementCard
                subject={data.announcement.subjectEn}
                content={data.announcement.contentEn}
              />
            </div>
          </div>
        </>
      )}
      <div className={styles.row}>
        <div className={styles.col}>
          <Button onClick={() => navigate('/admin/announcements')}>
            {t(`${T_PATH}.returnToList`)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default makePrivate(ViewAnnouncement);
