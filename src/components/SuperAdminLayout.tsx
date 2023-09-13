import { LoadingSpinner } from 'hds-react';
import React from 'react';
import { Outlet } from 'react-router';
import { Navigate } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import Divider from './common/Divider';
import Footer from './footer/Footer';
import Header from './Header';
import SideNav from './superAdmin/SideNav';
import styles from './SuperAdminLayout.module.scss';

const SuperAdminLayout = (): React.ReactElement => {
  const userRole = useUserRole();
  // still loading, we don't know user groups yet
  if (userRole === UserRole.UNKNOWN) {
    return (
      <div className={styles.mainLayout}>
        <Header />
        <Divider />
        <div className={styles.contentContainer}>
          <LoadingSpinner />
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
