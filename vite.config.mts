import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from '@nabla/vite-plugin-eslint';
import { thirdPartyLicenses } from '@city-of-helsinki/license-notices';

import { thirdPartyLicensesConfig } from './scripts/thirdPartyLicenses.config.mts';

export default defineConfig(({ mode }) => ({
  base: '/',
  envPrefix: 'REACT_APP_',
  plugins: [
    react(),
    mode !== 'test' && eslint(),
    thirdPartyLicenses(thirdPartyLicensesConfig),
  ],
  server: {
    // Bind to all interfaces so the dev server is reachable through the
    // container's published port mapping.
    host: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true
  },
  test: {
    environment: 'jsdom',
    // Restores bare describe/it/expect globals, matching current Jest-style tests.
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    // Matches the identity-obj-proxy behavior from jest.config.js: style
    // imports resolve to an inert value instead of being compiled.
    css: false,
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './jest-report.xml',
    },
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text', 'cobertura'],
      include: ['src/**/*'],
      exclude: [
        'src/index.tsx',
        'src/reportWebVitals.ts',
        'src/types.ts',
        'src/assets/**/*',
        'src/styles/**/*',
        'src/i18n/**/*',
      ],
    },
  },
}));
