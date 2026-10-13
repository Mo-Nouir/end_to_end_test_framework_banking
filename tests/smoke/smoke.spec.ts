import { test, expect, TestDataFactory } from '../../fixtures/test-fixtures';

/**
 * Lean smoke suite for CI: home page, registration, login, overview, and a read API check.
 * Avoids heavy mutation of the shared demo database.
 */
test.describe('Smoke @smoke', () => {
  test('home page loads with login form', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page).toHaveTitle(/ParaBank/i);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('register, view accounts, and logout', async ({
    registrationPage,
    accountsPage,
    loginPage,
  }) => {
    const user = TestDataFactory.createUser();
    await registrationPage.goto();
    await registrationPage.register(user);
    await registrationPage.expectSuccessfulRegistration(user.username);
    await accountsPage.gotoOverview();
    await accountsPage.expectAccountTableVisible();
    await loginPage.logout();
  });

  test('API login and account list for demo customer', async ({ apiClient }) => {
    const demo = TestDataFactory.sharedDemoCredentials();
    const { response, customer } = await apiClient.login(demo.username, demo.password);
    expect(response.status()).toBe(200);
    expect(customer.id).toBeGreaterThan(0);

    const accounts = await apiClient.getAccounts(customer.id);
    expect(accounts.response.status()).toBe(200);
    expect(accounts.accounts.length).toBeGreaterThan(0);
  });
});
