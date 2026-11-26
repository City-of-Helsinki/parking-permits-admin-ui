import { LoginProvider } from 'hds-react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserManager } from 'oidc-client-ts';
import Login from './Login';

const userManagerSettings = {
  authority: 'https://auth.example.test',
  client_id: 'test-client',
  redirect_uri: 'http://localhost/login/callback',
};

const renderLogin = () => {
  const user = userEvent.setup();
  render(
    <LoginProvider userManagerSettings={userManagerSettings}>
      <Login />
    </LoginProvider>
  );
  return user;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Login', () => {
  it('renders the HDS login button with the localized label', () => {
    renderLogin();

    expect(screen.getByRole('button', { name: 'Login' })).toHaveAttribute(
      'id',
      'action-bar-login-action'
    );
  });

  it('starts OIDC login when the button is clicked', async () => {
    const signInRedirect = vi
      .spyOn(UserManager.prototype, 'signinRedirect')
      .mockResolvedValue(undefined);
    const user = renderLogin();

    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(signInRedirect).toHaveBeenCalledTimes(1));
  });
});
