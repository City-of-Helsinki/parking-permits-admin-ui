import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  useApolloClient,
} from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { useApolloClient as useHdsApolloClient } from 'hds-react';
import { ApiClientProvider } from './ApiClientProvider';

vi.mock('hds-react', () => ({
  useApolloClient: vi.fn(),
}));

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.empty(),
});

const ClientProbe = () => (
  <div data-testid="client-probe">
    {useApolloClient() === client ? 'HDS client provided' : 'Wrong client'}
  </div>
);

describe('ApiClientProvider', () => {
  it('provides the HDS Apollo client to its children', () => {
    vi.mocked(useHdsApolloClient).mockReturnValue(client);

    render(
      <ApiClientProvider>
        <ClientProbe />
      </ApiClientProvider>
    );

    expect(screen.getByText('HDS client provided')).toBeInTheDocument();
  });
});
