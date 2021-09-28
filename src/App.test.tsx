import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

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
}));

test('renders app title', () => {
  render(<App />, { wrapper: MemoryRouter });
  const titles = screen.getAllByText(/components.header.appTitle/i);
  expect(titles[0]).toBeInTheDocument();
});
