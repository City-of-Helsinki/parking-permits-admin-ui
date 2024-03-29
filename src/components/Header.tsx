import { Navigation } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import { useClient } from '../auth/hooks';

const T_PATH = 'components.header';

const LANGUAGES = [
  ['fi', 'Suomeksi'],
  ['sv', 'På Svenska'],
  ['en', 'In English'],
];

const isActiveLink = (path: string, currentPath: string): boolean =>
  !!matchPath({ path, end: false }, currentPath);

const Header = (): React.ReactElement => {
  const navigate = useNavigate();
  const client = useClient();
  const userRole = useUserRole();
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
    ...(userRole > UserRole.INSPECTORS
      ? [
          {
            path: '/orders',
            label: t(`${T_PATH}.orders`),
          },
          {
            path: '/refunds',
            label: t(`${T_PATH}.refunds`),
          },
        ]
      : []),
    ...(userRole === UserRole.SUPER_ADMIN
      ? [
          {
            path: '/admin',
            label: t(`${T_PATH}.admin`),
          },
        ]
      : []),
  ];

  return (
    <Navigation
      title={title}
      logoLanguage={i18n.language === 'sv' ? 'sv' : 'fi'}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel={t(`${T_PATH}.skipToContent`)}>
      <Navigation.Actions>
        <Navigation.LanguageSelector label={i18n.language.toUpperCase()}>
          {LANGUAGES.map(([lang, label]) => (
            <Navigation.Item
              key={lang}
              lang={lang}
              label={label}
              onClick={() => i18n.changeLanguage(lang)}
            />
          ))}
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
      {client.isAuthenticated() && userRole > UserRole.NON_AD_GROUPS && (
        <Navigation.Row>
          {navLinks.map(({ path, label }) => (
            <Navigation.Item
              key={path}
              label={label}
              onClick={() => navigate(path)}
              active={isActiveLink(path, location.pathname)}
            />
          ))}
        </Navigation.Row>
      )}
    </Navigation>
  );
};

export default Header;
