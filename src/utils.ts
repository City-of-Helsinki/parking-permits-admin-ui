import { Customer } from './types';

export function getEnv(key: string): string {
  const variable = process.env[key];
  if (variable === undefined) {
    throw new Error(`No ${key} specified.`);
  }
  return variable;
}

export function getBooleanEnv(key: string): boolean {
  const val = getEnv(key);
  return ['true', '1'].includes(val);
}

export function getPrimaryAddress(customer: Customer, lang: string): string {
  const { primaryAddress } = customer;
  const { streetName, streetNameSv, streetNumber } = primaryAddress;
  return `${lang === 'sv' ? streetNameSv : streetName} ${streetNumber}`;
}

export function formatDateTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleString();
}
