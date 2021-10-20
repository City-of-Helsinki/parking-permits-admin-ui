import React from 'react';
import { Outlet } from 'react-router-dom';
import Divider from './common/Divider';
import Header from './Header';
import styles from './MainLayout.module.scss';

const MainLayout = (): React.ReactElement => (
  <div className={styles['main-layout']}>
    <Header />
    <Divider />
    <div className={styles['content-container']}>
      <Outlet />
    </div>
  </div>
);

export default MainLayout;
