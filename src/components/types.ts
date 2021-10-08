import React from 'react';

export enum OrderDirection {
  ASC,
  DESC,
}
export interface Column<T> {
  name: string;
  field: string;
  selector: (row: T) => React.ReactNode;
  sortable: boolean;
}
