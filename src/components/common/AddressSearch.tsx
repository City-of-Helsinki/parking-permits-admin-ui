import { SearchInput, TextInput } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import addressSearch from '../../services/addressSearch';
import { Address, AddressInput } from '../../types';
import { formatAddress } from '../../utils';

const T_PATH = 'components.common.addressSearch';

interface AddressSearchProps {
  className?: string;
  disabled?: boolean;
  label?: string;
  address?: Address;
  onSelect: (address: AddressInput) => void;
}

interface AddressSuggestionItem {
  label: string;
  address: AddressInput;
}

const AddressSearch = ({
  className,
  disabled = false,
  label,
  address,
  onSelect,
}: AddressSearchProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  let searchSuggestions: AddressSuggestionItem[] = [];
  const getSuggestions = (inputValue: string) =>
    addressSearch.search(inputValue).then(addresses => {
      searchSuggestions = addresses.map(_address => ({
        label: formatAddress(_address, 'fi'),
        address: _address,
      }));
      return searchSuggestions;
    });

  const handleSubmit = (value: string) => {
    const item = searchSuggestions.find(
      suggestion => suggestion.label === value
    );
    if (item) {
      onSelect(item.address);
    }
  };

  if (!disabled) {
    return (
      <SearchInput
        hideSearchButton
        className={className}
        label={label}
        placeholder={address ? formatAddress(address, i18n.language) : ''}
        clearButtonAriaLabel={t(`${T_PATH}.clear`)}
        suggestionLabelField="label"
        getSuggestions={getSuggestions}
        onSubmit={handleSubmit}
      />
    );
  }
  // HDS SearchInput does not have a disabled property,
  // so use a TextInput for disabled
  return (
    <TextInput
      disabled
      className={className}
      id="address"
      label={label}
      value={address ? formatAddress(address, i18n.language) : ''}
    />
  );
};

export default AddressSearch;
