import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { BillPayeeData } from '../types/user.types';

export class BillPaymentPage extends BasePage {
  readonly payeeName: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly zipCode: Locator;
  readonly phoneNumber: Locator;
  readonly accountNumber: Locator;
  readonly verifyAccount: Locator;
  readonly amount: Locator;
  readonly fromAccountSelect: Locator;
  readonly sendPaymentButton: Locator;
  readonly resultPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.payeeName = page.locator('input[name="payee.name"]');
    this.street = page.locator('input[name="payee.address.street"]');
    this.city = page.locator('input[name="payee.address.city"]');
    this.state = page.locator('input[name="payee.address.state"]');
    this.zipCode = page.locator('input[name="payee.address.zipCode"]');
    this.phoneNumber = page.locator('input[name="payee.phoneNumber"]');
    this.accountNumber = page.locator('input[name="payee.accountNumber"]');
    this.verifyAccount = page.locator('input[name="verifyAccount"]');
    this.amount = page.locator('input[name="amount"]');
    this.fromAccountSelect = page.locator('select[name="fromAccountId"]');
    this.sendPaymentButton = page.getByRole('button', { name: 'Send Payment' });
    this.resultPanel = page.locator('#billpayResult');
  }

  async goto(): Promise<void> {
    await this.page.goto('/billpay.htm');
    await expect(
      this.page.getByRole('heading', { name: 'Bill Payment Service' }),
      'Bill Payment Service heading should be visible',
    ).toBeVisible();
  }

  async fillPayee(payee: BillPayeeData, fromAccountId?: string): Promise<void> {
    await this.payeeName.fill(payee.name);
    await this.street.fill(payee.street);
    await this.city.fill(payee.city);
    await this.state.fill(payee.state);
    await this.zipCode.fill(payee.zipCode);
    await this.phoneNumber.fill(payee.phoneNumber);
    await this.accountNumber.fill(payee.accountNumber);
    await this.verifyAccount.fill(payee.accountNumber);
    await this.amount.fill(payee.amount);
    if (fromAccountId) {
      await this.fromAccountSelect.selectOption(fromAccountId);
    }
  }

  async submitPayment(payee: BillPayeeData, fromAccountId?: string): Promise<void> {
    await this.fillPayee(payee, fromAccountId);
    await this.sendPaymentButton.click();
  }

  async expectPaymentComplete(payeeName: string, amount: string): Promise<void> {
    await expect(this.resultPanel, 'Bill pay result panel should become visible').toBeVisible({
      timeout: 30_000,
    });
    await expect(this.resultPanel).toContainText(payeeName);
    await expect(this.resultPanel).toContainText(amount.replace(/\.00$/, ''));
  }

  async expectValidationVisible(): Promise<void> {
    const validation = this.page.locator('[id^="validationModel-"]').filter({ hasText: /.+/ });
    await expect(validation.first(), 'Client-side validation should surface').toBeVisible();
  }
}
