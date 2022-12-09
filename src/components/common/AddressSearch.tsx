import { gql, useLazyQuery } from '@apollo/client';
import { Notification, SearchInput } from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, AddressSearchQueryData } from '../../types';
import { formatAddress } from '../../utils';

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

let SEARCH_TIMER: number | null = null;

const AddressSearch = ({
  className,
  label,
  onSelect,
}: AddressSearchProps): React.ReactElement => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState('');

  const variables: { searchInput: string } = { searchInput: '' };

  const [, { data, refetch }] = useLazyQuery<AddressSearchQueryData>(
    ADDRESS_SEARCH_QUERY,
    {
      variables,
      fetchPolicy: 'no-cache',
      onError: error => setErrorMessage(error.message),
    }
  );

  let searchSuggestions: AddressSuggestionItem[] = [];
  const getSuggestions = (inputValue: string) =>
    new Promise<AddressSuggestionItem[]>(resolve => {
      if (SEARCH_TIMER) {
        clearTimeout(SEARCH_TIMER);
      }
      SEARCH_TIMER = window.setTimeout(() => {
        refetch({ searchInput: inputValue }).then(() => {
          searchSuggestions = (data?.addressSearch || []).map(
            (_address: Address) => ({
              label: formatAddress(_address, 'fi'),
              address: _address,
            })
          );
          return searchSuggestions.sort((a, b) =>
            a.label.localeCompare(b.label)
          );
        });
        resolve(searchSuggestions);
      }, SEARCH_DEBOUNCE);
    });

  const handleSubmit = (value: string) => {
    const item = searchSuggestions.find(
      suggestion => suggestion.label === value
    );
    if (item) {
      onSelect(item.address);
    }
  };

  return (
    <>
      <SearchInput
        hideSearchButton
        className={className}
        label={label}
        placeholder={t(`${T_PATH}.placeholder`)}
        clearButtonAriaLabel={t(`${T_PATH}.clear`)}
        suggestionLabelField="label"
        getSuggestions={getSuggestions}
        onSubmit={handleSubmit}
      />

      {errorMessage && (
        <Notification
          type="error"
          label={t('message.error')}
          position="bottom-center"
          dismissible
          closeButtonLabelText={t('message.close')}
          onClose={() => setErrorMessage('')}
          style={{ zIndex: 100 }}>
          {errorMessage}
        </Notification>
      )}
    </>
  );
};

export default AddressSearch;
