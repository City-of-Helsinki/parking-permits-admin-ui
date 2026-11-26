// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { default as RO } from 'resize-observer-polyfill';
import { vi } from 'vitest';
// Load generated runtime configuration to be available in tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../public/test-env-config.js');

vi.mock('react-i18next', async importOriginal => {
  const { createEnglishReactI18nextMock } = await import('./__tests__/i18n');
  return {
    ...(await importOriginal<typeof import('react-i18next')>()),
    ...(await createEnglishReactI18nextMock()),
  };
});

global.ResizeObserver = RO;
