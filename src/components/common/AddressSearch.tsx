import { ApolloError, gql, useLazyQuery } from '@apollo/client';
import { Notification, Search } from 'hds-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, AddressSearchQueryData, Language } from '../../types';
import { formatAddress, getApolloErrorMessage } from '../../utils';

const T_PATH = 'components.common.addressSearch';
const SEARCH_DEBOUNCE = 500;

interface AddressSearchProps {
  className?: string;
  label?: string;
  onSelect: (address: Address) => void;
}

interface AddressSuggestionItem {
  label: string;
  address: Address;
}

const ADDRESS_SEARCH_QUERY = gql`
  query AddressSearch($searchInput: String!) {
    addressSearch(searchInput: $searchInput) {
      streetName
      streetNameSv
      streetNumber
      city
      citySv
      postalCode
      location
      zone {
        name
        label
        labelSv
      }
    }
  }
`;

const AddressSearch = ({
  className,
  label,
  onSelect,
}: AddressSearchProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');
  const [value, setValue] = useState('');
  const searchTimer = useRef<number | null>(null);
  const searchGeneration = useRef(0);
  const suggestions = useRef<AddressSuggestionItem[]>([]);

  const [fetchAddresses] = useLazyQuery<AddressSearchQueryData>(
    ADDRESS_SEARCH_QUERY,
    { fetchPolicy: 'no-cache' }
  );

  const texts = useMemo(
    () => ({
      language: i18n.language as Language,
      label,
      searchPlaceholder: t(`${T_PATH}.placeholder`),
      searchClearButtonAriaLabel: t(`${T_PATH}.clear`),
    }),
    [label, i18n.language, t]
  );

  const handleSearch = useCallback(
    (searchInput: string) =>
      new Promise<{ options: { label: string; value: string }[] }>(resolve => {
        if (searchTimer.current) {
          window.clearTimeout(searchTimer.current);
        }
        searchGeneration.current += 1;
        const generation = searchGeneration.current;
        searchTimer.current = window.setTimeout(async () => {
          let result;
          try {
            result = await fetchAddresses({ variables: { searchInput } });
          } catch (error) {
            result = { error: error as ApolloError, data: undefined };
          }
          if (result?.error) {
            setErrorMessage(getApolloErrorMessage(result.error));
          }
          const items = (result?.data?.addressSearch || [])
            .map((address: Address) => ({
              label: formatAddress(address, 'fi', { withPostalCode: true }),
              address,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          if (generation === searchGeneration.current) {
            suggestions.current = items;
          }
          resolve({
            options: items.map(({ label: optionLabel }) => ({
              label: optionLabel,
              value: optionLabel,
            })),
          });
        }, SEARCH_DEBOUNCE);
      }),
    [fetchAddresses]
  );

  const selectByLabel = (selectedLabel: string) => {
    const item = suggestions.current.find(
      suggestion => suggestion.label === selectedLabel
    );
    if (item) {
      onSelect(item.address);
    }
  };

  // Picking an option from the list only updates the input value
  // (onSend is fired just for the typed text), so both handlers select.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    selectByLabel(event.target.value);
  };

  return (
    <>
      <Search
        hideSubmitButton
        id="addressSearch"
        className={className}
        texts={texts}
        value={value}
        onChange={handleChange}
        onSend={selectByLabel}
        onSearch={handleSearch}
      />

      {errorMessage && (
        <Notification
          type="error"
          label={t('message.error')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setErrorMessage('')}
          style={{ zIndex: 100, opacity: 1 }}>
          {errorMessage}
        </Notification>
      )}
    </>
  );
};

export default AddressSearch;
