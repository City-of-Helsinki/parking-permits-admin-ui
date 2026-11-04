jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  browserTracingIntegration: jest.fn(() => 'tracing'),
  replayIntegration: jest.fn(() => 'replay'),
}));
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn() })),
}));
jest.mock('./App', () => 'App');
jest.mock('./auth/LoginProvider', () => 'LoginProvider');
jest.mock('./api/ApiAccessTokenProvider', () => ({
  ApiAccessTokenProvider: 'ApiAccessTokenProvider',
}));
jest.mock('./api/ApiClientProvider', () => ({
  ApiClientProvider: 'ApiClientProvider',
}));
jest.mock('./i18n', () => ({}));
jest.mock('./reportWebVitals', () => jest.fn());

const originalEnv = process.env;
const sentryDsn = 'https://public@example.com/1';

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_SENTRY_'))
    .forEach(key => {
      delete process.env[key];
    });
});

afterEach(() => {
  process.env = originalEnv;
});

async function initializeSentry() {
  const sentry = await import('@sentry/react');
  await import('./index');
  return sentry.init;
}

it.each([undefined, ''])(
  'does not initialize without a DSN (%s)',
  async dsn => {
    if (dsn !== undefined) {
      process.env.REACT_APP_SENTRY_DSN = dsn;
    }

    const init = await initializeSentry();

    expect(init).not.toHaveBeenCalled();
  }
);

it.each(['review', 'development', 'testing', 'staging', 'production'])(
  'initializes in %s with tracing and replay disabled by default',
  async environment => {
    process.env.REACT_APP_SENTRY_DSN = sentryDsn;
    process.env.REACT_APP_SENTRY_ENVIRONMENT = environment;

    const init = await initializeSentry();

    expect(init).toHaveBeenCalledWith({
      dsn: sentryDsn,
      environment,
      release: undefined,
      integrations: ['tracing', 'replay'],
      tracesSampleRate: 0,
      tracePropagationTargets: [],
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  }
);

it('uses the configured release, sample rates and propagation targets', async () => {
  process.env.REACT_APP_SENTRY_DSN = sentryDsn;
  process.env.REACT_APP_SENTRY_ENVIRONMENT = 'development';
  process.env.REACT_APP_SENTRY_RELEASE = 'parking-permits-admin-ui@1.7.2';
  process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE = '0.25';
  process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS =
    'https://api.example.com, https://other.example.com, ';
  process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '0.1';
  process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '0.5';

  const init = await initializeSentry();

  expect(init).toHaveBeenCalledWith({
    dsn: sentryDsn,
    environment: 'development',
    release: 'parking-permits-admin-ui@1.7.2',
    integrations: ['tracing', 'replay'],
    tracesSampleRate: 0.25,
    tracePropagationTargets: [
      'https://api.example.com',
      'https://other.example.com',
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 0.5,
  });
});

it('keeps tracing and replay disabled when sample rates are empty', async () => {
  process.env.REACT_APP_SENTRY_DSN = sentryDsn;
  process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE = '';
  process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '';
  process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '';

  const init = await initializeSentry();

  expect(init).toHaveBeenCalledWith(
    expect.objectContaining({
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    })
  );
});
