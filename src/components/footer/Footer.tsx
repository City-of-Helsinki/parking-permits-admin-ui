import { Footer as HDSFooter, Logo, logoFi } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'components.footer';

const Footer = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <HDSFooter theme="dark">
      <HDSFooter.Base
        copyrightHolder={t(`${T_PATH}.copyright`)}
        logo={<Logo src={logoFi} alt={t(`${T_PATH}.title`)} />}>
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pysakointi"
          label={t(`${T_PATH}.parkingInfo`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Maksullisen%20pys%C3%A4k%C3%B6innin%20ja%20pys%C3%A4k%C3%B6intitunnusten%20asiakasrekisteri.pdf"
          label={t(`${T_PATH}.registryDescription`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/fi/paatoksenteko-ja-hallinto/tietoa-helsingista/tietosuoja-ja-tiedonhallinta/tietosuoja"
          label={t(`${T_PATH}.dataProtection`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/static/liitteet/kaupunkiymparisto/saavutettavuusselosteet/fi/pysakointitunnusten-admin-saavutettavuusseloste.pdf"
          label={t(`${T_PATH}.accessibility`)}
        />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
