import { formatISO, parse } from 'date-fns';
import { Button, DateInput, IconSearch, Search } from 'hds-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, PaymentType, RefundSearchParams } from '../../types';
import { joinSet } from '../../utils';
import FilterOptions from '../orders/FilterOptions';
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
  const { t, i18n } = useTranslation();

  const [status, setStatus] = useState(searchParams.status);
  const [query, setQuery] = useState(searchParams.q);
  const [startDate, setStartDate] = useState(searchParams.startDate);
  const [endDate, setEndDate] = useState(searchParams.endDate);
  const [paymentTypes, setPaymentTypes] = useState(
    new Set(searchParams.paymentTypes?.split(',').filter(val => val))
  );

  const texts = useMemo(
    () => ({
      language: i18n.language as Language,
      searchPlaceholder: t(`${T_PATH}.searchPlaceholder`),
    }),
    [i18n.language, t]
  );

  const formatDate = (date: string) => {
    const parsedDate = parse(date, 'd.M.yyyy', new Date());
    return formatISO(parsedDate, { representation: 'date' });
  };

  const handleSubmit = () =>
    onSearch({
      startDate: startDate ? formatDate(startDate) : '',
      endDate: endDate ? formatDate(endDate) : '',
      paymentTypes: joinSet(paymentTypes),
      status,
      q: query,
    });

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <RefundStatusSelect
          className={styles.statusSelect}
          value={status}
          onChange={setStatus}
        />
        <div className={styles.dateRange}>
          <DateInput
            className={styles.startDate}
            id="startDate"
            language={i18n.language as Language}
            value={startDate}
            onChange={setStartDate}
          />
          <div className={styles.dateSeparator} />
          <DateInput
            className={styles.endDate}
            id="endDate"
            language={i18n.language as Language}
            value={endDate}
            onChange={setEndDate}
          />
        </div>
        <Search
          hideSubmitButton
          id="refundsSearch"
          className={styles.searchInput}
          texts={texts}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onSend={() => handleSubmit()}
        />
      </div>
      <div className={styles.row}>
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
        <Button
          className={styles.searchButton}
          iconStart={<IconSearch />}
          onClick={() => handleSubmit()}>
          {t(`${T_PATH}.searchButton`)}
        </Button>
      </div>
    </div>
  );
};

export default RefundsSearch;
