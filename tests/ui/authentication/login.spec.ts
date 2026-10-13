import { test, expect, TestDataFactory } from '../../../fixtures/test-fixtures';

test.describe('Authentication', () => {
  test('successful login with valid credentials @smoke', async ({ loginPage, registrationPage }) => {
    // Prefer a uniquely registered user over the shared john/demo account.
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);
    await loginPage.logout();

    await loginPage.goto();
    await loginPage.loginExpectingSuccess({
      username: user.username,
      password: user.password,
    });
  });

  test('shows error for invalid username or password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login({
      username: 'definitely-not-a-real-user',
      password: 'wrong-password',
    });
    await loginPage.expectInvalidCredentialsError();
  });

  test('shows error when username and password are empty', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginButton.click();
    await loginPage.expectEmptyCredentialsError();
  });

  test('logout returns the user to the logged-out state', async ({
    loginPage,
    registrationPage,
  }) => {
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);

    await loginPage.logout();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
  });
});
