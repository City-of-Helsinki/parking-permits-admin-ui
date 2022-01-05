import React from 'react';
import { Outlet } from 'react-router';
import Divider from './common/Divider';
import Header from './Header';
import SideNav from './superAdmin/SideNav';
import styles from './SuperAdminLayout.module.scss';

const SuperAdminLayout = (): React.ReactElement => (
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
  </div>
);

export default SuperAdminLayout;
