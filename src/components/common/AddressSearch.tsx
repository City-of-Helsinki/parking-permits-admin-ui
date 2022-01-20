import {
  Button,
  IconArrowLeft,
  IconPen,
  SearchInput,
  TextInput,
} from 'hds-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import addressSearch from '../../services/addressSearch';
import { Address, AddressInput } from '../../types';
import { formatAddress } from '../../utils';

const T_PATH = 'components.common.addressSearch';

interface AddressSearchProps {
  className?: string;
  disabled?: boolean;
  label: string;
  address?: Address;
  errorText?: string;
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
  errorText,
  onSelect,
}: AddressSearchProps): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
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
      setIsEditing(false);
    }
  };

  if (isEditing && !disabled) {
    return (
      <>
        <SearchInput
          hideSearchButton
          className={className}
          label={label}
          clearButtonAriaLabel={t(`${T_PATH}.clear`)}
          suggestionLabelField="label"
          getSuggestions={getSuggestions}
          onSubmit={handleSubmit}
        />
        <Button
          variant="supplementary"
          size="small"
          iconLeft={<IconArrowLeft />}
          onClick={() => setIsEditing(false)}>
          {t(`${T_PATH}.cancel`)}
        </Button>
      </>
    );
  }
  return (
    <>
      <TextInput
        readOnly
        className={className}
        id="address"
        label={label}
        value={address ? formatAddress(address, i18n.language) : '-'}
        errorText={errorText}
      />
      {!disabled && (
        <Button
          variant="supplementary"
          size="small"
          iconLeft={<IconPen />}
          onClick={() => setIsEditing(true)}>
          {t(`${T_PATH}.edit`)}
        </Button>
      )}
    </>
  );
};

export default AddressSearch;
