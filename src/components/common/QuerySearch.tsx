import { Search, SearchProps } from 'hds-react';
import React from 'react';

type QuerySearchProps = Omit<SearchProps, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

// Controlled HDS Search echoes its stale internal query back through onChange
// (a plain object without nativeEvent) on mount and while typing, which wipes
// the parent's value. Only real input events are forwarded.
const QuerySearch = ({
  value,
  onChange,
  ...props
}: QuerySearchProps): React.ReactElement => (
  <Search
    {...props}
    value={value}
    onChange={e => {
      if (e.nativeEvent) {
        onChange(e.target.value);
      }
    }}
  />
);

export default QuerySearch;
