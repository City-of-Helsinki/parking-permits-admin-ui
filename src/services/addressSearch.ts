import { AddressInput } from '../types';
import { getEnv } from '../utils';

interface AddressWfsGeometry {
  type: string;
  coordinates: [number, number];
}

interface AddressWfsProperties {
  id: number;
  katunimi: string;
  // eslint-disable-next-line camelcase
  osoitenumero_teksti: string;
  gatan: string;
  kaupunki: string;
  staden: string;
  postinumero: string;
}

interface AddressWfsFeature {
  geometry: AddressWfsGeometry;
  properties: AddressWfsProperties;
}

const SEARCH_DEBOUNCE = 500;

class AddressSearch {
  /**
   * Address data source
   */
  private readonly dataSource = 'KMO';

  /**
   * URL to the address wfs
   */
  private readonly wfsUrl = getEnv('REACT_APP_ADDRESS_WFS_URL');

  /**
   * WFS query paramters
   */
  private readonly wfsParams = {
    service: 'WFS',
    request: 'GetFeature',
    version: '2.0.0',
    srsName: 'EPSG:4326',
    typenames: getEnv('REACT_APP_ADDRESS_WFS_TYPENAMES'),
    outputFormat: 'application/json',
    count: '8',
  };

  /**
   * Field mapping from address interface to wfs feature properties
   */
  private readonly fieldMapping: { [key: string]: keyof AddressWfsProperties } =
    {
      streetName: 'katunimi',
      streetNumber: 'osoitenumero_teksti',
      streetNameSv: 'gatan',
      city: 'kaupunki',
      citySv: 'staden',
      postalCode: 'postinumero',
    };

  /**
   * search debounce timer
   */
  private searchTimer: number | null = null;

  /**
   * Convert street name and street number to a cql filter
   *
   * Use wildcard search for street name
   */
  private createFilter = (streetName: string, streetNumber?: string): string =>
    streetNumber
      ? `katunimi ILIKE '${streetName}%' AND osoitenumero='${streetNumber}'`
      : `katunimi ILIKE '${streetName}%'`;

  private buildSearchUrl(searchText: string): string {
    let filter;
    const lastSpaceIndex = searchText.lastIndexOf(' ');
    if (lastSpaceIndex === -1) {
      filter = this.createFilter(searchText);
    } else {
      const streetName = searchText.substring(0, lastSpaceIndex);
      const streetNumber = searchText.substring(
        lastSpaceIndex + 1,
        searchText.length
      );
      // last part considered a street number if it's an integer
      filter = !Number.isNaN(streetNumber)
        ? this.createFilter(streetName, streetNumber)
        : this.createFilter(searchText);
    }
    const params = new URLSearchParams({
      ...this.wfsParams,
      cql_filter: filter,
    });
    return `${this.wfsUrl}?${params}`;
  }

  private async doSearch(searchText: string): Promise<AddressInput[]> {
    const searchUrl = this.buildSearchUrl(searchText);
    const response = await fetch(searchUrl).catch(() => null);
    if (!response) {
      return [];
    }
    const data = (await response.json()) as { features: AddressWfsFeature[] };
    return data.features.map(feature => {
      const { coordinates } = feature.geometry;
      const entries = Object.entries(this.fieldMapping).map(
        ([field, wfsField]) => {
          const value = feature.properties[wfsField];
          return [field, value ? value.toString() : ''];
        }
      );
      return {
        location: coordinates,
        ...Object.fromEntries(entries),
      };
    });
  }

  async search(searchText: string): Promise<AddressInput[]> {
    return new Promise(resolve => {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      this.searchTimer = window.setTimeout(
        () => resolve(this.doSearch(searchText)),
        SEARCH_DEBOUNCE
      );
    });
  }
}

export default new AddressSearch();
