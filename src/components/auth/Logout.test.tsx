import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import Logout, { getUserDisplayName } from './Logout';

const mocks = vi.hoisted(() => ({ logout: vi.fn() }));

vi.mock('hds-react', async importOriginal => {
  const actual = await importOriginal<typeof import('hds-react')>();
  return {
    ...actual,
    useAuthenticatedUser: () => null,
    useOidcClient: () => ({ logout: mocks.logout }),
    Header: {
      ...actual.Header,
      UserMenuButton: ({
        children,
      }: {
        children: ReactNode;
      }) => <div>{children}</div>,
      ActionBarSubItemGroup: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
      ),
      LogoutSubmenuButton: ({ label }: { label: string }) => (
        <button onClick={mocks.logout}>{label}</button>
      ),
    },
  };
});

const renderLogout = () => render(<Logout />);

beforeEach(() => vi.clearAllMocks());

describe('getUserDisplayName', () => {
  it('prefers the name claim', () => {
    expect(getUserDisplayName({ name: 'Jane Doe' }, 'User')).toBe('Jane Doe');
  });

  it('uses the given and family name when the name claim is missing', () => {
    expect(
      getUserDisplayName({ given_name: 'Jane', family_name: 'Doe' }, 'User')
    ).toBe('Jane Doe');
  });

  it('falls back to the preferred username and generic label', () => {
    expect(getUserDisplayName({ preferred_username: 'jdoe' }, 'User')).toBe(
      'jdoe'
    );
    expect(getUserDisplayName({}, 'User')).toBe('User');
  });
});

describe('Logout', () => {
  it('renders the HDS logout button with its localized label', () => {
    renderLogout();

    expect(screen.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  it('calls OIDC logout when the button is clicked', async () => {
    const user = userEvent.setup();
    renderLogout();

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(mocks.logout).toHaveBeenCalledTimes(1);
  });
});
