import { test, expect, TestDataFactory } from '../../../fixtures/test-fixtures';

test.describe('Registration', () => {
  test('registers a new user with unique data and authenticates', async ({ registrationPage }) => {
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);
  });

  test('validates required fields on empty submission', async ({ registrationPage }) => {
    await registrationPage.goto();
    await registrationPage.submit();
    await registrationPage.expectFieldErrors();
  });

  test('rejects registration when password confirmation is missing', async ({
    registrationPage,
  }) => {
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.firstName.fill(user.firstName);
    await registrationPage.lastName.fill(user.lastName);
    await registrationPage.street.fill(user.street);
    await registrationPage.city.fill(user.city);
    await registrationPage.state.fill(user.state);
    await registrationPage.zipCode.fill(user.zipCode);
    await registrationPage.ssn.fill(user.ssn);
    await registrationPage.username.fill(user.username);
    await registrationPage.password.fill(user.password);
    // Intentionally leave confirm password empty
    await registrationPage.submit();
    await expect(
      registrationPage.page.locator('text=/password|required|match/i').first(),
    ).toBeVisible();
  });

  test('shows error when username already exists', async ({ registrationPage }) => {
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);
    await registrationPage.logout();

    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectUsernameAlreadyExists();
  });
});
