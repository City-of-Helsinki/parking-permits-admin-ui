import { CookieModal } from 'hds-react/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const routing = useRoutes(routes);
  const contentSource = {
    siteName: t('components.header.appTitle'),
    title: t('components.header.appTitle'),
    currentLanguage: i18n.language as 'fi' | 'sv' | 'en',
    optionalCookies: {
      cookies: [
        {
          commonGroup: 'statistics',
          commonCookie: 'matomo',
        },
      ],
    },
    language: {
      onLanguageChange: (code: string) => i18n.changeLanguage(code),
    },
    focusTargetSelector: '#parking-permit-admin-app',
    // TODO: Find some way not to break the load without reloading.
    onAllConsentsGiven: () => window.location.reload(),
  };
  return (
    <>
      <div id="parking-permit-admin-app">{routing}</div>
      <CookieModal contentSource={contentSource} />
    </>
  );
}

export default App;
