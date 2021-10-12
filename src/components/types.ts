import React from 'react';

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
export interface Column<T> {
  name: string;
  field: string;
  selector: (row: T) => React.ReactNode;
  orderFields?: string[];
}
