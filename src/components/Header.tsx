import { Navigation } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router-dom';
import { useClient } from '../auth/hooks';

const T_PATH = 'components.header';

const isActiveLink = (path: string, currentPath: string): boolean =>
  !!matchPath({ path, end: false }, currentPath);

const Header = (): React.ReactElement => {
  const client = useClient();
  const user = client.getUser();
  const userName = user ? `${user.given_name} ${user.family_name}` : '';
  const { t, i18n } = useTranslation();
  const title = t(`${T_PATH}.appTitle`);
  const location = useLocation();
  const navLinks = [
    {
      path: '/permits',
      label: t(`${T_PATH}.permits`),
    },
    {
      path: '/returns',
      label: t(`${T_PATH}.returns`),
    },
    {
      path: '/messages',
      label: t(`${T_PATH}.messages`),
    },
    {
      path: '/reports',
      label: t(`${T_PATH}.reports`),
    },
  ];

  return (
    <Navigation
      title={title}
      logoLanguage={i18n.language === 'sv' ? 'sv' : 'fi'}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel={t(`${T_PATH}.skipToContent`)}>
      <Navigation.Actions>
        <Navigation.LanguageSelector label="FI">
          <Navigation.Item lang="fi" label="Suomeksi" />
          <Navigation.Item lang="sv" label="På svenska" />
          <Navigation.Item lang="en" label="In English" />
        </Navigation.LanguageSelector>
        <Navigation.User
          authenticated={client.isAuthenticated()}
          label={t(`${T_PATH}.login`)}
          onSignIn={(): void => client.login()}
          userName={userName}>
          <Navigation.Item
            onClick={(): void => client.logout()}
            variant="secondary"
            label={t(`${T_PATH}.logout`)}
          />
        </Navigation.User>
      </Navigation.Actions>
      {client.isAuthenticated() && (
        <Navigation.Row>
          {navLinks.map(({ path, label }) => (
            <Navigation.Item
              key={path}
              href={path}
              label={label}
              active={isActiveLink(path, location.pathname)}
            />
          ))}
        </Navigation.Row>
      )}
    </Navigation>
  );
};

export default Header;
