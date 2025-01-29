import { useTranslation } from 'react-i18next';
import waitForApiToken from '../api/waitForApiToken';

const useExportData = (): ((url: string | URL) => void) => {
  const { i18n } = useTranslation();
  return (url: string | URL) => {
    waitForApiToken()
      .then(apiToken =>
        fetch(url, {
          headers: {
            authorization: apiToken ? `Bearer ${apiToken}` : '',
            'Accept-Language': i18n.language,
          },
        })
      )
      .then(response => response.blob())
      .then(blob => {
        const file = window.URL.createObjectURL(blob);
        window.open(file);
      });
  };
};

export default useExportData;
