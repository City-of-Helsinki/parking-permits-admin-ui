import L from 'leaflet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import marker from '../../assets/images/icon_poi_talo-sininen.svg';
import { getEnv } from '../../utils';
import styles from './LocationPicker.module.scss';

const icon = new L.Icon({
  iconUrl: marker,
  // eslint-disable-next-line no-magic-numbers
  iconAnchor: [5, 55],
  // eslint-disable-next-line no-magic-numbers
  iconSize: [25, 55],
});

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
  location: [number, number];
  onChange: (location: [number, number]) => void;
  errorText?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  className,
  location,
  onChange,
  errorText,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const template = getEnv('REACT_APP_MAP_URL_TEMPLATE');
  const language = ['fi', 'sv'].includes(lang) ? lang : 'fi';
  const mapUrl = template.replace('{language}', language);
  return (
    <div className={className}>
      <MapContainer
        className={styles.mapContainer}
        center={flipLocation(location)}
        zoom={12}>
        <MapComponent
          onMapClick={e => onChange([e.latlng.lng, e.latlng.lat])}
        />
        <TileLayer
          attribution={t('components.common.locationPicker.mapAttribution')}
          url={mapUrl}
        />
        <Marker position={flipLocation(location)} icon={icon} />
      </MapContainer>
      <div className={styles.errorText}>{errorText}</div>
    </div>
  );
};

export default LocationPicker;
