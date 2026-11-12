import {
  Button,
  ButtonPresetTheme,
  ButtonSize,
  useOidcClient,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Login.module.scss';

const Login = (): React.ReactElement => {
  const { login } = useOidcClient();
  const { t } = useTranslation();
  return (
    <div className={styles['page-container']}>
      <Button
        onClick={() => login()}
        className={styles['login-button']}
        size={ButtonSize.Small}
        theme={ButtonPresetTheme.Black}>
        {t(`pages.login.login`)}
      </Button>
    </div>
  );
};

export default Login;
