import { CookieBanner, CookieConsentContextProvider } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router';
import routes from './routes';
import useCookieConsentSettings from './hooks/useCookieConsentSettings';

const App = (): React.ReactElement => {
  const { t } = useTranslation();
  const routing = useRoutes(routes);
  const siteName = t('components.header.appTitle');
  const cookieConsentProps = useCookieConsentSettings({ siteName });

  return (
    <CookieConsentContextProvider {...cookieConsentProps}>
      <div id="parking-permit-admin-app">{routing}</div>
      <CookieBanner />
    </CookieConsentContextProvider>
  );
};

export default App;
