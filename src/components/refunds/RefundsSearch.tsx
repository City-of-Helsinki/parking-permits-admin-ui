import { formatISO } from 'date-fns';
import { Checkbox, DateInput, SearchInput, SelectionGroup } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentType, RefundSearchParams } from '../../types';
import { formatDateDisplay } from '../../utils';
import styles from './RefundsSearch.module.scss';
import RefundStatusSelect from './RefundStatusSelect';

const T_PATH = 'components.refunds.refundsSearch';

export interface RefundsSearchProps {
  searchParams: RefundSearchParams;
  onSearch: (searchParams: RefundSearchParams) => void;
}

const RefundsSearch = ({
  searchParams,
  onSearch,
}: RefundsSearchProps): React.ReactElement => {
  const { t } = useTranslation();
  // the search only trigged when user clicks the search button
  // so we need to keep a local state of search params
  const [localSearchParams, setLocalSearchParams] = useState(searchParams);
  const { q, startDate, endDate, status, paymentTypes } = localSearchParams;
  const paymentTypeArray = paymentTypes.split(',');
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <RefundStatusSelect
          className={styles.statusSelect}
          value={status}
          onChange={value =>
            setLocalSearchParams({ ...localSearchParams, status: value })
          }
        />
        <div className={styles.dateRange}>
          <DateInput
            className={styles.startDate}
            id="startDate"
            value={startDate && formatDateDisplay(startDate)}
            onChange={(_, date) =>
              setLocalSearchParams({
                ...localSearchParams,
                startDate: formatISO(date, { representation: 'date' }),
              })
            }
          />
          <div className={styles.dateSeprator} />
          <DateInput
            className={styles.endDate}
            id="sendDate"
            value={endDate && formatDateDisplay(endDate)}
            onChange={(_, date) =>
              setLocalSearchParams({
                ...localSearchParams,
                endDate: formatISO(date, { representation: 'date' }),
              })
            }
          />
        </div>
        <SearchInput
          className={styles.searchInput}
          label=""
          // HDS search input does not support passing a default value
          // so we have to use the placeholder property here
          placeholder={q || t(`${T_PATH}.searchPlaceholder`)}
          onSubmit={value => onSearch({ ...localSearchParams, q: value })}
        />
      </div>
      <div className={styles.row}>
        <SelectionGroup direction="horizontal">
          <Checkbox
            id="webshop"
            name="paymentType"
            label={t(`${T_PATH}.webshop`)}
            checked={paymentTypeArray.includes(PaymentType.ONLINE_PAYMENT)}
            onChange={e => {
              const newPaymentTypes = e.target.checked
                ? [...paymentTypeArray, PaymentType.ONLINE_PAYMENT]
                : paymentTypeArray.filter(
                    item => item !== PaymentType.ONLINE_PAYMENT
                  );
              setLocalSearchParams({
                ...localSearchParams,
                paymentTypes: newPaymentTypes.join(','),
              });
            }}
          />
          <Checkbox
            id="cash"
            name="paymentType"
            label={t(`${T_PATH}.cash`)}
            checked={paymentTypeArray.includes(PaymentType.CASHIER_PAYMENT)}
            onChange={e => {
              const newPaymentTypes = e.target.checked
                ? [...paymentTypeArray, PaymentType.CASHIER_PAYMENT]
                : paymentTypeArray.filter(
                    item => item !== PaymentType.CASHIER_PAYMENT
                  );
              setLocalSearchParams({
                ...localSearchParams,
                paymentTypes: newPaymentTypes.join(','),
              });
            }}
          />
        </SelectionGroup>
      </div>
    </div>
  );
};

export default RefundsSearch;
