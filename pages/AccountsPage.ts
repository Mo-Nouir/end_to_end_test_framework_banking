import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountsPage extends BasePage {
  readonly accountTable: Locator;
  readonly accountTypeSelect: Locator;
  readonly fromAccountSelect: Locator;
  readonly openAccountButton: Locator;
  readonly newAccountId: Locator;

  constructor(page: Page) {
    super(page);
    this.accountTable = page.locator('#accountTable');
    this.accountTypeSelect = page.locator('#type');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.openAccountButton = page.getByRole('button', { name: 'Open New Account' });
    this.newAccountId = page.locator('#newAccountId');
  }

  async gotoOverview(): Promise<void> {
    await this.page.goto('/overview.htm');
    await expect(
      this.page.getByRole('heading', { name: 'Accounts Overview' }),
      'Accounts Overview heading should be visible',
    ).toBeVisible();
  }

  async gotoOpenAccount(): Promise<void> {
    await this.page.goto('/openaccount.htm');
    await expect(
      this.page.getByRole('heading', { name: 'Open New Account' }),
      'Open New Account heading should be visible',
    ).toBeVisible();
  }

  accountLinks(): Locator {
    return this.accountTable.locator('a');
  }

  async expectAccountTableVisible(): Promise<void> {
    await expect(this.accountTable, 'Account overview table should be visible').toBeVisible();
    await expect(
      this.accountLinks().first(),
      'At least one account link should be listed',
    ).toBeVisible({ timeout: 30_000 });
  }

  async openFirstAccountDetails(): Promise<string> {
    await this.expectAccountTableVisible();
    const firstLink = this.accountLinks().first();
    const accountId = (await firstLink.innerText()).trim();
    await firstLink.click();
    await expect(
      this.page.getByRole('heading', { name: 'Account Details' }),
      'Account Details page should open',
    ).toBeVisible();
    return accountId;
  }

  async openNewAccount(typeLabel: 'CHECKING' | 'SAVINGS' = 'SAVINGS'): Promise<string> {
    await this.gotoOpenAccount();
    await expect(this.fromAccountSelect.locator('option').first()).toBeAttached({ timeout: 30_000 });
    await this.accountTypeSelect.selectOption({ label: typeLabel });
    // Wait until AJAX populates funding account options
    await expect
      .poll(async () => this.fromAccountSelect.locator('option').count(), {
        message: 'Funding account options should load',
      })
      .toBeGreaterThan(0);
    await this.openAccountButton.click();
    await expect(
      this.page.getByRole('heading', { name: 'Account Opened!' }),
      'Account Opened confirmation should appear',
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.newAccountId).toBeVisible();
    const newId = (await this.newAccountId.innerText()).trim();
    expect(newId, 'New account id should be numeric').toMatch(/^\d+$/);
    return newId;
  }

  async expectAccountListed(accountId: string): Promise<void> {
    await this.gotoOverview();
    await expect(
      this.accountTable.getByRole('link', { name: accountId }),
      `Account ${accountId} should appear in overview`,
    ).toBeVisible({ timeout: 30_000 });
  }
}
