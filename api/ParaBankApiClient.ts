import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import type {
  Account,
  BillPayResult,
  Customer,
  NewAccountType,
  Payee,
  Transaction,
} from '../types/api.types';

const JSON_HEADERS = { Accept: 'application/json' } as const;

export class ParaBankApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string = env.apiBaseUrl,
  ) {}

  private url(path: string): string {
    return `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private async json<T>(response: APIResponse): Promise<T> {
    const body = await response.text();
    if (!body) {
      return undefined as T;
    }
    return JSON.parse(body) as T;
  }

  /**
   * Parses the body of a successful response. On failure the value is undefined at runtime:
   * callers must assert `response.ok()` / status before reading fields.
   */
  private async bodyIfOk<T>(response: APIResponse): Promise<T> {
    return response.ok() ? this.json<T>(response) : (undefined as T);
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ response: APIResponse; customer: Customer }> {
    logger.debug(`API login for username="${username}"`);
    const response = await this.request.get(this.url(`/login/${username}/${password}`), {
      headers: JSON_HEADERS,
    });
    const customer = await this.bodyIfOk<Customer>(response);
    return { response, customer };
  }

  async getCustomer(customerId: number): Promise<{ response: APIResponse; customer: Customer }> {
    const response = await this.request.get(this.url(`/customers/${customerId}`), {
      headers: JSON_HEADERS,
    });
    return {
      response,
      customer: await this.bodyIfOk<Customer>(response),
    };
  }

  async getAccounts(customerId: number): Promise<{ response: APIResponse; accounts: Account[] }> {
    const response = await this.request.get(this.url(`/customers/${customerId}/accounts`), {
      headers: JSON_HEADERS,
    });
    return {
      response,
      accounts: response.ok() ? await this.json<Account[]>(response) : [],
    };
  }

  async getAccount(accountId: number): Promise<{ response: APIResponse; account: Account }> {
    const response = await this.request.get(this.url(`/accounts/${accountId}`), {
      headers: JSON_HEADERS,
    });
    return {
      response,
      account: await this.bodyIfOk<Account>(response),
    };
  }

  async createAccount(
    customerId: number,
    newAccountType: NewAccountType,
    fromAccountId: number,
  ): Promise<{ response: APIResponse; account: Account }> {
    const response = await this.request.post(this.url('/createAccount'), {
      headers: JSON_HEADERS,
      params: {
        customerId: String(customerId),
        newAccountType: String(newAccountType),
        fromAccountId: String(fromAccountId),
      },
    });
    return {
      response,
      account: await this.bodyIfOk<Account>(response),
    };
  }

  async transfer(
    fromAccountId: number,
    toAccountId: number,
    amount: number | string,
  ): Promise<{ response: APIResponse; message: string }> {
    const response = await this.request.post(this.url('/transfer'), {
      headers: JSON_HEADERS,
      params: {
        fromAccountId: String(fromAccountId),
        toAccountId: String(toAccountId),
        amount: String(amount),
      },
    });
    return { response, message: await response.text() };
  }

  async deposit(
    accountId: number,
    amount: number | string,
  ): Promise<{ response: APIResponse; message: string }> {
    const response = await this.request.post(this.url('/deposit'), {
      headers: JSON_HEADERS,
      params: {
        accountId: String(accountId),
        amount: String(amount),
      },
    });
    return { response, message: await response.text() };
  }

  async getTransactions(
    accountId: number,
  ): Promise<{ response: APIResponse; transactions: Transaction[] }> {
    const response = await this.request.get(this.url(`/accounts/${accountId}/transactions`), {
      headers: JSON_HEADERS,
    });
    return {
      response,
      transactions: response.ok() ? await this.json<Transaction[]>(response) : [],
    };
  }

  async getTransactionsByAmount(
    accountId: number,
    amount: number | string,
  ): Promise<{ response: APIResponse; transactions: Transaction[] }> {
    const response = await this.request.get(
      this.url(`/accounts/${accountId}/transactions/amount/${amount}`),
      { headers: JSON_HEADERS },
    );
    return {
      response,
      transactions: response.ok() ? await this.json<Transaction[]>(response) : [],
    };
  }

  async billPay(
    accountId: number,
    amount: number | string,
    payee: Payee,
  ): Promise<{ response: APIResponse; result: BillPayResult }> {
    const response = await this.request.post(this.url('/billpay'), {
      headers: { ...JSON_HEADERS, 'Content-Type': 'application/json' },
      params: {
        accountId: String(accountId),
        amount: String(amount),
      },
      data: payee,
    });
    return {
      response,
      result: await this.bodyIfOk<BillPayResult>(response),
    };
  }
}
