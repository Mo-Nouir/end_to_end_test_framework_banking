import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FindTransactionsPage extends BasePage {
  readonly accountSelect: Locator;
  readonly transactionIdInput: Locator;
  readonly findByIdButton: Locator;
  readonly transactionDateInput: Locator;
  readonly findByDateButton: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly findByDateRangeButton: Locator;
  readonly amountInput: Locator;
  readonly findByAmountButton: Locator;
  readonly resultsTable: Locator;
  readonly resultsBody: Locator;
  readonly errorContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.accountSelect = page.locator('#accountId');
    this.transactionIdInput = page.locator('#transactionId');
    this.findByIdButton = page.locator('#findById');
    this.transactionDateInput = page.locator('#transactionDate');
    this.findByDateButton = page.locator('#findByDate');
    this.fromDateInput = page.locator('#fromDate');
    this.toDateInput = page.locator('#toDate');
    this.findByDateRangeButton = page.locator('#findByDateRange');
    this.amountInput = page.locator('#amount');
    this.findByAmountButton = page.locator('#findByAmount');
    this.resultsTable = page.locator('#transactionTable');
    this.resultsBody = page.locator('#transactionBody');
    this.errorContainer = page.locator('#errorContainer');
  }

  async goto(): Promise<void> {
    await this.page.goto('/findtrans.htm');
    await expect(
      this.page.getByRole('heading', { name: 'Find Transactions' }),
      'Find Transactions heading should be visible',
    ).toBeVisible();
  }

  async waitForAccountsLoaded(): Promise<void> {
    await expect
      .poll(async () => this.accountSelect.locator('option').count(), {
        message: 'Account options should load',
        timeout: 30_000,
      })
      .toBeGreaterThan(0);
  }

  async findByAmount(amount: string, accountId?: string): Promise<void> {
    await this.waitForAccountsLoaded();
    if (accountId) {
      await this.accountSelect.selectOption(accountId);
    }
    await this.amountInput.fill(amount);
    await this.findByAmountButton.click();
  }

  async findByTransactionId(transactionId: string, accountId?: string): Promise<void> {
    await this.waitForAccountsLoaded();
    if (accountId) {
      await this.accountSelect.selectOption(accountId);
    }
    await this.transactionIdInput.fill(transactionId);
    await this.findByIdButton.click();
  }

  async expectResultsVisible(): Promise<void> {
    await expect(this.resultsTable, 'Transaction results table should be visible').toBeVisible({
      timeout: 30_000,
    });
  }

  async expectAtLeastOneResult(): Promise<void> {
    await this.expectResultsVisible();
    await expect
      .poll(async () => this.resultsBody.locator('tr').count(), {
        message: 'At least one transaction row should be returned',
      })
      .toBeGreaterThan(0);
  }

  async expectAmountError(): Promise<void> {
    await expect(this.page.locator('#amountError')).toBeVisible();
  }
}
