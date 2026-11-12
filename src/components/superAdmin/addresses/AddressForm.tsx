import { gql, useLazyQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, TextInput } from 'hds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Address, ParkingZone } from '../../../types';
import LocationPicker from '../../common/LocationPicker';
import styles from './AddressForm.module.scss';

const T_PATH = 'components.superAdmin.addresses.addressForm';

const ZONE_BY_LOCATION_QUERY = gql`
  query GetZoneByLocation($location: [Float]!) {
    zoneByLocation(location: $location) {
      name
      label
      labelSv
    }
  }
`;

// eslint-disable-next-line no-magic-numbers
const HELSINKI_LOCATION = [24.9384, 60.1699];
interface AddressFormValues {
  streetName: string;
  streetNameSv: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  citySv: string;
  location: number[];
}

interface AddressFormProps {
  className?: string;
  address?: Address;
  onSubmit: (address: Address) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const AddressForm = ({
  className,
  address,
  onSubmit,
  onDelete,
  onCancel,
}: AddressFormProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const [
    getZoneByLocation,
    {
      data: zoneByLocationData,
      error: zoneByLocationError,
      loading: zoneByLocationLoading,
    },
  ] = useLazyQuery<{
    zoneByLocation: ParkingZone;
  }>(ZONE_BY_LOCATION_QUERY);
  const initialValues: AddressFormValues = address
    ? {
        streetName: address.streetName,
        streetNameSv: address.streetNameSv,
        streetNumber: address.streetNumber,
        postalCode: address.postalCode,
        city: address.city,
        citySv: address.citySv,
        location: address.location || HELSINKI_LOCATION,
      }
    : {
        streetName: '',
        streetNameSv: '',
        streetNumber: '',
        postalCode: '',
        city: 'HELSINKI',
        citySv: 'HELSINGFORS',
        location: HELSINKI_LOCATION,
      };
  const validationSchema = Yup.object().shape({
    streetName: Yup.string().required(t(`${T_PATH}.enterStreetName`)),
    streetNameSv: Yup.string().default(''),
    streetNumber: Yup.string().required(t(`${T_PATH}.enterStreetNumber`)),
    postalCode: Yup.string()
      .required(t(`${T_PATH}.enterPostalCode`))
      .test('isPostalCode', t(`${T_PATH}.postalCode5Digits`), value =>
        value ? /^\d{5}$/.test(value) : false
      ),
    city: Yup.string().required(t(`${T_PATH}.enterCity`)),
    citySv: Yup.string().default(''),
    location: Yup.array()
      .of(Yup.number().required())
      .length(2)
      .required(t(`${T_PATH}.selectLocation`)),
  });

  let zoneLabel = '';
  const selectedZone = zoneByLocationData?.zoneByLocation || address?.zone;
  if (!zoneByLocationLoading && selectedZone) {
    zoneLabel =
      i18n.language === 'sv' ? selectedZone.labelSv : selectedZone.label;
  }
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<AddressFormValues>({
    mode: 'onTouched',
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  return (
    <div className={className}>
      <form onSubmit={handleSubmit(values => onSubmit(values as Address))}>
        <div className={styles.row}>
          <div className={styles.column}>
            <TextInput
              id="streetName"
              className={styles.field}
              label={t(`${T_PATH}.streetName`)}
              errorText={errors.streetName?.message}
              {...register('streetName')}
            />
            <TextInput
              id="streetNameSv"
              className={styles.field}
              label={t(`${T_PATH}.streetNameSv`)}
              errorText={errors.streetNameSv?.message}
              {...register('streetNameSv')}
            />
            <div className={styles.fieldRow}>
              <TextInput
                id="streetNumber"
                className={styles.field}
                label={t(`${T_PATH}.streetNumber`)}
                errorText={errors.streetNumber?.message}
                {...register('streetNumber')}
              />
              <TextInput
                id="postalCode"
                className={styles.field}
                label={t(`${T_PATH}.postalCode`)}
                errorText={errors.postalCode?.message}
                {...register('postalCode')}
              />
            </div>
            <div className={styles.fieldRow}>
              <TextInput
                readOnly
                id="city"
                className={styles.field}
                label={t(`${T_PATH}.city`)}
                value="HELSINKI"
              />
              <TextInput
                readOnly
                id="citySv"
                className={styles.field}
                label={t(`${T_PATH}.citySv`)}
                value="HELSINGFORS"
              />
            </div>
            <TextInput
              readOnly
              id="zone"
              className={styles.field}
              label={t(`${T_PATH}.zone`)}
              value={zoneByLocationError ? '-' : zoneLabel}
              errorText={zoneByLocationError?.message}
            />
          </div>
          <div className={styles.column}>
            <Controller
              name="location"
              control={control}
              render={({ field, fieldState }) => (
                <LocationPicker
                  className={styles.locationPicker}
                  location={field.value as [number, number]}
                  onChange={value => {
                    setValue('location', value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    getZoneByLocation({ variables: { location: value } });
                  }}
                  errorText={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.submit}
            disabled={!isDirty || !isValid}
            type="submit">
            {t(`${T_PATH}.save`)}
          </Button>
          {address && (
            <Button
              className={styles.delete}
              variant="danger"
              onClick={onDelete}>
              {t(`${T_PATH}.delete`)}
            </Button>
          )}
          <Button
            className={styles.cancel}
            variant="secondary"
            onClick={() => onCancel()}>
            {t(`${T_PATH}.cancel`)}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
