import { formatISO } from 'date-fns';
import { Field, FieldProps, Formik } from 'formik';
import { Button, DateInput, NumberInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-namespace
import * as Yup from 'yup';
import { LowEmissionCriterion, PowerType } from '../../../types';
import { formatDateDisplay } from '../../../utils';
import EuroClassSelect from '../../common/EuroClassSelect';
import PowerTypeSelect from '../../common/PowerTypeSelect';
import styles from './LowEmissionCriterionForm.module.scss';

const T_PATH =
  'components.superAdmin.lowEmissionCriteria.lowEmissionCriterionForm';

interface LowEmissionCriterionFormProps {
  className?: string;
  criterion?: LowEmissionCriterion;
  onSubmit: (criterion: LowEmissionCriterion) => void;
  onDelete?: () => void;
}

const LowEmissionCriterionForm = ({
  className,
  criterion,
  onSubmit,
  onDelete,
}: LowEmissionCriterionFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const initialValues = criterion
    ? {
        powerType: criterion.powerType,
        nedcMaxEmissionLimit: criterion.nedcMaxEmissionLimit,
        wltpMaxEmissionLimit: criterion.wltpMaxEmissionLimit,
        euroMinClassLimit: criterion.euroMinClassLimit,
        startDate: criterion.startDate ? new Date(criterion.startDate) : null,
        endDate: criterion.endDate ? new Date(criterion.endDate) : null,
      }
    : {
        powerType: PowerType.BENSIN,
        nedcMaxEmissionLimit: 0,
        wltpMaxEmissionLimit: 0,
        euroMinClassLimit: 1,
        startDate: null,
        endDate: null,
      };
  const validationSchema = Yup.object().shape({
    powerType: Yup.string().required(),
    nedcMaxEmissionLimit: Yup.number().required(
      t(`${T_PATH}.enterNedcMaxEmissionLimit`)
    ),
    wltpMaxEmissionLimit: Yup.number().required(
      t(`${T_PATH}.enterWltpMaxEmissionLimit`)
    ),
    euroMinClassLimit: Yup.number().required(),
    startDate: Yup.date().required(t(`${T_PATH}.enterStartDate`)),
    endDate: Yup.date(),
  });

  return (
    <div className={className}>
      <Formik
        validateOnChange
        validateOnBlur
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values =>
          onSubmit({
            powerType: values.powerType,
            nedcMaxEmissionLimit: values.nedcMaxEmissionLimit,
            wltpMaxEmissionLimit: values.wltpMaxEmissionLimit,
            euroMinClassLimit: values.euroMinClassLimit,
            startDate: values.startDate
              ? formatISO(values.startDate, { representation: 'date' })
              : '',
            endDate: values.endDate
              ? formatISO(values.endDate, { representation: 'date' })
              : '',
          })
        }>
        {props => (
          <form onSubmit={props.handleSubmit}>
            <Field name="powerType">
              {({ field, form }: FieldProps) => (
                <PowerTypeSelect
                  className={styles.field}
                  label={t(`${T_PATH}.powerType`)}
                  value={field.value}
                  onChange={value => form.setFieldValue(field.name, value)}
                />
              )}
            </Field>
            <Field name="nedcMaxEmissionLimit">
              {({ field, form, meta }: FieldProps) => (
                <NumberInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.nedcMaxEmissionLimit`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="wltpMaxEmissionLimit">
              {({ field, form, meta }: FieldProps) => (
                <NumberInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.wltpMaxEmissionLimit`)}
                  value={field.value}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="euroMinClassLimit">
              {({ field, form }: FieldProps) => (
                <EuroClassSelect
                  className={styles.field}
                  label={t(`${T_PATH}.euroMinClassLimit`)}
                  value={field.value}
                  onChange={value => form.setFieldValue(field.name, value)}
                />
              )}
            </Field>
            <Field name="startDate">
              {({ field, form, meta }: FieldProps) => (
                <DateInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.startDate`)}
                  value={field.value && formatDateDisplay(field.value)}
                  onChange={(_, date) => form.setFieldValue(field.name, date)}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
                />
              )}
            </Field>
            <Field name="endDate">
              {({ field, form, meta }: FieldProps) => (
                <DateInput
                  id={field.name}
                  className={styles.field}
                  label={t(`${T_PATH}.endDate`)}
                  value={field.value && formatDateDisplay(field.value)}
                  onChange={(_, date) => form.setFieldValue(field.name, date)}
                  errorText={
                    meta.touched && meta.error ? meta.error : undefined
                  }
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
              {criterion && (
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

export default LowEmissionCriterionForm;
