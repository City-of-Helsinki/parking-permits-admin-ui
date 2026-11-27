import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import LocationPicker from './LocationPicker';

const mocks = vi.hoisted(() => ({
  getEnvValue: vi.fn(),
  mapClick: vi.fn(),
  t: vi.fn(),
  language: 'en',
}));

vi.mock('leaflet', () => ({
  default: {
    Icon: class {},
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({
    center,
    zoom,
    children,
  }: {
    center: [number, number];
    zoom: number;
    children: ReactNode;
  }) => (
    <div
      data-testid="map"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}>
      {children}
    </div>
  ),
  Marker: ({ position }: { position: [number, number] }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)} />
  ),
  TileLayer: ({ attribution, url }: { attribution: string; url: string }) => (
    <div
      data-testid="tile-layer"
      data-attribution={attribution}
      data-url={url}
    />
  ),
  useMapEvents: ({
    click,
  }: {
    click: (event: { latlng: { lng: number; lat: number } }) => void;
  }) => {
    mocks.mapClick.mockImplementation(click);
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mocks.t,
    i18n: { language: mocks.language },
  }),
}));

vi.mock('../../utils', async importOriginal => ({
  ...(await importOriginal<typeof import('../../utils')>()),
  getEnvValue: mocks.getEnvValue,
}));

const initialLocation: [number, number] = [1, 0];
const clickedLocation = { lng: 0, lat: 1 };
const expectedMapLocation = '[0,1]';

const renderPicker = (
  language = 'en',
  location: [number, number] = initialLocation,
  errorText?: string
) => {
  mocks.language = language;
  const onChange = vi.fn();
  render(
    <LocationPicker
      className="location-picker"
      location={location}
      onChange={onChange}
      errorText={errorText}
    />
  );
  return onChange;
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getEnvValue.mockReturnValue(
    'https://tiles.example/{language}/{z}/{x}/{y}.png'
  );
  mocks.t.mockImplementation((key: string) => key);
});

describe('LocationPicker', () => {
  it('flips longitude and latitude for the map and marker', () => {
    renderPicker();

    expect(screen.getByTestId('map')).toHaveAttribute(
      'data-center',
      expectedMapLocation
    );
    expect(screen.getByTestId('map')).toHaveAttribute('data-zoom', '12');
    expect(screen.getByTestId('marker')).toHaveAttribute(
      'data-position',
      expectedMapLocation
    );
  });

  it.each([
    { language: 'fi', mapLanguage: 'fi' },
    { language: 'sv', mapLanguage: 'sv' },
    { language: 'en', mapLanguage: 'fi' },
  ])(
    'uses $mapLanguage map tiles for UI language $language',
    ({ language, mapLanguage }) => {
      renderPicker(language);

      expect(screen.getByTestId('tile-layer')).toHaveAttribute(
        'data-url',
        `https://tiles.example/${mapLanguage}/{z}/{x}/{y}.png`
      );
      expect(screen.getByTestId('tile-layer')).toHaveAttribute(
        'data-attribution',
        'components.common.locationPicker.mapAttribution'
      );
    }
  );

  it('reports the clicked location as longitude and latitude', () => {
    const onChange = renderPicker();

    act(() => mocks.mapClick({ latlng: clickedLocation }));

    expect(onChange).toHaveBeenCalledWith([
      clickedLocation.lng,
      clickedLocation.lat,
    ]);
  });

  it('forwards the class name and displays validation errors', () => {
    renderPicker('fi', initialLocation, 'Location is required');

    expect(screen.getByTestId('map').parentElement).toHaveClass(
      'location-picker'
    );
    expect(screen.getByText('Location is required')).toBeVisible();
  });
});
