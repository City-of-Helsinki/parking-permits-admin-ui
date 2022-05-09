import { gql, useLazyQuery } from '@apollo/client';
import { Field, FieldProps, Formik } from 'formik';
import { Button, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-namespace
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
interface AddressFormProps {
  className?: string;
  address?: Address;
  onSubmit: (address: Address) => void;
  onDelete?: () => void;
}

const AddressForm = ({
  className,
  address,
  onSubmit,
  onDelete,
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
  const initialValues = address
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
        city: '',
        citySv: '',
        location: HELSINKI_LOCATION,
      };
  const validationSchema = Yup.object().shape({
    streetName: Yup.string().required(t(`${T_PATH}.enterStreetName`)),
    streetNameSv: Yup.string(),
    streetNumber: Yup.number().required(t(`${T_PATH}.enterStreetNumber`)),
    postalCode: Yup.string()
      .required(t(`${T_PATH}.enterPostalCode`))
      .test('isPostalCode', t(`${T_PATH}.postalCode5Digits`), value =>
        value ? /^\d{5}$/.test(value) : false
      ),
    city: Yup.string().required(t(`${T_PATH}.enterCity`)),
    citySv: Yup.string(),
    location: Yup.array()
      .of(Yup.number())
      .length(2)
      .required(t(`${T_PATH}.selectLocation`)),
  });

  let zoneLabel = '';
  const selectedZone = zoneByLocationData?.zoneByLocation || address?.zone;
  if (!zoneByLocationLoading && selectedZone) {
    zoneLabel =
      i18n.language === 'sv' ? selectedZone.labelSv : selectedZone.label;
  }
  return (
    <div className={className}>
      <Formik
        validateOnChange
        validateOnBlur
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => onSubmit(values as Address)}>
        {props => (
          <form onSubmit={props.handleSubmit}>
            <Field name="streetName">
              {({ field, form, meta }: FieldProps) => (
                <TextInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.streetName`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="streetNameSv">
              {({ field, form, meta }: FieldProps) => (
                <TextInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.streetNameSv`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="streetNumber">
              {({ field, form, meta }: FieldProps) => (
                <TextInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.streetNumber`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="postalCode">
              {({ field, form, meta }: FieldProps) => (
                <TextInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.postalCode`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="city">
              {({ field, form, meta }: FieldProps) => (
                <TextInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.city`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="citySv">
              {({ field, form, meta }: FieldProps) => (
                <TextInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.citySv`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <TextInput
              readOnly
              id="zone"
              className={styles.field}
              label={t(`${T_PATH}.zone`)}
              value={zoneByLocationError ? '-' : zoneLabel}
              errorText={zoneByLocationError?.message}
            />
            <Field name="location">
              {({ field, form }: FieldProps) => (
                <LocationPicker
                  className={styles.field}
                  label={t(`${T_PATH}.location`)}
                  location={field.value}
                  onChange={value => {
                    form.setFieldValue(field.name, value);
                    getZoneByLocation({ variables: { location: value } });
                  }}
                />
              )}
            </Field>
            <div className={styles.actions}>
              <Button
                className={styles.submit}
                disabled={!(props.dirty && props.isValid)}
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
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddressForm;
