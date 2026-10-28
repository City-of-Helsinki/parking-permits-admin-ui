import { pluginThirdPartyLicenses } from '@city-of-helsinki/license-notices/rsbuild';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

import { thirdPartyLicensesConfig } from './scripts/thirdPartyLicenses.config';

const { rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSass(),
    pluginThirdPartyLicenses(thirdPartyLicensesConfig),
  ],
  html: {
    template: './public/index.html',
  },
  server: {
    // Bind to all interfaces so the dev server is reachable through the
    // container's published port mapping.
    host: '0.0.0.0',
    port: 3000,
  },
  source: {
    // Inline the whole process.env object so that dynamic lookups such as
    // getEnv(process.env[key]) keep working, matching CRA's DefinePlugin behavior.
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV,
        ...rawPublicVars,
      }),
    },
  },
  output: {
    distPath: {
      root: 'build',
    },
  },
});
