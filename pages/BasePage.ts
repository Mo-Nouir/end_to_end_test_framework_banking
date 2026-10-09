import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  readonly leftNav = {
    openNewAccount: () => this.page.getByRole('link', { name: 'Open New Account' }),
    accountsOverview: () => this.page.getByRole('link', { name: 'Accounts Overview' }),
    transferFunds: () => this.page.getByRole('link', { name: 'Transfer Funds' }),
    billPay: () => this.page.getByRole('link', { name: 'Bill Pay' }),
    findTransactions: () => this.page.getByRole('link', { name: 'Find Transactions' }),
    updateContactInfo: () => this.page.getByRole('link', { name: 'Update Contact Info' }),
    requestLoan: () => this.page.getByRole('link', { name: 'Request Loan' }),
    logOut: () => this.page.getByRole('link', { name: 'Log Out' }),
  };

  async expectLoggedIn(): Promise<void> {
    await expect(this.leftNav.logOut(), 'Log Out link should be visible when authenticated').toBeVisible();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(
      this.page.locator('input[name="username"]'),
      'Username field should be visible when logged out',
    ).toBeVisible();
    await expect(this.leftNav.logOut()).toHaveCount(0);
  }

  async logout(): Promise<void> {
    await this.leftNav.logOut().click();
    await this.expectLoggedOut();
  }

  protected errorMessage(): Locator {
    return this.page.locator('p.error');
  }

  protected titleHeading(): Locator {
    return this.page.locator('h1.title');
  }
}
