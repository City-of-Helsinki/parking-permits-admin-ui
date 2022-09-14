import { DateInput, SearchInput, Select } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OrdersSearch.module.scss';

const T_PATH = 'components.orders.ordersSearch';

const OrdersSearch = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.dateRange}>
          <DateInput
            id="startDate"
            className={styles.startDate}
            label={t(`${T_PATH}.startDate`)}
          />
          <div className={styles.dateSeparator} />
          <DateInput
            id="endDate"
            className={styles.endDate}
            label={t(`${T_PATH}.endDate`)}
          />
        </div>
        <Select
          id="zone"
          className={styles.zone}
          label={t(`${T_PATH}.zone`)}
          options={[]}
        />
        <SearchInput
          className={styles.searchInput}
          label=""
          placeholder={t(`${T_PATH}.placeholder`)}
        />
      </div>
    </div>
  );
};

export default OrdersSearch;
