import { addWeeks, format, isValid } from 'date-fns';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  Card,
  DateInput,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  Notification,
  TextInput,
  TimeInput,
} from 'hds-react';
import React, { ComponentProps, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Language, PermitDetail } from '../../types';
import styles from './TemporaryVehicle.module.scss';

const T_PATH = 'components.permitDetail.temporaryVehicle';

export interface FormProps {
  permitId?: string;
  registrationNumber: string;
  startDate?: string | Date;
  startTime: string;
  endDate?: string | Date;
  endTime: string;
}

interface TemporaryVehicleFormValues {
  registrationNumber: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
}

export interface TemporaryVehicleProps {
  className?: string;
  permit: PermitDetail;
  cancelAddTempVehicle?: (state: boolean) => void;
  addTemporaryVehicle: (data: { variables: FormProps }) => unknown;
}

export const combineDateAndTime = (date: Date, time: string): string => {
  const dateString = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  return new Date(`${dateString} ${time}`).toISOString();
};

type DateFieldProps = Omit<
  ComponentProps<typeof DateInput>,
  'value' | 'onChange'
> & {
  value: Date;
  onChange: (value: Date) => void;
};

// Invalid dates are kept in the form state (so validation reports them) while
// the raw typed text stays visible instead of being passed to format().
const DateField = ({ value, onChange, ...props }: DateFieldProps) => {
  const [rawValue, setRawValue] = useState('');
  return (
    <DateInput
      {...props}
      value={isValid(value) ? format(value, 'd.M.yyyy') : rawValue}
      onChange={(text: string, valueAsDate: Date) => {
        setRawValue(text);
        onChange(valueAsDate);
      }}
    />
  );
};

const TemporaryVehicle = ({
  className,
  permit,
  cancelAddTempVehicle,
  addTemporaryVehicle,
}: TemporaryVehicleProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const validationSchema = Yup.object().shape({
    registrationNumber: Yup.string().default(''),
    startDate: Yup.date().required(),
    startTime: Yup.string().required(),
    endDate: Yup.date().required(),
    endTime: Yup.string().required(),
  });
  const defaultValues = useMemo<TemporaryVehicleFormValues>(() => {
    const now = new Date();
    return {
      registrationNumber: '',
      startDate: now,
      startTime: format(now, 'HH:mm'),
      endDate: addWeeks(now, 2),
      endTime: '23:59',
    };
  }, []);
  const { register, control, watch, handleSubmit, formState } =
    useForm<TemporaryVehicleFormValues>({
      mode: 'onTouched',
      defaultValues,
      resolver: yupResolver(validationSchema),
    });
  const startDate = watch('startDate');
  const registrationNumberField = register('registrationNumber');

  const submitForm = async (values: TemporaryVehicleFormValues) => {
    await addTemporaryVehicle({
      variables: {
        permitId: `${permit.id}`,
        registrationNumber: values.registrationNumber,
        startTime: combineDateAndTime(values.startDate, values.startTime),
        endTime: combineDateAndTime(values.endDate, values.endTime),
      },
    });
  };

  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <Card className={styles.formBox}>
        <form className={styles.forms} onSubmit={handleSubmit(submitForm)}>
          <TextInput
            id="registrationNumber"
            maxLength={7}
            label={t(`${T_PATH}.registrationNumber.label`)}
            className="registration-input"
            {...registrationNumberField}
            onChange={e => {
              e.target.value = e.target.value.toUpperCase();
              registrationNumberField.onChange(e);
            }}
          />
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateField
                id="startDate"
                className="date-input"
                minDate={new Date()}
                maxDate={permit.endTime ? new Date(permit.endTime) : undefined}
                initialMonth={new Date()}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                label={t(`${T_PATH}.startDate`)}
                language={i18n.language as Language}
              />
            )}
          />
          <TimeInput
            id="startTime"
            className="time-input"
            label={t(`${T_PATH}.startTime`)}
            hoursLabel="hours"
            minutesLabel="minutes"
            defaultValue={defaultValues.startTime}
            {...register('startTime')}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateField
                id="endDate"
                className="date-input"
                minDate={isValid(startDate) ? startDate : undefined}
                maxDate={permit.endTime ? new Date(permit.endTime) : undefined}
                initialMonth={isValid(startDate) ? startDate : undefined}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                label={t(`${T_PATH}.endDate`)}
                language={i18n.language as Language}
              />
            )}
          />
          <TimeInput
            id="endTime"
            className="time-input"
            label={t(`${T_PATH}.endTime`)}
            hoursLabel="hours"
            minutesLabel="minutes"
            defaultValue={defaultValues.endTime}
            {...register('endTime')}
          />
        </form>

        <div className="message" style={{ display: 'flex' }}>
          <IconInfoCircle className="icon" />
          <div className="message-text">{t(`${T_PATH}.infoMessage`)}</div>
        </div>
      </Card>
      <div className={styles.actionButtons}>
        <Button
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          iconStart={<IconArrowLeft />}
          onClick={() => cancelAddTempVehicle?.(false)}>
          {t(`${T_PATH}.actionBtn.cancel`)}
        </Button>
        <Button
          theme={ButtonPresetTheme.Black}
          type="submit"
          disabled={formState.isSubmitting}
          onClick={handleSubmit(submitForm)}
          iconEnd={<IconArrowRight />}>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>
      </div>
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
    </div>
  );
};

export default TemporaryVehicle;
