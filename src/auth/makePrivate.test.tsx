import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useIsAuthorizationReady } from './useIsAuthReady';
import makePrivate from './makePrivate';

vi.mock('./useIsAuthReady', () => ({
  useIsAuthorizationReady: vi.fn(),
}));

const ProtectedPage = makePrivate(() => <div>Protected content</div>);

const renderProtectedPage = () =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={<ProtectedPage />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('makePrivate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the wrapped component for authenticated users', () => {
    vi.mocked(useIsAuthorizationReady).mockReturnValue([
      true,
      false,
      true,
      true,
    ]);

    renderProtectedPage();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    vi.mocked(useIsAuthorizationReady).mockReturnValue([
      true,
      false,
      false,
      true,
    ]);

    renderProtectedPage();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
