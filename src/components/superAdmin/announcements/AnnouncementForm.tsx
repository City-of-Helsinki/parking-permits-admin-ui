import { gql, useQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, LoadingSpinner, TextArea, TextInput } from 'hds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ParkingZone } from '../../../types';
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

interface AnnouncementInput {
  parkingZones: string[];
  subjectFi: string;
  contentFi: string;
  subjectSv: string;
  contentSv: string;
  subjectEn: string;
  contentEn: string;
}

interface AnnouncementFormProps {
  onSubmit: (announcement: AnnouncementInput) => void;
  onCancel: () => void;
}

const AnnouncementForm = ({
  onSubmit,
  onCancel,
}: AnnouncementFormProps): React.ReactElement => {
  const { t } = useTranslation();
  const { data, loading } = useQuery<{ zones: ParkingZone[] }>(ZONES_QUERY);

  const validationSchema = yup.object().shape({
    parkingZones: yup
      .array()
      .of(yup.string().required())
      .min(1, t(`${T_PATH}.selectZone`))
      .required(),
    contentEn: yup.string().required(t(`${T_PATH}.enterContent`)),
    contentFi: yup.string().required(t(`${T_PATH}.enterContent`)),
    contentSv: yup.string().required(t(`${T_PATH}.enterContent`)),
    subjectEn: yup.string().required(t(`${T_PATH}.enterSubject`)),
    subjectFi: yup.string().required(t(`${T_PATH}.enterSubject`)),
    subjectSv: yup.string().required(t(`${T_PATH}.enterSubject`)),
  });

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<AnnouncementInput>({
    mode: 'onTouched',
    defaultValues: {
      parkingZones: [],
      contentEn: '',
      contentFi: '',
      contentSv: '',
      subjectEn: '',
      subjectFi: '',
      subjectSv: '',
    },
    resolver: yupResolver(validationSchema),
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  const options: CheckboxGroupOption[] = data
    ? data.zones.map(zone => ({
        label: zone.name,
        value: zone.name,
      }))
    : [];

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onBlur={() => trigger('parkingZones')}>
        <CheckboxGroup
          name="parkingZones"
          className={styles.checkboxGrid}
          heading={t(`${T_PATH}.recipientZones`)}
          idPrefix="parkingZones"
          options={options}
          required
          errorText={errors.parkingZones?.message}
          onChange={values =>
            setValue('parkingZones', values, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
        />

        <h2 className="heading-s">{t(`${T_PATH}.announcementInFinnish`)}</h2>
        <Card>
          <TextInput
            id="subjectFi"
            className={styles.field}
            label={t(`${T_PATH}.subjectFi`)}
            required
            errorText={errors.subjectFi?.message}
            {...register('subjectFi')}
          />
          <TextArea
            id="contentFi"
            className={styles.field}
            label={t(`${T_PATH}.contentFi`)}
            required
            errorText={errors.contentFi?.message}
            {...register('contentFi')}
          />
        </Card>

        <h2 className="heading-s">{t(`${T_PATH}.announcementInSwedish`)}</h2>
        <Card>
          <TextInput
            id="subjectSv"
            className={styles.field}
            label={t(`${T_PATH}.subjectSv`)}
            required
            errorText={errors.subjectSv?.message}
            {...register('subjectSv')}
          />
          <TextArea
            id="contentSv"
            className={styles.field}
            label={t(`${T_PATH}.contentSv`)}
            required
            errorText={errors.contentSv?.message}
            {...register('contentSv')}
          />
        </Card>

        <h2 className="heading-s">{t(`${T_PATH}.announcementInEnglish`)}</h2>
        <Card>
          <TextInput
            id="subjectEn"
            className={styles.field}
            label={t(`${T_PATH}.subjectEn`)}
            required
            errorText={errors.subjectEn?.message}
            {...register('subjectEn')}
          />
          <TextArea
            id="contentEn"
            className={styles.field}
            label={t(`${T_PATH}.contentEn`)}
            required
            errorText={errors.contentEn?.message}
            {...register('contentEn')}
          />
        </Card>

        <div className={styles.actions}>
          <Button disabled={!(isDirty && isValid)} type="submit">
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
    </div>
  );
};

export default AnnouncementForm;
