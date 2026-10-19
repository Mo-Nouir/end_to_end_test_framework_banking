import { test as base, expect } from '@playwright/test';
import { ParaBankApiClient } from '../api/ParaBankApiClient';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { BillPaymentPage } from '../pages/BillPaymentPage';
import { FindTransactionsPage } from '../pages/FindTransactionsPage';
import { TestDataFactory } from '../test-data/test-data.factory';
import type { Credentials, UserRegistrationData } from '../types/user.types';
import { NewAccountType } from '../types/api.types';
import { env } from '../utils/env';
import { withRateLimitGuard } from '../utils/rate-limit';

type Pages = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  accountsPage: AccountsPage;
  transferFundsPage: TransferFundsPage;
  billPaymentPage: BillPaymentPage;
  findTransactionsPage: FindTransactionsPage;
  apiClient: ParaBankApiClient;
};

type AuthenticatedUser = {
  user: UserRegistrationData;
  credentials: Credentials;
  accountIds: string[];
};

type AuthFixtures = {
  /** Registers a unique user via UI and leaves the browser authenticated. */
  registeredUser: UserRegistrationData;
  /**
   * Read-oriented login as the public demo user (john/demo).
   * Prefer `authenticatedUser` for UI mutation flows.
   */
  demoAuthenticated: Credentials;
  /**
   * Dedicated env credentials when set, otherwise a unique registered user.
   * Ensures at least two accounts via REST setup for transfer scenarios.
   */
  authenticatedUser: AuthenticatedUser;
};

async function registerUniqueUser(registrationPage: RegistrationPage): Promise<UserRegistrationData> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const user = TestDataFactory.createUser();
    try {
      await registrationPage.goto();
      await registrationPage.register(user);
      await registrationPage.expectSuccessfulRegistration(user.username);
      return user;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Registration failed after retry against the public demo');
}

async function ensureTwoAccounts(
  apiClient: ParaBankApiClient,
  credentials: Credentials,
): Promise<string[]> {
  const { response: loginResponse, customer } = await apiClient.login(
    credentials.username,
    credentials.password,
  );
  expect(loginResponse.ok(), 'API login required for account setup').toBeTruthy();

  let { accounts } = await apiClient.getAccounts(customer.id);
  expect(accounts.length, 'Customer should have at least one account').toBeGreaterThan(0);

  if (accounts.length < 2) {
    const funding = [...accounts].sort((a, b) => b.balance - a.balance)[0];
    if (funding.balance < 100) {
      const deposit = await apiClient.deposit(funding.id, 500);
      expect(deposit.response.ok(), 'Deposit should fund account creation').toBeTruthy();
    }
    const created = await apiClient.createAccount(
      customer.id,
      NewAccountType.Savings,
      funding.id,
    );
    expect(created.response.ok(), 'createAccount should open a second account').toBeTruthy();
    ({ accounts } = await apiClient.getAccounts(customer.id));
  }

  expect(accounts.length, 'Need at least two accounts for transfer-ready users').toBeGreaterThan(1);
  return accounts.map((account) => String(account.id));
}

export const test = base.extend<Pages & AuthFixtures>({
  page: async ({ page }, use) => {
    await use(withRateLimitGuard(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registrationPage: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  accountsPage: async ({ page }, use) => {
    await use(new AccountsPage(page));
  },
  transferFundsPage: async ({ page }, use) => {
    await use(new TransferFundsPage(page));
  },
  billPaymentPage: async ({ page }, use) => {
    await use(new BillPaymentPage(page));
  },
  findTransactionsPage: async ({ page }, use) => {
    await use(new FindTransactionsPage(page));
  },
  apiClient: async ({ request }, use) => {
    await use(new ParaBankApiClient(request));
  },
  registeredUser: async ({ registrationPage }, use) => {
    const user = await registerUniqueUser(registrationPage);
    await use(user);
  },
  demoAuthenticated: async ({ loginPage }, use) => {
    const credentials = TestDataFactory.sharedDemoCredentials();
    await loginPage.goto();
    await loginPage.loginExpectingSuccess(credentials);
    await use(credentials);
  },
  authenticatedUser: async ({ loginPage, registrationPage, apiClient }, use) => {
    let user: UserRegistrationData;
    let credentials: Credentials;

    if (env.testUsername && env.testPassword) {
      credentials = { username: env.testUsername, password: env.testPassword };
      user = {
        ...TestDataFactory.createUser(),
        username: credentials.username,
        password: credentials.password,
      };
      await loginPage.goto();
      await loginPage.loginExpectingSuccess(credentials);
    } else {
      user = await registerUniqueUser(registrationPage);
      credentials = { username: user.username, password: user.password };
    }

    const accountIds = await ensureTwoAccounts(apiClient, credentials);
    await use({ user, credentials, accountIds });
  },
});

export { expect, TestDataFactory, NewAccountType };
