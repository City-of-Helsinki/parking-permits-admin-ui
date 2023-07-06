import { Footer as HDSFooter } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'components.footer';

const Footer = (): React.ReactElement => {
  const { t } = useTranslation();
  const FOOTER_COLOR = 'var(--color-white)';
  return (
    <HDSFooter theme="dark">
      <HDSFooter.Base copyrightHolder={t(`${T_PATH}.copyright`)}>
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pysakointi"
          label={t(`${T_PATH}.parkingInfo`)}
        />
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Maksullisen%20pys%C3%A4k%C3%B6innin%20ja%20pys%C3%A4k%C3%B6intitunnusten%20asiakasrekisteri.pdf"
          label={t(`${T_PATH}.registryDescription`)}
        />
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/fi/paatoksenteko-ja-hallinto/tietoa-helsingista/tietosuoja-ja-tiedonhallinta/tietosuoja"
          label={t(`${T_PATH}.dataProtection`)}
        />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
