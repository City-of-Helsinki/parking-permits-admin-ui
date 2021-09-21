import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import styles from './styles.module.scss';

const MainLayout = (): React.ReactElement => (
  <div className={styles['main-layout']}>
    <Header />
    <div className={styles['content-container']}>
      <Outlet />
    </div>
  </div>
);

export default MainLayout;
