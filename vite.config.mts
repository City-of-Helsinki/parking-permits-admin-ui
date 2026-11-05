/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const rawPublicVars = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    base: '/',
    envPrefix: 'REACT_APP_',
    plugins: [react()],
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
    },
    define: {
      // Inline the whole process.env object so that dynamic lookups such as
      // getEnv(process.env[key]) keep working, matching CRA/rsbuild's
      // DefinePlugin behavior.
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        ...rawPublicVars,
      }),
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
      },
    },
  };
});
