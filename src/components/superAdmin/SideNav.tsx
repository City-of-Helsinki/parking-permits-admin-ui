import { SideNavigation } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'components.superAdmin.sideNav';

interface MenuItem {
  id: string;
  href: string;
  label: string;
}

const SideNav = (): React.ReactElement => {
  const [active, setActive] = useState('products');
  const { t } = useTranslation();
  const menuItems: MenuItem[] = [
    {
      id: 'users',
      href: '/admin/users',
      label: t(`${T_PATH}.users`),
    },
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
          active={active === menuItem.id}
          onClick={() => setActive(menuItem.id)}
        />
      ))}
    </SideNavigation>
  );
};

export default SideNav;
