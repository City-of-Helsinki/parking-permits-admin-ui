import { InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createApolloClientModule } from 'hds-react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import LoginProvider from './LoginProvider';

const mocks = vi.hoisted(() => ({
  authLink: { concat: vi.fn() },
  captureProviderProps: vi.fn(),
  clientModule: {},
  createApolloClientModule: vi.fn(),
  createHttpLink: vi.fn(),
  getEnvValue: vi.fn(),
  getHDSClientConfig: vi.fn(),
  httpLink: {},
  link: {},
  loginConfig: { userManagerSettings: { client_id: 'test-client' } },
  setContext: vi.fn(),
}));
type ContextSetter = Parameters<typeof setContext>[0];
let contextSetter: ContextSetter | undefined;

vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  createHttpLink: mocks.createHttpLink,
}));

vi.mock('@apollo/client/link/context', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client/link/context')>()),
  setContext: mocks.setContext,
}));

vi.mock('hds-react', async importOriginal => ({
  ...(await importOriginal<typeof import('hds-react')>()),
  createApolloClientModule: mocks.createApolloClientModule,
  LoginProvider: ({
    children,
    ...props
  }: { children: ReactNode } & Record<string, unknown>) => {
    mocks.captureProviderProps(props);
    return <div>{children}</div>;
  },
}));

vi.mock('./index', () => ({
  getHDSClientConfig: mocks.getHDSClientConfig,
}));

vi.mock('../utils', async importOriginal => ({
  ...(await importOriginal<typeof import('../utils')>()),
  getEnvValue: mocks.getEnvValue,
}));

const renderProvider = (content: string) => (
  <LoginProvider>
    <div>{content}</div>
  </LoginProvider>
);

const getApolloClientOptions = () => {
  const options = vi.mocked(createApolloClientModule).mock.calls[0]?.[0];
  if (!options) {
    throw new Error('Apollo client module options were not captured');
  }
  return options;
};

describe('LoginProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contextSetter = undefined;
    mocks.getHDSClientConfig.mockReturnValue(mocks.loginConfig);
    mocks.createApolloClientModule.mockReturnValue(mocks.clientModule);
    mocks.getEnvValue.mockImplementation((name: string) => {
      if (name === 'REACT_APP_PARKING_PERMITS_BACKEND_URL') {
        return 'https://parking.example.test';
      }
      if (name === 'REACT_APP_PARKING_PERMITS_AUDIENCE') {
        return 'parking-audience';
      }
      return undefined;
    });
    mocks.createHttpLink.mockReturnValue(mocks.httpLink);
    mocks.authLink.concat.mockReturnValue(mocks.link);
    vi.mocked(setContext).mockImplementation(setter => {
      contextSetter = setter;
      return mocks.authLink as unknown as ReturnType<typeof setContext>;
    });
  });

  it('configures and provides a memoized Apollo module to HDS', () => {
    const { rerender } = render(renderProvider('Application content'));

    expect(screen.getByText('Application content')).toBeInTheDocument();
    expect(mocks.createHttpLink).toHaveBeenCalledWith({
      uri: 'https://parking.example.test/admin-graphql/',
    });
    expect(setContext).toHaveBeenCalledWith(expect.any(Function));
    expect(mocks.captureProviderProps).toHaveBeenCalledWith({
      ...mocks.loginConfig,
      modules: [mocks.clientModule],
    });
    expect(mocks.createApolloClientModule).toHaveBeenCalledOnce();
    const options = getApolloClientOptions();
    expect(options.clientOptions.cache).toBeInstanceOf(InMemoryCache);
    expect(
      options.tokenSetter?.({}, { 'parking-audience': 'test-token' })
        .authorization
    ).toContain('test-token');
    expect(options.tokenSetter?.({}, {}).authorization).toBe('');
    expect(options.clientOptions.link).toBe(mocks.link);

    if (!contextSetter) {
      throw new Error('Authentication context setter was not captured');
    }
    expect(
      contextSetter({} as Parameters<ContextSetter>[0], {
        headers: { existing: 'header' },
      })
    ).toEqual({
      headers: {
        existing: 'header',
        'Accept-Language': 'fi',
        'Content-Language': 'fi',
      },
    });

    rerender(renderProvider('Updated content'));

    expect(screen.getByText('Updated content')).toBeInTheDocument();
    expect(mocks.createApolloClientModule).toHaveBeenCalledOnce();
  });
});
