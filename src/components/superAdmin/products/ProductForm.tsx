import { formatISO } from 'date-fns';
import { Field, FieldProps, Formik } from 'formik';
import { Button, DateInput, Fieldset, NumberInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-namespace
import * as Yup from 'yup';
import { ProductInput, ProductType, ProductUnit } from '../../../types';
import { formatDateDisplay } from '../../../utils';
import ZoneSelect from '../../common/ZoneSelect';
import LowEmissionDiscountSelect from './LowEmissionDiscountSelect';
import styles from './ProductForm.module.scss';
import ProductTypeSelect from './ProductTypeSelect';
import ProductUnitSelect from './ProductUnitSelect';

const T_PATH = 'components.superAdmin.products.productForm';

interface ProductFormProps {
  className?: string;
  product?: ProductInput;
  onSubmit: (product: ProductInput) => void;
  onDelete?: () => void;
}

const ProductForm = ({
  className,
  product,
  onSubmit,
  onDelete,
}: ProductFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const currentDate = new Date();
  const initialValues: ProductInput = product
    ? {
        type: product.type,
        zone: product.zone,
        unitPrice: product.unitPrice,
        unit: product.unit,
        startDate: product.startDate,
        endDate: product.endDate,
        vatPercentage: product.vatPercentage,
        lowEmissionDiscount: product.lowEmissionDiscount,
      }
    : {
        type: ProductType.RESIDENT,
        zone: '',
        unitPrice: 30,
        unit: ProductUnit.MONTHLY,
        startDate: currentDate.toISOString(),
        endDate: currentDate.toISOString(),
        vatPercentage: 24,
        lowEmissionDiscount: 0.5,
      };
  const validationSchema = Yup.object().shape({
    type: Yup.string(),
    zone: Yup.string().required(t(`${T_PATH}.errorSelectZone`)),
    unitPrice: Yup.number().required(t(`${T_PATH}.errorEnterPrice`)),
    startDate: Yup.string().required(t(`${T_PATH}.errorEnterStartDate`)),
    endDate: Yup.string().required(t(`${T_PATH}.errorEnterEndDate`)),
    vatPercentage: Yup.number().required(t(`${T_PATH}.errorEnterVAT`)),
    lowEmissionDiscount: Yup.number(),
  });

  return (
    <div className={className}>
      <Formik
        validateOnChange
        validateOnBlur
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={values => onSubmit(values)}>
        {props => (
          <form onSubmit={props.handleSubmit}>
            <Fieldset
              className={styles.fieldset}
              heading={t(`${T_PATH}.priceGroup`)}>
              <Field name="type">
                {({ field, form, meta }: FieldProps) => (
                  <ProductTypeSelect
                    className={styles.field}
                    label={t(`${T_PATH}.productType`)}
                    value={field.value}
                    onChange={productType =>
                      form.setFieldValue('type', productType)
                    }
                    error={meta.touched && meta.error ? meta.error : undefined}
                  />
                )}
              </Field>
              <Field name="zone">
                {({ field, form, meta }: FieldProps) => (
                  <ZoneSelect
                    className={styles.field}
                    label={t(`${T_PATH}.zone`)}
                    value={field.value}
                    onChange={zone => form.setFieldValue('zone', zone?.name)}
                    error={meta.touched && meta.error ? meta.error : undefined}
                  />
                )}
              </Field>
            </Fieldset>
            <Fieldset
              className={styles.fieldset}
              heading={t(`${T_PATH}.productPrice`)}>
              <Field name="unitPrice">
                {({ field, form, meta }: FieldProps) => (
                  <NumberInput
                    className={styles.field}
                    id="unitPrice"
                    unit="€"
                    label={t(`${T_PATH}.price`)}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={field.value}
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
              <Field name="unit">
                {({ field, form, meta }: FieldProps) => (
                  <ProductUnitSelect
                    className={styles.field}
                    label={t(`${T_PATH}.unit`)}
                    value={field.value}
                    onChange={unit => form.setFieldValue('unit', unit)}
                    error={meta.touched && meta.error ? meta.error : undefined}
                  />
                )}
              </Field>
              <Field name="vatPercentage">
                {({ field, form, meta }: FieldProps) => (
                  <NumberInput
                    className={styles.field}
                    id="vatPercentage"
                    unit="%"
                    label={t(`${T_PATH}.vat`)}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    value={field.value}
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
              <Field name="lowEmissionDiscount">
                {({ field, form, meta }: FieldProps) => (
                  <LowEmissionDiscountSelect
                    className={styles.field}
                    label={t(`${T_PATH}.lowEmissionDiscount`)}
                    value={field.value}
                    onChange={value =>
                      form.setFieldValue('lowEmissionDiscount', value)
                    }
                    error={meta.touched && meta.error ? meta.error : undefined}
                  />
                )}
              </Field>
            </Fieldset>
            <Fieldset
              className={styles.fieldset}
              heading={t(`${T_PATH}.validPeriod`)}>
              <Field name="startDate">
                {({ field, form, meta }: FieldProps) => (
                  <DateInput
                    className={styles.field}
                    id="startDate"
                    label={t(`${T_PATH}.startDate`)}
                    value={formatDateDisplay(field.value)}
                    onChange={(_, date) =>
                      form.setFieldValue(
                        'startDate',
                        formatISO(date, { representation: 'date' })
                      )
                    }
                    errorText={
                      meta.touched && meta.error ? meta.error : undefined
                    }
                  />
                )}
              </Field>
              <Field name="endDate">
                {({ field, form, meta }: FieldProps) => (
                  <DateInput
                    className={styles.field}
                    id="endDate"
                    label={t(`${T_PATH}.endDate`)}
                    value={formatDateDisplay(field.value)}
                    onChange={(_, date) =>
                      form.setFieldValue(
                        'endDate',
                        formatISO(date, { representation: 'date' })
                      )
                    }
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
              {product && (
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

export default ProductForm;
