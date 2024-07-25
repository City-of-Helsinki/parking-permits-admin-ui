import {
  Header as HDSHeader,
  IconSignin,
  IconSignout,
  LanguageOption,
  Logo,
  logoFi,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import useUserRole, { UserRole } from '../api/useUserRole';
import { useClient } from '../auth/hooks';

const T_PATH = 'components.header';

const isActiveLink = (path: string, currentPath: string): boolean =>
  !!matchPath({ path, end: false }, currentPath);

const Header = (): React.ReactElement => {
  const navigate = useNavigate();
  const client = useClient();
  const userRole = useUserRole();
  const { t, i18n } = useTranslation();
  const title = t(`${T_PATH}.appTitle`);
  const location = useLocation();

  const authenticated = client?.isAuthenticated();
  const initialized = client?.isInitialized();

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

  const languages: LanguageOption[] = [
    { label: 'Suomi', value: 'fi', isPrimary: true },
    { label: 'Svenska', value: 'sv', isPrimary: true },
    { label: 'English', value: 'en', isPrimary: true },
  ];

  const languageChangedStateAction = (code: string) => {
    i18n.changeLanguage(code).then(() => undefined);
  };

  return (
    <>
      <HDSHeader
        title={title}
        onDidChangeLanguage={languageChangedStateAction}
        languages={languages}>
        <HDSHeader.ActionBar
          frontPageLabel={t(`${T_PATH}.appTitle`)}
          title={t(`${T_PATH}.appTitle`)}
          titleAriaLabel={t(`${T_PATH}.appTitle`)}
          titleHref="https://hel.fi"
          logo={<Logo src={logoFi} alt="City of Helsinki" />}
          logoAriaLabel={t(`${T_PATH}.appTitle`)}>
          <HDSHeader.SimpleLanguageOptions
            languages={[languages[0], languages[1], languages[2]]}
          />
          {initialized && !authenticated && (
            <HDSHeader.ActionBarButton
              label={t(`${T_PATH}.login`)}
              fixedRightPosition
              icon={<IconSignin />}
              onClick={(): void => client?.login()}
            />
          )}

          {initialized && authenticated && (
            <HDSHeader.ActionBarButton
              label={t(`${T_PATH}.logout`)}
              fixedRightPosition
              icon={<IconSignout />}
              onClick={(): void => client?.logout()}
            />
          )}
        </HDSHeader.ActionBar>
        {authenticated && userRole > UserRole.NON_AD_GROUPS && (
          <HDSHeader.NavigationMenu>
            {navLinks.map(({ path, label }) => (
              <HDSHeader.Link
                key={path}
                label={label}
                onClick={() => navigate(path)}
                active={isActiveLink(path, location.pathname)}
              />
            ))}
          </HDSHeader.NavigationMenu>
        )}
      </HDSHeader>
    </>
  );
};

export default Header;
