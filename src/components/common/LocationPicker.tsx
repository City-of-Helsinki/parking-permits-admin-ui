import { TextInput } from 'hds-react';
import L from 'leaflet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import marker from '../../assets/images/icon_poi_talo-sininen.svg';
import styles from './LocationPicker.module.scss';

const icon = new L.Icon({
  iconUrl: marker,
  // eslint-disable-next-line no-magic-numbers
  iconAnchor: [5, 55],
  // eslint-disable-next-line no-magic-numbers
  iconSize: [25, 55],
});

const FI_ATTRIBUTION =
  '&copy; Helsingin, Espoon, Vantaan ja Kauniaisen kaupungit';
const SV_ATTRIBUTION = '&copy; Helsingfors, Esbo, Vanda och Grankulla städer';
const FI_MAP_URL =
  'https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}.png';
const SV_MAP_URL =
  'https://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}sv.png';

function flipLocation(location: [number, number]): [number, number] {
  const [lng, lat] = location;
  return [lat, lng];
}

const MapComponent: React.FC<{
  onMapClick: (e: L.LeafletMouseEvent) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: e => onMapClick(e),
  });
  return null;
};

export interface LocationPickerProps {
  className?: string;
  label: string;
  location: [number, number];
  onChange: (location: [number, number]) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  className,
  label,
  location,
  onChange,
}) => {
  const { i18n } = useTranslation();
  return (
    <div className={className}>
      <TextInput
        id="location"
        readOnly
        label={label}
        value={location.join(', ')}
      />
      <MapContainer
        className={styles.mapContainer}
        center={flipLocation(location)}
        zoom={12}>
        <MapComponent
          onMapClick={e => onChange([e.latlng.lng, e.latlng.lat])}
        />
        {i18n.language === 'sv' && (
          <TileLayer attribution={SV_ATTRIBUTION} url={SV_MAP_URL} />
        )}
        {i18n.language !== 'sv' && (
          <TileLayer attribution={FI_ATTRIBUTION} url={FI_MAP_URL} />
        )}
        <Marker position={flipLocation(location)} icon={icon} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
