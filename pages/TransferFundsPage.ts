import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransferFundsPage extends BasePage {
  readonly amountInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly toAccountSelect: Locator;
  readonly transferButton: Locator;
  readonly amountResult: Locator;
  readonly fromAccountResult: Locator;
  readonly toAccountResult: Locator;

  constructor(page: Page) {
    super(page);
    this.amountInput = page.locator('#amount');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.toAccountSelect = page.locator('#toAccountId');
    this.transferButton = page.getByRole('button', { name: 'Transfer' });
    this.amountResult = page.locator('#amountResult');
    this.fromAccountResult = page.locator('#fromAccountIdResult');
    this.toAccountResult = page.locator('#toAccountIdResult');
  }

  async goto(): Promise<void> {
    await this.page.goto('transfer.htm');
    await expect(
      this.page.getByRole('heading', { name: 'Transfer Funds' }),
      'Transfer Funds heading should be visible',
    ).toBeVisible();
  }

  async waitForAccountsLoaded(): Promise<void> {
    await expect
      .poll(async () => this.fromAccountSelect.locator('option').count(), {
        message: 'Source accounts should load via AJAX',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
    await expect
      .poll(async () => this.toAccountSelect.locator('option').count(), {
        message: 'Destination accounts should load via AJAX',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  }

  async transfer(amount: string, fromAccountId?: string, toAccountId?: string): Promise<void> {
    await this.waitForAccountsLoaded();
    await this.amountInput.fill(amount);
    if (fromAccountId) {
      await this.fromAccountSelect.selectOption(fromAccountId);
    }
    if (toAccountId) {
      await this.toAccountSelect.selectOption(toAccountId);
    }
    await this.transferButton.click();
  }

  async expectTransferComplete(amount: string, fromAccountId: string, toAccountId: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Transfer Complete!' }),
      'Transfer confirmation heading should be visible',
    ).toBeVisible({ timeout: 30_000 });
    await expect(this.amountResult).toContainText(amount.replace(/\.00$/, ''));
    await expect(this.fromAccountResult).toHaveText(fromAccountId);
    await expect(this.toAccountResult).toHaveText(toAccountId);
  }

  async getAccountOptionValues(): Promise<string[]> {
    await this.waitForAccountsLoaded();
    return this.fromAccountSelect.locator('option').evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value).filter(Boolean),
    );
  }
}
