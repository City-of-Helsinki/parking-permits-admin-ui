import { Option, Select } from 'hds-react';
import React, { useCallback, useId, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../../types';

export interface SingleSelectOption<T extends string> {
  label: string;
  value: T;
}

export interface SingleSelectProps<T extends string> {
  id?: string;
  className?: string;
  label: string;
  placeholder?: string;
  options: SingleSelectOption<T>[];
  value?: T | null;
  onChange: (value: T | undefined) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
}

/**
 * HDS Select rebuilds its internal state whenever options, value, texts or
 * onChange change identity, so they are kept referentially stable here.
 */
const SingleSelect = <T extends string>({
  id,
  className,
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  disabled,
  required,
  clearable,
}: SingleSelectProps<T>): React.ReactElement => {
  const { i18n } = useTranslation();
  const generatedId = useId().replace(/[^a-zA-Z0-9-_]/g, '');
  const optionsKey = JSON.stringify(options);
  const stableOptions = useMemo(
    () => JSON.parse(optionsKey) as SingleSelectOption<T>[],
    [optionsKey]
  );
  const texts = useMemo(
    () => ({
      label,
      placeholder,
      error,
      language: i18n.language as Language,
    }),
    [label, placeholder, error, i18n.language]
  );
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const handleChange = useCallback((selected: Option[]) => {
    onChangeRef.current(selected[0]?.value as T | undefined);
  }, []);

  return (
    <Select
      id={id || `select-${generatedId}`}
      className={className}
      options={stableOptions}
      value={value || undefined}
      texts={texts}
      invalid={!!error}
      disabled={disabled}
      required={required}
      clearable={clearable}
      onChange={handleChange}
    />
  );
};

export default SingleSelect;
