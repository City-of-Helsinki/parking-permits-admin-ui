import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApiAccessTokenProvider } from './api/ApiAccessTokenProvider';
import { ApiClientProvider } from './api/ApiClientProvider';
import App from './App';
import HandleCallback from './auth/HandleCallback';
import HDSLoginProvider from './auth/LoginProvider';
import './i18n';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { getEnv } from './utils';

const ENVS_WITH_SENTRY = ['test', 'stage', 'prod'];

if (
  process.env.REACT_APP_SENTRY_ENVIRONMENT &&
  ENVS_WITH_SENTRY.includes(process.env.REACT_APP_SENTRY_ENVIRONMENT)
) {
  Sentry.init({
    dsn: getEnv('REACT_APP_SENTRY_DSN'),
    environment: getEnv('REACT_APP_SENTRY_ENVIRONMENT'),
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);

root.render(
  <BrowserRouter>
    <HDSLoginProvider>
      <HandleCallback>
        <ApiAccessTokenProvider>
          <ApiClientProvider>
            <App />
          </ApiClientProvider>
        </ApiAccessTokenProvider>
      </HandleCallback>
    </HDSLoginProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
