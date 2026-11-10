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

const env = vi.hoisted(() => {
  const values: Record<string, string> = {};
  return { values };
});
vi.mock('./utils', () => ({
  getEnvValue: (key: string) => env.values[key],
}));

function setEnv(values: Record<string, string> = {}) {
  env.values = values;
}

const sentryDsn = 'https://public@example.com/1';

beforeEach(() => {
  vi.resetModules();
  setEnv();
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
      setEnv({ REACT_APP_SENTRY_DSN: dsn });
    }

    const init = await initializeSentry();

    expect(init).not.toHaveBeenCalled();
  }
);

it.each(['review', 'development', 'testing', 'staging', 'production'])(
  'initializes in %s with tracing and replay disabled by default',
  async environment => {
    setEnv({
      REACT_APP_SENTRY_DSN: sentryDsn,
      REACT_APP_SENTRY_ENVIRONMENT: environment,
    });

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
  setEnv({
    REACT_APP_SENTRY_DSN: sentryDsn,
    REACT_APP_SENTRY_ENVIRONMENT: 'development',
    REACT_APP_SENTRY_RELEASE: 'parking-permits-admin-ui@1.7.2',
    REACT_APP_SENTRY_TRACES_SAMPLE_RATE: '0.25',
    REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS:
      'https://api.example.com, https://other.example.com, ',
    REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: '0.1',
    REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: '0.5',
  });

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
  setEnv({
    REACT_APP_SENTRY_DSN: sentryDsn,
    REACT_APP_SENTRY_TRACES_SAMPLE_RATE: '',
    REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: '',
    REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: '',
  });

  const init = await initializeSentry();

  expect(init).toHaveBeenCalledWith(
    expect.objectContaining({
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    })
  );
});
