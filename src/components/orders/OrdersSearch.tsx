import classNames from 'classnames';
import { formatISO, parse } from 'date-fns';
import {
  Button,
  DateInput,
  IconCross,
  IconSearch,
  SearchInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Language,
  OrderSearchParams,
  PaymentType,
  PermitContractType,
  PriceDiscount,
} from '../../types';
import { joinSet } from '../../utils';
import ZoneSelect from '../common/ZoneSelect';
import FilterOptions from './FilterOptions';
import styles from './OrdersSearch.module.scss';

const T_PATH = 'components.orders.ordersSearch';

export interface OrdersSearchProps {
  searchParams: OrderSearchParams;
  onSubmit: (newSearchParams: OrderSearchParams) => void;
}

const OrdersSearch = ({
  searchParams,
  onSubmit,
}: OrdersSearchProps): React.ReactElement => {
  const { t, i18n } = useTranslation();

  const [query, setQuery] = useState(searchParams.q);
  const [startDate, setStartDate] = useState(searchParams.startDate);
  const [endDate, setEndDate] = useState(searchParams.endDate);
  const [parkingZone, setParkingZone] = useState(searchParams.parkingZone);
  const [contractTypes, setContractTypes] = useState(
    new Set(searchParams.contractTypes?.split(',').filter(val => val))
  );
  const [paymentTypes, setPaymentTypes] = useState(
    new Set(searchParams.paymentTypes?.split(',').filter(val => val))
  );
  const [priceDiscounts, setPriceDiscounts] = useState(
    new Set(searchParams.priceDiscounts?.split(',').filter(val => val))
  );

  const canReset = () =>
    startDate ||
    endDate ||
    parkingZone ||
    contractTypes.size ||
    paymentTypes.size ||
    priceDiscounts.size;

  const reset = () => {
    // NOTE: At the time of writing, HDS' SearchInput component doesn't support
    // neither ref nor value, so there's no way of clearing it without resorting
    // to dirty hacks. Due to this, the query state reset is omitted as well.
    // setQuery('');
    setStartDate('');
    setEndDate('');
    setParkingZone('');
    setContractTypes(new Set());
    setPaymentTypes(new Set());
    setPriceDiscounts(new Set());
  };

  const formatDate = (date: string) => {
    const parsedDate = parse(date, 'd.M.yyyy', new Date());
    return formatISO(parsedDate, { representation: 'date' });
  };

  const handleSubmit = () => {
    onSubmit({
      q: query,
      startDate: startDate ? formatDate(startDate) : '',
      endDate: endDate ? formatDate(endDate) : '',
      parkingZone,
      contractTypes: joinSet(contractTypes),
      paymentTypes: joinSet(paymentTypes),
      priceDiscounts: joinSet(priceDiscounts),
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.dateRange}>
          <DateInput
            id="startDate"
            className={styles.startDate}
            label={t(`${T_PATH}.startDate`)}
            language={i18n.language as Language}
            value={startDate}
            onChange={setStartDate}
          />
          <div className={styles.dateSeparator} />
          <DateInput
            id="endDate"
            className={styles.endDate}
            label={t(`${T_PATH}.endDate`)}
            language={i18n.language as Language}
            value={endDate}
            onChange={setEndDate}
          />
        </div>
        <ZoneSelect
          clearable
          optionLabelField="name"
          className={styles.zone}
          value={parkingZone}
          onChange={selectedZone => setParkingZone(selectedZone?.name || '')}
        />
        <SearchInput
          hideSearchButton
          className={styles.searchInput}
          label={t(`${T_PATH}.textSearch`)}
          placeholder={t(`${T_PATH}.placeholder`)}
          onChange={setQuery}
          onSubmit={() => handleSubmit()}
        />
      </div>

      <div className={classNames(styles.row, styles.filters)}>
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
        <Button
          className={styles.searchButton}
          iconLeft={<IconSearch />}
          onClick={() => handleSubmit()}>
          {t(`${T_PATH}.searchButton`)}
        </Button>
      </div>
      {canReset() ? (
        <div className={styles.row}>
          <Button
            className={styles.clearButton}
            variant="supplementary"
            iconLeft={<IconCross />}
            onClick={() => reset()}>
            {t(`${T_PATH}.clearButton`)}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default OrdersSearch;
