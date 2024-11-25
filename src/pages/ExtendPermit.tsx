import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  Button,
  IconArrowUndo,
  IconCheckCircleFill,
  Notification,
  NumberInput,
  Table,
} from 'hds-react';
import React, { useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VehicleInfo from '../components/permitDetail/VehicleInfo';
import {
  ExtendedPriceListItem,
  ExtendedPriceListItemData,
  MutationResponse,
  PermitDetail,
  PermitDetailData,
} from '../types';
import { formatDateDisplay, formatPrice } from '../utils';
import styles from './ExtendPermit.module.scss';

const PERMIT_DETAIL_QUERY = gql`
  query GetPermitDetail($permitId: ID!) {
    permitDetail(permitId: $permitId) {
      id
      startTime
      endTime
      currentPeriodEndTime
      canAdminExtendPermit
      maxExtensionMonthCount
      monthCount
      address {
        id
        zone {
          name
        }
      }
      customer {
        firstName
        lastName
        nationalIdNumber
      }
      vehicle {
        manufacturer
        model
        registrationNumber
      }
      parkingZone {
        name
        label
        labelSv
      }
    }
  }
`;

const EXTENDED_PRICE_LIST_QUERY = gql`
  query GetExtendedPriceList($permitId: ID!, $monthCount: Int) {
    getExtendedPriceList(permitId: $permitId, monthCount: $monthCount) {
      startDate
      endDate
      vat
      unitPrice
      price
      netPrice
      vatPrice
    }
  }
`;

const EXTEND_PERMIT_MUTATION = gql`
  mutation ExtendPermit($permitId: ID!, $monthCount: Int) {
    extendPermit(permitId: $permitId, monthCount: $monthCount) {
      success
    }
  }
`;

const T_PATH = 'components.residentPermit.extendPermit';

const buildPriceListTable = (
  priceList: Array<ExtendedPriceListItem>,
  totalPrice: number,
  t: TFunction
) => {
  const cols = [
    {
      key: 'dates',
      headerName: t('period'),
    },
    {
      key: 'unitPrice',
      headerName: t('pricePerMonth'),
    },
    {
      key: 'vat',
      headerName: t('includingVAT'),
    },
    {
      key: 'price',
      headerName: t('totalPriceForPeriod'),
    },
  ];

  const rows = priceList.map(
    ({ startDate, endDate, unitPrice, price, vat }) => ({
      dates: `${formatDateDisplay(startDate)}-${formatDateDisplay(endDate)}`,
      unitPrice: `${formatPrice(unitPrice)} €`,
      vat: `${formatPrice(vat * 100)} %`,
      price: `${formatPrice(price)} €`,
    })
  );

  const totalPriceLabel = t('totalPrice');
  const caption = `${totalPriceLabel} ${formatPrice(totalPrice)} €`;

  return (
    <Table indexKey="dates" cols={cols} rows={rows} caption={caption} zebra />
  );
};

const ExtendResidentPermit = (): React.ReactElement => {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: T_PATH });
  const params = useParams();
  const { id: permitId } = params;

  // states
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [monthCount, setMonthCount] = useState<number>(0);
  const [permit, setPermit] = useState<PermitDetail | null>(null);
  const [priceList, setPriceList] = useState<Array<ExtendedPriceListItem>>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);

  const navigateToDetailPage = () => {
    navigate(`/permits/${permitId}`);
  };

  useQuery<PermitDetailData>(PERMIT_DETAIL_QUERY, {
    variables: { permitId },
    fetchPolicy: 'no-cache',
    onCompleted: ({ permitDetail }) => {
      setPermit(permitDetail);
      if (!permitDetail.canAdminExtendPermit) {
        setErrorMessage(t('permitNotExtendable'));
      }
    },
    onError: error => setErrorMessage(error.message),
  });

  const [extendPermit] = useMutation<MutationResponse>(EXTEND_PERMIT_MUTATION, {
    onCompleted: navigateToDetailPage,
    onError: error => setErrorMessage(error.message),
  });

  const [getExtendedPriceList] = useLazyQuery<ExtendedPriceListItemData>(
    EXTENDED_PRICE_LIST_QUERY,
    {
      fetchPolicy: 'no-cache',
      onCompleted: data => {
        setPriceList(data.getExtendedPriceList);
        setTotalPrice(
          data.getExtendedPriceList.reduce(
            (acc, item): number => acc + item.price,
            0
          )
        );
      },
      onError: error => setErrorMessage(error.message),
    }
  );

  const onUpdateMonthCount = (value: number) => {
    setMonthCount(value);
    getExtendedPriceList({ variables: { permitId, monthCount: value } });
  };

  return (
    <div className={styles.container}>
      {errorMessage && (
        <Notification
          type="error"
          label={t('message.error')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setErrorMessage('')}
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
      <Breadcrumbs>
        <Link to="/permits">{t('permits')}</Link>
        <Link to={`/permits/${permitId}`}>{permitId}</Link>
        <span>{t(`extendPermit`)}</span>
      </Breadcrumbs>
      {!!permit && (
        <div className={styles.permitInfo}>
          <VehicleInfo className={styles.vehicleInfo} permit={permit} />
        </div>
      )}
      {permit?.canAdminExtendPermit && (
        <NumberInput
          required
          disabled={false}
          className={styles.fieldItem}
          id="monthCount"
          label={t('monthCount')}
          step={1}
          min={1}
          max={permit.maxExtensionMonthCount}
          value={monthCount}
          onChange={e => onUpdateMonthCount(parseInt(e.target.value, 10))}
        />
      )}

      {priceList.length > 0 && (
        <div className={styles.priceList}>
          {buildPriceListTable(priceList, totalPrice, t)}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.actions}>
          <Button
            className={styles.actionButton}
            variant="secondary"
            iconLeft={<IconArrowUndo />}
            onClick={navigateToDetailPage}>
            {t('cancelAndCloseWithoutSaving')}
          </Button>
          <Button
            className={styles.actionButton}
            iconLeft={<IconCheckCircleFill />}
            disabled={monthCount === 0}
            onClick={() => setIsConfirmDialogOpen(true)}>
            {t('continue')}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title={t('confirmPaymentTitle')}
        message={t('confirmPaymentMessage')}
        secondaryMessage={t('confirmPaymentTotalAmount', {
          totalPrice,
        })}
        confirmLabel={t('confirmPayment')}
        cancelLabel={t('cancelPayment')}
        onConfirm={() => {
          setIsConfirmDialogOpen(false);
          extendPermit({
            variables: { permitId, monthCount },
          });
        }}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
};

export default ExtendResidentPermit;
