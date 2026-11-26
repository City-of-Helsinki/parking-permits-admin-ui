import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  useOidcClient: () => ({ login: mocks.login }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Login page', () => {
  it('renders the login button', () => {
    render(<Login />);

    expect(screen.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  it('starts login when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(mocks.login).toHaveBeenCalledTimes(1);
  });
});
