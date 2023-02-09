import { gql, useQuery } from '@apollo/client';
import { Field, FieldProps, Formik } from 'formik';
import { Button, Card, LoadingSpinner, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-namespace
import * as yup from 'yup';
import { Announcement, ParkingZone } from '../../../types';
import CheckboxGroup, { CheckboxGroupOption } from '../../common/CheckboxGroup';
import styles from './AnnouncementForm.module.scss';

const T_PATH = 'components.superAdmin.announcements.announcementForm';

const ZONES_QUERY = gql`
  query GetZones {
    zones {
      name
    }
  }
`;

interface AnnouncementFormProps {
  onSubmit: (address: Announcement) => void;
  onCancel: () => void;
}

const AnnouncementForm = ({
  onSubmit,
  onCancel,
}: AnnouncementFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const { data, loading } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);

  if (loading) {
    return <LoadingSpinner />;
  }

  const initialValues = {
    parkingZones: [],
    contentEn: '',
    contentFi: '',
    contentSv: '',
    subjectEn: '',
    subjectFi: '',
    subjectSv: '',
  };

  const validationSchema = yup.object().shape({
    parkingZones: yup
      .array()
      .of(yup.string())
      .min(1, t(`${T_PATH}.selectZone`)),
    contentEn: yup.string().required(t(`${T_PATH}.enterContent`)),
    contentFi: yup.string().required(t(`${T_PATH}.enterContent`)),
    contentSv: yup.string().required(t(`${T_PATH}.enterContent`)),
    subjectEn: yup.string().required(t(`${T_PATH}.enterSubject`)),
    subjectFi: yup.string().required(t(`${T_PATH}.enterSubject`)),
    subjectSv: yup.string().required(t(`${T_PATH}.enterSubject`)),
  });

  const options: CheckboxGroupOption[] = data
    ? data.zones.map(zone => ({
        label: zone.name,
        value: zone.name,
      }))
    : [];

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => onSubmit(values as Announcement)}>
        {props => (
          <form onSubmit={props.handleSubmit}>
            <Field name="parkingZones">
              {({ field, form, meta }: FieldProps) => (
                <CheckboxGroup
                  name={field.name}
                  className={styles.checkboxGrid}
                  heading={t(`${T_PATH}.recipientZones`)}
                  idPrefix={field.name}
                  options={options}
                  required
                  errorText={meta.error ? meta.error : undefined}
                  onChange={values =>
                    form.setFieldValue('parkingZones', values)
                  }
                />
              )}
            </Field>

            <h2 className="heading-s">
              {t(`${T_PATH}.announcementInFinnish`)}
            </h2>
            <Card>
              <Field name="subjectFi">
                {({ field, form, meta }: FieldProps) => (
                  <TextInput
                    id={field.name}
                    className={styles.field}
                    label={t(`${T_PATH}.subjectFi`)}
                    value={field.value}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    required
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
              <Field name="contentFi">
                {({ field, form, meta }: FieldProps) => (
                  <TextArea
                    id={field.name}
                    className={styles.field}
                    label={t(`${T_PATH}.contentFi`)}
                    value={field.value}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    required
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
            </Card>

            <h2 className="heading-s">
              {t(`${T_PATH}.announcementInSwedish`)}
            </h2>
            <Card>
              <Field name="subjectSv">
                {({ field, form, meta }: FieldProps) => (
                  <TextInput
                    id={field.name}
                    className={styles.field}
                    label={t(`${T_PATH}.subjectSv`)}
                    value={field.value}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    required
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
              <Field name="contentSv">
                {({ field, form, meta }: FieldProps) => (
                  <TextArea
                    id={field.name}
                    className={styles.field}
                    label={t(`${T_PATH}.contentSv`)}
                    value={field.value}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    required
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
            </Card>

            <h2 className="heading-s">
              {t(`${T_PATH}.announcementInEnglish`)}
            </h2>
            <Card>
              <Field name="subjectEn">
                {({ field, form, meta }: FieldProps) => (
                  <TextInput
                    id={field.name}
                    className={styles.field}
                    label={t(`${T_PATH}.subjectEn`)}
                    value={field.value}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    required
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
              <Field name="contentEn">
                {({ field, form, meta }: FieldProps) => (
                  <TextArea
                    id={field.name}
                    className={styles.field}
                    label={t(`${T_PATH}.contentEn`)}
                    value={field.value}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    required
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
            </Card>

            <div className={styles.actions}>
              <Button disabled={!(props.dirty && props.isValid)} type="submit">
                {t(`${T_PATH}.submit`)}
              </Button>
              <Button
                className={styles.delete}
                variant="secondary"
                onClick={() => onCancel()}>
                {t(`${T_PATH}.cancel`)}
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AnnouncementForm;
