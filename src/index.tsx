import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApiClientProvider } from './api/ApiClientProvider';
import App from './App';
import { ApiAccessTokenProvider } from './auth/ApiAccessTokenProvider';
import { ClientProvider } from './auth/ClientProvider';
import HandleCallback from './auth/HandleCallback';
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
  <React.StrictMode>
    <BrowserRouter>
      <HandleCallback>
        <ClientProvider>
          <ApiAccessTokenProvider>
            <ApiClientProvider>
              <App />
            </ApiClientProvider>
          </ApiAccessTokenProvider>
        </ClientProvider>
      </HandleCallback>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
