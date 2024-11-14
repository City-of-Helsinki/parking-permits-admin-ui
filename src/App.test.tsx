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

it('renders without crashing', () => {
  <MemoryRouter>
    <App />
  </MemoryRouter>;
});
