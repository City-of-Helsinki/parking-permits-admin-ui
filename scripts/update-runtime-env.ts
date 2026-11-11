/* eslint-disable no-console */
import dotenv from 'dotenv';
import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const USE_TEST_ENV = process.env.NODE_ENV === 'test';
const defaultNodeEnv = USE_TEST_ENV ? 'test' : 'development';

const env: Record<string, string> = {
  NODE_ENV: process.env.NODE_ENV || defaultNodeEnv,
};

dotenv.config({
  processEnv: env,
  ...(USE_TEST_ENV
    ? { path: ['.env', '.env.test'] }
    : {
        path: [
          '.env',
          `.env.${env.NODE_ENV}`,
          '.env.local',
          `.env.${env.NODE_ENV}.local`,
        ],
      }),
  override: true,
});

// Shell variables take precedence over files; only public prefixes are exposed
const PUBLIC_PREFIXES = ['REACT_APP_', 'VITE_'];
Object.entries(process.env).forEach(([key, value]) => {
  if (value !== undefined && PUBLIC_PREFIXES.some(p => key.startsWith(p))) {
    env[key] = value;
  }
});

// Prevent collision if app is running while tests are started
const configFile = USE_TEST_ENV ? 'test-env-config.js' : 'env-config.js';

const configurationFile: string = path.join(
  __dirname,
  '../public/' + configFile
);

const start = async () => {
  try {
    fs.writeFile(
      configurationFile,
      'globalThis.window._env_ = ' + util.inspect(env, false, 2, false),
      function (err) {
        if (err) {
          console.error(err instanceof Error ? err.message : String(err));
          process.exit(1);
        }
        console.log('File created!');
      }
    );
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
};

start();
