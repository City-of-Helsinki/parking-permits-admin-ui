import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ApiAccessTokenProvider } from './api/ApiAccessTokenProvider';
import { ApiClientProvider } from './api/ApiClientProvider';
import App from './App';
import HDSLoginProvider from './auth/LoginProvider';
import './i18n';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { getEnvValue } from './utils';

if (getEnvValue('REACT_APP_SENTRY_DSN')) {
  Sentry.init({
    dsn: getEnvValue('REACT_APP_SENTRY_DSN'),
    environment: getEnvValue('REACT_APP_SENTRY_ENVIRONMENT'),
    release: getEnvValue('REACT_APP_SENTRY_RELEASE'),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: parseFloat(
      getEnvValue('REACT_APP_SENTRY_TRACES_SAMPLE_RATE') || '0'
    ),
    tracePropagationTargets: (
      getEnvValue('REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS') || ''
    )
      .split(',')
      .map((target: string) => target.trim())
      .filter(Boolean),
    replaysSessionSampleRate: parseFloat(
      getEnvValue('REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE') || '0'
    ),
    replaysOnErrorSampleRate: parseFloat(
      getEnvValue('REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE') || '0'
    ),
  });
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <BrowserRouter>
    <HDSLoginProvider>
      <ApiAccessTokenProvider>
        <ApiClientProvider>
          <App />
        </ApiClientProvider>
      </ApiAccessTokenProvider>
    </HDSLoginProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
