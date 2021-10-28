import { Button } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { makePrivate } from '../auth/utils';
import Breadcrumbs from '../components/common/Breadcrumbs';
import PermitTypeSelect from '../components/createPermit/PermitTypeSelect';
import { PermitType } from '../types';
import styles from './CreatePermit.module.scss';

const T_PATH = 'pages.createPermit';

const CreatePermit = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [permitType, setPermitType] = useState(PermitType.RESIDENT);
  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Link to="/permits">{t(`${T_PATH}.permits`)}</Link>
        <span>{t(`${T_PATH}.createNewPermit`)}</span>
      </Breadcrumbs>
      <PermitTypeSelect
        className={styles.permitTypeSelect}
        value={permitType}
        onChange={newPermitType => setPermitType(newPermitType)}
      />
      <Button
        className={styles.createButton}
        onClick={() => navigate(permitType)}>
        {t(`${T_PATH}.createPermit`)}
      </Button>
    </div>
  );
};
export default makePrivate(CreatePermit);
