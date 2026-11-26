import { render, screen } from '@testing-library/react';
import { useIsAuthorizationReady } from '../auth/useIsAuthReady';
import { ApiAccessTokenProvider } from './ApiAccessTokenProvider';

vi.mock('../auth/useIsAuthReady', () => ({
  useIsAuthorizationReady: vi.fn(),
}));

type AuthorizationState = ReturnType<typeof useIsAuthorizationReady>;

const statesThatRenderChildren: {
  state: AuthorizationState;
}[] = [
  { state: [true, true, true, false] },
  { state: [false, false, false, false] },
  { state: [false, true, false, true] },
];

const renderProvider = (state: AuthorizationState) => {
  vi.mocked(useIsAuthorizationReady).mockReturnValue(state);
  render(
    <ApiAccessTokenProvider>
      <div>Protected content</div>
    </ApiAccessTokenProvider>
  );
};

describe('ApiAccessTokenProvider', () => {
  it('shows a loading spinner before the first token is fetched', () => {
    renderProvider([false, true, false, false]);

    expect(screen.getByText('Page is loading')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it.each(statesThatRenderChildren)(
    'renders children when auth state is $state',
    ({ state }) => {
      renderProvider(state);

      expect(screen.getByText('Protected content')).toBeInTheDocument();
      expect(screen.queryByText('Page is loading')).not.toBeInTheDocument();
    }
  );
});
