import { Button } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useClient } from '../auth/hooks';
import styles from './Login.module.scss';

const Login = (): React.ReactElement => {
  const client = useClient();
  const { t } = useTranslation();
  return (
    <div className={styles['page-container']}>
      <Button
        onClick={() => client.login()}
        className={styles['login-button']}
        size="small"
        theme="black">
        {t(`pages.login.login`)}
      </Button>
    </div>
  );
};

export default Login;
