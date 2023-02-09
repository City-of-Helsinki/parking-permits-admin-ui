import { formatISO } from 'date-fns';
import { Field, FieldProps, Formik } from 'formik';
import { Button, DateInput, Fieldset, NumberInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-namespace
import * as Yup from 'yup';
import { LowEmissionCriterion } from '../../../types';
import { formatDateDisplay } from '../../../utils';
import EuroClassSelect from '../../common/EuroClassSelect';
import styles from './LowEmissionCriterionForm.module.scss';

const T_PATH =
  'components.superAdmin.lowEmissionCriteria.lowEmissionCriterionForm';

interface LowEmissionCriterionFormProps {
  className?: string;
  criterion?: LowEmissionCriterion;
  onSubmit: (criterion: LowEmissionCriterion) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const LowEmissionCriterionForm = ({
  className,
  criterion,
  onSubmit,
  onDelete,
  onCancel,
}: LowEmissionCriterionFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const initialValues = criterion
    ? {
        nedcMaxEmissionLimit: criterion.nedcMaxEmissionLimit,
        wltpMaxEmissionLimit: criterion.wltpMaxEmissionLimit,
        euroMinClassLimit: criterion.euroMinClassLimit,
        startDate: criterion.startDate ? new Date(criterion.startDate) : null,
        endDate: criterion.endDate ? new Date(criterion.endDate) : null,
      }
    : {
        nedcMaxEmissionLimit: 0,
        wltpMaxEmissionLimit: 0,
        euroMinClassLimit: 1,
        startDate: null,
        endDate: null,
      };
  const validationSchema = Yup.object().shape({
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
            <Fieldset
              className={styles.fieldSet}
              heading={t(`${T_PATH}.validPeriod`)}>
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
              <div className={styles.dateSeperator} />
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
            </Fieldset>
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
              <Button
                className={styles.cancel}
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

export default LowEmissionCriterionForm;
