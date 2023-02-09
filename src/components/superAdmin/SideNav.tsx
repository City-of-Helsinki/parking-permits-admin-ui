import { SideNavigation } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

const T_PATH = 'components.superAdmin.sideNav';

interface MenuItem {
  id: string;
  href: string;
  label: string;
}

const SideNav = (): React.ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const menuItems: MenuItem[] = [
    {
      id: 'products',
      href: '/admin/products',
      label: t(`${T_PATH}.products`),
    },
    {
      id: 'addresses',
      href: '/admin/addresses',
      label: t(`${T_PATH}.addresses`),
    },
    {
      id: 'lowEmissionCriteria',
      href: '/admin/lowEmissionCriteria',
      label: t(`${T_PATH}.lowEmissionCriteria`),
    },
    {
      id: 'customers',
      href: '/admin/customers',
      label: t(`${T_PATH}.customers`),
    },
    {
      id: 'announcements',
      href: '/admin/announcements',
      label: t(`${T_PATH}.announcements`),
    },
  ];

  return (
    <SideNavigation
      id="super-admin-sidenav"
      toggleButtonLabel={t(`${T_PATH}.menu`)}>
      {menuItems.map(menuItem => (
        <SideNavigation.MainLevel
          key={menuItem.id}
          id={menuItem.id}
          href={menuItem.href}
          label={menuItem.label}
          active={location.pathname === menuItem.href}
          onClick={e => {
            e.preventDefault();
            navigate(menuItem.href);
          }}
        />
      ))}
    </SideNavigation>
  );
};

export default SideNav;
