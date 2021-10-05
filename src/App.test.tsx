import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ApiAccessTokenProvider } from './auth/ApiAccessTokenProvider';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      language: 'fi',
      changeLanguage: () =>
        new Promise(() => {
          // do nothing
        }),
    },
  }),
}));

const unAuthenticatedClient = {
  getUser: () => null,
  isInitialized: () => false,
  isAuthenticated: () => false,
};

jest.mock('./auth/hooks', () => ({
  useClient: () => unAuthenticatedClient,
  useApiAccessTokens: () => ({
    getStatus: () => 'loaded',
    getTokens: () => undefined,
  }),
}));

test('renders app title', () => {
  render(
    <ApiAccessTokenProvider>
      <App />
    </ApiAccessTokenProvider>,
    { wrapper: MemoryRouter }
  );
  const titles = screen.getAllByText(/components.header.appTitle/i);
  expect(titles[0]).toBeInTheDocument();
});
