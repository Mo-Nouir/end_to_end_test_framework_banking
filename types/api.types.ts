export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  ssn: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | number;

export interface Account {
  id: number;
  customerId: number;
  type: AccountType;
  balance: number;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: string;
  date: number | string;
  amount: number;
  description?: string;
}

export interface Payee {
  name: string;
  address: Address;
  phoneNumber: string;
  accountNumber: number | string;
}

export interface BillPayResult {
  payeeName: string;
  amount: number;
  accountId: number;
}

/** Account type codes used by POST /createAccount (verified via OpenAPI / UI). */
export enum NewAccountType {
  Checking = 0,
  Savings = 1,
}
