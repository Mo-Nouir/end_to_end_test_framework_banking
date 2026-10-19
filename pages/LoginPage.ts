import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Credentials } from '../types/user.types';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.registerLink = page.getByRole('link', { name: 'Register' });
  }

  async goto(): Promise<void> {
    await this.page.goto('index.htm');
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  async loginExpectingSuccess(credentials: Credentials): Promise<void> {
    await this.login(credentials);
    await expect(
      this.page.getByRole('heading', { name: 'Accounts Overview' }),
      'Successful login should land on Accounts Overview',
    ).toBeVisible();
    await this.expectLoggedIn();
  }

  async expectInvalidCredentialsError(): Promise<void> {
    // Public demo sometimes returns a generic internal error instead of the
    // verification message; both are failure outcomes for bad credentials.
    await expect(
      this.errorMessage(),
      'Invalid credentials should show an error message',
    ).toHaveText(
      /The username and password could not be verified\.|An internal error has occurred and has been logged\./i,
    );
  }

  async expectEmptyCredentialsError(): Promise<void> {
    await expect(
      this.errorMessage(),
      'Empty credentials should show the required-fields error',
    ).toHaveText('Please enter a username and password.');
  }
}
