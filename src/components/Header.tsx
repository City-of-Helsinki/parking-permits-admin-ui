import { Navigation } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router-dom';

const T_PATH = 'components.header';

const isActiveLink = (path: string, currentPath: string): boolean =>
  !!matchPath({ path, end: false }, currentPath);

const Header = (): React.ReactElement => {
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
      skipToContentLabel="Skip to content">
      <Navigation.Actions>
        <Navigation.LanguageSelector label="FI">
          <Navigation.Item lang="fi" label="Suomeksi" />
          <Navigation.Item lang="sv" label="På svenska" />
          <Navigation.Item lang="en" label="In English" />
        </Navigation.LanguageSelector>
        <Navigation.User label="Sign in" />
      </Navigation.Actions>
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
    </Navigation>
  );
};

export default Header;
