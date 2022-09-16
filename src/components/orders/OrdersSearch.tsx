import { DateInput, SearchInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrderSearchParams,
  PaymentType,
  PermitContractType,
  PriceDiscount,
} from '../../types';
import ZoneSelect from '../common/ZoneSelect';
import FilterOptions from './FilterOptions';
import styles from './OrdersSearch.module.scss';

const T_PATH = 'components.orders.ordersSearch';
export interface OrdersSearchProps {
  searchParams: OrderSearchParams;
}

const OrdersSearch = ({
  searchParams,
}: OrdersSearchProps): React.ReactElement => {
  const { t } = useTranslation();
  const [contractTypes, setContractTypes] = useState(
    new Set(searchParams.contractTypes?.split(','))
  );
  const [paymentTypes, setPaymentTypes] = useState(
    new Set(searchParams.paymentTypes?.split(','))
  );
  const [priceDiscounts, setPriceDiscounts] = useState(
    new Set(searchParams.priceDiscounts?.split(','))
  );

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
        <ZoneSelect clearable optionLabelField="name" className={styles.zone} />
        <SearchInput
          className={styles.searchInput}
          label=""
          placeholder={t(`${T_PATH}.placeholder`)}
        />
      </div>

      <div className={[styles.row, styles.filters].join(' ')}>
        <FilterOptions
          label={t(`${T_PATH}.contractType`)}
          state={contractTypes}
          onChange={setContractTypes}
          options={[
            {
              i18n: 'enums.contractType.fixedPeriod',
              value: PermitContractType.FIXED_PERIOD,
            },
            {
              i18n: 'enums.contractType.openEnded',
              value: PermitContractType.OPEN_ENDED,
            },
          ]}
        />
        <FilterOptions
          label={t(`${T_PATH}.paymentType`)}
          state={paymentTypes}
          onChange={setPaymentTypes}
          options={[
            {
              i18n: 'enums.paymentType.cashierPayment',
              value: PaymentType.CASHIER_PAYMENT,
            },
            {
              i18n: 'enums.paymentType.onlinePayment',
              value: PaymentType.ONLINE_PAYMENT,
            },
          ]}
        />
        <FilterOptions
          label={t(`${T_PATH}.priceDiscount`)}
          state={priceDiscounts}
          onChange={setPriceDiscounts}
          options={[
            {
              i18n: 'enums.priceDiscount.lowEmission',
              value: PriceDiscount.LOW_EMISSION,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default OrdersSearch;
