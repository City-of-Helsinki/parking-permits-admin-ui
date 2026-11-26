import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import SideNav from './SideNav';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

const navigationLinks = [
  ['Products', '/admin/products'],
  ['Addresses', '/admin/addresses'],
  ['Customers', '/admin/customers'],
  ['Announcements', '/admin/announcements'],
] as const;

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const renderSideNav = (path = '/admin/products') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[path]}>
      <SideNav />
    </MemoryRouter>
  );
  return user;
};

describe('SideNav', () => {
  it('renders the super-admin navigation links', () => {
    renderSideNav();

    for (const [label, href] of navigationLinks) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        href
      );
    }
  });

  it('marks the current route as active', () => {
    renderSideNav('/admin/customers');

    expect(screen.getByRole('link', { name: 'Customers' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Products' })).not.toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('navigates to the selected section', async () => {
    const user = renderSideNav();

    await user.click(screen.getByRole('link', { name: 'Addresses' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/admin/addresses');
  });
});
