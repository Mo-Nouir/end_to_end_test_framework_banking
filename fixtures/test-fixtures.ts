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

type Pages = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  accountsPage: AccountsPage;
  transferFundsPage: TransferFundsPage;
  billPaymentPage: BillPaymentPage;
  findTransactionsPage: FindTransactionsPage;
  apiClient: ParaBankApiClient;
};

type AuthFixtures = {
  /** Registers a unique user via UI and leaves the browser authenticated. */
  registeredUser: UserRegistrationData;
  /** Authenticated page objects for a freshly registered user with >= 2 accounts when possible. */
  authenticatedUser: {
    user: UserRegistrationData;
    credentials: Credentials;
  };
};

export const test = base.extend<Pages & AuthFixtures>({
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
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);
    await use(user);
  },
  authenticatedUser: async ({ registrationPage, accountsPage }, use) => {
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);
    // Newly registered users typically start with one account; open a second for transfer scenarios.
    try {
      await accountsPage.openNewAccount('SAVINGS');
    } catch {
      // Some demo resets may leave insufficient funds; tests that need 2 accounts will assert explicitly.
    }
    await use({
      user,
      credentials: { username: user.username, password: user.password },
    });
  },
});

export { expect, TestDataFactory, NewAccountType };
