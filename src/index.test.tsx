vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => 'tracing'),
  replayIntegration: vi.fn(() => 'replay'),
}));
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));
vi.mock('./App', () => ({ default: 'App' }));
vi.mock('./auth/LoginProvider', () => ({ default: 'LoginProvider' }));
vi.mock('./api/ApiAccessTokenProvider', () => ({
  ApiAccessTokenProvider: 'ApiAccessTokenProvider',
}));
vi.mock('./api/ApiClientProvider', () => ({
  ApiClientProvider: 'ApiClientProvider',
}));
vi.mock('./i18n', () => ({}));
vi.mock('./reportWebVitals', () => ({ default: vi.fn() }));

const sentryDsn = 'https://public@example.com/1';

beforeEach(() => {
  vi.resetModules();
  Object.keys(import.meta.env)
    .filter(key => key.startsWith('REACT_APP_SENTRY_'))
    .forEach(key => {
      vi.stubEnv(key, undefined);
    });
});

afterEach(() => {
  vi.unstubAllEnvs();
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
      vi.stubEnv('REACT_APP_SENTRY_DSN', dsn);
    }

    const init = await initializeSentry();

    expect(init).not.toHaveBeenCalled();
  }
);

it.each(['review', 'development', 'testing', 'staging', 'production'])(
  'initializes in %s with tracing and replay disabled by default',
  async environment => {
    vi.stubEnv('REACT_APP_SENTRY_DSN', sentryDsn);
    vi.stubEnv('REACT_APP_SENTRY_ENVIRONMENT', environment);

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
  vi.stubEnv('REACT_APP_SENTRY_DSN', sentryDsn);
  vi.stubEnv('REACT_APP_SENTRY_ENVIRONMENT', 'development');
  vi.stubEnv('REACT_APP_SENTRY_RELEASE', 'parking-permits-admin-ui@1.7.2');
  vi.stubEnv('REACT_APP_SENTRY_TRACES_SAMPLE_RATE', '0.25');
  process.env.REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS =
    'https://api.example.com, https://other.example.com, ';
  vi.stubEnv('REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE', '0.1');
  vi.stubEnv('REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE', '0.5');

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
  vi.stubEnv('REACT_APP_SENTRY_DSN', sentryDsn);
  vi.stubEnv('REACT_APP_SENTRY_TRACES_SAMPLE_RATE', '');
  vi.stubEnv('REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE', '');
  vi.stubEnv('REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE', '');

  const init = await initializeSentry();

  expect(init).toHaveBeenCalledWith(
    expect.objectContaining({
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    })
  );
});
