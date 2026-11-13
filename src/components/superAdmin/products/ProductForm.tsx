import { yupResolver } from '@hookform/resolvers/yup';
import { formatISO, isValid as isValidDate, parseISO } from 'date-fns';
import {
  Button,
  ButtonVariant,
  DateInput,
  Fieldset,
  NumberInput,
} from 'hds-react';
import React, { ComponentProps, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import {
  Language,
  ProductInput,
  ProductType,
  ProductUnit,
} from '../../../types';
import { formatDateDisplay } from '../../../utils';
import ZoneSelect from '../../common/ZoneSelect';
import styles from './ProductForm.module.scss';
import ProductTypeSelect from './ProductTypeSelect';
import ProductUnitSelect from './ProductUnitSelect';

const T_PATH = 'components.superAdmin.products.productForm';

type ProductFormValues = Omit<ProductInput, 'id' | 'startDate' | 'endDate'> & {
  startDate: Date;
  endDate: Date;
};

interface ProductFormProps {
  className?: string;
  product?: ProductInput;
  onSubmit: (product: ProductInput) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

type DateFieldProps = Omit<
  ComponentProps<typeof DateInput>,
  'value' | 'onChange'
> & {
  value: Date;
  onChange: (value: Date) => void;
};

// HDS reports empty or partially typed input as an invalid date. It is kept in
// the form state so validation fails, while the raw text stays visible.
const DateField = ({ value, onChange, ...props }: DateFieldProps) => {
  const [rawValue, setRawValue] = useState('');
  return (
    <DateInput
      {...props}
      value={isValidDate(value) ? formatDateDisplay(value) : rawValue}
      onChange={(text: string, valueAsDate: Date) => {
        setRawValue(text);
        onChange(valueAsDate);
      }}
    />
  );
};

const ProductForm = ({
  className,
  product,
  onSubmit,
  onDelete,
  onCancel,
}: ProductFormProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const currentDate = new Date();
  const defaultValues: ProductFormValues = product
    ? {
        type: product.type,
        zone: product.zone,
        unitPrice: product.unitPrice,
        unit: product.unit,
        startDate: parseISO(product.startDate),
        endDate: parseISO(product.endDate),
        vatPercentage: product.vatPercentage,
        lowEmissionDiscountPercentage: product.lowEmissionDiscountPercentage,
      }
    : {
        type: ProductType.RESIDENT,
        zone: 'A',
        unitPrice: 30,
        unit: ProductUnit.MONTHLY,
        startDate: currentDate,
        endDate: currentDate,
        vatPercentage: 24,
        lowEmissionDiscountPercentage: 50,
      };
  const requiredNumber = (message: string) =>
    Yup.number().typeError(message).required(message);
  const validationSchema = Yup.object().shape({
    type: Yup.mixed<ProductType>().oneOf(Object.values(ProductType)).required(),
    zone: Yup.string().required(t(`${T_PATH}.errorSelectZone`)),
    unitPrice: requiredNumber(t(`${T_PATH}.errorEnterPrice`)),
    unit: Yup.mixed<ProductUnit>().oneOf(Object.values(ProductUnit)).required(),
    startDate: Yup.date()
      .typeError(t(`${T_PATH}.errorEnterStartDate`))
      .required(t(`${T_PATH}.errorEnterStartDate`)),
    endDate: Yup.date()
      .typeError(t(`${T_PATH}.errorEnterEndDate`))
      .required(t(`${T_PATH}.errorEnterEndDate`)),
    vatPercentage: requiredNumber(t(`${T_PATH}.errorEnterVAT`)),
    lowEmissionDiscountPercentage: requiredNumber(
      t(`${T_PATH}.errorEnterLowEmissionDiscount`)
    ),
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<ProductFormValues>({
    mode: 'onTouched',
    defaultValues,
    resolver: yupResolver(validationSchema),
  });
  const registerNumber = (
    name: 'unitPrice' | 'vatPercentage' | 'lowEmissionDiscountPercentage'
  ) => {
    const { ref, onChange, onBlur } = register(name, { valueAsNumber: true });
    return { name, ref, onChange, onBlur };
  };
  const submitForm = ({ startDate, endDate, ...values }: ProductFormValues) =>
    onSubmit({
      ...values,
      startDate: formatISO(startDate, { representation: 'date' }),
      endDate: formatISO(endDate, { representation: 'date' }),
    });

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(submitForm)}>
        <Fieldset
          className={styles.fieldset}
          heading={t(`${T_PATH}.priceGroup`)}>
          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <ProductTypeSelect
                className={styles.field}
                label={t(`${T_PATH}.productType`)}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="zone"
            control={control}
            render={({ field, fieldState }) => (
              <ZoneSelect
                required
                className={styles.zoneSelect}
                label={t(`${T_PATH}.zone`)}
                value={field.value}
                onChange={zone => field.onChange(zone?.name)}
                error={fieldState.error?.message}
              />
            )}
          />
        </Fieldset>
        <Fieldset
          className={styles.fieldset}
          heading={t(`${T_PATH}.productPrice`)}>
          <NumberInput
            className={styles.field}
            id="unitPrice"
            unit="€"
            label={t(`${T_PATH}.price`)}
            errorText={errors.unitPrice?.message}
            {...registerNumber('unitPrice')}
          />
          <Controller
            name="unit"
            control={control}
            render={({ field, fieldState }) => (
              <ProductUnitSelect
                className={styles.field}
                label={t(`${T_PATH}.unit`)}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <NumberInput
            className={styles.field}
            id="vatPercentage"
            unit="%"
            label={t(`${T_PATH}.vat`)}
            errorText={errors.vatPercentage?.message}
            {...registerNumber('vatPercentage')}
          />
          <NumberInput
            className={styles.field}
            id="lowEmissionDiscountPercentage"
            unit="%"
            label={t(`${T_PATH}.lowEmissionDiscount`)}
            errorText={errors.lowEmissionDiscountPercentage?.message}
            {...registerNumber('lowEmissionDiscountPercentage')}
          />
        </Fieldset>
        <Fieldset
          className={styles.fieldset}
          heading={t(`${T_PATH}.validPeriod`)}>
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState }) => (
              <DateField
                className={styles.field}
                id="startDate"
                label={t(`${T_PATH}.startDate`)}
                language={i18n.language as Language}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <DateField
                className={styles.field}
                id="endDate"
                label={t(`${T_PATH}.endDate`)}
                language={i18n.language as Language}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                errorText={fieldState.error?.message}
              />
            )}
          />
        </Fieldset>
        <div className={styles.actions}>
          <Button
            className={styles.submit}
            disabled={!(isDirty && isValid)}
            type="submit">
            {t(`${T_PATH}.save`)}
          </Button>
          {product && (
            <Button
              className={styles.delete}
              variant={ButtonVariant.Danger}
              onClick={onDelete}>
              {t(`${T_PATH}.delete`)}
            </Button>
          )}
          <Button
            className={styles.cancel}
            variant={ButtonVariant.Secondary}
            onClick={() => onCancel()}>
            {t(`${T_PATH}.cancel`)}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
