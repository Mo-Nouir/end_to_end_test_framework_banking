import { test, expect, TestDataFactory } from '../../fixtures/test-fixtures';

/**
 * Lean smoke suite for CI: home page, registration, login, overview, and a read API check.
 * Selected via the `@smoke` tag / smoke project.
 */
test.describe('Smoke', () => {
  test('home page loads with login form', { tag: '@smoke' }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page).toHaveTitle(/ParaBank/i);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test(
    'register, view accounts, and logout',
    { tag: '@smoke' },
    async ({ registrationPage, accountsPage, loginPage }) => {
      const user = TestDataFactory.createUser();
      await registrationPage.goto();
      await registrationPage.register(user);
      await registrationPage.expectSuccessfulRegistration(user.username);
      await accountsPage.gotoOverview();
      await accountsPage.expectAccountTableVisible();
      await loginPage.logout();
    },
  );

  test(
    'API login and account list for demo customer',
    { tag: '@smoke' },
    async ({ apiClient }) => {
      const demo = TestDataFactory.sharedDemoCredentials();
      const { response, customer } = await apiClient.login(demo.username, demo.password);
      expect(response.status()).toBe(200);
      expect(customer.id).toBeGreaterThan(0);

      const accounts = await apiClient.getAccounts(customer.id);
      expect(accounts.response.status()).toBe(200);
      expect(accounts.accounts.length).toBeGreaterThan(0);
    },
  );
});
