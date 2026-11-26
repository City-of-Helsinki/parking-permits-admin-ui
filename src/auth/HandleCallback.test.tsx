import * as Sentry from '@sentry/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OidcClientError } from 'hds-react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import HandleCallback from './HandleCallback';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  isAuthenticated: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock('@sentry/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@sentry/react')>()),
  captureException: mocks.captureException,
}));

vi.mock('hds-react', async importOriginal => {
  const actual = await importOriginal<typeof import('hds-react')>();
  return {
    ...actual,
    useOidcClient: () => ({ isAuthenticated: mocks.isAuthenticated }),
    LoginCallbackHandler: ({
      children,
      onSuccess,
      onError,
    }: {
      children: ReactNode;
      onSuccess: () => void;
      onError: (error?: OidcClientError) => void;
    }) => {
      const reportError = (knownHdsError: boolean) => {
        const error = new actual.OidcClientError(
          knownHdsError
            ? 'Current state (HANDLING_LOGIN_CALLBACK) cannot be handled by a callback'
            : 'Authentication failed',
          knownHdsError ? 'SIGNIN_ERROR' : 'INVALID_OR_EXPIRED_USER'
        );
        onError(error);
      };

      return (
        <div data-testid="login-callback-handler">
          {children}
          <button onClick={onSuccess}>Complete login</button>
          <button onClick={() => onError(undefined)}>Fail without error</button>
          <button onClick={() => reportError(false)}>Fail login</button>
          <button onClick={() => reportError(true)}>
            Report stale callback
          </button>
        </div>
      );
    },
  };
});

vi.mock('react-router', async importOriginal => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('./index', () => ({
  isCallbackUrl: (path: string) => path === '/callback',
}));

const renderHandleCallback = (path = '/callback') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <HandleCallback>
        <div>Application content</div>
      </HandleCallback>
    </MemoryRouter>
  );

const mockConsoleError = () =>
  vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.isAuthenticated.mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HandleCallback', () => {
  it.each([
    { path: '/application', authenticated: false },
    { path: '/callback', authenticated: true },
  ])(
    'renders children when callback handling is not required',
    ({ path, authenticated }) => {
      mocks.isAuthenticated.mockReturnValue(authenticated);
      renderHandleCallback(path);

      expect(screen.getByText('Application content')).toBeVisible();
      expect(
        screen.queryByTestId('login-callback-handler')
      ).not.toBeInTheDocument();
    }
  );

  it('shows a loading message while handling an unauthenticated callback', () => {
    renderHandleCallback();

    expect(screen.getByText('Logging in...')).toBeVisible();
    expect(screen.getByTestId('login-callback-handler')).toBeInTheDocument();
    expect(screen.queryByText('Application content')).not.toBeInTheDocument();
  });

  it('navigates to permits after successful callback handling', async () => {
    const user = userEvent.setup();
    renderHandleCallback();

    await user.click(screen.getByRole('button', { name: 'Complete login' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/permits', { replace: true });
  });

  it('does nothing when the callback handler returns no error', async () => {
    const user = userEvent.setup();
    const consoleError = mockConsoleError();
    renderHandleCallback();

    await user.click(
      screen.getByRole('button', { name: 'Fail without error' })
    );

    expect(consoleError).toHaveBeenCalledWith(undefined);
    expect(mocks.captureException).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('ignores the known HDS callback-state error', async () => {
    const user = userEvent.setup();
    const consoleError = mockConsoleError();
    renderHandleCallback();

    await user.click(
      screen.getByRole('button', { name: 'Report stale callback' })
    );

    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Current state (HANDLING_LOGIN_CALLBACK) cannot be handled by a callback',
      })
    );
    expect(mocks.captureException).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('captures unexpected callback errors and navigates to the error page', async () => {
    const user = userEvent.setup();
    const consoleError = mockConsoleError();
    renderHandleCallback();

    await user.click(screen.getByRole('button', { name: 'Fail login' }));

    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Authentication failed' })
    );
    const error = consoleError.mock.calls[0]?.[0];
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(mocks.navigate).toHaveBeenCalledWith('/authError', {
      replace: true,
    });
  });
});
