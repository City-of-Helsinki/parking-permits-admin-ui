import { getEnv } from '../utils';

export function formatExportUrl(
  dataType: string,
  searchParams: Record<string, string>
): string {
  const baseUrl = getEnv('REACT_APP_PARKING_PERMITS_EXPORT_URL');
  const queryParams = new URLSearchParams(searchParams);
  return `${baseUrl}/${dataType}?${queryParams}`;
}

export function formatGdprApiUrl(path: string[]): URL {
  const baseUrl = getEnv('REACT_APP_PARKING_PERMITS_GDPR_API_URL');
  const joinedPath = Array.isArray(path) ? path.join('/') : path;
  return new URL(joinedPath, baseUrl);
}

export function formatExportUrlPdf(dataType: string, objectId: string): string {
  const baseUrl = getEnv('REACT_APP_PARKING_PERMITS_EXPORT_URL_PDF');
  const queryParams = new URLSearchParams({
    data_type: dataType,
    object_id: objectId,
  });
  return `${baseUrl}?${queryParams}`;
}
