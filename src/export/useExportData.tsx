import { useTranslation } from 'react-i18next';
import useApiToken from '../api/useApiToken';

const useExportData = (): ((url: string) => void) => {
  const { i18n } = useTranslation();
  const token = useApiToken();
  return (url: string) => {
    fetch(url, {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
        'Accept-Language': i18n.language,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const file = window.URL.createObjectURL(blob);
        window.location.assign(file);
      });
  };
};

export default useExportData;
