import * as Sentry from '@sentry/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ApiAccessTokenProvider } from './api/ApiAccessTokenProvider';
import { ApiClientProvider } from './api/ApiClientProvider';
import { UserRoleProvider } from './api/useUserRole';
import App from './App';
import LoginProvider from './auth/LoginProvider';
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
    tracesSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_TRACES_SAMPLE_RATE') || '0'
    ),
    tracePropagationTargets: (
      getEnvValue('REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS') || ''
    )
      .split(',')
      .map((target: string) => target.trim())
      .filter(Boolean),
    replaysSessionSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE') || '0'
    ),
    replaysOnErrorSampleRate: Number.parseFloat(
      getEnvValue('REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE') || '0'
    ),
  });
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <LoginProvider>
      <ApiAccessTokenProvider>
        <ApiClientProvider>
          <UserRoleProvider>
            <App />
          </UserRoleProvider>
        </ApiClientProvider>
      </ApiAccessTokenProvider>
    </LoginProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
