import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import Divider from './common/Divider';
import Header from './Header';
import styles from './MainLayout.module.scss';

const MainLayout = (): React.ReactElement => {
  const userRole = useUserRole();
  const { t } = useTranslation();
  return (
    <div className={styles['main-layout']}>
      <Header />
      <Divider />
      <div className={styles['content-container']}>
        <div className={styles.gutter}>
          {userRole > UserRole.NON_AD_GROUPS && <Outlet />}
          {userRole === UserRole.NON_AD_GROUPS && (
            <div>{t(`message.unauthorized`)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
