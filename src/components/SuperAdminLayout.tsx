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
