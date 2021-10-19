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

export enum MatchType {
  EXACT = 'iexact',
  STARTSWITH = 'istartswith',
}

export interface FilterItem {
  labelKey: string;
  value: string;
  searchFields: string[];
  matchType: MatchType;
}

export interface SearchItem {
  matchType: MatchType;
  fields: string[];
  value: unknown;
}
