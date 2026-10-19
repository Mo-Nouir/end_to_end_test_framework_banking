import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { UserRegistrationData } from '../types/user.types';

export class RegistrationPage extends BasePage {
  readonly form: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly zipCode: Locator;
  readonly phoneNumber: Locator;
  readonly ssn: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('#customerForm');
    this.firstName = page.locator('#customer\\.firstName');
    this.lastName = page.locator('#customer\\.lastName');
    this.street = page.locator('#customer\\.address\\.street');
    this.city = page.locator('#customer\\.address\\.city');
    this.state = page.locator('#customer\\.address\\.state');
    this.zipCode = page.locator('#customer\\.address\\.zipCode');
    this.phoneNumber = page.locator('#customer\\.phoneNumber');
    this.ssn = page.locator('#customer\\.ssn');
    this.username = page.locator('#customer\\.username');
    this.password = page.locator('#customer\\.password');
    this.confirmPassword = page.locator('#repeatedPassword');
    this.registerButton = page.getByRole('button', { name: 'Register' });
  }

  async goto(): Promise<void> {
    await this.page.goto('register.htm', { waitUntil: 'domcontentloaded' });
    await expect(this.form, 'Registration form should be visible').toBeVisible({ timeout: 30_000 });
  }

  async fill(user: UserRegistrationData): Promise<void> {
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.street.fill(user.street);
    await this.city.fill(user.city);
    await this.state.fill(user.state);
    await this.zipCode.fill(user.zipCode);
    await this.phoneNumber.fill(user.phoneNumber);
    await this.ssn.fill(user.ssn);
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.confirmPassword.fill(user.password);
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async register(user: UserRegistrationData): Promise<void> {
    await this.fill(user);
    await this.submit();
  }

  async expectSuccessfulRegistration(username: string): Promise<void> {
    // Prefer authenticated chrome over the form title — the demo can briefly keep
    // "Signing up is easy!" visible while the POST is still processing.
    await expect(
      this.leftNav.logOut(),
      'Successful registration should authenticate the user',
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      this.titleHeading(),
      'Registration success heading should include the new username',
    ).toContainText(`Welcome ${username}`, { timeout: 15_000 });
  }

  async expectFieldErrors(): Promise<void> {
    const errors = this.page.locator('.error, span.error, #customerForm .error');
    await expect(errors.first(), 'At least one validation error should be shown').toBeVisible();
  }

  async expectUsernameAlreadyExists(): Promise<void> {
    await expect(this.page.locator('text=/already exists|This username already exists/i')).toBeVisible();
  }
}
