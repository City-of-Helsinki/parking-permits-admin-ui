import { addWeeks, format } from 'date-fns';
import { Field, FieldProps, Formik } from 'formik';
import {
  Button,
  Card,
  DateInput,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  Notification,
  TextInput,
  TimeInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { PermitDetail } from '../../types';
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

export interface TemporaryVehicleProps {
  className?: string;
  permit: PermitDetail;
  cancelAddTempVehicle?: (state: boolean) => void;
  addTemporaryVehicle: (data: { variables: FormProps }) => void;
}

export const combineDateAndTime = (date: Date, time: string): string => {
  const dateString = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  return new Date(`${dateString} ${time}`).toISOString();
};

const TemporaryVehicle = ({
  className,
  permit,
  cancelAddTempVehicle,
  addTemporaryVehicle,
}: TemporaryVehicleProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const initialValues: FormProps = {
    registrationNumber: '',
    startDate: new Date(),
    startTime: `${new Date().getHours()}:${new Date().getMinutes()}`,
    endDate: addWeeks(new Date(), 2),
    endTime: '23:59',
  };

  const validationSchema = Yup.object().shape({
    registrationNumber: Yup.string(),
    startDate: Yup.string().required(),
    startTime: Yup.string().required(),
    endDate: Yup.string().required(),
    endTime: Yup.string().required(),
  });

  const submitForm = (values: FormProps) => {
    addTemporaryVehicle({
      variables: {
        permitId: `${permit.id}`,
        registrationNumber: values.registrationNumber,
        startTime: combineDateAndTime(
          new Date(values.startDate as string),
          values.startTime
        ),
        endTime: combineDateAndTime(
          new Date(values.endDate as string),
          values.endTime
        ),
      },
    });
  };

  return (
    <div className={className}>
      <div className={styles.title}>{t(`${T_PATH}.title`)}</div>
      <Formik
        validateOnChange
        validateOnBlur
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={submitForm}>
        {({ handleSubmit, handleChange, isSubmitting }) => (
          <>
            <Card className={styles.formBox}>
              <form className={styles.forms} onSubmit={handleSubmit}>
                <Field name="registrationNumber">
                  {({ field }: FieldProps) => (
                    <TextInput
                      id="registrationNumber"
                      maxLength={7}
                      value={field.value?.toUpperCase()}
                      label={t(`${T_PATH}.registrationNumber.label`)}
                      onChange={handleChange}
                      className="registration-input"
                    />
                  )}
                </Field>
                <Field name="startDate">
                  {({ field, form }: FieldProps) => (
                    <DateInput
                      id="startDate"
                      className="date-input"
                      minDate={new Date()}
                      maxDate={addWeeks(new Date(), 2)}
                      initialMonth={new Date()}
                      value={format(field.value, 'd.M.yyyy')}
                      onChange={(value: string, valueAsDate: Date) =>
                        form.setFieldValue('startDate', valueAsDate)
                      }
                      label={t(`${T_PATH}.startDate`)}
                      language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
                    />
                  )}
                </Field>
                <Field name="startTime">
                  {({ field }: FieldProps) => (
                    <TimeInput
                      id="startTime"
                      className="time-input"
                      label={t(`${T_PATH}.startTime`)}
                      hoursLabel="hours"
                      minutesLabel="minutes"
                      value={field.value}
                      onChange={handleChange}
                    />
                  )}
                </Field>
                <Field name="endDate">
                  {({ field, form }: FieldProps) => (
                    <DateInput
                      id="endDate"
                      className="date-input"
                      minDate={form.getFieldProps('startDate').value}
                      initialMonth={form.getFieldProps('startDate').value}
                      value={format(field.value, 'd.M.yyyy')}
                      onChange={(value: string, valueAsDate: Date) =>
                        form.setFieldValue('endDate', valueAsDate)
                      }
                      label={t(`${T_PATH}.endDate`)}
                      language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
                    />
                  )}
                </Field>
                <Field name="endTime">
                  {({ field }: FieldProps) => (
                    <TimeInput
                      id="endTime"
                      className="time-input"
                      label={t(`${T_PATH}.endTime`)}
                      hoursLabel="hours"
                      minutesLabel="minutes"
                      value={field.value}
                      onChange={handleChange}
                    />
                  )}
                </Field>
              </form>

              <div className="message" style={{ display: 'flex' }}>
                <IconInfoCircle className="icon" />
                <div className="message-text">{t(`${T_PATH}.infoMessage`)}</div>
              </div>
            </Card>
            <div className={styles.actionButtons}>
              <Button
                theme="black"
                variant="secondary"
                iconLeft={<IconArrowLeft />}
                onClick={() => cancelAddTempVehicle?.(false)}>
                <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
              </Button>
              <Button
                theme="black"
                type="submit"
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
                iconRight={<IconArrowRight />}>
                {t(`${T_PATH}.actionBtn.continue`)}
              </Button>
            </div>
          </>
        )}
      </Formik>
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
