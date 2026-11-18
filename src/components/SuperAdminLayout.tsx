import { LoadingSpinner, Notification } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Navigate } from 'react-router';
import useUserRole, { UserRole } from '../api/useUserRole';
import Divider from './common/Divider';
import Footer from './footer/Footer';
import Header from './Header';
import SideNav from './superAdmin/SideNav';
import styles from './SuperAdminLayout.module.scss';

const SuperAdminLayout = (): React.ReactElement => {
  const userRole = useUserRole();
  const { t } = useTranslation();
  if (
    userRole === UserRole.UNKNOWN ||
    userRole === UserRole.LOADING ||
    userRole === UserRole.ERROR
  ) {
    return (
      <div className={styles.mainLayout}>
        <Header />
        <Divider />
        <div className={styles.contentContainer}>
          {userRole === UserRole.ERROR ? (
            <Notification type="error" label={t('message.error')} />
          ) : (
            <LoadingSpinner />
          )}
        </div>
        <Footer />
      </div>
    );
  }
  // not a super admin, redirect to Permits page
  if (userRole < UserRole.SUPER_ADMIN) {
    return <Navigate to="/permits" />;
  }
  return (
    <div className={styles.mainLayout}>
      <Header />
      <Divider />
      <div className={styles.contentContainer}>
        <div className={styles.superAdminSideNav}>
          <SideNav />
        </div>
        <div className={styles.superAdminContent}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SuperAdminLayout;
